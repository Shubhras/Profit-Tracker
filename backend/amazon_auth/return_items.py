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
      
    
