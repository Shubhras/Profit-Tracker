import random
import time
from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from amazon_auth.models import AmazonAccount, Order
from amazon_auth.spapi_manager import SPAPIManager


def sync_historical_orders(days, accounts=None):

    if days <= 0:
        raise ValueError("days must be greater than 0")

    total_saved = 0
    total_updated = 0
    total_skipped = 0
    total_failed = 0
    total_accounts = 0

    # ---------------------------------------------------------
    # DATE RANGE
    # ---------------------------------------------------------

    end_date = timezone.now() - timedelta(minutes=2)

    start_date = end_date - timedelta(days=days)

    created_after = start_date.strftime("%Y-%m-%dT%H:%M:%SZ")

    created_before = end_date.strftime("%Y-%m-%dT%H:%M:%SZ")

    if accounts is None:
        accounts = AmazonAccount.objects.all()

    print("\n" + "=" * 100)
    print("STARTING HISTORICAL ORDER SYNC")
    print("=" * 100)

    print(f"REQUESTED DAYS : {days}")
    print(f"CREATED AFTER  : {created_after}")
    print(f"CREATED BEFORE : {created_before}")
    print(f"TOTAL ACCOUNTS : {len(accounts)}")

    # =========================================================
    # ACCOUNT LOOP
    # =========================================================

    for account in accounts:
        total_accounts += 1

        print("\n" + "=" * 100)
        print(f"ACCOUNT: {account.seller_central_id}")
        print("=" * 100)

        manager = SPAPIManager(
            user=account.user,
            account=account,
        )

        # -----------------------------------------------------
        # LOAD EXISTING ORDERS ONCE
        # -----------------------------------------------------

        existing_orders = {
            order.amazon_order_id: order
            for order in Order.objects.filter(
                amazon_account=account,
                user=account.user,
            )
        }

        print(f"EXISTING ORDERS IN DB: {len(existing_orders)}")

        account_saved = 0
        account_updated = 0
        account_skipped = 0
        account_failed = 0

        next_token = None
        page_number = 0

        # =====================================================
        # PAGINATION
        # =====================================================

        while True:
            page_number += 1

            print("\n" + "-" * 80)
            print(f"ACCOUNT: {account.seller_central_id}")
            print(f"PAGE: {page_number}")

            # -------------------------------------------------
            # BUILD REQUEST
            # -------------------------------------------------

            if next_token:
                kwargs = {
                    "NextToken": next_token,
                    "MaxResultsPerPage": 100,
                }

            else:
                kwargs = {
                    "MarketplaceIds": account.marketplace_id,
                    "CreatedAfter": created_after,
                    "CreatedBefore": created_before,
                    "MaxResultsPerPage": 100,
                }

            # -------------------------------------------------
            # API REQUEST / RETRY
            # -------------------------------------------------

            max_retries = 5
            retry_count = 0

            while True:
                try:
                    request_started_at = time.monotonic()

                    data = manager.fetch_orders(**kwargs)

                    request_duration = time.monotonic() - request_started_at

                    print(f"REQUEST TIME: {request_duration:.2f}s")

                except Exception as e:
                    retry_count += 1

                    if retry_count > max_retries:
                        print(f"ORDER API FAILED AFTER {max_retries} RETRIES")

                        print(f"ERROR: {e}")

                        account_failed += 1
                        total_failed += 1

                        data = None

                        break

                    wait_seconds = min(60, 2**retry_count) + random.uniform(0, 1)

                    print(f"REQUEST ERROR: {e}")

                    print(f"RETRYING IN {wait_seconds:.2f}s")

                    time.sleep(wait_seconds)

                    continue

                # -------------------------------------------------
                # API ERROR RESPONSE
                # -------------------------------------------------

                if isinstance(data, dict) and "errors" in data:
                    errors = data.get("errors", [])

                    error_text = str(errors)

                    print("ORDER API ERROR:")

                    print(error_text)

                    # ---------------------------------------------
                    # RATE LIMIT
                    # ---------------------------------------------

                    if (
                        "429" in error_text
                        or "Too Many Requests" in error_text
                        or "Request frequency" in error_text
                    ):
                        retry_count += 1

                        if retry_count > max_retries:
                            print("RATE LIMIT RETRIES EXHAUSTED")

                            account_failed += 1
                            total_failed += 1

                            data = None

                            break

                        wait_seconds = min(
                            60, 5 * (2 ** (retry_count - 1))
                        ) + random.uniform(0, 2)

                        print(f"RATE LIMITED. WAITING {wait_seconds:.2f}s")

                        time.sleep(wait_seconds)

                        continue

                    # ---------------------------------------------
                    # OTHER AMAZON ERROR
                    # ---------------------------------------------

                    account_failed += 1
                    total_failed += 1

                    data = None

                    break

                # -------------------------------------------------
                # SUCCESS
                # -------------------------------------------------

                break

            # -------------------------------------------------
            # STOP ACCOUNT IF REQUEST FAILED
            # -------------------------------------------------

            if data is None:
                break

            # -------------------------------------------------
            # RESPONSE PAYLOAD
            # -------------------------------------------------

            payload = data.get("payload", {})

            orders_list = payload.get("Orders", [])

            print(f"ORDERS RECEIVED: {len(orders_list)}")

            # =================================================
            # PROCESS ORDERS
            # =================================================

            for order_data in orders_list:
                try:
                    amazon_order_id = order_data.get("AmazonOrderId")

                    if not amazon_order_id:
                        print("ORDER WITHOUT AMAZON ORDER ID - SKIPPING")

                        account_skipped += 1
                        total_skipped += 1

                        continue

                    total_info = order_data.get("OrderTotal", {})

                    last_update = (
                        parse_datetime(order_data.get("LastUpdateDate"))
                        if order_data.get("LastUpdateDate")
                        else None
                    )

                    purchase_date = (
                        parse_datetime(order_data.get("PurchaseDate"))
                        if order_data.get("PurchaseDate")
                        else None
                    )

                    # -------------------------------------------------
                    # FIND EXISTING ORDER FROM MEMORY
                    # -------------------------------------------------

                    order = existing_orders.get(amazon_order_id)

                    # =================================================
                    # NEW ORDER
                    # =================================================

                    if not order:
                        with transaction.atomic():
                            order = Order.objects.create(
                                amazon_account=account,
                                amazon_order_id=amazon_order_id,
                                user=account.user,
                                purchase_date=purchase_date,
                                last_update_date=last_update,
                                order_status=order_data.get("OrderStatus"),
                                total_amount=total_info.get("Amount", 0),
                                currency_code=total_info.get("CurrencyCode"),
                                buyer_name=order_data.get("BuyerInfo", {}).get(
                                    "BuyerName", "Unknown"
                                ),
                                city=order_data.get("ShippingAddress", {}).get(
                                    "City", ""
                                ),
                                state=order_data.get("ShippingAddress", {}).get(
                                    "StateOrRegion", ""
                                ),
                                country=order_data.get("ShippingAddress", {}).get(
                                    "CountryCode", ""
                                ),
                                fulfillment_channel=order_data.get(
                                    "FulfillmentChannel", ""
                                ),
                                items_shipped=order_data.get("NumberOfItemsShipped", 0),
                                items_unshipped=order_data.get(
                                    "NumberOfItemsUnshipped", 0
                                ),
                                marketplace_id=order_data.get("MarketplaceId"),
                            )

                        existing_orders[amazon_order_id] = order

                        account_saved += 1
                        total_saved += 1

                        print(f"CREATED ORDER: {amazon_order_id}")

                    # =================================================
                    # EXISTING ORDER - UPDATE IF AMAZON IS NEWER
                    # =================================================

                    elif not order.last_update_date or (
                        last_update and order.last_update_date < last_update
                    ):
                        order.order_status = order_data.get("OrderStatus")

                        order.total_amount = total_info.get("Amount", 0)

                        order.last_update_date = last_update

                        order.save(
                            update_fields=[
                                "order_status",
                                "total_amount",
                                "last_update_date",
                            ]
                        )

                        account_updated += 1
                        total_updated += 1

                        print(f"UPDATED ORDER: {amazon_order_id}")

                    # =================================================
                    # EXISTING ORDER - NO CHANGE
                    # =================================================

                    else:
                        account_skipped += 1
                        total_skipped += 1

                except Exception as e:
                    account_failed += 1
                    total_failed += 1

                    print(f"FAILED ORDER {order_data.get('AmazonOrderId')}: {e}")

                    continue

            # =================================================
            # PAGINATION
            # =================================================

            next_token = payload.get("NextToken")

            if not next_token:
                print("NO NEXT TOKEN")

                break

            print("NEXT PAGE FOUND")

            # Small delay between successful pages.
            # We do NOT force a 60-second delay.
            time.sleep(2)

        # =====================================================
        # ACCOUNT SUMMARY
        # =====================================================

        print("\n" + "-" * 80)

        print(f"ACCOUNT COMPLETED: {account.seller_central_id}")

        print(f"CREATED : {account_saved}")

        print(f"UPDATED : {account_updated}")

        print(f"SKIPPED : {account_skipped}")

        print(f"FAILED  : {account_failed}")

    # =========================================================
    # FINAL SUMMARY
    # =========================================================

    print("\n" + "=" * 100)
    print("HISTORICAL ORDER SYNC COMPLETED")
    print("=" * 100)

    print(f"TOTAL ACCOUNTS : {total_accounts}")

    print(f"TOTAL CREATED  : {total_saved}")

    print(f"TOTAL UPDATED  : {total_updated}")

    print(f"TOTAL SKIPPED  : {total_skipped}")

    print(f"TOTAL FAILED   : {total_failed}")

    print("=" * 100)

    return {
        "total_accounts": total_accounts,
        "total_saved": total_saved,
        "total_updated": total_updated,
        "total_skipped": total_skipped,
        "total_failed": total_failed,
    }
