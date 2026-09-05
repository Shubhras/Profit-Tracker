import os
import secrets
import requests
import json
from datetime import datetime, date, timedelta
from django.shortcuts import redirect, render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Count, Q, Min, Max
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from amazon_auth.services.initial_amazon_sync import run_initial_amazon_sync
from amazon_auth.tasks import task_run_initial_amazon_sync
from subscription.models import UserSubscription
from .spapi_manager import SPAPIManager
from .models import *
from user_auth.models import get_effective_user
from dotenv import load_dotenv
from rest_framework.response import Response
from decimal import Decimal
from django.db.models import Sum, Case, When, Value, DecimalField, Q ,F, FloatField
from django.db.models.functions import Coalesce
from .utils import * 
from .utils import _get_sku_profits_for_dashboard
import csv
from io import StringIO
from django.db import transaction
import traceback
from django.utils.dateparse import parse_datetime
def to_decimal(val):
    try:
        return Decimal(str(val or 0))
    except:
        return Decimal("0")
import logging
logger = logging.getLogger(__name__)

from django.db.models import *
from django.core.cache import cache

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from amazon_auth.spapi_manager import SPAPIManager
from amazon_auth.utils import safe_catalog_call

from amazon_ads.models import ProductAdMetric
from .other_expence import calculate_other_expenses_map

# Load .env file
load_dotenv()


# Map ENV variables correctly from .env
AMAZON_CLIENT_ID = os.getenv("AMAZON_CLIENT_ID")
AMAZON_CLIENT_SECRET = os.getenv("AMAZON_CLIENT_SECRET")
AMAZON_APP_ID = os.getenv("AMAZON_APP_ID")
# REDIRECT_URI = os.getenv("REDIRECT_URI")
REDIRECT_URI="https://trackmyprofit.com/api/amazon/callback"


def format_date(dt):
    """Formats datetime to Amazon ISO8601 string with Z suffix"""
    return dt.strftime('%Y-%m-%dT%H:%M:%SZ')

# =========================================
# 1. CONNECT → Redirect to Amazon
# =========================================
def amazon_connect(request):
    print("connect api callllll//////")
    user_id = request.GET.get("user_id")
    if (not user_id or str(user_id).lower() in ["undefined", "null", "none"]) and hasattr(request, 'user') and request.user.is_authenticated:
        user_id = request.user.id

    if user_id and str(user_id).lower() not in ["undefined", "null", "none"]:
        try:
            from django.contrib.auth.models import User
            from subscription.utils.channel_limit import check_user_channel_connection_limit
            u = User.objects.get(id=user_id)
            is_allowed, max_allowed, current_count, err_msg = check_user_channel_connection_limit(u)
            if not is_allowed:
                return JsonResponse({"status": False, "error": err_msg, "message": err_msg}, status=403)
        except User.DoesNotExist:
            pass
        except Exception as e:
            print("Channel limit check error in amazon_connect:", e)

    state = f"{user_id}:{secrets.token_hex(16)}"
    request.session["amazon_state"] = state
    request.session["code_used"] = False

    print("_state//////",state)
    
    auth_url = (
        "https://sellercentral.amazon.in/apps/authorize/consent"
        f"?application_id={AMAZON_APP_ID}"
        f"&state={state}"
        f"&redirect_uri={REDIRECT_URI}"

    )
    return redirect(auth_url)




def amazon_callback(request):
    print("callback api calll ///////////////:", flush=True)
    state = request.GET.get("state")
    code = request.GET.get("spapi_oauth_code")
    seller_id = request.GET.get("selling_partner_id")
    user_id = request.GET.get("user_id")

    if not code:
        print("Callback Error: Authorization code missing", flush=True)
        return JsonResponse({"error": "Authorization code missing"}, status=400)

    #  Prevent duplicate code usage
    if cache.get(code):
        print(f"Callback Error: Code already used ({code})", flush=True)
        return JsonResponse({"error": "Code already used"}, status=400)
    cache.set(code, True, timeout=300)

    print("CLIENT_ID:", AMAZON_CLIENT_ID, flush=True)
    print("CLIENT_SECRET:", AMAZON_CLIENT_SECRET, flush=True)

    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": AMAZON_CLIENT_ID,
        "client_secret": AMAZON_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
    }

    response = requests.post(
        "https://api.amazon.com/auth/o2/token",
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    print("STATUS:", response.status_code, flush=True)
    print("RESPONSE:", response.text, flush=True) 

    if response.status_code != 200:
        print(f"Amazon Token Exchange Failed: {response.status_code} - {response.text}", flush=True)
        return JsonResponse({"error": response.text}, status=400)

    data = response.json()
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")


    # SAVE TO DATABASE
    user = None
    if user_id and str(user_id).lower() not in ["undefined", "null", "none"]:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            pass

    if not user and state:
        try:
            raw_uid = state.split(":")[0]
            if raw_uid and str(raw_uid).lower() not in ["undefined", "null", "none"]:
                user = User.objects.get(id=raw_uid)
        except Exception as e:
            print("Error parsing state user_id:", e)

    if not user and hasattr(request, 'user') and request.user.is_authenticated:
        user = request.user

    if not user:
        return JsonResponse({"error": "Invalid state or user account not found"}, status=400)    

    # Check connection limits before creating new account
    if not AmazonAccount.objects.filter(user=user, seller_central_id=seller_id).exists():
        from subscription.utils.channel_limit import check_user_channel_connection_limit
        is_allowed, max_allowed, current_count, err_msg = check_user_channel_connection_limit(user)
        if not is_allowed:
            return JsonResponse({"status": False, "error": err_msg, "message": err_msg}, status=403)

    account, created = AmazonAccount.objects.get_or_create(
        user=user,
        seller_central_id=seller_id,
        defaults={
            'marketplace_id': "A21TJRUUN4KGV",
            'region': "EU"
        }
    )

    account.app_client_id = AMAZON_CLIENT_ID
    account.app_client_secret = AMAZON_CLIENT_SECRET
    account.set_refresh_token(refresh_token)
    account.amazon_refresh_token = refresh_token
    account.save()

    if created:
        subscription = (
            UserSubscription.objects.filter(
                user=user,
                status="active",
                is_paid=True,
            )
            .select_related("plan")
            .first()
        )

        if not subscription or not subscription.plan:
            return JsonResponse(
                {"status": False, "message": "No active subscription found"}, status=403
            )

        days = subscription.plan.initial_sync_duration

        try:
            task_run_initial_amazon_sync.delay(
                account_id=account.id,
                days=days,
            )

        except Exception as e:
            print(f"FAILED TO DISPATCH CELERY INITIAL AMAZON SYNC: {account.seller_central_id} - {e}")

    return JsonResponse({
        "status": "success",
        "seller_id": seller_id,
        "is_new": created
    })


# perfect working upto 1 aug
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sync_reports(request):
    try:
        user = request.user
        if user.is_anonymous:
            from django.contrib.auth.models import User
            user = User.objects.first()

        accounts = AmazonAccount.objects.filter(user=user)

        if not accounts.exists():
            return JsonResponse({"status": "error", "message": "No Amazon accounts connected."}, status=400)

        total_saved = 0
        sync_details = []

        for account in accounts:
            manager = SPAPIManager(user=user, account=account)

            params = request.GET.dict()
            if not params.get('reportTypes') and not params.get('nextToken'):
                params['reportTypes'] = [
                    'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
                    'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_LAST_UPDATE_GENERAL',
                    'GET_SALES_AND_TRAFFIC_REPORT',  # ✅ FIXED
                ]

            # ⚠️ OPTIONAL: Only run via cron (not every API hit)
            # manager.new_create_report(...)

            manager.new_create_report(
                report_type="GET_SALES_AND_TRAFFIC_REPORT",
                start_date="2026-05-26T00:00:00Z",
                end_date="2026-06-30T23:59:59Z"
            )

            data = manager.get_reports(**params)

            if "errors" in data:
                sync_details.append({
                    "seller_id": account.seller_central_id,
                    "status": "error",
                    "errors": data["errors"]
                })
                continue

            reports = data.get("reports", [])
            account_saved_count = 0

            for report in reports:
                report_type = report.get("reportType")
                print("report_type  ====",report_type)

                Report.objects.update_or_create(
                    amazon_report_id=report.get("reportId"),
                    amazon_account=account,
                    defaults={
                        "user": user,
                        "report_type": report_type,
                        "processing_status": report.get("processingStatus"),
                        "created_time": parse_date(report.get("createdTime")),
                        "data_start_time": parse_date(report.get("dataStartTime")) if report.get("dataStartTime") else None,
                        "data_end_time": parse_date(report.get("dataEndTime")) if report.get("dataEndTime") else None,
                        "report_document_id": report.get("reportDocumentId"),
                        "raw_data": report
                    }
                )

                account_saved_count += 1

                if report.get("processingStatus") != "DONE":
                    continue

                doc_id = report.get("reportDocumentId")
                if not doc_id:
                    continue

                doc = manager.get_report_document(doc_id)
                url = doc.get("url")
                if not url:
                    continue

                response = requests.get(url)
                content = response.content.decode("utf-8")
                reader = csv.DictReader(StringIO(content))

                # =========================
                # ✅ BUSINESS REPORT
                # =========================

                # =========================
                # SAFE HELPERS
                # =========================
                def to_float(val):
                    try:
                        return float(val)
                    except:
                        return 0.0

                def to_int(val):
                    try:
                        return int(float(val))
                    except:
                        return 0


                # =========================
                # ✅ BUSINESS REPORT
                # =========================
                if report_type == "GET_SALES_AND_TRAFFIC_REPORT":
                    print(" get GET_SALES_AND_TRAFFIC_REPORT   start ==============")

                    for row in reader:
                        try:
                            parent_asin = row.get("parent-asin")
                            # child_asin = row.get("child-asin")
                            child_asin = row.get("child-asin") or ""
                            date_str = row.get("date")

                            if not parent_asin or not date_str:
                                continue

                            # ✅ FIX: convert date
                            from datetime import datetime
                            date = datetime.strptime(date_str, "%Y-%m-%d").date()

                            child_asin = row.get("child-asin") or ""

                            BusinessReport.objects.update_or_create(
                                amazon_account=account,
                                date=date,
                                parent_asin=parent_asin,
                                child_asin=child_asin,
                                defaults={
                                    "user": user,

                                    "ordered_product_sales": to_float(row.get("ordered-product-sales")),
                                    "ordered_product_sales_b2b": to_float(row.get("ordered-product-sales-b2b")),

                                    "units_ordered": to_int(row.get("units-ordered")),
                                    "units_ordered_b2b": to_int(row.get("units-ordered-b2b")),

                                    "total_order_items": to_int(row.get("total-order-items")),

                                    "sessions_total": to_int(row.get("sessions-total")),
                                    "sessions_total_b2b": to_int(row.get("sessions-total-b2b")),

                                    "page_views_total": to_int(row.get("page-views-total")),
                                    "page_views_total_b2b": to_int(row.get("page-views-total-b2b")),

                                    "unit_session_percentage": to_float(row.get("unit-session-percentage")),
                                    "unit_session_percentage_b2b": to_float(row.get("unit-session-percentage-b2b")),

                                    "buy_box_percentage": to_float(row.get("buy-box-percentage")),
                                    "buy_box_percentage_b2b": to_float(row.get("buy-box-percentage-b2b")),

                                    "units_refunded": to_int(row.get("units-refunded")),
                                    "refund_rate": to_float(row.get("refund-rate")),

                                    "orders_shipped": to_int(row.get("orders-shipped")),
                                    "shipped_product_sales": to_float(row.get("shipped-product-sales")),
                                }
                            )

                        except Exception as e:
                            print("Business report row error:", e)

                    continue  # ✅ skip order logic

                # if report_type == "GET_SALES_AND_TRAFFIC_REPORT":

                #     for row in reader:
                #         try:
                #             parent_asin = row.get("parent-asin")
                #             child_asin = row.get("child-asin")
                #             date = row.get("date")

                #             if not parent_asin or not date:
                #                 continue

                #             BusinessReport.objects.update_or_create(
                #                 amazon_account=account,
                #                 date=date,
                #                 parent_asin=parent_asin,
                #                 child_asin=child_asin,
                #                 defaults={
                #                     "user": user,
                #                     "ordered_product_sales": float(row.get("ordered-product-sales", 0)),
                #                     "units_ordered": int(float(row.get("units-ordered", 0))),
                #                     "total_order_items": int(float(row.get("total-order-items", 0))),
                #                     "sessions_total": int(float(row.get("sessions-total", 0))),
                #                     "sou  ": float(row.get("unit-session-percentage", 0)),
                #                     "buy_box_percentage": float(row.get("buy-box-percentage", 0)),
                #                 }
                #             )
                #         except Exception as e:
                #             print("Business report error:", e)

                #     continue  # 🔥 IMPORTANT: skip order logic

                # =========================
                # ✅ ORDER REPORT (EXISTING)
                # =========================
                items_to_update = []

                for row in reader:
                    sku = row.get("sku") or row.get("seller-sku")
                    if not sku:
                        continue

                    item = OrderItem.objects.filter(
                        seller_sku=sku,
                        order__amazon_account=account
                    ).order_by("-created_at").first()

                    if not item:
                        continue

                    try:
                        item_price = float(row.get("item-price", 0))
                        item_tax = float(row.get("item-tax", 0))
                        promo = abs(float(row.get("promotion-discount", 0)))

                        item.mrp = item_price + item_tax
                        item.selling_price = item_price
                        item.promotion_discount = promo
                        item.discount = item.mrp - item.selling_price
                        item.net_sales = item.selling_price - promo
                        item.total_amount = item.net_sales

                        items_to_update.append(item)

                    except Exception as e:
                        print("Order row error:", e)

                if items_to_update:
                    OrderItem.objects.bulk_update(
                        items_to_update,
                        [
                            "mrp",
                            "selling_price",
                            "promotion_discount",
                            "discount",
                            "net_sales",
                            "total_amount"
                        ]
                    )

            total_saved += account_saved_count

            sync_details.append({
                "seller_id": account.seller_central_id,
                "status": "success",
                "synced_count": account_saved_count
            })

        return JsonResponse({
            "status": "success",
            "message": f"Reports synced & processed for {len(sync_details)} accounts",
            "total_synced": total_saved,
            "details": sync_details
        })

    except Exception as e:
        import traceback
        return JsonResponse({
            "status": "error",
            "message": str(e),
            "trace": traceback.format_exc()
        }, status=500)



# new updated on 1 aug  if recured for report 
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def sync_reports(request):
#     try:
#         user = request.user
#         if user.is_anonymous:
#             from django.contrib.auth.models import User
#             user = User.objects.first()

#         accounts = AmazonAccount.objects.filter(user=user)

#         if not accounts.exists():
#             return JsonResponse({"status": "error", "message": "No Amazon accounts connected."}, status=400)

#         total_saved = 0
#         sync_details = []

#         for account in accounts:
#             manager = SPAPIManager(user=user, account=account)

#             params = request.GET.dict()
#             if not params.get('reportTypes') and not params.get('nextToken'):
#                 params['reportTypes'] = [
#                     'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
#                     'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_LAST_UPDATE_GENERAL',
#                     'GET_SALES_AND_TRAFFIC_REPORT',  # ✅ FIXED
#                 ]

#             # ⚠️ OPTIONAL: Only run via cron (not every API hit)
#             # manager.new_create_report(...)

#             manager.new_create_report(
#                 report_type="GET_SALES_AND_TRAFFIC_REPORT",
#                 start_date="2026-05-26T00:00:00Z",
#                 end_date="2026-06-30T23:59:59Z"
#             )

#             data = manager.get_reports(**params)

#             if "errors" in data:
#                 sync_details.append({
#                     "seller_id": account.seller_central_id,
#                     "status": "error",
#                     "errors": data["errors"]
#                 })
#                 continue

#             reports = data.get("reports", [])
#             account_saved_count = 0

#             for report in reports:
#                 report_type = report.get("reportType")
#                 print("report_type  ====",report_type)

#                 Report.objects.update_or_create(
#                     amazon_report_id=report.get("reportId"),
#                     amazon_account=account,
#                     defaults={
#                         "user": user,
#                         "report_type": report_type,
#                         "processing_status": report.get("processingStatus"),
#                         "created_time": parse_date(report.get("createdTime")),
#                         "data_start_time": parse_date(report.get("dataStartTime")) if report.get("dataStartTime") else None,
#                         "data_end_time": parse_date(report.get("dataEndTime")) if report.get("dataEndTime") else None,
#                         "report_document_id": report.get("reportDocumentId"),
#                         "raw_data": report
#                     }
#                 )

#                 account_saved_count += 1

#                 if report.get("processingStatus") != "DONE":
#                     continue

#                 doc_id = report.get("reportDocumentId")
#                 if not doc_id:
#                     continue

#                 doc = manager.get_report_document(doc_id)
#                 url = doc.get("url")
#                 if not url:
#                     continue

#                 response = requests.get(url)
#                 content = response.content.decode("utf-8")
#                 reader = csv.DictReader(StringIO(content))

#                 # =========================
#                 # ✅ BUSINESS REPORT
#                 # =========================

#                 # =========================
#                 # SAFE HELPERS
#                 # =========================
#                 def to_float(val):
#                     try:
#                         return float(val)
#                     except:
#                         return 0.0

#                 def to_int(val):
#                     try:
#                         return int(float(val))
#                     except:
#                         return 0


#                 # =========================
#                 # ✅ BUSINESS REPORT
#                 # =========================
#                 if report_type == "GET_SALES_AND_TRAFFIC_REPORT":
#                     print(" get GET_SALES_AND_TRAFFIC_REPORT   start ==============")

#                     for row in reader:
#                         try:
#                             parent_asin = row.get("parent-asin")
#                             # child_asin = row.get("child-asin")
#                             child_asin = row.get("child-asin") or ""
#                             date_str = row.get("date")

#                             if not parent_asin or not date_str:
#                                 continue

#                             # ✅ FIX: convert date
#                             from datetime import datetime
#                             date = datetime.strptime(date_str, "%Y-%m-%d").date()

#                             child_asin = row.get("child-asin") or ""

#                             BusinessReport.objects.update_or_create(
#                                 amazon_account=account,
#                                 date=date,
#                                 parent_asin=parent_asin,
#                                 child_asin=child_asin,
#                                 defaults={
#                                     "user": user,

#                                     "ordered_product_sales": to_float(row.get("ordered-product-sales")),
#                                     "ordered_product_sales_b2b": to_float(row.get("ordered-product-sales-b2b")),

#                                     "units_ordered": to_int(row.get("units-ordered")),
#                                     "units_ordered_b2b": to_int(row.get("units-ordered-b2b")),

#                                     "total_order_items": to_int(row.get("total-order-items")),

#                                     "sessions_total": to_int(row.get("sessions-total")),
#                                     "sessions_total_b2b": to_int(row.get("sessions-total-b2b")),

#                                     "page_views_total": to_int(row.get("page-views-total")),
#                                     "page_views_total_b2b": to_int(row.get("page-views-total-b2b")),

#                                     "unit_session_percentage": to_float(row.get("unit-session-percentage")),
#                                     "unit_session_percentage_b2b": to_float(row.get("unit-session-percentage-b2b")),

#                                     "buy_box_percentage": to_float(row.get("buy-box-percentage")),
#                                     "buy_box_percentage_b2b": to_float(row.get("buy-box-percentage-b2b")),

#                                     "units_refunded": to_int(row.get("units-refunded")),
#                                     "refund_rate": to_float(row.get("refund-rate")),

#                                     "orders_shipped": to_int(row.get("orders-shipped")),
#                                     "shipped_product_sales": to_float(row.get("shipped-product-sales")),
#                                 }
#                             )

#                         except Exception as e:
#                             print("Business report row error:", e)

#                     continue  # ✅ skip order logic

#                 # if report_type == "GET_SALES_AND_TRAFFIC_REPORT":

#                 #     for row in reader:
#                 #         try:
#                 #             parent_asin = row.get("parent-asin")
#                 #             child_asin = row.get("child-asin")
#                 #             date = row.get("date")

#                 #             if not parent_asin or not date:
#                 #                 continue

#                 #             BusinessReport.objects.update_or_create(
#                 #                 amazon_account=account,
#                 #                 date=date,
#                 #                 parent_asin=parent_asin,
#                 #                 child_asin=child_asin,
#                 #                 defaults={
#                 #                     "user": user,
#                 #                     "ordered_product_sales": float(row.get("ordered-product-sales", 0)),
#                 #                     "units_ordered": int(float(row.get("units-ordered", 0))),
#                 #                     "total_order_items": int(float(row.get("total-order-items", 0))),
#                 #                     "sessions_total": int(float(row.get("sessions-total", 0))),
#                 #                     "sou  ": float(row.get("unit-session-percentage", 0)),
#                 #                     "buy_box_percentage": float(row.get("buy-box-percentage", 0)),
#                 #                 }
#                 #             )
#                 #         except Exception as e:
#                 #             print("Business report error:", e)

#                 #     continue  # 🔥 IMPORTANT: skip order logic

#                 # =========================
#                 # ✅ ORDER REPORT (EXISTING)
#                 # =========================
#                 orders_to_recalculate = {}
#                 orders_currency = {}
#                 orders_status = {}
#                 orders_last_update = {}

#                 for row in reader:
#                     sku = row.get("sku") or row.get("seller-sku")
#                     order_id = row.get("amazon-order-id")
#                     if not sku or not order_id:
#                         continue

#                     purchase_date_str = row.get("purchase-date")
#                     purchase_date = parse_date(purchase_date_str) if purchase_date_str else timezone.now()

#                     # 1. Find or create Order
#                     order, created = Order.objects.get_or_create(
#                         amazon_order_id=order_id,
#                         amazon_account=account,
#                         defaults={
#                             "user": user,
#                             "purchase_date": purchase_date,
#                             "last_update_date": parse_date(row.get("last-updated-date")) if row.get("last-updated-date") else timezone.now(),
#                             "order_status": row.get("order-status") or "Pending",
#                             "fulfillment_channel": row.get("fulfillment-channel") or "",
#                             "currency_code": row.get("currency") or "INR",
#                             "city": row.get("ship-city") or "",
#                             "state": row.get("ship-state") or "",
#                             "country": row.get("ship-country") or "",
#                             "marketplace_id": account.marketplace_id,
#                             "total_amount": 0.00,
#                             "items_shipped": int(row.get("quantity", 0) or row.get("quantity-ordered", 0) or 0),
#                             "items_unshipped": 0,
#                         }
#                     )

#                     if not created:
#                         status = row.get("order-status")
#                         if status:
#                             order.order_status = status
#                         last_update_str = row.get("last-updated-date")
#                         if last_update_str:
#                             order.last_update_date = parse_date(last_update_str)
#                         order.save()

#                     # 2. Find or create OrderItem
#                     item = OrderItem.objects.filter(
#                         order=order,
#                         seller_sku=sku
#                     ).first()

#                     if not item:
#                         item = OrderItem.objects.create(
#                             order=order,
#                             order_item_id=row.get("order-item-id") or f"{order_id}_{sku}",
#                             seller_sku=sku,
#                             quantity_ordered=int(row.get("quantity", 0) or row.get("quantity-ordered", 0) or 1),
#                             product_name=row.get("product-name") or "",
#                         )

#                     # 3. Update OrderItem fields
#                     try:
#                         item_price = float(row.get("item-price", 0) or 0)
#                         item_tax = float(row.get("item-tax", 0) or 0)
#                         shipping_price = float(row.get("shipping-price", 0) or 0)
#                         promo = abs(float(row.get("promotion-discount", 0) or row.get("item-promotion-discount", 0) or 0))
#                         ship_promo = abs(float(row.get("ship-promotion-discount", 0) or 0))

#                         item.mrp = item_price + item_tax
#                         item.selling_price = item_price
#                         item.promotion_discount = promo
#                         item.discount = item.mrp - item.selling_price
#                         item.net_sales = item_price - promo
#                         item.total_amount = item.net_sales
#                         item.shipping_price = shipping_price
                        
#                         item.save()

#                         # Accumulate order totals
#                         row_net = item_price + shipping_price - promo - ship_promo
#                         if order_id not in orders_to_recalculate:
#                             orders_to_recalculate[order_id] = 0.0
#                         orders_to_recalculate[order_id] += row_net

#                         currency = row.get("currency")
#                         if currency:
#                             orders_currency[order_id] = currency

#                         status = row.get("order-status")
#                         if status:
#                             orders_status[order_id] = status

#                         last_update_str = row.get("last-updated-date")
#                         if last_update_str:
#                             orders_last_update[order_id] = parse_date(last_update_str)

#                     except Exception as e:
#                         print("Order row error:", e)

#                 # Update parent Order totals and statuses in DB
#                 for oid, amount in orders_to_recalculate.items():
#                     try:
#                         Order.objects.filter(
#                             amazon_order_id=oid,
#                             amazon_account=account
#                         ).update(
#                             total_amount=amount,
#                             currency_code=orders_currency.get(oid, "INR"),
#                             order_status=orders_status.get(oid, "Pending"),
#                             last_update_date=orders_last_update.get(oid, timezone.now())
#                         )
#                     except Exception as e:
#                         print(f"Error updating Order {oid} total amount:", e)

#             total_saved += account_saved_count

#             sync_details.append({
#                 "seller_id": account.seller_central_id,
#                 "status": "success",
#                 "synced_count": account_saved_count
#             })

#         return JsonResponse({
#             "status": "success",
#             "message": f"Reports synced & processed for {len(sync_details)} accounts",
#             "total_synced": total_saved,
#             "details": sync_details
#         })

#     except Exception as e:
#         import traceback
#         return JsonResponse({
#             "status": "error",
#             "message": str(e),
#             "trace": traceback.format_exc()
#         }, status=500)



# request for create rport 
from django.utils import timezone

# def create_business_reports():
#     print("Creating business reports")

#     accounts = AmazonAccount.objects.all()

#     for account in accounts:
#         manager = SPAPIManager(account=account, user=account.user)

#         end_date = timezone.now()
#         start_date = end_date - timedelta(days=1)

#         exists = ReportRequest.objects.filter(
#             amazon_account=account,
#             report_type="GET_SALES_AND_TRAFFIC_REPORT",
#             start_date__date=start_date.date()
#         ).exists()

#         if exists:
#             continue

#         res = manager.new_create_report(
#             report_type="GET_SALES_AND_TRAFFIC_REPORT",
#             start_date=start_date.isoformat(),
#             end_date=end_date.isoformat()
#         )

#         ReportRequest.objects.create(
#             amazon_account=account,
#             report_type="GET_SALES_AND_TRAFFIC_REPORT",
#             report_id=res.get("reportId"),
#             start_date=start_date,
#             end_date=end_date,
#             status="REQUESTED"
#         )


def create_business_reports():
    print("Creating business reports")

    accounts = AmazonAccount.objects.all()

    for account in accounts:
        manager = SPAPIManager(account=account, user=account.user)

        # ✅ KEEP AS DATETIME (NOT STRING)
        start_date = datetime(2026, 4, 1)
        end_date = datetime(2026, 4, 20)

        # ✅ NOW THIS WORKS
        exists = ReportRequest.objects.filter(
            amazon_account=account,
            report_type="GET_SALES_AND_TRAFFIC_REPORT",
            start_date__date=start_date.date()
        ).exists()

        if exists:
            continue

        # ✅ ONLY HERE convert to ISO
        res = manager.new_create_report(
            report_type="GET_SALES_AND_TRAFFIC_REPORT",
            start_date=start_date.isoformat() + "Z",
            end_date=end_date.isoformat() + "Z"
        )

        # ✅ SAVE DATETIME (NOT STRING)
        ReportRequest.objects.create(
            amazon_account=account,
            report_type="GET_SALES_AND_TRAFFIC_REPORT",
            report_id=res.get("reportId"),
            start_date=start_date,
            end_date=end_date,
            status="REQUESTED"
        )


def sync_new_business_reports():
    print(" Sync business reports started")

    requests_qs = ReportRequest.objects.filter(
        status__in=["REQUESTED", "IN_PROGRESS"]
    )

    for req in requests_qs:
        print(f"\n Checking reportId: {req.report_id}")

        manager = SPAPIManager(
            account=req.amazon_account,
            user=req.amazon_account.user
        )

        data = manager.get_reports(
            reportTypes=[req.report_type],
            processingStatuses=["IN_QUEUE", "IN_PROGRESS", "DONE"],
            pageSize=100
        )

        reports = data.get("reports", [])

        matched_report = next(
            (r for r in reports if r.get("reportId") == req.report_id),
            None
        )

        if not matched_report:
            print("⚠️ Report not found yet")
            continue

        status = matched_report.get("processingStatus")
        print(" Status:", status)

        if status in ["IN_QUEUE", "IN_PROGRESS"]:
            req.status = "IN_PROGRESS"
            req.save(update_fields=["status"])
            continue

        if status != "DONE":
            req.status = "FAILED"
            req.save(update_fields=["status"])
            continue

        # =========================
        # DOWNLOAD
        # =========================
        doc_id = matched_report.get("reportDocumentId")
        doc = manager.get_report_document(doc_id)
        url = doc.get("url")

        print("⬇️ Downloading report...")

        import gzip, json
        from io import BytesIO

        response = requests.get(url)

        if response.content[:2] == b'\x1f\x8b':
            print("🗜️ GZIP detected")
            content = gzip.GzipFile(fileobj=BytesIO(response.content)).read()
        else:
            content = response.content

        report_json = json.loads(content)

         #  Parse datetime safely
        raw_dt = report_json.get("reportSpecification", {}).get("dataStartTime")
        report_dt = parse_datetime(raw_dt) if raw_dt else None
        report_date = report_dt.date() if report_dt else None

        bulk = []

        # =========================
        #  1. DATE LEVEL DATA
        # # =========================
        # for item in report_json.get("salesAndTrafficByDate", []):
        #     try:
        #         date = item.get("date")

        #         sales = item.get("salesByDate", {})
        #         traffic = item.get("trafficByDate", {})

        #         bulk.append(
        #             BusinessReport(
        #                 amazon_account=req.amazon_account,
        #                 user=req.amazon_account.user,
        #                 date=date,

        #                 # NO ASIN at date level
        #                 parent_asin=None,
        #                 child_asin="",

        #                 # SALES
        #                 ordered_product_sales=sales.get("orderedProductSales", {}).get("amount", 0),
        #                 ordered_product_sales_b2b=sales.get("orderedProductSalesB2B", {}).get("amount", 0),

        #                 # UNITS
        #                 units_ordered=sales.get("unitsOrdered", 0),
        #                 units_ordered_b2b=sales.get("unitsOrderedB2B", 0),

        #                 # ORDERS
        #                 total_order_items=sales.get("totalOrderItems", 0),
        #                 total_order_items_b2b=sales.get("totalOrderItemsB2B", 0),

        #                 # TRAFFIC
        #                 sessions_total=traffic.get("sessions", 0),
        #                 sessions_total_b2b=traffic.get("sessionsB2B", 0),

        #                 page_views_total=traffic.get("pageViews", 0),
        #                 page_views_total_b2b=traffic.get("pageViewsB2B", 0),

        #                 # DEVICE SPLIT
        #                 sessions_mobile_app=traffic.get("mobileAppSessions", 0),
        #                 sessions_browser=traffic.get("browserSessions", 0),

        #                 page_views_mobile_app=traffic.get("mobileAppPageViews", 0),
        #                 page_views_browser=traffic.get("browserPageViews", 0),

        #                 # PERCENTAGES
        #                 session_percentage_total=traffic.get("sessionPercentage", 0),
        #                 page_views_percentage_total=traffic.get("pageViewsPercentage", 0),

        #                 # CONVERSION
        #                 unit_session_percentage=traffic.get("unitSessionPercentage", 0),
        #                 unit_session_percentage_b2b=traffic.get("unitSessionPercentageB2B", 0),

        #                 # BUY BOX
        #                 buy_box_percentage=traffic.get("buyBoxPercentage", 0),
        #                 buy_box_percentage_b2b=traffic.get("buyBoxPercentageB2B", 0),

        #                 # REFUNDS
        #                 units_refunded=sales.get("unitsRefunded", 0),
        #                 refund_rate=sales.get("refundRate", 0),

        #                 # SHIPPING
        #                 units_shipped=sales.get("unitsShipped", 0),
        #                 orders_shipped=sales.get("ordersShipped", 0),
        #                 shipped_product_sales=sales.get("shippedProductSales", {}).get("amount", 0),
        #             )
        #         )

        #     except Exception as e:
        #         print("⚠️ Date error:", e)

        # =========================
        # 🔥 2. ASIN LEVEL DATA
        # =========================
        for item in report_json.get("salesAndTrafficByAsin", []):
            try:
                parent_asin = item.get("parentAsin")

                sales = item.get("salesByAsin", {})
                traffic = item.get("trafficByAsin", {})

                parent_asin = item.get("parentAsin")
                child_asin = item.get("childAsin")

                # 🔥 FETCH TITLE FROM PRODUCT MAPPING
                mapping = ProductMapping.objects.filter(
                    Q(asin=child_asin) | Q(parent_asin=parent_asin),
                    account=req.amazon_account
                ).first()

                title = mapping.product_name if mapping else None

                bulk.append(
                    BusinessReport(
                        amazon_account=req.amazon_account,
                        user=req.amazon_account.user,
                        # date=report_json.get("reportSpecification", {}).get("dataStartTime"),
                        date = item.get("date"),
                        report_datetime=report_dt,
                        title=title,
                        parent_asin=parent_asin,
                        child_asin = item.get("childAsin", ""),

                        ordered_product_sales=sales.get("orderedProductSales", {}).get("amount", 0),
                        ordered_product_sales_b2b=sales.get("orderedProductSalesB2B", {}).get("amount", 0),

                        units_ordered=sales.get("unitsOrdered", 0),
                        units_ordered_b2b=sales.get("unitsOrderedB2B", 0),

                        total_order_items=sales.get("totalOrderItems", 0),
                        total_order_items_b2b=sales.get("totalOrderItemsB2B", 0),

                        sessions_total=traffic.get("sessions", 0),
                        sessions_total_b2b=traffic.get("sessionsB2B", 0),

                        page_views_total=traffic.get("pageViews", 0),
                        page_views_total_b2b=traffic.get("pageViewsB2B", 0),

                        sessions_mobile_app=traffic.get("mobileAppSessions", 0),
                        sessions_browser=traffic.get("browserSessions", 0),

                        page_views_mobile_app=traffic.get("mobileAppPageViews", 0),
                        page_views_browser=traffic.get("browserPageViews", 0),

                        unit_session_percentage=traffic.get("unitSessionPercentage", 0),
                        unit_session_percentage_b2b=traffic.get("unitSessionPercentageB2B", 0),

                        buy_box_percentage=traffic.get("buyBoxPercentage", 0),
                        buy_box_percentage_b2b=traffic.get("buyBoxPercentageB2B", 0),
                    )
                )

            except Exception as e:
                print("⚠️ ASIN error:", e)

        # =========================
        # SAVE
        # =========================
        if bulk:
            BusinessReport.objects.bulk_create(bulk, ignore_conflicts=True)
            print(f"✅ Saved {len(bulk)} records")
        else:
            print("⚠️ No valid data")

        req.status = "DONE"
        req.save(update_fields=["status"])

    print("✅ Sync completed")


def parse_date(date_str):
    # Handle ISO format with or without milliseconds
    try:
        # Try full format first
        if '.' in date_str:
            dt = datetime.strptime(date_str.split('.')[0], "%Y-%m-%dT%H:%M:%S")
        else:
            dt = datetime.strptime(date_str.replace('Z', ''), "%Y-%m-%dT%H:%M:%S")
        return timezone.make_aware(dt)
    except Exception:
        return timezone.now()


@api_view(['GET'])
@permission_classes([AllowAny])
def sync_finances(request):
    print("finace sync started")
    try:
        user = request.user
        if user.is_anonymous:
            from django.contrib.auth.models import User
            user = User.objects.first()

        accounts = AmazonAccount.objects.filter(user=user)
        if not accounts.exists():
            return JsonResponse({"status": "error", "message": "No Amazon accounts connected."}, status=400)

        import hashlib, json
        from decimal import Decimal
        from django.db import transaction

        total_saved = 0
        sync_details = []

        for account in accounts:
            manager = SPAPIManager(user=user, account=account)

            kwargs = {}
            if request.GET.get('PostedAfter'):
                kwargs['PostedAfter'] = request.GET.get('PostedAfter')
            if request.GET.get('PostedBefore'):
                kwargs['PostedBefore'] = request.GET.get('PostedBefore')

            account_saved = 0

            while True:
                objects_to_create = []

                response = manager.list_financial_events(**kwargs)

                if "errors" in response:
                    logger.error(f"Finance API error: {response}")
                    break

                payload = response.get("payload", {})
                events = payload.get("FinancialEvents", {})

                for category, event_list in events.items():
                    if not isinstance(event_list, list):
                        continue

                    event_type = category.replace("List", "")

                    for event in event_list:
                        event_str = json.dumps(event, sort_keys=True)
                        unique_hash = hashlib.sha256(event_str.encode()).hexdigest()

                        posted_date = event.get("PostedDate") or event.get("TransactionPostedDate")
                        if not posted_date:
                            continue

                        posted_date = parse_date(posted_date)
                        # order_id = event.get("AmazonOrderId") or event.get("OrderId")
                        order_id = event.get("AmazonOrderId") or event.get("OrderId") or None

                       
                        # =========================
                        # ✅ RETURN / REPLACEMENT LOGIC (ADD HERE)
                        # =========================

                        # Refund → Returned
                        if event_type == "RefundEvent":
                            for item in event.get("ShipmentItemAdjustmentList", []):
                                sku = item.get("SellerSKU")
                                item_id = item.get("OrderAdjustmentItemId")
                                qty = int(item.get("QuantityShipped", 0))

                                if sku and order_id:
                                    OrderItem.objects.filter(
                                        seller_sku=sku,
                                        order__amazon_order_id=order_id,
                                        order_item_id=item_id,
                                    ).update(
                                        quantity_returned=F('quantity_returned') + qty
                                    )

                        # Replacement → Replaced
                        if event_type == "ShipmentEvent":
                            if event.get("ShipmentType") == "Replacement":
                                for item in event.get("ShipmentItemList", []):
                                    sku = item.get("SellerSKU")
                                    qty = int(item.get("QuantityShipped", 0))

                                    if sku and order_id:
                                        OrderItem.objects.filter(
                                            seller_sku=sku,
                                            order__amazon_order_id=order_id
                                        ).update(
                                            quantity_replaced=F('quantity_replaced') + qty
                                        )             

                        # principal = tax = shipping = commission = fulfillment = other = Decimal("0")

                        principal = tax = commission = shipping=fulfillment = other = Decimal("0")
                        shipping_income = Decimal("0")
                        shipping_expense = Decimal("0")
                        promotion_discount = Decimal("0")
                        refund_amount = Decimal("0")

                        currency = event.get("CurrencyCode")
                        total_qty = 0


                        def process(items, charge_key, fee_key):
                            nonlocal principal, tax,shipping, shipping_income, shipping_expense
                            nonlocal commission, fulfillment, other, currency, total_qty

                            for item in items:
                                qty = (
                                    item.get("QuantityShipped")
                                    or item.get("QuantityOrdered")
                                    or item.get("Quantity")
                                    or 0
                                )
                                total_qty += int(qty)

                                # ===== CHARGES =====
                                for charge in item.get(charge_key, []):
                                    amt = Decimal(str(charge.get("ChargeAmount", {}).get("CurrencyAmount", 0)))
                                    ctype = charge.get("ChargeType")

                                    currency = currency or charge.get("ChargeAmount", {}).get("CurrencyCode")

                                    if ctype == "Principal":
                                        principal += amt

                                    elif ctype == "Tax":
                                        tax += amt

                                    elif ctype in ["ShippingCharge", "ShippingTax"]:
                                        shipping_income += amt

                                    elif "Shipping" in str(ctype):
                                        shipping_expense += abs(amt)

                                    # elif "Shipping" in str(ctype):
                                    #     shipping += amt    

                                    else:
                                        other += amt

                                # ===== FEES =====
                                for fee in item.get(fee_key, []):
                                    amt = Decimal(str(fee.get("FeeAmount", {}).get("CurrencyAmount", 0)))
                                    ftype = fee.get("FeeType")

                                    currency = currency or fee.get("FeeAmount", {}).get("CurrencyCode")

                                    if ftype == "Commission":
                                        commission += abs(amt)

                                    elif "Fulfillment" in str(ftype) or "FBA" in str(ftype):
                                        fulfillment += abs(amt)

                                    else:
                                        other += amt 

                        # AFTER process() calls
                        if "FeeList" in event:
                            for fee in event.get("FeeList", []):
                                amt = Decimal(str(fee.get("FeeAmount", {}).get("CurrencyAmount", 0)))
                                ftype = fee.get("FeeType")

                                currency = currency or fee.get("FeeAmount", {}).get("CurrencyCode")

                                if "Postage" in ftype:
                                    shipping_expense += abs(amt)
                                else:
                                    other += amt

                        # ===== PROMOTION =====
                        for promo in event.get("PromotionList", []):
                            amt = Decimal(str(promo.get("PromotionAmount", {}).get("CurrencyAmount", 0)))
                            promotion_discount += abs(amt)

                        for promo in event.get("PromotionAdjustmentList", []):
                            amt = Decimal(str(promo.get("PromotionAmount", {}).get("CurrencyAmount", 0)))
                            promotion_discount += abs(amt)                       
                                        

                        if "ShipmentItemList" in event:
                            process(event["ShipmentItemList"], "ItemChargeList", "ItemFeeList")

                        if "ShipmentItemAdjustmentList" in event:
                            process(event["ShipmentItemAdjustmentList"], "ItemChargeAdjustmentList", "ItemFeeAdjustmentList")

                        if event_type == "RefundEvent":
                            refund_amount = abs(principal + tax)    

                        if event_type in ["GuaranteeClaimEvent", "ChargebackEvent"]:
                            for item in event.get("ShipmentItemList", []):
                                sku = item.get("SellerSKU")

                                claim_amt = Decimal("0")
                                for charge in item.get("ItemChargeList", []):
                                    claim_amt += Decimal(str(charge.get("ChargeAmount", {}).get("CurrencyAmount", 0)))

                                OrderItem.objects.filter(
                                    seller_sku=sku,
                                    order__amazon_order_id=order_id
                                ).update(
                                    quantity_claimed=F('quantity_claimed') + 1,
                                    total_claimed_amount=F('total_claimed_amount') + abs(claim_amt),
                                    claim_type=event_type
                                )    

                   
                        # total_amount = principal + tax + shipping - commission - fulfillment + other
                        

                        for item in event.get("ShipmentItemList", []) + event.get("ShipmentItemAdjustmentList", []):
                            sku = item.get("SellerSKU")
                            item_id = item.get("OrderItemId") or item.get("OrderAdjustmentItemId")

                            if sku and order_id:
                                OrderItem.objects.filter(
                                    seller_sku=sku,
                                    order__amazon_order_id=order_id,
                                    order_item_id=item_id
                                ).update(
                                    commission_fee=F('commission_fee') + commission,
                                    fulfillment_fee=F('fulfillment_fee') + fulfillment,
                                    other_fee=F('other_fee') + other,
                                    shipping_income=F('shipping_income') + shipping_income,
                                    shipping_expense=F('shipping_expense') + shipping_expense,
                                    promotion_discount=F('promotion_discount') + promotion_discount,
                                    refund_amount=F('refund_amount') + refund_amount,
                                )


                        total_amount = (
                            principal
                            + tax
                            + shipping_income
                            - shipping_expense
                            - commission
                            - fulfillment
                            - promotion_discount
                            + other
                        )   

                        event_group = classify_event(event_type)

                        objects_to_create.append(
                            FinancialEvent(
                                user=user,
                                amazon_account=account,
                                amazon_order_id=order_id,
                                event_type=event_type,
                                posted_date=posted_date,
                                principal=principal,
                                tax=tax,
                                shipping_fee=shipping_expense,
                                commission_fee=commission,
                                fulfillment_fee=fulfillment,
                                other_fee=other,
                                total_amount=total_amount,
                                currency_code=currency or "INR",
                                raw_data=event,
                                unique_hash=unique_hash,
                                event_group =event_group,
                                quantity=total_qty,
                                shipping_income=shipping_income,   
                                promotion_discount =promotion_discount,
                                refund_amount =refund_amount,     
                            )
                        )

                created = FinancialEvent.objects.bulk_create(
                    objects_to_create,
                    ignore_conflicts=True
                )

                account_saved += len(created)

                next_token = payload.get("NextToken")
                if next_token:
                    kwargs = {"NextToken": next_token}
                else:
                    break
            total_saved += account_saved
            sync_details.append({
                "seller_id": account.seller_central_id,
                "status": "success",
                "synced_count": account_saved
            })

        return JsonResponse({
            "status": True,
            "message": "Financial events synced successfully",
            "total_synced": total_saved,
            "details": sync_details
        })

    except Exception as e:
        import traceback
        return JsonResponse({
            "status": False,
            "error": str(e),
            "trace": traceback.format_exc()
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def sync_orders(request):
    print("Order sync started")

    user = request.user
    if user.is_anonymous:
        from django.contrib.auth.models import User
        user = User.objects.first()

    accounts = AmazonAccount.objects.filter(user=user)
    if not accounts.exists():
        return JsonResponse({"status": "error", "message": "No Amazon accounts connected."}, status=400)

    total_saved = 0
    sync_details = []

    for account in accounts:
        manager = SPAPIManager(user=user, account=account)
        
        # Allow seller to specify dates
        kwargs = {"MaxResultsPerPage": 100}
        if request.GET.get('CreatedAfter'): kwargs['CreatedAfter'] = request.GET.get('CreatedAfter')
        if request.GET.get('CreatedBefore'): kwargs['CreatedBefore'] = request.GET.get('CreatedBefore')
        
        # PAGINATION LOOP
        account_saved_count = 0
        while True:
            data = manager.fetch_orders(**kwargs) 

            if "errors" in data:
                sync_details.append({"seller_id": account.seller_central_id, "status": "error", "errors": data["errors"]})
                break

            payload = data.get("payload", {})
            orders_list = payload.get("Orders", [])
            page_orders_data = []

            # with transaction.atomic():
            sync_items = request.GET.get("sync_items") == "true"

            for o in orders_list:
                amazon_order_id = o.get("AmazonOrderId")
                total_info = o.get("OrderTotal", {})
                last_update = parse_date(o.get("LastUpdateDate"))

                order = Order.objects.filter(
                    amazon_account=account,
                    amazon_order_id=amazon_order_id,
                    user=user
                ).first()

                should_sync_items = False

                #  NEW
                # FIXED new order block
                if not order:
                    order = Order.objects.create(
                        amazon_account=account,
                        amazon_order_id=amazon_order_id,
                        user=user,
                        purchase_date=parse_date(o.get("PurchaseDate")),
                        last_update_date=last_update,
                        order_status=o.get("OrderStatus"),
                        total_amount=total_info.get("Amount", 0),
                        currency_code=total_info.get("CurrencyCode"),
                        buyer_name=o.get("BuyerInfo", {}).get("BuyerName", "Unknown"),
                        city=o.get("ShippingAddress", {}).get("City", ""),
                        state=o.get("ShippingAddress", {}).get("StateOrRegion", ""),
                        country=o.get("ShippingAddress", {}).get("CountryCode", ""),
                        fulfillment_channel=o.get("FulfillmentChannel", ""),
                        items_shipped=o.get("NumberOfItemsShipped", 0),
                        items_unshipped=o.get("NumberOfItemsUnshipped", 0),
                        marketplace_id=o.get("MarketplaceId")
                    )
                    should_sync_items = True
                    account_saved_count += 1

                # FIXED update condition
                elif not order.last_update_date or order.last_update_date < last_update:
                    order.order_status = o.get("OrderStatus")
                    order.total_amount = total_info.get("Amount", 0)
                    order.last_update_date = last_update
                    order.save()

                    should_sync_items = True
                    account_saved_count += 1

                else:
                    if sync_items and not OrderItem.objects.filter(order=order).exists():
                        should_sync_items = True
                    else:
                        continue

                #  MOVE ITEM SYNC HERE
                if sync_items and should_sync_items:
                    logger.info(f"Order Items fetch start")
                    try:
                        items_response = manager.get_order_items(amazon_order_id)
                        
                        payload_items = items_response.get("payload", {})

                        items = payload_items.get("OrderItems") or payload_items.get("Items") or []

                        logger.info(f"Order Items API response: {items_response}")

                        skus = [i.get("SellerSKU") for i in items if i.get("SellerSKU")]

                        mappings = {
                            m.seller_sku: m
                            for m in ProductMapping.objects.filter(seller_sku__in=skus)
                        }

                        

                        for item in items:
                            sku = item.get("SellerSKU")
                            asin = item.get("ASIN")
                            marketplace_id = o.get("MarketplaceId")

                            image_url = None
                            brand = None
                            parent_asin = None
                            mapping = mappings.get(sku)

                            #  PRIORITY 1: USE MAPPING DATA
                            if mapping:
                                print(f"not mapping found ")
                                image_url = getattr(mapping, "image_url", None)
                                brand = mapping.brand

                            #  PRIORITY 2: FALLBACK TO CATALOG ONLY IF IMAGE MISSING
                            if (not image_url) and asin and marketplace_id:
                                try:
                                    catalog_response = safe_catalog_call(manager, asin, marketplace_id)

                                    logger.warning(f"Catalog fallback triggered for SKU={sku}, ASIN={asin}")

                                    attributes = catalog_response.get("attributes", {})
                                    images_data = catalog_response.get("images", [])
                                    relationships = catalog_response.get("relationships", [])

                                    # ✅ FIXED RELATIONSHIP LOGIC
                                    for rel_group in relationships:
                                        for rel in rel_group.get("relationships", []):
                                            if rel.get("type") == "VARIATION":
                                                parent_list = rel.get("parentAsins", [])
                                                if parent_list:
                                                    parent_asin = parent_list[0]
                                                    break
                                        if parent_asin:
                                            break


                                    if "brand" in attributes and not brand:
                                        brand = attributes["brand"][0].get("value")

                                    for img_group in images_data:
                                        if img_group.get("marketplaceId") == marketplace_id:
                                            images_list = img_group.get("images", [])
                                            if images_list:
                                                image_url = images_list[0].get("link")
                                                break

                                except Exception as e:
                                    print(f"Catalog API FAILED for {asin}: {e}")

                            #  FIX QUEUE (only when no mapping exists)
                            if not mapping and asin and marketplace_id:
                                print(f"MissingCatalogQueue start to create ")
                                MissingCatalogQueue.objects.get_or_create(
                                    seller_sku=sku,
                                    account=account,
                                    defaults={
                                        "asin": asin,
                                        "parent_asin":parent_asin,
                                        "marketplace_id": marketplace_id,
                                        "image_url":image_url,
                                        "processed": False,
                                       
                                    }
                                )

                            #  PREVENT NULL OVERWRITE
                            defaults = {
                                "seller_sku": sku,
                                "asin": asin,
                                "parent_asin":parent_asin,
                                "title": item.get("Title"),
                                "quantity_ordered": item.get("QuantityOrdered", 0),
                                "quantity_shipped": item.get("QuantityShipped", 0),
                                "item_price": item.get("ItemPrice", {}).get("Amount", 0),
                                "item_tax": item.get("ItemTax", {}).get("Amount", 0),
                                "shipping_price": item.get("ShippingPrice", {}).get("Amount", 0),
                                "parent_sku": mapping.parent_sku if mapping else None,
                                "product_name": mapping.product_name if mapping else item.get("Title"),
                                "brand": mapping.brand if mapping else brand,
                                "cost_price": mapping.cost_price if mapping else 0,
                                "net_sales": item.get("ItemPrice", {}).get("Amount", 0),
                                "promotion_discount": item.get("PromotionDiscount", {}).get("Amount", 0),
                            }

                            #  only update image if exists
                            if image_url:
                                defaults["image_url"] = image_url

                            OrderItem.objects.update_or_create(
                                order=order,
                                order_item_id=item.get("OrderItemId") or f"{amazon_order_id}_{sku}",
                                defaults=defaults
                            )

                            logger.info(f"Item saved: SKU={sku}, IMAGE={image_url}")

                

                    except Exception as e:
                        print(f"Item sync failed for order {amazon_order_id}: {str(e)}")
                        traceback.print_exc()
                        
                        
                        #  update order item price have inpending status
                if order and order.order_status and order.order_status.upper() == "PENDING":
                    try:
                        from datetime import timedelta
                        last_updated_after = (order.last_update_date or order.purchase_date - timedelta(minutes=5)).strftime("%Y-%m-%dT%H:%M:%SZ")
                        p_params = {
                            "lastUpdatedAfter": last_updated_after,
                            "marketplaceIds": [account.marketplace_id]
                        }
                        p_response = manager.search_orders_v2026(**p_params)
                        p_orders_list = p_response.get("orders") or []
                        for po in p_orders_list:
                            if po.get("orderId") == amazon_order_id:
                                total_amt = 0.0
                                order_items_list = po.get("orderItems") or []
                                for item_data in order_items_list:
                                    unit_price = float(item_data.get("product", {}).get("price", {}).get("unitPrice", {}).get("amount", 0) or 0)
                                    qty = int(item_data.get("quantityOrdered", 0) or 0)
                                    total_amt += unit_price * qty
                                
                                order.new_total_amount = total_amt
                                order.raw_data = po
                                order.save(update_fields=['new_total_amount', 'raw_data'])
                                
                                for item_data in order_items_list:
                                    sku = item_data.get("product", {}).get("sellerSku")
                                    order_item_id = item_data.get("orderItemId")
                                    
                                    order_item = None
                                    if order_item_id:
                                        order_item = OrderItem.objects.filter(order=order, order_item_id=order_item_id).first()
                                    if not order_item and sku:
                                        order_item = OrderItem.objects.filter(order=order, seller_sku=sku).first()
                                        
                                    if order_item:
                                        unit_price = float(item_data.get("product", {}).get("price", {}).get("unitPrice", {}).get("amount", 0) or 0)
                                        order_item.new_item_price = unit_price
                                        order_item.raw_data = item_data
                                        order_item.save(update_fields=['new_item_price', 'raw_data'])
                                break
                    except Exception as pe:
                        logger.error(f"Failed to sync pending order details for {amazon_order_id}: {str(pe)}")        

           

            # PAGINATION
            next_token = payload.get("NextToken")
            if next_token:
                kwargs = {"NextToken": next_token}
            else:
                break

        # UPDATE LAST SYNC TIME
        account.last_synced_at = timezone.now()
        account.save()

        total_saved += account_saved_count
        sync_details.append({
            "seller_id": account.seller_central_id,
            "status": "success",
            "synced_count": account_saved_count
        })

    return JsonResponse({
        "status": "success",
        "message": f"Orders synced for {len(sync_details)} accounts",
        "total_synced": total_saved,
        "details": sync_details
    })



@login_required
def list_db_orders(request):
    """Returns all orders stored in the local database for this user"""
    orders = Order.objects.filter(user=request.user).order_by('-purchase_date')
    data = []
    for order in orders:
        data.append({
            "order_id": order.amazon_order_id,
            "status": order.order_status,
            "date": order.purchase_date.strftime("%Y-%m-%d %H:%M"),
            "total": f"{order.total_amount} {order.currency_code}" if order.total_amount else "N/A",
            "buyer": order.buyer_name,
            "city": order.city
        })
    return JsonResponse({"status": "success", "count": len(data), "orders": data})

@login_required
def list_db_order_items(request, order_id):
    """Returns all items for a specific order stored in the local database"""
    try:
        order = Order.objects.get(amazon_order_id=order_id, user=request.user)
        items = order.items.all()
        data = [{
            "item_id": i.order_item_id,
            "sku": i.seller_sku,
            "title": i.title,
            "qty": i.quantity_ordered,
            "price": float(i.item_price)
        } for i in items]
        return JsonResponse({"status": "success", "items": data})
    except Order.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Order not found"}, status=404)
    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def by_token_list_db_order_items(request, order_id):
    """Returns all items for a specific order stored in the local database"""
    try:
        order = Order.objects.get(amazon_order_id=order_id, user=request.user)
        items = order.items.all()
        data = [{
            "item_id": i.order_item_id,
            "sku": i.seller_sku,
            "title": i.title,
            "qty": i.quantity_ordered,
            "price": float(i.item_price)
        } for i in items]
        return JsonResponse({"status": "success", "items": data})
    except Order.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Order not found"}, status=404)    


# =========================================
# 3. DATA API VIEWS
# =========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    """
    Directly calls the SP-API GetOrders and returns the raw response.
    Supports flexible marketplace parameter names in the URL.
    Example: /api/amazon/orders/?marketplace_id=A21TJRUUN4KGV
    """
    try:
        manager = SPAPIManager(user=request.user)
        
        # Capture all parameters
        params = request.GET.dict()
        
        # Add aliases for marketplace_id to ensure it's captured correctly from the URL
        if 'marketplace_id' in params:
            params['MarketplaceIds'] = params.pop('marketplace_id')
        elif 'marketplaceId' in params:
            params['MarketplaceIds'] = params.pop('marketplaceId')
            
        response = manager.get_orders(**params)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_orders(request):
    """
    Calls the SP-API SearchOrders (v2026-01-01) and returns the raw response.
    Example: /api/amazon/search-orders/?marketplaceIds=A21TJRUUN4KGV&createdAfter=2026-07-01T00:00:00Z
    """
    try:
        manager = SPAPIManager(user=request.user)
        
        # Capture all parameters
        params = {}
        for key in ['createdAfter', 'createdBefore', 'lastUpdatedAfter', 'lastUpdatedBefore', 'maxResultsPerPage', 'paginationToken']:
            if key in request.GET:
                params[key] = request.GET[key]
                
        # List parameters
        for key in ['marketplaceIds', 'fulfillmentStatuses', 'fulfilledBy', 'includedData']:
            val_list = request.GET.getlist(key)
            if not val_list and key in request.GET:
                val_list = [v.strip() for v in request.GET[key].split(',') if v.strip()]
            if val_list:
                params[key] = val_list
                
        # Add aliases for marketplaceIds
        if 'marketplace_id' in request.GET and 'marketplaceIds' not in params:
            params['marketplaceIds'] = [request.GET['marketplace_id']]
        elif 'marketplaceId' in request.GET and 'marketplaceIds' not in params:
            params['marketplaceIds'] = [request.GET['marketplaceId']]
            
        response = manager.search_orders_v2026(**params)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def new_search_orders_update(request):
    """
    Calls the SP-API SearchOrders (v2026-01-01) and returns the raw response.
    Example: /api/amazon/search-orders/?marketplaceIds=A21TJRUUN4KGV&createdAfter=2026-07-01T00:00:00Z
    """
    try:
        manager = SPAPIManager(user=request.user)
        
        # Capture all parameters
        params = {}
        for key in ['createdAfter', 'createdBefore', 'lastUpdatedAfter', 'lastUpdatedBefore', 'maxResultsPerPage', 'paginationToken']:
            if key in request.GET:
                params[key] = request.GET[key]
                
        # List parameters
        for key in ['marketplaceIds', 'fulfillmentStatuses', 'fulfilledBy', 'includedData']:
            val_list = request.GET.getlist(key)
            if not val_list and key in request.GET:
                val_list = [v.strip() for v in request.GET[key].split(',') if v.strip()]
            if val_list:
                params[key] = val_list
                
        # Add aliases for marketplaceIds
        if 'marketplace_id' in request.GET and 'marketplaceIds' not in params:
            params['marketplaceIds'] = [request.GET['marketplace_id']]
        elif 'marketplaceId' in request.GET and 'marketplaceIds' not in params:
            params['marketplaceIds'] = [request.GET['marketplaceId']]
            
        response = manager.search_orders_v2026(**params)
        
        # Sync logic for existing pending orders
        orders_list = response.get("orders") or []
        for o in orders_list:
            order_id = o.get("orderId")
            if not order_id:
                continue
            
            # Find the order in local database
            order = Order.objects.filter(amazon_order_id=order_id, amazon_account=manager.account).first()
            if order and order.order_status and order.order_status.upper() == "PENDING":
                # Calculate new_total_amount as sum of (unit price * quantity)
                total_amt = 0.0
                order_items_list = o.get("orderItems") or []
                for item_data in order_items_list:
                    unit_price = float(item_data.get("product", {}).get("price", {}).get("unitPrice", {}).get("amount", 0) or 0)
                    qty = int(item_data.get("quantityOrdered", 0) or 0)
                    total_amt += unit_price * qty
                
                # Update only new_total_amount and raw_data
                order.new_total_amount = total_amt
                order.raw_data = o
                order.save(update_fields=['new_total_amount', 'raw_data'])
                
                # Update corresponding existing OrderItems
                for item_data in order_items_list:
                    sku = item_data.get("product", {}).get("sellerSku")
                    order_item_id = item_data.get("orderItemId")
                    
                    order_item = None
                    if order_item_id:
                        order_item = OrderItem.objects.filter(order=order, order_item_id=order_item_id).first()
                    if not order_item and sku:
                        order_item = OrderItem.objects.filter(order=order, seller_sku=sku).first()
                        
                    if order_item:
                        unit_price = float(item_data.get("product", {}).get("price", {}).get("unitPrice", {}).get("amount", 0) or 0)
                        order_item.new_item_price = unit_price
                        order_item.raw_data = item_data
                        order_item.save(update_fields=['new_item_price', 'raw_data'])
                        
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)





@login_required
def get_order_details(request, order_id):
    """
    Fetches details for a single Amazon Order ID.
    Example: /api/amazon/orders/404-1274605-5615510/
    """
    try:
        manager = SPAPIManager(user=request.user)
        response = manager.get_order(order_id)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def get_order_buyer_info(request, order_id):
    """
    Fetches buyer information for a single Amazon Order ID.
    Example: /api/amazon/orders/404-1274605-5615510/buyerInfo/
    """
    try:
        manager = SPAPIManager(user=request.user)
        response = manager.get_order_buyer_info(order_id)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def get_order_address(request, order_id):
    """
    Fetches shipping address for a single Amazon Order ID.
    Example: /api/amazon/orders/404-1274605-5615510/address/
    """
    try:
        manager = SPAPIManager(user=request.user)
        response = manager.get_order_address(order_id)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def get_order_items(request, order_id):
    """
    Fetches detailed order item information for a single Amazon Order ID.
    Supports NextToken for pagination.
    Example: /api/amazon/orders/404-1274605-5615510/orderItems/
    """
    try:
        manager = SPAPIManager(user=request.user)
        next_token = request.GET.get('NextToken')
        response = manager.get_order_items(order_id, next_token=next_token)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])    
def by_token_get_order_items(request, order_id):
    """
    Fetches detailed order item information for a single Amazon Order ID.
    Supports NextToken for pagination.
    Example: /api/amazon/orders/404-1274605-5615510/orderItems/
    """
    try:
        manager = SPAPIManager(user=request.user)
        next_token = request.GET.get('NextToken')
        response = manager.get_order_items(order_id, next_token=next_token)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)    

# @login_required
def get_order_finances(request, order_id):
    """
    Fetches all financial events for a single Amazon Order ID.
    Supports MaxResultsPerPage and NextToken.
    Example: /api/amazon/orders/404-1274605-5615510/finances/
    """
    try:
        manager = SPAPIManager(user=request.user)
        max_results = request.GET.get('MaxResultsPerPage', 100)
        next_token = request.GET.get('NextToken')
        response = manager.get_order_financial_events(order_id, max_results=max_results, next_token=next_token)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def list_financial_events(request):
    """
    Returns global financial events for a specified date range.
    Example: /api/amazon/finances/?PostedAfter=2024-01-01T00:00:00Z
    """
    try:
        manager = SPAPIManager(user=request.user)
        params = request.GET.dict()
        response = manager.list_financial_events(**params)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def get_reports(request):
    """
    Returns report details for the reports that match the filters.
    Example: /api/amazon/reports/?reportTypes=GET_FLAT_FILE_OPEN_LISTINGS_DATA
    """
    try:
        manager = SPAPIManager(user=request.user)
        params = request.GET.dict()
        response = manager.get_reports(**params)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def get_report(request, report_id):
    """
    Fetches details for a single Amazon Report ID.
    Example: /api/amazon/report/12345/
    """
    try:
        manager = SPAPIManager(user=request.user)
        response = manager.get_report(report_id)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)



# @login_required
def get_report_document(request, document_id):
    """
    Returns the information required for retrieving a report document's contents.
    Example: /api/amazon/report-document/amzn1.spdoc.12345/
    """
    try:
        manager = SPAPIManager(user=request.user)
        response = manager.get_report_document(document_id)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
def create_report(request):
    """
    Creates a new report on Amazon.
    Example: /api/amazon/create-report/?reportType=GET_MERCHANTS_LISTINGS_DATA
    """
    try:
        user = request.user
        manager = SPAPIManager(user=user)
        
        report_type = request.GET.get('reportType')
        if not report_type:
            return JsonResponse({'status': 'error', 'message': 'reportType is required'}, status=400)
            
        kwargs = request.GET.dict()
        if 'marketplaceIds' in kwargs:
            kwargs['marketplaceIds'] = kwargs['marketplaceIds'].split(',')
            
        response = manager.create_report(report_type, **kwargs)
        
        if 'reportId' in response:
            Report.objects.create(
                user=user,
                amazon_account=manager.account,
                amazon_report_id=response['reportId'],
                report_type=report_type,
                processing_status='SUBMITTED',
                created_time=datetime.utcnow(),
                raw_data=response
            )
            
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profit_card(request):
    """
    Focused API for the main Profit summary card: Profit, Margin, ROI.
    """
    user = get_effective_user(request.user)
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    if start_date_str:
        start_date = timezone.make_aware(datetime.strptime(start_date_str, '%Y-%m-%d'))
    else:
        start_date = timezone.now() - timedelta(days=30)
        
    if end_date_str:
        end_date = timezone.make_aware(datetime.strptime(end_date_str, '%Y-%m-%d'))
    else:
        end_date = timezone.now()

    # Financial logic
    finances_qs = FinancialEvent.objects.filter(user=user, posted_date__range=(start_date, end_date))
    orders_qs = Order.objects.filter(user=user, purchase_date__range=(start_date, end_date))

    total_sales = orders_qs.aggregate(val=Sum('total_amount'))['val'] or 0
    total_net = finances_qs.aggregate(val=Sum('total_amount'))['val'] or 0
    
    net_profit = float(total_net)
    margin = (net_profit / float(total_sales) * 100) if total_sales > 0 else 0
    roi = (margin * 2.34) # Simplified ROI logic based on typical margins

    return JsonResponse({
        "status": "success",
        "data": {
            "profit": round(net_profit, 2),
            "margin": f"{round(margin)}%",
            "roi": f"{round(roi)}%"
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_product_analytics(request):
    """
    Groups data by SKU for the product-level profit table.
    """
    user = get_effective_user(request.user)
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    if start_date_str:
        start_date = timezone.make_aware(datetime.strptime(start_date_str, '%Y-%m-%d'))
    else:
        start_date = timezone.now() - timedelta(days=30)
        
    if end_date_str:
        end_date = timezone.make_aware(datetime.strptime(end_date_str, '%Y-%m-%d'))
    else:
        end_date = timezone.now()

    # Base filtering
    from .models import OrderItem
    items_qs = OrderItem.objects.filter(order__user=user, order__purchase_date__range=(start_date, end_date))
    
    # Aggregate by SKU
    skus = items_qs.values('seller_sku', 'title').annotate(
        net_qty=Sum('quantity_shipped'),
        gross_sales=Sum('item_price')
    )

    data = []
    for s in skus:
        sku = s['seller_sku']
        # For simplicity, we'll estimate fees as 15% of gross sales 
        # (In a real app, you'd match these with FinancialEvents linked to this order/item)
        gross = float(s['gross_sales'] or 0)
        qty = s['net_qty'] or 0
        mp_fees = -(gross * 0.15)
        shipping = -(qty * 45) # Estimate 45 per shipment
        ad_spend = -(gross * 0.08) # Estimate 8% ad spend
        
        profit = gross + mp_fees + shipping + ad_spend
        profit_pct = (profit / gross * 100) if gross > 0 else 0
        
        data.append({
            "sku": sku,
            "title": s['title'],
            "net_qty": qty,
            "net_sales": round(gross, 2),
            "mp_fees": round(mp_fees, 2),
            "shipping": round(shipping, 2),
            "ad_spend": round(ad_spend, 2),
            "profit": round(profit, 2),
            "profit_percent": f"{round(profit_pct)}%"
        })

    return JsonResponse({"status": "success", "products": data})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_full_dashboard(request):

    print(f"DEBUG: get_full_dashboard called for user {request.user}")
    user = get_effective_user(request.user)

    # ---------------- INPUT ----------------
    data_source_raw = getattr(request, 'data', None) or (request.POST if request.method == 'POST' else request.GET)
    data_source = {}

    if data_source_raw:
        if hasattr(data_source_raw, 'dict'):
            data_source.update(data_source_raw.dict())
        else:
            data_source.update(data_source_raw)

    if not data_source:
        try:
            import json
            raw_body = getattr(request, '_body', None) or getattr(getattr(request, '_request', None), '_body', None)
            if raw_body:
                body_data = json.loads(raw_body)
                if isinstance(body_data, dict):
                    data_source.update(body_data)
        except Exception:
            pass

    search_data = {}
    search_data.update(data_source)

    if isinstance(search_data.get('filters'), dict):
        search_data.update(search_data.get('filters'))

    def find_key(keys):
        for k in keys:
            val = search_data.get(k)
            if isinstance(val, list) and val:
                val = val[0]
            if val:
                return str(val)
        return None

    # start_date = datetime.strptime(find_key(['fromDate'])[:10], '%Y-%m-%d')
    # end_date = datetime.strptime(find_key(['toDate'])[:10], '%Y-%m-%d')
    # end_date = end_date.replace(hour=23, minute=59, second=59)
    
    from_date_str = find_key(['fromDate'])
    to_date_str = find_key(['toDate'])

    # try:
    #     start_date = datetime.strptime(from_date_str[:10], '%Y-%m-%d') if from_date_str else (timezone.now() - timedelta(days=30))
    #     end_date = datetime.strptime(to_date_str[:10], '%Y-%m-%d') if to_date_str else timezone.now()
    # except Exception:
    #     start_date = timezone.now() - timedelta(days=30)
    #     end_date = timezone.now()

    # end_date = end_date.replace(hour=23, minute=59, second=59)


    # # ---------------- DATA ----------------
    # orders_qs = Order.objects.filter(user=user, purchase_date__range=(start_date, end_date))
    
    from zoneinfo import ZoneInfo

    IST = ZoneInfo("Asia/Kolkata")
    UTC = ZoneInfo("UTC")

    # Parse the user's selected calendar day (assumed IST, matching Seller Central)
    from_date_ist = datetime.strptime(from_date_str[:10], '%Y-%m-%d').replace(
        hour=0, minute=0, second=0, tzinfo=IST
    )
    to_date_ist = datetime.strptime(to_date_str[:10], '%Y-%m-%d').replace(
        hour=23, minute=59, second=59, tzinfo=IST
    )

    # Convert to UTC for querying, since purchase_date is stored in UTC
    start_date = from_date_ist.astimezone(UTC)
    end_date = to_date_ist.astimezone(UTC)

    orders_qs = Order.objects.filter(user=user, purchase_date__range=(start_date, end_date))

    finances_qs = FinancialEvent.objects.filter(user=user, posted_date__range=(start_date, end_date))

    # ---------------- ORDERS ----------------
    gross_sales = float(orders_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
    gross_qty = orders_qs.count()

    # items_data = orders_qs.aggregate(
    #     total_items=Sum(F('items_shipped') + F('items_unshipped'))
    # )
    # gross_item_qty = int(items_data['total_items'] or 0)

    # ---------------- ORDER ITEM QTY ----------------
    order_items_qs = OrderItem.objects.filter(
        order__user=user,
        order__purchase_date__range=(start_date, end_date)
    )

    qty_data = order_items_qs.aggregate(
        orderquantity=Sum('quantity_ordered'),
        shippedquantity=Sum('quantity_shipped'),
    )

    order_quantity = int(qty_data['orderquantity'] or 0)
    shipped_quantity = int(qty_data['shippedquantity'] or 0)

    unshipped_quantity = max(order_quantity - shipped_quantity, 0)

    gross_item_qty = order_quantity


    canceled_data = OrderItem.objects.filter(
        order__user=user,
        order__purchase_date__range=(start_date, end_date),
        order__order_status__icontains='Cancel'
    )

    qty_canceled = canceled_data.aggregate(
        orderquantity=Sum('quantity_ordered')
    )
    
    # ---------------- ACCURATE NET SALES (matches details endpoint) ----------------
    net_sales_items_qs = OrderItem.objects.filter(
        order__user=user,
        order__purchase_date__range=(start_date, end_date)
    ).exclude(order__order_status__icontains='Cancel')

    net_sales_agg = net_sales_items_qs.aggregate(
        # item_grosssales=Sum('item_price'),   previus calculating
        grosssales=Sum(
            Case(
                When(Q(order__order_status__icontains='Pending') & Q(item_price=0), then=F('new_item_price')),
                default=F('item_price'),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            )
        ),
        avg_cost=Avg(
            Case(
                When(Q(order__order_status__icontains='Pending') & Q(item_price=0), then=F('new_item_price')),
                default=F('item_price'),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            )
        ),
        item_tax_total=Sum('item_tax'),
    )

    accurate_net_sales = (
        # float(net_sales_agg['item_grosssales'] or 0)
        float(net_sales_agg['grosssales'] or 0)
        + float(net_sales_agg['item_tax_total'] or 0)
    )

    cancelled_qty = int(qty_canceled['orderquantity'] or 0)

    cancelled_qs = orders_qs.filter(order_status__icontains='Cancel')
    
    cancelled_amount = float(cancelled_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
    cancelled_amount = cancelled_amount if cancelled_amount < 0 else -cancelled_amount


    finance_totals = finances_qs.aggregate(
        principal=Sum('principal'),
        tax=Sum('tax'),

        shipping_income=Sum('shipping_income'),
        shipping_expense=Sum('shipping_fee'),

        commission=Sum('commission_fee'),
        fulfillment=Sum('fulfillment_fee'),
        other=Sum('other_fee'),

        promotion=Sum('promotion_discount'),
        refund=Sum('refund_amount'),

        total=Sum('total_amount'),
        qty=Sum('quantity')
    )

    principal = float(finance_totals['principal'] or 0)
    tax = float(finance_totals['tax'] or 0)

    shipping_income = float(finance_totals['shipping_income'] or 0)
    shipping_expense = float(finance_totals['shipping_expense'] or 0)

    commission = float(finance_totals['commission'] or 0)
    fulfillment = float(finance_totals['fulfillment'] or 0)
    other_fees = float(finance_totals['other'] or 0)

    promotion_discount = float(finance_totals['promotion'] or 0)
    refund_amount = float(finance_totals['refund'] or 0)

    total_qty = int(finance_totals['qty'] or 0)

    net_shipping = shipping_income - shipping_expense

    total_fees = commission + fulfillment + other_fees

    # ---------------- EVENT GROUPS ----------------
    returns_qs = finances_qs.filter(event_group="REFUND")
    rto_qs = finances_qs.filter(event_group="RTO")
    claim_qs = finances_qs.filter(event_group="CLAIM")

    # ---------------- RETURNS ----------------
    returns_amount = float(returns_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
    returns_qty = int(returns_qs.aggregate(q=Sum('quantity'))['q'] or 0)

    # ---------------- RTO ----------------
    rto_amount = float(rto_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
    rto_qty = int(rto_qs.aggregate(q=Sum('quantity'))['q'] or 0)
    

    # ---------------- CLAIM ----------------
    claim_amount = float(claim_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
    claim_qty = int(claim_qs.aggregate(q=Sum('quantity'))['q'] or 0)


    # net_sales = principal + shipping
    # net_sales = principal + net_shipping - promotion_discount
    # net_sales = principal + net_shipping - promotion_discount
    net_sales = principal  - promotion_discount
    print("net_sales>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",net_sales)

    # ---------------- ADS ----------------
    # ad_metrics_qs = AdCampaignMetrics.objects.filter(
    #     campaign__user=user,
    #     date__range=(start_date.date(), end_date.date())
    # )

    # ============================================================
    # ADS SPEND
    # ============================================================

    # ads_metrics_qs = ProductAdMetric.objects.filter(
    #     product_ad__amazon_account__user=user,
    #     product_ad__amazon_account__is_primary=True,
    #     report_date__range=(
    #         start_date.date(),
    #         end_date.date()
    #     )
    # )
    
    ads_metrics_qs = ProductAdMetric.objects.filter(
        product_ad__amazon_account__user=user,
        product_ad__amazon_account__is_primary=True,
        report_date__range=(
            from_date_ist.date(),   # was start_date.date()
            to_date_ist.date()      # was end_date.date()
        )
    )

    ads_amount = float(
        ads_metrics_qs.aggregate(
            total=Sum("cost")
        )["total"] or 0
    )
   
    ads_sales = float(
        ads_metrics_qs.aggregate(
            total=Sum("sales")
        )["total"] or 0
    )

    # make negative for expense
    ads_amount = -abs(ads_amount)
        

    # ---------------- PROFIT ----------------
    # Use accurate SKU-level profits (which include COGS, GST, and shipping)
    # sku_profits, return_claim_summary = _get_sku_profits_for_dashboard(user, start_date, end_date, search_data)
    sku_profits, return_claim_summary = _get_sku_profits_for_dashboard(
        user, start_date, end_date, search_data,
        from_date_ist=from_date_ist, to_date_ist=to_date_ist
    )
    profit = sum(s['profit'] for s in sku_profits)
    total_final_net_sales = sum(s.get('net_sales', 0) for s in sku_profits)

    # ---------------- METRICS ----------------
    # margin = (profit / total_final_net_sales * 100) if total_final_net_sales else 0  by final sales 
    margin = (profit / accurate_net_sales * 100) if accurate_net_sales else 0    #by accureate sale 
    roi = (ads_sales / abs(ads_amount) * 100) if ads_amount else 0
    
    tacos = (abs(ads_amount) / accurate_net_sales * 100) if accurate_net_sales else 0
    
    print("total_final_net_sales>>>>>>>>>>>>>>>>>>>>>",total_final_net_sales)
    print("ads_sales>>>>>>>>>>>>>>>>>>>>>",ads_sales)
    print("net_sales>>>>>>>>>>>>>>>>>>>>>",net_sales)
    
    
    
    # ---------------- TRENDS ----------------
    trends = orders_qs.annotate(date=TruncDate('purchase_date', tzinfo=IST)).values('date').annotate(
        sales=Sum('total_amount'),
        qty=Sum('items__quantity_ordered')
    )
    
    
        # ---------------- TRENDS ----------------
    trends = net_sales_items_qs.annotate(
        date=TruncDate('order__purchase_date', tzinfo=IST)
    ).values('date').annotate(
        # sales_price=Sum('item_price'),
        sales_price=Sum(
            Case(
                When(Q(order__order_status__icontains='Pending') & Q(item_price=0), then=F('new_item_price')),
                default=F('item_price'),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            )
        ),
        sales_tax=Sum('item_tax'),
        qty=Sum('quantity_ordered')
    ).order_by('date')

    trends_data = []
    margin_factor = profit / accurate_net_sales if accurate_net_sales else 0

    for t in trends:
        s_price = float(t.get('sales_price') or 0)
        s_tax = float(t.get('sales_tax') or 0)
        sales = s_price + s_tax

        est_profit = sales * margin_factor

        trends_data.append({
            "date": t['date'].strftime('%m-%d') if t['date'] else "",
            "sales": round(sales, 2),
            "qty": t['qty'] or 0,
            "estimated_profit": round(est_profit, 2),
            "profit_new": round(profit, 2),
            # "margin": f"{round((est_profit/sales)*100)}%" if sales else "0%"
        })



    # ---------------- GEO ----------------
    geo_data_detailed = []
    for state in orders_qs.values_list('state', flat=True).distinct():
        state_orders = orders_qs.filter(state=state)

        rev = float(state_orders.aggregate(val=Sum('total_amount'))['val'] or 0)
        st_profit = rev * 0.3

        geo_data_detailed.append({
            "id": state or "UNKNOWN",
            "revenue": f"{round(rev, 2)}",
            "mpfees": f"{round(-(rev * 0.15), 2)}",
            "profit": f"{round(st_profit, 2)}",
            "ads": f"{round(-(rev * 0.05), 2)}"
        })



    total_return_count_dashboard = return_claim_summary["total_return_count"]
    courier_return_count_dashboard = return_claim_summary["courier_return_count"]
    customer_return_count_dashboard = return_claim_summary["customer_return_count"]
    total_return_amount_dashboard = return_claim_summary["total_return_amount"]
    courier_return_amount_dashboard = return_claim_summary["courier_return_amount"]
    customer_return_amount_dashboard = return_claim_summary["customer_return_amount"]

    total_claim_count_dashboard = return_claim_summary["total_claim_count"]
    total_claim_amount_dashboard = return_claim_summary["total_claim_amount"]
    
    total_replacement_return_count_dashboard = return_claim_summary["replacement_return_count"]
    
    profitable_skus = [s for s in sku_profits if s['profit'] > 0]
    losing_skus = [s for s in sku_profits if s['profit'] < 0]
    
    profitable_skus.sort(key=lambda x: x['profit'], reverse=True)
    losing_skus.sort(key=lambda x: x['profit'])

    profitable_summary = {
        'total_count': len(profitable_skus),
        'total_amount': sum(s['profit'] for s in profitable_skus),
        'data': profitable_skus[:20]
    }

    losing_summary = {
        'total_count': len(losing_skus),
        'total_amount': sum(s['profit'] for s in losing_skus),
        'data': losing_skus[:20]
    }
    
    total_shipping_final = sum(
        s.get("shippingfees", 0)
        for s in sku_profits
    )


    # cancelled_qty = cancelled_qs.count() 
    cancelled_qty = 0

    
    total_return_count_dashboard += total_replacement_return_count_dashboard
    
    customer_return_count_dashboard += total_replacement_return_count_dashboard
    
    total_q = (
        gross_item_qty
        # + cancelled_qty
        # + rto_qty
        # + returns_qty
        # + total_claim_count_dashboard
        # + total_return_count_dashboard
    )


    # net_gross_item_qty = gross_item_qty - cancelled_qty 
    net_gross_item_qty = gross_item_qty 
    
    net_gross_item_qty = net_gross_item_qty - courier_return_count_dashboard - customer_return_count_dashboard
    
    print("net final quantity",net_gross_item_qty)
    print("net total_return_count_dashboard",total_return_count_dashboard) 
    
    print("net courier_return_count_dashboard", courier_return_count_dashboard)
            
    print("net total_return_countcustomer_return_count_dashboard_dashboard",customer_return_count_dashboard)        
  
    print("gross_sales>>>>>",gross_sales)
    net_gross_sales = gross_sales + cancelled_amount
    
    print("net_gross_sales>>>>>",net_gross_sales)


    
    total_gross = (
        accurate_net_sales
        # - rto_amount
        # - returns_amount
        - cancelled_amount
        - total_claim_amount_dashboard
        - courier_return_amount_dashboard
        - customer_return_amount_dashboard
    )
    
    
    print("total_final_net_sales>>>>>>>>>>>>>>",total_final_net_sales)

    # ---------------- RESPONSE ----------------
    return JsonResponse({
        "status": "success",
        "statusCode":200,
        "currency": "INR",
        "startDate": start_date,
        "endDate": end_date,
       
        "header_metrics": {
            # sales": round(net_gross_sales, 2),
            "sales": round(accurate_net_sales, 2),
            "total_final_net_sales": round(total_final_net_sales, 2),
            "profit": round(profit, 2),
            "margin": f"{round(margin)}%",
            "roi": f"{round(roi)}%",
            "ad_spend": format_currency(ads_amount),
            "tacos": f"{round(tacos)}%",
            "shipping": format_currency(total_shipping_final),
            
            # "total_return_count": total_return_count_dashboard,
            "courier_return_count": courier_return_count_dashboard,
            "customer_return_count": customer_return_count_dashboard,
            "return_amount": format_currency(total_return_amount_dashboard),
            
            "courier_return_amount": format_currency(courier_return_amount_dashboard),
            "customer_return_amount": format_currency(customer_return_amount_dashboard),

            "total_claim_count": total_claim_count_dashboard,
            "claim_amount": format_currency(total_claim_amount_dashboard),
        },
        "breakdown_table": {
            "gross": {"qty": total_q, "amount": format_currency(total_gross)}, 
            # "gross": {"qty": total_q, "amount": format_currency(accurate_net_sales)}, #new chnages on 24Augst
            # "cancelled": {"qty": -abs(cancelled_qs.count()), "amount": format_currency(cancelled_amount)},
            "cancelled": {"qty": -abs(cancelled_qty), "amount": format_currency(cancelled_amount)},
            "cancelled(RTO)": {"qty": -abs(rto_qty), "amount": format_currency(rto_amount)},
            # "returned": {"qty": -abs(returns_qty), "amount": format_currency(returns_amount)},
            # "returned(RTO)": {"qty": -abs(rto_qty), "amount": format_currency(rto_amount)},
            # "returned(CRef)": {"qty": claim_qty, "amount": format_currency(claim_amount)},
            
            "returned": {"qty": -abs(returns_qty), "amount": format_currency(returns_amount)},
            "returned(RTO)": {"qty": -abs(rto_qty), "amount": format_currency(rto_amount)},
            "returned(CRef)": {"qty": claim_qty, "amount": format_currency(claim_amount)},
            # "claim": {"qty": total_claim_count_dashboard, "amount": format_currency(total_claim_amount_dashboard)},
            "claim": {"qty": total_claim_count_dashboard, "amount": format_currency(total_claim_amount_dashboard)},
            "fees": {"amount": round(total_fees, 2), "method": "calculated"},
            # "net": {"qty": net_gross_item_qty, "amount": format_currency(net_gross_sales)},
            "net": {"qty": net_gross_item_qty, "amount": format_currency(accurate_net_sales)},
            
            # "claim": {
            #     "qty": total_claim_count_dashboard,
            #     "amount": format_currency(total_claim_amount_dashboard)
            # },
            "returned_courier": {
                "qty": courier_return_count_dashboard,
                "amount": format_currency(courier_return_amount_dashboard)
            },
            "returned_customer": {
                "qty": customer_return_count_dashboard,
                "amount": format_currency(customer_return_amount_dashboard)
            },
        },
        "trends": trends_data,
        # "geography": geo_data_detailed,

        "top_orders": {
            "profitable": {
                "total_count": profitable_summary['total_count'] or 0,
                "total_amount": f"₹{round(float(profitable_summary['total_amount'] or 0), 2)}",
                "data": profitable_summary['data']
            },
            "losing": {
                "total_count": losing_summary['total_count'] or 0,
                "total_amount": f"-₹{abs(round(float(losing_summary['total_amount'] or 0), 2))}",
                "data": losing_summary['data']
            }
        },
    
        "warnings": []
    })



@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def get_pivot_dashboard(request):
    """
    Returns data pivoted by date for the frontend table view.
    """
    user = request.user
    
    # Debug: Print incoming data
    req_data_val = getattr(request, 'data', None) if request.method == 'POST' else request.GET
    print(f"DEBUG Pivot Request: {req_data_val}")

    # 1. EXTRACT PARAMS (Robust logic)
    data_source_raw = getattr(request, 'data', None) or (request.POST if request.method == 'POST' else request.GET)
    
    data_source = {}
    if data_source_raw:
        if hasattr(data_source_raw, 'dict'):
            data_source.update(data_source_raw.dict())
        else:
            data_source.update(data_source_raw)
    
    # Try parsing raw body if still empty
    if not data_source:
        try:
            import json
            raw_body = getattr(request, '_body', None) or getattr(getattr(request, '_request', None), '_body', None)
            if raw_body:
                body_data = json.loads(raw_body)
                if isinstance(body_data, dict):
                    data_source.update(body_data)
        except Exception:
            pass
        
    search_data = {}
    search_data.update(data_source)

    f_child = (
        search_data.get('filters')
        or search_data.get('filter')
    )

    if isinstance(f_child, dict):
        search_data.update(f_child)
        
    def find_key(keys):
        for k in keys:
            val = search_data.get(k)
            if isinstance(val, list) and len(val) > 0: val = val[0]
            if val and str(val).strip(): return str(val).strip()
            # Case-insensitive
            for sk, sv in search_data.items():
                if sk.lower() == k.lower():
                    if isinstance(sv, list) and len(sv) > 0: sv = sv[0]
                    if sv and str(sv).strip(): return str(sv).strip()
        return None

    from_date_str = find_key(['fromDate', 'start_date', 'from_date', 'startDate'])
    end_date_str = find_key(['toDate', 'end_date', 'to_date', 'endDate', 'toDate'])
    metric_key = find_key(['qty', 'metric']) or 'grossqty'

    def parse_dt(dt_str, is_end=False):
        if not dt_str or not isinstance(dt_str, (str, bytes, date, datetime)) or len(str(dt_str)) < 10: 
            return (timezone.now() - timedelta(days=60)) if not is_end else timezone.now()
        
        try:
            if isinstance(dt_str, (datetime, date)):
                dt = dt_str
            else:
                clean_str = str(dt_str).split('T')[0]
                dt = datetime.strptime(clean_str, '%Y-%m-%d')
                
            if is_end:
                dt = dt.replace(hour=23, minute=59, second=59)
                
            if timezone.is_naive(dt):
                return timezone.make_aware(dt)
            return dt
        except:
            return (timezone.now() - timedelta(days=60)) if not is_end else timezone.now()

    start_date = parse_dt(from_date_str)
    end_date = parse_dt(end_date_str, True)
    
    print(f"DEBUG Pivot Data Range: {start_date} to {end_date} (Metric: {metric_key})")

    # Base query
    orders_qs = Order.objects.filter(user=user, purchase_date__range=(start_date, end_date))
    
    # 2. Aggregation
    # db_trends = orders_qs.annotate(
    #     day=TruncDate('purchase_date')
    # ).values('marketplace_id', 'day').annotate(
    #     grossqty=Sum('items_shipped'),
    #     netqty=Count('id'),
    #     revenue=Sum('total_amount')
    # )

    db_trends = orders_qs.annotate(
        day=TruncDate('purchase_date')
    ).values(
        'marketplace_id',
        'day'
    ).annotate(
        # grossqty=Sum(
        #     'items_shipped',
        #     filter=Q(order_status='Shipped')
        # ),

        grossqty=Count(
            'id',
            filter=Q(order_status__iexact='shipped')
        ),
        netqty=Count('id'),
        revenue=Sum('total_amount')
    )

    # Convert QuerySet to a lookup map: {(marketplace, date): data}
    data_lookup = { (t['marketplace_id'], t['day']): t for t in db_trends }

    # Build Continuous Periodic Results
    results_map = {}
    total_row = {"id": "total"}
    
    # Identify unique marketplaces in the data 
    raw_mkts = orders_qs.values_list('marketplace_id', flat=True).distinct()
    
    # Marketplace mapping for readability
    MKT_NAMES = {
        "A21TJRUUN4KGV": "Amazon-INDIA",
        None: "Amazon-INDIA"
    }

    # Process each marketplace
    for raw_mkt in raw_mkts:
        display_name = MKT_NAMES.get(raw_mkt) or raw_mkt or "Amazon-INDIA"
        
        if display_name not in results_map:
            results_map[display_name] = {"id": display_name}
        
        # Iterate through EVERY day in the range
        curr = start_date.date()
        last = end_date.date()
        while curr <= last:
            date_label = curr.strftime('%Y %B %d')
            
            # Get value from lookup
            record = data_lookup.get((raw_mkt, curr))
            value = float(record.get(metric_key) or 0) if record else 0.0
            
            # Add to marketplace row (Handle collisions if multiple IDs map to same name)
            results_map[display_name][date_label] = results_map[display_name].get(date_label, 0) + value
            # Add to global total
            total_row[date_label] = total_row.get(date_label, 0) + value
            
            curr += timedelta(days=1)

    return JsonResponse({
        "status": True,
        "message": "Success",
        "message_code": "E1",
        "results": list(results_map.values()),
        "total": [total_row],
        "least_sync_date": timezone.now().strftime('%Y-%m-%d')
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ads_analytics(request):
    """
    Analyzes Ad Spend and advertising impact using Financial Events.
    For high-detail (Campaigns, keywords), the Amazon Advertising API is required.
    """
    user = request.user
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    if start_date_str:
        start_date = timezone.make_aware(datetime.strptime(start_date_str, '%Y-%m-%d'))
    else:
        start_date = timezone.now() - timedelta(days=30)
    
    if end_date_str:
        end_date = timezone.make_aware(datetime.strptime(end_date_str, '%Y-%m-%d'))
    else:
        end_date = timezone.now()

    # Filter for ad-related financial events (ServiceFee, AdSpend, etc.)
    ad_events = FinancialEvent.objects.filter(
        user=user,
        posted_date__range=(start_date, end_date),
    ).filter(
        Q(event_type__icontains='ServiceFee') | 
        Q(raw_data__icontains='Ad') | 
        Q(raw_data__icontains='Sponsored')
    )

    total_spend = abs(float(ad_events.aggregate(val=Sum('total_amount'))['val'] or 0))
    
    # Get total sales for TACOS calculation
    orders_qs = Order.objects.filter(user=user, purchase_date__range=(start_date, end_date))
    total_sales = float(orders_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
    
    # Daily breakdown
    daily_spend = ad_events.annotate(date=TruncDate('posted_date')).values('date').annotate(
        amount=Sum('total_amount')
    ).order_by('date')

    return JsonResponse({
        "status": "success",
        "summary": {
            "total_ad_spend": round(total_spend, 2),
            "tacos": f"{round((total_spend / total_sales * 100), 2)}%" if total_sales > 0 else "0%",
            "ad_events_count": ad_events.count()
        },
        "daily_breakdown": [{"date": d['date'], "amount": abs(float(d['amount']))} for d in daily_spend],
        "top_ad_line_items": list(ad_events.order_by('total_amount')[:10].values('posted_date', 'total_amount', 'event_type'))
    })

def home(request):
    return JsonResponse({
        "message": "Welcome to Amazon SP-API SaaS",
        "endpoints": {
            "connect": "/api/amazon/connect/",
            "callback": "/api/amazon/callback/",
            "dashboard": "/api/amazon/dashboard-stats/",
            "product_list": "/api/amazon/product-analytics/",
            "sync_orders": "/api/amazon/sync-orders/",
            "sync_finances": "/api/amazon/sync-finances/"
        }
    })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_amazon_data_profi_tability(request):

    """
    Returns Amazon profitability data
    without changing existing response structure.
    """

    user = request.user

    # ============================================================
    # REQUEST DATA
    # ============================================================

    data_source_raw = (
        getattr(request, 'data', None)
        or (request.POST if request.method == 'POST' else request.GET)
    )

    data_source = {}

    if data_source_raw:

        if hasattr(data_source_raw, 'dict'):
            data_source.update(data_source_raw.dict())

        else:
            data_source.update(data_source_raw)

    if not data_source:

        try:
            import json

            raw_body = getattr(request, '_body', None) or getattr(getattr(request, '_request', None), '_body', None)
            if raw_body:
                body_data = json.loads(raw_body)

                if isinstance(body_data, dict):
                    data_source.update(body_data)

        except Exception:
            pass

    search_data = {}
    search_data.update(data_source)

    filters_data = search_data.get("filters")

    if isinstance(filters_data, dict):
        search_data.update(filters_data)

    # ============================================================
    # FIND KEY
    # ============================================================

    def find_key(keys):

        for k in keys:

            val = search_data.get(k)

            if isinstance(val, list) and val:
                val = val[0]

            if val and str(val).strip():
                return str(val).strip()

            for sk, sv in search_data.items():

                if sk.lower() == k.lower():

                    if isinstance(sv, list) and sv:
                        sv = sv[0]

                    if sv and str(sv).strip():
                        return str(sv).strip()

        return None

    # ============================================================
    # DATE FILTERS
    # ============================================================

    from_date_str = find_key([
        'fromDate',
        'from_date',
        'startDate',
        'start_date'
    ])

    to_date_str = find_key([
        'toDate',
        'to_date',
        'endDate',
        'end_date'
    ])

    def parse_date(date_str, default_delta):

        if not date_str:
            return timezone.now() + default_delta

        try:

            if isinstance(date_str, (datetime, date)):
                dt = date_str

            else:
                dt = datetime.strptime(
                    str(date_str)[:10],
                    "%Y-%m-%d"
                )

            if timezone.is_naive(dt):
                dt = timezone.make_aware(dt)

            return dt

        except Exception:
            return timezone.now() + default_delta

    from_date = parse_date(
        from_date_str,
        timedelta(days=-30)
    )

    to_date = parse_date(
        to_date_str,
        timedelta(days=0)
    )

    if to_date:

        to_date = to_date.replace(
            hour=23,
            minute=59,
            second=59
        )

    # ============================================================
    # PAGINATION
    # ============================================================

    pagination = search_data.get("pagination", {})

    page_no = int(
        pagination.get("pageNo", 0)
    )

    page_size = int(
        pagination.get("pageSize", 25)
    )

    # ============================================================
    # FILTERS
    # ============================================================

    sku_f = find_key([
        "sku",
        "SKU",
        "seller_sku"
    ])

    product_f = find_key([
        "productId",
        "ProductId",
        "product_id"
    ])

    parent_f = find_key([
        "parentId",
        "ParentId",
        "parent_id"
    ])

    master_sku_f = find_key([
        "master_sku",
        "masterSku"
    ])

    category_f = find_key([
        "category",
        "mkt_category"
    ])

    metric_options = search_data.get("metric", {})

    summary_metric = metric_options.get(
        "summarymetric",
        "channel"
    )

    # ============================================================
    # BASE QUERYSETS
    # ============================================================

    orders_qs = (
        Order.objects
        .filter(
            user=user,
            purchase_date__range=(
                from_date,
                to_date
            )
        )
        .exclude(
            order_status__icontains="cancel"
        )
    )

    items_qs = (
        OrderItem.objects
        .filter(
            order__user=user,
            order__purchase_date__range=(
                from_date,
                to_date
            )
        )
        .exclude(
            order__order_status__icontains="cancel"
        )
    )

    finances_qs = FinancialEvent.objects.filter(
        user=user,
        posted_date__range=(
            from_date,
            to_date
        )
    )

    estimated_fee_qs = (
        AmazonEstimatedFee.objects
        .filter(
            order_item__order__user=user,
            order_item__order__purchase_date__range=(
                from_date,
                to_date
            )
        )
    )

    # ============================================================
    # APPLY FILTERS
    # ============================================================

    if sku_f:

        orders_qs = orders_qs.filter(
            items__seller_sku__icontains=sku_f
        )

        items_qs = items_qs.filter(
            seller_sku__icontains=sku_f
        )

        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__seller_sku__icontains=sku_f
        )

    if product_f:

        orders_qs = orders_qs.filter(
            items__order_item_id__icontains=product_f
        )

        items_qs = items_qs.filter(
            order_item_id__icontains=product_f
        )

    if parent_f or master_sku_f or category_f:

        search_term = (
            parent_f or
            master_sku_f or
            category_f
        )

        orders_qs = orders_qs.filter(
            items__title__icontains=search_term
        )

        items_qs = items_qs.filter(
            title__icontains=search_term
        )

    orders_qs = orders_qs.distinct()

    # ============================================================
    # GROUPING
    # ============================================================

    if summary_metric == "channel":

        grouped_data = (
            orders_qs
            .values(
                'amazon_account__seller_central_id'
            )
            .annotate(

                grossqty=Count(
                    'id',
                    filter=Q(
                        order_status__iexact='shipped'
                    )
                ),

                grosssales=Sum(
                    'total_amount'
                ),

                min_date=Min(
                    'purchase_date'
                ),

                max_date=Max(
                    'purchase_date'
                )
            )
        )

    else:

        grouped_data = (
            items_qs
            .values(
                'seller_sku',
                'title'
            )
            .annotate(

                grossqty=Sum(
                    'quantity_shipped'
                ),

                grosssales=Sum(
                    'item_price'
                ),

                min_date=Min(
                    'order__purchase_date'
                ),

                max_date=Max(
                    'order__purchase_date'
                )
            )
        )

    total_count = grouped_data.count()

    start_idx = page_no * page_size

    end_idx = start_idx + page_size

    paged_data = grouped_data[
        start_idx:end_idx
    ]

    # ============================================================
    # TOTALS
    # ============================================================

    total_ads = 0
    total_gross_sales = 0
    total_net_sales = 0
    total_profit = 0
    total_qty = 0
    total_mp_fees = 0
    total_shipping_fees = 0
    total_return_qty = 0
    total_cogs = 0

    response_data = []

    # ============================================================
    # LOOP
    # ============================================================

    for p in paged_data:

        p_order_ids = []

        # ========================================================
        # CHANNEL
        # ========================================================

        if summary_metric == "channel":

            display_name = "Amazon-India"

            gross_sales = float(
                p.get("grosssales") or 0
            )

            gross_qty = int(
                p.get("grossqty") or 0
            )

            account_orders = orders_qs.filter(
                amazon_account__seller_central_id=
                p.get(
                    'amazon_account__seller_central_id'
                )
            )

            p_order_ids = list(
                account_orders.values_list(
                    "amazon_order_id",
                    flat=True
                )
            )

            id_val = display_name

        # ========================================================
        # SKU
        # ========================================================

        else:

            sku = p.get("seller_sku")

            display_name = p.get("title")

            gross_sales = float(
                p.get("grosssales") or 0
            )

            gross_qty = int(
                p.get("grossqty") or 0
            )

            sku_items = items_qs.filter(
                seller_sku=sku
            )

            p_order_ids = list(
                sku_items.values_list(
                    "order__amazon_order_id",
                    flat=True
                )
            )

            id_val = sku

        # ========================================================
        # FINANCE DATA
        # ========================================================

        p_finances = finances_qs.filter(
            amazon_order_id__in=p_order_ids
        )

        # ========================================================
        # ESTIMATED FEES
        # ========================================================

        estimated_fee_total = float(
            estimated_fee_qs.filter(
                order_item__order__amazon_order_id__in=
                p_order_ids
            ).aggregate(
                total=Sum("total_fees")
            )["total"] or 0
        )

        # USE ESTIMATED FEES AS MP FEES
        mp_fees = abs(estimated_fee_total)

        # ========================================================
        # SHIPPING
        # ========================================================

        shipping_fees = abs(float(

            p_finances.aggregate(
                total=Sum("shipping_fee")
            )["total"] or 0

        ))

        # ========================================================
        # ADS
        # ========================================================

        ads = abs(float(

            p_finances.filter(

                Q(event_type__icontains='Ad') |
                Q(raw_data__icontains='Sponsored')

            ).aggregate(

                total=Sum('total_amount')

            )['total'] or 0

        ))

        # ========================================================
        # OTHER FEES
        # ========================================================

        other_fees = abs(float(

            p_finances.filter(
                event_type__icontains='Adjustment'
            ).aggregate(
                total=Sum('total_amount')
            )['total'] or 0

        ))

        storage_fees = abs(float(

            p_finances.filter(
                event_type__icontains='Storage'
            ).aggregate(
                total=Sum('total_amount')
            )['total'] or 0

        ))

        # ========================================================
        # RETURNS
        # ========================================================

        refund_amount = abs(float(

            p_finances.aggregate(

                total=Sum(
                    'total_amount',
                    filter=Q(
                        event_group='REFUND'
                    )
                )

            )['total'] or 0

        ))

        avg_order_value = (
            gross_sales / gross_qty
            if gross_qty else 0
        )

        return_qty = 0

        if avg_order_value > 0:

            return_qty = int(round(
                refund_amount / avg_order_value
            ))

        net_qty = max(
            gross_qty - return_qty,
            0
        )

        retpercent = (
            (return_qty / gross_qty) * 100
            if gross_qty else 0
        )

        # ========================================================
        # SALES
        # ========================================================

        net_sales = (
            gross_sales - refund_amount
        )

        # ========================================================
        # COGS
        # ========================================================

        cogs = gross_sales * 0.35

        # ========================================================
        # PROFIT
        # ========================================================

        profit = (
            net_sales
            - mp_fees
            - shipping_fees
            - ads
            - storage_fees
            - other_fees
            - cogs
        )

        profit_margin = (
            (profit / net_sales) * 100
            if net_sales else 0
        )

        grossprofit = (
            gross_sales
            - mp_fees
            - shipping_fees
        )

        tacos = (
            (ads / gross_sales) * 100
            if gross_sales else 0
        )

        # ========================================================
        # RESPONSE ITEM
        # ========================================================

        item = {

            "ads": f"{round(-ads, 2)}",

            "channel": display_name,

            "channel1": display_name,

            "claims": "-352",

            "customerdiscount": f"{round(gross_sales * 0.1, 2)}",

            "drr": f"{round(tacos, 2)}",

            "grossmrp": f"{round(gross_sales * 2.5, 2)}",

            "grossmrpdiscount": "60.0",

            "grossprofit": round(grossprofit, 2),

            "grossprofitper": round(
                (
                    grossprofit / gross_sales * 100
                ) if gross_sales else 0,
                2
            ),

            "grossqty": f"{gross_qty}",

            "grosssales": f"{round(gross_sales, 2)}",

            "gsttopay": 0.0,

            "id": id_val,

            "imageurl": "https://m.media-amazon.com/images/I/81yIRz4tPNL.jpg",

            "maxorderdate": (
                p['max_date'].strftime('%Y-%m-%d')
                if p['max_date'] else None
            ),

            "minorderdate": (
                p['min_date'].strftime('%Y-%m-%d')
                if p['min_date'] else None
            ),

            "mpfees": f"{round(-mp_fees, 2)}",

            "mpfees_with_claims": f"{round((-mp_fees - 352), 2)}",

            "mrp": f"{round(gross_sales * 2.5, 2)}",

            "mrp_customer_discount": "60.0",

            "mrp_grosssales": f"{round(gross_sales, 2)}",

            "mrp_netsales": f"{round(net_sales, 2)}",

            "name": display_name,

            "net_discount": "0",

            "netasp": (
                f"{round(net_sales / net_qty, 2)}"
                if net_qty > 0 else "0"
            ),

            "netqty": f"{net_qty}",

            "netsales": f"{round(net_sales, 2)}",

            "orderdate": (
                p['max_date'].strftime('%Y-%m-%d')
                if p['max_date'] else None
            ),

            "otherfees": f"{round(-other_fees, 2)}",

            "per_of_sale": "100.00",

            "productid": (
                id_val
                if summary_metric != 'channel'
                else "B0GTMH4RFJ"
            ),

            "productidentifier": None,

            "producttitle": display_name,

            "profit": round(profit, 2),

            "profit_settled_amount": f"{round(net_sales - mp_fees - shipping_fees, 2)}",

            "profitcogs": f"{round(-cogs, 2)}",

            "profitmargin": round(
                profit_margin,
                2
            ),

            "redirecturl": None,

            "replacedqty": "0",

            "retpercent": round(
                retpercent,
                2
            ),

            "returnestqty": "0",

            "returnqty": f"{return_qty}",

            "rowcount": 1,

            "shippingfees": f"{round(-shipping_fees, 2)}",

            "stdcost_missing_percentage": "0",

            "stdcostmissingqty": "0",

            "storagefees": f"{round(-storage_fees, 2)}",

            "tacos": f"{round(tacos, 2)}",

            "tcsinc": "0",

            "total_gross_gstdiff_component": 0,

            "total_gross_profit_component": round(
                grossprofit,
                2
            ),

            "total_gstdiff_component": 0,

            "total_profit_component": round(
                profit,
                2
            )
        }

        response_data.append(item)

        # ========================================================
        # TOTALS
        # ========================================================

        total_ads += ads
        total_gross_sales += gross_sales
        total_net_sales += net_sales
        total_profit += profit
        total_qty += net_qty
        total_mp_fees += mp_fees
        total_shipping_fees += shipping_fees
        total_return_qty += return_qty
        total_cogs += cogs

    # ============================================================
    # FINAL RESPONSE
    # ============================================================

    result = {

        "status": True,

        "message": "Success",

        "message_code": "E1",

        "pagination": {

            "pageNo": page_no,

            "pageSize": page_size,

            "count": total_count
        },

        "totals": {

            "ads": f"{round(-total_ads, 2)}",

            "claims": "-352",

            "drr": f"{round((total_ads / total_gross_sales * 100) if total_gross_sales else 0, 2)}",

            "grossmrp": f"{round(total_gross_sales * 2.5, 2)}",

            "grossmrpdiscount": "60.0",

            "grossprofit": round(
                total_gross_sales
                - total_mp_fees
                - total_shipping_fees,
                2
            ),

            "grossprofitper": round(
                (
                    (
                        total_gross_sales
                        - total_mp_fees
                        - total_shipping_fees
                    ) / total_gross_sales
                ) * 100 if total_gross_sales else 0,
                2
            ),

            "grossqty": f"{total_qty}",

            "grosssales": f"{round(total_gross_sales, 2)}",

            "gsttopay": 0.0,

            "mpfees": f"{round(-total_mp_fees, 2)}",

            "mpfees_with_claims": f"{round((-total_mp_fees - 352), 2)}",

            "mrp": f"{round(total_gross_sales * 2.5, 2)}",

            "mrp_customer_discount": "60.0",

            "net_discount": "0",

            "netasp": (
                f"{round(total_net_sales / total_qty, 2)}"
                if total_qty > 0 else "0"
            ),

            "netqty": f"{total_qty}",

            "netsales": f"{round(total_net_sales, 2)}",

            "otherfees": "0",

            "profit": round(total_profit, 2),

            "profit_settled_amount": f"{round(total_net_sales - total_mp_fees - total_shipping_fees, 2)}",

            "profitcogs": f"{round(-total_cogs, 2)}",

            "profitmargin": round(
                (
                    total_profit / total_net_sales
                ) * 100 if total_net_sales else 0,
                2
            ),

            "replacedqty": "0",

            "retpercent": round(
                (
                    total_return_qty / total_qty
                ) * 100 if total_qty else 0,
                2
            ),

            "returnestqty": "0",

            "returnqty": f"{total_return_qty}",

            "shippingfees": f"{round(-total_shipping_fees, 2)}",

            "stdcost_missing_percentage": "0",

            "storagefees": "0",

            "tacos": f"{round((total_ads / total_gross_sales * 100) if total_gross_sales else 0, 2)}",

            "tcsinc": "0"
        },

        "response": response_data
    }

    return JsonResponse(result)


@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def get_profitability_monthwise(request):
    """
    Returns monthly summarized profitability data using standardized transaction-based logic.
    """
    from .profit import combined_profitability_monthwise
    return combined_profitability_monthwise(request)
 



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_amazon_data_reconcile_paymentsummary(request):
    """
    Returns Amazon payment reconciliation summary.
    Compares Orders with Financial Events to determine settled/unsettled status.
    """
    user = request.user
    payload = request.data
    filters = payload.get('filters', {})
    
    # 1. Date Filtering
    from_date_str = filters.get('fromDate')
    to_date_str = filters.get('toDate')
    
    def parse_iso_date(date_str, default_delta):
        if not date_str:
            return timezone.now() + default_delta
        try:
            cleaned = date_str.replace('Z', '+00:00')
            dt = datetime.fromisoformat(cleaned)
            if timezone.is_naive(dt):
                return timezone.make_aware(dt)
            return dt
        except Exception:
            return timezone.now() + default_delta
 
    from_date = parse_iso_date(from_date_str, timedelta(days=-120))
    to_date = parse_iso_date(to_date_str, timedelta(days=0))
 
    # 2. Base Querysets
    orders_qs = Order.objects.filter(user=user, purchase_date__range=(from_date, to_date))
    finances_qs = FinancialEvent.objects.filter(user=user, posted_date__range=(from_date, to_date))
 
    # 3. Reconciliation Logic
    # An order is 'settled' if there is an associated financial event
    settled_order_ids = set(finances_qs.exclude(amazon_order_id__isnull=True).values_list('amazon_order_id', flat=True))
    
    settled_orders = orders_qs.filter(amazon_order_id__in=settled_order_ids)
    unsettled_orders = orders_qs.exclude(amazon_order_id__in=settled_order_ids)
 
    settled_amount = float(settled_orders.aggregate(val=Sum('total_amount'))['val'] or 0)
    settled_count = settled_orders.count()
    
    unsettled_amount = float(unsettled_orders.aggregate(val=Sum('total_amount'))['val'] or 0)
    unsettled_count = unsettled_orders.count()
 
    # If finances exist but no matching orders found in DB, we still count the financial totals
    # as these represent settled money in the bank.
    if settled_count == 0 and finances_qs.exists():
        settled_amount = float(finances_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
        settled_count = finances_qs.values('amazon_order_id').distinct().count()
 
    # Variance Logic (Simple placeholder for now, matching user structure)
    bank_variance = -629.82 if settled_count > 0 else 0.0
 
    result = {
        "status": "success",
        "message": "Success",
        "message_code": "E1",
        "group_by_variance_chart_table": [],
        "group_by_variance_bar_chart": [],
        "total": {
            "Shipping": 0,
            "Marketplace": 0,
            "Final": 0
        },
        "data": [
            {
                "bankvarianceamount": bank_variance,
                "bankvariancecount": 5 if settled_count > 0 else 0,
                "collectionvaramount": None,
                "collectionvarcount": 0,
                "commissionvaramount": None,
                "commissionvarcount": 0,
                "fbaweightbasefeevaramount": None,
                "fbaweightbasefeevarcount": 0,
                "fixedclosefeevaramount": None,
                "fixedclosefeevarcount": 0,
                "fixedfeevaramount": None,
                "fixedfeevarcount": 0,
                "mcommissionvaramount": None,
                "mcommissionvarcount": 0,
                "mfbaweightbasefeevaramount": None,
                "mfbaweightbasefeevarcount": 0,
                "mshippingvaramount": None,
                "mshippingvarcount": 0,
                "pickandpackfeevaramount": None,
                "pickandpackfeevarcount": 0,
                "refundcheckvaramount": None,
                "refundcheckvarcount": 0,
                "refundcommisionvaramount": None,
                "refundcommisionvarcount": 0,
                "refundfeevaramount": None,
                "refundfeevarcount": 0,
                "settledordersamount": settled_amount,
                "settledorderscount": settled_count,
                "shippingvaramount": None,
                "shippingvarcount": 0,
                "technologyfeevaramount": None,
                "technologyfeevarcount": 0,
                "unsettledvarianceamount": unsettled_amount,
                "unsettledvariancecount": unsettled_count
            },
            {
                "missing_pincodes": 0
            }
        ]
    }
    
    return JsonResponse(result)


# api for get banck trnasfer details


# ---------------------------
# MAIN API
# ---------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_bank_transfer_workflow(request):

    user = request.user
    payload = request.data or {}
    filters = payload.get('filters', {})

    # ---------------------------
    # 1. DATE PARSING
    # ---------------------------
    def parse_date(date_str, default_delta):
        if not date_str:
            return timezone.now() + default_delta
        try:
            dt = datetime.fromisoformat(str(date_str).replace('Z', '+00:00'))
            if timezone.is_naive(dt):
                dt = timezone.make_aware(dt)
            return dt
        except:
            return timezone.now() + default_delta

    from_date = parse_date(filters.get('fromDate'), timedelta(days=-30))
    to_date = parse_date(filters.get('toDate'), timedelta(days=0))
    to_date = to_date.replace(hour=23, minute=59, second=59)

    # ---------------------------
    # 2. QUERYSET
    # ---------------------------
    qs = FinancialEvent.objects.filter(
        user=user,
        posted_date__range=(from_date, to_date)
    )

    DECIMAL = DecimalField(max_digits=14, decimal_places=2)
    ZERO = Value(Decimal('0.00'), output_field=DECIMAL)

    # ---------------------------
    # 3. DB AGGREGATION
    # ---------------------------
    agg = qs.aggregate(

        remittance=Coalesce(
            Sum(Case(
                When(total_amount__gt=0, then='total_amount'),
                default=ZERO,
                output_field=DECIMAL
            )), ZERO
        ),

        negremittance=Coalesce(
            Sum(Case(
                When(total_amount__lt=0, then='total_amount'),
                default=ZERO,
                output_field=DECIMAL
            )), ZERO
        ),

        ads_cost=Coalesce(
            Sum(Case(
                When(
                    Q(event_type__icontains='Ad') |
                    Q(event_type__icontains='ServiceFee'),
                    then='total_amount'
                ),
                default=ZERO,
                output_field=DECIMAL
            )), ZERO
        ),

        reserve_adj=Coalesce(
            Sum(Case(
                When(event_type__icontains='Reserve', then='total_amount'),
                default=ZERO,
                output_field=DECIMAL
            )), ZERO
        ),

        other_adj=Coalesce(
            Sum(Case(
                When(
                    ~(
                        Q(event_type__icontains='Shipment') |
                        Q(event_type__icontains='Ad') |
                        Q(event_type__icontains='ServiceFee') |
                        Q(event_type__icontains='Reserve')
                    ),
                    then='total_amount'
                ),
                default=ZERO,
                output_field=DECIMAL
            )), ZERO
        ),
    )

    # ---------------------------
    # 4. RAW DATA PARSING (CORRECT PLACE)
    # ---------------------------
    orders_paid = Decimal('0.00')
    fees = Decimal('0.00')
    tds = Decimal('0.00')
    promotions = Decimal('0.00')
    other = Decimal('0.00')

    shipment_events = qs.filter(event_type__icontains='Shipment')

    for event in shipment_events:
        data = extract_financials(event.raw_data)

        orders_paid += data["revenue"]
        fees += data["fees"]
        tds += data["tds"]
        promotions += data["promotions"]
        other += data["other"]

    # ---------------------------
    # 5. FINAL VALUES
    # ---------------------------
    remittance = round(float(agg['remittance']), 2)
    negremittance = round(float(agg['negremittance']), 2)
    ads_cost = round(float(agg['ads_cost']), 2)
    reserve_adj = round(float(agg['reserve_adj']), 2)
    other_adj = round(float(agg['other_adj']), 2)

    total = round(remittance + negremittance, 2)

    # ---------------------------
    # 6. RESPONSE
    # ---------------------------
    return JsonResponse({
        "status": True,
        "message": "Success",
        "message_code": "E1",
        "data": {
            "remittance_amount": remittance,
            "negative_adjustment": negremittance,
            "total": total,
            "orders_paid": round(float(orders_paid), 2),
            "fees": round(float(fees), 2),
            "tds": round(float(tds), 2),
            "promotions": round(float(promotions), 2),
            "advertisement_cost": ads_cost,
            "reserve_adjustment": reserve_adj,
            "other_adjustment": other_adj
        }
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_outstanding_payments(request):
    """
    Returns data for the Outstanding Payments dashboard.
    Calculates settled vs unsettled amounts based on Order and FinancialEvent models.
    """
    user = request.user
    
    # 1. EXTRACT DATA SOURCE (Support POST JSON, POST Form, and GET)
    data_source = {}
    if request.method == 'POST':
        data_source.update(request.data if isinstance(request.data, dict) else {})
    else:
        data_source.update(request.GET.dict())
    
    # Support for nested "filters" key commonly sent by the frontend
    filters = data_source.get('filters', {})
    if isinstance(filters, dict):
        data_source.update(filters)

    def find_key(keys):
        for k in keys:
            val = data_source.get(k)
            if isinstance(val, list) and len(val) > 0: val = val[0]
            if val and str(val).strip(): return str(val).strip()
            # Case-insensitive
            for sk, sv in data_source.items():
                if sk.lower() == k.lower():
                    if isinstance(sv, list) and len(sv) > 0: sv = sv[0]
                    if sv and str(sv).strip(): return str(sv).strip()
        return None

    # Date Range Extraction
    start_date_raw = find_key(['fromDate', 'start_date', 'from_date', 'startDate'])
    end_date_raw = find_key(['toDate', 'end_date', 'to_date', 'endDate'])

    def parse_dt(dt_str, is_end=False):
        if not dt_str:
            # Default to a wide range if no dates provided to show "real data"
            return (timezone.now() - timedelta(days=365)) if not is_end else timezone.now()
        try:
            if isinstance(dt_str, (datetime, date)):
                dt = dt_str
            else:
                # Remove T if present (e.g. 2024-01-01T00:00:00Z)
                clean_str = str(dt_str).split('T')[0]
                dt = datetime.strptime(clean_str, '%Y-%m-%d')
            
            if is_end:
                dt = dt.replace(hour=23, minute=59, second=59)
            else:
                dt = dt.replace(hour=0, minute=0, second=0)
            
            return timezone.make_aware(dt) if timezone.is_naive(dt) else dt
        except Exception as e:
            print(f"DEBUG: Date Parse Error: {e}")
            return (timezone.now() - timedelta(days=365)) if not is_end else timezone.now()

    start_date = parse_dt(start_date_raw)
    end_date = parse_dt(end_date_raw, True)

    # 2. DATA QUERIES
    # Total Orders in range
    orders_qs = Order.objects.filter(user=user, purchase_date__range=(start_date, end_date))
    # All finances linked to these orders OR within the posted date range
    finances_qs = FinancialEvent.objects.filter(user=user, posted_date__range=(start_date, end_date))

    # Real Logic for Reconciliation:
    # 1. Settled: Orders that have at least one FinancialEvent
    # 2. Unsettled: Shipped orders that have NO FinancialEvent
    
    # Get all order IDs that have been settled in the current timeframe
    settled_ids = set(FinancialEvent.objects.filter(user=user, amazon_order_id__isnull=False).values_list('amazon_order_id', flat=True).distinct())
    
    # Apply filters to orders
    settled_orders = orders_qs.filter(amazon_order_id__in=settled_ids)
    unsettled_orders = orders_qs.exclude(amazon_order_id__in=settled_ids).exclude(order_status__icontains='Cancel')

    # Aggregations
    # Note: Using absolute values for counts and amounts as requested by the UI format
    settled_not_paid_amount = float(settled_orders.aggregate(val=Sum('total_amount'))['val'] or 0)
    settled_not_paid_count = settled_orders.count()
    
    unsettled_variance_amount = float(unsettled_orders.aggregate(val=Sum('total_amount'))['val'] or 0)
    unsettled_variance_count = unsettled_orders.count()
    
    # Adjustments: Service fees, adjustments, etc (events without a specific order ID or with adj types)
    adjustments_qs = finances_qs.filter(Q(event_type__icontains='Adjustment') | Q(event_type__icontains='ServiceFee') | Q(amazon_order_id__isnull=True))
    settled_adj_amount = float(adjustments_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
    settled_adj_count = adjustments_qs.count()

    # 3. GRAPHING DATA (Monthly)
    def get_graph_data(qs, date_field, amount_key, count_key):
        trends = qs.annotate(month=TruncMonth(date_field)).values('month').annotate(
            sum_val=Sum('total_amount'),
            cnt_val=Count('id')
        ).order_by('month')
        
        return [
            {
                "channel": "Amazon-India",
                "month": t['month'].strftime('%Y-%m') if t['month'] else "N/A",
                amount_key: abs(float(t['sum_val'] or 0)),
                count_key: t['cnt_val']
            } for t in trends if t['month']
        ]

    adj_graph = get_graph_data(adjustments_qs, 'posted_date', 'settledadjamount', 'settledadjcount')
    unsettled_graph = get_graph_data(unsettled_orders, 'purchase_date', 'unsettled', 'count')

    # 4. FINAL RESPONSE
    # Get the latest update date from the database for the 'date' field
    latest_event = FinancialEvent.objects.filter(user=user).order_by('-posted_date').first()
    update_date = latest_event.posted_date.strftime('%Y-%m-%d %H:%M:%S+00') if latest_event else "NA"

    result = {
        "status": True,
        "message": "Success",
        "message_code": "E1",
        "table_response": [
            {
                "cashback_pending": None,
                "channel": "zzzTotal",
                "settledadjamount": -settled_adj_amount,
                "settledadjcount": settled_adj_count,
                "settlednotpaidamount": settled_not_paid_amount,
                "settlednotpaidcount": settled_not_paid_count,
                "unsettledvarianceamount": unsettled_variance_amount,
                "unsettledvariancecount": unsettled_variance_count,
                "date": "NA",
                "discrepancy": None
            },
            {
                "cashback_pending": None,
                "channel": "Amazon-India",
                "settledadjamount": -settled_adj_amount,
                "settledadjcount": settled_adj_count,
                "settlednotpaidamount": settled_not_paid_amount,
                "settlednotpaidcount": settled_not_paid_count,
                "unsettledvarianceamount": unsettled_variance_amount,
                "unsettledvariancecount": unsettled_variance_count,
                "date": update_date,
                "discrepancy": None
            }
        ],
        "cashbackgraph": None,
        "settledadjgraph": adj_graph,
        "current_reserve": [{"current_reserve": 0.0}],
        "unsettled_graph": unsettled_graph
    }

    return JsonResponse(result)
 
 


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def amazon_profitability_details(request):

    user = get_effective_user(request.user)
    profit_setting, _ = ProfitCalculationSetting.objects.get_or_create(user=user)
    data = request.data

    filters = data.get("filters", {})
    pagination = data.get("pagination", {})

    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25)) 

    # ---------------- DATE FILTER ----------------
    from_date = to_date = None
    try:
        if filters.get("fromDate"):
            from_date = timezone.make_aware(datetime.strptime(filters["fromDate"], "%Y-%m-%d"))
        if filters.get("toDate"):
            to_date = timezone.make_aware(datetime.strptime(filters["toDate"], "%Y-%m-%d")) + timedelta(days=1)
    except Exception as e:
        print("Date error:", e)

    order_filter = Q(order__user=user)

    # ---------------- CHANNEL FILTER ----------------
    CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}

    channels = filters.get("channel", {}).get("IN", [])
    if channels:
        marketplace_ids = [CHANNEL_MAP.get(ch) for ch in channels if CHANNEL_MAP.get(ch)]
        order_filter &= Q(order__marketplace_id__in=marketplace_ids)

    # ---------------- ASIN FILTER ----------------
    parent_ids = filters.get("parentproductid", {}).get("IN", [])
    if parent_ids:
        order_filter &= Q(asin__in=parent_ids)

    # ---------------- DATE APPLY ----------------
    if from_date:
        order_filter &= Q(order__purchase_date__gte=from_date)
    if to_date:
        order_filter &= Q(order__purchase_date__lte=to_date)

    # ---------------- ORDER ITEM AGG ----------------

    listing_qs = AmazonListingItem.objects.filter(
            user=user,
            asin=OuterRef("asin")
        ).order_by("-updated_at")
    
    items = (
        OrderItem.objects
        .filter(order_filter)
        .exclude(order__order_status__icontains='Cancel')

        .annotate(

            sku_standard_cost=Subquery(
                listing_qs.values("standard_cost")[:1]
            ),

            sku_gst_rate=Subquery(
                listing_qs.values("gst_rate")[:1]
            ),

            sku_tcs_rate=Subquery(
                listing_qs.values("tcs")[:1]
            ),

            sku_tds_rate=Subquery(
                listing_qs.values("tds")[:1]
            ),

            sku_region=Subquery(
                listing_qs.values("region")[:1]
            ),
        )

        .values('parent_asin')

        .annotate(
            title=Max('title'),
            image_url=Max('image_url'),

            grossqty=Sum('quantity_ordered'),
            quantity_shipped=Sum('quantity_shipped'),

            shipping_income=Sum('shipping_income'),
            shipping_price=Sum('shipping_price'),

            discount=Sum('discount'),
            promotion_discount=Sum('promotion_discount'),

            avg_cost=Avg('item_price'),

            item_tax=Sum('item_tax'),

            grosssales=Sum('item_price'),

            sku_standard_cost=Max('sku_standard_cost'),
            sku_gst_rate=Max('sku_gst_rate'),
            sku_tcs_rate=Max('sku_tcs_rate'),
            sku_tds_rate=Max('sku_tds_rate'),
            sku_region=Max('sku_region'),
        )
    )

    # ---------------- ESTIMATED FEES ----------------
    estimated_fee_qs = AmazonEstimatedFee.objects.filter(
        order_item__order__user=user
    )

    # apply same date filter
    if from_date:
        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__order__purchase_date__gte=from_date
        )

    if to_date:
        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__order__purchase_date__lte=to_date
        )

    # apply same parent filter
    if parent_ids:
        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__parent_asin__in=parent_ids
        )

    estimated_fee_data = (
        estimated_fee_qs
        .values('order_item__parent_asin')
        .annotate(
            estimated_fees=Sum('total_fees'),

            referral_fee=Sum('referral_fee'),
            closing_fee=Sum('closing_fee'),
            per_item_fee=Sum('per_item_fee'),

            fba_fee=Sum('fba_fee'),
            fba_pick_pack_fee=Sum('fba_pick_pack_fee'),
            fba_weight_handling_fee=Sum('fba_weight_handling_fee'),

            tax_amount=Sum('tax_amount'),
        )
    )

    estimated_fee_map = {
        row['order_item__parent_asin']: {
            "estimated_fees": float(row['estimated_fees'] or 0),

            "referral_fee": float(row['referral_fee'] or 0),
            "closing_fee": float(row['closing_fee'] or 0),
            "per_item_fee": float(row['per_item_fee'] or 0),

            "fba_fee": float(row['fba_fee'] or 0),
            "fba_pick_pack_fee": float(row['fba_pick_pack_fee'] or 0),
            "fba_weight_handling_fee": float(row['fba_weight_handling_fee'] or 0),

            "tax_amount": float(row['tax_amount'] or 0),
        }
        for row in estimated_fee_data
    }

    # ---------------- FINANCIAL EVENTS ----------------
    finances_qs = FinancialEvent.objects.filter(user=user)

    raw_map = (
        FinancialEvent.objects
        .filter(user=user)
        .exclude(raw_data=None)
        .values('amazon_order_id', 'raw_data')
    )

    raw_data_map = {}
    for r in raw_map:
        raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])

    if from_date:
        finances_qs = finances_qs.filter(posted_date__gte=from_date)
    if to_date:
        finances_qs = finances_qs.filter(posted_date__lte=to_date)

    finance_data = (
        finances_qs
        .values('amazon_order_id')
        .annotate(
            refund=Sum('total_amount', filter=Q(event_group="REFUND")),
            rto=Sum('total_amount', filter=Q(event_group="RTO")),
            # ads=Sum('total_amount', filter=Q(event_type__icontains='Ad')),
            commission=Sum('commission_fee'),
            fulfillment=Sum('fulfillment_fee'),
            other_fee=Sum('other_fee'),
            shipping_fee=Sum('shipping_fee'),
            gst=Sum('tax'),
        )
    )

    finance_map = {f['amazon_order_id']: f for f in finance_data}

    # ---------------- ASIN → ORDER MAP ----------------
    asin_orders = (
        OrderItem.objects
        .filter(order_filter)
        .values('asin','parent_asin', 'order__amazon_order_id', 'quantity_ordered')
    )

    # asin_map = {}
    # for row in asin_orders:
    #     asin_map.setdefault(row['asin'], []).append(row)
    
    # for both if not have parent assin
    # asin_map = {}
    # for row in asin_orders:
    #     key = row['parent_asin'] or row['asin']  # fallback
    #     asin_map.setdefault(key, []).append(row)

    asin_map = {}
    for row in asin_orders:
        asin_map.setdefault(row['parent_asin'], []).append(row)

    # ---------------- BUILD RESPONSE ----------------
    results = []

    total_sales = total_profit = total_ads = 0
    total_mpfees = total_net_sales = total_qty = 0
    total_returns = total_shipping = 0
    total_stdcost = 0
    total_ret_percent = 0
    adjusted_gross_sales = 0
    total_estimatefees = 0 
    total_mp_gst = 0
    total_gst = 0
    total_tcs = 0
    total_tds = 0
    total_taxable_value = 0
    total_gst_payable = 0
    total_exp_settlement = 0

    sku_asin_map = {
        normalize_sku(k): v
        for k, v in OrderItem.objects
            .filter(order_filter)
            .values_list('seller_sku', 'asin')
    }

    child_parent_map = {
        row['asin']: (row['parent_asin'] or row['asin'])
        for row in OrderItem.objects
            .filter(order_filter)
            .values('asin', 'parent_asin')
    }

    for row in items:
        # asin = row['asin']
        parent_asin = row['parent_asin']
        # estimated_fees = estimated_fee_map.get(parent_asin, 0)

        fee_data = estimated_fee_map.get(parent_asin, {})

        estimated_fees = fee_data.get("estimated_fees", 0)

        referral_fee = fee_data.get("referral_fee", 0)
        closing_fee = fee_data.get("closing_fee", 0)
        per_item_fee = fee_data.get("per_item_fee", 0)

        fba_fee = fee_data.get("fba_fee", 0)
        fba_pick_pack_fee = fee_data.get("fba_pick_pack_fee", 0)
        fba_weight_handling_fee = fee_data.get("fba_weight_handling_fee", 0)

        tax_amount = fee_data.get("tax_amount", 0)

        gross_qty = int(row['grossqty'] or 0)  
        quantity_shipped = int(row['quantity_shipped'] or 0) 
        
        gross_sales = float(row['grosssales'] or 0)
        item_tax = float(row.get('item_tax') or 0)
        promo_discount = float(row.get('promotion_discount') or 0)

        
        shipping_income = float(row.get('shipping_income') or 0)
        shipping_price = float(row.get('shipping_price') or 0)

        # ---------------- GST / TAXABLE ---------------

        # ==========================================================
        # GST / TAXABLE / TCS
        # ==========================================================

        gross_sales = float(str(row['grosssales'] or 0))

        item_tax = float(str(row.get('item_tax') or 0))

        promo_discount = float(
            str(row.get('promotion_discount') or 0)
        )

        shipping_price = float(
            str(row.get('shipping_price') or 0)
        )

        # ----------------------------------------------------------
        # ADJUSTED SALES
        # ----------------------------------------------------------

        adjusted_gross_sales = ( gross_sales + item_tax - promo_discount + shipping_price )

        # ----------------------------------------------------------
        # GST RATE
        # ----------------------------------------------------------

        gst_rate = float(str(row.get("sku_gst_rate") or 0))

        # ----------------------------------------------------------
        # TCS RATE
        # ----------------------------------------------------------

        tcs_rate = float(str(row.get("sku_tcs_rate") or 1))
        tds_rate = float(str(row.get("sku_tds_rate") or 0))

        # ----------------------------------------------------------
        # TAXABLE VALUE
        # GST INCLUDED SALES -> REMOVE GST
        # ----------------------------------------------------------

        if gst_rate > 0:

            taxable_value = (
                adjusted_gross_sales /
                (1 + (gst_rate / float("100")))
            )

            gst_to_pay_amount = (
                adjusted_gross_sales
                - taxable_value
            )

        else:

            taxable_value = adjusted_gross_sales

            gst_to_pay_amount = item_tax

        # ----------------------------------------------------------
        # GST %
        # ----------------------------------------------------------

        gst_to_pay_perc = gst_rate if gst_rate else (
            (gst_to_pay_amount / taxable_value) * 100
            if taxable_value else float("0")
        )

        # ----------------------------------------------------------
        # TCS
        # ----------------------------------------------------------

        tcs_total = (
            taxable_value *
            (tcs_rate / float("100"))
        )
        tds_total = (
            taxable_value *
            (tds_rate / float("100"))
        ) if tds_rate else float("0")
        

        adjusted_gross_sales = gross_sales + item_tax - promo_discount + shipping_price

        # orders = asin_map.get(asin, [])
        orders = asin_map.get(parent_asin, [])

        refund = rto = ads = mpfees = shipping_fee = 0
        return_units = 0
        gst = 0
        # tcs_total = 0  
        t_new_charge = 0   

        # ==========================================================
        # ADS SPEND (FROM PRODUCT AD METRICS)
        # ==========================================================

        ads_metrics_qs = ProductAdMetric.objects.filter(
            product_ad__amazon_account__user=user,
            product_ad__amazon_account__is_primary=True,
        )

        # DATE FILTER
        if from_date:
            ads_metrics_qs = ads_metrics_qs.filter(
                report_date__gte=from_date.date()
            )

        if to_date:
            ads_metrics_qs = ads_metrics_qs.filter(
                report_date__lt=to_date.date()
            )

        # GET ALL CHILD ORDER ITEMS
        order_items = (
            OrderItem.objects
            .filter(
                order_filter,
                parent_asin=parent_asin
            )
        )

        # CHILD SKUS
        child_skus = list(
            order_items
            .exclude(seller_sku__isnull=True)
            .exclude(seller_sku__exact="")
            .values_list("seller_sku", flat=True)
            .distinct()
        )

        # MATCH ADS USING CHILD SKU
        ads_metrics_qs = ads_metrics_qs.filter(
            product_ad__sku__in=child_skus
        ).distinct()

        # AGGREGATE
        ads_data = ads_metrics_qs.aggregate(
            total_ads_cost=Sum("cost"),
            total_ads_sales=Sum("sales"),
            total_ads_clicks=Sum("clicks"),
            total_ads_orders=Sum("orders"),
            total_ads_impressions=Sum("impressions"),
        )

        ads = -abs(float(ads_data["total_ads_cost"] or 0))

        # make negative because expense
        ads = -abs(ads)

        ads_sales = float(ads_data["total_ads_sales"] or 0)
        ads_clicks = int(ads_data["total_ads_clicks"] or 0)
        ads_orders = int(ads_data["total_ads_orders"] or 0)
        ads_impressions = int(ads_data["total_ads_impressions"] or 0)
        


        for o in orders:
            oid = o['order__amazon_order_id']
            qty = o['quantity_ordered'] or 0

            f = finance_map.get(oid, {})

            # -------- SINGLE CORRECT BLOCK --------
            r = float(f.get('refund') or 0)
            rto_amt = float(f.get('rto') or 0)

            refund += r
            rto += rto_amt
            # ads += float(f.get('ads') or 0)

            mpfees += (
                float(f.get('commission') or 0) +
                float(f.get('fulfillment') or 0) +
                float(f.get('other_fee') or 0)
            )

            shipping_fee += float(f.get('shipping_fee') or 0)
            gst += float(f.get('gst') or 0)

            # -------- RAW TCS --------
            raw_list = raw_data_map.get(oid, [])
            tcs = 0

            
            order_fee_map = extract_fees_and_tcs_per_asin(
                raw_data_map.get(oid, []),
                sku_asin_map=sku_asin_map
            )

            # total_estimatefees += estimated_fees

            for child_asin, fee_data in order_fee_map.items():

                parent_key = child_parent_map.get(child_asin)

                if parent_key == parent_asin:
                    t_new_charge += float(fee_data["fee"])
                    # tcs_total += float(fee_data["tcs"])

           

            if r < 0 or rto_amt < 0:
                return_units += qty

        # ---------------- CALCULATIONS ----------------
        # net_qty = max(gross_qty - return_units, 0)
        net_qty = max(gross_qty , 0)
    
        net_sales = adjusted_gross_sales
        shipping_final = shipping_price 

        mp_gst = (net_sales + shipping_final) * 0.18

        

        # total_cost = float(row.get('total_cost') or 0)
        # total_cost = float(50)
        # total_cost = float(50) * net_qty

        standard_cost = float(
            str(row.get("sku_standard_cost") or 0)
        )

        total_cost = standard_cost * float(str(net_qty))
        avg_cost = float(row.get('avg_cost') or 0)

        stdcost = total_cost
        stdcost_per_unit = (total_cost / gross_qty) if gross_qty else 0

        missing_qty = 0
        for o in orders:
            if o.get('quantity_ordered') and avg_cost == 0:
                missing_qty += o['quantity_ordered']

        stdcost_missing_percentage = (missing_qty / gross_qty * 100) if gross_qty else 0
        
        # profit = (
        #     net_sales
        #     - estimated_fees
        #     - shipping_final
        #     - stdcost
        #     + tcs_total
        #     + mp_gst
        #     + ads
        
        # )
        profit = (
            net_sales
            - estimated_fees
            - shipping_final
            - stdcost
            + tcs_total
            + mp_gst
            + ads
            - gst_to_pay_amount
        
        )

        # exp_settlement = (
        #     profit
        #     # - stdcost
        #     - tcs_total
        #     - mp_gst
        # )
        exp_settlement = (
            net_sales
            - shipping_final
            - tcs_total
            - mp_gst
        )
        
        profit_margin = (profit / net_sales * 100) if net_sales else 0
        # tacos = (ads / gross_sales * 100) if gross_sales else 0
        tacos = (
            abs(ads) / gross_sales * 100
        ) if gross_sales else 0
        ret_percent = (return_units / net_qty * 100) if net_qty else 0


        results.append({
            # "asin": asin,
            "asin": parent_asin, 
            "parent_asin": parent_asin, 
            "name": row['title'],
            "image_url": row['image_url'],
            "channel": "Amazon-India",
            "channel1": "Amazon-India",
            "grossqty": gross_qty,
            "netqty": net_qty,
            "final_net_qty": net_qty,
            "grosssales": format_currency(gross_sales),
            "netsales": format_currency(net_sales),
            "final_net_sales": format_currency(net_sales),
            # "ads": format_currency(ads),
            "ads": format_currency(ads),
            "ads_sales": format_currency(ads_sales),
            "ads_clicks": ads_clicks,
            "ads_orders": ads_orders,
            "ads_impressions": ads_impressions,
            "mpfees": round(mpfees, 2),
            "mp_gst": format_currency(mp_gst),
            "new_mpfees": format_currency(t_new_charge),
            # "estimatefees": format_currency(estimated_fees),
            "estimatefees": format_currency(-abs(estimated_fees)),

            "referral_fee": format_currency(referral_fee),
            "closing_fee": format_currency(closing_fee),
            "per_item_fee": format_currency(per_item_fee),

            "fba_fee": format_currency(fba_fee),
            "fba_pick_pack_fee": format_currency(fba_pick_pack_fee),
            "fba_weight_handling_fee": format_currency(fba_weight_handling_fee),

            "tax_amount": format_currency(tax_amount),
            "shippingfees": format_currency(shipping_final),
            "profit": format_currency(profit),
            "grossprofitper": round(profit_margin, 2),
            "returnqty": return_units,
            "retpercent": round(ret_percent, 2),
            "tacos": round(tacos, 2),
            # "id": asin,
            "id": parent_asin,
            "stdcost": format_currency(stdcost),
            "stdcost_per_unit": round(stdcost_per_unit, 2),
            "stdcostmissingqty": missing_qty,
            "stdcost_missing_percentage": round(stdcost_missing_percentage, 2),
            "redirecturl": f"https://www.amazon.in/dp/{parent_asin}" if parent_asin else None,
            "gst": format_currency(0),
            # "gst": "0",
            "tcs": format_currency(tcs_total),
            "tds": format_currency(tds_total),
            "taxable_value": format_currency(taxable_value),

            "gst_to_pay_amount": format_currency(gst_to_pay_amount),

            "gst_to_pay_perc": round(gst_to_pay_perc, 2),

            "exp_settlement": format_currency(exp_settlement),
        })

        # -------- TOTALS --------
        total_sales += gross_sales
        total_net_sales += net_sales
        total_profit += profit
        total_ads += ads
        total_mpfees += t_new_charge
        total_qty += net_qty
        total_returns += return_units
        total_shipping += shipping_final
        total_stdcost += stdcost
        total_gst += gst
        total_tcs += tcs_total
        total_tds += tds_total
        total_ret_percent += ret_percent
        total_estimatefees += estimated_fees
        total_mp_gst += mp_gst

        total_taxable_value += taxable_value
        total_gst_payable += gst_to_pay_amount
        total_exp_settlement += exp_settlement

    # -------- DEBUG AFTER BUILD --------
    db_asins = set(OrderItem.objects.filter(order__user=user).values_list('asin', flat=True))
    api_asins = set([r['asin'] for r in results])
    missing = db_asins - api_asins

    print("Missing ASINs:", len(missing))

    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": len(results)
        },
        "totals": {
            "ads": format_currency(total_ads),
            "netqty": total_qty,
            "totalreturn": total_returns,
            "totalreturnper": f"{round(total_ret_percent, 2)}%",
            "grosssales": format_currency(total_sales),
            "netsales": format_currency(total_net_sales),
            "profit": format_currency(total_profit),
            "grossprofitper": round((total_profit / total_net_sales * 100), 2) if total_net_sales else 0,
            "mpfees": format_currency(total_mpfees),
            "mp_gst": format_currency(total_mp_gst),
            # "estimatefees": format_currency(total_estimatefees),
            "estimatefees": format_currency(-abs(total_estimatefees)),
            "total_new_mpfees": format_currency(total_mpfees),
            "shippingfees": format_currency(total_shipping),
            "tacos": (total_ads / total_sales * 100) if total_sales else 0,
            "stdcost": format_currency(total_stdcost),
            # "totalgst": format_currency(total_tcs),
            "totalgst": format_currency(0),
            "tcs": format_currency(total_tcs),
            "tds": format_currency(total_tds),
            "taxable_value": format_currency(total_taxable_value),

            "gst_to_pay_amount": format_currency(total_gst_payable),
            "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",
            "exp_settlement": format_currency(total_exp_settlement),
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def amazon_profitability_parent(request):

    user = request.user
    data = request.data

    filters = data.get("filters", {})
    pagination = data.get("pagination", {})

    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))

    # ---------------- DATE FILTER ----------------
    from_date = to_date = None
    try:
        if filters.get("fromDate"):
            from_date = timezone.make_aware(datetime.strptime(filters["fromDate"], "%Y-%m-%d"))
        if filters.get("toDate"):
            to_date = timezone.make_aware(datetime.strptime(filters["toDate"], "%Y-%m-%d")) + timedelta(days=1)
    except Exception as e:
        print("Date error:", e)

    order_filter = Q(order__user=user)

    # ---------------- CHANNEL FILTER ----------------
    CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}
    channels = filters.get("channel", {}).get("IN", [])

    if channels:
        marketplace_ids = [CHANNEL_MAP.get(ch) for ch in channels if CHANNEL_MAP.get(ch)]
        order_filter &= Q(order__marketplace_id__in=marketplace_ids)

    # ---------------- PARENT FILTER (IMPORTANT) ----------------
    parent_ids = filters.get("parentproductid", {}).get("IN", [])
    if not parent_ids:
        return Response({
            "status": False,
            "message": "parentproductid is required"
        })

    order_filter &= Q(parent_asin__in=parent_ids)

    # ---------------- DATE APPLY ----------------
    if from_date:
        order_filter &= Q(order__purchase_date__gte=from_date)
    if to_date:
        order_filter &= Q(order__purchase_date__lte=to_date)


    # ============================================================
    # ITEMS QUERY WITH SKU LEVEL GST / COST / TCS
    # ============================================================

    listing_qs = AmazonListingItem.objects.filter(
        user=user
    ).filter(
        Q(sku=OuterRef("seller_sku")) | Q(asin=OuterRef("asin"))
    ).order_by("-updated_at")

    # ---------------- CHILD ASIN DATA ----------------
    items = (
        OrderItem.objects
        .filter(order_filter)
        .exclude(order__order_status__icontains='Cancel')
        .annotate(

            # SKU LEVEL DATA
            sku_standard_cost=Subquery(
                listing_qs.values("standard_cost")[:1]
            ),

            sku_gst_rate=Subquery(
                listing_qs.values("gst_rate")[:1]
            ),

            sku_tcs_rate=Subquery(
                listing_qs.values("tcs")[:1]
            ),

            sku_tds_rate=Subquery(
                listing_qs.values("tds")[:1]
            ),

            sku_region=Subquery(
                listing_qs.values("region")[:1]
            ),

            sku_shipping_estimate=Subquery(
                listing_qs.values("shiping_estimate")[:1]
            ),

            sku_step_level=Subquery(
                listing_qs.values("step_level")[:1]
            ),
        )
        .values(
            'asin',
            'parent_asin',
            'seller_sku',

            # SKU DATA
            'sku_standard_cost',
            'sku_gst_rate',
            'sku_tcs_rate',
            'sku_tds_rate',
            'sku_region',
            'sku_shipping_estimate',
            'sku_step_level',
        )
        .annotate(
            title=Max('title'),
            image_url=Max('image_url'),

            grossqty=Sum('quantity_ordered'),
            quantity_shipped=Sum('quantity_shipped'),

            shipping_price=Sum('shipping_price'),

            total_cost=Sum(
                F('cost_price') * F('quantity_ordered')
            ),

            grosssales=Sum('item_price'),
            promotion_discount=Sum('promotion_discount'),
            avg_cost=Avg('item_price'),
            item_tax=Sum('item_tax'),
        )
    )


    # ---------------- ESTIMATED FEES ----------------
    estimated_fee_qs = AmazonEstimatedFee.objects.filter(
        order_item__order__user=user
    )

    if from_date:
        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__order__purchase_date__gte=from_date
        )

    if to_date:
        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__order__purchase_date__lte=to_date
        )

    if channels:
        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__order__marketplace_id__in=marketplace_ids
        )


    estimated_fee_data = (
        estimated_fee_qs
        .values('asin')
        .annotate(
            estimated_fees=Sum('total_fees'),

            referral_fee=Sum('referral_fee'),
            closing_fee=Sum('closing_fee'),
            per_item_fee=Sum('per_item_fee'),

            fba_fee=Sum('fba_fee'),
            fba_pick_pack_fee=Sum('fba_pick_pack_fee'),
            fba_weight_handling_fee=Sum('fba_weight_handling_fee'),

            tax_amount=Sum('tax_amount'),
        )
    )


    estimated_fee_map = {
        row['asin']: {
            "estimated_fees": Decimal(str(row['estimated_fees'] or 0)),

            "referral_fee": Decimal(str(row['referral_fee'] or 0)),
            "closing_fee": Decimal(str(row['closing_fee'] or 0)),
            "per_item_fee": Decimal(str(row['per_item_fee'] or 0)),

            "fba_fee": Decimal(str(row['fba_fee'] or 0)),
            "fba_pick_pack_fee": Decimal(str(row['fba_pick_pack_fee'] or 0)),
            "fba_weight_handling_fee": Decimal(str(row['fba_weight_handling_fee'] or 0)),

            "tax_amount": Decimal(str(row['tax_amount'] or 0)),
        }
        for row in estimated_fee_data
    }

    # ---------------- FINANCE ----------------
    finances_qs = FinancialEvent.objects.filter(user=user)

    if from_date:
        finances_qs = finances_qs.filter(posted_date__gte=from_date)
    if to_date:
        finances_qs = finances_qs.filter(posted_date__lte=to_date)

    finance_data = (
        finances_qs
        .values('amazon_order_id')
        .annotate(
            refund=Sum('total_amount', filter=Q(event_group="REFUND")),
            rto=Sum('total_amount', filter=Q(event_group="RTO")),
            # ads=Sum('total_amount', filter=Q(event_type__icontains='Ad')),
            commission=Sum('commission_fee'),
            fulfillment=Sum('fulfillment_fee'),
            other_fee=Sum('other_fee'),
            shipping_fee=Sum('shipping_fee'),
        )
    )

    finance_map = {f['amazon_order_id']: f for f in finance_data}

    # ---------------- RAW MAP ----------------
    raw_map = FinancialEvent.objects.filter(user=user).exclude(raw_data=None).values('amazon_order_id', 'raw_data')

    raw_data_map = {}
    for r in raw_map:
        raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])

    # ---------------- ORDER MAP ----------------
    asin_orders = (
        OrderItem.objects
        .filter(order_filter)
        .values('asin', 'parent_asin', 'order__amazon_order_id', 'quantity_ordered')
    )

    asin_map = {}
    for row in asin_orders:
        asin_map.setdefault(row['asin'], []).append(row)

    # ---------------- SKU MAP ----------------
    sku_asin_map = {
        normalize_sku(k): v
        for k, v in OrderItem.objects.filter(order_filter).values_list('seller_sku', 'asin')
    }

    # ============================================================
    # ADS DATA MAP
    # ============================================================

    ads_metrics_qs = ProductAdMetric.objects.filter(
        product_ad__amazon_account__user=user,
        product_ad__amazon_account__is_primary=True,
    )

    if from_date:
        ads_metrics_qs = ads_metrics_qs.filter(
            report_date__gte=from_date.date()
        )

    if to_date:
        ads_metrics_qs = ads_metrics_qs.filter(
            report_date__lte=to_date.date()
        )

    # ============================================================
    # MAP ADS BY ASIN
    # ============================================================

    ads_data = (
        ads_metrics_qs
        .values(
            "product_ad__asin",
            "product_ad__sku",
        )
        .annotate(
            total_ads_cost=Sum("cost"),
            total_impressions=Sum("impressions"),
            total_clicks=Sum("clicks"),
            total_sales=Sum("sales"),
            total_orders=Sum("orders"),
        )
    )

    # ============================================================
    # ASIN ADS MAP
    # ============================================================

    ads_map = {}

    for row in ads_data:

        asin_key = (
            row["product_ad__asin"] or ""
        ).strip()

        sku_key = normalize_sku(
            row["product_ad__sku"] or ""
        )

        cost = Decimal(
            str(row["total_ads_cost"] or 0)
        )

        if asin_key not in ads_map:

            ads_map[asin_key] = {
                "cost": Decimal("0"),
                "clicks": 0,
                "impressions": 0,
                "sales": Decimal("0"),
                "orders": 0,
            }

        ads_map[asin_key]["cost"] += cost
        ads_map[asin_key]["clicks"] += int(
            row["total_clicks"] or 0
        )
        ads_map[asin_key]["impressions"] += int(
            row["total_impressions"] or 0
        )
        ads_map[asin_key]["sales"] += Decimal(
            str(row["total_sales"] or 0)
        )
        ads_map[asin_key]["orders"] += int(
            row["total_orders"] or 0
        )

        # optional SKU mapping
        if sku_key:

            if sku_key not in ads_map:

                ads_map[sku_key] = {
                    "cost": Decimal("0"),
                    "clicks": 0,
                    "impressions": 0,
                    "sales": Decimal("0"),
                    "orders": 0,
                }

            ads_map[sku_key]["cost"] += cost

    # ---------------- BUILD RESPONSE ----------------
    results = []

    total_sales = total_profit = total_ads = Decimal(0)
    total_net_sales = total_qty = Decimal(0)
    total_returns = total_shipping = Decimal(0)
    total_tcs = Decimal(0)
    total_tds = Decimal(0)
    total_mpfees = Decimal(0)   
    total_ret_percent = Decimal(0)  
    total_stdcost = Decimal(0) 
    adjusted_gross_sales = Decimal(0) 
    total_estimatefees = Decimal(0)
    total_mp_gst = Decimal(0)

    total_taxable_value = Decimal(0)
    total_gst_payable = Decimal(0)
    total_exp_settlement = Decimal(0)

    for row in items:

        asin = row['asin']
        parent_asin = row['parent_asin']
        child_sku = row['seller_sku']
    
        orders = asin_map.get(asin, [])
        
        # estimated_fees = estimated_fee_map.get(asin, Decimal("0"))

        fee_data = estimated_fee_map.get(asin, {})

        estimated_fees = fee_data.get("estimated_fees", Decimal("0"))

        referral_fee = fee_data.get("referral_fee", Decimal("0"))
        closing_fee = fee_data.get("closing_fee", Decimal("0"))
        per_item_fee = fee_data.get("per_item_fee", Decimal("0"))

        fba_fee = fee_data.get("fba_fee", Decimal("0"))
        fba_pick_pack_fee = fee_data.get("fba_pick_pack_fee", Decimal("0"))
        fba_weight_handling_fee = fee_data.get("fba_weight_handling_fee", Decimal("0"))

        tax_amount = fee_data.get("tax_amount", Decimal("0"))

        gross_qty = Decimal(row['grossqty'] or 0)
        gross_sales = Decimal(row['grosssales'] or 0)

        item_tax = Decimal(row.get('item_tax') or 0)
        promo_discount = Decimal(row.get('promotion_discount') or 0)

        shipping_price = Decimal(row.get('shipping_price') or 0)

        # ------------------------------------------------------------
        # ADJUSTED SALES
        # ------------------------------------------------------------

        adjusted_gross_sales = (
            gross_sales
            + item_tax
            - promo_discount
            + shipping_price
        )

        # ------------------------------------------------------------
        # SKU GST / TCS / TDS
        # ------------------------------------------------------------

        gst_rate = Decimal(str(row.get("sku_gst_rate") or 0))
        tcs_rate = Decimal(str(row.get("sku_tcs_rate") or 0))
        tds_rate = Decimal(str(row.get("sku_tds_rate") or 0))

        # ------------------------------------------------------------
        # TAXABLE VALUE
        # GST INCLUDED SALES -> REMOVE GST
        # ------------------------------------------------------------

        if gst_rate > 0:

            taxable_value = (
                adjusted_gross_sales / (1 + (gst_rate / 100))
            )
            gst_to_pay_amount = adjusted_gross_sales - taxable_value
            

        else:

            taxable_value = gross_sales
            gst_to_pay_amount = item_tax

        # ------------------------------------------------------------
        # TCS / TDS
        # ------------------------------------------------------------

        if tcs_rate:
            tcs_total = (
                gst_to_pay_amount *
                (tcs_rate / Decimal("100"))
            )
        else:
            # default 1% TCS
            tcs_total = (
                gst_to_pay_amount *
                (Decimal("1") / Decimal("100"))
            )   

        if tds_rate:
            tds_total = (
                taxable_value *
                (tds_rate / Decimal("100"))
            )
        else:
            tds_total = Decimal(0)

        # ------------------------------------------------------------
        # GST %
        # ------------------------------------------------------------

        if gst_rate:
            gst_to_pay_perc = gst_rate

        else:
          
            gst_to_pay_perc = (
                (gst_to_pay_amount / taxable_value) * 100
                if taxable_value else 1
            )  




        refund = rto = mpfees = shipping_fee = Decimal(0)
        return_units = Decimal(0)
        t_new_charge = Decimal(0)

        refund = rto = mpfees = shipping_fee = Decimal(0)

        # ============================================================
        # ADS SPEND
        # ============================================================

        ads = Decimal("0")

        # by child asin
        ads_row = ads_map.get(asin)

        if not ads_row:

            # fallback by sku
            ads_row = ads_map.get(
                normalize_sku(child_sku)
            )

        if ads_row:

            ads = -abs(
                Decimal(
                    str(ads_row["cost"] or 0)
                )
            )

        for o in orders:
            oid = o['order__amazon_order_id']
            qty = Decimal(o['quantity_ordered'] or 0)

            f = finance_map.get(oid, {})

            refund += Decimal(f.get('refund') or 0)
            rto += Decimal(f.get('rto') or 0)

            mpfees += (
                Decimal(f.get('commission') or 0) +
                Decimal(f.get('fulfillment') or 0) +
                Decimal(f.get('other_fee') or 0)
            )

            shipping_fee += Decimal(f.get('shipping_fee') or 0)

            order_fee_map = extract_fees_and_tcs_per_asin(
                raw_data_map.get(oid, []),
                sku_asin_map=sku_asin_map
            )

            if asin in order_fee_map:
                t_new_charge += Decimal(order_fee_map[asin]["fee"])

            r = Decimal(f.get('refund') or 0)
            rto_amt = Decimal(f.get('rto') or 0)

            refund += r
            rto += rto_amt

            if r < 0 or rto_amt < 0:
                return_units += qty

        # net_qty = max(gross_qty - return_units, 0)
        net_qty = max(gross_qty , 0)
        # net_sales = gross_sales + refund + rto
        net_sales = adjusted_gross_sales
        shipping_final = Decimal(row['shipping_price'] or 0)

        mp_gst = (net_sales + shipping_final) * Decimal("0.18")
        
        standard_cost = Decimal(
            str(row.get("sku_standard_cost") or 0)
        )

        total_cost = standard_cost * net_qty

        profit = (
            net_sales
            - estimated_fees
            - shipping_final
            + ads
            + tcs_total
            + mp_gst
            - total_cost
            - gst_to_pay_amount
        )

        exp_settlement = (
            net_sales
            - shipping_final
            - tcs_total
            - mp_gst
        )
        profit_margin = (profit / net_sales * 100) if net_sales else 0

        tacos = (
            (abs(ads) / gross_sales) * 100
            if gross_sales else 0
        )

        ret_percent = (return_units / net_qty * 100) if net_qty else 0
        

        results.append({
            "asin": asin,
            "parent_asin": parent_asin,
            "name": row['title'],
            "child_sku": clean_sku(child_sku),
            "image_url": row['image_url'],
            "channel": "Amazon-India",
            "channel1": "Amazon-India",

            "grossqty": int(gross_qty),
            "netqty": int(net_qty),
            "final_net_qty": int(net_qty),

            "grosssales": format_currency(gross_sales),
            "netsales": format_currency(net_sales),
            "final_net_sales": format_currency(net_sales),

            "ads": format_currency(ads),
            "tacos": round(tacos, 2),
            "mp_gst": format_currency(mp_gst),
            "new_mpfees": format_currency(t_new_charge),
         
            "estimatefees": format_currency(-abs(estimated_fees)),
            "referral_fee": format_currency(referral_fee),
            "closing_fee": format_currency(closing_fee),
            "per_item_fee": format_currency(per_item_fee),

            "fba_fee": format_currency(fba_fee),
            "fba_pick_pack_fee": format_currency(fba_pick_pack_fee),
            "fba_weight_handling_fee": format_currency(fba_weight_handling_fee),

            "tax_amount": format_currency(tax_amount),
            "shippingfees": format_currency(shipping_final),
            "tcs": format_currency(tcs_total),
            "tds": format_currency(tds_total),

            "profit": format_currency(profit),
            "grossprofitper": round(profit_margin, 2),
            "retpercent": round(ret_percent, 2),
            "returnqty": int(return_units),
            "gst": format_currency(0),

            "taxable_value": format_currency(taxable_value),
            "gst_to_pay_amount": format_currency(gst_to_pay_amount),
            "gst_to_pay_perc": round(gst_to_pay_perc, 2),
            "exp_settlement": format_currency(exp_settlement),

            "id": asin,
            "stdcost": format_currency(total_cost),
            "redirecturl": f"https://www.amazon.in/dp/{asin}" if asin else None,
        })


        total_sales += gross_sales
        total_net_sales += net_sales
        total_profit += profit
        total_ads += ads
        total_qty += net_qty
        total_returns += return_units
        total_shipping += shipping_final
        total_tcs += tcs_total
        total_tds += tds_total
        total_mpfees += t_new_charge
        total_ret_percent += ret_percent
        total_stdcost += total_cost
        total_estimatefees += Decimal(estimated_fees)
        total_mp_gst += mp_gst
        total_taxable_value += taxable_value
        total_gst_payable += gst_to_pay_amount
        total_exp_settlement += exp_settlement

    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": len(results)
        },
        "totals": {
            "ads": format_currency(total_ads),
            "netqty": total_qty,
            "totalreturn": total_returns,
            "totalreturnper": f"{round(total_ret_percent, 2)}%",
            "grosssales": format_currency(total_sales),
            "netsales": format_currency(total_net_sales),
            "profit": format_currency(total_profit),
            "grossprofitper": round((total_profit / total_net_sales * 100), 2) if total_net_sales else 0,
            "mpfees": format_currency(total_mpfees),
             "mp_gst": format_currency(total_mp_gst),
            # "estimatefees": format_currency(total_estimatefees),
            "estimatefees": format_currency(-abs(total_estimatefees)),
            "total_new_mpfees": format_currency(total_mpfees),
            "shippingfees": format_currency(total_shipping),
            "tacos": (total_ads / total_sales * 100) if total_sales else 0,
            "stdcost": format_currency(total_stdcost),
            # "totalgst": format_currency(total_tcs),
            "totalgst": format_currency(0),
            "tcs": format_currency(total_tcs),
            "tds": format_currency(total_tds),
            "taxable_value": format_currency(total_taxable_value),

            "gst_to_pay_amount": format_currency(total_gst_payable),
            "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",

            "exp_settlement": format_currency(total_exp_settlement),
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def amazon_profitability_parent_transactions_shipping(request):
    from amazon_auth.models import ProductMapping, OrderItem, AmazonListingItem, ProfitCalculationSetting

    user = get_effective_user(request.user)
    profit_setting, _ = ProfitCalculationSetting.objects.get_or_create(user=user)
    data = request.data

    filters = data.get("filters", {})
    pagination = data.get("pagination", {})

    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))
    
    # ---------------- SEARCH TERM (asin / parent_asin) ----------------
    search_term = filters.get("search") or filters.get("searchTerm") or filters.get("q") or filters.get("keyword")
    if isinstance(search_term, list) and search_term:
        search_term = search_term[0]
    if search_term:
        search_term = str(search_term).strip()

    # ---------------- DATE FILTER ----------------
    from_date = to_date = None
    from zoneinfo import ZoneInfo

    IST = ZoneInfo("Asia/Kolkata")

    from_date = to_date = None
    try:
        if filters.get("fromDate"):
            naive_from = datetime.strptime(filters["fromDate"], "%Y-%m-%d")
            from_date = naive_from.replace(tzinfo=IST).astimezone(ZoneInfo("UTC"))

        if filters.get("toDate"):
            naive_to = datetime.strptime(filters["toDate"], "%Y-%m-%d") + timedelta(days=1)
            to_date = naive_to.replace(tzinfo=IST).astimezone(ZoneInfo("UTC"))
    except Exception as e:
        print("Date error:", e)
        
        
    from_date_local = to_date_local = None
    try:
        if filters.get("fromDate"):
            from_date_local = datetime.strptime(filters["fromDate"], "%Y-%m-%d").date()
        if filters.get("toDate"):
            to_date_local = datetime.strptime(filters["toDate"], "%Y-%m-%d").date()
    except Exception as e:
        print("Date error:", e)    
        
    # try:
    #     if filters.get("fromDate"):
    #         from_date = timezone.make_aware(datetime.strptime(filters["fromDate"], "%Y-%m-%d"))
    #     if filters.get("toDate"):
    #         to_date = timezone.make_aware(datetime.strptime(filters["toDate"], "%Y-%m-%d")) + timedelta(days=1)
    # except Exception as e:
    #     print("Date error:", e)

    order_filter = Q(order__user=user)

    # ---------------- CHANNEL FILTER ----------------
    CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}
    channels = filters.get("channel", {}).get("IN", [])

    if channels:
        marketplace_ids = [CHANNEL_MAP.get(ch) for ch in channels if CHANNEL_MAP.get(ch)]
        order_filter &= Q(order__marketplace_id__in=marketplace_ids)

    # ---------------- PARENT FILTER (IMPORTANT) ----------------
    parent_ids = filters.get("parentproductid", {}).get("IN", [])
    if not parent_ids:
        return Response({
            "status": False,
            "message": "parentproductid is required"
        })

    order_filter &= Q(parent_asin__in=parent_ids)
    
    
    # ---------------- SEARCH FILTER (asin / parent_asin) ----------------
    if search_term:
        order_filter &= (
            Q(asin__icontains=search_term) |
            Q(parent_asin__icontains=search_term)
        )

    # ---------------- DATE APPLY ----------------
    if from_date:
        order_filter &= Q(order__purchase_date__gte=from_date)
    if to_date:
        order_filter &= Q(order__purchase_date__lte=to_date)


    # ============================================================
    # ITEMS QUERY WITH SKU LEVEL GST / COST / TCS
    # ============================================================

    listing_qs = AmazonListingItem.objects.filter(
        user=user
    ).filter(
        Q(sku=OuterRef("seller_sku")) | Q(asin=OuterRef("asin"))
    ).order_by("-updated_at")

    # ---------------- CHILD ASIN DATA ----------------
    items = (
        OrderItem.objects
        .filter(order_filter)
        .exclude(order__order_status__icontains='Cancel')
        .annotate(

            # SKU LEVEL DATA
            sku_standard_cost=Subquery(
                listing_qs.values("standard_cost")[:1]
            ),

            sku_gst_rate=Subquery(
                listing_qs.values("gst_rate")[:1]
            ),

            sku_tcs_rate=Subquery(
                listing_qs.values("tcs")[:1]
            ),

            sku_tds_rate=Subquery(
                listing_qs.values("tds")[:1]
            ),

            sku_region=Subquery(
                listing_qs.values("region")[:1]
            ),

            sku_shipping_estimate=Subquery(
                listing_qs.values("shiping_estimate")[:1]
            ),

            sku_step_level=Subquery(
                listing_qs.values("step_level")[:1]
            ),
        )
        .values(
            'asin',
            'parent_asin',
            'seller_sku',

            # SKU DATA
            'sku_standard_cost',
            'sku_gst_rate',
            'sku_tcs_rate',
            'sku_tds_rate',
            'sku_region',
            'sku_shipping_estimate',
            'sku_step_level',
        )
        .annotate(
            title=Max('title'),
            image_url=Max('image_url'),

            grossqty=Sum('quantity_ordered'),
            quantity_shipped=Sum('quantity_shipped'),

            shipping_price=Sum('shipping_price'),

            total_cost=Sum(
                F('cost_price') * F('quantity_ordered')
            ),

            # grosssales=Sum('item_price'),
            # promotion_discount=Sum('promotion_discount'),
            # avg_cost=Avg('item_price'),
            grosssales=Sum(
                Case(
                    When(Q(order__order_status__icontains='Pending') & Q(item_price=0), then=F('new_item_price')),
                    default=F('item_price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),
            promotion_discount=Sum('promotion_discount'),
            avg_cost=Avg(
                Case(
                    When(Q(order__order_status__icontains='Pending') & Q(item_price=0), then=F('new_item_price')),
                    default=F('item_price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),
            item_tax=Sum('item_tax'),
        )
    )


    # ---------------- ESTIMATED FEES ----------------
    estimated_fee_qs = AmazonEstimatedFee.objects.filter(
        order_item__order__user=user
    ).exclude(order_item__order__order_status__icontains='Cancel')

    if from_date:
        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__order__purchase_date__gte=from_date
        )

    if to_date:
        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__order__purchase_date__lte=to_date
        )

    if channels:
        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__order__marketplace_id__in=marketplace_ids
        )


    estimated_fee_data = (
        estimated_fee_qs
        .values('asin')
        .annotate(
            estimated_fees=Sum('total_fees'),

            referral_fee=Sum('referral_fee'),
            closing_fee=Sum('closing_fee'),
            per_item_fee=Sum('per_item_fee'),

            fba_fee=Sum('fba_fee'),
            fba_pick_pack_fee=Sum('fba_pick_pack_fee'),
            fba_weight_handling_fee=Sum('fba_weight_handling_fee'),

            tax_amount=Sum('tax_amount'),
        )
    )


    estimated_fee_map = {
        row['asin']: {
            "estimated_fees": Decimal(str(row['estimated_fees'] or 0)),

            "referral_fee": Decimal(str(row['referral_fee'] or 0)),
            "closing_fee": Decimal(str(row['closing_fee'] or 0)),
            "per_item_fee": Decimal(str(row['per_item_fee'] or 0)),

            "fba_fee": Decimal(str(row['fba_fee'] or 0)),
            "fba_pick_pack_fee": Decimal(str(row['fba_pick_pack_fee'] or 0)),
            "fba_weight_handling_fee": Decimal(str(row['fba_weight_handling_fee'] or 0)),

            "tax_amount": Decimal(str(row['tax_amount'] or 0)),
        }
        for row in estimated_fee_data
    }

    # ---------------- FINANCE ----------------
    finances_qs = FinancialEvent.objects.filter(user=user)

    if from_date:
        finances_qs = finances_qs.filter(posted_date__gte=from_date)
    if to_date:
        finances_qs = finances_qs.filter(posted_date__lte=to_date)

    finance_data = (
        finances_qs
        .values('amazon_order_id')
        .annotate(
            refund=Sum('total_amount', filter=Q(event_group="REFUND")),
            rto=Sum('total_amount', filter=Q(event_group="RTO")),
            # ads=Sum('total_amount', filter=Q(event_type__icontains='Ad')),
            commission=Sum('commission_fee'),
            fulfillment=Sum('fulfillment_fee'),
            other_fee=Sum('other_fee'),
            shipping_fee=Sum('shipping_fee'),
        )
    )

    finance_map = {f['amazon_order_id']: f for f in finance_data}

    # ---------------- RAW MAP ----------------
    raw_map = FinancialEvent.objects.filter(user=user).exclude(raw_data=None).values('amazon_order_id', 'raw_data')

    raw_data_map = {}
    for r in raw_map:
        raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])

    # ---------------- ORDER MAP ----------------
    asin_orders = (
        OrderItem.objects
        .filter(order_filter)
        .exclude(order__order_status__icontains='Cancel')
        .values('asin','seller_sku', 'parent_asin', 'order__amazon_order_id', 'quantity_ordered', 'item_price','new_item_price', 'item_tax', 'promotion_discount')
    )

    # asin_map = {}
    # for row in asin_orders:
    #     asin_map.setdefault(row['asin'], []).append(row)
    
    
    asin_map = {}
    for row in asin_orders:
        key = (row["asin"], row["seller_sku"])
        asin_map.setdefault(key, []).append(row)

    # ---------------- SKU MAP ----------------
    sku_asin_map = {
        normalize_sku(k): v
        for k, v in OrderItem.objects.filter(order_filter).values_list('seller_sku', 'asin')
    }

    # ============================================================
    # ADS DATA MAP
    # ============================================================
    
    ads_metrics_qs = ProductAdMetric.objects.filter(
        product_ad__amazon_account__user=user,
        product_ad__amazon_account__is_primary=True,
    )

    if from_date_local:
        ads_metrics_qs = ads_metrics_qs.filter(report_date__gte=from_date_local)

    if to_date_local:
        ads_metrics_qs = ads_metrics_qs.filter(report_date__lte=to_date_local)

    # ads_metrics_qs = ProductAdMetric.objects.filter(
    #     product_ad__amazon_account__user=user,
    #     product_ad__amazon_account__is_primary=True,
    # )

    # if from_date:
    #     ads_metrics_qs = ads_metrics_qs.filter(
    #         report_date__gte=from_date.date()
    #     )

    # if to_date:
    #     ads_metrics_qs = ads_metrics_qs.filter(
    #         report_date__lte=to_date.date()
    #     )

    # ============================================================
    # MAP ADS BY SKU (and associate to parent_asin)
    # ============================================================

    ads_agg = ads_metrics_qs.values("product_ad__sku").annotate(
        total_ads_cost=Sum("cost"),
        total_ads_sales=Sum("sales"),
        total_ads_clicks=Sum("clicks"),
        total_ads_orders=Sum("orders"),
        total_ads_impressions=Sum("impressions"),
    )

    skus_with_ads = [x["product_ad__sku"] for x in ads_agg if x["product_ad__sku"]]
    
    from amazon_auth.models import ProductMapping
    pm_mappings = ProductMapping.objects.filter(account__user=user, seller_sku__in=skus_with_ads).values("seller_sku", "parent_asin", "asin", "product_name", "image_url")
    pm_dict = {m["seller_sku"]: m for m in pm_mappings}
    
    missing_skus = [sku for sku in skus_with_ads if sku not in pm_dict]
    if missing_skus:
        ali_mappings = AmazonListingItem.objects.filter(user=user, sku__in=missing_skus).values("sku", "asin", "item_name", "image_url")
        for ali in ali_mappings:
            if ali["sku"] not in pm_dict:
                pm_dict[ali["sku"]] = {
                    "seller_sku": ali["sku"],
                    "parent_asin": ali["asin"],
                    "asin": ali["asin"],
                    "product_name": ali["item_name"],
                    "image_url": ali["image_url"],
                }

    missing_skus = [sku for sku in skus_with_ads if sku not in pm_dict]
    if missing_skus:
        oi_mappings = OrderItem.objects.filter(order__user=user, seller_sku__in=missing_skus).values("seller_sku", "parent_asin", "asin", "title", "image_url")
        for oi in oi_mappings:
            if oi["seller_sku"] not in pm_dict:
                pm_dict[oi["seller_sku"]] = {
                    "seller_sku": oi["seller_sku"],
                    "parent_asin": oi["parent_asin"],
                    "asin": oi["asin"],
                    "product_name": oi["title"],
                    "image_url": oi["image_url"],
                }
    
    ads_by_sku = {}
    for agg in ads_agg:
        sku = agg["product_ad__sku"]
        if not sku: continue
        
        pm = pm_dict.get(sku, {})
        p_asin = pm.get("parent_asin") or pm.get("asin") or sku
        
        # Only keep ads that belong to the requested parent_ids!
        if p_asin not in parent_ids:
            continue
            
        c_asin = pm.get("asin") or sku
        
        if sku not in ads_by_sku:
            ads_by_sku[sku] = {
                "parent_asin": p_asin,
                "asin": c_asin,
                "title": pm.get("product_name") or sku,
                "image_url": pm.get("image_url") or "",
                "cost": Decimal("0"), "sales": Decimal("0"), "clicks": 0, "orders": 0, "impressions": 0
            }
        
        ads_by_sku[sku]["cost"] += Decimal(str(agg["total_ads_cost"] or 0))
        ads_by_sku[sku]["sales"] += Decimal(str(agg["total_ads_sales"] or 0))
        ads_by_sku[sku]["clicks"] += int(agg["total_ads_clicks"] or 0)
        ads_by_sku[sku]["orders"] += int(agg["total_ads_orders"] or 0)
        ads_by_sku[sku]["impressions"] += int(agg["total_ads_impressions"] or 0)

    processed_skus = set()


    
    # ---------------- TRANSACTION SHIPPING FEES ----------------
    
    matching_order_ids = [row['order__amazon_order_id'] for row in asin_orders]
    tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        identifier_name="ORDER_ID",
        identifier_value__in=matching_order_ids
    ).values("transaction_id", "identifier_value")

    tx_to_order = {
        row["transaction_id"]: row["identifier_value"]
        for row in tx_identifiers
    }

    # ============================================================
    # SHIPPING STATUS PRIORITY
    #
    # Amazon can have the same financial event in multiple states:
    #
    # DEFERRED
    # DEFERRED_RELEASED
    # RELEASED
    #
    # We must not add DEFERRED + DEFERRED_RELEASED + RELEASED together.
    #
    # DEFERRED is preferred because it represents the
    # deferred transaction
    # ============================================================

    STATUS_PRIORITY = {
        "DEFERRED": 3,
        "DEFERRED_RELEASED": 2,
        "RELEASED": 1,
    }

    # ============================================================
    # MFN SHIPPING
    # ------------------------------------------------------------
    mfn_postage_txns = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="ServiceFee",
        transaction_status__in=[
            "DEFERRED",
            "DEFERRED_RELEASED",
            "RELEASED",
        ],
        description__icontains="MfnPostageFee",
    ).values(
        "id",
        "total_amount",
        "transaction_status",
    )

    # First group MFN amounts by:
    # order -> status

    mfn_by_order_status = {}

    for txn in mfn_postage_txns:
        order_id = tx_to_order.get(txn["id"])
        if not order_id:
            continue

        status = txn["transaction_status"]

        amount = Decimal(str(txn["total_amount"] or 0))

        key = (order_id, status)

        mfn_by_order_status[key] = mfn_by_order_status.get(key, Decimal("0")) + amount

    # Now select only the highest-priority status per order
    
    tx_shipping_map = {}
    
    for order_id in matching_order_ids:
    
        status_amounts = {
            status: amount
            for (oid, status), amount in mfn_by_order_status.items()
            if oid == order_id
        }
    
        if not status_amounts:
            continue
    
        best_status = max(
            status_amounts,
            key=lambda status: STATUS_PRIORITY.get(status, 0)
        )
    
        tx_shipping_map[order_id] = status_amounts[best_status]

    # ============================================================
    # AFN / FBA SHIPPING
    #
    # Shipment
    #     ↓
    # FBAWeightBasedFee
    # ============================================================

    afn_txns = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="Shipment",
        transaction_status__in=[
            "DEFERRED",
            "DEFERRED_RELEASED",
            "RELEASED",
        ],
    ).values(
        "id",
        "transaction_status",
    )

    afn_tx_status = {txn["id"]: txn["transaction_status"] for txn in afn_txns}

    afn_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=afn_tx_status.keys(),
            breakdown_type="FBAWeightBasedFee",
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )

    # Group FBA shipping by:
    # order -> status

    afn_by_order_status = {}

    for bd in afn_breakdowns:
        transaction_id = bd["transaction_id"]

        order_id = tx_to_order.get(transaction_id)

        if not order_id:
            continue

        status = afn_tx_status.get(transaction_id)

        if not status:
            continue

        amount = Decimal(str(bd["total"] or 0))

        key = (order_id, status)

        afn_by_order_status[key] = afn_by_order_status.get(key, Decimal("0")) + amount

    # Select highest-priority status per order
    
    for order_id in matching_order_ids:
    
        status_amounts = {
            status: amount
            for (oid, status), amount in afn_by_order_status.items()
            if oid == order_id
        }
    
        if not status_amounts:
            continue
    
        best_status = max(
            status_amounts,
            key=lambda status: STATUS_PRIORITY.get(status, 0)
        )
    
        # FBA shipping takes precedence for FBA orders
        tx_shipping_map[order_id] = status_amounts[best_status]
        
    
    # ============================================================
    # RETURN CLASSIFICATION (COURIER vs CUSTOMER) — matched by order_id
    # ============================================================
    FULFILLMENT_FEE_REFUND_PATTERNS = ["FulfillmentFeeRefund"]

    refund_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='Refund',
        transaction_status__in=['DEFERRED', 'DEFERRED_RELEASED']
    )

    refund_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=refund_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values('transaction_id', 'identifier_value')

    refund_tx_to_order = {
        row['transaction_id']: row['identifier_value']
        for row in refund_identifiers
    }

    # ============================================================
    # REFUNDED SALES MAP
    # ============================================================
    
    refund_tx_ids = refund_tx_to_order.keys()
    
    refunded_sales_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=refund_tx_ids,
            breakdown_type="Refunded Sales"
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )
    
    refunded_sales_by_order = {}
    
    for row in refunded_sales_breakdowns:
        order_id = refund_tx_to_order.get(row["transaction_id"])
        if not order_id:
            continue
    
        refunded_sales_by_order[order_id] = (
            refunded_sales_by_order.get(order_id, 0.0)
            + float(row["total"] or 0)
        )

    order_ids_with_refund = set(refund_tx_to_order.values())

    fee_refund_q = Q()
    for pattern in FULFILLMENT_FEE_REFUND_PATTERNS:
        fee_refund_q |= Q(description__icontains=pattern)

    fee_refund_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='ServiceFee',
        transaction_status__in=['DEFERRED', 'DEFERRED_RELEASED']
    ).filter(fee_refund_q)

    fee_refund_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=fee_refund_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values_list('identifier_value', flat=True)

    order_ids_with_fee_refund = set(fee_refund_identifiers)

    # ============================================================
    # FULFILLMENT FEE REFUND MAP
    # ============================================================
    
    fulfillment_fee_refund_breakdowns = (
        AmazonTransaction.objects.filter(
            id__in=tx_to_order.keys(),
            transaction_type="ServiceFee",
            transaction_status__in=["DEFERRED", "DEFERRED_RELEASED"],
            description__icontains="EasyshipFulfillmentFeeRefund",
        )
        .values("id", "total_amount")
    )
    
    fulfillment_fee_refund_by_order = {}
    # ============================================================
    # AMAZON FEES REFUND MAP
    # ============================================================
    
    amazon_fee_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=refund_tx_to_order.keys(),
            breakdown_type="AmazonFees",
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )
    
    amazon_fee_refund_by_order = {}
    
    for row in amazon_fee_breakdowns:
        order_id = refund_tx_to_order.get(row["transaction_id"])
        if not order_id:
            continue
    
        amazon_fee_refund_by_order[order_id] = (
            amazon_fee_refund_by_order.get(order_id, 0.0)
            + float(row["total"] or 0)
        )

    for txn in fulfillment_fee_refund_breakdowns:
        order_id = tx_to_order.get(txn["id"])
        if not order_id:
            continue
    
        fulfillment_fee_refund_by_order[order_id] = (
            fulfillment_fee_refund_by_order.get(order_id, 0.0)
            + float(txn["total_amount"] or 0)
        )

    refund_amount_by_order = {}
    refund_count_by_order = {}
    for txn in refund_txns.filter(id__in=refund_tx_to_order.keys()):
        oid = refund_tx_to_order.get(txn.id)
        if not oid:
            continue
        refund_amount_by_order[oid] = (
            refund_amount_by_order.get(oid, 0.0) + float(txn.total_amount or 0)
        )
        refund_count_by_order[oid] = refund_count_by_order.get(oid, 0) + 1

    # ============================================================
    # CLAIM AMOUNT — Transaction Type "Adjustment", description "SERRACReimbursement"
    # ============================================================
    claim_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='Adjustment',
        description__icontains='SERRACReimbursement',
    )

    claim_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=claim_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values('transaction_id', 'identifier_value')

    claim_tx_to_order = {
        row['transaction_id']: row['identifier_value']
        for row in claim_identifiers
    }

    claim_amount_by_order = {}
    claim_count_by_order = {}
    for txn in claim_txns.filter(id__in=claim_tx_to_order.keys()):
        oid = claim_tx_to_order.get(txn.id)
        if not oid:
            continue
        claim_amount_by_order[oid] = (
            claim_amount_by_order.get(oid, 0.0) + float(txn.total_amount or 0)
        )
        claim_count_by_order[oid] = claim_count_by_order.get(oid, 0) + 1    
        
     
    # ============================================================
    # REPLACEMENT RETURN — Transaction Type "Shipment",
    # description "Order Payment", total_amount = 0
    # ============================================================
    replacement_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='Shipment',
        description='Order Payment',
        total_amount=0,
    )

    replacement_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=replacement_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values('transaction_id', 'identifier_value')

    replacement_tx_to_order = {
        row['transaction_id']: row['identifier_value']
        for row in replacement_identifiers
    }

    order_ids_with_replacement = set(replacement_tx_to_order.values())

    replacement_count_by_order = {}
    for txn in replacement_txns.filter(id__in=replacement_tx_to_order.keys()):
        oid = replacement_tx_to_order.get(txn.id)
        if not oid:
            continue
        replacement_count_by_order[oid] = replacement_count_by_order.get(oid, 0) + 1

    total_replacement_return_count = len(order_ids_with_replacement)    

    # ---------------- BUILD RESPONSE ----------------
    results = []

    total_sales = total_profit = total_final_net_qty = total_ads = Decimal(0)
    total_net_sales = total_qty = Decimal(0)
    total_final_net_sales = Decimal(0)
    total_returns = total_shipping = Decimal(0)
    total_tcs = Decimal(0)
    total_tds = Decimal(0)
    total_mpfees = Decimal(0)   
    total_ret_percent = Decimal(0)  
    total_stdcost = Decimal(0) 
    adjusted_gross_sales = Decimal(0) 
    total_estimatefees = Decimal(0)
    total_mp_gst = Decimal(0)

    total_taxable_value = Decimal(0)
    total_gst_payable = Decimal(0)
    total_exp_settlement = Decimal(0)
    
    total_promo_discount = Decimal(0)
    
    total_courier_return_count = 0
    total_customer_return_count = 0
    
    total_return_count = 0
    courier_return_count = 0
    customer_return_count = 0
    courier_return_price = 0.0
    customer_return_price = 0.0
    total_claim_amount = 0.0
    total_claim_count = 0

    total_other_expenses = Decimal(0)

    # ---------------- CALCULATE OTHER EXPENSES ----------------
    parent_sku_map = {}
    for oi in asin_orders:
        p = oi.get('parent_asin') or oi.get('asin')
        s = oi.get('seller_sku')
        if p and s:
            parent_sku_map.setdefault(p, set()).add(s)

    pm_qs = ProductMapping.objects.filter(account__user=user).values('parent_asin', 'asin', 'seller_sku')
    for pm in pm_qs:
        p = pm.get('parent_asin') or pm.get('asin')
        s = pm.get('seller_sku')
        if p and s:
            parent_sku_map.setdefault(p, set()).add(s)

    ali_qs = AmazonListingItem.objects.filter(user=user).values('asin', 'sku')
    for ali in ali_qs:
        p = ali.get('asin')
        s = ali.get('sku')
        if p and s:
            parent_sku_map.setdefault(p, set()).add(s)

    processed_skus_in_order = set()
    parent_row_counts = {}
    for r in items:
        s = r.get('child_sku') or r.get('seller_sku')
        if s:
            processed_skus_in_order.add(s)
        p = r.get('parent_asin') or r.get('asin')
        if p:
            parent_row_counts[p] = parent_row_counts.get(p, 0) + 1

    for sku, data in ads_by_sku.items():
        if sku in processed_skus_in_order:
            continue
        if search_term:
            sku_val = str(sku or "")
            if search_term.lower() not in sku_val.lower():
                continue
        ads_cost = -abs(data["cost"])
        if ads_cost == 0:
            continue
        p = data.get("parent_asin") or data.get("asin")
        if p:
            parent_row_counts[p] = parent_row_counts.get(p, 0) + 1

    expense_items = []
    for idx, r in enumerate(items):
        g_qty = Decimal(r.get('grossqty') or 0)
        n_qty = max(g_qty, 0)
        f_sales = Decimal(r.get('grosssales') or 0)
        p = r.get('parent_asin') or r.get('asin')
        tot_p_skus = len(parent_sku_map.get(p, set())) or 1
        k_rows = parent_row_counts.get(p, 1) or 1
        sku_cnt = float(tot_p_skus) / float(k_rows)

        expense_items.append({
            'key': idx,
            'marketplace': r.get('channel') or r.get('marketplace') or 'Amazon-India',
            'units': float(n_qty),
            'net_sales': float(f_sales),
            'sku_count': sku_cnt,
            'order_count_for_sku': 1
        })

    for sku, data in ads_by_sku.items():
        if sku in processed_skus_in_order:
            continue
        if search_term:
            sku_val = str(sku or "")
            if search_term.lower() not in sku_val.lower():
                continue
        ads_cost = -abs(data["cost"])
        if ads_cost == 0:
            continue
        p = data.get("parent_asin") or data.get("asin")
        tot_p_skus = len(parent_sku_map.get(p, set())) or 1
        k_rows = parent_row_counts.get(p, 1) or 1
        sku_cnt = float(tot_p_skus) / float(k_rows)

        expense_items.append({
            'key': f"ad_sku_{sku}",
            'marketplace': 'Amazon-India',
            'units': 0.0,
            'net_sales': 0.0,
            'sku_count': sku_cnt,
            'order_count_for_sku': 1
        })

    other_expenses_map = calculate_other_expenses_map(user, from_date_local, to_date_local, expense_items)

    for idx, row in enumerate(items):

        asin = row['asin']
        parent_asin = row['parent_asin']
        child_sku = row['seller_sku']
    
        # orders = asin_map.get(asin, [])
        orders = asin_map.get((asin, child_sku), [])
        
        # estimated_fees = estimated_fee_map.get(asin, Decimal("0"))

        fee_data = estimated_fee_map.get(asin, {})

        estimated_fees = fee_data.get("estimated_fees", Decimal("0"))

        referral_fee = fee_data.get("referral_fee", Decimal("0"))
        closing_fee = fee_data.get("closing_fee", Decimal("0"))
        per_item_fee = fee_data.get("per_item_fee", Decimal("0"))

        fba_fee = fee_data.get("fba_fee", Decimal("0"))
        fba_pick_pack_fee = fee_data.get("fba_pick_pack_fee", Decimal("0"))
        fba_weight_handling_fee = fee_data.get("fba_weight_handling_fee", Decimal("0"))

        tax_amount = fee_data.get("tax_amount", Decimal("0"))

        gross_qty = Decimal(row['grossqty'] or 0)
        gross_sales = Decimal(row['grosssales'] or 0)

        item_tax = Decimal(row.get('item_tax') or 0)
        promo_discount = Decimal(row.get('promotion_discount') or 0)

        tx_shipping_final = Decimal("0")
        amazon_fee_refund_total = Decimal("0")
        fulfillment_fee_refund_total = Decimal("0")
        refunded_sales_total = Decimal("0")
        
        for o in orders:
            oid = o['order__amazon_order_id']
            tx_shipping_final += tx_shipping_map.get(oid, Decimal("0"))
            # amazon_fee_refund_total += Decimal(str(amazon_fee_refund_by_order.get(oid, 0.0)))
            amazon_fee_refund_total += Decimal((amazon_fee_refund_by_order.get(oid, 0.0)))
            print("amazon_fee_refund_total++++++++++++============",amazon_fee_refund_total)
            fulfillment_fee_refund_total += Decimal(str(fulfillment_fee_refund_by_order.get(oid, 0.0)))
            refunded_sales_total += Decimal(str(refunded_sales_by_order.get(oid, 0.0)))
            
        shipping_price = tx_shipping_final
        print("estimated_fees before++++++++++++============",estimated_fees)
        estimated_fees -= amazon_fee_refund_total
        print("estimated_fees afetr >>>>>>>+++++++++++============",estimated_fees)
        
        
        
        shipping_price = tx_shipping_final
        
        # ------------------------------------------------------------
        # RETURN / CLAIM — aggregated across all orders for this parent_asin row
        # ------------------------------------------------------------
        row_order_ids = [o['order__amazon_order_id'] for o in orders]

        order_return_amount = sum(refund_amount_by_order.get(oid, 0.0) for oid in row_order_ids)
        order_return_count = sum(refund_count_by_order.get(oid, 0) for oid in row_order_ids)
        order_has_return = any(oid in order_ids_with_refund for oid in row_order_ids)
        order_is_courier_return = any(oid in order_ids_with_fee_refund for oid in row_order_ids)

        if order_has_return and order_is_courier_return:
            order_return_type = "COURIER_RETURN"
        elif order_has_return:
            order_return_type = "CUSTOMER_RETURN"
        else:
            order_return_type = None

        # -------- Courier vs Customer split for THIS row's orders --------
        row_courier_return_count = 0
        row_customer_return_count = 0
        row_courier_return_price = 0.0
        row_customer_return_price = 0.0

        seen_order_ids_for_row = set(oid for oid in row_order_ids if oid in order_ids_with_refund)
        for oid in seen_order_ids_for_row:
            amount = refund_amount_by_order.get(oid, 0.0)
            if oid in order_ids_with_fee_refund:
                row_courier_return_count += 1
                row_courier_return_price += amount
            else:
                row_customer_return_count += 1
                row_customer_return_price += amount

        order_claim_amount = sum(claim_amount_by_order.get(oid, 0.0) for oid in row_order_ids)
        order_claim_count = sum(claim_count_by_order.get(oid, 0) for oid in row_order_ids)
        order_has_claim = order_claim_count > 0
        
        
         # ------------------------------------------------------------
        # REPLACEMENT RETURN — aggregated across all orders for this row
        # ------------------------------------------------------------
        order_replacement_count = sum(replacement_count_by_order.get(oid, 0) for oid in row_order_ids)
        order_is_replacement = any(oid in order_ids_with_replacement for oid in row_order_ids)
        
        
        # estimated_fees += promo_discount   #currently not use this 

        # ---------------- GST / TAXABLE ----------------


        # ------------------------------------------------------------
        # ADJUSTED SALES
        # ------------------------------------------------------------

        # adjusted_gross_sales = (
        #     gross_sales
        #     + item_tax
         
        #     + shipping_price
        # )
        adjusted_gross_sales = (
            gross_sales
            + item_tax
        
        )

        # ------------------------------------------------------------
        # SKU GST / TCS
        # ------------------------------------------------------------

        gst_rate = Decimal(str(row.get("sku_gst_rate") or 0))
        tcs_rate = Decimal(str(row.get("sku_tcs_rate") or 0))
        tds_rate = Decimal(str(row.get("sku_tds_rate") or 0))

        refund = rto = mpfees = shipping_fee = Decimal(0)
        return_units = Decimal(0)
        t_new_charge = Decimal(0)

        # ============================================================
        # ADS SPEND
        # ============================================================

        ads = Decimal("0")
        ads_row = ads_by_sku.get(child_sku)
        
        if ads_row:
            ads = -abs(ads_row["cost"])
            processed_skus.add(child_sku)

        standard_cost = Decimal(str(row.get("sku_standard_cost") or 0))
        final_net_sales = Decimal("0")
        total_cost = Decimal("0")

        for o in orders:
            oid = o['order__amazon_order_id']
            qty = Decimal(o['quantity_ordered'] or 0)  
            o_item_price = Decimal(str(o.get('item_price') or 0))
            o_new_item_price = Decimal(str(o.get('new_item_price') or 0))
            o_item_tax = Decimal(str(o.get('item_tax') or 0))

            f = finance_map.get(oid, {})

            refund += Decimal(f.get('refund') or 0)
            rto += Decimal(f.get('rto') or 0)

            mpfees += (
                Decimal(f.get('commission') or 0) +
                Decimal(f.get('fulfillment') or 0) +
                Decimal(f.get('other_fee') or 0)
            )

            shipping_fee += Decimal(f.get('shipping_fee') or 0)

            order_fee_map = extract_fees_and_tcs_per_asin(
                raw_data_map.get(oid, []),
                sku_asin_map=sku_asin_map
            )

            if asin in order_fee_map:
                t_new_charge += Decimal(order_fee_map[asin]["fee"])

            r = Decimal(f.get('refund') or 0)
            rto_amt = Decimal(f.get('rto') or 0)

            if r < 0 or rto_amt < 0:
                return_units += qty

            # Calculate final net sales and cost for this specific order
            
            # Calculate final net sales and cost for this specific order
            
            o_item_price = (
                o_new_item_price
                if o_item_price == 0
                else o_item_price
            )
            o_gross = o_item_price + o_item_tax
            # o_new_item_price
            print("o_new_item_price newwwwwwwww>>>>>>>>>>>>>>>>",o_new_item_price)
            
            print("o_item_price first>>>>>>>>>>>>>>>>",o_item_price)
            
            o_gross = o_item_price + o_item_tax
            o_cost = standard_cost * qty

            o_replacement_count = replacement_count_by_order.get(oid, 0)
            o_return_count = refund_count_by_order.get(oid, 0)
            o_has_return = oid in order_ids_with_refund

            if o_replacement_count or (o_has_return and qty == o_return_count):
                o_gross = Decimal("0")
                o_cost = Decimal("0")
                o_promo = Decimal(str(o.get('promotion_discount') or 0))
                promo_discount -= o_promo

            final_net_sales += o_gross
            total_cost += o_cost
            

        # ------------------------------------------------------------
        # TAXABLE VALUE
        # ------------------------------------------------------------
        
        if gst_rate > 0:
            taxable_value = (
                final_net_sales / (1 + (gst_rate / 100))
            )
            gst_to_pay_amount = final_net_sales - taxable_value
        else:
            taxable_value = final_net_sales
            gst_to_pay_amount = Decimal("0")

        # ------------------------------------------------------------
        # TCS / TDS
        # ------------------------------------------------------------

        if tcs_rate:
            tcs_total = (
                taxable_value *
                (tcs_rate / Decimal("100"))
            )
        else:
            # default 1% TCS
            tcs_total = (
                taxable_value *
                (Decimal("1") / Decimal("100"))
            )   

        if tds_rate:
            tds_total = (
                taxable_value *
                (tds_rate / Decimal("100"))
            )
        else:
            tds_total = Decimal(0)   

        if gst_rate:
            gst_to_pay_perc = gst_rate
        else:
            gst_to_pay_perc = (
                (gst_to_pay_amount / taxable_value) * 100
                if taxable_value else Decimal("1")
            )  

        net_qty = max(gross_qty , 0)
        final_net_qty = max(gross_qty, 0)
        
        net_sales = adjusted_gross_sales
        shipping_final = shipping_price + fulfillment_fee_refund_total

        mp_gst = (-abs(estimated_fees) + shipping_final) * Decimal("0.18")
        
        row_other_expense = Decimal(str(other_expenses_map.get(idx, 0)))

        profit = (
            final_net_sales
            + shipping_final
            + (ads if profit_setting.ad_spend else Decimal("0"))
            + (tcs_total if profit_setting.tcs else Decimal("0"))
            + (tds_total if profit_setting.tds else Decimal("0"))
            - estimated_fees
            - (mp_gst if profit_setting.input_gst_itc else Decimal("0"))
            - (gst_to_pay_amount if profit_setting.output_gst else Decimal("0"))
            - promo_discount
            - (Decimal(str(order_claim_amount)) if profit_setting.claim else Decimal("0"))
            - (total_cost if profit_setting.product_cost else Decimal("0"))
            - (row_other_expense if profit_setting.other_expense else Decimal("0"))
        )

        # exp_settlement = (
        #     final_net_sales
        #     + shipping_final
        #     + ads
        #     + tcs_total
        #     - estimated_fees
        #     - mp_gst
        #     - promo_discount
        #     - Decimal(str(order_claim_amount))
        # )
        
        exp_settlement = (
            final_net_sales
            + shipping_final
            # + ads                    remove this 
            - tcs_total                    #substract now 
            - tds_total                    #substract now 
            - estimated_fees
            - mp_gst
            - promo_discount
            + Decimal(str(order_claim_amount))    #add this one 
        )
        
        
        print("exp_settlement cccccccccccccccccccccccnewwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",exp_settlement)
        print("final_net_sales****************",final_net_sales)
        
        print("shipping_final****************",shipping_final)
        print("tcs_total>>>>>>>>>>>****************",tcs_total)
        print("tds_total>>>>>>>>>>>****************",tds_total)
        print("estimated_fees****************",estimated_fees)
        print("promo_discount>>>>>>>>>>>****************",promo_discount)
        print("mp_gst>>>>>>>>>>>****************",mp_gst)
        print("ads****************",ads)
        print("order_claim_amount****************",order_claim_amount)
        
        profit_margin = (profit / net_sales * 100) if net_sales else 0

        tacos = (
            (abs(ads) / gross_sales) * 100
            if gross_sales else 0
        )
        
        courier_return_count = 0
        customer_return_count = 0
        courier_return_price = 0.0
        customer_return_price = 0.0

        for order_id in order_ids_with_refund:
            amount = refund_amount_by_order.get(order_id, 0.0)
            if order_id in order_ids_with_fee_refund:
                courier_return_count += 1
                courier_return_price += amount
            else:
                customer_return_count += 1
                customer_return_price += amount

        total_claim_amount = sum(claim_amount_by_order.values())
        total_claim_count = len(claim_amount_by_order)
        
        row_customer_return_count += order_replacement_count
        
        order_return_count += order_replacement_count
        
        final_net_qty = final_net_qty - order_return_count 
        
        ret_percent = (order_return_count / net_qty * 100) if net_qty else 0
        

        results.append({
            "asin": asin,
            "parent_asin": parent_asin,
            "name": row['title'],
            "child_sku": clean_sku(child_sku),
            "image_url": row['image_url'],
            "channel": "Amazon-India",
            "channel1": "Amazon-India",

            "grossqty": int(gross_qty),
            "netqty": int(net_qty),
            "final_net_qty":final_net_qty,

            "grosssales": format_currency(gross_sales),
            "netsales": format_currency(net_sales),
            "final_net_sales": format_currency(final_net_sales),

            "ads": format_currency(ads),
            "tacos": round(tacos, 2),
            "mp_gst": format_currency(mp_gst),
            "new_mpfees": format_currency(t_new_charge),
         
            "estimatefees": format_currency(-abs(estimated_fees)),
            "other_expenses": format_currency(-abs(row_other_expense)),
            "referral_fee": format_currency(referral_fee),
            "closing_fee": format_currency(closing_fee),
            "per_item_fee": format_currency(per_item_fee),

            "fba_fee": format_currency(fba_fee),
            "fba_pick_pack_fee": format_currency(fba_pick_pack_fee),
            "fba_weight_handling_fee": format_currency(fba_weight_handling_fee),

            "tax_amount": format_currency(tax_amount),
            "shippingfees": format_currency(shipping_final),
            "tcs": format_currency(tcs_total),
            "tds": format_currency(tds_total),

            "profit": format_currency(profit),
            "grossprofitper": round(profit_margin, 2),
            "retpercent": round(ret_percent, 2),
            "returnqty": int(order_return_count),
            "gst": format_currency(0),

            "taxable_value": format_currency(taxable_value),
            "gst_to_pay_amount": format_currency(gst_to_pay_amount),
            "gst_to_pay_perc": round(gst_to_pay_perc, 2),
            "exp_settlement": format_currency(exp_settlement),

            "id": asin,
            "stdcost": format_currency(total_cost),
            "redirecturl": f"https://www.amazon.in/dp/{asin}" if asin else None,
            
            "promo_discount": format_currency(promo_discount),

            "return_type": order_return_type,
            "is_return": order_has_return,
            "return_count": order_return_count,
            "return_amount": format_currency(order_return_amount),
            
            "courier_return_count": row_courier_return_count,
            "customer_return_count": row_customer_return_count,
            "courier_return_price": format_currency(row_courier_return_price),
            "customer_return_price": format_currency(row_customer_return_price),

            "is_claim": order_has_claim,
            "claim_count": order_claim_count,
            "claim_amount": format_currency(order_claim_amount),
            
            "is_replacement_return": order_is_replacement,
            "replacement_return_count": order_replacement_count,
        })


        total_sales += gross_sales
        total_net_sales += net_sales
        total_final_net_sales += final_net_sales
        total_profit += Decimal(str(round(profit, 2)))
        total_other_expenses += row_other_expense
        total_ads += ads
        total_qty += net_qty
        total_final_net_qty += final_net_qty
        total_returns += return_units
        total_shipping += shipping_final
        total_tcs += Decimal(str(round(tcs_total, 2)))
        total_tds += Decimal(str(round(tds_total, 2)))
        total_mpfees += t_new_charge
        total_ret_percent += ret_percent
        total_stdcost += total_cost
        total_estimatefees += Decimal(estimated_fees)
        total_mp_gst += Decimal(str(round(mp_gst, 2)))
        total_taxable_value += Decimal(str(round(taxable_value, 2)))
        total_gst_payable += Decimal(str(round(gst_to_pay_amount, 2)))
        total_exp_settlement += Decimal(str(round(exp_settlement, 2)))  
        total_promo_discount += Decimal(str(round(promo_discount, 2))) 
        
        customer_return_count += order_replacement_count
        
        total_courier_return_count += row_courier_return_count
        total_customer_return_count += row_customer_return_count

        total_return_count += (
            row_courier_return_count
            + row_customer_return_count
        )

    # ====== ADD ASINS WITH AD SPEND BUT NO ORDERS ======
    for sku, data in ads_by_sku.items():
        ads_cost = 0
        if sku in processed_skus:
            continue
        
        if search_term:
            sku_val = str(sku or "")
            if search_term.lower() not in sku_val.lower():
                continue
            
        ads_cost = -abs(data["cost"])
        if ads_cost == 0:
            continue
            
        row_other_expense = Decimal(str(other_expenses_map.get(f"ad_sku_{sku}", Decimal(0))))
        profit = ads_cost - abs(row_other_expense)
        ads_margin = (profit / 100 * 100) if 1 else 0

        results.append({
            "asin": data["asin"],
            "parent_asin": data["parent_asin"],
            "name": data["title"],
            "child_sku": clean_sku(sku),
            "image_url": data["image_url"],
            "channel": "Amazon-India",
            "channel1": "Amazon-India",
            "grossqty": 0,
            "netqty": 0,
            "final_net_qty": 0,
            "grosssales": format_currency(0),
            "netsales": format_currency(0),
            "final_net_sales": format_currency(0),
            "ads": format_currency(ads_cost),
            "tacos": 0,
            "mp_gst": format_currency(0),
            "new_mpfees": format_currency(0),
            "estimatefees": format_currency(0),
            "other_expenses": format_currency(-abs(row_other_expense)),
            "referral_fee": format_currency(0),
            "closing_fee": format_currency(0),
            "per_item_fee": format_currency(0),
            "fba_fee": format_currency(0),
            "fba_pick_pack_fee": format_currency(0),
            "fba_weight_handling_fee": format_currency(0),
            "tax_amount": format_currency(0),
            "shippingfees": format_currency(0),
            "tcs": format_currency(0),
            "tds": format_currency(0),
            "profit": format_currency(profit),
            "grossprofitper": round(ads_margin, 2),
            "retpercent": 0,
            "returnqty": 0,
            "gst": format_currency(0),
            "taxable_value": format_currency(0),
            "gst_to_pay_amount": format_currency(0),
            "gst_to_pay_perc": 0,
            "exp_settlement": format_currency(0),
            "id": data["asin"],
            "stdcost": format_currency(0),
            "redirecturl": f"https://www.amazon.in/dp/{data['asin']}" if data['asin'] else None,
            "promo_discount": format_currency(0),
            "return_type": None,
            "is_return": False,
            "return_count": 0,
            "return_amount": format_currency(0),
            "courier_return_count": 0,
            "customer_return_count": 0,
            "courier_return_price": format_currency(0),
            "customer_return_price": format_currency(0),
            "is_claim": False,
            "claim_count": 0,
            "claim_amount": format_currency(0),
            "is_replacement_return": False,
            "replacement_return_count": 0,
        })
        
        total_ads += ads_cost
        total_profit += profit
        total_other_expenses += row_other_expense
    
    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": len(results)
        },
        "totals": {
            "ads": format_currency(total_ads),
            "netqty": total_qty,
            "total_final_net_qty":total_final_net_qty,
            "totalreturn": total_return_count,
            "totalreturnper": f"{round((total_return_count / float(total_qty) * 100), 2) if total_final_net_qty else 0.0}%",
            "grosssales": format_currency(total_sales),
            "netsales": format_currency(total_net_sales),
            "total_net_sales": format_currency(total_net_sales),
            "total_final_net_sales": format_currency(total_final_net_sales),
            "other_expenses": format_currency(-abs(total_other_expenses)),
            "total_other_expenses": format_currency(-abs(total_other_expenses)),
            "profit": format_currency(total_profit),
            "grossprofitper": (
                round((total_profit / total_net_sales) * 100, 2)
                if total_net_sales
                else round(total_profit, 2) if total_profit else 0
            ),
            "mpfees": format_currency(total_mpfees),
             "mp_gst": format_currency(total_mp_gst),
            # "estimatefees": format_currency(total_estimatefees),
            "estimatefees": format_currency(-abs(total_estimatefees)),
            "total_new_mpfees": format_currency(total_mpfees),
            "shippingfees": format_currency(total_shipping),
            "tacos": (total_ads / total_sales * 100) if total_sales else 0,
            "stdcost": format_currency(total_stdcost),
            # "totalgst": format_currency(total_tcs),
            "totalgst": format_currency(0),
            "tcs": format_currency(total_tcs),
            "tds": format_currency(total_tds),
            "taxable_value": format_currency(total_taxable_value),

            "gst_to_pay_amount": format_currency(total_gst_payable),
            "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 0}%",

            "exp_settlement": format_currency(total_exp_settlement),
            
            "total_promo_discount":format_currency(total_promo_discount),
            "total_return_count": total_return_count,
            # "courier_return_count": courier_return_count,   
            "courier_return_count": total_courier_return_count, 
            # "customer_return_count": customer_return_count,
            "customer_return_count": total_customer_return_count,
            "courier_return_price": format_currency(courier_return_price),
            "customer_return_price": format_currency(customer_return_price),
            
            "total_claim_count": total_claim_count,
            "total_claim_amount": format_currency(total_claim_amount),
            "total_replacement_return_count": total_replacement_return_count,
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sku_profit_report(request):

    user = request.user
    data = request.data

    # ---------------- GET ASIN ----------------
    filters = data.get("filters", {})
    # asin = data.get("parentProductId") or filters.get("parentProductId")

    # if not asin:
    #     return Response({
    #         "status": False,
    #         "message": "parentProductId is required"
    #     }, status=400)

    sku = data.get("sku") or filters.get("sku")

    if not sku:
        return Response({
            "status": False,
            "message": "sku is required"
        }, status=400)

    pagination = data.get("pagination", {})
    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))


   
    # ---------------- DATE FILTER ----------------
    from_date = None
    to_date = None

    try:
        if filters.get("fromDate"):
            from_date = timezone.make_aware(
                datetime.strptime(filters["fromDate"], "%Y-%m-%d")
            )

        if filters.get("endDate"):
            to_date = timezone.make_aware(
                datetime.strptime(filters["endDate"], "%Y-%m-%d")
            ) + timedelta(days=1)

        # ✅ FIX: handle single-day filter
        if from_date and not to_date:
            to_date = from_date + timedelta(days=1)

    except Exception as e:
        print("Date error:", e)
    valid_orders = (
        OrderItem.objects
        .filter(order__user=user)
    )

    # order_filter = Q(order__user=user, asin=asin)
    order_filter = Q(
        order__user=user,
        seller_sku=sku
    )

    if from_date:
        order_filter &= Q(order__purchase_date__gte=from_date)

    if to_date:
        order_filter &= Q(order__purchase_date__lt=to_date)   # ✅ IMPORTANT

    valid_order_ids = set(
        valid_orders.values_list('order__amazon_order_id', flat=True)
    )



    if valid_order_ids:
        order_filter &= Q(order__amazon_order_id__in=valid_order_ids)

    CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}

    channels = filters.get("channel", {}).get("IN", [])
    if channels:
        marketplace_ids = [CHANNEL_MAP[ch] for ch in channels if ch in CHANNEL_MAP]
        if marketplace_ids:
            order_filter &= Q(order__marketplace_id__in=marketplace_ids)

    if from_date:
        order_filter &= Q(order__purchase_date__gte=from_date)
    if to_date:
        order_filter &= Q(order__purchase_date__lte=to_date)

    # ============================================================
    # ITEMS QUERY WITH THIS new gst and st cost
    # ============================================================

    listing_qs = AmazonListingItem.objects.filter(
        user=user,
        sku=OuterRef("seller_sku")
    ).order_by("-updated_at")

    items = (
        OrderItem.objects
        .filter(order_filter)
        .exclude(order__order_status__icontains='Cancel')
        .annotate(

            # SKU LEVEL DATA
            sku_standard_cost=Subquery(
                listing_qs.values("standard_cost")[:1]
            ),

            sku_gst_rate=Subquery(
                listing_qs.values("gst_rate")[:1]
            ),

            sku_tcs_rate=Subquery(
                listing_qs.values("tcs")[:1]
            ),

            sku_region=Subquery(
                listing_qs.values("region")[:1]
            ),

            sku_shipping_estimate=Subquery(
                listing_qs.values("shiping_estimate")[:1]
            ),

            sku_step_level=Subquery(
                listing_qs.values("step_level")[:1]
            ),
        )
        .values(
            'order__amazon_order_id',
            'order__purchase_date',
            'seller_sku',

            # INCLUDE THESE
            'sku_standard_cost',
            'sku_gst_rate',
            'sku_tcs_rate',
            'sku_region',
            'sku_shipping_estimate',
            'sku_step_level',
        )
        .annotate(
            title=Max('title'),  
            image=Max('image_url'),
            asin=Max('asin'), 

            grossqty=Sum('quantity_ordered'),
            grosssales=Sum('item_price'),
            promotion_discount=Sum('promotion_discount'),
            avg_cost=Avg('item_price'),
            item_tax=Sum('item_tax'),

            shipping_income=Sum('shipping_price'),
            shipping_price=Sum('shipping_price'),

            total_cost=Sum(
                F('cost_price') * F('quantity_ordered')
            )
        )
        .order_by('-order__purchase_date')
    )



    estimated_fee_data = (
        # AmazonEstimatedFee.objects
        # .filter(
        #     order_item__order__user=user,
        #     asin=asin
        # )
        AmazonEstimatedFee.objects.filter(
            order_item__order__user=user,
            order_item__seller_sku=sku
        )
        .values('order_item__order__amazon_order_id')
        .annotate(
            estimated_fees=Sum('total_fees'),

            referral_fee=Sum('referral_fee'),
            closing_fee=Sum('closing_fee'),
            per_item_fee=Sum('per_item_fee'),

            fba_fee=Sum('fba_fee'),
            fba_pick_pack_fee=Sum('fba_pick_pack_fee'),
            fba_weight_handling_fee=Sum('fba_weight_handling_fee'),

            tax_amount=Sum('tax_amount'),
        )
    )


    estimated_fee_map = {
        row['order_item__order__amazon_order_id']: {

            "estimated_fees": float(row['estimated_fees'] or 0),

            "referral_fee": float(row['referral_fee'] or 0),
            "closing_fee": float(row['closing_fee'] or 0),
            "per_item_fee": float(row['per_item_fee'] or 0),

            "fba_fee": float(row['fba_fee'] or 0),
            "fba_pick_pack_fee": float(row['fba_pick_pack_fee'] or 0),
            "fba_weight_handling_fee": float(row['fba_weight_handling_fee'] or 0),

            "tax_amount": float(row['tax_amount'] or 0),
        }

        for row in estimated_fee_data
    }
    # ---------------- FINANCE ----------------
    # finance_qs = FinancialEvent.objects.filter(user=user)
    finance_qs = FinancialEvent.objects.filter(
        user=user,
        amazon_order_id__in=valid_order_ids
    )

    if from_date:
        finance_qs = finance_qs.filter(posted_date__gte=from_date)
    if to_date:
        finance_qs = finance_qs.filter(posted_date__lte=to_date)

    finance_data = (
        finance_qs
        .values('amazon_order_id')
        .annotate(
            refund=Sum('total_amount', filter=Q(event_group="REFUND")),
            # ads=Sum('total_amount', filter=Q(event_type__icontains='Ad')),

            commission=Sum('commission_fee'),
            fulfillment=Sum('fulfillment_fee'),
            other_fee=Sum('other_fee'),

            shipping_fee=Sum('shipping_fee'),
            gst=Sum('tax')
        )
    )

    finance_map = {f['amazon_order_id']: f for f in finance_data}

    # ---------------- RAW DATA (TCS) ----------------
    raw_map = (
        FinancialEvent.objects
        .filter(user=user, amazon_order_id__in=valid_order_ids)
        .exclude(raw_data=None)
        .values('amazon_order_id', 'raw_data')
    )

    raw_data_map = {}
    for r in raw_map:
        raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])



    # ============================================================
    # ADS SPEND MAP (APPLY BEFORE BUILD RESPONSE)
    # ============================================================

    # GET ALL SKU LIST
    sku_list = list(
        OrderItem.objects
        .filter(order_filter)
        .exclude(seller_sku__isnull=True)
        .exclude(seller_sku__exact="")
        .values_list("seller_sku", flat=True)
        .distinct()
    )

    normalized_skus = [
        normalize_sku(sku)
        for sku in sku_list
    ]

    # ------------------------------------------------------------
    # GET ADS SPEND SKU LEVEL
    # ------------------------------------------------------------

    # ============================================================
    # ADS SPEND MAP (APPLY BEFORE BUILD RESPONSE)
    # ============================================================

    # GET ALL SKU LIST
    sku_list = list(
        OrderItem.objects
        .filter(order_filter)
        .exclude(seller_sku__isnull=True)
        .exclude(seller_sku__exact="")
        .values_list("seller_sku", flat=True)
        .distinct()
    )

    normalized_skus = [
        normalize_sku(sku)
        for sku in sku_list
    ]

    # ------------------------------------------------------------
    # GET ADS SPEND SKU LEVEL
    # ------------------------------------------------------------

    ads_metrics_qs = (
        ProductAdMetric.objects
        .filter(
            product_ad__amazon_account__user=user,
            product_ad__amazon_account__is_primary=True,
        )
    )

    if from_date:
        ads_metrics_qs = ads_metrics_qs.filter(
            report_date__gte=from_date.date()
        )

    if to_date:
        ads_metrics_qs = ads_metrics_qs.filter(
            report_date__lte=to_date.date()
        )
    # ============================================================
    # ADS DATA
    # ============================================================

    ads_data = (
        ads_metrics_qs
        .values(
            "product_ad__asin",
            "product_ad__sku",
        )
        .annotate(
            total_ads_cost=Sum("cost"),
            total_impressions=Sum("impressions"),
            total_clicks=Sum("clicks"),
            total_sales=Sum("sales"),
            total_orders=Sum("orders"),
        )
    )

    # ============================================================
    # ADS MAP
    # ============================================================

    ads_map = {}

    for row in ads_data:

        asin_key = (
            row["product_ad__asin"] or ""
        ).strip()

        sku_key = normalize_sku(
            row["product_ad__sku"] or ""
        )

        cost = float(
            str(row["total_ads_cost"] or 0)
        )

        if asin_key not in ads_map:

            ads_map[asin_key] = {
                "cost": float("0"),
                "clicks": 0,
                "impressions": 0,
                "sales": float("0"),
                "orders": 0,
            }

        ads_map[asin_key]["cost"] += cost
        ads_map[asin_key]["clicks"] += int(
            row["total_clicks"] or 0
        )
        ads_map[asin_key]["impressions"] += int(
            row["total_impressions"] or 0
        )
        ads_map[asin_key]["sales"] += float(
            str(row["total_sales"] or 0)
        )
        ads_map[asin_key]["orders"] += int(
            row["total_orders"] or 0
        )

        # OPTIONAL SKU MAP
        if sku_key:

            if sku_key not in ads_map:

                ads_map[sku_key] = {
                    "cost": float("0"),
                    "clicks": 0,
                    "impressions": 0,
                    "sales": float("0"),
                    "orders": 0,
                }

            ads_map[sku_key]["cost"] += cost    

    # ---------------- BUILD RESPONSE ----------------
    results = []

    total_sales = total_profit = total_qty = 0
    total_ads = total_mpfees = total_shipping = 0
    total_gst = total_tcs = total_cost = 0
    total_net_sales = 0
    total_returns = 0
    total_ret_percent =0
    total_new_charge = 0
    adjusted_gross_sales = 0
    total_estimatefees = 0
    total_mp_gst = 0

    total_taxable_value = 0
    total_gst_payable = 0

    total_exp_settlement = 0

    for row in items:

        oid = row['order__amazon_order_id']

        gross_qty = int(row['grossqty'] or 0)
        gross_sales = float(row['grosssales'] or 0)

        asin =row['asin']

        item_tax = float(row.get('item_tax') or 0)
        promo_discount = float(row.get('promotion_discount') or 0)


        fee_data = estimated_fee_map.get(oid, {})

        estimated_fees = fee_data.get("estimated_fees", 0)

        referral_fee = fee_data.get("referral_fee", 0)
        closing_fee = fee_data.get("closing_fee", 0)
        per_item_fee = fee_data.get("per_item_fee", 0)

        fba_fee = fee_data.get("fba_fee", 0)
        fba_pick_pack_fee = fee_data.get("fba_pick_pack_fee", 0)
        fba_weight_handling_fee = fee_data.get("fba_weight_handling_fee", 0)

        tax_amount = fee_data.get("tax_amount", 0)

        # adjusted_gross_sales = gross_sales + item_tax - promo_discount

        shipping_income = float(row['shipping_income'] or 0)
        shipping_price = float(row['shipping_price'] or 0)

        # ============================================================
        # ADS SPEND
        # ============================================================

        ads = float("0")

        child_sku = row.get("seller_sku")

        # BY ASIN
        # ads_row = ads_map.get(asin)
        ads_row = ads_map.get(
            normalize_sku(sku)
        )

        # FALLBACK BY SKU
        if not ads_row and child_sku:

            ads_row = ads_map.get(
                normalize_sku(child_sku)
            )

        if ads_row:

            ads = -abs(
                float(
                    str(ads_row.get("cost") or 0)
                )
            )

        adjusted_gross_sales = gross_sales + item_tax - promo_discount + shipping_price
        
        # cost = float(row['total_cost'] or 0)
        # cost = float(50) * gross_qty

        standard_cost = float(row.get("sku_standard_cost") or 0)

        cost = standard_cost * gross_qty

        f = finance_map.get(oid, {})

        refund = float(f.get('refund') or 0)
        # ads = float(f.get('ads') or 0)

        mpfees = (
            float(f.get('commission') or 0) +
            float(f.get('fulfillment') or 0) +
            float(f.get('other_fee') or 0)
        )

        shipping_fee = float(f.get('shipping_fee') or 0)


        gst = float(f.get('gst') or 0)

        # ---------------- TCS ----------------

        gst_rate = float(str(row.get("sku_gst_rate") or 0))
        tcs_rate = float(str(row.get("sku_tcs_rate") or 0))

        if gst_rate > 0:

            taxable_value = (
                adjusted_gross_sales /
                (float("1") + (gst_rate / float("100")))
            )

            gst_to_pay_amount = (
                adjusted_gross_sales - taxable_value
            )

            gst_to_pay_perc = gst_rate

        else:

            taxable_value = gross_sales
            gst_to_pay_amount = item_tax

            gst_to_pay_perc = (
                (gst_to_pay_amount / taxable_value) * float("100")
                if taxable_value else float("0")
            )

        # TCS
        tcs = (
            taxable_value *
            ((tcs_rate or float("1")) / float("100"))
        )

        # tcs = taxable_value * (tcs_rate / 100)

        # ------------------------------------------------------------
        # GST %
        # ------------------------------------------------------------
        if gst_rate:
            gst_to_pay_perc = gst_rate

        else:
          
            gst_to_pay_perc = (
                (gst_to_pay_amount / taxable_value) * 100
                if taxable_value else 1
            )    
   
        # ---------------- NEW FEES (SUM OF ALL FEETYPES) ----------------
        new_charge = 0

        for raw in raw_data_map.get(oid, []):
            if not isinstance(raw, dict):
                continue

            try:
                # ✅ Handle BOTH types
                item_lists = []
                item_lists.extend(raw.get("ShipmentItemList", []))
                item_lists.extend(raw.get("ShipmentItemAdjustmentList", []))

                for item in item_lists:

                    fee_lists = []
                    fee_lists.extend(item.get("ItemFeeList", []))               # ✅ NORMAL
                    fee_lists.extend(item.get("ItemFeeAdjustmentList", []))     # ✅ REFUND

                    for fee in fee_lists:
                        amount = float(
                            fee.get("FeeAmount", {}).get("CurrencyAmount", 0) or 0
                        )
                        new_charge += amount

            except Exception:
                pass

        # ---------------- RETURNS ----------------
        return_units = abs(refund) / (gross_sales / gross_qty) if gross_qty and gross_sales else 0
        return_units = int(round(return_units))

        # net_qty = max(gross_qty - return_units, 0)
        net_qty = max(gross_qty , 0)

        # ---------------- CALCULATIONS ----------------
        # net_sales = gross_sales + refund
        net_sales = adjusted_gross_sales
        # shipping_final = shipping_income  

        shipping_final = shipping_income

        # MP GST = 18% of (netsales + shipping)
        mp_gst = (net_sales + shipping_final) * 0.18


        profit = (
            net_sales
            - estimated_fees
            - shipping_final
            + ads
            - cost
            + tcs
            + mp_gst
            - gst_to_pay_amount
        )

        # exp_settlement = profit - cost - tcs - mp_gst

        exp_settlement = (
            net_sales
            - shipping_final
            - tcs
            - mp_gst
        )
        

        profit_margin = (profit / net_sales * 100) if net_sales else 0
        # tacos = (ads / gross_sales * 100) if gross_sales else 0
        tacos = (
            (abs(ads) / gross_sales) * 100
            if gross_sales else 0
        )
        drr = tacos
        ret_percent = (return_units / net_qty * 100) if net_qty else 0

        results.append({
            "order_id": oid,
            "date": row['order__purchase_date'],
            "name": row['title'],
            "image": row['image'],

            "channel": "Amazon-India",
            "channel1": "Amazon-India",
            # "redirecturl": f"https://www.amazon.in/dp/{asin}",
            "redirecturl": f"https://www.amazon.in/dp/{row['asin']}",

            "grossqty": gross_qty,
            "qty": net_qty,

            "grosssales": round(gross_sales, 2),
            "netsales": format_currency(net_sales),

            "taxable_value":
            format_currency(taxable_value),

            "gst_to_pay_amount":
            format_currency(gst_to_pay_amount),

            "gst_to_pay_perc":
            round(gst_to_pay_perc, 2),

            "ads": format_currency(ads),
            "mpfees": round(mpfees, 2),
            "mp_gst": format_currency(mp_gst),
            # "estimatefees": format_currency(estimated_fees),
            "estimatefees": format_currency(-abs(estimated_fees)),
            "referral_fee": format_currency(referral_fee),
            "closing_fee": format_currency(closing_fee),
            "per_item_fee": format_currency(per_item_fee),

            "fba_fee": format_currency(fba_fee),
            "fba_pick_pack_fee": format_currency(fba_pick_pack_fee),
            "fba_weight_handling_fee": format_currency(fba_weight_handling_fee),

            "tax_amount": format_currency(tax_amount),
            "new_mpfees": format_currency(new_charge),
            "shippingfees": format_currency(shipping_final),

            "profit": format_currency(profit),
            "grossprofitper": round(profit_margin, 2),

            "returnqty": return_units,
            "retpercent": round(ret_percent, 2),

            "tacos": round(tacos, 2),
            "drr": round(drr, 2),

            "stdcost": format_currency(cost),

            # "gst": format_currency(tcs),
            "gst": format_currency(0),
            "tcs": format_currency(tcs),
            "exp_settlement":format_currency(exp_settlement),
        })

        # ---------------- TOTALS ----------------
        total_sales += gross_sales
        total_net_sales += net_sales
        total_profit += profit
        total_qty += net_qty
        total_returns += return_units
        total_ads += ads
        total_mpfees += mpfees
        total_shipping += shipping_final
        total_gst += gst
        total_tcs += tcs
        total_cost += cost
        total_ret_percent += ret_percent
        total_new_charge += new_charge
        total_estimatefees += estimated_fees
        total_mp_gst += mp_gst
        total_taxable_value += taxable_value
        total_gst_payable += gst_to_pay_amount
        total_exp_settlement += exp_settlement

    print("totale ads spends",total_ads)    

    # ---------------- RESPONSE ----------------
    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": len(results)
        },
        "totals": {
            "grosssales": round(total_sales, 2),
            "netsales": format_currency(total_net_sales),
            "total_netquantity": total_qty,
            "profit": format_currency(total_profit),
            "total_returns":total_returns,
            "total_ret_percent":f"{round(total_ret_percent, 2)}%",

            # "totalprofitmargin": (total_profit / total_net_sales * 100) if total_net_sales else 0,
            "totalprofitmargin": round((total_profit / total_net_sales * 100), 2) if total_net_sales else 0,

            "adSpend": format_currency(total_ads),
            "mpfees": round(total_mpfees, 2),
            "mp_gst": format_currency(total_mp_gst),
            # "estimatefees": format_currency(total_estimatefees),
            "estimatefees": format_currency(-abs(total_estimatefees)),
            "total_new_mpfees": format_currency(total_new_charge),
            "shipping": format_currency(total_shipping),
            # "gst": format_currency(total_tcs),
            "gst": format_currency(0),
            "tcs": format_currency(total_tcs),
            "cost": format_currency(total_cost),

            "taxable_value":format_currency(total_taxable_value),

            "gst_to_pay_amount":format_currency(total_gst_payable),

            "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",

            
            "exp_settlement":format_currency(total_exp_settlement),
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sku_profit_report_transactions_shipping(request):
    from amazon_auth.models import ProfitCalculationSetting

    user = get_effective_user(request.user)
    profit_setting, _ = ProfitCalculationSetting.objects.get_or_create(user=user)
    data = request.data

    # ---------------- GET ASIN ----------------
    filters = data.get("filters", {})

    sku = data.get("sku") or filters.get("sku")

    sku = data.get("sku") or filters.get("sku")
    if not sku:
        p_id = data.get("parentProductId") or filters.get("parentProductId") or filters.get("parent_product_id") or data.get("asin") or filters.get("asin") or filters.get("parent_asin") or filters.get("parentproductid")
        if isinstance(p_id, dict):
            p_id = p_id.get("IN", [])
        if isinstance(p_id, list) and p_id:
            sku = p_id[0]
        elif isinstance(p_id, str):
            sku = p_id

    if not sku:
        return Response({
            "status": False,
            "message": "sku is required"
        }, status=400)

    pagination = data.get("pagination", {})
    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))
    
    # ---------------- SEARCH TERM (order_id) ----------------
    search_term = data.get("search") or filters.get("search") or filters.get("searchTerm") or filters.get("q")
    if isinstance(search_term, list) and search_term:
        search_term = search_term[0]
    if search_term:
        search_term = str(search_term).strip()

    # ---------------- DATE FILTER ----------------
    from_date = None
    to_date = None
    
    from zoneinfo import ZoneInfo

    IST = ZoneInfo("Asia/Kolkata")
    UTC = ZoneInfo("UTC")

    from_date = to_date = None
    try:
        f_date_str = filters.get("fromDate") or filters.get("from_date")
        e_date_str = filters.get("endDate") or filters.get("toDate") or filters.get("to_date")
        if f_date_str:
            naive_from = datetime.strptime(f_date_str, "%Y-%m-%d")
            from_date = naive_from.replace(tzinfo=IST).astimezone(UTC)

        if e_date_str:
            naive_to = datetime.strptime(e_date_str, "%Y-%m-%d") + timedelta(days=1)
            to_date = naive_to.replace(tzinfo=IST).astimezone(UTC)

        if from_date and not to_date:
            to_date = from_date + timedelta(days=1)

    except Exception as e:
        print("Date error:", e)
        
        
    from_date_local = to_date_local = None    #for ads timezone
    try:
        f_date_str = filters.get("fromDate") or filters.get("from_date")
        e_date_str = filters.get("endDate") or filters.get("toDate") or filters.get("to_date")
        if f_date_str:
            from_date_local = datetime.strptime(f_date_str, "%Y-%m-%d").date()
        if e_date_str:
            to_date_local = datetime.strptime(e_date_str, "%Y-%m-%d").date()
        if from_date_local and not to_date_local:
            to_date_local = from_date_local
    except Exception as e:
        print("Date error:", e)    


    order_filter = Q(
        order__user=user
    ) & (Q(seller_sku=sku) | Q(asin=sku))

    if from_date:
        order_filter &= Q(order__purchase_date__gte=from_date)

    if to_date:
        order_filter &= Q(order__purchase_date__lt=to_date)

    CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}

    channels = filters.get("channel", {}).get("IN", [])
    if channels:
        marketplace_ids = [CHANNEL_MAP[ch] for ch in channels if ch in CHANNEL_MAP]
        if marketplace_ids:
            order_filter &= Q(order__marketplace_id__in=marketplace_ids)
            
    # ---------------- SEARCH FILTER (order_id) ----------------
    if search_term:
        order_filter &= Q(order__amazon_order_id__icontains=search_term)        

    # Get the specific order IDs matching this SKU and date/channel filter
    matching_order_ids = list(
        OrderItem.objects.filter(order_filter)
        .exclude(order__order_status__icontains='Cancel')
        .values_list('order__amazon_order_id', flat=True)
        .distinct()
    )

    # ============================================================
    # ITEMS QUERY WITH THIS new gst and st cost
    # ============================================================

    listing_qs = AmazonListingItem.objects.filter(
        user=user
    ).filter(
        Q(sku=OuterRef("seller_sku")) | Q(asin=OuterRef("asin"))
    ).order_by("-updated_at")

    items = (
        OrderItem.objects
        .filter(order_filter)
        .exclude(order__order_status__icontains='Cancel')
        .annotate(

            # SKU LEVEL DATA
            sku_standard_cost=Subquery(
                listing_qs.values("standard_cost")[:1]
            ),

            sku_gst_rate=Subquery(
                listing_qs.values("gst_rate")[:1]
            ),

            sku_tcs_rate=Subquery(
                listing_qs.values("tcs")[:1]
            ),

            sku_tds_rate=Subquery(
                listing_qs.values("tds")[:1]
            ),

            sku_region=Subquery(
                listing_qs.values("region")[:1]
            ),

            sku_shipping_estimate=Subquery(
                listing_qs.values("shiping_estimate")[:1]
            ),

            sku_step_level=Subquery(
                listing_qs.values("step_level")[:1]
            ),
        )
        .values(
            'order__amazon_order_id',
            'order__purchase_date',
            'seller_sku',

            # ⚠️ CONFIRM THIS FIELD NAME — see note at bottom of file.
            # This must be whatever field on Order/OrderItem tells you
            # AFN (FBA) vs MFN (FBM). Replace 'order__fulfillment_channel'
            # with your actual field.
            'order__fulfillment_channel',

            # INCLUDE THESE
            'sku_standard_cost',
            'sku_gst_rate',
            'sku_tcs_rate',
            'sku_tds_rate',
            'sku_region',
            'sku_shipping_estimate',
            'sku_step_level',
        )
        .annotate(
            title=Max('title'),
            image=Max('image_url'),
            asin=Max('asin'),

            grossqty=Sum('quantity_ordered'),
            # grosssales=Sum('item_price'),
            # promotion_discount=Sum('promotion_discount'),
            # avg_cost=Avg('item_price'),
            
            grosssales=Sum(
                Case(
                    When(Q(order__order_status__icontains='Pending') & Q(item_price=0), then=F('new_item_price')),
                    default=F('item_price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),
            promotion_discount=Sum('promotion_discount'),
            avg_cost=Avg(
                Case(
                    When(Q(order__order_status__icontains='Pending') & Q(item_price=0), then=F('new_item_price')),
                    default=F('item_price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),
            item_tax=Sum('item_tax'),

            shipping_income=Sum('shipping_price'),
            shipping_price=Sum('shipping_price'),

            total_cost=Sum(
                F('cost_price') * F('quantity_ordered')
            )
        )
        .order_by('-order__purchase_date')
    )

    estimated_fee_data = (
        AmazonEstimatedFee.objects.filter(
            order_item__order__user=user,
            order_item__seller_sku=sku,
            order_item__order__amazon_order_id__in=matching_order_ids
        )
        .values('order_item__order__amazon_order_id')
        .annotate(
            estimated_fees=Sum('total_fees'),

            referral_fee=Sum('referral_fee'),
            closing_fee=Sum('closing_fee'),
            per_item_fee=Sum('per_item_fee'),

            fba_fee=Sum('fba_fee'),
            fba_pick_pack_fee=Sum('fba_pick_pack_fee'),
            fba_weight_handling_fee=Sum('fba_weight_handling_fee'),

            tax_amount=Sum('tax_amount'),
        )
    )

    estimated_fee_map = {
        row['order_item__order__amazon_order_id']: {

            "estimated_fees": float(row['estimated_fees'] or 0),

            "referral_fee": float(row['referral_fee'] or 0),
            "closing_fee": float(row['closing_fee'] or 0),
            "per_item_fee": float(row['per_item_fee'] or 0),

            "fba_fee": float(row['fba_fee'] or 0),
            "fba_pick_pack_fee": float(row['fba_pick_pack_fee'] or 0),
            "fba_weight_handling_fee": float(row['fba_weight_handling_fee'] or 0),

            "tax_amount": float(row['tax_amount'] or 0),
        }

        for row in estimated_fee_data
    }

    # ---------------- FINANCE ----------------
    finance_qs = FinancialEvent.objects.filter(
        user=user,
        amazon_order_id__in=matching_order_ids
    )

    if from_date:
        finance_qs = finance_qs.filter(posted_date__gte=from_date)
    if to_date:
        finance_qs = finance_qs.filter(posted_date__lte=to_date)

    finance_data = (
        finance_qs
        .values('amazon_order_id')
        .annotate(
            refund=Sum('total_amount', filter=Q(event_group="REFUND")),

            commission=Sum('commission_fee'),
            fulfillment=Sum('fulfillment_fee'),
            other_fee=Sum('other_fee'),

            shipping_fee=Sum('shipping_fee'),
            gst=Sum('tax')
        )
    )

    finance_map = {f['amazon_order_id']: f for f in finance_data}

    # ---------------- RAW DATA (TCS) ----------------
    raw_map = (
        FinancialEvent.objects
        .filter(user=user, amazon_order_id__in=matching_order_ids)
        .exclude(raw_data=None)
        .values('amazon_order_id', 'raw_data')
    )

    raw_data_map = {}
    for r in raw_map:
        raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])

    # ============================================================
    # ADS SPEND MAP (APPLY BEFORE BUILD RESPONSE)
    # ============================================================

    sku_list = list(
        OrderItem.objects
        .filter(order_filter)
        .exclude(seller_sku__isnull=True)
        .exclude(seller_sku__exact="")
        .values_list("seller_sku", flat=True)
        .distinct()
    )

    normalized_skus = [
        normalize_sku(sku)
        for sku in sku_list
    ]

    # ads_metrics_qs = (
    #     ProductAdMetric.objects
    #     .filter(
    #         product_ad__amazon_account__user=user,
    #         product_ad__amazon_account__is_primary=True,
    #     )
    # )
    
    # if from_date_local:
    #     ads_metrics_qs = ads_metrics_qs.filter(report_date__gte=from_date_local)
    # if to_date_local:
    #     ads_metrics_qs = ads_metrics_qs.filter(report_date__lte=to_date_local)
    
    ads_metrics_qs = ProductAdMetric.objects.filter(
        product_ad__amazon_account__user=user,
        product_ad__amazon_account__is_primary=True,
    )
    ads_metrics_qs = filter_ads_by_local_range(ads_metrics_qs, from_date_local, to_date_local)


    ads_data = (
        ads_metrics_qs
        .values(
            "product_ad__asin",
            "product_ad__sku",
        )
        .annotate(
            total_ads_cost=Sum("cost"),
            total_impressions=Sum("impressions"),
            total_clicks=Sum("clicks"),
            total_sales=Sum("sales"),
            total_orders=Sum("orders"),
        )
    )

    ads_map = {}

    for row in ads_data:

        asin_key = (
            row["product_ad__asin"] or ""
        ).strip()

        sku_key = normalize_sku(
            row["product_ad__sku"] or ""
        )

        cost = float(
            str(row["total_ads_cost"] or 0)
        )

        if asin_key not in ads_map:

            ads_map[asin_key] = {
                "cost": float("0"),
                "clicks": 0,
                "impressions": 0,
                "sales": float("0"),
                "orders": 0,
            }

        ads_map[asin_key]["cost"] += cost
        ads_map[asin_key]["clicks"] += int(
            row["total_clicks"] or 0
        )
        ads_map[asin_key]["impressions"] += int(
            row["total_impressions"] or 0
        )
        ads_map[asin_key]["sales"] += float(
            str(row["total_sales"] or 0)
        )
        ads_map[asin_key]["orders"] += int(
            row["total_orders"] or 0
        )

        if sku_key:

            if sku_key not in ads_map:

                ads_map[sku_key] = {
                    "cost": float("0"),
                    "clicks": 0,
                    "impressions": 0,
                    "sales": float("0"),
                    "orders": 0,
                }

            ads_map[sku_key]["cost"] += cost

    # ============================================================
    # TOTAL ADS SPEND & ADS PER UNIT
    # ============================================================

    ads_row = ads_map.get(normalize_sku(sku), {})

    total_ads_cost = abs(
        float(str(ads_row.get("cost") or 0))
    )

    total_net_quantity = (
        items.aggregate(
            total_qty=Sum("grossqty")
        )["total_qty"] or 0
    )

    ads_per_unit = (
        total_ads_cost / total_net_quantity
        if total_net_quantity else 0
    )

    
    # ============================================================
    # TRANSACTION SHIPPING FEES (MFN + AFN)
    # ============================================================

    tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        identifier_name="ORDER_ID",
        identifier_value__in=matching_order_ids
    ).values("transaction_id", "identifier_value")

    tx_to_order = {
        row["transaction_id"]: row["identifier_value"]
        for row in tx_identifiers
    }

    tx_shipping_candidates = {}

    STATUS_PRIORITY = {
        "DEFERRED": 3,
        "DEFERRED_RELEASED": 2,
        "RELEASED": 1,
    }

    # ============================================================
    # MFN SHIPPING
    # ============================================================

    mfn_postage_txns = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="ServiceFee",
        transaction_status__in=[
            "DEFERRED",
            "DEFERRED_RELEASED",
            "RELEASED",
        ],
        description__icontains="MfnPostageFee",
    ).values(
        "id",
        "total_amount",
        "transaction_status",
    )

    for txn in mfn_postage_txns:
        order_id = tx_to_order.get(txn["id"])

        if not order_id:
            continue

        status = txn["transaction_status"]

        priority = STATUS_PRIORITY.get(status, 0)

        current = tx_shipping_candidates.get(order_id)

        if current is None or priority > current["priority"]:
            tx_shipping_candidates[order_id] = {
                "priority": priority,
                "amount": float(txn["total_amount"] or 0),
                "status": status,
            }

    # ============================================================
    # AFN / FBA SHIPPING
    # ============================================================

    afn_txns = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="Shipment",
        transaction_status__in=[
            "DEFERRED",
            "DEFERRED_RELEASED",
            "RELEASED",
        ],
    ).values(
        "id",
        "transaction_status",
    )

    afn_tx_status = {txn["id"]: txn["transaction_status"] for txn in afn_txns}

    afn_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=afn_tx_status.keys(),
            breakdown_type="FBAWeightBasedFee",
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )

    for bd in afn_breakdowns:
        transaction_id = bd["transaction_id"]

        order_id = tx_to_order.get(transaction_id)

        if not order_id:
            continue

        status = afn_tx_status.get(transaction_id)

        priority = STATUS_PRIORITY.get(status, 0)

        current = tx_shipping_candidates.get(order_id)

        if current is None or priority > current["priority"]:
            tx_shipping_candidates[order_id] = {
                "priority": priority,
                "amount": float(bd["total"] or 0),
                "status": status,
            }

    # ============================================================
    # FINAL SHIPPING MAP
    # ============================================================

    tx_shipping_map = {
        order_id: data["amount"] for order_id, data in tx_shipping_candidates.items()
    }

    # print(tx_shipping_map)
   
    # print(tx_to_order)
    # print(tx_shipping_map)        
    # print("tx_shipping_map>>>>>>>>>>>>>>>>>>", tx_shipping_map)  
    
    
    # ============================================================
    # RETURN CLASSIFICATION (COURIER vs CUSTOMER) — scoped to this SKU's orders
    # ============================================================
    FULFILLMENT_FEE_REFUND_PATTERNS = ["FulfillmentFeeRefund"]

    refund_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='Refund',
        transaction_status__in=['DEFERRED', 'DEFERRED_RELEASED']
    )
    # if from_date:
    #     refund_txns = refund_txns.filter(posted_date__gte=from_date)
    # if to_date:
    #     refund_txns = refund_txns.filter(posted_date__lt=to_date)

    refund_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=refund_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values('transaction_id', 'identifier_value')

    refund_tx_to_order = {
        row['transaction_id']: row['identifier_value']
        for row in refund_identifiers
    }

    # ============================================================
    # REFUNDED SALES MAP
    # ============================================================
    
    refund_tx_ids = refund_tx_to_order.keys()
    
    refunded_sales_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=refund_tx_ids,
            breakdown_type="Refunded Sales"
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )
    
    refunded_sales_by_order = {}
    
    for row in refunded_sales_breakdowns:
        order_id = refund_tx_to_order.get(row["transaction_id"])
        if not order_id:
            continue
    
        refunded_sales_by_order[order_id] = (
            refunded_sales_by_order.get(order_id, 0.0)
            + float(row["total"] or 0)
        )

    order_ids_with_refund = set(refund_tx_to_order.values())

    fee_refund_q = Q()
    for pattern in FULFILLMENT_FEE_REFUND_PATTERNS:
        fee_refund_q |= Q(description__icontains=pattern)

    fee_refund_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='ServiceFee',
        transaction_status__in=['DEFERRED', 'DEFERRED_RELEASED']
    ).filter(fee_refund_q)
    # if from_date:
    #     fee_refund_txns = fee_refund_txns.filter(posted_date__gte=from_date)
    # if to_date:
    #     fee_refund_txns = fee_refund_txns.filter(posted_date__lt=to_date)

    fee_refund_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=fee_refund_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values_list('identifier_value', flat=True)

    order_ids_with_fee_refund = set(fee_refund_identifiers)

    # ============================================================
    # FULFILLMENT FEE REFUND MAP
    # ============================================================
    
    fulfillment_fee_refund_breakdowns = (
        AmazonTransaction.objects.filter(
            id__in=tx_to_order.keys(),
            transaction_type="ServiceFee",
            transaction_status__in=["DEFERRED", "DEFERRED_RELEASED"],
            description__icontains="EasyshipFulfillmentFeeRefund",
        )
        .values("id", "total_amount")
    )
    
    fulfillment_fee_refund_by_order = {}
    # ============================================================
    # AMAZON FEES REFUND MAP
    # ============================================================
    
    amazon_fee_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=refund_tx_to_order.keys(),
            breakdown_type="AmazonFees",
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )
    
    amazon_fee_refund_by_order = {}
    
    for row in amazon_fee_breakdowns:
        order_id = refund_tx_to_order.get(row["transaction_id"])
        if not order_id:
            continue
    
        amazon_fee_refund_by_order[order_id] = (
            amazon_fee_refund_by_order.get(order_id, 0.0)
            + float(row["total"] or 0)
        )

    for txn in fulfillment_fee_refund_breakdowns:
        order_id = tx_to_order.get(txn["id"])
        if not order_id:
            continue
    
        fulfillment_fee_refund_by_order[order_id] = (
            fulfillment_fee_refund_by_order.get(order_id, 0.0)
            + float(txn["total_amount"] or 0)
        )
    # Map order_id -> total refund amount (for courier/customer price split)
    # Map order_id -> total refund amount AND count of refund transactions
    # (an order can have more than one Refund transaction, e.g. partial refunds)
    refund_amount_by_order = {}
    refund_count_by_order = {}
    for txn in refund_txns.filter(id__in=refund_tx_to_order.keys()):
        oid = refund_tx_to_order.get(txn.id)
        if not oid:
            continue
        refund_amount_by_order[oid] = (
            refund_amount_by_order.get(oid, 0.0) + float(txn.total_amount or 0)
        )
        refund_count_by_order[oid] = refund_count_by_order.get(oid, 0) + 1

    courier_return_count = 0
    customer_return_count = 0
    courier_return_price = 0.0
    customer_return_price = 0.0

    for order_id in order_ids_with_refund:
        amount = refund_amount_by_order.get(order_id, 0.0)
        if order_id in order_ids_with_fee_refund:
            courier_return_count += 1
            courier_return_price += amount
        else:
            customer_return_count += 1
            customer_return_price += amount

    total_return_count = courier_return_count + customer_return_count
    
    # ============================================================
    # CLAIM AMOUNT — Transaction Type "Adjustment", description "SERRACReimbursement"
    # ============================================================
    claim_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='Adjustment',
        description__icontains='SERRACReimbursement',
    )
    # if from_date:
    #     claim_txns = claim_txns.filter(posted_date__gte=from_date)
    # if to_date:
    #     claim_txns = claim_txns.filter(posted_date__lt=to_date)

    claim_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=claim_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values('transaction_id', 'identifier_value')

    claim_tx_to_order = {
        row['transaction_id']: row['identifier_value']
        for row in claim_identifiers
    }

    claim_amount_by_order = {}
    claim_count_by_order = {}
    for txn in claim_txns.filter(id__in=claim_tx_to_order.keys()):
        oid = claim_tx_to_order.get(txn.id)
        if not oid:
            continue
        claim_amount_by_order[oid] = (
            claim_amount_by_order.get(oid, 0.0) + float(txn.total_amount or 0)
        )
        claim_count_by_order[oid] = claim_count_by_order.get(oid, 0) + 1

    total_claim_amount = sum(claim_amount_by_order.values())
    total_claim_count = len(claim_amount_by_order)
    
    # ============================================================
    # REPLACEMENT RETURN — Transaction Type "Shipment",
    # description "Order Payment", total_amount = 0
    # (a free replacement shipment — order payment transaction with
    # zero value, since the customer isn't charged again for a replacement)
    # ============================================================
    replacement_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='Shipment',
        description='Order Payment',
        total_amount=0,
    )

    replacement_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=replacement_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values('transaction_id', 'identifier_value')

    replacement_tx_to_order = {
        row['transaction_id']: row['identifier_value']
        for row in replacement_identifiers
    }

    order_ids_with_replacement = set(replacement_tx_to_order.values())

    replacement_count_by_order = {}
    for txn in replacement_txns.filter(id__in=replacement_tx_to_order.keys()):
        oid = replacement_tx_to_order.get(txn.id)
        if not oid:
            continue
        replacement_count_by_order[oid] = replacement_count_by_order.get(oid, 0) + 1

    total_replacement_return_count = len(order_ids_with_replacement)

    # ---------------- BUILD RESPONSE ----------------
    results = []

    total_sales = total_profit = total_qty = total_final_net_qty = 0
    total_ads = total_mpfees = total_shipping = 0
    total_gst = total_tcs = total_tds = total_cost = 0
    total_net_sales = 0
    total_final_net_sales = 0
    total_returns = 0
    total_new_charge = 0
    adjusted_gross_sales = 0
    total_estimatefees = 0
    total_mp_gst = 0

    total_taxable_value = 0
    total_gst_payable = 0
    total_promo_discount = 0
    total_exp_settlement = 0
    total_other_expenses = 0.0

    # ---------------- CALCULATE OTHER EXPENSES ----------------
    all_oi = OrderItem.objects.filter(order__user=user).values('parent_asin', 'asin', 'seller_sku')
    parent_sku_map = {}
    for oi in all_oi:
        p = oi.get('parent_asin') or oi.get('asin')
        s = oi.get('seller_sku')
        if p and s:
            parent_sku_map.setdefault(p, set()).add(s)

    pm_qs = ProductMapping.objects.filter(account__user=user).values('parent_asin', 'asin', 'seller_sku')
    for pm in pm_qs:
        p = pm.get('parent_asin') or pm.get('asin')
        s = pm.get('seller_sku')
        if p and s:
            parent_sku_map.setdefault(p, set()).add(s)

    ali_qs = AmazonListingItem.objects.filter(user=user).values('asin', 'sku')
    for ali in ali_qs:
        p = ali.get('asin')
        s = ali.get('sku')
        if p and s:
            parent_sku_map.setdefault(p, set()).add(s)

    child_to_parent = {}
    sku_to_asin = {}
    for oi in all_oi:
        p = oi.get('parent_asin')
        s = oi.get('seller_sku')
        a = oi.get('asin')
        if s and a: sku_to_asin[s] = a
        if p:
            if s: child_to_parent[s] = p
            if a: child_to_parent[a] = p

    for pm in pm_qs:
        p = pm.get('parent_asin')
        s = pm.get('seller_sku')
        a = pm.get('asin')
        if s and a: sku_to_asin[s] = a
        if p:
            if s: child_to_parent[s] = p
            if a: child_to_parent[a] = p

    for ali in ali_qs:
        s = ali.get('sku')
        a = ali.get('asin')
        if s and a: sku_to_asin[s] = a

    active_asins_by_parent = {}
    period_oi = OrderItem.objects.filter(order__user=user)
    if from_date:
        period_oi = period_oi.filter(order__purchase_date__gte=from_date)
    if to_date:
        period_oi = period_oi.filter(order__purchase_date__lt=to_date)
    period_oi = period_oi.exclude(order__order_status__icontains='Cancel')

    for oi in period_oi.values('parent_asin', 'asin', 'seller_sku'):
        s = oi.get('seller_sku')
        a = oi.get('asin')
        p = child_to_parent.get(s) or child_to_parent.get(a) or oi.get('parent_asin')
        child_key = s or a or sku_to_asin.get(s)
        if p and child_key:
            active_asins_by_parent.setdefault(p, set()).add(child_key)

    for k, ad_val in ads_map.items():
        if ad_val.get("cost", 0) != 0:
            p = child_to_parent.get(k) or child_to_parent.get(sku_to_asin.get(k)) or k
            if k not in sku_to_asin.values() or not active_asins_by_parent.get(p):
                active_asins_by_parent.setdefault(p, set()).add(k)

    expense_items = []
    sku_order_counts = {}
    for r in items:
        s_key = r.get('seller_sku') or r.get('asin')
        if s_key:
            sku_order_counts[s_key] = sku_order_counts.get(s_key, 0) + 1

    for idx, r in enumerate(items):
        g_qty = float(r.get('grossqty') or 0)
        n_qty = max(g_qty, 0)
        f_sales = float(r.get('grosssales') or 0)
        s = r.get('seller_sku')
        a = r.get('asin')
        p = child_to_parent.get(s) or child_to_parent.get(a) or r.get('parent_asin') or a
        tot_p_skus = len(parent_sku_map.get(p, set())) or 1
        active_rows = len(active_asins_by_parent.get(p, set())) or 1
        sku_weight_for_child = float(tot_p_skus) / float(active_rows)
        s_key = s or a
        ord_cnt_sku = sku_order_counts.get(s_key, 1)

        expense_items.append({
            'key': idx,
            'marketplace': r.get('channel') or r.get('marketplace') or 'Amazon-India',
            'units': float(n_qty),
            'net_sales': float(f_sales),
            'sku_count': sku_weight_for_child,
            'order_count_for_sku': ord_cnt_sku
        })

    other_expenses_map = calculate_other_expenses_map(user, from_date_local, to_date_local, expense_items)

    for idx, row in enumerate(items):

        oid = row['order__amazon_order_id']

        gross_qty = int(row['grossqty'] or 0)
        gross_sales = float(row['grosssales'] or 0)

        asin = row['asin']

        item_tax = float(row.get('item_tax') or 0)
        promo_discount = float(row.get('promotion_discount') or 0)

        fee_data = estimated_fee_map.get(oid, {})

        estimated_fees = fee_data.get("estimated_fees", 0)

        referral_fee = fee_data.get("referral_fee", 0)
        closing_fee = fee_data.get("closing_fee", 0)
        per_item_fee = fee_data.get("per_item_fee", 0)

        fba_fee = fee_data.get("fba_fee", 0)
        fba_pick_pack_fee = fee_data.get("fba_pick_pack_fee", 0)
        fba_weight_handling_fee = fee_data.get("fba_weight_handling_fee", 0)

        tax_amount = fee_data.get("tax_amount", 0)

        # ------------------------------------------------------------
        # SHIPPING — Direct sum of breakdowns for this order
        # ------------------------------------------------------------
        tx_shipping = tx_shipping_map.get(oid, 0.0)

        shipping_income = tx_shipping
        shipping_price = tx_shipping
        
        # ------------------------------------------------------------
        # RETURN STATUS FOR THIS SPECIFIC ORDER
        # ------------------------------------------------------------
        # order_has_return = oid in order_ids_with_refund
        # order_is_courier_return = oid in order_ids_with_fee_refund
        # order_return_amount = refund_amount_by_order.get(oid, 0.0)
        # order_return_count = refund_count_by_order.get(oid, 0)

        # if order_has_return and order_is_courier_return:
        #     order_return_type = "COURIER_RETURN"
        # elif order_has_return:
        #     order_return_type = "CUSTOMER_RETURN"
        # else:
        #     order_return_type = None
        
        # ------------------------------------------------------------
        # RETURN / CLAIM — aggregated across all orders for this parent_asin row
        # ------------------------------------------------------------
        order_has_return = oid in order_ids_with_refund
        order_is_courier_return = oid in order_ids_with_fee_refund

        order_return_amount = refund_amount_by_order.get(oid, 0.0)
        order_return_count = refund_count_by_order.get(oid, 0)

        if order_has_return and order_is_courier_return:
            order_return_type = "COURIER_RETURN"
        elif order_has_return:
            order_return_type = "CUSTOMER_RETURN"
        else:
            order_return_type = None

        row_courier_return_count = 1 if order_is_courier_return else 0
        row_customer_return_count = 1 if (order_has_return and not order_is_courier_return) else 0

        row_courier_return_price = (
            order_return_amount if order_is_courier_return else 0.0
        )

        row_customer_return_price = (
            order_return_amount if (order_has_return and not order_is_courier_return) else 0.0
        )

        order_claim_amount = claim_amount_by_order.get(oid, 0.0)
        order_claim_count = claim_count_by_order.get(oid, 0)
        order_has_claim = order_claim_count > 0
                    
            
            
        # ------------------------------------------------------------
        # CLAIM AMOUNT FOR THIS SPECIFIC ORDER
        # ------------------------------------------------------------
        order_claim_amount = claim_amount_by_order.get(oid, 0.0)
        order_claim_count = claim_count_by_order.get(oid, 0)
        order_has_claim = order_claim_count > 0    
        
        
        
        # ------------------------------------------------------------
        # REPLACEMENT RETURN STATUS FOR THIS SPECIFIC ORDER
        # ------------------------------------------------------------
        order_is_replacement = oid in order_ids_with_replacement
        order_replacement_count = replacement_count_by_order.get(oid, 0)
        
        
        # estimated_fees += promo_discount  #currently not use this        

        # ============================================================
        # ADS SPEND
        # ============================================================
        # ============================================================
        # DISTRIBUTE ADS BY QUANTITY
        # ============================================================

        ads = -(
            ads_per_unit * gross_qty
        )

        # adjusted_gross_sales = gross_sales + item_tax + shipping_price
        adjusted_gross_sales = gross_sales + item_tax 

        standard_cost = float(row.get("sku_standard_cost") or 0)

        cost = standard_cost * gross_qty

        f = finance_map.get(oid, {})

        refund = float(f.get('refund') or 0)

        mpfees = (
            float(f.get('commission') or 0) +
            float(f.get('fulfillment') or 0) +
            float(f.get('other_fee') or 0)
        )

        amazon_fee_refund = amazon_fee_refund_by_order.get(oid, 0.0)
        
        print("amazon_fee_refund_total>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",amazon_fee_refund)
        
        estimated_fees -= amazon_fee_refund

        shipping_fee = float(f.get('shipping_fee') or 0)

        gst = float(f.get('gst') or 0)

        # ---------------- TCS & TDS ----------------

        gst_rate = float(str(row.get("sku_gst_rate") or 0))
        tcs_rate = float(str(row.get("sku_tcs_rate") or 0))
        tds_rate = float(str(row.get("sku_tds_rate") or 0))

        refunded_sales = refunded_sales_by_order.get(oid, 0.0)
        
        final_net_sales = (
            adjusted_gross_sales
        )
        if  order_replacement_count or order_has_return and gross_qty == order_return_count:
            final_net_sales = 0
            cost = 0
            promo_discount = 0

        if gst_rate > 0:

            taxable_value = (
                final_net_sales /
                (float("1") + (gst_rate / float("100")))
            )

            gst_to_pay_amount = (
                final_net_sales - taxable_value
            )

            gst_to_pay_perc = gst_rate

        else:

            taxable_value = final_net_sales
            gst_to_pay_amount = 0

            gst_to_pay_perc = (
                (gst_to_pay_amount / taxable_value) * float("100")
                if taxable_value else float("0")
            )

        tcs = (
            taxable_value *
            ((tcs_rate or float("1")) / float("100"))
        )

        tds = (
            taxable_value *
            (tds_rate / float("100"))
            if tds_rate else 0.0
        )

        if gst_rate:
            gst_to_pay_perc = gst_rate
        else:
            gst_to_pay_perc = (
                (gst_to_pay_amount / taxable_value) * 100
                if taxable_value else 1
            )

        # ---------------- NEW FEES (SUM OF ALL FEETYPES) ----------------
        new_charge = 0

        for raw in raw_data_map.get(oid, []):
            if not isinstance(raw, dict):
                continue

            try:
                item_lists = []
                item_lists.extend(raw.get("ShipmentItemList", []))
                item_lists.extend(raw.get("ShipmentItemAdjustmentList", []))

                for item in item_lists:

                    fee_lists = []
                    fee_lists.extend(item.get("ItemFeeList", []))
                    fee_lists.extend(item.get("ItemFeeAdjustmentList", []))

                    for fee in fee_lists:
                        amount = float(
                            fee.get("FeeAmount", {}).get("CurrencyAmount", 0) or 0
                        )
                        new_charge += amount

            except Exception:
                pass

        # ---------------- RETURNS ----------------
        return_units = abs(refund) / (gross_sales / gross_qty) if gross_qty and gross_sales else 0
        return_units = int(round(return_units))

        net_qty = max(gross_qty, 0)
        
        final_net_qty = max(gross_qty, 0)

        # ---------------- CALCULATIONS ----------------
        net_sales = adjusted_gross_sales
        

        shipping_final = (
            shipping_income
            + fulfillment_fee_refund_by_order.get(oid, 0.0)
        )
        # print("shipping_final>>>>>>>>>>>>>>>>",shipping_final)

        mp_gst = (-abs(estimated_fees) + shipping_final) * 0.18

        
        row_other_expense = float(other_expenses_map.get(idx, 0))

        # profit = (
        #     final_net_sales
        #     + shipping_final
        #     + ads
        #     + tcs
        #     - estimated_fees
        #     - mp_gst
        #     - gst_to_pay_amount
        #     - promo_discount
        #     - order_claim_amount
        #     - cost
        #     - row_other_expense
        # )
        
        # print("tcs cccccccccccccccccccccccnewwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",tcs)
        
        # print("shipping_final****************",shipping_final)
        # print("cost>>>>>>>>>>>****************",cost)
        # print("gst_to_pay_amount>>>>>>>>>>>****************",gst_to_pay_amount)
        # print("estimated_fees****************",estimated_fees)
        # print("tcs>>>>>>>>>>>****************",tcs)
        # print("mp_gst>>>>>>>>>>>****************",mp_gst)
        # print("ads****************",ads)

        profit = (
            final_net_sales
            + shipping_final
            + (ads if profit_setting.ad_spend else 0)
            + (tcs if profit_setting.tcs else 0)
            + (tds if profit_setting.tds else 0)
            - estimated_fees
            - (mp_gst if profit_setting.input_gst_itc else 0)
            - (gst_to_pay_amount if profit_setting.output_gst else 0)
            - promo_discount
            - (order_claim_amount if profit_setting.claim else 0)
            - (cost if profit_setting.product_cost else 0)
            - (row_other_expense if profit_setting.other_expense else 0)
        )

        # exp_settlement = (    updated on 5 sep
        #     final_net_sales
        #     + shipping_final
        #     + ads
        #     + tcs
        #     - estimated_fees
        #     - mp_gst
        #     - promo_discount
        #     - order_claim_amount
        # )
        
        # New exp_settlement 
        
        exp_settlement = (
            final_net_sales
            + shipping_final     
            # + ads                    remove this 
            - tcs                    #substract now 
            - tds                    #substract now 
            - estimated_fees
            - mp_gst
            - promo_discount
            + order_claim_amount     #add this one      
        )
        



        profit_margin = (profit / net_sales * 100) if net_sales else 0
        tacos = (
            (abs(ads) / gross_sales) * 100
            if gross_sales else 0
        )
        drr = tacos
        
        row_customer_return_count += order_replacement_count
        
        order_return_count += order_replacement_count
        
        final_net_qty = final_net_qty - order_return_count 
        
        ret_percent = (order_return_count / net_qty * 100) if net_qty else 0

        results.append({
            "order_id": oid,
            "date": row['order__purchase_date'],
            "name": row['title'],
            "image": row['image'],

            "channel": "Amazon-India",
            "channel1": "Amazon-India",
            "redirecturl": f"https://www.amazon.in/dp/{row['asin']}",

            "grossqty": gross_qty,
            "qty": net_qty,
            "final_net_qty":final_net_qty,

            "grosssales": round(gross_sales, 2),
            "netsales": format_currency(net_sales),

            "final_net_sales": format_currency(final_net_sales),

            "taxable_value":
            format_currency(taxable_value),

            "gst_to_pay_amount":
            format_currency(gst_to_pay_amount),

            "gst_to_pay_perc":
            round(gst_to_pay_perc, 2),

            "ads": format_currency(ads),
            "mpfees": round(mpfees, 2),
            "mp_gst": format_currency(mp_gst),
            "estimatefees": format_currency(-abs(estimated_fees)),
            "other_expenses": format_currency(-abs(row_other_expense)),
            "referral_fee": format_currency(referral_fee),
            "closing_fee": format_currency(closing_fee),
            "per_item_fee": format_currency(per_item_fee),

            "fba_fee": format_currency(fba_fee),
            "fba_pick_pack_fee": format_currency(fba_pick_pack_fee),
            "fba_weight_handling_fee": format_currency(fba_weight_handling_fee),

            "tax_amount": format_currency(tax_amount),
            "new_mpfees": format_currency(new_charge),
            "shippingfees": format_currency(shipping_final),

            "profit": format_currency(profit),
            "grossprofitper": round(profit_margin, 2),

            "returnqty": order_return_count,
            "retpercent": round(ret_percent, 2),

            "tacos": round(tacos, 2),
            "drr": round(drr, 2),

            "stdcost": format_currency(cost),

            "gst": format_currency(0),
            "tcs": format_currency(tcs),
            "tds": format_currency(tds),
            "exp_settlement": format_currency(exp_settlement),
            "promo_discount":format_currency(promo_discount),
            
            "return_type": order_return_type,
            "is_return": order_has_return,
            "return_count": order_return_count,
            "return_amount": format_currency(order_return_amount),
            
            "courier_return_count": row_courier_return_count,
            "customer_return_count": row_customer_return_count,
            "courier_return_price": format_currency(row_courier_return_price),
            "customer_return_price": format_currency(row_customer_return_price),
            
            "is_claim": order_has_claim,
            "claim_count": order_claim_count,
            "claim_amount": format_currency(order_claim_amount),
            
            "is_replacement_return": order_is_replacement,
            "replacement_return_count": order_replacement_count,
        
        })

        # ---------------- TOTALS ----------------
        total_sales += gross_sales
        total_net_sales += net_sales
        total_final_net_sales += final_net_sales
        total_profit += round(profit, 2)
        total_other_expenses += row_other_expense
        total_qty += net_qty
        total_final_net_qty += final_net_qty
        total_returns += return_units
        total_ads += ads
        total_mpfees += mpfees
        total_shipping += shipping_final
        total_gst += gst
        total_tcs += round(tcs, 2)
        total_tds += round(tds, 2)
        total_cost += cost
        total_new_charge += new_charge
        total_estimatefees += estimated_fees
        total_mp_gst += round(mp_gst, 2)
        total_taxable_value += round(taxable_value, 2)
        total_gst_payable += round(gst_to_pay_amount, 2)
        total_exp_settlement += round(exp_settlement, 2)
        total_promo_discount += promo_discount
        
        total_return_count += order_replacement_count
        customer_return_count += order_replacement_count

    # ---------------- RESPONSE ----------------
    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": len(results)
        },
        "totals": {
            "grosssales": round(total_sales, 2),
            "netsales": format_currency(total_net_sales),
            "total_net_sales": format_currency(total_net_sales),
            "total_final_net_sales": format_currency(total_final_net_sales),
            "total_netquantity": total_qty,
            "total_final_net_qty":total_final_net_qty,
            "other_expenses": format_currency(-abs(total_other_expenses)),
            "total_other_expenses": format_currency(-abs(total_other_expenses)),
            "profit": format_currency(total_profit),
            
            "total_returns": total_return_count,
            "total_ret_percent": f"{round((total_return_count / total_qty * 100), 2) if total_qty else 0.0}%",
            "totalreturnper": f"{round((total_return_count / total_qty * 100), 2) if total_qty else 0.0}%",

            "totalprofitmargin": round((total_profit / total_net_sales * 100), 2) if total_net_sales else 0,

            "adSpend": format_currency(total_ads),
            "mpfees": round(total_mpfees, 2),
            "mp_gst": format_currency(total_mp_gst),
            "estimatefees": format_currency(-abs(total_estimatefees)),
            "total_new_mpfees": format_currency(total_new_charge),
            "shipping": format_currency(total_shipping),
            "gst": format_currency(0),
            "tcs": format_currency(total_tcs),
            "tds": format_currency(total_tds),
            "cost": format_currency(total_cost),

            "taxable_value": format_currency(total_taxable_value),
            "gst_to_pay_amount": format_currency(total_gst_payable),
            "gst_to_pay_perc": f"{round((total_gst_payable / total_taxable_value * 100), 2) if total_taxable_value else 1}%",
            "exp_settlement": format_currency(total_exp_settlement),
            
            "total_promo_discount":format_currency(total_promo_discount),
            "total_return_count": total_return_count,
            "courier_return_count": courier_return_count,
            "customer_return_count": customer_return_count,
            "courier_return_price": format_currency(courier_return_price),
            "customer_return_price": format_currency(customer_return_price),
            
            "total_claim_count": total_claim_count,
            "total_claim_amount": format_currency(total_claim_amount),
            
            "total_replacement_return_count": total_replacement_return_count,
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_catalog_details(request):
    """
    Fetch catalog details (brand, image, parent_asin) from Amazon Catalog API
    """

    asin = request.GET.get("asin")
    marketplace_id = request.GET.get("marketplace_id")

    if not asin or not marketplace_id:
        return JsonResponse({
            "status": "error",
            "message": "asin and marketplace_id are required"
        }, status=400)

    try:
        # Get user's Amazon account
        account = request.user.amazon_accounts.first()
        if not account:
            return JsonResponse({
                "status": "error",
                "message": "No Amazon account connected"
            }, status=400)

        manager = SPAPIManager(user=request.user, account=account)

        # CALL CATALOG API
        catalog_response = safe_catalog_call(manager, asin, marketplace_id)

        if not catalog_response:
            return JsonResponse({
                "status": "error",
                "message": "Catalog API failed"
            }, status=500)

        attributes = catalog_response.get("attributes", {})
        images_data = catalog_response.get("images", [])
        relationships = catalog_response.get("relationships", [])

        # -------------------------
        # EXTRACT DATA
        # -------------------------
        brand = None
        image_url = None
        parent_asin = None

        # ✅ PARENT ASIN
        for rel_group in relationships:
            for rel in rel_group.get("relationships", []):
                if rel.get("type") == "VARIATION":
                    parent_list = rel.get("parentAsins", [])
                    if parent_list:
                        parent_asin = parent_list[0]
                        break
            if parent_asin:
                break

        # ✅ BRAND
        if "brand" in attributes:
            brand = attributes["brand"][0].get("value")

        # ✅ IMAGE
        for img_group in images_data:
            if img_group.get("marketplaceId") == marketplace_id:
                imgs = img_group.get("images", [])
                if imgs:
                    image_url = imgs[0].get("link")
                    break

        return JsonResponse({
            "status": "success",
            "data": {
                "asin": asin,
                "marketplace_id": marketplace_id,
                "brand": brand,
                "image_url": image_url,
                "parent_asin": parent_asin,
                "attributes": attributes  # optional (can remove if heavy)
            }
        })

    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": str(e)
        }, status=500)



# last final 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def amazon_profitability_details_transactions_shipping(request):
    from amazon_auth.models import ProductMapping, OrderItem, AmazonListingItem, ProfitCalculationSetting

    user = get_effective_user(request.user)
    profit_setting, _ = ProfitCalculationSetting.objects.get_or_create(user=user)
    data_source_raw = getattr(request, 'data', None) or (request.POST if request.method == 'POST' else request.GET)
    
    data_source = {}
    if data_source_raw:
        if hasattr(data_source_raw, 'dict'):
            data_source.update(data_source_raw.dict())
        else:
            data_source.update(data_source_raw)

    # Try parsing raw body if still empty
    if not data_source:
        try:
            import json
            raw_body = getattr(request, '_body', None) or getattr(getattr(request, '_request', None), '_body', None)
            if raw_body:
                body_data = json.loads(raw_body)
                if isinstance(body_data, dict):
                    data_source.update(body_data)
        except Exception: pass

    search_data = {}
    search_data.update(data_source)

    # Robust parsing for nested "filters" or "filter" keys (dictionary, JSON string, or bracket notation)
    for fk in ['filters', 'filter']:
        f_val = search_data.get(fk)
        if isinstance(f_val, str):
            try:
                import json
                f_val = json.loads(f_val)
            except Exception:
                pass
        if isinstance(f_val, dict):
            search_data.update(f_val)

    # Handle bracket notation like filters[fromDate]=...
    temp_updates = {}
    for k, v in search_data.items():
        for prefix in ['filters[', 'filter[']:
            if k.startswith(prefix) and k.endswith(']'):
                real_key = k[len(prefix):-1]
                temp_updates[real_key] = v
    search_data.update(temp_updates)

    def find_key(keys):
        for k in keys:
            val = search_data.get(k)
            if isinstance(val, list) and len(val) > 0: val = val[0]
            if val and str(val).strip(): return str(val).strip()
            # Case-insensitive
            for sk, sv in search_data.items():
                if sk.lower() == k.lower():
                    if isinstance(sv, list) and len(sv) > 0: sv = sv[0]
                    if sv and str(sv).strip(): return str(sv).strip()
        return None

    # Date Range Extraction
    from_date_str = find_key(['fromDate', 'start_date', 'from_date', 'startDate'])
    to_date_str = find_key(['toDate', 'end_date', 'to_date', 'endDate'])
    
    # Search term (matches asin or parent_asin)
    search_term = find_key(['search', 'searchTerm', 'q', 'keyword', 'asin', 'parentproductid'])
    
    # Rest of pagination
    pagination = data_source.get("pagination", {})
    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))

    from_date = to_date = None
    
    from zoneinfo import ZoneInfo

    IST = ZoneInfo("Asia/Kolkata")

    
    
    def parse_dt(dt_str, is_end=False):
        if not dt_str or not isinstance(dt_str, (str, bytes, date, datetime)) or len(str(dt_str)) < 10:
            return None, None
        try:
            if isinstance(dt_str, (datetime, date)):
                dt = dt_str
            else:
                clean_str = str(dt_str).split('T')[0]
                dt = datetime.strptime(clean_str, '%Y-%m-%d')

            if is_end:
                dt = dt.replace(hour=23, minute=59, second=59)
            else:
                dt = dt.replace(hour=0, minute=0, second=0)

            dt_ist = dt.replace(tzinfo=IST)
            dt_utc = dt_ist.astimezone(ZoneInfo("UTC"))
            return dt_utc, dt_ist   # return both
        except Exception:
            return None, None

    from_date, from_date_ist = parse_dt(from_date_str, is_end=False)
    to_date, to_date_ist = parse_dt(to_date_str, is_end=True)
        

    order_filter = Q(order__user=user)

    # ---------------- CHANNEL FILTER ----------------
    CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}

    filters = {}
    f_val = data_source.get("filters") or data_source.get("filter")
    if isinstance(f_val, str):
        try:
            import json
            f_val = json.loads(f_val)
        except Exception: pass
    if isinstance(f_val, dict):
        filters.update(f_val)

    channels = filters.get("channel", {}).get("IN", []) if isinstance(filters.get("channel"), dict) else []
    if channels:
        marketplace_ids = [CHANNEL_MAP.get(ch) for ch in channels if CHANNEL_MAP.get(ch)]
        order_filter &= Q(order__marketplace_id__in=marketplace_ids)

    # ---------------- ASIN FILTER ----------------
    parent_ids = filters.get("parentproductid", {}).get("IN", []) if isinstance(filters.get("parentproductid"), dict) else []
    if parent_ids:
        order_filter &= Q(asin__in=parent_ids)
        
    # ---------------- SEARCH FILTER (asin / parent_asin) ----------------
    if search_term:
        order_filter &= (
            Q(asin__icontains=search_term) |
            Q(parent_asin__icontains=search_term)
        )    

    # ---------------- DATE APPLY ----------------
    if from_date:
        order_filter &= Q(order__purchase_date__gte=from_date)
    if to_date:
        order_filter &= Q(order__purchase_date__lte=to_date)

    # ---------------- ORDER ITEM AGG ----------------

    listing_qs = AmazonListingItem.objects.filter(
            user=user
        ).filter(
            Q(asin=OuterRef("parent_asin")) | Q(asin=OuterRef("asin")) | Q(sku=OuterRef("seller_sku"))
        ).order_by("-updated_at")
    
    items = (
        OrderItem.objects
        .filter(order_filter)
        .exclude(order__order_status__icontains='Cancel')

        .annotate(

            sku_standard_cost=Subquery(
                listing_qs.values("standard_cost")[:1]
            ),

            sku_gst_rate=Subquery(
                listing_qs.values("gst_rate")[:1]
            ),

            sku_tcs_rate=Subquery(
                listing_qs.values("tcs")[:1]
            ),

            sku_tds_rate=Subquery(
                listing_qs.values("tds")[:1]
            ),

            sku_region=Subquery(
                listing_qs.values("region")[:1]
            ),
        )

        .values('parent_asin')

        .annotate(
            title=Max('title'),
            image_url=Max('image_url'),

            grossqty=Sum('quantity_ordered'),
            quantity_shipped=Sum('quantity_shipped'),

            shipping_income=Sum('shipping_income'),
            shipping_price=Sum('shipping_price'),

            discount=Sum('discount'),
            # promotion_discount=Sum('promotion_discount'),

            # avg_cost=Avg('item_price'),

            item_tax=Sum('item_tax'),

            # grosssales=Sum('item_price'),
            
            grosssales=Sum(
                Case(
                    When(Q(order__order_status__icontains='Pending') & Q(item_price=0), then=F('new_item_price')),
                    default=F('item_price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),
            promotion_discount=Sum('promotion_discount'),
            avg_cost=Avg(
                Case(
                    When(Q(order__order_status__icontains='Pending') & Q(item_price=0), then=F('new_item_price')),
                    default=F('item_price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),

            sku_standard_cost=Max('sku_standard_cost'),
            sku_gst_rate=Max('sku_gst_rate'),
            sku_tcs_rate=Max('sku_tcs_rate'),
            sku_tds_rate=Max('sku_tds_rate'),
            sku_region=Max('sku_region'),
        )
    )

    # ---------------- ESTIMATED FEES ----------------
    estimated_fee_qs = AmazonEstimatedFee.objects.filter(
        order_item__order__user=user
    ).exclude(order_item__order__order_status__icontains='Cancel')

    # apply same date filter
    if from_date:
        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__order__purchase_date__gte=from_date
        )

    if to_date:
        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__order__purchase_date__lte=to_date
        )

    # apply same parent filter
    if parent_ids:
        estimated_fee_qs = estimated_fee_qs.filter(
            order_item__parent_asin__in=parent_ids
        )

    estimated_fee_data = (
        estimated_fee_qs
        .values('asin')
        .annotate(
            estimated_fees=Sum('total_fees'),

            referral_fee=Sum('referral_fee'),
            closing_fee=Sum('closing_fee'),
            per_item_fee=Sum('per_item_fee'),

            fba_fee=Sum('fba_fee'),
            fba_pick_pack_fee=Sum('fba_pick_pack_fee'),
            fba_weight_handling_fee=Sum('fba_weight_handling_fee'),

            tax_amount=Sum('tax_amount'),
        )
    )

    estimated_fee_by_asin = {
        row['asin']: {
            "estimated_fees": float(row['estimated_fees'] or 0),
            "referral_fee": float(row['referral_fee'] or 0),
            "closing_fee": float(row['closing_fee'] or 0),
            "per_item_fee": float(row['per_item_fee'] or 0),
            "fba_fee": float(row['fba_fee'] or 0),
            "fba_pick_pack_fee": float(row['fba_pick_pack_fee'] or 0),
            "fba_weight_handling_fee": float(row['fba_weight_handling_fee'] or 0),
            "tax_amount": float(row['tax_amount'] or 0),
        }
        for row in estimated_fee_data
    }

    # ---------------- FINANCIAL EVENTS ----------------
    finances_qs = FinancialEvent.objects.filter(user=user)

    raw_map = (
        FinancialEvent.objects
        .filter(user=user)
        .exclude(raw_data=None)
        .values('amazon_order_id', 'raw_data')
    )

    raw_data_map = {}
    for r in raw_map:
        raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])

    if from_date:
        finances_qs = finances_qs.filter(posted_date__gte=from_date)
    if to_date:
        finances_qs = finances_qs.filter(posted_date__lte=to_date)

    finance_data = (
        finances_qs
        .values('amazon_order_id')
        .annotate(
            refund=Sum('total_amount', filter=Q(event_group="REFUND")),
            rto=Sum('total_amount', filter=Q(event_group="RTO")),
            # ads=Sum('total_amount', filter=Q(event_type__icontains='Ad')),
            commission=Sum('commission_fee'),
            fulfillment=Sum('fulfillment_fee'),
            other_fee=Sum('other_fee'),
            shipping_fee=Sum('shipping_fee'),
            gst=Sum('tax'),
        )
    )

    finance_map = {f['amazon_order_id']: f for f in finance_data}

    # ---------------- ASIN → ORDER MAP ----------------
    asin_orders = (
        OrderItem.objects
        .filter(order_filter)
        .exclude(order__order_status__icontains='Cancel')
        .values('asin', 'seller_sku', 'parent_asin', 'order__amazon_order_id', 'quantity_ordered', 'item_price','new_item_price', 'item_tax', 'promotion_discount')
    )

    child_parent_map = {}
    asin_map = {}
    for row in asin_orders:
        p_asin = row['parent_asin'] or row['asin']
        child_parent_map[row['asin']] = p_asin
        asin_map.setdefault(p_asin, []).append(row)

    estimated_fee_map = {}
    for asin, fee_data in estimated_fee_by_asin.items():
        p_asin = child_parent_map.get(asin) or asin
        if p_asin not in estimated_fee_map:
            estimated_fee_map[p_asin] = {
                "estimated_fees": 0.0, "referral_fee": 0.0, "closing_fee": 0.0,
                "per_item_fee": 0.0, "fba_fee": 0.0, "fba_pick_pack_fee": 0.0,
                "fba_weight_handling_fee": 0.0, "tax_amount": 0.0
            }
        for k, v in fee_data.items():
            estimated_fee_map[p_asin][k] += v

    # ---------------- TRANSACTION SHIPPING FEES — MFN POSTAGE FEE ONLY ----------------  
    
    matching_order_ids = [row['order__amazon_order_id'] for row in asin_orders]
    tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        identifier_name="ORDER_ID",
        identifier_value__in=matching_order_ids
    ).values("transaction_id", "identifier_value")

    tx_to_order = {
        row["transaction_id"]: row["identifier_value"]
        for row in tx_identifiers
    }

    # ============================================================
    # SHIPPING STATUS PRIORITY
    #
    # Prefer the released version of the deferred transaction.
    #
    # DEFERRED > DEFERRED_RELEASED > RELEASED
    #
    # IMPORTANT:
    # We select ONE lifecycle state per order so that:
    #
    # DEFERRED_RELEASED + RELEASED
    #
    # does not get counted twice.
    # ============================================================

    STATUS_PRIORITY = {
        "DEFERRED": 3,
        "DEFERRED_RELEASED": 2,
        "RELEASED": 1,
    }

    def get_best_shipping_status(statuses):
        return max(statuses, key=lambda status: STATUS_PRIORITY.get(status, 0))

    tx_shipping_map = {}

    # ------------------------------------------------------------
    # MFN SHIPPING
    # ------------------------------------------------------------
    mfn_postage_txns = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="ServiceFee",
        transaction_status__in=[
            "DEFERRED",
            "DEFERRED_RELEASED",
            "RELEASED",
        ],
        description__icontains="MfnPostageFee",
    ).values(
        "id",
        "total_amount",
        "transaction_status",
    )

    # order_id -> status -> amount
    mfn_by_order_status = {}

    for txn in mfn_postage_txns:
        order_id = tx_to_order.get(txn["id"])
        if not order_id:
            continue

        status = txn["transaction_status"]

        amount = float(txn["total_amount"] or 0)

        mfn_by_order_status.setdefault(order_id, {})

        mfn_by_order_status[order_id][status] = (
            mfn_by_order_status[order_id].get(status, 0.0) + amount
        )

    for order_id, status_amounts in mfn_by_order_status.items():
        best_status = get_best_shipping_status(status_amounts.keys())

        tx_shipping_map[order_id] = status_amounts[best_status]

    # ============================================================
    # AFN / FBA SHIPPING
    #
    # Shipment
    #    ->
    # FBAWeightBasedFee
    #
    # Again, select only the best transaction lifecycle status.
    # ============================================================

    afn_tx_ids = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="Shipment",
        transaction_status__in=[
            "DEFERRED",
            "DEFERRED_RELEASED",
            "RELEASED",
        ],
    ).values("id", "transaction_status")

    afn_status_map = {txn["id"]: txn["transaction_status"] for txn in afn_tx_ids}

    afn_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=afn_status_map.keys(),
            breakdown_type="FBAWeightBasedFee",
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )

    # order_id -> status -> amount
    afn_by_order_status = {}

    for bd in afn_breakdowns:
        transaction_id = bd["transaction_id"]

        order_id = tx_to_order.get(transaction_id)

        if not order_id:
            continue

        status = afn_status_map.get(transaction_id)

        if not status:
            continue

        amount = float(bd["total"] or 0)

        afn_by_order_status.setdefault(order_id, {})

        afn_by_order_status[order_id][status] = (
            afn_by_order_status[order_id].get(status, 0.0) + amount
        )

    for order_id, status_amounts in afn_by_order_status.items():
        best_status = get_best_shipping_status(status_amounts.keys())

        tx_shipping_map[order_id] = status_amounts[best_status]

    print("tx_shipping_map", tx_shipping_map)
    
    
    # ============================================================
    # RETURN CLASSIFICATION (COURIER vs CUSTOMER) — matched by order_id
    # ============================================================
    FULFILLMENT_FEE_REFUND_PATTERNS = ["FulfillmentFeeRefund"]

    refund_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='Refund',
        transaction_status__in=['DEFERRED', 'DEFERRED_RELEASED']
    )

    refund_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=refund_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values('transaction_id', 'identifier_value')

    refund_tx_to_order = {
        row['transaction_id']: row['identifier_value']
        for row in refund_identifiers
    }

    refunded_sales_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=refund_tx_to_order.keys(),
            breakdown_type="Refunded Sales",
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )
    
    refunded_sales_by_order = {}
    
    for row in refunded_sales_breakdowns:
        order_id = refund_tx_to_order.get(row["transaction_id"])
        if not order_id:
            continue
    
        refunded_sales_by_order[order_id] = (
            refunded_sales_by_order.get(order_id, 0.0)
            + float(row["total"] or 0)
        )
        

    order_ids_with_refund = set(refund_tx_to_order.values())

    fee_refund_q = Q()
    for pattern in FULFILLMENT_FEE_REFUND_PATTERNS:
        fee_refund_q |= Q(description__icontains=pattern)

    fee_refund_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='ServiceFee',
        transaction_status__in=['DEFERRED', 'DEFERRED_RELEASED'],
    ).filter(fee_refund_q)

    fee_refund_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=fee_refund_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values_list('identifier_value', flat=True)

    order_ids_with_fee_refund = set(fee_refund_identifiers)

    # ============================================================
    # FULFILLMENT FEE REFUND MAP
    # ============================================================
    
    fulfillment_fee_refund_breakdowns = (
        AmazonTransaction.objects.filter(
            id__in=tx_to_order.keys(),
            transaction_type="ServiceFee",
            transaction_status__in=["DEFERRED", "DEFERRED_RELEASED"],
            description__icontains="EasyshipFulfillmentFeeRefund",
        )
        .values("id", "total_amount")
    )
    
    # ============================================================
    # AMAZON FEES REFUND MAP
    # ============================================================
    
    amazon_fee_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=refund_tx_to_order.keys(),
            breakdown_type="AmazonFees",
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )
    
    amazon_fee_refund_by_order = {}
    
    for row in amazon_fee_breakdowns:
        order_id = refund_tx_to_order.get(row["transaction_id"])
        if not order_id:
            continue
    
        amazon_fee_refund_by_order[order_id] = (
            amazon_fee_refund_by_order.get(order_id, 0.0)
            + float(row["total"] or 0)
        )
    
    fulfillment_fee_refund_by_order = {}
    
    for txn in fulfillment_fee_refund_breakdowns:
        order_id = tx_to_order.get(txn["id"])
        if not order_id:
            continue
    
        fulfillment_fee_refund_by_order[order_id] = (
            fulfillment_fee_refund_by_order.get(order_id, 0.0)
            + float(txn["total_amount"] or 0)
        )

    refund_amount_by_order = {}
    refund_count_by_order = {}
    for txn in refund_txns.filter(id__in=refund_tx_to_order.keys()):
        oid = refund_tx_to_order.get(txn.id)
        if not oid:
            continue
        refund_amount_by_order[oid] = (
            refund_amount_by_order.get(oid, 0.0) + float(txn.total_amount or 0)
        )
        refund_count_by_order[oid] = refund_count_by_order.get(oid, 0) + 1

    courier_return_count = 0
    customer_return_count = 0
    courier_return_price = 0.0
    customer_return_price = 0.0

    for order_id in order_ids_with_refund:
        amount = refund_amount_by_order.get(order_id, 0.0)
        if order_id in order_ids_with_fee_refund:
            courier_return_count += 1
            courier_return_price += amount
        else:
            customer_return_count += 1
            customer_return_price += amount

    total_return_count = courier_return_count + customer_return_count

    # ============================================================
    # CLAIM AMOUNT — Transaction Type "Adjustment", description "SERRACReimbursement"
    # ============================================================
    claim_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='Adjustment',
        description__icontains='SERRACReimbursement',
    )

    claim_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=claim_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values('transaction_id', 'identifier_value')

    claim_tx_to_order = {
        row['transaction_id']: row['identifier_value']
        for row in claim_identifiers
    }

    claim_amount_by_order = {}
    claim_count_by_order = {}
    for txn in claim_txns.filter(id__in=claim_tx_to_order.keys()):
        oid = claim_tx_to_order.get(txn.id)
        if not oid:
            continue
        claim_amount_by_order[oid] = (
            claim_amount_by_order.get(oid, 0.0) + float(txn.total_amount or 0)
        )
        claim_count_by_order[oid] = claim_count_by_order.get(oid, 0) + 1

    total_claim_amount = sum(claim_amount_by_order.values())
    total_claim_count = len(claim_amount_by_order)
    
    
    # ============================================================
    # REPLACEMENT RETURN — Transaction Type "Shipment",
    # description "Order Payment", total_amount = 0
    # ============================================================
    replacement_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='Shipment',
        description='Order Payment',
        total_amount=0,
    )

    replacement_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=replacement_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values('transaction_id', 'identifier_value')

    replacement_tx_to_order = {
        row['transaction_id']: row['identifier_value']
        for row in replacement_identifiers
    }

    order_ids_with_replacement = set(replacement_tx_to_order.values())

    replacement_count_by_order = {}
    for txn in replacement_txns.filter(id__in=replacement_tx_to_order.keys()):
        oid = replacement_tx_to_order.get(txn.id)
        if not oid:
            continue
        replacement_count_by_order[oid] = replacement_count_by_order.get(oid, 0) + 1

    total_replacement_return_count = len(order_ids_with_replacement)

    from_date_local = from_date_ist.date() if from_date_ist else None
    to_date_local = to_date_ist.date() if to_date_ist else None

    # ---------------- CALCULATE OTHER EXPENSES ----------------
    parent_sku_map = {}
    
    pm_qs = ProductMapping.objects.filter(account__user=user).values('parent_asin', 'asin', 'seller_sku')
    for pm in pm_qs:
        p = pm.get('parent_asin') or pm.get('asin')
        s = pm.get('seller_sku')
        if p and s:
            parent_sku_map.setdefault(p, set()).add(s)

    all_oi_qs = OrderItem.objects.filter(order__user=user).values('parent_asin', 'asin', 'seller_sku').distinct()
    for oi in all_oi_qs:
        p = oi.get('parent_asin') or oi.get('asin')
        s = oi.get('seller_sku')
        if p and s:
            parent_sku_map.setdefault(p, set()).add(s)

    sku_to_parent = {}
    for p, skus in parent_sku_map.items():
        for s in skus:
            sku_to_parent[s] = p

    ali_qs = AmazonListingItem.objects.filter(user=user).values('asin', 'sku')
    for ali in ali_qs:
        s = ali.get('sku')
        a = ali.get('asin')
        p = sku_to_parent.get(s) or a
        if p and s:
            parent_sku_map.setdefault(p, set()).add(s)

    # ---------------- BUILD RESPONSE ----------------
    results = []

    total_sales = total_profit = total_ads = 0
    total_mpfees = total_net_sales = total_qty = total_final_net_qty = 0
    total_final_net_sales = 0
    total_returns = total_shipping = 0
    total_stdcost = 0
    total_ret_percent = 0
    adjusted_gross_sales = 0
    total_estimatefees = 0 
    total_mp_gst = 0
    total_gst = 0
    total_tcs = 0
    total_tds = 0
    total_taxable_value = 0
    total_gst_payable = 0
    total_exp_settlement = 0
    total_promo_discount = 0
    total_other_expenses = 0.0

    sku_asin_map = {
        normalize_sku(k): v
        for k, v in OrderItem.objects
            .filter(order_filter)
            .values_list('seller_sku', 'asin')
    }

    child_parent_map = {
        row['asin']: (row['parent_asin'] or row['asin'])
        for row in OrderItem.objects
            .filter(order_filter)
            .values('asin', 'parent_asin')
    }

    # ====== PRE-COMPUTE ADS SPEND ======
    from amazon_auth.models import ProductMapping
    
    # ads_metrics_qs = ProductAdMetric.objects.filter(
    #     product_ad__amazon_account__user=user,
    #     product_ad__amazon_account__is_primary=True,
    # )
    # if from_date:
    #     ads_metrics_qs = ads_metrics_qs.filter(report_date__gte=from_date.date())
    # if to_date:
    #     ads_metrics_qs = ads_metrics_qs.filter(report_date__lte=to_date.date())
    
    ads_metrics_qs = ProductAdMetric.objects.filter(
        product_ad__amazon_account__user=user,
        product_ad__amazon_account__is_primary=True,
    )
    if from_date_ist:
        ads_metrics_qs = ads_metrics_qs.filter(report_date__gte=from_date_ist.date())
    if to_date_ist:
        ads_metrics_qs = ads_metrics_qs.filter(report_date__lte=to_date_ist.date())
        
    ads_agg = ads_metrics_qs.values("product_ad__sku").annotate(
        total_ads_cost=Sum("cost"),
        total_ads_sales=Sum("sales"),
        total_ads_clicks=Sum("clicks"),
        total_ads_orders=Sum("orders"),
        total_ads_impressions=Sum("impressions"),
    )
    
    skus_with_ads = [x["product_ad__sku"] for x in ads_agg if x["product_ad__sku"]]
    
    pm_mappings = ProductMapping.objects.filter(account__user=user, seller_sku__in=skus_with_ads).values("seller_sku", "parent_asin", "asin", "product_name", "image_url")
    pm_dict = {m["seller_sku"]: m for m in pm_mappings}
    
    missing_skus = [sku for sku in skus_with_ads if sku not in pm_dict]
    if missing_skus:
        ali_mappings = AmazonListingItem.objects.filter(user=user, sku__in=missing_skus).values("sku", "asin", "item_name", "image_url")
        for ali in ali_mappings:
            if ali["sku"] not in pm_dict:
                pm_dict[ali["sku"]] = {
                    "seller_sku": ali["sku"],
                    "parent_asin": ali["asin"], # Listing items don't explicitly have parent_asin, use asin
                    "asin": ali["asin"],
                    "product_name": ali["item_name"],
                    "image_url": ali["image_url"],
                }

    missing_skus = [sku for sku in skus_with_ads if sku not in pm_dict]
    if missing_skus:
        oi_mappings = OrderItem.objects.filter(order__user=user, seller_sku__in=missing_skus).values("seller_sku", "parent_asin", "asin", "title", "image_url")
        for oi in oi_mappings:
            if oi["seller_sku"] not in pm_dict:
                pm_dict[oi["seller_sku"]] = {
                    "seller_sku": oi["seller_sku"],
                    "parent_asin": oi["parent_asin"],
                    "asin": oi["asin"],
                    "product_name": oi["title"],
                    "image_url": oi["image_url"],
                }
    
    ads_by_parent = {}
    for agg in ads_agg:
        sku = agg["product_ad__sku"]
        if not sku: continue
        
        pm = pm_dict.get(sku, {})
        p_asin = pm.get("parent_asin") or pm.get("asin") or sku
        
        if p_asin not in ads_by_parent:
            ads_by_parent[p_asin] = {
                "title": pm.get("product_name") or p_asin,
                "image_url": pm.get("image_url") or "",
                "cost": 0, "sales": 0, "clicks": 0, "orders": 0, "impressions": 0
            }
        
        ads_by_parent[p_asin]["cost"] += float(agg["total_ads_cost"] or 0)
        ads_by_parent[p_asin]["sales"] += float(agg["total_ads_sales"] or 0)
        ads_by_parent[p_asin]["clicks"] += int(agg["total_ads_clicks"] or 0)
        ads_by_parent[p_asin]["orders"] += int(agg["total_ads_orders"] or 0)
        ads_by_parent[p_asin]["impressions"] += int(agg["total_ads_impressions"] or 0)
    # ===================================

    expense_items = []
    processed_asins_in_order = set()
    for idx, r in enumerate(items):
        p_asin = r.get('parent_asin') or r.get('asin')
        if p_asin:
            processed_asins_in_order.add(p_asin)
        g_qty = float(r.get('grossqty') or 0)
        n_qty = max(g_qty, 0)
        f_sales = float(r.get('grosssales') or 0)

        sku_cnt = len(parent_sku_map.get(p_asin, set())) or 1

        expense_items.append({
            'key': idx,
            'marketplace': r.get('channel') or r.get('marketplace') or 'Amazon-India',
            'units': float(n_qty),
            'net_sales': float(f_sales),
            'sku_count': sku_cnt,
            'order_count_for_sku': 1
        })

    for p_asin, data in ads_by_parent.items():
        if p_asin in processed_asins_in_order:
            continue
        if parent_ids and p_asin not in parent_ids:
            continue
        if search_term:
            title = str(data.get("title") or "")
            if (search_term.lower() not in str(p_asin).lower()
                    and search_term.lower() not in title.lower()):
                continue
        ads_cost = -abs(data["cost"])
        if ads_cost == 0:
            continue
        sku_cnt = len(parent_sku_map.get(p_asin, set())) or 1
        expense_items.append({
            'key': f"ad_{p_asin}",
            'marketplace': 'Amazon-India',
            'units': 0.0,
            'net_sales': 0.0,
            'sku_count': sku_cnt,
            'order_count_for_sku': 1
        })

    other_expenses_map, total_effective_expense = calculate_other_expenses_map(user, from_date_local, to_date_local, expense_items, return_total_expense=True)

    processed_parent_asins = set()

    for idx, row in enumerate(items):
        # asin = row['asin']
        parent_asin = row['parent_asin']
        processed_parent_asins.add(parent_asin)
        # estimated_fees = estimated_fee_map.get(parent_asin, 0)

        fee_data = estimated_fee_map.get(parent_asin, {})

        estimated_fees = fee_data.get("estimated_fees", 0)

        referral_fee = fee_data.get("referral_fee", 0)
        closing_fee = fee_data.get("closing_fee", 0)
        per_item_fee = fee_data.get("per_item_fee", 0)

        fba_fee = fee_data.get("fba_fee", 0)
        fba_pick_pack_fee = fee_data.get("fba_pick_pack_fee", 0)
        fba_weight_handling_fee = fee_data.get("fba_weight_handling_fee", 0)

        tax_amount = fee_data.get("tax_amount", 0)

        gross_qty = int(row['grossqty'] or 0)
        quantity_shipped = int(row['quantity_shipped'] or 0)

        gross_sales = float(str(row['grosssales'] or 0))
        item_tax = float(str(row.get('item_tax') or 0))
        promo_discount = float(str(row.get('promotion_discount') or 0))

        gst_rate = float(str(row.get("sku_gst_rate") or 0))
        tcs_rate = float(str(row.get("sku_tcs_rate") or 0))
        tds_rate = float(str(row.get("sku_tds_rate") or 0))
        standard_cost = float(str(row.get("sku_standard_cost") or 0))
        print("row", row["sku_tds_rate"])

        orders = asin_map.get(parent_asin, [])

        tx_shipping_final = 0.0
        amazon_fee_refund_total = 0.0
        fulfillment_fee_refund_total = 0.0
        refunded_sales_total = 0.0
        
        for o in orders:
            oid = o['order__amazon_order_id']
            tx_shipping_final += float(tx_shipping_map.get(oid, 0.0))
            amazon_fee_refund_total += float(amazon_fee_refund_by_order.get(oid, 0.0))
            fulfillment_fee_refund_total += float(fulfillment_fee_refund_by_order.get(oid, 0.0))
            refunded_sales_total += float(refunded_sales_by_order.get(oid, 0.0))
            
        shipping_price = tx_shipping_final
        estimated_fees -= amazon_fee_refund_total

        # ==========================================================
        # ADS SPEND (FROM PRE-COMPUTED GLOBALLY)
        # ==========================================================

        parent_ad_data = ads_by_parent.get(parent_asin, {})
        ads = -abs(float(parent_ad_data.get("cost", 0)))
        ads_sales = float(parent_ad_data.get("sales", 0))
        ads_clicks = int(parent_ad_data.get("clicks", 0))
        ads_orders = int(parent_ad_data.get("orders", 0))
        ads_impressions = int(parent_ad_data.get("impressions", 0))

        refund = rto = mpfees = shipping_fee = 0.0
        return_units = 0.0
        t_new_charge = 0.0
        gst = 0.0

        final_net_sales = 0.0
        total_cost = 0.0

        for o in orders:
            oid = o['order__amazon_order_id']
            qty = float(o['quantity_ordered'] or 0)
            o_item_price = float(str(o.get('item_price') or 0))  
            o_new_item_price = float(str(o.get('new_item_price') or 0)) 
            o_item_tax = float(str(o.get('item_tax') or 0))

            f = finance_map.get(oid, {})

            refund += float(f.get('refund') or 0)
            rto += float(f.get('rto') or 0)

            mpfees += (
                float(f.get('commission') or 0) +
                float(f.get('fulfillment') or 0) +
                float(f.get('other_fee') or 0)
            )

            shipping_fee += float(f.get('shipping_fee') or 0)
            gst += float(f.get('gst') or 0)

            order_fee_map = extract_fees_and_tcs_per_asin(
                raw_data_map.get(oid, []),
                sku_asin_map=sku_asin_map
            )

            for child_asin, fee_data_inner in order_fee_map.items():
                parent_key = child_parent_map.get(child_asin)
                if parent_key == parent_asin:
                    t_new_charge += float(fee_data_inner["fee"])

            r = float(f.get('refund') or 0)
            rto_amt = float(f.get('rto') or 0)

            if r < 0 or rto_amt < 0:
                return_units += qty

            # Calculate final net sales and cost for this specific order
            
            o_item_price = (
                o_new_item_price
                if o_item_price == 0
                else o_item_price
            )
            o_gross = o_item_price + o_item_tax
            # o_new_item_price
            print("o_new_item_price newwwwwwwww>>>>>>>>>>>>>>>>",o_new_item_price)
            
            print("o_item_price first>>>>>>>>>>>>>>>>",o_item_price)
            
            print("o_gross first>>>>>>>>>>>>>>>>",o_gross)
            o_cost = standard_cost * qty

            o_replacement_count = replacement_count_by_order.get(oid, 0)
            o_return_count = refund_count_by_order.get(oid, 0)
            o_has_return = oid in order_ids_with_refund

            if o_replacement_count or (o_has_return and qty == o_return_count):
                o_gross = 0.0
                o_cost = 0.0
                o_promo = float(str(o.get('promotion_discount') or 0))
                promo_discount -= o_promo

            final_net_sales += o_gross
            total_cost += o_cost

        # ------------------------------------------------------------
        # RETURN / CLAIM — aggregated across all orders for this parent_asin row
        # ------------------------------------------------------------
        row_order_ids = [o['order__amazon_order_id'] for o in orders]
        order_fulfillment_fee_refund = sum(
            fulfillment_fee_refund_by_order.get(oid, 0.0) for oid in row_order_ids
        )
            
        order_return_amount = sum(refund_amount_by_order.get(oid, 0.0) for oid in row_order_ids)
        order_refunded_sales = sum(
            refunded_sales_by_order.get(oid, 0.0) for oid in row_order_ids
        )
        order_return_count = sum(refund_count_by_order.get(oid, 0) for oid in row_order_ids)
        order_has_return = any(oid in order_ids_with_refund for oid in row_order_ids)
        order_is_courier_return = any(oid in order_ids_with_fee_refund for oid in row_order_ids)

        if order_has_return and order_is_courier_return:
            order_return_type = "COURIER_RETURN"
        elif order_has_return:
            order_return_type = "CUSTOMER_RETURN"
        else:
            order_return_type = None

        row_courier_return_count = 0
        row_customer_return_count = 0
        row_courier_return_price = 0.0
        row_customer_return_price = 0.0

        seen_order_ids_for_row = set(oid for oid in row_order_ids if oid in order_ids_with_refund)
        for oid in seen_order_ids_for_row:
            amount = refund_amount_by_order.get(oid, 0.0)
            if oid in order_ids_with_fee_refund:
                row_courier_return_count += 1
                row_courier_return_price += amount
            else:
                row_customer_return_count += 1
                row_customer_return_price += amount

        order_claim_amount = sum(claim_amount_by_order.get(oid, 0.0) for oid in row_order_ids)
        order_claim_count = sum(claim_count_by_order.get(oid, 0) for oid in row_order_ids)
        order_has_claim = order_claim_count > 0 
        
        order_replacement_count = sum(replacement_count_by_order.get(oid, 0) for oid in row_order_ids)
        order_is_replacement = any(oid in order_ids_with_replacement for oid in row_order_ids)

        # ------------------------------------------------------------
        # TAXABLE VALUE
        # ------------------------------------------------------------
        print("final_net_sales first>>>>>>>>>>>>>>>>",final_net_sales)
        
        if gst_rate > 0:
            taxable_value = (
                final_net_sales / (1 + (gst_rate / 100.0))
            )
            gst_to_pay_amount = final_net_sales - taxable_value
        else:
            taxable_value = final_net_sales
            gst_to_pay_amount = 0.0

        # ------------------------------------------------------------
        # TCS  GST TO PAY
        # ------------------------------------------------------------

        if tcs_rate:
            tcs_total = taxable_value * (tcs_rate / 100.0)
        else:
            tcs_total = taxable_value * 0.01

        if tds_rate:
            tds_total = taxable_value * (tds_rate / 100.0)
        else:
            tds_total = 0.0

        if gst_rate:
            gst_to_pay_perc = gst_rate
        else:
            gst_to_pay_perc = (
                (gst_to_pay_amount / taxable_value) * 100.0
                if taxable_value else 0.0
            )  


        print("tds_rate>>>>>>??????????????????????????????????", tds_rate)    
        print("tds_total>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", tds_total)    

        # ---------------- CALCULATIONS ----------------
        net_qty = max(gross_qty , 0)
        
        final_net_qty = max(gross_qty , 0)
    
        net_sales = gross_sales + item_tax
        
        shipping_final = ( shipping_price + order_fulfillment_fee_refund ) 

        mp_gst = (-abs(estimated_fees) + shipping_final) * 0.18

        row_other_expense = float(other_expenses_map.get(idx, 0))

        stdcost = total_cost
        stdcost_per_unit = (total_cost / gross_qty) if gross_qty else 0

        avg_cost = float(row.get('avg_cost') or 0)
        missing_qty = 0
        for o in orders:
            if o.get('quantity_ordered') and avg_cost == 0:
                missing_qty += o['quantity_ordered']

        stdcost_missing_percentage = (missing_qty / gross_qty * 100) if gross_qty else 0

        # exp_settlement = (
        #     final_net_sales
        #     + shipping_final
        #     + ads
        #     + tcs_total
        #     - estimated_fees
        #     - mp_gst
        #     - promo_discount
        #     - order_claim_amount
        # )
        
        exp_settlement = (
            final_net_sales
            + shipping_final
            # + ads                        remove this 
            - tcs_total                    #substract now 
            - tds_total                    #substract now 
            - estimated_fees
            - mp_gst
            - promo_discount
            + order_claim_amount            #add this one 
        )

        
        profit = (
            final_net_sales
            + shipping_final
            + (ads if profit_setting.ad_spend else 0)
            + (tcs_total if profit_setting.tcs else 0)
            + (tds_total if profit_setting.tds else 0)
            - estimated_fees
            - (mp_gst if profit_setting.input_gst_itc else 0)
            - (gst_to_pay_amount if profit_setting.output_gst else 0)
            - promo_discount
            - (order_claim_amount if profit_setting.claim else 0)
            - (stdcost if profit_setting.product_cost else 0)
            - (row_other_expense if profit_setting.other_expense else 0)
        )
        profit_margin = (profit / final_net_sales * 100) if final_net_sales else 0


        print("final_net_sales>>>>>>>>>>>>>>>>",final_net_sales)
        print("gross_qty>>>>>>>>>>>>>>>>",gross_qty)
        print("gross_sales>>>>>>>>>>>??????????????????????",gross_sales)

        tacos = (
            abs(ads) / gross_sales * 100
        ) if gross_sales else 0

        row_customer_return_count += order_replacement_count
        order_return_count += order_replacement_count
        final_net_qty = final_net_qty - order_return_count

        ret_percent = (order_return_count / final_net_qty * 100) if final_net_qty else 0

        results.append({
            # "asin": asin,
            "asin": parent_asin, 
            "parent_asin": parent_asin, 
            "name": row['title'],
            "image_url": row['image_url'],
            "channel": "Amazon-India",
            "channel1": "Amazon-India",
            "grossqty": gross_qty,
            "netqty": net_qty,
            "final_net_qty":final_net_qty,   # final_net_qty - all retur
            "grosssales": format_currency(gross_sales),
            "netsales": format_currency(net_sales),
            "final_net_sales": format_currency(final_net_sales),
            # "ads": format_currency(ads),
            "ads": format_currency(ads),
            "ads_sales": format_currency(ads_sales),
            "ads_clicks": ads_clicks,
            "ads_orders": ads_orders,
            "ads_impressions": ads_impressions,
            "mpfees": round(mpfees, 2),
            "mp_gst": format_currency(mp_gst),
            "new_mpfees": format_currency(t_new_charge),
            # "estimatefees": format_currency(estimated_fees),
            "estimatefees": format_currency(-abs(estimated_fees)),
            "other_expenses": format_currency(-abs(row_other_expense)),

            "referral_fee": format_currency(referral_fee),
            "closing_fee": format_currency(closing_fee),
            "per_item_fee": format_currency(per_item_fee),

            "fba_fee": format_currency(fba_fee),
            "fba_pick_pack_fee": format_currency(fba_pick_pack_fee),
            "fba_weight_handling_fee": format_currency(fba_weight_handling_fee),

            "tax_amount": format_currency(tax_amount),
            "shippingfees": format_currency(shipping_final),
            "profit": format_currency(profit),
            "grossprofitper": round(profit_margin, 2),
            "returnqty": order_return_count,
            "retpercent": round(ret_percent, 2),
            "tacos": round(tacos, 2),
            # "id": asin,
            "id": parent_asin,
            "stdcost": format_currency(stdcost),
            "stdcost_per_unit": round(stdcost_per_unit, 2),
            "stdcostmissingqty": missing_qty,
            "stdcost_missing_percentage": round(stdcost_missing_percentage, 2),
            "redirecturl": f"https://www.amazon.in/dp/{parent_asin}" if parent_asin else None,
            "gst": format_currency(0),
            # "gst": "0",
            "tcs": format_currency(tcs_total),
            "tds": format_currency(tds_total),
            "taxable_value": format_currency(taxable_value),
            "gst_to_pay_amount": format_currency(gst_to_pay_amount),
            "gst_to_pay_perc": round(gst_to_pay_perc, 2),
            "exp_settlement": format_currency(exp_settlement),
            
            "promo_discount": format_currency(promo_discount),

            "return_type": order_return_type,
            "is_return": order_has_return,
            "return_count": order_return_count,
            "return_amount": format_currency(order_return_amount),
            
            "courier_return_count": row_courier_return_count,
            "customer_return_count": row_customer_return_count,
            "courier_return_price": format_currency(row_courier_return_price),
            "customer_return_price": format_currency(row_customer_return_price),

            "is_claim": order_has_claim,
            "claim_count": order_claim_count,
            "claim_amount": format_currency(order_claim_amount),
            
            "is_replacement_return": order_is_replacement,
            "replacement_return_count": order_replacement_count,
        })

        # -------- TOTALS --------
        total_sales += gross_sales
        total_net_sales += net_sales
        total_final_net_sales +=  final_net_sales
        total_profit += profit
        total_other_expenses += row_other_expense
        total_ads += ads
        total_mpfees += t_new_charge
        total_qty += net_qty
        total_final_net_qty += final_net_qty
        total_returns += return_units
        total_shipping += shipping_final
        total_stdcost += stdcost
        total_gst += gst
        total_tcs += tcs_total
        total_tds += tds_total

        total_estimatefees += estimated_fees
        total_mp_gst += mp_gst

        total_taxable_value += taxable_value
        total_gst_payable += gst_to_pay_amount
        total_exp_settlement += exp_settlement
        total_promo_discount += promo_discount

        total_return_count += order_replacement_count

        customer_return_count += order_replacement_count
        total_ret_percent = (total_return_count / total_final_net_qty * 100) if total_final_net_qty else 0
    # ====== START: ADD ASINS WITH AD SPEND BUT NO ORDERS ======
    for p_asin, data in ads_by_parent.items():
        if p_asin in processed_parent_asins:
            continue

        if parent_ids and p_asin not in parent_ids:
            continue

        # NEW: respect search_term the same way order_filter does
        if search_term:
            title = str(data.get("title") or "")
            if (search_term.lower() not in str(p_asin).lower()
                    and search_term.lower() not in title.lower()):
                continue


        ads_cost = -abs(data["cost"])
        if ads_cost == 0:
            continue
        row_other_expense = float(other_expenses_map.get(f"ad_{p_asin}", Decimal(0)))
        profit = ads_cost - abs(row_other_expense)
        ads_margin = (profit / 100 * 100) if 1 else 0
        # ads_margin = 0
        results.append({
            "asin": p_asin, 
            "parent_asin": p_asin, 
            "name": data["title"],
            "image_url": data["image_url"],
            "channel": "Amazon-India",
            "channel1": "Amazon-India",
            "grossqty": 0,
            "netqty": 0,
            "final_net_qty": 0,
            "grosssales": format_currency(0),
            "netsales": format_currency(0),
            "ads": format_currency(ads_cost),
            "ads_sales": format_currency(data["sales"]),
            "ads_clicks": data["clicks"],
            "ads_orders": data["orders"],
            "ads_impressions": data["impressions"],
            "mpfees": 0,
            "mp_gst": format_currency(0),
            "new_mpfees": format_currency(0),
            "estimatefees": format_currency(0),
            "other_expenses": format_currency(-abs(row_other_expense)),
            "referral_fee": format_currency(0),
            "closing_fee": format_currency(0),
            "per_item_fee": format_currency(0),
            "fba_fee": format_currency(0),
            "fba_pick_pack_fee": format_currency(0),
            "fba_weight_handling_fee": format_currency(0),
            "tax_amount": format_currency(0),
            "shippingfees": format_currency(0),
            "profit": format_currency(profit),
            "grossprofitper": round(ads_margin, 2),
            "returnqty": 0,
            "retpercent": 0,
            "tacos": 0,
            "id": p_asin,
            "stdcost": format_currency(0),
            "stdcost_per_unit": 0,
            "stdcostmissingqty": 0,
            "stdcost_missing_percentage": 0,
            "redirecturl": f"https://www.amazon.in/dp/{p_asin}" if p_asin else None,
            "gst": format_currency(0),
            "tcs": format_currency(0),
            "tds": format_currency(0),
            "taxable_value": format_currency(0),
            "gst_to_pay_amount": format_currency(0),
            "gst_to_pay_perc": 0,
            "exp_settlement": format_currency(0),
            "promo_discount": format_currency(0),
            "return_type": None,
            "is_return": False,
            "return_count": 0,
            "return_amount": format_currency(0),
            "courier_return_count": 0,
            "customer_return_count": 0,
            "courier_return_price": format_currency(0),
            "customer_return_price": format_currency(0),
            "is_claim": False,
            "claim_count": 0,
            "claim_amount": format_currency(0),
            "is_replacement_return": False,
            "replacement_return_count": 0,
        })

        total_ads += ads_cost
        total_profit += profit
        total_other_expenses += row_other_expense

    # ====== END: ADD ASINS WITH AD SPEND BUT NO ORDERS ======

    # -------- DEBUG AFTER BUILD --------
    db_asins = set(OrderItem.objects.filter(order__user=user).values_list('asin', flat=True))
    api_asins = set([r['asin'] for r in results])
    missing = db_asins - api_asins

    print("Missing ASINs:", len(missing))

    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": len(results)
        },
        "totals": {
            "ads": format_currency(total_ads),
            "netqty": total_qty,
            "total_final_net_qty":total_final_net_qty,
            # "totalreturn": total_returns,
            "totalreturn": total_return_count,
            "totalreturnper": f"{round(total_ret_percent, 2)}%",
            "grosssales": format_currency(total_sales),
            "netsales": format_currency(total_net_sales),
            "total_final_net_sales": format_currency(total_final_net_sales),
            "profit": format_currency(total_profit),
            # "grossprofitper": round((total_profit / total_final_net_sales * 100), 2) if total_final_net_sales else 0,
            "grossprofitper": (
                round((total_profit / total_final_net_sales) * 100, 2)
                if total_final_net_sales
                else round((total_profit / total_net_sales) * 100, 2)
                if total_net_sales
                else round((total_profit / total_sales) * 100, 2)
                if total_sales
                else 0
            ),
            "mpfees": format_currency(total_mpfees),
            "mp_gst": format_currency(total_mp_gst),
            # "estimatefees": format_currency(total_estimatefees),
            "estimatefees": format_currency(-abs(total_estimatefees)),
            "other_expenses": format_currency(-abs(total_effective_expense if total_effective_expense > 0 else total_other_expenses)),
            "total_other_expenses": format_currency(-abs(total_effective_expense if total_effective_expense > 0 else total_other_expenses)),
            "total_new_mpfees": format_currency(total_mpfees),
            "shippingfees": format_currency(total_shipping),
            "tacos": (total_ads / total_sales * 100) if total_sales else 0,
            "stdcost": format_currency(total_stdcost),
            # "totalgst": format_currency(total_tcs),
            "totalgst": format_currency(0),
            "tcs": format_currency(total_tcs),
            "tds": format_currency(total_tds),
            "taxable_value": format_currency(total_taxable_value),

            "gst_to_pay_amount": format_currency(total_gst_payable),
            "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 0}%",
            "exp_settlement": format_currency(total_exp_settlement),
            
            "total_promo_discount": format_currency(total_promo_discount),
            "total_return_count": total_return_count,
            "courier_return_count": courier_return_count,
            "customer_return_count": customer_return_count,
            "courier_return_price": format_currency(courier_return_price),
            "customer_return_price": format_currency(customer_return_price),

            "total_claim_count": total_claim_count,
            "total_claim_amount": format_currency(total_claim_amount),
            
            "total_replacement_return_count": total_replacement_return_count,
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sku_profitability_list_filtered(request):
    user = request.user
    data = getattr(request, "_full_data", None) or getattr(request, 'data', None) or {}
    filters = data.get("filters", {})
    if isinstance(filters, str):
        try:
            import json
            filters = json.loads(filters)
        except Exception:
            filters = {}

    pagination = data.get("pagination", {})
    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))

    profit_filter = filters.get("profit_filter") or data.get("profit_filter")

    from_date_str = filters.get('fromDate') or filters.get('start_date') or filters.get('from_date') or filters.get('startDate')
    to_date_str = filters.get('toDate') or filters.get('end_date') or filters.get('to_date') or filters.get('endDate')

    from_date = to_date = None
    from_date_ist = to_date_ist = None

    if from_date_str and len(str(from_date_str)) >= 10:
        try:
            from zoneinfo import ZoneInfo
            IST = ZoneInfo("Asia/Kolkata")
            UTC = ZoneInfo("UTC")
            from_date_ist = datetime.strptime(str(from_date_str)[:10], '%Y-%m-%d').replace(hour=0, minute=0, second=0, tzinfo=IST)
            from_date = from_date_ist.astimezone(UTC)
        except Exception as e:
            print("fromDate parse error:", e)

    if to_date_str and len(str(to_date_str)) >= 10:
        try:
            from zoneinfo import ZoneInfo
            IST = ZoneInfo("Asia/Kolkata")
            UTC = ZoneInfo("UTC")
            to_date_ist = datetime.strptime(str(to_date_str)[:10], '%Y-%m-%d').replace(hour=23, minute=59, second=59, tzinfo=IST)
            to_date = to_date_ist.astimezone(UTC)
        except Exception as e:
            print("toDate parse error:", e)

    from .utils import _get_sku_profits_for_dashboard
    sku_profits, return_claim_summary = _get_sku_profits_for_dashboard(
        user, from_date, to_date, filters,
        from_date_ist=from_date_ist, to_date_ist=to_date_ist
    )

    formatted_results = []
    for item in sku_profits:
        row = dict(item)
        row["channel"] = "Amazon-India"
        row["channel1"] = "Amazon-India"
        row["grosssales"] = format_currency(row.get("grosssales", 0))
        row["netsales"] = format_currency(row.get("netsales", 0))
        row["final_net_sales"] = format_currency(row.get("final_net_sales", 0))
        row["ads"] = format_currency(row.get("ads", 0))
        row["profit"] = format_currency(row.get("profit", 0))
        row["shippingfees"] = format_currency(row.get("shippingfees", 0))
        row["mpfees"] = format_currency(row.get("mpfees", 0))
        row["new_mpfees"] = format_currency(row.get("new_mpfees", 0))
        row["mp_gst"] = format_currency(row.get("mp_gst", 0))
        row["estimatefees"] = format_currency(-abs(row.get("estimatefees", 0)))
        row["stdcost"] = format_currency(row.get("stdcost", 0))
        row["tcs"] = format_currency(row.get("tcs", 0))
        row["tds"] = format_currency(row.get("tds", 0))
        row["other_expenses"] = format_currency(row.get("other_expenses", 0))
        row["total_other_expenses"] = format_currency(row.get("other_expenses", 0))
        row["cancelled_qty"] = row.get("cancelled_qty", 0)
        row["cancelled_sales"] = format_currency(row.get("cancelled_sales", 0))
        row["taxable_value"] = format_currency(row.get("taxable_value", 0))
        row["gst_to_pay_amount"] = format_currency(row.get("gst_to_pay_amount", 0))
        row["exp_settlement"] = format_currency(row.get("exp_settlement", 0))
        row["promo_discount"] = format_currency(row.get("promo_discount", 0))
        row["return_amount"] = format_currency(row.get("return_amount", 0))
        row["courier_return_price"] = format_currency(row.get("courier_return_price", 0))
        row["customer_return_price"] = format_currency(row.get("customer_return_price", 0))
        row["claim_amount"] = format_currency(row.get("claim_amount", 0))
        row["total_claim_amount"] = format_currency(row.get("claim_amount", 0))
        formatted_results.append(row)

    rows = formatted_results
    from amazon_auth.profit import _recalculate_totals_from_rows, parse_currency_to_decimal

    if profit_filter:
        pf_upper = str(profit_filter).upper().strip()
        if pf_upper in ("GT_0", "PROFITABLE", "PROFIT", "POSITIVE"):
            rows = [r for r in rows if parse_currency_to_decimal(r.get("profit")) > 0]
        elif pf_upper in ("LT_0", "UNPROFITABLE", "LOSS", "NEGATIVE"):
            rows = [r for r in rows if parse_currency_to_decimal(r.get("profit")) < 0]
        elif pf_upper in ("EQ_0", "ZERO"):
            rows = [r for r in rows if parse_currency_to_decimal(r.get("profit")) == 0]

    rows.sort(key=lambda r: parse_currency_to_decimal(r.get("grosssales") or r.get("gross_sales")), reverse=True)

    totals = _recalculate_totals_from_rows(rows)

    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": len(rows),
        },
        "totals": totals,
        "response": rows[page_no * page_size : (page_no + 1) * page_size]
    })






@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def get_parent_asin_ad_spend(request):
    user = request.user
    data_source_raw = getattr(request, 'data', None) or (request.POST if request.method == 'POST' else request.GET)
    
    data_source = {}
    if data_source_raw:
        if hasattr(data_source_raw, 'dict'):
            data_source.update(data_source_raw.dict())
        else:
            data_source.update(data_source_raw)

    if not data_source:
        try:
            import json
            raw_body = getattr(request, '_body', None) or getattr(getattr(request, '_request', None), '_body', None)
            if raw_body:
                body_data = json.loads(raw_body)
                if isinstance(body_data, dict):
                    data_source.update(body_data)
        except Exception: pass

    search_data = {}
    search_data.update(data_source)

    for fk in ['filters', 'filter']:
        f_val = search_data.get(fk)
        if isinstance(f_val, str):
            try:
                import json
                f_val = json.loads(f_val)
            except Exception: pass
        if isinstance(f_val, dict):
            search_data.update(f_val)

    def find_key(keys):
        for k in keys:
            val = search_data.get(k)
            if isinstance(val, list) and len(val) > 0: val = val[0]
            if val and str(val).strip(): return str(val).strip()
            for sk, sv in search_data.items():
                if sk.lower() == k.lower():
                    if isinstance(sv, list) and len(sv) > 0: sv = sv[0]
                    if sv and str(sv).strip(): return str(sv).strip()
        return None

    from_date_str = find_key(['fromDate', 'start_date', 'from_date', 'startDate'])
    to_date_str = find_key(['toDate', 'end_date', 'to_date', 'endDate'])
    
    pagination = data_source.get("pagination", {})
    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))

    def parse_dt(dt_str, is_end=False):
        if not dt_str or len(str(dt_str)) < 10: return None
        try:
            clean_str = str(dt_str).split('T')[0]
            dt = datetime.strptime(clean_str, '%Y-%m-%d')
            if is_end:
                dt = dt.replace(hour=23, minute=59, second=59)
            if timezone.is_naive(dt):
                return timezone.make_aware(dt)
            return dt
        except Exception: return None

    from_date = parse_dt(from_date_str, is_end=False)
    to_date = parse_dt(to_date_str, is_end=True)

    filters = {}
    f_val = data_source.get("filters") or data_source.get("filter")
    if isinstance(f_val, str):
        try:
            import json
            f_val = json.loads(f_val)
        except: pass
    if isinstance(f_val, dict):
        filters.update(f_val)

    parent_ids = filters.get("parentproductid", {}).get("IN", []) if isinstance(filters.get("parentproductid"), dict) else []

    from amazon_ads.models import ProductAdMetric
    from amazon_auth.models import ProductMapping, OrderItem, AmazonListingItem
    
    ads_metrics_qs = ProductAdMetric.objects.filter(
        product_ad__amazon_account__user=user,
        product_ad__amazon_account__is_primary=True,
    )
    if from_date:
        ads_metrics_qs = ads_metrics_qs.filter(report_date__gte=from_date.date())
    if to_date:
        ads_metrics_qs = ads_metrics_qs.filter(report_date__lte=to_date.date())
        
    ads_agg = ads_metrics_qs.values("product_ad__sku").annotate(
        total_ads_cost=Sum("cost"),
        total_ads_sales=Sum("sales"),
        total_ads_clicks=Sum("clicks"),
        total_ads_orders=Sum("orders"),
        total_ads_impressions=Sum("impressions"),
    )
    
    skus_with_ads = [x["product_ad__sku"] for x in ads_agg if x["product_ad__sku"]]
    
    pm_mappings = ProductMapping.objects.filter(account__user=user, seller_sku__in=skus_with_ads).values("seller_sku", "parent_asin", "asin", "product_name", "image_url")
    pm_dict = {m["seller_sku"]: m for m in pm_mappings}
    
    missing_skus = [sku for sku in skus_with_ads if sku not in pm_dict]
    if missing_skus:
        ali_mappings = AmazonListingItem.objects.filter(user=user, sku__in=missing_skus).values("sku", "asin", "item_name", "image_url")
        for ali in ali_mappings:
            if ali["sku"] not in pm_dict:
                pm_dict[ali["sku"]] = {
                    "seller_sku": ali["sku"],
                    "parent_asin": ali["asin"],
                    "asin": ali["asin"],
                    "product_name": ali["item_name"],
                    "image_url": ali["image_url"],
                }

    missing_skus = [sku for sku in skus_with_ads if sku not in pm_dict]
    if missing_skus:
        oi_mappings = OrderItem.objects.filter(order__user=user, seller_sku__in=missing_skus).values("seller_sku", "parent_asin", "asin", "title", "image_url")
        for oi in oi_mappings:
            if oi["seller_sku"] not in pm_dict:
                pm_dict[oi["seller_sku"]] = {
                    "seller_sku": oi["seller_sku"],
                    "parent_asin": oi["parent_asin"],
                    "asin": oi["asin"],
                    "product_name": oi["title"],
                    "image_url": oi["image_url"],
                }
    
    ads_by_parent = {}
    for agg in ads_agg:
        sku = agg["product_ad__sku"]
        if not sku: continue
        
        pm = pm_dict.get(sku, {})
        p_asin = pm.get("parent_asin") or pm.get("asin") or sku
        
        if p_asin not in ads_by_parent:
            ads_by_parent[p_asin] = {
                "title": pm.get("product_name") or p_asin,
                "image_url": pm.get("image_url") or "",
                "cost": 0, "sales": 0, "clicks": 0, "orders": 0, "impressions": 0
            }
        
        ads_by_parent[p_asin]["cost"] += float(agg["total_ads_cost"] or 0)
        ads_by_parent[p_asin]["sales"] += float(agg["total_ads_sales"] or 0)
        ads_by_parent[p_asin]["clicks"] += int(agg["total_ads_clicks"] or 0)
        ads_by_parent[p_asin]["orders"] += int(agg["total_ads_orders"] or 0)
        ads_by_parent[p_asin]["impressions"] += int(agg["total_ads_impressions"] or 0)
        
    results = []
    total_cost = 0
    total_sales = 0
    total_clicks = 0
    total_orders = 0
    total_impressions = 0
    
    for p_asin, data in ads_by_parent.items():
        if parent_ids and p_asin not in parent_ids:
            continue
            
        cost = abs(data["cost"]) 
        if cost == 0:
            continue
            
        results.append({
            "parent_asin": p_asin,
            "title": data["title"],
            "image_url": data["image_url"],
            "ads_cost": cost,
            "ads_sales": data["sales"],
            "ads_clicks": data["clicks"],
            "ads_orders": data["orders"],
            "ads_impressions": data["impressions"],
        })
        
        total_cost += cost
        total_sales += data["sales"]
        total_clicks += data["clicks"]
        total_orders += data["orders"]
        total_impressions += data["impressions"]

    results.sort(key=lambda x: x["ads_cost"], reverse=True)
    
    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": len(results)
        },
        "totals": {
            "ads_cost": total_cost,
            "ads_sales": total_sales,
            "ads_clicks": total_clicks,
            "ads_orders": total_orders,
            "ads_impressions": total_impressions,
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def profit_calculation_settings_view(request):
    """
    API endpoint to retrieve and update user's Profit Calculation Settings.
    GET: Returns current settings or default fallback values.
    POST: Creates/Updates user settings.
    """
    user = get_effective_user(request.user)
    setting, created = ProfitCalculationSetting.objects.get_or_create(user=user)

    if request.method == 'GET':
        return Response({
            "status": True,
            "message": "Settings fetched successfully",
            "settings": {
                "tcs": setting.tcs,
                "tds": setting.tds,
                "gst_treatment": setting.gst_treatment,
                "input_gst_itc": setting.input_gst_itc,
                "output_gst": setting.output_gst,
                "claim": setting.claim,
                "product_cost": setting.product_cost,
                "ad_spend": setting.ad_spend,
                "other_expense": setting.other_expense,
                "preview_output_gst_rate": float(setting.preview_output_gst_rate or 0.05),
                "preview_input_gst_rate": float(setting.preview_input_gst_rate or 0.18),
                "preview_other_expense": float(setting.preview_other_expense or 25),
            }
        })

    if request.method == 'POST':
        data = request.data or {}
        setting.tcs = bool(data.get('tcs', setting.tcs))
        setting.tds = bool(data.get('tds', setting.tds))
        if 'gst_treatment' in data:
            setting.gst_treatment = str(data.get('gst_treatment', 'adjusted'))
        setting.input_gst_itc = bool(data.get('input_gst_itc', setting.input_gst_itc))
        setting.output_gst = bool(data.get('output_gst', setting.output_gst))
        setting.claim = bool(data.get('claim', setting.claim))
        setting.product_cost = bool(data.get('product_cost', setting.product_cost))
        setting.ad_spend = bool(data.get('ad_spend', setting.ad_spend))
        setting.other_expense = bool(data.get('other_expense', setting.other_expense))

        if 'preview_output_gst_rate' in data:
            setting.preview_output_gst_rate = data.get('preview_output_gst_rate')
        if 'preview_input_gst_rate' in data:
            setting.preview_input_gst_rate = data.get('preview_input_gst_rate')
        if 'preview_other_expense' in data:
            setting.preview_other_expense = data.get('preview_other_expense')

        setting.save()

        return Response({
            "status": True,
            "message": "Settings updated successfully",
            "settings": {
                "tcs": setting.tcs,
                "tds": setting.tds,
                "gst_treatment": setting.gst_treatment,
                "input_gst_itc": setting.input_gst_itc,
                "output_gst": setting.output_gst,
                "claim": setting.claim,
                "product_cost": setting.product_cost,
                "ad_spend": setting.ad_spend,
                "other_expense": setting.other_expense,
                "preview_output_gst_rate": float(setting.preview_output_gst_rate or 0.05),
                "preview_input_gst_rate": float(setting.preview_input_gst_rate or 0.18),
                "preview_other_expense": float(setting.preview_other_expense or 25),
            }
        })