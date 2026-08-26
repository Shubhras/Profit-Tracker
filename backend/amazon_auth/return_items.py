from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from .models import *
import requests
import csv
from io import StringIO
from datetime import datetime
from rest_framework.response import Response
import logging
logger = logging.getLogger(__name__)
from django.core.cache import cache
from amazon_auth.spapi_manager import SPAPIManager
from django.utils.dateparse import parse_date
from rest_framework.permissions import AllowAny
from datetime import datetime, date, timedelta
from django.db.models import Q, Sum

# @api_view(['GET'])
# @permission_classes([AllowAny])
# def sync_returns(request):
#     print("Return sync started")

#     user = request.user
#     if user.is_anonymous:
#         from django.contrib.auth.models import User
#         user = User.objects.first()

#     accounts = AmazonAccount.objects.filter(user=user)

#     total_saved = 0
#     details = []

#     for account in accounts:
#         manager = SPAPIManager(user=user, account=account)

#         # ✅ DEFAULT FILTERS (VERY IMPORTANT)
#         created_since = request.GET.get("createdSince") or (
#             datetime.utcnow() - timedelta(days=30)
#         ).strftime("%Y-%m-%dT%H:%M:%SZ")

#         created_until = request.GET.get("createdUntil") or datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

#         status = request.GET.get("status") or "CREATED"

#         kwargs = {
#             "createdSince": created_since,
#             "createdUntil": created_until,
#             "status": status,
#             "maxResults": 100
#         }

#         account_count = 0

#         while True:
#             print("Calling Returns API with:", kwargs)

#             response = manager.list_returns(**kwargs)

#             print("RAW RESPONSE:", response)

#             if "errors" in response:
#                 print("Return API error:", response)
#                 break

#             returns_data = response.get("returns", [])

#             if not returns_data:
#                 print("⚠️ No returns found for this page")

#             for r in returns_data:
#                 try:
#                     channel = r.get("marketplaceChannelDetails", {})

#                     amazon_order_id = channel.get("customerOrderId")
#                     sku = r.get("merchantSku")

#                     reverse_tracking = (
#                         r.get("returnShippingInfo", {})
#                         .get("reverseTrackingInfo", {})
#                         .get("trackingId")
#                     )

#                     forward_tracking = (
#                         r.get("returnShippingInfo", {})
#                         .get("forwardTrackingInfo", {})
#                         .get("trackingId")
#                     )

#                     reason = (
#                         r.get("returnMetadata", {})
#                         .get("returnReason")
#                     )

#                     ReturnItem.objects.update_or_create(
#                         return_id=r.get("id"),
#                         defaults={
#                             "user": user,
#                             "amazon_account": account,
#                             "amazon_order_id": amazon_order_id,
#                             "seller_sku": sku,
#                             "quantity": r.get("numberOfUnits", 0),
#                             "status": r.get("status"),
#                             "return_type": r.get("returnType"),
#                             "return_reason": reason,
#                             "tracking_id": reverse_tracking or forward_tracking,
#                             "created_at": parse_date(r.get("creationDateTime")),
#                             "updated_at": parse_date(r.get("lastUpdatedDateTime")),
#                             "raw_data": r
#                         }
#                     )

#                     account_count += 1

#                 except Exception as e:
#                     print("Return parse error:", str(e))

#             # ✅ PAGINATION FIX
#             next_token = response.get("nextToken")

#             if next_token:
#                 kwargs = {
#                     "nextToken": next_token,
#                     "maxResults": 100
#                 }
#             else:
#                 break

#         total_saved += account_count

#         details.append({
#             "seller_id": account.seller_central_id,
#             "synced": account_count
#         })

#     return JsonResponse({
#         "status": True,
#         "message": "Returns synced successfully",
#         "total": total_saved,
#         "details": details
#     })


import logging
from django.utils import timezone

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def sync_returns(request):
    logger.info(f"[START] Return sync started at {timezone.now()}")

    user = request.user
    if user.is_anonymous:
        from django.contrib.auth.models import User
        user = User.objects.first()
        logger.warning(f"[ANONYMOUS] Using fallback user: {user}")

    accounts = AmazonAccount.objects.filter(user=user)

    total_saved = 0
    details = []

    for account in accounts:
        logger.info(f"[ACCOUNT] Processing seller_id={account.seller_central_id}")

        manager = SPAPIManager(user=user, account=account)

        # 🔥 CRITICAL DEBUG
        logger.info(f"[CONFIG] Host={manager.host}, Region={manager.region_env}, Marketplace={manager.marketplace_id}")

        created_since = request.GET.get("createdSince") or (
            datetime.utcnow() - timedelta(days=30)
        ).strftime("%Y-%m-%dT%H:%M:%SZ")

        created_until = request.GET.get("createdUntil") or datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

        status = request.GET.get("status") or "CREATED"

        kwargs = {
            "createdSince": created_since,
            "createdUntil": created_until,
            "status": status,
            "maxResults": 100
        }

        account_count = 0
        page = 1

        while True:
            logger.info(f"[API CALL] Page={page} Params={kwargs}")

            start_time = timezone.now()

            response = manager.list_returns(**kwargs)

            end_time = timezone.now()

            logger.info(f"[API RESPONSE TIME] {(end_time - start_time).total_seconds()} sec")

            # 🔥 FULL RAW LOG (truncate if huge)
            logger.debug(f"[RAW RESPONSE] {str(response)[:2000]}")

            # 🔥 ERROR HANDLING
            if "errors" in response:
                error = response.get("errors")[0]

                logger.error(
                    f"[API ERROR] Seller={account.seller_central_id} "
                    f"Code={error.get('code')} "
                    f"Message={error.get('message')} "
                    f"Details={error.get('details')}"
                )

                # Optional: store for debugging
                details.append({
                    "seller_id": account.seller_central_id,
                    "error": error.get("message"),
                    "time": str(timezone.now())
                })

                break

            returns_data = response.get("returns", [])

            if not returns_data:
                logger.warning(f"[EMPTY] No returns found Page={page}")

            for r in returns_data:
                try:
                    channel = r.get("marketplaceChannelDetails", {})

                    amazon_order_id = channel.get("customerOrderId")
                    sku = r.get("merchantSku")

                    reverse_tracking = (
                        r.get("returnShippingInfo", {})
                        .get("reverseTrackingInfo", {})
                        .get("trackingId")
                    )

                    forward_tracking = (
                        r.get("returnShippingInfo", {})
                        .get("forwardTrackingInfo", {})
                        .get("trackingId")
                    )

                    reason = (
                        r.get("returnMetadata", {})
                        .get("returnReason")
                    )

                    logger.debug(
                        f"[RETURN ITEM] Order={amazon_order_id} SKU={sku} Status={r.get('status')}"
                    )

                    ReturnItem.objects.update_or_create(
                        return_id=r.get("id"),
                        defaults={
                            "user": user,
                            "amazon_account": account,
                            "amazon_order_id": amazon_order_id,
                            "seller_sku": sku,
                            "quantity": r.get("numberOfUnits", 0),
                            "status": r.get("status"),
                            "return_type": r.get("returnType"),
                            "return_reason": reason,
                            "tracking_id": reverse_tracking or forward_tracking,
                            "created_at": parse_date(r.get("creationDateTime")),
                            "updated_at": parse_date(r.get("lastUpdatedDateTime")),
                            "raw_data": r
                        }
                    )

                    account_count += 1

                except Exception as e:
                    logger.exception(f"[PARSE ERROR] {str(e)}")

            next_token = response.get("nextToken")

            if next_token:
                logger.info(f"[PAGINATION] NextToken received, fetching next page")

                kwargs = {
                    "nextToken": next_token,
                    "maxResults": 100
                }
                page += 1
            else:
                logger.info(f"[END] No more pages")
                break

        total_saved += account_count

        details.append({
            "seller_id": account.seller_central_id,
            "synced": account_count
        })

    logger.info(f"[COMPLETE] Total returns synced: {total_saved}")

    return JsonResponse({
        "status": True,
        "message": "Returns synced successfully",
        "total": total_saved,
        "details": details
    })




# ============================================================
# ⚠️ CONFIRM BEFORE RELYING ON THIS IN PRODUCTION
# ============================================================
# Classification rule (derived from one confirmed sample only):
#
#   Refund transaction for an order
#       + a ServiceFee transaction for the SAME order whose
#         description matches FULFILLMENT_FEE_REFUND_PATTERNS
#       => COURIER RETURN (RTO) — Amazon refunded both the sale
#         and the postage/fulfillment fee, implying the shipment
#         never reached the buyer.
#
#   Refund transaction for an order
#       + NO matching fee-refund ServiceFee transaction
#       => CUSTOMER RETURN — item was delivered (postage fee
#         stands), buyer sent it back afterward.
#
# Only one real example ("EasyshipFulfillmentFeeRefund") has been
# verified. If your account uses other carriers/fulfillment types,
# their fee-refund description strings may differ — add them to
# FULFILLMENT_FEE_REFUND_PATTERNS below once confirmed against a
# known RTO order in Seller Central.
# ============================================================

FULFILLMENT_FEE_REFUND_PATTERNS = [
    "FulfillmentFeeRefund",  # matches e.g. "EasyshipFulfillmentFeeRefund"
]

CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}


from datetime import datetime, timedelta

from django.db.models import Q, Sum
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from amazon_auth.models import (
    AmazonTransaction,
    AmazonTransactionRelatedIdentifier,
)


# ============================================================
# ⚠️ CONFIRM BEFORE RELYING ON THIS IN PRODUCTION
# ============================================================
# Classification rule (derived from one confirmed sample only):
#
#   Refund transaction for an order
#       + a ServiceFee transaction for the SAME order whose
#         description matches FULFILLMENT_FEE_REFUND_PATTERNS
#       => COURIER RETURN (RTO) — Amazon refunded both the sale
#         and the postage/fulfillment fee, implying the shipment
#         never reached the buyer.
#
#   Refund transaction for an order
#       + NO matching fee-refund ServiceFee transaction
#       => CUSTOMER RETURN — item was delivered (postage fee
#         stands), buyer sent it back afterward.
#
# Only one real example ("EasyshipFulfillmentFeeRefund") has been
# verified. If your account uses other carriers/fulfillment types,
# their fee-refund description strings may differ — add them to
# FULFILLMENT_FEE_REFUND_PATTERNS below once confirmed against a
# known RTO order in Seller Central.
# ============================================================

FULFILLMENT_FEE_REFUND_PATTERNS = [
    "FulfillmentFeeRefund",  # matches e.g. "EasyshipFulfillmentFeeRefund"
]

CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def courier_vs_customer_returns(request):

    user = request.user
    data = request.data

    filters = data.get("filters", {})
    pagination = data.get("pagination", {})

    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 1000))

    return_type_filter = filters.get("returnType")  # "COURIER" | "CUSTOMER" | None (both)

    # ---------------- DATE FILTER ----------------
    from_date = to_date = None
    try:
        if filters.get("fromDate"):
            from_date = timezone.make_aware(
                datetime.strptime(filters["fromDate"], "%Y-%m-%d")
            )
        if filters.get("toDate"):
            to_date = timezone.make_aware(
                datetime.strptime(filters["toDate"], "%Y-%m-%d")
            ) + timedelta(days=1)
    except Exception as e:
        print("Date error:", e)

    # ---------------- BASE TRANSACTION QUERYSET ----------------
    tx_qs = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_status ='DEFERRED',
        # transaction_type='refund',
    )

    if from_date:
        tx_qs = tx_qs.filter(posted_date__gte=from_date)
    if to_date:
        tx_qs = tx_qs.filter(posted_date__lt=to_date)

    # ---------------- CHANNEL FILTER (marketplace, via raw_payload) ----------------
    # NOTE: marketplace_id lives inside raw_payload/marketplaceDetails on
    # AmazonTransaction, not as its own column. If you have a dedicated
    # marketplace_id field on this model, filter on that instead — this
    # is a placeholder using the account-level relation if available.
    channels = filters.get("channel", {}).get("IN", [])
    marketplace_ids = [CHANNEL_MAP[ch] for ch in channels if ch in CHANNEL_MAP]
    # If AmazonTransaction has no direct marketplace field, this filter
    # is intentionally left out — add `tx_qs = tx_qs.filter(...)` here
    # once the correct field/path is confirmed.

    # ---------------- REFUND TRANSACTIONS (the "return" events) ----------------
    refund_txns = tx_qs.filter(
        transaction_type='Refund'
    ).prefetch_related('related_identifiers', 'contexts')

    # ---------------- ORDER_ID -> REFUND TRANSACTION MAP ----------------
    refund_tx_ids = list(refund_txns.values_list('id', flat=True))

    refund_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction_id__in=refund_tx_ids,
        identifier_name='ORDER_ID'
    ).values('transaction_id', 'identifier_value')

    refund_tx_to_order = {
        row['transaction_id']: row['identifier_value']
        for row in refund_identifiers
    }

    order_ids_with_refund = set(refund_tx_to_order.values())

    # ---------------- SERVICE-FEE (fulfillment-fee-refund) TRANSACTIONS ----------------
    fee_refund_q = Q()
    for pattern in FULFILLMENT_FEE_REFUND_PATTERNS:
        fee_refund_q |= Q(description__icontains=pattern)

    fee_refund_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_status ='DEFERRED',
        transaction_type='ServiceFee',
    ).filter(fee_refund_q)

    if from_date:
        fee_refund_txns = fee_refund_txns.filter(posted_date__gte=from_date)
    if to_date:
        fee_refund_txns = fee_refund_txns.filter(posted_date__lt=to_date)

    fee_refund_tx_ids = list(fee_refund_txns.values_list('id', flat=True))

    fee_refund_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction_id__in=fee_refund_tx_ids,
        identifier_name='ORDER_ID'
    ).values('transaction_id', 'identifier_value')

    fee_refund_tx_to_order = {
        row['transaction_id']: row['identifier_value']
        for row in fee_refund_identifiers
    }

    order_ids_with_fee_refund = set(fee_refund_tx_to_order.values())

    # ---------------- ORDER_ID -> FEE-REFUND TRANSACTION(S) MAP ----------------
    # (kept as full objects, not just ids, so we can attach their raw_payload
    # to the response for COURIER_RETURN rows)
    order_to_fee_refund_txns = {}
    for txn in fee_refund_txns:
        oid = fee_refund_tx_to_order.get(txn.id)
        if not oid:
            continue
        order_to_fee_refund_txns.setdefault(oid, []).append(txn)

    # ---------------- CLASSIFY EACH REFUNDED ORDER ----------------
    results = []

    total_courier_amount = 0.0
    total_customer_amount = 0.0
    courier_count = 0
    customer_count = 0

    # Build order_id -> refund transaction(s) map for building the response
    order_to_refund_txns = {}
    for txn in refund_txns:
        oid = refund_tx_to_order.get(txn.id)
        if not oid:
            continue
        order_to_refund_txns.setdefault(oid, []).append(txn)

    for order_id, txns in order_to_refund_txns.items():

        is_courier_return = order_id in order_ids_with_fee_refund
        return_type = "COURIER_RETURN" if is_courier_return else "CUSTOMER_RETURN"

        if return_type_filter == "COURIER" and not is_courier_return:
            continue
        if return_type_filter == "CUSTOMER" and is_courier_return:
            continue

        refund_amount = sum(float(t.total_amount or 0) for t in txns)

        # Pull ASIN/SKU from the first transaction's ProductContext, if present
        asin = sku = None
        for t in txns:
            ctx = t.contexts.filter(context_type='ProductContext').first()
            if ctx:
                asin = ctx.asin
                sku = ctx.sku
                break

        if is_courier_return:
            total_courier_amount += refund_amount
            courier_count += 1
        else:
            total_customer_amount += refund_amount
            customer_count += 1

        # Combine Refund txns with the matching fee-refund ServiceFee txns
        # (only present for COURIER_RETURN orders) so the response is
        # self-verifying - you can see the actual evidence behind the
        # classification, not just the label.
        # all_related_txns = list(txns) + order_to_fee_refund_txns.get(order_id, [])
        
        if is_courier_return:
            all_related_txns = order_to_fee_refund_txns.get(order_id, [])
        else:
            all_related_txns = list(txns)

        results.append({
            "order_id": order_id,
            "return_type": return_type,
            "asin": asin,
            "sku": sku,
            "refund_amount": round(refund_amount, 2),
            "posted_date": max(
                (t.posted_date for t in txns if t.posted_date), default=None
            ),
            "transaction_ids": [t.transaction_id for t in all_related_txns],
            "raw_transactions": [
                {
                    "transaction_id": t.transaction_id,
                    "transaction_type": t.transaction_type,
                    "transaction_status": t.transaction_status,
                    "description": t.description,
                    "total_amount": float(t.total_amount or 0),
                    "posted_date": t.posted_date,
                    "raw_payload": t.raw_payload,
                }
                for t in all_related_txns
            ],
        })

    results.sort(key=lambda r: r['posted_date'] or timezone.now(), reverse=True)

    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": len(results)
        },
        "totals": {
            "courier_return": {
                "count": courier_count,
                "amount": round(total_courier_amount, 2),
            },
            "customer_return": {
                "count": customer_count,
                "amount": round(total_customer_amount, 2),
            },
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })
  
  


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def financial_event_group_transactions(request):
    """
    Two modes, based on whether `financialEventGroupId` is supplied:

    1) financialEventGroupId GIVEN
       -> returns full details (transaction + related identifiers +
          breakdowns + contexts + raw_payload) for every transaction
          that belongs to that FINANCIAL_EVENT_GROUP_ID.

    2) financialEventGroupId NOT GIVEN
       -> returns a paginated list of distinct FINANCIAL_EVENT_GROUP_ID
          values seen in the date range, each with a summary
          (transaction count, total amount, first/last posted date).
          Use this to discover group ids, then call again with one
          selected to drill into full details via mode 1.
    """

    user = request.user
    data = request.data

    filters = data.get("filters", {})
    pagination = data.get("pagination", {})

    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))

    financial_event_group_id = filters.get("financialEventGroupId")

    # ---------------- DATE FILTER ----------------
    from_date = to_date = None
    try:
        if filters.get("fromDate"):
            from_date = timezone.make_aware(
                datetime.strptime(filters["fromDate"], "%Y-%m-%d")
            )
        if filters.get("toDate"):
            to_date = timezone.make_aware(
                datetime.strptime(filters["toDate"], "%Y-%m-%d")
            ) + timedelta(days=1)
    except Exception as e:
        print("Date error:", e)

    # ---------------- BASE TRANSACTION QUERYSET ----------------
    tx_qs = AmazonTransaction.objects.filter(
        amazon_account__user=user
    )

    if from_date:
        tx_qs = tx_qs.filter(posted_date__gte=from_date)
    if to_date:
        tx_qs = tx_qs.filter(posted_date__lt=to_date)

    # ---------------- IDENTIFIER ROWS FOR THIS IDENTIFIER NAME ----------------
    group_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=tx_qs,
        identifier_name='FINANCIAL_EVENT_GROUP_ID'
    ).values('transaction_id', 'identifier_value')

    tx_to_group = {
        row['transaction_id']: row['identifier_value']
        for row in group_identifiers
    }

    # ============================================================
    # MODE 1 — a specific group id was requested: return full details
    # ============================================================
    if financial_event_group_id:

        matching_tx_ids = [
            tx_id for tx_id, group_id in tx_to_group.items()
            if group_id == financial_event_group_id
        ]

        transactions = (
            tx_qs.filter(id__in=matching_tx_ids)
            .prefetch_related('related_identifiers', 'breakdowns__children', 'contexts')
            .order_by('-posted_date')
        )

        results = []
        total_amount = 0.0

        for t in transactions:

            total_amount += float(t.total_amount or 0)

            results.append({
                "id": t.id,
                "transaction_id": t.transaction_id,
                "transaction_type": t.transaction_type,
                "transaction_status": t.transaction_status,
                "description": t.description,
                "posted_date": t.posted_date,
                "total_amount": float(t.total_amount or 0),
                "currency_code": t.currency_code,
                "related_identifiers": [
                    {
                        "identifier_name": ri.identifier_name,
                        "identifier_value": ri.identifier_value,
                    }
                    for ri in t.related_identifiers.all()
                ],
                "breakdowns": [
                    {
                        "id": bd.id,
                        "parent_id": bd.parent_id,
                        "breakdown_type": bd.breakdown_type,
                        "amount": float(bd.amount or 0),
                        "currency_code": bd.currency_code,
                    }
                    for bd in t.breakdowns.all()
                ],
                "contexts": [
                    {
                        "context_type": ctx.context_type,
                        "asin": ctx.asin,
                        "sku": ctx.sku,
                        "quantity_shipped": ctx.quantity_shipped,
                        "fulfillment_network": ctx.fulfillment_network,
                        "deferral_reason": ctx.deferral_reason,
                        "maturity_date": ctx.maturity_date,
                        "store_name": ctx.store_name,
                        "order_type": ctx.order_type,
                        "channel": ctx.channel,
                    }
                    for ctx in t.contexts.all()
                ],
                "raw_payload": t.raw_payload,
            })

        return Response({
            "status": True,
            "message": "Success",
            "mode": "GROUP_DETAILS",
            "financial_event_group_id": financial_event_group_id,
            "pagination": {
                "pageNo": page_no,
                "pageSize": page_size,
                "count": len(results)
            },
            "totals": {
                "transaction_count": len(results),
                "total_amount": round(total_amount, 2),
            },
            "response": results[page_no * page_size:(page_no + 1) * page_size]
        })

    # ============================================================
    # MODE 2 — no group id given: list distinct groups with summaries
    # ============================================================

    group_to_tx_ids = {}
    for tx_id, group_id in tx_to_group.items():
        group_to_tx_ids.setdefault(group_id, []).append(tx_id)

    all_tx_ids = [tx_id for ids in group_to_tx_ids.values() for tx_id in ids]

    tx_details = {
        t.id: t
        for t in tx_qs.filter(id__in=all_tx_ids)
    }

    group_summaries = []
    for group_id, tx_ids in group_to_tx_ids.items():

        group_txns = [tx_details[tx_id] for tx_id in tx_ids if tx_id in tx_details]
        if not group_txns:
            continue

        posted_dates = [t.posted_date for t in group_txns if t.posted_date]

        group_summaries.append({
            "financial_event_group_id": group_id,
            "transaction_count": len(group_txns),
            "total_amount": round(
                sum(float(t.total_amount or 0) for t in group_txns), 2
            ),
            "first_posted_date": min(posted_dates) if posted_dates else None,
            "last_posted_date": max(posted_dates) if posted_dates else None,
            "raw_transactions": [
                {
                    "id": t.id,
                    "transaction_id": t.transaction_id,
                    "transaction_type": t.transaction_type,
                    "transaction_status": t.transaction_status,
                    "description": t.description,
                    "posted_date": t.posted_date,
                    "total_amount": float(t.total_amount or 0),
                    "currency_code": t.currency_code,
                    "raw_payload": t.raw_payload,
                }
                for t in group_txns
            ],
        })

    return Response({
        "status": True,
        "message": "Success",
        "mode": "GROUP_LIST",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": len(group_summaries)
        },
        "response": group_summaries[page_no * page_size:(page_no + 1) * page_size]
    })


# New api for return amazon 

# ============================================================
# AMAZON SP-API RETURNS REPORT (FBA & MERCHANT / EASY SHIP)
# ============================================================
import gzip
import time
from django.utils.dateparse import parse_datetime, parse_date
from user_auth.models import get_effective_user


def parse_and_save_returns_tsv(content_str, user, account, report_type):
    """
    Parses tab-separated values (TSV) from Amazon Returns report and updates ReturnItem table.
    Supports both FBA Customer Returns (GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA)
    and MFN / Merchant Returns (GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE).
    """
    effective_user = get_effective_user(user)
    reader = csv.DictReader(StringIO(content_str), delimiter='\t')

    parsed_items = []
    saved_count = 0

    for idx, row in enumerate(reader):
        try:
            # Clean keys by stripping whitespace
            cleaned_row = { (k.strip() if k else f"col_{i}"): (v.strip() if v else "") for i, (k, v) in enumerate(row.items()) }

            # FBA Customer Returns column names
            order_id = cleaned_row.get("order-id") or cleaned_row.get("Order ID") or cleaned_row.get("order_id") or ""
            sku = cleaned_row.get("sku") or cleaned_row.get("Merchant SKU") or cleaned_row.get("seller-sku") or cleaned_row.get("SKU") or ""
            
            if not order_id and not sku:
                continue

            quantity_str = cleaned_row.get("quantity") or cleaned_row.get("Return Quantity") or "1"
            try:
                quantity = int(float(quantity_str))
            except (ValueError, TypeError):
                quantity = 1

            status = cleaned_row.get("detailed-disposition") or cleaned_row.get("status") or cleaned_row.get("Return Request Status") or "RETURNED"
            return_reason = cleaned_row.get("reason") or cleaned_row.get("Return Reason") or cleaned_row.get("customer-comments") or ""
            tracking_id = cleaned_row.get("license-plate-number") or cleaned_row.get("In Transit Tracking ID") or cleaned_row.get("tracking-id") or ""
            
            # Generate unique return identifier
            lpn = cleaned_row.get("license-plate-number") or cleaned_row.get("RMA ID") or cleaned_row.get("Amazon RTO ID")
            if lpn:
                return_id = f"RET_{lpn}"
            else:
                return_id = f"RET_{order_id}_{sku}_{idx}"

            date_str = cleaned_row.get("return-date") or cleaned_row.get("Return Request Date") or cleaned_row.get("Order Date")
            parsed_dt = None
            if date_str:
                parsed_dt = parse_datetime(date_str)
                if not parsed_dt:
                    d = parse_date(date_str[:10])
                    if d:
                        parsed_dt = timezone.make_aware(datetime.combine(d, datetime.min.time()))

            now_dt = timezone.now()
            created_dt = parsed_dt or now_dt

            return_type_label = "FBA" if "FBA" in report_type.upper() else "MFN"

            obj, created = ReturnItem.objects.update_or_create(
                return_id=return_id,
                defaults={
                    "user": effective_user,

                    "amazon_account": account,
                    "amazon_order_id": order_id,
                    "seller_sku": sku,
                    "quantity": quantity,
                    "status": status,
                    "return_type": return_type_label,
                    "return_reason": return_reason,
                    "tracking_id": tracking_id,
                    "created_at": created_dt,
                    "updated_at": now_dt,
                    "raw_data": cleaned_row
                }
            )
            saved_count += 1

            label_cost = cleaned_row.get("Label cost") or cleaned_row.get("label_cost") or "0.00"
            order_amount = cleaned_row.get("Order Amount") or cleaned_row.get("order_amount") or "0.00"
            refunded_amount = cleaned_row.get("Refunded Amount") or cleaned_row.get("refunded_amount") or "0.00"
            label_paid_by = cleaned_row.get("Label to be paid by") or ""
            return_carrier = cleaned_row.get("Return carrier") or ""

            parsed_items.append({
                "return_id": return_id,
                "amazon_order_id": order_id,
                "seller_sku": sku,
                "quantity": quantity,
                "status": status,
                "return_type": return_type_label,
                "return_reason": return_reason,
                "tracking_id": tracking_id,
                "label_cost": label_cost,
                "order_amount": order_amount,
                "refunded_amount": refunded_amount,
                "label_paid_by": label_paid_by,
                "return_carrier": return_carrier,
                "return_date": created_dt.isoformat() if created_dt else None
            })
        except Exception as parse_err:
            logger.exception(f"Error parsing return row {idx}: {parse_err}")
            continue

    return saved_count, parsed_items



@api_view(['POST'])

@permission_classes([IsAuthenticated])
def request_amazon_returns_report(request, report_type=None):
    """
    Request a customer returns report from Amazon SP-API.
    
    Payload parameters:
    - report_type: "GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE" (default) or "GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA"
    - start_date: e.g. "2026-08-01" (defaults to 30 days ago)
    - end_date: e.g. "2026-08-26" (defaults to now)
    """
    try:
        user = get_effective_user(request.user)
        account = AmazonAccount.objects.filter(user=user).first()

        if not account:
            return Response({"status": False, "message": "No connected Amazon account found."}, status=404)

        data = request.data or {}
        if not report_type:
            report_type = data.get("report_type", "GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE")

        # Parse date range
        start_date_param = data.get("start_date") or data.get("from_date")
        end_date_param = data.get("end_date") or data.get("to_date")

        now_utc = datetime.utcnow() - timedelta(minutes=5)
        start_dt = datetime.utcnow() - timedelta(days=30)
        end_dt = now_utc

        if start_date_param:
            try:
                start_dt = datetime.strptime(start_date_param[:10], "%Y-%m-%d")
            except ValueError:
                pass

        if end_date_param:
            try:
                parsed_end = datetime.strptime(end_date_param[:10], "%Y-%m-%d").replace(hour=23, minute=59, second=59)
                if parsed_end < now_utc:
                    end_dt = parsed_end
            except ValueError:
                pass

        iso_start = start_dt.strftime("%Y-%m-%dT00:00:00Z")
        iso_end = end_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        create_kwargs = {
            "report_type": report_type,
            "marketplaceIds": [account.marketplace_id] if account.marketplace_id else ["A21TJRUUN4KGV"],
            "dataStartTime": iso_start,
            "dataEndTime": iso_end,
        }

        sp_manager = SPAPIManager(user=user, account=account)

        report_response = sp_manager.create_report(**create_kwargs)

        if "errors" in report_response:
            return Response({
                "status": False,
                "message": "Amazon SP-API error creating report",
                "errors": report_response.get("errors")
            }, status=400)

        report_id = report_response.get("reportId")

        # Record report in AmazonReport table
        if report_id:
            AmazonReport.objects.update_or_create(
                account=account,
                report_id=report_id,
                defaults={
                    "report_type": report_type,
                    "marketplace_id": account.marketplace_id or "A21TJRUUN4KGV",
                    "processing_status": "SUBMITTED",
                    "data_start_time": timezone.make_aware(start_dt),
                    "data_end_time": timezone.make_aware(end_dt),
                }
            )

        return Response({
            "status": True,
            "message": "Returns report requested successfully from Amazon.",
            "report_id": report_id,
            "report_type": report_type,
            "data_start_time": iso_start,
            "data_end_time": iso_end,
            "raw_response": report_response
        })

    except Exception as e:
        logger.exception(f"request_amazon_returns_report failed: {e}")
        return Response({"status": False, "message": str(e)}, status=500)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def check_amazon_returns_report_status(request, report_id=None):
    """
    Checks the status of an Amazon Returns Report by report_id.
    When completed, automatically downloads the TSV document, parses return items,
    and updates the database.
    """
    try:
        if not report_id:
            report_id = request.data.get("report_id") or request.GET.get("report_id")
        
        if not report_id:
            return Response({"status": False, "message": "report_id parameter is required."}, status=400)

        user = get_effective_user(request.user)

        account = AmazonAccount.objects.filter(user=user).first()
        if not account:
            return Response({"status": False, "message": "No connected Amazon account found."}, status=404)

        sp_manager = SPAPIManager(user=user, account=account)

        report_info = sp_manager.get_report(report_id)

        if "errors" in report_info:
            return Response({
                "status": False,
                "message": "Failed to get report details from Amazon",
                "errors": report_info.get("errors")
            }, status=400)

        processing_status = report_info.get("processingStatus")
        report_document_id = report_info.get("reportDocumentId")
        report_type = report_info.get("reportType", "GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE")

        # Update local report object
        AmazonReport.objects.filter(report_id=report_id).update(
            processing_status=processing_status,
            report_document_id=report_document_id
        )

        if processing_status in ["COMPLETED", "DONE"] and report_document_id:
            # Download document details
            doc_info = sp_manager.get_report_document(report_document_id)
            download_url = doc_info.get("url")
            compression = doc_info.get("compressionAlgorithm")

            if not download_url:
                return Response({
                    "status": False,
                    "message": "Report document download URL not found in Amazon response.",
                    "doc_info": doc_info
                }, status=400)

            # Download TSV document content
            doc_res = requests.get(download_url)
            if doc_res.status_code != 200:
                return Response({
                    "status": False,
                    "message": f"Failed to download report document file (HTTP {doc_res.status_code})"
                }, status=400)

            raw_bytes = doc_res.content

            # Decompress if GZIP
            if compression == "GZIP" or raw_bytes[:2] == b'\x1f\x8b':
                content_str = gzip.decompress(raw_bytes).decode('utf-8', errors='ignore')
            else:
                content_str = raw_bytes.decode('utf-8', errors='ignore')

            # Parse TSV and store into DB
            saved_count, parsed_data = parse_and_save_returns_tsv(content_str, user, account, report_type)

            AmazonReport.objects.filter(report_id=report_id).update(
                download_status="PARSED",
                last_synced_at=timezone.now()
            )

            return Response({
                "status": True,
                "report_id": report_id,
                "processing_status": "COMPLETED",
                "synced_count": saved_count,
                "data": parsed_data,
                "message": f"Successfully parsed and synced {saved_count} return records."
            })

        if processing_status in ["CANCELLED", "FATAL"]:
            # If FBA report was cancelled, attempt automatic fallback to MFN returns report
            if report_type == "GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA":
                logger.info(f"Report {report_id} of type GET_FBA_FULFILLMENT_CUSTOMER_RETURNS_DATA was cancelled. Initiating fallback to GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE...")
                fallback_req = request_amazon_returns_report(
                    request._request,
                    report_type="GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE"
                )
                if fallback_req.status_code == 200 and fallback_req.data.get("status"):
                    new_id = fallback_req.data.get("report_id")
                    return Response({
                        "status": True,
                        "report_id": new_id,
                        "previous_report_id": report_id,
                        "processing_status": "SUBMITTED",
                        "message": f"FBA report {report_id} was cancelled by Amazon (no FBA return data). Automatically requested Merchant/Easy Ship return report ({new_id}). Please check status again in a few seconds."
                    })

            return Response({
                "status": False,
                "report_id": report_id,
                "processing_status": processing_status,
                "message": f"Amazon report generation was '{processing_status}'. Common reasons: dataEndTime was set in the future or no return records match the requested parameters."
            }, status=400)


        return Response({
            "status": True,
            "report_id": report_id,
            "processing_status": processing_status,
            "message": f"Report processing status is '{processing_status}'. Check back in a few seconds."
        })


    except Exception as e:
        logger.exception(f"check_amazon_returns_report_status failed: {e}")
        return Response({"status": False, "message": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_amazon_returns_now(request):
    """
    One-click workflow to request a Return Report from Amazon, wait for it to finish,
    and return the parsed data in a single response.
    """
    try:
        user = get_effective_user(request.user)

        account = AmazonAccount.objects.filter(user=user).first()
        if not account:
            return Response({"status": False, "message": "No connected Amazon account found."}, status=404)

        data = request.data or {}
        report_type = data.get("report_type", "GET_FLAT_FILE_RETURNS_DATA_BY_RETURN_DATE")

        # Step 1: Request report
        req_res = request_amazon_returns_report(request._request)
        if req_res.status_code != 200 or not req_res.data.get("status"):
            return req_res

        report_id = req_res.data.get("report_id")

        # Step 2: Poll up to 6 times (max 30s)
        sp_manager = SPAPIManager(user=user, account=account)
        attempts = 0
        max_attempts = 6

        while attempts < max_attempts:
            time.sleep(5)
            attempts += 1

            status_res = check_amazon_returns_report_status(request._request, report_id=report_id)
            status_data = status_res.data

            if status_data.get("processing_status") in ["COMPLETED", "DONE"]:
                return status_res


            if status_data.get("processing_status") in ["CANCELLED", "FATAL"]:
                return Response({
                    "status": False,
                    "message": f"Report generation failed on Amazon side with status '{status_data.get('processing_status')}'",
                    "report_id": report_id
                }, status=400)

        return Response({
            "status": True,
            "report_id": report_id,
            "processing_status": "IN_PROGRESS",
            "message": f"Report requested successfully. Processing is still underway at Amazon. Please poll status endpoint GET /api/amazon/returns/report-status/{report_id}/ in a moment."
        })

    except Exception as e:
        logger.exception(f"sync_amazon_returns_now failed: {e}")
        return Response({"status": False, "message": str(e)}, status=500)


def format_return_item_response(item):

    """
    Normalizes a ReturnItem DB model object into a comprehensive dictionary
    containing all standard and extended report fields.
    """
    raw = item.raw_data or {}
    
    def get_val(*keys):
        for k in keys:
            if k in raw and raw[k] is not None:
                val = str(raw[k]).strip()
                if val:
                    return val
        return ""

    return {
        "id": getattr(item, "id", None),
        "return_id": getattr(item, "return_id", ""),
        "amazon_order_id": getattr(item, "amazon_order_id", "") or get_val("Order ID", "order-id", "order_id"),
        "seller_sku": getattr(item, "seller_sku", "") or get_val("Merchant SKU", "seller-sku", "sku", "SKU"),
        "quantity": getattr(item, "quantity", 1),
        "status": getattr(item, "status", "") or get_val("Return request status", "detailed-disposition", "status"),
        "return_type": getattr(item, "return_type", "MFN"),
        "return_reason": getattr(item, "return_reason", "") or get_val("Return Reason", "reason", "customer-comments"),
        "tracking_id": getattr(item, "tracking_id", "") or get_val("Tracking ID", "tracking-id", "license-plate-number", "In Transit Tracking ID"),
        
        # Extended Catalog & Item Metadata
        "asin": get_val("ASIN", "asin"),
        "item_name": get_val("Item Name", "item-name"),
        "category": get_val("Category", "category"),
        "is_prime": get_val("Is prime", "is-prime"),
        "in_policy": get_val("In policy", "in-policy"),
        "currency_code": get_val("Currency code", "currency-code") or "INR",
        
        # Extended Shipping & Carrier Details
        "label_cost": get_val("Label cost", "label-cost") or "0.00",
        "label_type": get_val("Label type", "label-type"),
        "label_paid_by": get_val("Label to be paid by", "label-to-be-paid-by"),
        "return_carrier": get_val("Return carrier", "return-carrier"),
        
        # Extended Order & Refund Financials
        "order_amount": get_val("Order Amount", "order-amount") or "0.00",
        "refunded_amount": get_val("Refunded Amount", "refunded-amount") or "0.00",
        "order_quantity": get_val("Order quantity", "order-quantity") or str(getattr(item, "quantity", 1)),
        "return_quantity": get_val("Return quantity", "return-quantity") or str(getattr(item, "quantity", 1)),
        
        # Extended Dates & Workflow Status
        "order_date": get_val("Order date", "order-date"),
        "return_request_date": get_val("Return request date", "return-request-date", "return-date"),
        "return_delivery_date": get_val("Return delivery date", "return-delivery-date"),
        "resolution": get_val("Resolution", "resolution"),
        "a_to_z_claim": get_val("A-to-Z Claim", "a-to-z-claim"),
        "amazon_rma_id": get_val("Amazon RMA ID", "rma-id", "RMA ID"),
        "merchant_rma_id": get_val("Merchant RMA ID", "merchant-rma-id"),
        "order_item_id": get_val("Order Item ID", "order-item-id"),
        "invoice_number": get_val("Invoice number", "invoice-number"),
        
        # SAFE-T Claim Details
        "safet_claim_id": get_val("SafeT claim id", "safet-claim-id"),
        "safet_claim_state": get_val("SafeT claim state", "safet-claim-state"),
        "safet_action_reason": get_val("SafeT Action reason", "safet-action-reason"),
        "safet_claim_creation_time": get_val("SafeT claim creation time", "safet-claim-creation-time"),
        "safet_claim_reimbursement_amount": get_val("SafeT claim reimbursement amount", "safet-claim-reimbursement-amount") or "0.00",

        "created_at": item.created_at.strftime("%Y-%m-%d %H:%M:%S") if getattr(item, "created_at", None) else None,
        "raw_data": raw
    }


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def list_db_returns(request):

    """
    Get paginated and filtered list of saved return items from the ReturnItem database model.
    """
    try:
        user = get_effective_user(request.user)
        data = request.data if request.method == 'POST' else request.GET

        qs = ReturnItem.objects.filter(user=user).order_by('-created_at')


        # Filters
        search = data.get("search") or data.get("search_text")
        if search:
            qs = qs.filter(
                Q(amazon_order_id__icontains=search) |
                Q(seller_sku__icontains=search) |
                Q(tracking_id__icontains=search) |
                Q(return_reason__icontains=search)
            )

        status_filter = data.get("status")
        if status_filter:
            qs = qs.filter(status__iexact=status_filter)

        return_type_filter = data.get("return_type")
        if return_type_filter:
            qs = qs.filter(return_type__iexact=return_type_filter)

        page_no = int(data.get("page", 1))
        page_size = int(data.get("page_size", 50))

        total_count = qs.count()
        offset = (page_no - 1) * page_size
        items = qs[offset:offset + page_size]

        results = []
        for item in items:
            results.append(format_return_item_response(item))

        return Response({
            "status": True,
            "total": total_count,
            "page": page_no,
            "page_size": page_size,
            "data": results
        })


    except Exception as e:
        logger.exception(f"list_db_returns failed: {e}")
        return Response({"status": False, "message": str(e)}, status=500)

