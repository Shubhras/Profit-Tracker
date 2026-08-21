import time
from datetime import timedelta

import requests
from django.db import transaction as db_transaction
from django.utils import timezone

from amazon_auth.models import (
    AmazonTransaction,
    AmazonTransactionBreakdown,
    AmazonTransactionContext,
    AmazonTransactionRelatedIdentifier,
)
from amazon_auth.spapi_manager import SPAPIManager

# =========================================================
# CONFIGURATION
# =========================================================

# Amazon Transactions API can be rate limited.
# Keep a small delay between successful pages.
PAGE_DELAY = 1.0

# Maximum number of retries for temporary API failures.
MAX_RETRIES = 5

# Timeout for a single HTTP request.
REQUEST_TIMEOUT = 60

# Amazon requires postedBefore to be sufficiently before
# the current time. We use 5 minutes instead of the minimum
# 2 minutes to give us a safe margin.
CURRENT_TIME_SAFETY_MINUTES = 5


# =========================================================
# HELPER: NORMALIZE VALUES
# =========================================================


def _amount_value(amount_data):
    """
    Safely extract the numeric amount from Amazon's
    currency object.

    Supports the formats commonly returned by SP-API.
    """

    if not isinstance(amount_data, dict):
        return None

    return (
        amount_data.get("currencyAmount")
        if amount_data.get("currencyAmount") is not None
        else amount_data.get("Amount")
        if amount_data.get("Amount") is not None
        else amount_data.get("amount")
    )


# =========================================================
# HELPER: SAVE RELATED IDENTIFIERS
# =========================================================


def _sync_related_identifiers(
    transaction_obj,
    identifiers,
):
    """
    Synchronize related identifiers without blindly deleting
    and recreating them.

    Identity:

        transaction
        + identifier_name
        + identifier_value

    If duplicate rows already exist for the same identity,
    keep the first one and remove only the duplicates.
    """

    if not isinstance(identifiers, list):
        identifiers = []

    seen = set()

    created = 0
    updated = 0
    duplicates_removed = 0

    for identifier in identifiers:
        if not isinstance(identifier, dict):
            continue

        name = identifier.get("relatedIdentifierName")

        value = identifier.get("relatedIdentifierValue")

        if not name and not value:
            continue

        identity = (
            name or "",
            value or "",
        )

        # Prevent duplicate entries from the SAME Amazon
        # response from being inserted.
        if identity in seen:
            continue

        seen.add(identity)

        queryset = AmazonTransactionRelatedIdentifier.objects.filter(
            transaction=transaction_obj,
            identifier_name=name,
            identifier_value=value,
        ).order_by("id")

        existing = queryset.first()

        if existing:
            updated += 1

            # If bad historical data already contains duplicates,
            # remove ONLY those duplicate rows.
            duplicate_ids = list(
                queryset.values_list(
                    "id",
                    flat=True,
                )[1:]
            )

            if duplicate_ids:
                deleted_count, _ = AmazonTransactionRelatedIdentifier.objects.filter(
                    id__in=duplicate_ids
                ).delete()

                duplicates_removed += deleted_count

        else:
            AmazonTransactionRelatedIdentifier.objects.create(
                transaction=transaction_obj,
                identifier_name=name,
                identifier_value=value,
            )

            created += 1

    return {
        "created": created,
        "updated": updated,
        "duplicates_removed": duplicates_removed,
    }


# =========================================================
# HELPER: SAVE CONTEXT
# =========================================================


def _sync_context(
    transaction_obj,
    context_data,
):
    """
    Synchronize one Amazon transaction context.

    Contexts are identified using:

        transaction
        + context_type
        + raw_context

    raw_context is used because the same context_type can
    legitimately occur more than once.
    """

    if not isinstance(
        context_data,
        dict,
    ):
        return {
            "created": False,
            "updated": False,
            "duplicate_removed": 0,
        }

    context_type = context_data.get("contextType")

    # -----------------------------------------------------
    # Find an existing exact context.
    # -----------------------------------------------------

    queryset = AmazonTransactionContext.objects.filter(
        transaction=transaction_obj,
        context_type=context_type,
        raw_context=context_data,
    ).order_by("id")

    existing = queryset.first()

    if existing:
        # -------------------------------------------------
        # Remove only duplicate copies of this exact
        # context.
        # -------------------------------------------------

        duplicate_ids = list(
            queryset.values_list(
                "id",
                flat=True,
            )[1:]
        )

        duplicate_removed = 0

        if duplicate_ids:
            deleted_count, _ = AmazonTransactionContext.objects.filter(
                id__in=duplicate_ids
            ).delete()

            duplicate_removed = deleted_count

        # -------------------------------------------------
        # Update existing context.
        # -------------------------------------------------

        existing.context_type = context_type

        existing.asin = context_data.get("asin")

        existing.sku = context_data.get("sku")

        existing.quantity_shipped = context_data.get("quantityShipped")

        existing.fulfillment_network = context_data.get("fulfillmentNetwork")

        existing.deferral_reason = context_data.get("deferralReason")

        existing.maturity_date = context_data.get("maturityDate")

        existing.store_name = context_data.get("storeName")

        existing.order_type = context_data.get("orderType")

        existing.channel = context_data.get("channel")

        existing.raw_context = context_data

        existing.save(
            update_fields=[
                "context_type",
                "asin",
                "sku",
                "quantity_shipped",
                "fulfillment_network",
                "deferral_reason",
                "maturity_date",
                "store_name",
                "order_type",
                "channel",
                "raw_context",
            ]
        )

        return {
            "created": False,
            "updated": True,
            "duplicate_removed": duplicate_removed,
        }

    # -----------------------------------------------------
    # Create new context.
    # -----------------------------------------------------

    AmazonTransactionContext.objects.create(
        transaction=transaction_obj,
        context_type=context_type,
        asin=context_data.get("asin"),
        sku=context_data.get("sku"),
        quantity_shipped=context_data.get("quantityShipped"),
        fulfillment_network=context_data.get("fulfillmentNetwork"),
        deferral_reason=context_data.get("deferralReason"),
        maturity_date=context_data.get("maturityDate"),
        store_name=context_data.get("storeName"),
        order_type=context_data.get("orderType"),
        channel=context_data.get("channel"),
        raw_context=context_data,
    )

    return {
        "created": True,
        "updated": False,
        "duplicate_removed": 0,
    }


# =========================================================
# HELPER: SYNC CONTEXT LIST
# =========================================================


def _sync_contexts(
    transaction_obj,
    contexts,
):
    """
    Synchronize a list of contexts.
    """

    if not isinstance(
        contexts,
        list,
    ):
        return {
            "created": 0,
            "updated": 0,
            "duplicates_removed": 0,
        }

    created = 0
    updated = 0
    duplicates_removed = 0

    for context_data in contexts:
        result = _sync_context(
            transaction_obj,
            context_data,
        )

        if result["created"]:
            created += 1

        if result["updated"]:
            updated += 1

        duplicates_removed += result["duplicate_removed"]

    return {
        "created": created,
        "updated": updated,
        "duplicates_removed": duplicates_removed,
    }


# =========================================================
# HELPER: SAVE BREAKDOWN
# =========================================================


def _sync_breakdown(
    transaction_obj,
    breakdown_data,
    parent=None,
):
    """
    Synchronize one breakdown recursively.

    Identity is based on:

        transaction
        + parent
        + breakdown_type
        + amount
        + currency_code

    This allows repeated breakdown types under different
    parents without treating them as duplicates.
    """

    if not isinstance(
        breakdown_data,
        dict,
    ):
        return {
            "created": 0,
            "updated": 0,
            "duplicates_removed": 0,
        }

    breakdown_type = breakdown_data.get("breakdownType")

    amount_data = breakdown_data.get("breakdownAmount") or {}

    amount = _amount_value(amount_data)

    currency_code = amount_data.get("currencyCode") or amount_data.get("CurrencyCode")

    # -----------------------------------------------------
    # Find existing breakdown.
    # -----------------------------------------------------

    queryset = AmazonTransactionBreakdown.objects.filter(
        transaction=transaction_obj,
        parent=parent,
        breakdown_type=breakdown_type,
        amount=amount,
        currency_code=currency_code,
    ).order_by("id")

    existing = queryset.first()

    duplicates_removed = 0

    if existing:
        # -------------------------------------------------
        # Remove only exact duplicate rows.
        # -------------------------------------------------

        duplicate_ids = list(
            queryset.values_list(
                "id",
                flat=True,
            )[1:]
        )

        if duplicate_ids:
            deleted_count, _ = AmazonTransactionBreakdown.objects.filter(
                id__in=duplicate_ids
            ).delete()

            duplicates_removed += deleted_count

        # -------------------------------------------------
        # Update existing row.
        # -------------------------------------------------

        existing.breakdown_type = breakdown_type

        existing.amount = amount

        existing.currency_code = currency_code

        existing.save(
            update_fields=[
                "breakdown_type",
                "amount",
                "currency_code",
            ]
        )

        breakdown_obj = existing

        created = False

    else:
        breakdown_obj = AmazonTransactionBreakdown.objects.create(
            transaction=transaction_obj,
            parent=parent,
            breakdown_type=breakdown_type,
            amount=amount,
            currency_code=currency_code,
        )

        created = True

    # -----------------------------------------------------
    # Recursively synchronize children.
    # -----------------------------------------------------

    children = breakdown_data.get("breakdowns") or []

    if isinstance(
        children,
        dict,
    ):
        children = children.get("breakdowns") or []

    child_created = 0
    child_updated = 0

    if isinstance(
        children,
        list,
    ):
        for child in children:
            result = _sync_breakdown(
                transaction_obj=transaction_obj,
                breakdown_data=child,
                parent=breakdown_obj,
            )

            child_created += result["created"]

            child_updated += result["updated"]

            duplicates_removed += result["duplicates_removed"]

    return {
        "created": (1 if created else 0) + child_created,
        "updated": (0 if created else 1) + child_updated,
        "duplicates_removed": (duplicates_removed),
    }


# =========================================================
# HELPER: SYNC BREAKDOWN LIST
# =========================================================


def _sync_breakdowns(
    transaction_obj,
    breakdowns,
):
    """
    Synchronize the transaction's root breakdowns.
    """

    if isinstance(
        breakdowns,
        dict,
    ):
        breakdowns = breakdowns.get("breakdowns") or []

    if not isinstance(
        breakdowns,
        list,
    ):
        breakdowns = []

    created = 0
    updated = 0
    duplicates_removed = 0

    for breakdown in breakdowns:
        result = _sync_breakdown(
            transaction_obj=transaction_obj,
            breakdown_data=breakdown,
            parent=None,
        )

        created += result["created"]

        updated += result["updated"]

        duplicates_removed += result["duplicates_removed"]

    return {
        "created": created,
        "updated": updated,
        "duplicates_removed": duplicates_removed,
    }


# =========================================================
# SAVE ONE TRANSACTION
# =========================================================


def _sync_transaction(
    account,
    transaction_data,
):
    """
    Synchronize one Amazon transaction.

    The transaction itself is identified by:

        amazon_account + transaction_id

    Existing transactions are updated.

    Child records are synchronized individually instead
    of being deleted and recreated.
    """

    transaction_id = transaction_data.get("transactionId")

    if not transaction_id:
        return {
            "created": False,
            "updated": False,
            "skipped": True,
            "children_created": 0,
            "children_updated": 0,
            "duplicates_removed": 0,
        }

    amount_data = transaction_data.get("totalAmount") or {}

    # =====================================================
    # TRANSACTION
    # =====================================================

    existing = (
        AmazonTransaction.objects.filter(
            amazon_account=account,
            transaction_id=transaction_id,
        )
        .order_by("id")
        .first()
    )

    created = False

    if existing:
        transaction_obj = existing

        transaction_obj.transaction_type = transaction_data.get("transactionType")

        transaction_obj.transaction_status = transaction_data.get("transactionStatus")

        transaction_obj.description = transaction_data.get("description")

        transaction_obj.posted_date = transaction_data.get("postedDate")

        transaction_obj.total_amount = _amount_value(amount_data)

        transaction_obj.currency_code = amount_data.get(
            "currencyCode"
        ) or amount_data.get("CurrencyCode")

        transaction_obj.raw_payload = transaction_data

        transaction_obj.save(
            update_fields=[
                "transaction_type",
                "transaction_status",
                "description",
                "posted_date",
                "total_amount",
                "currency_code",
                "raw_payload",
            ]
        )

    else:
        transaction_obj = AmazonTransaction.objects.create(
            amazon_account=account,
            transaction_id=transaction_id,
            transaction_type=(transaction_data.get("transactionType")),
            transaction_status=(transaction_data.get("transactionStatus")),
            description=(transaction_data.get("description")),
            posted_date=(transaction_data.get("postedDate")),
            total_amount=(_amount_value(amount_data)),
            currency_code=(
                amount_data.get("currencyCode") or amount_data.get("CurrencyCode")
            ),
            raw_payload=(transaction_data),
        )

        created = True

    # =====================================================
    # RELATED IDENTIFIERS
    # =====================================================

    related_identifiers = transaction_data.get("relatedIdentifiers") or []

    identifier_result = _sync_related_identifiers(
        transaction_obj,
        related_identifiers,
    )

    # =====================================================
    # TRANSACTION-LEVEL CONTEXTS
    # =====================================================

    transaction_contexts = transaction_data.get("contexts") or []

    context_result = _sync_contexts(
        transaction_obj,
        transaction_contexts,
    )

    # =====================================================
    # ITEM-LEVEL CONTEXTS
    # =====================================================

    items = transaction_data.get("items") or []

    if isinstance(
        items,
        list,
    ):
        for item in items:
            if not isinstance(
                item,
                dict,
            ):
                continue

            item_contexts = item.get("contexts") or []

            item_context_result = _sync_contexts(
                transaction_obj,
                item_contexts,
            )

            context_result["created"] += item_context_result["created"]

            context_result["updated"] += item_context_result["updated"]

            context_result["duplicates_removed"] += item_context_result[
                "duplicates_removed"
            ]

    # =====================================================
    # BREAKDOWNS
    # =====================================================

    breakdowns_data = transaction_data.get("breakdowns") or []

    breakdown_result = _sync_breakdowns(
        transaction_obj,
        breakdowns_data,
    )

    # =====================================================
    # RESULT
    # =====================================================

    children_created = (
        identifier_result["created"]
        + context_result["created"]
        + breakdown_result["created"]
    )

    children_updated = (
        identifier_result["updated"]
        + context_result["updated"]
        + breakdown_result["updated"]
    )

    duplicates_removed = (
        identifier_result["duplicates_removed"]
        + context_result["duplicates_removed"]
        + breakdown_result["duplicates_removed"]
    )

    return {
        "created": created,
        "updated": not created,
        "skipped": False,
        "children_created": children_created,
        "children_updated": children_updated,
        "duplicates_removed": duplicates_removed,
    }


# =========================================================
# HISTORICAL TRANSACTION SYNC
# =========================================================


def sync_historical_transactions(
    account,
    days=90,
):
    """
    Historical Amazon Transactions sync.

    This is intentionally separate from the existing
    7-day transaction sync.

    Example:

        sync_historical_transactions(
            account=account,
            days=90,
        )

    This function does NOT modify the existing daily
    transaction sync.
    """

    if days <= 0:
        raise ValueError("days must be greater than 0")

    # =====================================================
    # DATE RANGE
    # =====================================================

    end_date = timezone.now() - timedelta(minutes=CURRENT_TIME_SAFETY_MINUTES)

    start_date = end_date - timedelta(days=days)

    posted_after = start_date.isoformat()

    posted_before = end_date.isoformat()

    # =====================================================
    # HEADER
    # =====================================================

    print("\n" + "=" * 100)

    print("STARTING HISTORICAL TRANSACTION SYNC")

    print("=" * 100)

    print(f"ACCOUNT       : {account.seller_central_id}")

    print(f"REQUESTED DAYS: {days}")

    print(f"POSTED AFTER  : {posted_after}")

    print(f"POSTED BEFORE : {posted_before}")

    print("=" * 100)

    # =====================================================
    # SP-API MANAGER
    # =====================================================

    sp_api = SPAPIManager(account=account)

    access_token = sp_api.get_access_token()

    # =====================================================
    # ENDPOINT
    # =====================================================

    endpoint = f"https://sellingpartnerapi-{account.region.lower()}.amazon.com"

    url = f"{endpoint}/finances/2024-06-19/transactions"

    headers = {
        "x-amz-access-token": access_token,
        "accept": "application/json",
    }

    # =====================================================
    # BASE PARAMETERS
    # =====================================================

    params = {
        "postedAfter": posted_after,
        "postedBefore": posted_before,
        "marketplaceId": account.marketplace_id,
    }

    # =====================================================
    # COUNTERS
    # =====================================================

    page_number = 0

    total_received = 0
    total_created = 0
    total_updated = 0
    total_skipped = 0
    total_failed = 0

    total_children_created = 0
    total_children_updated = 0
    total_duplicates_removed = 0

    # =====================================================
    # PAGINATION
    # =====================================================

    next_token = None

    while True:
        page_number += 1

        print("\n" + "-" * 90)

        print(f"TRANSACTION PAGE: {page_number}")

        # -------------------------------------------------
        # NextToken
        # -------------------------------------------------

        if next_token:
            params = {"nextToken": next_token}

        # =================================================
        # API REQUEST
        # =================================================

        response = None

        for attempt in range(
            1,
            MAX_RETRIES + 1,
        ):
            try:
                print(
                    f"REQUESTING PAGE {page_number} (attempt {attempt}/{MAX_RETRIES})"
                )

                request_started = time.monotonic()

                response = requests.get(
                    url,
                    headers=headers,
                    params=params,
                    timeout=REQUEST_TIMEOUT,
                )

                request_duration = time.monotonic() - request_started

                print(f"RESPONSE: {response.status_code} ({request_duration:.2f}s)")

                # -------------------------------------------------
                # Success
                # -------------------------------------------------

                if response.status_code == 200:
                    break

                # -------------------------------------------------
                # Retryable errors
                # -------------------------------------------------

                if response.status_code in {
                    429,
                    500,
                    502,
                    503,
                    504,
                }:
                    retry_after = response.headers.get("Retry-After")

                    if retry_after:
                        try:
                            sleep_seconds = float(retry_after)

                        except ValueError:
                            sleep_seconds = 2**attempt

                    else:
                        sleep_seconds = 2**attempt

                    print(f"RETRYABLE ERROR {response.status_code}")

                    print(f"SLEEPING {sleep_seconds:.2f}s")

                    time.sleep(sleep_seconds)

                    continue

                # -------------------------------------------------
                # Non-retryable error
                # -------------------------------------------------

                try:
                    error_data = response.json()

                except Exception:
                    error_data = response.text

                raise Exception(
                    f"Amazon API Error {response.status_code}: {error_data}"
                )

            except requests.RequestException as e:
                if attempt >= MAX_RETRIES:
                    raise Exception(
                        f"Transaction API request "
                        f"failed after "
                        f"{MAX_RETRIES} attempts: "
                        f"{e}"
                    )

                sleep_seconds = 2**attempt

                print(f"REQUEST ERROR: {e}")

                print(f"SLEEPING {sleep_seconds:.2f}s")

                time.sleep(sleep_seconds)

        # =====================================================
        # PARSE RESPONSE
        # =====================================================

        try:
            data = response.json()

        except Exception:
            raise Exception(f"Invalid JSON response from Amazon: {response.text}")

        payload = data.get("payload") or {}

        transactions = payload.get("transactions") or []

        if not isinstance(
            transactions,
            list,
        ):
            transactions = []

        print(f"TRANSACTIONS RECEIVED: {len(transactions)}")

        total_received += len(transactions)

        # =====================================================
        # PROCESS TRANSACTIONS
        # =====================================================

        for index, transaction_data in enumerate(
            transactions,
            start=1,
        ):
            try:
                result = _sync_transaction(
                    account=account,
                    transaction_data=transaction_data,
                )

                if result["created"]:
                    total_created += 1

                elif result["updated"]:
                    total_updated += 1

                elif result["skipped"]:
                    total_skipped += 1

                total_children_created += result["children_created"]

                total_children_updated += result["children_updated"]

                total_duplicates_removed += result["duplicates_removed"]

                # -------------------------------------------------
                # Progress every 50 transactions
                # -------------------------------------------------

                if index % 50 == 0 or index == len(transactions):
                    print(
                        f"PROCESSED: "
                        f"{index}/"
                        f"{len(transactions)} "
                        f"| CREATED={total_created} "
                        f"| UPDATED={total_updated}"
                    )

            except Exception as e:
                total_failed += 1

                transaction_id = (
                    transaction_data.get("transactionId")
                    if isinstance(
                        transaction_data,
                        dict,
                    )
                    else None
                )

                print(f"FAILED TRANSACTION: {transaction_id}")

                print(f"ERROR: {e}")

                continue

        print(f"PAGE {page_number} COMPLETE")

        # =====================================================
        # NEXT PAGE
        # =====================================================

        next_token = payload.get("nextToken")

        if not next_token:
            print("NO TRANSACTION NEXT TOKEN")

            break

        print("TRANSACTION NEXT PAGE FOUND")

        # Small delay before requesting the next page.
        time.sleep(PAGE_DELAY)

    # =====================================================
    # FINAL SUMMARY
    # =====================================================

    print("\n" + "=" * 100)

    print("HISTORICAL TRANSACTION SYNC COMPLETED")

    print("=" * 100)

    print(f"ACCOUNT                 : {account.seller_central_id}")

    print(f"REQUESTED DAYS          : {days}")

    print(f"PAGES                   : {page_number}")

    print(f"TRANSACTIONS RECEIVED   : {total_received}")

    print(f"TRANSACTIONS CREATED    : {total_created}")

    print(f"TRANSACTIONS UPDATED    : {total_updated}")

    print(f"TRANSACTIONS SKIPPED    : {total_skipped}")

    print(f"FAILED TRANSACTIONS     : {total_failed}")

    print(f"CHILDREN CREATED        : {total_children_created}")

    print(f"CHILDREN UPDATED        : {total_children_updated}")

    print(f"DUPLICATES REMOVED      : {total_duplicates_removed}")

    print("=" * 100)

    return {
        "account": account.seller_central_id,
        "days": days,
        "pages": page_number,
        "transactions_received": total_received,
        "transactions_created": total_created,
        "transactions_updated": total_updated,
        "transactions_skipped": total_skipped,
        "failed": total_failed,
        "children_created": total_children_created,
        "children_updated": total_children_updated,
        "duplicates_removed": total_duplicates_removed,
    }
