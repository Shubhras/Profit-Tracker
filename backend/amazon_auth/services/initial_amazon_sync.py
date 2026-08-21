from amazon_auth.services.amazon_store_details import (
    sync_amazon_store_name,
)
from amazon_auth.services.historical_order_items_sync import (
    sync_historical_order_items,
)
from amazon_auth.services.historical_orders_sync import (
    sync_historical_orders,
)
from amazon_auth.services.historical_transactions_sync import (
    sync_historical_transactions,
)
from amazon_auth.services.snapshot_catalog_sync import sync_catalog_snapshot
from amazon_auth.services.snapshot_fee_estimate_sync import (
    sync_fee_estimate_snapshot,
)
from amazon_auth.services.snapshot_listing_sync import (
    sync_listing_snapshot,
)


def run_initial_amazon_sync(account, days):

    print("\n" + "=" * 80)
    print(f"STARTING INITIAL AMAZON SYNC: {account.seller_central_id}")
    print("=" * 80)

    total_failed = 0

    # -------------------------------------------------
    # STORE DETAILS
    # -------------------------------------------------

    try:
        sync_amazon_store_name(account)

    except Exception as e:
        print(f"STORE NAME SYNC FAILED: {account.seller_central_id} => {e}")

    # -------------------------------------------------
    # HISTORICAL ORDERS
    # -------------------------------------------------

    try:
        order_result = sync_historical_orders(
            days=days,
            accounts=[account],
        )

        total_failed += order_result.get(
            "total_failed",
            0,
        )

    except Exception as e:
        print(f"HISTORICAL ORDER SYNC FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # ORDER ITEMS
    # -------------------------------------------------

    try:
        result = sync_historical_order_items(
            account=account,
            days=days,
        )

        total_failed += result.get(
            "failed",
            0,
        )

    except Exception as e:
        print(f"HISTORICAL ORDER ITEM SYNC FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # HISTORICAL TRANSACTIONS
    # -------------------------------------------------

    try:
        print("\n" + "=" * 80)
        print("STARTING HISTORICAL TRANSACTION SYNC")
        print("=" * 80)

        result = sync_historical_transactions(
            account=account,
            days=days,
        )

        if result["failed"] > 0:
            print(
                f"HISTORICAL TRANSACTION SYNC COMPLETED "
                f"WITH {result['failed']} FAILURES"
            )

            total_failed += result["failed"]

        else:
            print("HISTORICAL TRANSACTION SYNC COMPLETED SUCCESSFULLY")

    except Exception as e:
        print(f"HISTORICAL TRANSACTION SYNC FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # CURRENT LISTING SNAPSHOT
    # -------------------------------------------------

    try:
        print("\n" + "=" * 80)
        print("STARTING LISTING SNAPSHOT")
        print("=" * 80)

        listing_result = sync_listing_snapshot(
            account=account,
        )

        if not listing_result["success"]:
            total_failed += 1

    except Exception as e:
        print(f"LISTING SNAPSHOT FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # CATALOG SNAPSHOT
    # -------------------------------------------------

    try:
        print("\n" + "=" * 80)
        print("STARTING CATALOG SNAPSHOT")
        print("=" * 80)

        catalog_result = sync_catalog_snapshot(
            account=account,
        )

        if not catalog_result["success"]:
            print(
                f"CATALOG SNAPSHOT COMPLETED WITH "
                f"{catalog_result.get('failed', 0)} FAILED ASIN(S)"
            )

    except Exception as e:
        print(f"CATALOG SNAPSHOT FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # FEE ESTIMATE SNAPSHOT
    # -------------------------------------------------

    try:
        print("\n" + "=" * 80)
        print("STARTING FEE ESTIMATE SNAPSHOT")
        print("=" * 80)

        fee_result = sync_fee_estimate_snapshot(
            account=account,
        )

        if not fee_result["success"]:
            print(
                f"FEE ESTIMATE SNAPSHOT FAILED: "
                f"{fee_result.get('error', 'Unknown error')}"
            )

    except Exception as e:
        print(f"FEE ESTIMATE SNAPSHOT FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # FINAL STATUS
    # -------------------------------------------------

    if total_failed == 0:
        account.initial_sync_required = False
        account.initial_sync_completed = True

    else:
        account.initial_sync_required = True
        account.initial_sync_completed = False

    account.save(
        update_fields=[
            "initial_sync_required",
            "initial_sync_completed",
        ]
    )

    # -------------------------------------------------
    # FINAL RESULT
    # -------------------------------------------------

    print("\n" + "=" * 80)

    if total_failed == 0:
        print(
            f"INITIAL AMAZON SYNC COMPLETED SUCCESSFULLY: {account.seller_central_id}"
        )
    else:
        print(
            f"INITIAL AMAZON SYNC COMPLETED WITH "
            f"{total_failed} FAILURES: "
            f"{account.seller_central_id}"
        )

    print("=" * 80)

    return {
        "total_failed": total_failed,
        "success": total_failed == 0,
    }
