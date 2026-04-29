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


