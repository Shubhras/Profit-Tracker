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
from .spapi_manager import SPAPIManager
from .models import AmazonAccount, Order, FinancialEvent, Report, OrderItem
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
# @login_required
def amazon_connect(request):
    print("connect api callllll//////")
    # state = secrets.token_hex(16)
    # request.session["amazon_state"] = state

    user_id = request.GET.get("user_id")
    state = f"{user_id}:{secrets.token_hex(16)}"
    request.session["amazon_state"] = state
    request.session["code_used"] = False


    # print("session_state//////",session_state)
    print("_state//////",state)
    
    auth_url = (
        "https://sellercentral.amazon.in/apps/authorize/consent"
        f"?application_id={AMAZON_APP_ID}"
        f"&state={state}"
        f"&redirect_uri={REDIRECT_URI}"

    )
    return redirect(auth_url)




def amazon_callback(request):
    print("callback api calll ///////////////:")
    state = request.GET.get("state")
    code = request.GET.get("spapi_oauth_code")
    seller_id = request.GET.get("selling_partner_id")
    user_id = request.GET.get("user_id")

    if not code:
        return JsonResponse({"error": "Authorization code missing"}, status=400)

    #  Prevent duplicate code usage
    if cache.get(code):
        return JsonResponse({"error": "Code already used"}, status=400)
    cache.set(code, True, timeout=300)

    print("CLIENT_ID:", AMAZON_CLIENT_ID)
    print("CLIENT_SECRET:", AMAZON_CLIENT_SECRET)

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

    print("STATUS:", response.status_code)
    print("RESPONSE:", response.text) 
    

    if response.status_code != 200:
        return JsonResponse({"error": response.text}, status=400)

    data = response.json()
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")


    # SAVE TO DATABASE (your original logic)
    user = None
    if user_id:
        user = User.objects.get(id=user_id)

    else:
        try:
            user_id = state.split(":")[0]
            user = User.objects.get(id=user_id)
        except:
            return JsonResponse({"error": "Invalid state"}, status=400)    


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

    return JsonResponse({
        "status": "success",
        "seller_id": seller_id,
        "is_new": created
    })



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



# @api_view(['GET', 'POST'])
# @permission_classes([IsAuthenticated])
# def get_full_dashboard(request):

#     print(f"DEBUG: get_full_dashboard called for user {request.user}")
#     user = request.user

#     # ---------------- INPUT ----------------
#     data_source_raw = request.data if request.method == 'POST' else request.GET
#     data_source = {}

#     if data_source_raw:
#         if hasattr(data_source_raw, 'dict'):
#             data_source.update(data_source_raw.dict())
#         else:
#             data_source.update(data_source_raw)

#     if not data_source:
#         try:
#             import json
#             body_data = json.loads(request._request.body)
#             if isinstance(body_data, dict):
#                 data_source.update(body_data)
#         except:
#             pass

#     search_data = {}
#     search_data.update(data_source)

#     if isinstance(search_data.get('filters'), dict):
#         search_data.update(search_data.get('filters'))

#     def find_key(keys):
#         for k in keys:
#             val = search_data.get(k)
#             if isinstance(val, list) and val:
#                 val = val[0]
#             if val:
#                 return str(val)
#         return None

#     start_date = datetime.strptime(find_key(['fromDate'])[:10], '%Y-%m-%d')
#     end_date = datetime.strptime(find_key(['toDate'])[:10], '%Y-%m-%d')
#     end_date = end_date.replace(hour=23, minute=59, second=59)

#     # ---------------- DATA ----------------
#     orders_qs = Order.objects.filter(user=user, purchase_date__range=(start_date, end_date))
#     finances_qs = FinancialEvent.objects.filter(user=user, posted_date__range=(start_date, end_date))

#     # ---------------- ORDERS ----------------
#     gross_sales = float(orders_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
#     gross_qty = orders_qs.count()

#     items_data = orders_qs.aggregate(
#         total_items=Sum(F('items_shipped') + F('items_unshipped'))
#     )
#     gross_item_qty = int(items_data['total_items'] or 0)

#     cancelled_qs = orders_qs.filter(order_status__icontains='Cancel')
#     cancelled_amount = float(cancelled_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
#     cancelled_amount = cancelled_amount if cancelled_amount < 0 else -cancelled_amount


#     finance_totals = finances_qs.aggregate(
#         principal=Sum('principal'),
#         tax=Sum('tax'),

#         shipping_income=Sum('shipping_income'),
#         shipping_expense=Sum('shipping_fee'),

#         commission=Sum('commission_fee'),
#         fulfillment=Sum('fulfillment_fee'),
#         other=Sum('other_fee'),

#         promotion=Sum('promotion_discount'),
#         refund=Sum('refund_amount'),

#         total=Sum('total_amount'),
#         qty=Sum('quantity')
#     )

#     principal = float(finance_totals['principal'] or 0)
#     tax = float(finance_totals['tax'] or 0)

#     shipping_income = float(finance_totals['shipping_income'] or 0)
#     shipping_expense = float(finance_totals['shipping_expense'] or 0)

#     commission = float(finance_totals['commission'] or 0)
#     fulfillment = float(finance_totals['fulfillment'] or 0)
#     other_fees = float(finance_totals['other'] or 0)

#     promotion_discount = float(finance_totals['promotion'] or 0)
#     refund_amount = float(finance_totals['refund'] or 0)

#     total_qty = int(finance_totals['qty'] or 0)

#     net_shipping = shipping_income - shipping_expense

#     total_fees = commission + fulfillment + other_fees

#     # ---------------- EVENT GROUPS ----------------
#     returns_qs = finances_qs.filter(event_group="REFUND")
#     rto_qs = finances_qs.filter(event_group="RTO")
#     claim_qs = finances_qs.filter(event_group="CLAIM")

#     # ---------------- RETURNS ----------------
#     returns_amount = float(returns_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
#     returns_qty = int(returns_qs.aggregate(q=Sum('quantity'))['q'] or 0)

#     # ---------------- RTO ----------------
#     rto_amount = float(rto_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
#     rto_qty = int(rto_qs.aggregate(q=Sum('quantity'))['q'] or 0)
    

#     # ---------------- CLAIM ----------------
#     claim_amount = float(claim_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
#     claim_qty = int(claim_qs.aggregate(q=Sum('quantity'))['q'] or 0)


#     # net_sales = principal + shipping
#     net_sales = principal + net_shipping - promotion_discount

#     # ---------------- ADS ----------------
#     # ad_metrics_qs = AdCampaignMetrics.objects.filter(
#     #     campaign__user=user,
#     #     date__range=(start_date.date(), end_date.date())
#     # )

#     ad_metrics_qs = AdCampaignMetrics.objects.filter(
#         campaign__user=user,
#         date__range=(start_date.date(), end_date.date())
#     )

#     ads_amount = float(
#         ad_metrics_qs.aggregate(val=Sum('spend'))['val'] or 0
#     )

#     # 🔥 sanity cap (VERY IMPORTANT)
#     if net_sales > 0 and abs(ads_amount) > net_sales:
#         ads_amount = - (net_sales * 0.3)  # cap at 30%



    

#     # ---------------- PROFIT ----------------
#     # profit = net_sales - total_fees + returns_amount + claim_amount + ads_amount
#     profit = (
#         net_sales
#         - total_fees
#         - refund_amount      # refund loss
#         - claim_amount       # claim loss
#         + ads_amount         # ads negative
#     )

#     # ---------------- METRICS ----------------
#     margin = (profit / net_sales * 100) if net_sales else 0
#     roi = (profit / abs(total_fees) * 100) if total_fees else 0
#     tacos = (abs(ads_amount) / net_sales * 100) if net_sales else 0

#     # ---------------- TRENDS ----------------
#     trends = orders_qs.annotate(date=TruncDate('purchase_date')).values('date').annotate(
#         sales=Sum('total_amount'),
#         qty=Count('id')
#     )

#     trends_data = []
#     for t in trends:
#         sales = float(t['sales'] or 0)
#         est_profit = sales * 0.3

#         trends_data.append({
#             "date": str(t['date']),
#             "sales": round(sales, 2),
#             "qty": t['qty'],
#             "estimated_profit": round(est_profit, 2),
#             "margin": f"{round((est_profit/sales)*100)}%" if sales else "0%"
#         })

#     # ---------------- GEO ----------------
#     geo_data_detailed = []
#     for state in orders_qs.values_list('state', flat=True).distinct():
#         state_orders = orders_qs.filter(state=state)

#         rev = float(state_orders.aggregate(val=Sum('total_amount'))['val'] or 0)
#         st_profit = rev * 0.3

#         geo_data_detailed.append({
#             "id": state or "UNKNOWN",
#             "revenue": f"{round(rev, 2)}",
#             "mpfees": f"{round(-(rev * 0.15), 2)}",
#             "profit": f"{round(st_profit, 2)}",
#             "ads": f"{round(-(rev * 0.05), 2)}"
#         })

    
#     # profit and losss asin
#     from django.db.models import DecimalField, Value
#     from django.db.models.functions import Coalesce

#     item_profit_qs = finances_qs.values(
#         'amazon_order_id'
#     ).annotate(
#         principal=Coalesce(Sum('principal'), Value(0), output_field=DecimalField()),
#         shipping=Coalesce(Sum('shipping_fee'), Value(0), output_field=DecimalField()),
#         tax=Coalesce(Sum('tax'), Value(0), output_field=DecimalField()),
#         commission=Coalesce(Sum('commission_fee'), Value(0), output_field=DecimalField()),
#         fulfillment=Coalesce(Sum('fulfillment_fee'), Value(0), output_field=DecimalField()),
#         other=Coalesce(Sum('other_fee'), Value(0), output_field=DecimalField()),
#     ).annotate(
#         profit=(
#             F('principal') +
#             F('shipping') -
#             F('tax') -
#             F('commission') -
#             F('fulfillment') -
#             F('other')
#         )
#     )

#     profitable_items = item_profit_qs.filter(profit__gt=0)
#     losing_items = item_profit_qs.filter(profit__lte=0)


#     profitable_summary = profitable_items.aggregate(
#         total_count=Count('amazon_order_id'),
#         total_amount=Sum('profit')
#     )

#     losing_summary = losing_items.aggregate(
#         total_count=Count('amazon_order_id'),
#         total_amount=Sum('profit')
#     )
#     cancelled_qty = cancelled_qs.count()

#     total_q = (
#         gross_item_qty
#         + cancelled_qty
#         + rto_qty
#         + returns_qty
#         # + claim_qty
#     )

#     # ---------------- RESPONSE ----------------
#     return JsonResponse({
#         "status": "success",
#         "currency": "INR",
#         "header_metrics": {
#             "sales": round(net_sales, 2),
#             "profit": round(profit, 2),
#             "margin": f"{round(margin)}%",
#             "roi": f"{round(roi)}%",
#             "ad_spend": round(ads_amount, 2),
#             "tacos": f"{round(tacos)}%"
#         },
#         "breakdown_table": {
#             "gross": {"qty": total_q, "amount": format_currency(gross_sales)}, 
#             "cancelled": {"qty": -abs(cancelled_qs.count()), "amount": format_currency(cancelled_amount)},
#             "cancelled(RTO)": {"qty": -abs(rto_qty), "amount": format_currency(rto_amount)},
#             "returned": {"qty": -abs(returns_qty), "amount": format_currency(returns_amount)},
#             "returned(RTO)": {"qty": -abs(rto_qty), "amount": format_currency(rto_amount)},
#             "returned(CRef)": {"qty": claim_qty, "amount": format_currency(claim_amount)},
#             "fees": {"amount": round(total_fees, 2), "method": "calculated"},
#             "net": {"qty": gross_item_qty, "amount": format_currency(net_sales)},
#         },
#         "trends": trends_data,
#         "geography": geo_data_detailed,

#         "top_orders": {
#             "profitable": {
#                 "total_count": profitable_summary['total_count'] or 0,
#                 "total_amount": f"₹{round(float(profitable_summary['total_amount'] or 0), 2)}",
#                 "data": list(
#                     profitable_items.order_by('-profit')[:20].values(
#                         'amazon_order_id',
#                         'profit'
#                     )
#                 )
#             },
#             "losing": {
#                 "total_count": losing_summary['total_count'] or 0,
#                 "total_amount": f"-₹{abs(round(float(losing_summary['total_amount'] or 0), 2))}",
#                 "data": list(
#                     losing_items.order_by('profit')[:20].values(
#                         'amazon_order_id',
#                         'profit'
#                     )
#                 )
#             }
#         },
#         # "top_orders": {
#         #     "profitable": {
#         #         "total_count": profitable_summary['total_count'] or 0,
#         #         "total_amount": f"₹{round(float(profitable_summary['total_amount'] or 0), 2)}",
#         #         "data": list(profitable_orders_qs.values('amazon_order_id', 'total_amount'))
#         #     },
#         #     "losing": {
#         #         "total_count": losing_summary['total_count'] or 0,
#         #         "total_amount": f"₹{round(float(losing_summary['total_amount'] or 0), 2)}",
#         #         "data": list(losing_orders_qs.values('amazon_order_id', 'total_amount'))
#         #     }
#         # },
#         "warnings": []
#     })



#     return sku_results

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def get_full_dashboard(request):

    print(f"DEBUG: get_full_dashboard called for user {request.user}")
    user = request.user

    # ---------------- INPUT ----------------
    data_source_raw = request.data if request.method == 'POST' else request.GET
    data_source = {}

    if data_source_raw:
        if hasattr(data_source_raw, 'dict'):
            data_source.update(data_source_raw.dict())
        else:
            data_source.update(data_source_raw)

    if not data_source:
        try:
            import json
            body_data = json.loads(request._request.body)
            if isinstance(body_data, dict):
                data_source.update(body_data)
        except:
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

    try:
        start_date = datetime.strptime(from_date_str[:10], '%Y-%m-%d') if from_date_str else (timezone.now() - timedelta(days=30))
        end_date = datetime.strptime(to_date_str[:10], '%Y-%m-%d') if to_date_str else timezone.now()
    except Exception:
        start_date = timezone.now() - timedelta(days=30)
        end_date = timezone.now()

    end_date = end_date.replace(hour=23, minute=59, second=59)


    # ---------------- DATA ----------------
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
    net_sales = principal + net_shipping - promotion_discount

    # ---------------- ADS ----------------
    # ad_metrics_qs = AdCampaignMetrics.objects.filter(
    #     campaign__user=user,
    #     date__range=(start_date.date(), end_date.date())
    # )

    # ============================================================
    # ADS SPEND
    # ============================================================

    ads_metrics_qs = ProductAdMetric.objects.filter(
        product_ad__amazon_account__user=user,
        product_ad__amazon_account__is_primary=True,
        report_date__range=(
            start_date.date(),
            end_date.date()
        )
    )

    ads_amount = float(
        ads_metrics_qs.aggregate(
            total=Sum("cost")
        )["total"] or 0
    )

    # make negative for expense
    ads_amount = -abs(ads_amount)
        

    # ---------------- PROFIT ----------------
    # profit = net_sales - total_fees + returns_amount + claim_amount + ads_amount
    profit = (
        net_sales
        - total_fees
        - refund_amount      # refund loss
        - claim_amount       # claim loss
        + ads_amount         # ads negative
    )


    # ---------------- METRICS ----------------
    margin = (profit / net_sales * 100) if net_sales else 0
    roi = (profit / abs(total_fees) * 100) if total_fees else 0
    tacos = (abs(ads_amount) / net_sales * 100) if net_sales else 0

    # ---------------- TRENDS ----------------
    trends = orders_qs.annotate(date=TruncDate('purchase_date')).values('date').annotate(
        sales=Sum('total_amount'),
        qty=Sum('items__quantity_ordered')
    )

    trends_data = []
    margin_factor = profit / gross_sales if gross_sales else 0

    for t in trends:
        sales = float(t['sales'] or 0)
        est_profit = sales * margin_factor

        trends_data.append({
            "date": t['date'].strftime('%m-%d') if t['date'] else "",
            "sales": round(sales, 2),
            "qty": t['qty'] or 0,
            "estimated_profit": round(est_profit, 2),
            "margin": f"{round((est_profit/sales)*100)}%" if sales else "0%"
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

    
    # profit and losss sku
    sku_profits = _get_sku_profits_for_dashboard(user, start_date, end_date, search_data)
    
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
        s.get("shipping_final", 0)
        for s in sku_profits
    )


    cancelled_qty = cancelled_qs.count() 



    # total_q = (
    #     gross_item_qty
    #     + cancelled_qty
    #     + rto_qty
    #     + returns_qty
    #     # + claim_qty
    # )

    total_q = (
        gross_item_qty
        + cancelled_qty
        + rto_qty
        + returns_qty
        + claim_qty
        # + claim_qty
    )


    # net_gross_item_qty = gross_item_qty - cancelled_qty 
    net_gross_item_qty = gross_item_qty 
    net_gross_sales = gross_sales + cancelled_amount

    total_gross = (
        net_gross_sales
        - rto_amount
        - returns_amount
        - cancelled_amount
        - claim_amount
    )

    # ---------------- RESPONSE ----------------
    return JsonResponse({
        "status": "success",
        "statusCode":200,
        "currency": "INR",
        "startDate": start_date,
        "endDate": end_date,
        "header_metrics": {
            "sales": round(net_gross_sales, 2),
            "profit": round(profit, 2),
            "margin": f"{round(margin)}%",
            "roi": f"{round(roi)}%",
            "ad_spend": format_currency(ads_amount),
            "tacos": f"{round(tacos)}%",
            "shipping": format_currency(total_shipping_final),
        },
        "breakdown_table": {
            "gross": {"qty": total_q, "amount": format_currency(total_gross)}, 
            "cancelled": {"qty": -abs(cancelled_qs.count()), "amount": format_currency(cancelled_amount)},
            "cancelled(RTO)": {"qty": -abs(rto_qty), "amount": format_currency(rto_amount)},
            "returned": {"qty": -abs(returns_qty), "amount": format_currency(returns_amount)},
            "returned(RTO)": {"qty": -abs(rto_qty), "amount": format_currency(rto_amount)},
            "returned(CRef)": {"qty": claim_qty, "amount": format_currency(claim_amount)},
            "claim": {"qty": claim_qty, "amount": format_currency(claim_amount)},
            "fees": {"amount": round(total_fees, 2), "method": "calculated"},
            # "net": {"qty": gross_item_qty, "amount": format_currency(net_sales)},
            "net": {"qty": net_gross_item_qty, "amount": format_currency(net_gross_sales)},
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
    print(f"DEBUG Pivot Request: {request.data if request.method == 'POST' else request.GET}")

    # 1. EXTRACT PARAMS (Robust logic)
    data_source_raw = request.data if request.method == 'POST' else request.GET
    
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
            body_data = json.loads(request._request.body)
            if isinstance(body_data, dict):
                data_source.update(body_data)
        except: pass
        
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

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def get_amazon_data_profi_tability(request):
#     """
#     Returns Amazon profit data in the specific format requested by the user.
#     Handles POST requests with filters and pagination.
#     """
#     user = request.user
#     # 1. EXTRACT PARAMS (Robust logic)
#     data_source_raw = request.data if request.method == 'POST' else request.GET
    
#     data_source = {}
#     if data_source_raw:
#         if hasattr(data_source_raw, 'dict'):
#             data_source.update(data_source_raw.dict())
#         else:
#             data_source.update(data_source_raw)
    
#     # Try parsing raw body if still empty
#     if not data_source:
#         try:
#             import json
#             body_data = json.loads(request._request.body)
#             if isinstance(body_data, dict):
#                 data_source.update(body_data)
#         except: pass
        
#     search_data = {}
#     search_data.update(data_source)
#     f_child = search_data.get('filters')
#     if isinstance(f_child, dict):
#         search_data.update(f_child)

#     def find_key(keys):
#         for k in keys:
#             val = search_data.get(k)
#             if isinstance(val, list) and len(val) > 0: val = val[0]
#             if val and str(val).strip(): return str(val).strip()
#             # Case-insensitive
#             for sk, sv in search_data.items():
#                 if sk.lower() == k.lower():
#                     if isinstance(sv, list) and len(sv) > 0: sv = sv[0]
#                     if sv and str(sv).strip(): return str(sv).strip()
#         return None

#     from_date_str = find_key(['fromDate', 'start_date', 'from_date', 'startDate'])
#     to_date_str = find_key(['toDate', 'end_date', 'to_date', 'endDate', 'toDate'])

#     # New specific filters
#     sku_f = find_key(['SKU', 'sku', 'seller_sku'])
#     product_f = find_key(['ProductId', 'productId', 'product_id'])
#     parent_f = find_key(['ParentId', 'parentId', 'parent_id'])
#     mkt_cat_f = find_key(['MKT category', 'mkt_category', 'category'])
#     master_sku_f = find_key(['Inv MasterSku', 'master_sku', 'masterSku'])
    
#     pagination = search_data.get('pagination', {})
#     metric_options = search_data.get('metric', {})
#     summary_metric = metric_options.get('summarymetric', 'channel')

#     def parse_iso_date(date_str, default_delta):
#         if not date_str or not isinstance(date_str, (str, bytes, date, datetime)) or len(str(date_str)) < 10:
#             return timezone.now() + default_delta
#         try:
#             if isinstance(date_str, (datetime, date)):
#                 dt = date_str
#             else:
#                 # Handle YYYY-MM-DD or ISO formats
#                 s = str(date_str)[:10]
#                 dt = datetime.strptime(s, '%Y-%m-%d')
            
#             if timezone.is_naive(dt):
#                 return timezone.make_aware(dt)
#             return dt
#         except Exception:
#             return timezone.now() + default_delta
  
#     from_date = parse_iso_date(from_date_str, timedelta(days=-30))
#     to_date = parse_iso_date(to_date_str, timedelta(days=0))
#     if to_date:
#         to_date = to_date.replace(hour=23, minute=59, second=59)
 
#     # Channel filtering
#     channels = search_data.get('channel', {}).get('IN', []) if isinstance(search_data.get('channel'), dict) else []
#     # Check if Amazon is requested
#     is_amazon_requested = not channels or any("Amazon" in c for c in channels)
    
#     if not is_amazon_requested:
#          return JsonResponse({
#             "status": True,
#             "message": "Success",
#             "message_code": "E1",
#             "pagination": {"pageNo": 0, "pageSize": pagination.get('pageSize', 25), "count": 0},
#             "totals": {},
#             "response": []
#         })
 
#     # Base querysets
#     orders_qs = Order.objects.filter(user=user, purchase_date__range=(from_date, to_date))
#     items_qs = OrderItem.objects.filter(order__user=user, order__purchase_date__range=(from_date, to_date))
#     finances_qs = FinancialEvent.objects.filter(user=user, posted_date__range=(from_date, to_date))

#     # Apply product filters
#     if sku_f:
#         orders_qs = orders_qs.filter(items__seller_sku__icontains=sku_f)
#         items_qs = items_qs.filter(seller_sku__icontains=sku_f)
#     if product_f:
#         orders_qs = orders_qs.filter(items__order_item_id__icontains=product_f)
#         items_qs = items_qs.filter(order_item_id__icontains=product_f)
#     if parent_f or mkt_cat_f or master_sku_f:
#         search_term = parent_f or mkt_cat_f or master_sku_f
#         orders_qs = orders_qs.filter(items__title__icontains=search_term)
#         items_qs = items_qs.filter(title__icontains=search_term)
    
#     # Ensure distinct orders after M2M filter
#     orders_qs = orders_qs.distinct()
 
#     # Grouping Logic
#     if summary_metric == 'channel':
#         # Group by Amazon Account (Seller Central ID)
#         grouped_data = Order.objects.filter(user=user, purchase_date__range=(from_date, to_date)).values('amazon_account__seller_central_id').annotate(
#             # grossqty=Sum('items_shipped'),
#             grossqty=Count(
#                 'id',
#                 filter=Q(order_status__iexact='shipped')
#             ),
#             grosssales=Sum('total_amount'),
#             min_date=Min('purchase_date'),
#             max_date=Max('purchase_date'),
#             order_count=Count('id')
#         )
#     else:
#         # Default: Group by SKU
#         grouped_data = items_qs.values('seller_sku', 'title').annotate(
#             # grossqty=Sum('quantity_ordered'),
#             shippingqty=Sum('quantity_shipped'),
#             grossqty=Count(
#                 'id',
#                 filter=Q(order_status__iexact='shipped')
#             ),
#             grosssales=Sum('item_price'),
#             min_date=Min('order__purchase_date'),
#             max_date=Max('order__purchase_date')
#         )
 
#     total_count = grouped_data.count()
#     page_no = pagination.get('pageNo', 0)
#     page_size = pagination.get('pageSize', 25)
#     start_idx = page_no * page_size
#     end_idx = start_idx + page_size
    
#     paged_data = grouped_data[start_idx:end_idx]
#     response_data = []
    
#     # Global Totals Init
#     total_ads = 0
#     total_gross_sales = 0
#     total_net_sales = 0
#     total_profit = 0
#     total_qty = 0
#     total_mp_fees = 0
#     total_shipping_fees = 0
#     total_cogs = 0
 
#     for p in paged_data:
#         if summary_metric == 'channel':
#             display_name = "Amazon-India" # User seems to expect this label
#             gross_sales = float(p['grosssales'] or 0)
#             gross_qty = p['grossqty'] or 0
            
#             # Filters for this specific account
#             p_orders = orders_qs.filter(amazon_account__seller_central_id=p['amazon_account__seller_central_id'])
#             p_order_ids = p_orders.values_list('amazon_order_id', flat=True)
#             p_finances = finances_qs.filter(Q(amazon_order_id__in=p_order_ids) | Q(amazon_account__seller_central_id=p['amazon_account__seller_central_id']))
#             id_val = display_name
#         else:
#             sku = p['seller_sku']
#             display_name = p['title']
#             gross_sales = float(p['grosssales'] or 0)
#             gross_qty = p['grossqty'] or 0
            
#             # Filters for this SKU
#             sku_items = items_qs.filter(seller_sku=sku)
#             p_order_ids = sku_items.values_list('order__amazon_order_id', flat=True)
#             p_finances = finances_qs.filter(amazon_order_id__in=p_order_ids)
#             id_val = sku
 
#         # CORRECT FINANCIAL LOGIC
#         if p_finances.exists():
#             shipments = p_finances.filter(event_type__icontains='Shipment')
#             refund_evs = p_finances.filter(event_type__icontains='Refund')
            
#             settled_income = float(shipments.aggregate(val=Sum('total_amount'))['val'] or 0)
#             refunds = float(refund_evs.aggregate(val=Sum('total_amount'))['val'] or 0)
            
#             # 2. Marketplace Fees (The difference between what customer paid and what we got in shipments)
#             # gross_sales is what customer paid (from Order model)
#             mp_fees = (settled_income - gross_sales) if settled_income > 0 else -(gross_sales * 0.18)
            
#             shipping_fees = float(p_finances.filter(event_type__icontains='Shipping').aggregate(val=Sum('total_amount'))['val'] or 0)
#             ads = float(p_finances.filter(Q(event_type__icontains='Ad') | Q(raw_data__icontains='Sponsored') | Q(event_type__icontains='ServiceFee')).aggregate(val=Sum('total_amount'))['val'] or 0)
#             storage_fees = float(p_finances.filter(event_type__icontains='Storage').aggregate(val=Sum('total_amount'))['val'] or 0)
#             other_fees = float(p_finances.filter(event_type__icontains='Adjustment').aggregate(val=Sum('total_amount'))['val'] or 0)
#             return_qty = refund_evs.count()
#         else:
#             # Fallback estimates
#             mp_fees = -(gross_sales * 0.18)
#             shipping_fees = -(gross_qty * 65)
#             ads = -(gross_sales * 0.05)
#             refunds = 0
#             storage_fees = -(gross_sales * 0.01)
#             other_fees = 0
#             return_qty = 0

#         # Derived Metrics
#         cogs = -(gross_sales * 0.35) # Reduced estimate to 35% for better realism
#         net_sales = gross_sales + refunds
#         # Profit = Gross Sales + Fees (neg) + Refunds (neg) + Ads (neg) + COGS (neg) + Storage + Other
#         profit = gross_sales + mp_fees + shipping_fees + ads + cogs + refunds + storage_fees + other_fees
#         profit_margin = (profit / gross_sales * 100) if gross_sales > 0 else 0
#         grossprofit = gross_sales + mp_fees + shipping_fees
        
#         item = {
#             "ads": f"{round(ads, 2)}",
#             "channel": display_name,
#             "channel1": display_name,
#             "claims": "-352", # Placeholder or derived from finances if available
#             "customerdiscount": f"{round(gross_sales * 0.1, 2)}",
#             "drr": f"{round(gross_sales / 30, 2)}",
#             "grossmrp": f"{round(gross_sales * 2.5, 2)}",
#             "grossmrpdiscount": "60.0",
#             "grossprofit": round(grossprofit, 2),
#             "grossprofitper": round((grossprofit / gross_sales * 100), 2) if gross_sales > 0 else 0,
#             "grossqty": f"{gross_qty}",
#             "grosssales": f"{round(gross_sales, 2)}",
#             "gsttopay": 0.0,
#             "id": id_val,
#             "imageurl": "https://m.media-amazon.com/images/I/81yIRz4tPNL.jpg", # Sample
#             "maxorderdate": p['max_date'].strftime('%Y-%m-%d') if p['max_date'] else None,
#             "minorderdate": p['min_date'].strftime('%Y-%m-%d') if p['min_date'] else None,
#             "mpfees": f"{round(mp_fees, 2)}",
#             "mpfees_with_claims": f"{round(mp_fees - 352, 2)}",
#             "mrp": f"{round(gross_sales * 2.5, 2)}",
#             "mrp_customer_discount": "60.0",
#             "mrp_grosssales": f"{round(gross_sales, 2)}",
#             "mrp_netsales": f"{round(net_sales, 2)}",
#             "name": display_name,
#             "net_discount": "0",
#             "netasp": f"{round(net_sales / gross_qty, 2)}" if gross_qty > 0 else "0",
#             "netqty": f"{gross_qty}",
#             "netsales": f"{round(net_sales, 2)}",
#             "orderdate": p['max_date'].strftime('%Y-%m-%d') if p['max_date'] else None,
#             "otherfees": f"{round(other_fees, 2)}",
#             "per_of_sale": "100.00",
#             "productid": id_val if summary_metric != 'channel' else "B0GTMH4RFJ",
#             "productidentifier": None,
#             "producttitle": display_name,
#             "profit": round(profit, 2),
#             "profit_settled_amount": f"{round(grossprofit + refunds, 2)}",
#             "profitcogs": f"{round(cogs, 2)}",
#             "profitmargin": profit_margin,
#             "redirecturl": None,
#             "replacedqty": "0",
#             "retpercent": round((abs(refunds)/gross_sales*100), 2) if gross_sales > 0 else 0,
#             "returnestqty": "0",
#             "returnqty": f"{return_qty}",
#             "rowcount": 1,
#             "shippingfees": f"{round(shipping_fees, 2)}",
#             "stdcost_missing_percentage": "0",
#             "stdcostmissingqty": "0",
#             "storagefees": f"{round(storage_fees, 2)}",
#             "tacos": f"{round((abs(ads)/gross_sales*100), 2)}" if gross_sales > 0 else "0",
#             "tcsinc": "0",
#             "total_gross_gstdiff_component": 0,
#             "total_gross_profit_component": round(grossprofit, 2),
#             "total_gstdiff_component": 0,
#             "total_profit_component": round(profit, 2)
#         }
#         response_data.append(item)
        
#         # Accumulate totals
#         total_ads += ads
#         total_gross_sales += gross_sales
#         total_net_sales += net_sales
#         total_profit += profit
#         total_qty += gross_qty
#         total_mp_fees += mp_fees
#         total_shipping_fees += shipping_fees
#         total_cogs += cogs
 
#     result = {
#         "status": True,
#         "message": "Success",
#         "message_code": "E1",
#         "pagination": {
#             "pageNo": page_no,
#             "pageSize": page_size,
#             "count": total_count
#         },
#         "totals": {
#             "ads": f"{round(total_ads, 2)}",
#             "claims": "-352",
#             "drr": f"{round(total_gross_sales / 30, 2)}",
#             "grossmrp": f"{round(total_gross_sales * 2.5, 2)}",
#             "grossmrpdiscount": "60.0",
#             "grossprofit": round(total_gross_sales + total_mp_fees + total_shipping_fees, 2),
#             "grossprofitper": (total_gross_sales + total_mp_fees + total_shipping_fees) / total_gross_sales * 100 if total_gross_sales > 0 else 0,
#             "grossqty": f"{total_qty}",
#             "grosssales": f"{round(total_gross_sales, 2)}",
#             "gsttopay": 0.0,
#             "mpfees": f"{round(total_mp_fees, 2)}",
#             "mpfees_with_claims": f"{round(total_mp_fees - 352, 2)}",
#             "mrp": f"{round(total_gross_sales * 2.5, 2)}",
#             "mrp_customer_discount": "60.0",
#             "net_discount": "0",
#             "netasp": f"{round(total_net_sales / total_qty, 2)}" if total_qty > 0 else "0",
#             "netqty": f"{total_qty}",
#             "netsales": f"{round(total_net_sales, 2)}",
#             "otherfees": "0",
#             "profit": round(total_profit, 2),
#             "profit_settled_amount": f"{round(total_net_sales + total_mp_fees + total_shipping_fees, 2)}",
#             "profitcogs": f"{round(total_cogs, 2)}",
#             "profitmargin": (total_profit / total_gross_sales * 100) if total_gross_sales > 0 else 0,
#             "replacedqty": "0",
#             "retpercent": "0",
#             "returnestqty": "0",
#             "returnqty": "0",
#             "shippingfees": f"{round(total_shipping_fees, 2)}",
#             "stdcost_missing_percentage": "0",
#             "storagefees": "0",
#             "tacos": f"{round((abs(total_ads)/total_gross_sales*100), 2)}" if total_gross_sales > 0 else "0",
#             "tcsinc": "0"
#         },
#         "response": response_data
#     }
    
#     return JsonResponse(result)


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
        request.data
        if request.method == 'POST'
        else request.GET
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

            body_data = json.loads(
                request._request.body
            )

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
    Returns monthly summarized profitability data in the format used by the comparison table.
    """
    user = request.user
    if user.is_anonymous:
        from django.contrib.auth.models import User
        user = User.objects.first()

    # 1. EXTRACT PARAMS (Robust logic)
    data_source_raw = request.data if request.method == 'POST' else request.GET
    
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
            body_data = json.loads(request._request.body)
            if isinstance(body_data, dict):
                data_source.update(body_data)
        except: pass
        
    search_data = {}
    search_data.update(data_source)
    f_child = search_data.get('filters', {})
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
    to_date_str = find_key(['toDate', 'end_date', 'to_date', 'endDate', 'toDate'])
    
    # New specific filters
    sku_f = find_key(['SKU', 'sku', 'seller_sku'])
    product_f = find_key(['ProductId', 'productId', 'product_id'])
    parent_f = find_key(['ParentId', 'parentId', 'parent_id'])
    mkt_cat_f = find_key(['MKT category', 'mkt_category', 'category'])
    master_sku_f = find_key(['Inv MasterSku', 'master_sku', 'masterSku'])

    def parse_dt_robust(dt_str, is_end=False):
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

    start_date = parse_dt_robust(from_date_str)
    end_date = parse_dt_robust(to_date_str, True)
    
    from django.db.models.functions import TruncMonth
    # Base queryset for orders in the range
    orders_qs = Order.objects.filter(user=user, purchase_date__range=(start_date, end_date))
    
    # Apply specific filters
    if sku_f:
        orders_qs = orders_qs.filter(items__seller_sku__icontains=sku_f)
    if product_f:
        orders_qs = orders_qs.filter(items__order_item_id__icontains=product_f)
    if parent_f or mkt_cat_f or master_sku_f:
        search_term = parent_f or mkt_cat_f or master_sku_f
        orders_qs = orders_qs.filter(items__title__icontains=search_term)

    # Monthly aggregate for orders
    orders_month_qs = orders_qs.distinct().annotate(
        month_trunc=TruncMonth('purchase_date')
    ).values('month_trunc').annotate(
        grossqty=Sum('items_shipped'),
        grosssales=Sum('total_amount')
    )
    
    orders_lookup = { m['month_trunc'].date().replace(day=1): m for m in orders_month_qs }

    from .models import FinancialEvent
    fin_qs = FinancialEvent.objects.filter(user=user, posted_date__range=(start_date, end_date))

    response_list = []
    
    # Generate every month in the range
    curr = start_date.replace(day=1).date()
    # If aware, we might need to handle it properly, but start_date is aware.
    # Convert end_date to date for comparison
    last = end_date.date()
    
    while curr <= last:
        month_key = curr.strftime('%m-%Y')
        m_data = orders_lookup.get(curr)
        
        # Monthly finance filters
        m_fin = fin_qs.filter(posted_date__year=curr.year, posted_date__month=curr.month)
        
        shipment_evs = m_fin.filter(event_type__icontains='Shipment')
        refund_evs = m_fin.filter(event_type__icontains='Refund')
        
        # Real Marketplace Fee Extraction (Deep Parse)
        actual_mp_fees = 0.0
        for s in shipment_evs:
            try:
                import json
                data = json.loads(s.raw_data or '{}')
                for item in data.get('ShipmentItemList', []):
                    for fee in item.get('ItemFeeList', []):
                        actual_mp_fees += abs(float(fee.get('FeeAmount', {}).get('CurrencyAmount', 0)))
            except: pass
            
        # Refund fee reversals (Seller gets money back)
        for r in refund_evs:
            try:
                import json
                data = json.loads(r.raw_data or '{}')
                for item in data.get('ShipmentItemAdjustmentList', []):
                    for fee in item.get('ItemFeeAdjustmentList', []):
                        actual_mp_fees -= abs(float(fee.get('FeeAmount', {}).get('CurrencyAmount', 0)))
            except: pass

        # Revenue and Qty
        if m_data and float(m_data['grosssales'] or 0) > 0:
            gsales = float(m_data['grosssales'] or 0)
            gqty = m_data['grossqty'] or 0
        else:
            # Reconstruct from Financials
            settled_principal = float(shipment_evs.aggregate(v=Sum('total_amount'))['v'] or 0)
            gsales = settled_principal # No guessing
            gqty = shipment_evs.count()
            
        # Actual Refund totals
        refunds_val = abs(float(refund_evs.aggregate(v=Sum('total_amount'))['v'] or 0))
        
        # Claims (Reimbursements)
        claim_sales = 0.0
        reimb_evs = m_fin.filter(Q(event_type__icontains='Adjustment') | Q(raw_data__icontains='Reimbursement'))
        for r in reimb_evs:
            try:
                import json
                data = json.loads(r.raw_data or '{}')
                claim_sales += abs(float(data.get('AdjustmentAmount', {}).get('CurrencyAmount', 0)))
            except: pass
            
        # Ads
        ads_val = abs(float(m_fin.filter(Q(event_type__icontains='ServiceFee') | Q(raw_data__icontains='Ad') | Q(raw_data__icontains='Sponsored')).aggregate(v=Sum('total_amount'))['v'] or 0))
        
        # Shipping
        ship_val = abs(float(m_fin.filter(event_type__icontains='Shipping').aggregate(v=Sum('total_amount'))['v'] or 0))
        if ship_val == 0 and gqty > 0: ship_val = (gqty * 65.0) # Estimated if missing

        # COGS
        cogs_val = (gsales * 0.35) if gsales > 0 else 0.0
        
        # 1. Cancellations (From Order table)
        m_orders_all = orders_qs.filter(purchase_date__year=curr.year, purchase_date__month=curr.month)
        cancelled_evs = m_orders_all.filter(Q(order_status='Canceled') | Q(order_status='Cancelled'))
        can_qty = cancelled_evs.count()
        can_sales = float(cancelled_evs.aggregate(v=Sum('total_amount'))['v'] or 0)
        
        # Final Profit Calculation
        profit_val = gsales - (actual_mp_fees + refunds_val + ads_val + cogs_val + ship_val) + claim_sales
        net_sales_val = gsales - refunds_val
        
        # Summary of net counts
        net_qty = gqty - can_qty - refund_evs.count()
        repl_qty = 0
        response_list.append({
            "month": month_key,
            "grossqty": gqty,
            "netqty": net_qty,
            "cancelledcanqty": can_qty,
            "cancelledrtoqty": 0,
            "returnedrtoqty": 0,
            "returnedcreturnqty": refund_evs.count(),
            "claimqty": reimb_evs.count() if 'reimb_evs' in locals() else 0,
            "replacedqty": 0,
            "stdcostmissingqty": 0,
            "customerdiscount": round(gsales * 0.05, 2),
            "grosssales": f"{round(gsales, 2)}",
            "cancelledcansales": f"{round(can_sales, 2)}",
            "cancelledrtosales": "0",
            "returnedrtosales": "0",
            "returnedcreturnsales": f"{round(refunds_val, 2)}",
            "claimsales": f"{round(claim_sales, 2)}",
            "netsales": f"{round(net_sales_val, 2)}",
            "mpfees": f"{round(-actual_mp_fees, 2)}",
            "shipfees": f"{round(-ship_val, 2)}",
            "ads": f"{round(-ads_val, 2)}",
            "stdcost": f"{round(-cogs_val, 0)}",
            "otherfees": "0",
            "accountcharges": "0",
            "settledamount": f"{round(gsales - actual_mp_fees - ship_val, 2)}",
            "profit": f"{round(profit_val, 2)}",
            "gsttopay": 0.0,
            "mpfees_with_claims": f"{round(-actual_mp_fees + claim_sales, 2)}",
            "mrp": f"{round(gsales * 2.2, 0)}",
            "netmrpdiscount": "0.0",
            "retpercent": f"{round(abs(refunds_val)/gsales*100, 2)}" if gsales > 0 else "0",
            "tacos": f"{round(abs(ads_val)/gsales*100, 2)}" if gsales > 0 else "0",
            "profitmargin": f"{round(profit_val/gsales*100, 2)}" if gsales > 0 else "0",
            "grossasp": f"{round(gsales/gqty, 2)}" if gqty > 0 else "0",
            "stdcost_missing_percentage": "0.00",
            "mrp_customer_discount": "0.0",
            "netasp": f"{round(net_sales_val/gqty, 2)}" if gqty > 0 else "0"
        })
        
        # Move to next month
        if curr.month == 12:
            curr = curr.replace(year=curr.year + 1, month=1)
        else:
            curr = curr.replace(month=curr.month + 1)

    return JsonResponse({
        "status": True,
        "message": "Success",
        "message_code": "E1",
        "response": response_list
    })
 
# @api_view(['POST', 'GET'])
# @permission_classes([AllowAny])
# def get_profitability_monthwise(request):

#     """
#     Returns monthly summarized profitability data
#     without changing response structure.
#     """

#     user = request.user

#     if user.is_anonymous:

#         from django.contrib.auth.models import User

#         user = User.objects.first()

#     # ============================================================
#     # REQUEST DATA
#     # ============================================================

#     data_source_raw = (
#         request.data
#         if request.method == 'POST'
#         else request.GET
#     )

#     data_source = {}

#     if data_source_raw:

#         if hasattr(data_source_raw, 'dict'):
#             data_source.update(data_source_raw.dict())

#         else:
#             data_source.update(data_source_raw)

#     if not data_source:

#         try:
#             import json

#             body_data = json.loads(
#                 request._request.body
#             )

#             if isinstance(body_data, dict):
#                 data_source.update(body_data)

#         except Exception:
#             pass

#     search_data = {}

#     search_data.update(data_source)

#     child_filters = search_data.get('filters', {})

#     if isinstance(child_filters, dict):
#         search_data.update(child_filters)

#     # ============================================================
#     # FIND KEY
#     # ============================================================

#     def find_key(keys):

#         for k in keys:

#             val = search_data.get(k)

#             if isinstance(val, list) and val:
#                 val = val[0]

#             if val and str(val).strip():
#                 return str(val).strip()

#             for sk, sv in search_data.items():

#                 if sk.lower() == k.lower():

#                     if isinstance(sv, list) and sv:
#                         sv = sv[0]

#                     if sv and str(sv).strip():
#                         return str(sv).strip()

#         return None

#     # ============================================================
#     # FILTERS
#     # ============================================================

#     from_date_str = find_key([
#         'fromDate',
#         'from_date',
#         'startDate',
#         'start_date'
#     ])

#     to_date_str = find_key([
#         'toDate',
#         'to_date',
#         'endDate',
#         'end_date'
#     ])

#     sku_f = find_key([
#         'SKU',
#         'sku',
#         'seller_sku'
#     ])

#     product_f = find_key([
#         'ProductId',
#         'productId',
#         'product_id'
#     ])

#     parent_f = find_key([
#         'ParentId',
#         'parentId',
#         'parent_id'
#     ])

#     mkt_cat_f = find_key([
#         'MKT category',
#         'mkt_category',
#         'category'
#     ])

#     master_sku_f = find_key([
#         'Inv MasterSku',
#         'master_sku',
#         'masterSku'
#     ])

#     # ============================================================
#     # DATE PARSER
#     # ============================================================

#     def parse_dt_robust(dt_str, is_end=False):

#         if not dt_str:

#             return (
#                 timezone.now() - timedelta(days=60)
#             ) if not is_end else timezone.now()

#         try:

#             if isinstance(dt_str, (datetime, date)):
#                 dt = dt_str

#             else:

#                 clean_str = str(dt_str).split('T')[0]

#                 dt = datetime.strptime(
#                     clean_str,
#                     '%Y-%m-%d'
#                 )

#             if is_end:

#                 dt = dt.replace(
#                     hour=23,
#                     minute=59,
#                     second=59
#                 )

#             if timezone.is_naive(dt):
#                 dt = timezone.make_aware(dt)

#             return dt

#         except Exception:

#             return (
#                 timezone.now() - timedelta(days=60)
#             ) if not is_end else timezone.now()

#     start_date = parse_dt_robust(
#         from_date_str
#     )

#     end_date = parse_dt_robust(
#         to_date_str,
#         True
#     )

#     # ============================================================
#     # BASE QUERYSETS
#     # ============================================================

#     orders_qs = (
#         Order.objects
#         .filter(
#             user=user,
#             purchase_date__range=(
#                 start_date,
#                 end_date
#             )
#         )
#         .exclude(
#             order_status__icontains='cancel'
#         )
#     )

#     items_qs = (
#         OrderItem.objects
#         .filter(
#             order__user=user,
#             order__purchase_date__range=(
#                 start_date,
#                 end_date
#             )
#         )
#         .exclude(
#             order__order_status__icontains='cancel'
#         )
#     )

#     finances_qs = FinancialEvent.objects.filter(
#         user=user,
#         posted_date__range=(
#             start_date,
#             end_date
#         )
#     )

#     estimated_fee_qs = (
#         AmazonEstimatedFee.objects
#         .filter(
#             order_item__order__user=user,
#             order_item__order__purchase_date__range=(
#                 start_date,
#                 end_date
#             )
#         )
#     )

#     # ============================================================
#     # APPLY FILTERS
#     # ============================================================

#     if sku_f:

#         orders_qs = orders_qs.filter(
#             items__seller_sku__icontains=sku_f
#         )

#         items_qs = items_qs.filter(
#             seller_sku__icontains=sku_f
#         )

#         estimated_fee_qs = estimated_fee_qs.filter(
#             order_item__seller_sku__icontains=sku_f
#         )

#     if product_f:

#         orders_qs = orders_qs.filter(
#             items__order_item_id__icontains=product_f
#         )

#         items_qs = items_qs.filter(
#             order_item_id__icontains=product_f
#         )

#     if parent_f or mkt_cat_f or master_sku_f:

#         search_term = (
#             parent_f or
#             mkt_cat_f or
#             master_sku_f
#         )

#         orders_qs = orders_qs.filter(
#             items__title__icontains=search_term
#         )

#         items_qs = items_qs.filter(
#             title__icontains=search_term
#         )

#     orders_qs = orders_qs.distinct()

#     # ============================================================
#     # MONTH GROUPING
#     # ============================================================

#     from django.db.models.functions import TruncMonth

#     orders_month_qs = (
#         orders_qs
#         .annotate(
#             month_trunc=TruncMonth(
#                 'purchase_date'
#             )
#         )
#         .values('month_trunc')
#         .annotate(

#             grossqty=Sum(
#                 'items_shipped'
#             ),

#             grosssales=Sum(
#                 'total_amount'
#             )
#         )
#     )

#     orders_lookup = {

#         m['month_trunc'].date().replace(day=1): m

#         for m in orders_month_qs
#     }

#     # ============================================================
#     # LOOP MONTHS
#     # ============================================================

#     response_list = []

#     curr = start_date.replace(day=1).date()

#     last = end_date.date()

#     while curr <= last:

#         month_key = curr.strftime('%m-%Y')

#         month_data = orders_lookup.get(curr)

#         # ========================================================
#         # MONTH FINANCE
#         # ========================================================

#         month_finances = finances_qs.filter(
#             posted_date__year=curr.year,
#             posted_date__month=curr.month
#         )

#         # ========================================================
#         # ORDER IDS
#         # ========================================================

#         month_order_ids = list(

#             orders_qs.filter(
#                 purchase_date__year=curr.year,
#                 purchase_date__month=curr.month
#             ).values_list(
#                 'amazon_order_id',
#                 flat=True
#             )

#         )

#         # ========================================================
#         # ESTIMATED FEES
#         # ========================================================

#         estimated_mp_fees = float(

#             estimated_fee_qs.filter(
#                 order_item__order__amazon_order_id__in=
#                 month_order_ids
#             ).aggregate(
#                 total=Sum('total_fees')
#             )['total'] or 0

#         )

#         # ========================================================
#         # SALES & QTY
#         # ========================================================

#         gsales = float(
#             month_data['grosssales'] or 0
#         ) if month_data else 0

#         gqty = int(
#             month_data['grossqty'] or 0
#         ) if month_data else 0

#         # ========================================================
#         # REFUNDS
#         # ========================================================

#         refund_amount = abs(float(

#             month_finances.aggregate(

#                 total=Sum(
#                     'total_amount',
#                     filter=Q(
#                         event_group='REFUND'
#                     )
#                 )

#             )['total'] or 0

#         ))

#         avg_order_value = (
#             gsales / gqty
#             if gqty else 0
#         )

#         return_qty = 0

#         if avg_order_value > 0:

#             return_qty = int(round(
#                 refund_amount / avg_order_value
#             ))

#         # ========================================================
#         # CLAIMS
#         # ========================================================

#         claim_sales = abs(float(

#             month_finances.filter(

#                 Q(event_type__icontains='Adjustment') |
#                 Q(raw_data__icontains='Reimbursement')

#             ).aggregate(

#                 total=Sum('total_amount')

#             )['total'] or 0

#         ))

#         # ========================================================
#         # ADS
#         # ========================================================

#         ads_val = abs(float(

#             month_finances.filter(

#                 Q(event_type__icontains='ServiceFee') |
#                 Q(event_type__icontains='Ad') |
#                 Q(raw_data__icontains='Sponsored')

#             ).aggregate(

#                 total=Sum('total_amount')

#             )['total'] or 0

#         ))

#         # ========================================================
#         # SHIPPING
#         # ========================================================

#         ship_val = abs(float(

#             month_finances.aggregate(
#                 total=Sum('shipping_fee')
#             )['total'] or 0

#         ))

#         # ========================================================
#         # OTHER FEES
#         # ========================================================

#         other_fees = abs(float(

#             month_finances.filter(
#                 event_type__icontains='Adjustment'
#             ).aggregate(
#                 total=Sum('other_fee')
#             )['total'] or 0

#         ))

#         # ========================================================
#         # COGS
#         # ========================================================

#         cogs_val = (
#             gsales * 0.35
#         ) if gsales else 0

#         # ========================================================
#         # CANCELLED
#         # ========================================================

#         cancelled_orders = orders_qs.filter(
#             purchase_date__year=curr.year,
#             purchase_date__month=curr.month,
#             order_status__icontains='cancel'
#         )

#         can_qty = cancelled_orders.count()

#         can_sales = float(

#             cancelled_orders.aggregate(
#                 total=Sum('total_amount')
#             )['total'] or 0

#         )

#         # ========================================================
#         # NET SALES
#         # ========================================================

#         net_sales_val = (
#             gsales - refund_amount
#         )

#         # ========================================================
#         # NET QTY
#         # ========================================================

#         net_qty = max(
#             gqty - return_qty - can_qty,
#             0
#         )

#         # ========================================================
#         # PROFIT
#         # ========================================================

#         profit_val = (

#             net_sales_val

#             - estimated_mp_fees

#             - ads_val

#             - ship_val

#             - other_fees

#             - cogs_val

#             + claim_sales

#         )

#         # ========================================================
#         # GROSS PROFIT
#         # ========================================================

#         settled_amount = (
#             gsales
#             - estimated_mp_fees
#             - ship_val
#         )

#         # ========================================================
#         # PERCENTAGES
#         # ========================================================

#         retpercent = (

#             (return_qty / gqty) * 100

#             if gqty else 0

#         )

#         tacos = (

#             (ads_val / gsales) * 100

#             if gsales else 0

#         )

#         profit_margin = (

#             (profit_val / net_sales_val) * 100

#             if net_sales_val else 0

#         )

#         gross_asp = (
#             gsales / gqty
#             if gqty else 0
#         )

#         net_asp = (
#             net_sales_val / net_qty
#             if net_qty else 0
#         )

#         # ========================================================
#         # RESPONSE
#         # ========================================================

#         response_list.append({

#             "month": month_key,

#             "grossqty": gqty,

#             "netqty": net_qty,

#             "cancelledcanqty": can_qty,

#             "cancelledrtoqty": 0,

#             "returnedrtoqty": 0,

#             "returnedcreturnqty": return_qty,

#             "claimqty": 0,

#             "replacedqty": 0,

#             "stdcostmissingqty": 0,

#             "customerdiscount": round(
#                 gsales * 0.05,
#                 2
#             ),

#             "grosssales": f"{round(gsales, 2)}",

#             "cancelledcansales": f"{round(can_sales, 2)}",

#             "cancelledrtosales": "0",

#             "returnedrtosales": "0",

#             "returnedcreturnsales": f"{round(refund_amount, 2)}",

#             "claimsales": f"{round(claim_sales, 2)}",

#             "netsales": f"{round(net_sales_val, 2)}",

#             "mpfees": f"{round(-estimated_mp_fees, 2)}",

#             "shipfees": f"{round(-ship_val, 2)}",

#             "ads": f"{round(-ads_val, 2)}",

#             "stdcost": f"{round(-cogs_val, 0)}",

#             "otherfees": f"{round(-other_fees, 2)}",

#             "accountcharges": "0",

#             "settledamount": f"{round(settled_amount, 2)}",

#             "profit": f"{round(profit_val, 2)}",

#             "gsttopay": 0.0,

#             "mpfees_with_claims": f"{round((-estimated_mp_fees + claim_sales), 2)}",

#             "mrp": f"{round(gsales * 2.2, 0)}",

#             "netmrpdiscount": "0.0",

#             "retpercent": f"{round(retpercent, 2)}",

#             "tacos": f"{round(tacos, 2)}",

#             "profitmargin": f"{round(profit_margin, 2)}",

#             "grossasp": f"{round(gross_asp, 2)}",

#             "stdcost_missing_percentage": "0.00",

#             "mrp_customer_discount": "0.0",

#             "netasp": f"{round(net_asp, 2)}"
#         })

#         # ========================================================
#         # NEXT MONTH
#         # ========================================================

#         if curr.month == 12:

#             curr = curr.replace(
#                 year=curr.year + 1,
#                 month=1
#             )

#         else:

#             curr = curr.replace(
#                 month=curr.month + 1
#             )

#     # ============================================================
#     # FINAL RESPONSE
#     # ============================================================

#     return JsonResponse({

#         "status": True,

#         "message": "Success",

#         "message_code": "E1",

#         "response": response_list
#     })




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
 
 

# working till 21May
# group by parent asin 
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def amazon_profitability_details(request):

#     user = request.user
#     data = request.data

#     filters = data.get("filters", {})
#     pagination = data.get("pagination", {})

#     page_no = int(pagination.get("pageNo", 0))
#     page_size = int(pagination.get("pageSize", 25)) 

#     # ---------------- DATE FILTER ----------------
#     from_date = to_date = None
#     try:
#         if filters.get("fromDate"):
#             from_date = timezone.make_aware(datetime.strptime(filters["fromDate"], "%Y-%m-%d"))
#         if filters.get("toDate"):
#             to_date = timezone.make_aware(datetime.strptime(filters["toDate"], "%Y-%m-%d")) + timedelta(days=1)
#     except Exception as e:
#         print("Date error:", e)

#     order_filter = Q(order__user=user)

#     # ---------------- CHANNEL FILTER ----------------
#     CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}

#     channels = filters.get("channel", {}).get("IN", [])
#     if channels:
#         marketplace_ids = [CHANNEL_MAP.get(ch) for ch in channels if CHANNEL_MAP.get(ch)]
#         order_filter &= Q(order__marketplace_id__in=marketplace_ids)

#     # ---------------- ASIN FILTER ----------------
#     parent_ids = filters.get("parentproductid", {}).get("IN", [])
#     if parent_ids:
#         order_filter &= Q(asin__in=parent_ids)

#     # ---------------- DATE APPLY ----------------
#     if from_date:
#         order_filter &= Q(order__purchase_date__gte=from_date)
#     if to_date:
#         order_filter &= Q(order__purchase_date__lte=to_date)

#     # ---------------- ORDER ITEM AGG ----------------

#     items = (
#         OrderItem.objects
#         .filter(order_filter)
#         .exclude(order__order_status__icontains='Cancel')
#         .values('parent_asin')
#         .annotate(
#             title=Max('title'),
#             image_url=Max('image_url'),
#             grossqty=Sum('quantity_ordered'),
#             quantity_shipped=Sum('quantity_shipped'),
#             shipping_income=Sum('shipping_income'),
#             shipping_price=Sum('shipping_price'),
#             discount=Sum('discount'),
#             promotion_discount=Sum('promotion_discount'),
#             avg_cost=Avg('item_price'),
#             item_tax=Sum('item_tax'),
#             total_cost=Sum(F('cost_price') * F('quantity_ordered')),
#             # grosssales=Sum(F('item_price') * F('quantity_ordered'))
#             grosssales=Sum('item_price'),
#         )
#     )

#     # ---------------- ESTIMATED FEES ----------------
#     estimated_fee_qs = AmazonEstimatedFee.objects.filter(
#         order_item__order__user=user
#     )

#     # apply same date filter
#     if from_date:
#         estimated_fee_qs = estimated_fee_qs.filter(
#             order_item__order__purchase_date__gte=from_date
#         )

#     if to_date:
#         estimated_fee_qs = estimated_fee_qs.filter(
#             order_item__order__purchase_date__lte=to_date
#         )

#     # apply same parent filter
#     if parent_ids:
#         estimated_fee_qs = estimated_fee_qs.filter(
#             order_item__parent_asin__in=parent_ids
#         )

#     # estimated_fee_data = (
#     #     estimated_fee_qs
#     #     .values('order_item__parent_asin')
#     #     .annotate(
#     #         estimated_fees=Sum('total_fees')
#     #     )
#     # )

#     estimated_fee_data = (
#         estimated_fee_qs
#         .values('order_item__parent_asin')
#         .annotate(
#             estimated_fees=Sum('total_fees'),

#             referral_fee=Sum('referral_fee'),
#             closing_fee=Sum('closing_fee'),
#             per_item_fee=Sum('per_item_fee'),

#             fba_fee=Sum('fba_fee'),
#             fba_pick_pack_fee=Sum('fba_pick_pack_fee'),
#             fba_weight_handling_fee=Sum('fba_weight_handling_fee'),

#             tax_amount=Sum('tax_amount'),
#         )
#     )

#     # estimated_fee_map = {
#     #     row['order_item__parent_asin']: float(row['estimated_fees'] or 0)
#     #     for row in estimated_fee_data
#     # }

#     estimated_fee_map = {
#         row['order_item__parent_asin']: {
#             "estimated_fees": float(row['estimated_fees'] or 0),

#             "referral_fee": float(row['referral_fee'] or 0),
#             "closing_fee": float(row['closing_fee'] or 0),
#             "per_item_fee": float(row['per_item_fee'] or 0),

#             "fba_fee": float(row['fba_fee'] or 0),
#             "fba_pick_pack_fee": float(row['fba_pick_pack_fee'] or 0),
#             "fba_weight_handling_fee": float(row['fba_weight_handling_fee'] or 0),

#             "tax_amount": float(row['tax_amount'] or 0),
#         }
#         for row in estimated_fee_data
#     }

#     # ---------------- FINANCIAL EVENTS ----------------
#     finances_qs = FinancialEvent.objects.filter(user=user)

#     raw_map = (
#         FinancialEvent.objects
#         .filter(user=user)
#         .exclude(raw_data=None)
#         .values('amazon_order_id', 'raw_data')
#     )

#     raw_data_map = {}
#     for r in raw_map:
#         raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])

#     if from_date:
#         finances_qs = finances_qs.filter(posted_date__gte=from_date)
#     if to_date:
#         finances_qs = finances_qs.filter(posted_date__lte=to_date)

#     finance_data = (
#         finances_qs
#         .values('amazon_order_id')
#         .annotate(
#             refund=Sum('total_amount', filter=Q(event_group="REFUND")),
#             rto=Sum('total_amount', filter=Q(event_group="RTO")),
#             ads=Sum('total_amount', filter=Q(event_type__icontains='Ad')),
#             commission=Sum('commission_fee'),
#             fulfillment=Sum('fulfillment_fee'),
#             other_fee=Sum('other_fee'),
#             shipping_fee=Sum('shipping_fee'),
#             gst=Sum('tax'),
#         )
#     )

#     finance_map = {f['amazon_order_id']: f for f in finance_data}

#     # ---------------- ASIN → ORDER MAP ----------------
#     asin_orders = (
#         OrderItem.objects
#         .filter(order_filter)
#         .values('asin','parent_asin', 'order__amazon_order_id', 'quantity_ordered')
#     )

#     # asin_map = {}
#     # for row in asin_orders:
#     #     asin_map.setdefault(row['asin'], []).append(row)
    
#     # for both if not have parent assin
#     # asin_map = {}
#     # for row in asin_orders:
#     #     key = row['parent_asin'] or row['asin']  # fallback
#     #     asin_map.setdefault(key, []).append(row)

#     asin_map = {}
#     for row in asin_orders:
#         asin_map.setdefault(row['parent_asin'], []).append(row)

#     # ---------------- BUILD RESPONSE ----------------
#     results = []

#     total_sales = total_profit = total_ads = 0
#     total_mpfees = total_net_sales = total_qty = 0
#     total_returns = total_shipping = 0
#     total_stdcost = 0
#     total_ret_percent = 0
#     adjusted_gross_sales = 0
#     total_estimatefees = 0 
#     total_mp_gst = 0
#     total_gst = 0
#     total_tcs = 0
#     total_taxable_value = 0
#     total_gst_payable = 0
#     total_exp_settlement = 0

#     sku_asin_map = {
#         normalize_sku(k): v
#         for k, v in OrderItem.objects
#             .filter(order_filter)
#             .values_list('seller_sku', 'asin')
#     }

#     child_parent_map = {
#         row['asin']: (row['parent_asin'] or row['asin'])
#         for row in OrderItem.objects
#             .filter(order_filter)
#             .values('asin', 'parent_asin')
#     }

#     for row in items:
#         # asin = row['asin']
#         parent_asin = row['parent_asin']
#         # estimated_fees = estimated_fee_map.get(parent_asin, 0)

#         fee_data = estimated_fee_map.get(parent_asin, {})

#         estimated_fees = fee_data.get("estimated_fees", 0)

#         referral_fee = fee_data.get("referral_fee", 0)
#         closing_fee = fee_data.get("closing_fee", 0)
#         per_item_fee = fee_data.get("per_item_fee", 0)

#         fba_fee = fee_data.get("fba_fee", 0)
#         fba_pick_pack_fee = fee_data.get("fba_pick_pack_fee", 0)
#         fba_weight_handling_fee = fee_data.get("fba_weight_handling_fee", 0)

#         tax_amount = fee_data.get("tax_amount", 0)

#         gross_qty = int(row['grossqty'] or 0)  
#         quantity_shipped = int(row['quantity_shipped'] or 0) 
        
#         gross_sales = float(row['grosssales'] or 0)
#         item_tax = float(row.get('item_tax') or 0)
#         promo_discount = float(row.get('promotion_discount') or 0)

        
#         shipping_income = float(row.get('shipping_income') or 0)
#         shipping_price = float(row.get('shipping_price') or 0)

#         # ---------------- GST / TAXABLE ----------------

#         # Taxable value (without GST)
#         taxable_value = gross_sales

#         # GST amount
#         gst_to_pay_amount = item_tax

#         # GST percentage
#         gst_to_pay_perc = (
#             (gst_to_pay_amount / taxable_value) * 100
#             if taxable_value else 0
#         )

#         # TCS = 1% of taxable value
#         tcs_total = gst_to_pay_amount * 0.01
        

#         adjusted_gross_sales = gross_sales + item_tax - promo_discount + shipping_price

#         # orders = asin_map.get(asin, [])
#         orders = asin_map.get(parent_asin, [])

#         refund = rto = ads = mpfees = shipping_fee = 0
#         return_units = 0
#         gst = 0
#         # tcs_total = 0  
#         t_new_charge = 0   
        


#         for o in orders:
#             oid = o['order__amazon_order_id']
#             qty = o['quantity_ordered'] or 0

#             f = finance_map.get(oid, {})

#             # -------- SINGLE CORRECT BLOCK --------
#             r = float(f.get('refund') or 0)
#             rto_amt = float(f.get('rto') or 0)

#             refund += r
#             rto += rto_amt
#             ads += float(f.get('ads') or 0)

#             mpfees += (
#                 float(f.get('commission') or 0) +
#                 float(f.get('fulfillment') or 0) +
#                 float(f.get('other_fee') or 0)
#             )

#             shipping_fee += float(f.get('shipping_fee') or 0)
#             gst += float(f.get('gst') or 0)

#             # -------- RAW TCS --------
#             raw_list = raw_data_map.get(oid, [])
#             tcs = 0

            
#             order_fee_map = extract_fees_and_tcs_per_asin(
#                 raw_data_map.get(oid, []),
#                 sku_asin_map=sku_asin_map
#             )

#             # total_estimatefees += estimated_fees

#             for child_asin, fee_data in order_fee_map.items():

#                 parent_key = child_parent_map.get(child_asin)

#                 if parent_key == parent_asin:
#                     t_new_charge += float(fee_data["fee"])
#                     # tcs_total += float(fee_data["tcs"])

           

#             if r < 0 or rto_amt < 0:
#                 return_units += qty

#         # ---------------- CALCULATIONS ----------------
#         # net_qty = max(gross_qty - return_units, 0)
#         net_qty = max(gross_qty , 0)
#         # net_sales = gross_sales + refund + rto
#         # net_sales = adjusted_gross_sales + refund + rto
#         net_sales = adjusted_gross_sales
#         shipping_final = shipping_price 

#         mp_gst = (net_sales + shipping_final) * 0.18

        

#         # total_cost = float(row.get('total_cost') or 0)
#         # total_cost = float(50)
#         total_cost = float(50) * net_qty
#         avg_cost = float(row.get('avg_cost') or 0)

#         stdcost = total_cost
#         stdcost_per_unit = (total_cost / gross_qty) if gross_qty else 0

#         missing_qty = 0
#         for o in orders:
#             if o.get('quantity_ordered') and avg_cost == 0:
#                 missing_qty += o['quantity_ordered']

#         stdcost_missing_percentage = (missing_qty / gross_qty * 100) if gross_qty else 0

#         # profit = net_sales - abs(mpfees) + shipping_final - stdcost + tcs_total
#         # profit = net_sales - t_new_charge + shipping_final - stdcost + tcs_total
#         # profit = net_sales + t_new_charge + shipping_final - stdcost + tcs_total
#         # profit = net_sales - estimated_fees - shipping_final - stdcost - tcs_total + mp_gst

        
#         profit = (
#             net_sales
#             - estimated_fees
#             - shipping_final
#             - stdcost
#             + tcs_total
#             + mp_gst
        
#         )
#         exp_settlement = (
#             profit
#             - stdcost
#             - tcs_total
#             - mp_gst
#         )
        
#         profit_margin = (profit / net_sales * 100) if net_sales else 0
#         tacos = (ads / gross_sales * 100) if gross_sales else 0
#         ret_percent = (return_units / net_qty * 100) if net_qty else 0


#         results.append({
#             # "asin": asin,
#             "asin": parent_asin, 
#             "parent_asin": parent_asin, 
#             "name": row['title'],
#             "image_url": row['image_url'],
#             "channel": "Amazon-India",
#             "channel1": "Amazon-India",
#             "grossqty": gross_qty,
#             "netqty": net_qty,
#             "grosssales": format_currency(gross_sales),
#             "netsales": format_currency(net_sales),
#             "ads": format_currency(ads),
#             "mpfees": round(mpfees, 2),
#             "mp_gst": format_currency(mp_gst),
#             "new_mpfees": format_currency(t_new_charge),
#             # "estimatefees": format_currency(estimated_fees),
#             "estimatefees": format_currency(-abs(estimated_fees)),

#             "referral_fee": format_currency(referral_fee),
#             "closing_fee": format_currency(closing_fee),
#             "per_item_fee": format_currency(per_item_fee),

#             "fba_fee": format_currency(fba_fee),
#             "fba_pick_pack_fee": format_currency(fba_pick_pack_fee),
#             "fba_weight_handling_fee": format_currency(fba_weight_handling_fee),

#             "tax_amount": format_currency(tax_amount),
#             "shippingfees": format_currency(shipping_final),
#             "profit": format_currency(profit),
#             "grossprofitper": round(profit_margin, 2),
#             "returnqty": return_units,
#             "retpercent": round(ret_percent, 2),
#             "tacos": round(tacos, 2),
#             # "id": asin,
#             "id": parent_asin,
#             "stdcost": format_currency(stdcost),
#             "stdcost_per_unit": round(stdcost_per_unit, 2),
#             "stdcostmissingqty": missing_qty,
#             "stdcost_missing_percentage": round(stdcost_missing_percentage, 2),
#             "redirecturl": f"https://www.amazon.in/dp/{parent_asin}" if parent_asin else None,
#             "gst": format_currency(0),
#             # "gst": "0",
#             "tcs": format_currency(tcs_total),
#             "taxable_value": format_currency(taxable_value),

#             "gst_to_pay_amount": format_currency(gst_to_pay_amount),

#             "gst_to_pay_perc": round(gst_to_pay_perc, 2),

#             "exp_settlement": format_currency(exp_settlement),
#         })

#         # -------- TOTALS --------
#         total_sales += gross_sales
#         total_net_sales += net_sales
#         total_profit += profit
#         total_ads += ads
#         total_mpfees += t_new_charge
#         total_qty += net_qty
#         total_returns += return_units
#         total_shipping += shipping_final
#         total_stdcost += stdcost
#         total_gst += gst
#         total_tcs += tcs_total
#         total_ret_percent += ret_percent
#         total_estimatefees += estimated_fees
#         total_mp_gst += mp_gst

#         total_taxable_value += taxable_value
#         total_gst_payable += gst_to_pay_amount
#         total_exp_settlement += exp_settlement

#     # -------- DEBUG AFTER BUILD --------
#     db_asins = set(OrderItem.objects.filter(order__user=user).values_list('asin', flat=True))
#     api_asins = set([r['asin'] for r in results])
#     missing = db_asins - api_asins

#     print("Missing ASINs:", len(missing))

#     return Response({
#         "status": True,
#         "message": "Success",
#         "pagination": {
#             "pageNo": page_no,
#             "pageSize": page_size,
#             "count": len(results)
#         },
#         "totals": {
#             "ads": format_currency(total_ads),
#             "netqty": total_qty,
#             "totalreturn": total_returns,
#             "totalreturnper": f"{round(total_ret_percent, 2)}%",
#             "grosssales": format_currency(total_sales),
#             "netsales": format_currency(total_net_sales),
#             "profit": format_currency(total_profit),
#             "grossprofitper": round((total_profit / total_net_sales * 100), 2) if total_net_sales else 0,
#             "mpfees": format_currency(total_mpfees),
#             "mp_gst": format_currency(total_mp_gst),
#             # "estimatefees": format_currency(total_estimatefees),
#             "estimatefees": format_currency(-abs(total_estimatefees)),
#             "total_new_mpfees": format_currency(total_mpfees),
#             "shippingfees": format_currency(total_shipping),
#             "tacos": (total_ads / total_sales * 100) if total_sales else 0,
#             "stdcost": format_currency(total_stdcost),
#             # "totalgst": format_currency(total_tcs),
#             "totalgst": format_currency(0),
#             "tcs": format_currency(total_tcs),
#             "taxable_value": format_currency(total_taxable_value),

#             "gst_to_pay_amount": format_currency(total_gst_payable),
#             "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",
#             "exp_settlement": format_currency(total_exp_settlement),
#         },
#         "response": results[page_no * page_size:(page_no + 1) * page_size]
#     })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def amazon_profitability_details(request):

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
            "grosssales": format_currency(gross_sales),
            "netsales": format_currency(net_sales),
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
            "taxable_value": format_currency(total_taxable_value),

            "gst_to_pay_amount": format_currency(total_gst_payable),
            "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",
            "exp_settlement": format_currency(total_exp_settlement),
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })


# asin by parent asin working till 20May
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def amazon_profitability_parent(request):

#     user = request.user
#     data = request.data

#     filters = data.get("filters", {})
#     pagination = data.get("pagination", {})

#     page_no = int(pagination.get("pageNo", 0))
#     page_size = int(pagination.get("pageSize", 25))

#     # ---------------- DATE FILTER ----------------
#     from_date = to_date = None
#     try:
#         if filters.get("fromDate"):
#             from_date = timezone.make_aware(datetime.strptime(filters["fromDate"], "%Y-%m-%d"))
#         if filters.get("toDate"):
#             to_date = timezone.make_aware(datetime.strptime(filters["toDate"], "%Y-%m-%d")) + timedelta(days=1)
#     except Exception as e:
#         print("Date error:", e)

#     order_filter = Q(order__user=user)

#     # ---------------- CHANNEL FILTER ----------------
#     CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}
#     channels = filters.get("channel", {}).get("IN", [])

#     if channels:
#         marketplace_ids = [CHANNEL_MAP.get(ch) for ch in channels if CHANNEL_MAP.get(ch)]
#         order_filter &= Q(order__marketplace_id__in=marketplace_ids)

#     # ---------------- PARENT FILTER (IMPORTANT) ----------------
#     parent_ids = filters.get("parentproductid", {}).get("IN", [])
#     if not parent_ids:
#         return Response({
#             "status": False,
#             "message": "parentproductid is required"
#         })

#     order_filter &= Q(parent_asin__in=parent_ids)

#     # ---------------- DATE APPLY ----------------
#     if from_date:
#         order_filter &= Q(order__purchase_date__gte=from_date)
#     if to_date:
#         order_filter &= Q(order__purchase_date__lte=to_date)


#     # ---------------- CHILD ASIN DATA ----------------
#     items = (
#         OrderItem.objects
#         .filter(order_filter)
#         .exclude(order__order_status__icontains='Cancel')
#         .values('asin', 'parent_asin')
#         .annotate(
#             title=Max('title'),
#             seller_sku=Max('seller_sku'),
#             image_url=Max('image_url'),
#             grossqty=Sum('quantity_ordered'),
#             quantity_shipped=Sum('quantity_shipped'),
#             shipping_price=Sum('shipping_price'),
#             total_cost=Sum(F('cost_price') * F('quantity_ordered')),
#             grosssales=Sum('item_price'),
#             promotion_discount=Sum('promotion_discount'),
#             avg_cost=Avg('item_price'),
#             item_tax=Sum('item_tax'),
#         )
#     )


#     # ---------------- ESTIMATED FEES ----------------
#     estimated_fee_qs = AmazonEstimatedFee.objects.filter(
#         order_item__order__user=user
#     )

#     if from_date:
#         estimated_fee_qs = estimated_fee_qs.filter(
#             order_item__order__purchase_date__gte=from_date
#         )

#     if to_date:
#         estimated_fee_qs = estimated_fee_qs.filter(
#             order_item__order__purchase_date__lte=to_date
#         )

#     if channels:
#         estimated_fee_qs = estimated_fee_qs.filter(
#             order_item__order__marketplace_id__in=marketplace_ids
#         )

#     # estimated_fee_data = (
#     #     estimated_fee_qs
#     #     .values('asin')
#     #     .annotate(
#     #         estimated_fees=Sum('total_fees')
#     #     )
#     # )

#     estimated_fee_data = (
#         estimated_fee_qs
#         .values('asin')
#         .annotate(
#             estimated_fees=Sum('total_fees'),

#             referral_fee=Sum('referral_fee'),
#             closing_fee=Sum('closing_fee'),
#             per_item_fee=Sum('per_item_fee'),

#             fba_fee=Sum('fba_fee'),
#             fba_pick_pack_fee=Sum('fba_pick_pack_fee'),
#             fba_weight_handling_fee=Sum('fba_weight_handling_fee'),

#             tax_amount=Sum('tax_amount'),
#         )
#     )

#     # estimated_fee_map = {
#     #     row['asin']: Decimal(str(row['estimated_fees'] or 0))
#     #     for row in estimated_fee_data
#     # }


#     estimated_fee_map = {
#         row['asin']: {
#             "estimated_fees": Decimal(str(row['estimated_fees'] or 0)),

#             "referral_fee": Decimal(str(row['referral_fee'] or 0)),
#             "closing_fee": Decimal(str(row['closing_fee'] or 0)),
#             "per_item_fee": Decimal(str(row['per_item_fee'] or 0)),

#             "fba_fee": Decimal(str(row['fba_fee'] or 0)),
#             "fba_pick_pack_fee": Decimal(str(row['fba_pick_pack_fee'] or 0)),
#             "fba_weight_handling_fee": Decimal(str(row['fba_weight_handling_fee'] or 0)),

#             "tax_amount": Decimal(str(row['tax_amount'] or 0)),
#         }
#         for row in estimated_fee_data
#     }

#     # ---------------- FINANCE ----------------
#     finances_qs = FinancialEvent.objects.filter(user=user)

#     if from_date:
#         finances_qs = finances_qs.filter(posted_date__gte=from_date)
#     if to_date:
#         finances_qs = finances_qs.filter(posted_date__lte=to_date)

#     finance_data = (
#         finances_qs
#         .values('amazon_order_id')
#         .annotate(
#             refund=Sum('total_amount', filter=Q(event_group="REFUND")),
#             rto=Sum('total_amount', filter=Q(event_group="RTO")),
#             ads=Sum('total_amount', filter=Q(event_type__icontains='Ad')),
#             commission=Sum('commission_fee'),
#             fulfillment=Sum('fulfillment_fee'),
#             other_fee=Sum('other_fee'),
#             shipping_fee=Sum('shipping_fee'),
#         )
#     )

#     finance_map = {f['amazon_order_id']: f for f in finance_data}

#     # ---------------- RAW MAP ----------------
#     raw_map = FinancialEvent.objects.filter(user=user).exclude(raw_data=None).values('amazon_order_id', 'raw_data')

#     raw_data_map = {}
#     for r in raw_map:
#         raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])

#     # ---------------- ORDER MAP ----------------
#     asin_orders = (
#         OrderItem.objects
#         .filter(order_filter)
#         .values('asin', 'parent_asin', 'order__amazon_order_id', 'quantity_ordered')
#     )

#     asin_map = {}
#     for row in asin_orders:
#         asin_map.setdefault(row['asin'], []).append(row)

#     # ---------------- SKU MAP ----------------
#     sku_asin_map = {
#         normalize_sku(k): v
#         for k, v in OrderItem.objects.filter(order_filter).values_list('seller_sku', 'asin')
#     }

#     # ---------------- BUILD RESPONSE ----------------
#     results = []

#     total_sales = total_profit = total_ads = Decimal(0)
#     total_net_sales = total_qty = Decimal(0)
#     total_returns = total_shipping = Decimal(0)
#     total_tcs = Decimal(0)
#     total_mpfees = Decimal(0)   
#     total_ret_percent = Decimal(0)  
#     total_stdcost = Decimal(0) 
#     adjusted_gross_sales = Decimal(0) 
#     total_estimatefees = Decimal(0)
#     total_mp_gst = Decimal(0)

#     total_taxable_value = Decimal(0)
#     total_gst_payable = Decimal(0)
#     total_exp_settlement = Decimal(0)

#     for row in items:

#         asin = row['asin']
#         parent_asin = row['parent_asin']
#         child_sku = row['seller_sku']
    
#         orders = asin_map.get(asin, [])
        
#         # estimated_fees = estimated_fee_map.get(asin, Decimal("0"))

#         fee_data = estimated_fee_map.get(asin, {})

#         estimated_fees = fee_data.get("estimated_fees", Decimal("0"))

#         referral_fee = fee_data.get("referral_fee", Decimal("0"))
#         closing_fee = fee_data.get("closing_fee", Decimal("0"))
#         per_item_fee = fee_data.get("per_item_fee", Decimal("0"))

#         fba_fee = fee_data.get("fba_fee", Decimal("0"))
#         fba_pick_pack_fee = fee_data.get("fba_pick_pack_fee", Decimal("0"))
#         fba_weight_handling_fee = fee_data.get("fba_weight_handling_fee", Decimal("0"))

#         tax_amount = fee_data.get("tax_amount", Decimal("0"))

#         gross_qty = Decimal(row['grossqty'] or 0)
#         gross_sales = Decimal(row['grosssales'] or 0)

#         item_tax = Decimal(row.get('item_tax') or 0)
#         promo_discount = Decimal(row.get('promotion_discount') or 0)

#         shipping_price = Decimal(row.get('shipping_price') or 0)

#         # ---------------- GST / TAXABLE ----------------

#         # Gross sales excluding GST
#         taxable_value = gross_sales

#         # GST collected from order
#         gst_to_pay_amount = item_tax

#         # GST %
#         gst_to_pay_perc = (
#             (gst_to_pay_amount / taxable_value) * 100
#             if taxable_value else Decimal("0")
#         )

#         # TCS = 1% of taxable value
#         tcs_total = gst_to_pay_amount * Decimal("0.01")

#         # adjusted_gross_sales = gross_sales + item_tax - promo_discount
#         adjusted_gross_sales = gross_sales + item_tax - promo_discount + shipping_price

#         refund = rto = ads = mpfees = shipping_fee = Decimal(0)
#         return_units = Decimal(0)
#         # tcs_total = Decimal(0)
#         t_new_charge = Decimal(0)

#         for o in orders:
#             oid = o['order__amazon_order_id']
#             qty = Decimal(o['quantity_ordered'] or 0)

#             f = finance_map.get(oid, {})

#             refund += Decimal(f.get('refund') or 0)
#             rto += Decimal(f.get('rto') or 0)
#             ads += Decimal(f.get('ads') or 0)

#             mpfees += (
#                 Decimal(f.get('commission') or 0) +
#                 Decimal(f.get('fulfillment') or 0) +
#                 Decimal(f.get('other_fee') or 0)
#             )

#             shipping_fee += Decimal(f.get('shipping_fee') or 0)

#             order_fee_map = extract_fees_and_tcs_per_asin(
#                 raw_data_map.get(oid, []),
#                 sku_asin_map=sku_asin_map
#             )

#             if asin in order_fee_map:
#                 t_new_charge += Decimal(order_fee_map[asin]["fee"])
#                 # tcs_total += Decimal(order_fee_map[asin]["tcs"])

#             r = Decimal(f.get('refund') or 0)
#             rto_amt = Decimal(f.get('rto') or 0)

#             refund += r
#             rto += rto_amt

#             # total_estimatefees += estimated_fees

#             if r < 0 or rto_amt < 0:
#                 return_units += qty

#         # net_qty = max(gross_qty - return_units, 0)
#         net_qty = max(gross_qty , 0)
#         # net_sales = gross_sales + refund + rto
#         net_sales = adjusted_gross_sales
#         # total_estimatefees += estimated_fees
#         shipping_final = Decimal(row['shipping_price'] or 0)

#         # mp_gst = (net_sales + shipping_final) * 0.18
       

#         mp_gst = (net_sales + shipping_final) * Decimal("0.18")
        
#         # total_cost = Decimal(row['total_cost'] or 0)

#         total_cost = Decimal(50) * net_qty

#         # profit = net_sales + t_new_charge + shipping_final - total_cost + tcs_total
#         # profit = net_sales - estimated_fees - shipping_final - tcs_total + mp_gst - total_cost
#         profit = (
#             net_sales
#             - estimated_fees
#             - shipping_final
#             + tcs_total
#             + mp_gst
#             - total_cost
#         )

#         exp_settlement = (
#             profit
#             - total_cost
#             - tcs_total
#             - mp_gst
#         )
#         profit_margin = (profit / net_sales * 100) if net_sales else 0

#         ret_percent = (return_units / net_qty * 100) if net_qty else 0
        

#         results.append({
#             "asin": asin,
#             "parent_asin": parent_asin,
#             "name": row['title'],
#             "child_sku": clean_sku(child_sku),
#             "image_url": row['image_url'],
#             "channel": "Amazon-India",
#             "channel1": "Amazon-India",

#             "grossqty": int(gross_qty),
#             "netqty": int(net_qty),

#             "grosssales": format_currency(gross_sales),
#             "netsales": format_currency(net_sales),

#             "ads": format_currency(ads),
#             "mp_gst": format_currency(mp_gst),
#             "new_mpfees": format_currency(t_new_charge),
         
#             "estimatefees": format_currency(-abs(estimated_fees)),
#             "referral_fee": format_currency(referral_fee),
#             "closing_fee": format_currency(closing_fee),
#             "per_item_fee": format_currency(per_item_fee),

#             "fba_fee": format_currency(fba_fee),
#             "fba_pick_pack_fee": format_currency(fba_pick_pack_fee),
#             "fba_weight_handling_fee": format_currency(fba_weight_handling_fee),

#             "tax_amount": format_currency(tax_amount),
#             "shippingfees": format_currency(shipping_final),
#             "tcs": format_currency(tcs_total),

#             "profit": format_currency(profit),
#             "grossprofitper": round(profit_margin, 2),
#             "retpercent": round(ret_percent, 2),
#             "returnqty": int(return_units),
#             # "tacos": round(tacos, 2),
#             # "gst": format_currency(tcs_total),
#             "gst": format_currency(0),

#             "taxable_value": format_currency(taxable_value),
#             "gst_to_pay_amount": format_currency(gst_to_pay_amount),
#             "gst_to_pay_perc": round(gst_to_pay_perc, 2),
#             "exp_settlement": format_currency(exp_settlement),

#             "id": asin,
#             "stdcost": format_currency(total_cost),
#             "redirecturl": f"https://www.amazon.in/dp/{asin}" if asin else None,
#         })


#         total_sales += gross_sales
#         total_net_sales += net_sales
#         total_profit += profit
#         total_ads += ads
#         total_qty += net_qty
#         total_returns += return_units
#         total_shipping += shipping_final
#         total_tcs += tcs_total
#         total_mpfees += t_new_charge
#         total_ret_percent += ret_percent
#         total_stdcost += total_cost
#         total_estimatefees += Decimal(estimated_fees)
#         total_mp_gst += mp_gst
#         total_taxable_value += taxable_value
#         total_gst_payable += gst_to_pay_amount
#         total_exp_settlement += exp_settlement

#     return Response({
#         "status": True,
#         "message": "Success",
#         "pagination": {
#             "pageNo": page_no,
#             "pageSize": page_size,
#             "count": len(results)
#         },
#         "totals": {
#             "ads": format_currency(total_ads),
#             "netqty": total_qty,
#             "totalreturn": total_returns,
#             "totalreturnper": f"{round(total_ret_percent, 2)}%",
#             "grosssales": format_currency(total_sales),
#             "netsales": format_currency(total_net_sales),
#             "profit": format_currency(total_profit),
#             "grossprofitper": round((total_profit / total_net_sales * 100), 2) if total_net_sales else 0,
#             "mpfees": format_currency(total_mpfees),
#              "mp_gst": format_currency(total_mp_gst),
#             # "estimatefees": format_currency(total_estimatefees),
#             "estimatefees": format_currency(-abs(total_estimatefees)),
#             "total_new_mpfees": format_currency(total_mpfees),
#             "shippingfees": format_currency(total_shipping),
#             "tacos": (total_ads / total_sales * 100) if total_sales else 0,
#             "stdcost": format_currency(total_stdcost),
#             # "totalgst": format_currency(total_tcs),
#             "totalgst": format_currency(0),
#             "tcs": format_currency(total_tcs),
#             "taxable_value": format_currency(total_taxable_value),

#             "gst_to_pay_amount": format_currency(total_gst_payable),
#             "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",

#             "exp_settlement": format_currency(total_exp_settlement),
#         },
#         "response": results[page_no * page_size:(page_no + 1) * page_size]
#     })


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
        user=user,
        sku=OuterRef("seller_sku")
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

        # ---------------- GST / TAXABLE ----------------

        # # Gross sales excluding GST
        # taxable_value = gross_sales

        # # GST collected from order
        # gst_to_pay_amount = item_tax

        # # GST %
        # gst_to_pay_perc = (
        #     (gst_to_pay_amount / taxable_value) * 100
        #     if taxable_value else Decimal("0")
        # )

        # # TCS = 1% of taxable value
        # tcs_total = gst_to_pay_amount * Decimal("0.01")

        # # adjusted_gross_sales = gross_sales + item_tax - promo_discount
        # adjusted_gross_sales = gross_sales + item_tax - promo_discount + shipping_price

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
        # SKU GST / TCS
        # ------------------------------------------------------------

        gst_rate = Decimal(str(row.get("sku_gst_rate") or 0))
        tcs_rate = Decimal(str(row.get("sku_tcs_rate") or 0))

        # ------------------------------------------------------------
        # TAXABLE VALUE
        # GST INCLUDED SALES -> REMOVE GST
        # ------------------------------------------------------------

        if gst_rate > 0:

            taxable_value = (
                adjusted_gross_sales / (1 + (gst_rate / 100))
            )
            gst_to_pay_amount = adjusted_gross_sales - taxable_value
            
            # taxable_value = gross_sales

        else:

            taxable_value = gross_sales
            gst_to_pay_amount = item_tax

        # ------------------------------------------------------------
        # GST TO PAY
        # ------------------------------------------------------------

        # gst_to_pay_amount = (
        #     adjusted_gross_sales - taxable_value
        # )

        # ------------------------------------------------------------
        # TCS
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

        # ------------------------------------------------------------
        # GST %
        # ------------------------------------------------------------

        # gst_to_pay_perc = gst_rate
        
        if gst_rate:
            gst_to_pay_perc = gst_rate

        else:
          
            gst_to_pay_perc = (
                (gst_to_pay_amount / taxable_value) * 100
                if taxable_value else 1
            )  




        refund = rto = mpfees = shipping_fee = Decimal(0)
        return_units = Decimal(0)
        # tcs_total = Decimal(0)
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
            # ads += Decimal(f.get('ads') or 0)

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
                # tcs_total += Decimal(order_fee_map[asin]["tcs"])

            r = Decimal(f.get('refund') or 0)
            rto_amt = Decimal(f.get('rto') or 0)

            refund += r
            rto += rto_amt

            # total_estimatefees += estimated_fees

            if r < 0 or rto_amt < 0:
                return_units += qty

        # net_qty = max(gross_qty - return_units, 0)
        net_qty = max(gross_qty , 0)
        # net_sales = gross_sales + refund + rto
        net_sales = adjusted_gross_sales
        # total_estimatefees += estimated_fees
        shipping_final = Decimal(row['shipping_price'] or 0)

        # mp_gst = (net_sales + shipping_final) * 0.18
       

        mp_gst = (net_sales + shipping_final) * Decimal("0.18")
        
        # total_cost = Decimal(row['total_cost'] or 0)

        # total_cost = Decimal(50) * net_qty
        
        standard_cost = Decimal(
            str(row.get("sku_standard_cost") or 0)
        )

        total_cost = standard_cost * net_qty

        # profit = net_sales + t_new_charge + shipping_final - total_cost + tcs_total
        # profit = net_sales - estimated_fees - shipping_final - tcs_total + mp_gst - total_cost
        
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

        # exp_settlement = (
        #     profit
        #     - total_cost
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
            # "child_sku": row['child_sku'],
            "image_url": row['image_url'],
            "channel": "Amazon-India",
            "channel1": "Amazon-India",

            "grossqty": int(gross_qty),
            "netqty": int(net_qty),

            "grosssales": format_currency(gross_sales),
            "netsales": format_currency(net_sales),

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

            "profit": format_currency(profit),
            "grossprofitper": round(profit_margin, 2),
            "retpercent": round(ret_percent, 2),
            "returnqty": int(return_units),
            # "tacos": round(tacos, 2),
            # "gst": format_currency(tcs_total),
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
            "taxable_value": format_currency(total_taxable_value),

            "gst_to_pay_amount": format_currency(total_gst_payable),
            "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",

            "exp_settlement": format_currency(total_exp_settlement),
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })


# workinng till may 20
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def sku_profit_report(request):

#     user = request.user
#     data = request.data

#     # ---------------- GET ASIN ----------------
#     filters = data.get("filters", {})
#     asin = data.get("parentProductId") or filters.get("parentProductId")

#     if not asin:
#         return Response({
#             "status": False,
#             "message": "parentProductId is required"
#         }, status=400)

#     pagination = data.get("pagination", {})
#     page_no = int(pagination.get("pageNo", 0))
#     page_size = int(pagination.get("pageSize", 25))


   
#     # ---------------- DATE FILTER ----------------
#     from_date = None
#     to_date = None

#     try:
#         if filters.get("fromDate"):
#             from_date = timezone.make_aware(
#                 datetime.strptime(filters["fromDate"], "%Y-%m-%d")
#             )

#         if filters.get("endDate"):
#             to_date = timezone.make_aware(
#                 datetime.strptime(filters["endDate"], "%Y-%m-%d")
#             ) + timedelta(days=1)

#         # ✅ FIX: handle single-day filter
#         if from_date and not to_date:
#             to_date = from_date + timedelta(days=1)

#     except Exception as e:
#         print("Date error:", e)
#     valid_orders = (
#         OrderItem.objects
#         .filter(order__user=user)
#     )

#     order_filter = Q(order__user=user, asin=asin)

#     if from_date:
#         order_filter &= Q(order__purchase_date__gte=from_date)

#     if to_date:
#         order_filter &= Q(order__purchase_date__lt=to_date)   # ✅ IMPORTANT

#     valid_order_ids = set(
#         valid_orders.values_list('order__amazon_order_id', flat=True)
#     )

#     # ---------------- FILTER ----------------
#     # order_filter = Q(order__user=user, asin=asin)
#     # order_filter = Q(order__user=user, asin=asin)

#     if valid_order_ids:
#         order_filter &= Q(order__amazon_order_id__in=valid_order_ids)

#     CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}

#     channels = filters.get("channel", {}).get("IN", [])
#     if channels:
#         marketplace_ids = [CHANNEL_MAP[ch] for ch in channels if ch in CHANNEL_MAP]
#         if marketplace_ids:
#             order_filter &= Q(order__marketplace_id__in=marketplace_ids)

#     if from_date:
#         order_filter &= Q(order__purchase_date__gte=from_date)
#     if to_date:
#         order_filter &= Q(order__purchase_date__lte=to_date)

#     # ---------------- ORDER ITEMS ----------------
#     items = (
#         OrderItem.objects
#         .filter(order_filter)
#         .exclude(order__order_status__icontains='Cancel')
#         .values('order__amazon_order_id', 'order__purchase_date')
#         .annotate(
#             title=Max('title'),
#             image=Max('image_url'),

#             grossqty=Sum('quantity_ordered'),
#             grosssales=Sum('item_price'),
#             promotion_discount=Sum('promotion_discount'),
#             avg_cost=Avg('item_price'),
#             item_tax=Sum('item_tax'),

#             shipping_income=Sum('shipping_price'),
#             shipping_price=Sum('shipping_price'),
#             total_cost=Sum(F('cost_price') * F('quantity_ordered'))
#         )
#         .order_by('-order__purchase_date')
#     )

#     # estimated_fee_data = (
#     #     AmazonEstimatedFee.objects
#     #     .filter(
#     #         order_item__order__user=user,
#     #         asin=asin
#     #     )
#     #     .values('order_item__order__amazon_order_id')
#     #     .annotate(
#     #         estimated_fees=Sum('total_fees')
#     #     )
#     # )

#     estimated_fee_data = (
#         AmazonEstimatedFee.objects
#         .filter(
#             order_item__order__user=user,
#             asin=asin
#         )
#         .values('order_item__order__amazon_order_id')
#         .annotate(
#             estimated_fees=Sum('total_fees'),

#             referral_fee=Sum('referral_fee'),
#             closing_fee=Sum('closing_fee'),
#             per_item_fee=Sum('per_item_fee'),

#             fba_fee=Sum('fba_fee'),
#             fba_pick_pack_fee=Sum('fba_pick_pack_fee'),
#             fba_weight_handling_fee=Sum('fba_weight_handling_fee'),

#             tax_amount=Sum('tax_amount'),
#         )
#     )

#     # estimated_fee_map = {
#     #     row['order_item__order__amazon_order_id']: Decimal(
#     #         str(row['estimated_fees'] or 0)
#     #     )
#     #     for row in estimated_fee_data
#     # }
#     estimated_fee_map = {
#         row['order_item__order__amazon_order_id']: {

#             "estimated_fees": float(row['estimated_fees'] or 0),

#             "referral_fee": float(row['referral_fee'] or 0),
#             "closing_fee": float(row['closing_fee'] or 0),
#             "per_item_fee": float(row['per_item_fee'] or 0),

#             "fba_fee": float(row['fba_fee'] or 0),
#             "fba_pick_pack_fee": float(row['fba_pick_pack_fee'] or 0),
#             "fba_weight_handling_fee": float(row['fba_weight_handling_fee'] or 0),

#             "tax_amount": float(row['tax_amount'] or 0),
#         }

#         for row in estimated_fee_data
#     }
#     # ---------------- FINANCE ----------------
#     # finance_qs = FinancialEvent.objects.filter(user=user)
#     finance_qs = FinancialEvent.objects.filter(
#         user=user,
#         amazon_order_id__in=valid_order_ids
#     )

#     if from_date:
#         finance_qs = finance_qs.filter(posted_date__gte=from_date)
#     if to_date:
#         finance_qs = finance_qs.filter(posted_date__lte=to_date)

#     finance_data = (
#         finance_qs
#         .values('amazon_order_id')
#         .annotate(
#             refund=Sum('total_amount', filter=Q(event_group="REFUND")),
#             ads=Sum('total_amount', filter=Q(event_type__icontains='Ad')),

#             commission=Sum('commission_fee'),
#             fulfillment=Sum('fulfillment_fee'),
#             other_fee=Sum('other_fee'),

#             shipping_fee=Sum('shipping_fee'),
#             gst=Sum('tax')
#         )
#     )

#     finance_map = {f['amazon_order_id']: f for f in finance_data}

#     # ---------------- RAW DATA (TCS) ----------------
#     raw_map = (
#         FinancialEvent.objects
#         .filter(user=user, amazon_order_id__in=valid_order_ids)
#         .exclude(raw_data=None)
#         .values('amazon_order_id', 'raw_data')
#     )

#     raw_data_map = {}
#     for r in raw_map:
#         raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])

#     # ---------------- BUILD RESPONSE ----------------
#     results = []

#     total_sales = total_profit = total_qty = 0
#     total_ads = total_mpfees = total_shipping = 0
#     total_gst = total_tcs = total_cost = 0
#     total_net_sales = 0
#     total_returns = 0
#     total_ret_percent =0
#     total_new_charge = 0
#     adjusted_gross_sales = 0
#     total_estimatefees = 0
#     total_mp_gst = 0

#     total_taxable_value = 0
#     total_gst_payable = 0

#     total_exp_settlement = 0

#     for row in items:

#         oid = row['order__amazon_order_id']

#         gross_qty = int(row['grossqty'] or 0)
#         gross_sales = float(row['grosssales'] or 0)

#         item_tax = float(row.get('item_tax') or 0)
#         promo_discount = float(row.get('promotion_discount') or 0)
       
#         # estimated_fees = float(
#         #     estimated_fee_map.get(oid, Decimal("0"))
#         # )

#         fee_data = estimated_fee_map.get(oid, {})

#         estimated_fees = fee_data.get("estimated_fees", 0)

#         referral_fee = fee_data.get("referral_fee", 0)
#         closing_fee = fee_data.get("closing_fee", 0)
#         per_item_fee = fee_data.get("per_item_fee", 0)

#         fba_fee = fee_data.get("fba_fee", 0)
#         fba_pick_pack_fee = fee_data.get("fba_pick_pack_fee", 0)
#         fba_weight_handling_fee = fee_data.get("fba_weight_handling_fee", 0)

#         tax_amount = fee_data.get("tax_amount", 0)

#         # adjusted_gross_sales = gross_sales + item_tax - promo_discount

#         shipping_income = float(row['shipping_income'] or 0)
#         shipping_price = float(row['shipping_price'] or 0)

#         adjusted_gross_sales = gross_sales + item_tax - promo_discount + shipping_price
        
#         # cost = float(row['total_cost'] or 0)
#         cost = float(50) * gross_qty

#         f = finance_map.get(oid, {})

#         refund = float(f.get('refund') or 0)
#         ads = float(f.get('ads') or 0)

#         mpfees = (
#             float(f.get('commission') or 0) +
#             float(f.get('fulfillment') or 0) +
#             float(f.get('other_fee') or 0)
#         )

#         shipping_fee = float(f.get('shipping_fee') or 0)
#         gst = float(f.get('gst') or 0)

#         # ---------------- TCS ----------------

#         # tcs = 0
#         # for raw in raw_data_map.get(oid, []):# ---------------- GST / TAXABLE ----------------

#         # Gross sales includes GST
#         # Taxable value = sales without GST
        
#         gst_to_pay_amount = item_tax

#         # TCS = 1% of taxable value
#         tcs = gst_to_pay_amount * 0.01

#         # GST amount payable
#         taxable_value = gross_sales

#         # GST percentage
#         gst_to_pay_perc = (
#             (gst_to_pay_amount / taxable_value) * 100
#             if taxable_value else 1
#         )
#         #     if not isinstance(raw, dict):
#         #         continue
#         #     try:
#         #         for item in raw.get("ShipmentItemList", []):
#         #             for charge in item.get("ItemChargeList", []):
#         #                 if charge.get("ChargeType") == "TCS-IGST":
#         #                     tcs += float(charge["ChargeAmount"]["CurrencyAmount"])
#         #     except:
#         #         pass


   
#         # ---------------- NEW FEES (SUM OF ALL FEETYPES) ----------------
#         new_charge = 0

#         for raw in raw_data_map.get(oid, []):
#             if not isinstance(raw, dict):
#                 continue

#             try:
#                 # ✅ Handle BOTH types
#                 item_lists = []
#                 item_lists.extend(raw.get("ShipmentItemList", []))
#                 item_lists.extend(raw.get("ShipmentItemAdjustmentList", []))

#                 for item in item_lists:

#                     fee_lists = []
#                     fee_lists.extend(item.get("ItemFeeList", []))               # ✅ NORMAL
#                     fee_lists.extend(item.get("ItemFeeAdjustmentList", []))     # ✅ REFUND

#                     for fee in fee_lists:
#                         amount = float(
#                             fee.get("FeeAmount", {}).get("CurrencyAmount", 0) or 0
#                         )
#                         new_charge += amount

#             except Exception:
#                 pass

#         # ---------------- RETURNS ----------------
#         return_units = abs(refund) / (gross_sales / gross_qty) if gross_qty and gross_sales else 0
#         return_units = int(round(return_units))

#         # net_qty = max(gross_qty - return_units, 0)
#         net_qty = max(gross_qty , 0)

#         # ---------------- CALCULATIONS ----------------
#         # net_sales = gross_sales + refund
#         net_sales = adjusted_gross_sales
#         # shipping_final = shipping_income  

#         shipping_final = shipping_income

#         # MP GST = 18% of (netsales + shipping)
#         mp_gst = (net_sales + shipping_final) * 0.18

        
#         # profit = net_sales + new_charge + shipping_final - cost + tcs
#         # profit = net_sales - estimated_fees - shipping_final - tcs
        
#         # profit = net_sales - estimated_fees - shipping_final - tcs + mp_gst - cost
#         profit = (
#             net_sales
#             - estimated_fees
#             - shipping_final
#             - cost
#             + tcs
#             + mp_gst
        
#         )

#         exp_settlement = profit - cost - tcs - mp_gst
        

#         profit_margin = (profit / net_sales * 100) if net_sales else 0
#         tacos = (ads / gross_sales * 100) if gross_sales else 0
#         drr = tacos
#         ret_percent = (return_units / net_qty * 100) if net_qty else 0

#         results.append({
#             "order_id": oid,
#             "date": row['order__purchase_date'],
#             "name": row['title'],
#             "image": row['image'],

#             "channel": "Amazon-India",
#             "channel1": "Amazon-India",
#             "redirecturl": f"https://www.amazon.in/dp/{asin}",

#             "grossqty": gross_qty,
#             "qty": net_qty,

#             "grosssales": round(gross_sales, 2),
#             "netsales": format_currency(net_sales),

#             "taxable_value":
#             format_currency(taxable_value),

#             "gst_to_pay_amount":
#             format_currency(gst_to_pay_amount),

#             "gst_to_pay_perc":
#             round(gst_to_pay_perc, 2),

#             "ads": format_currency(ads),
#             "mpfees": round(mpfees, 2),
#             "mp_gst": format_currency(mp_gst),
#             # "estimatefees": format_currency(estimated_fees),
#             "estimatefees": format_currency(-abs(estimated_fees)),
#             "referral_fee": format_currency(referral_fee),
#             "closing_fee": format_currency(closing_fee),
#             "per_item_fee": format_currency(per_item_fee),

#             "fba_fee": format_currency(fba_fee),
#             "fba_pick_pack_fee": format_currency(fba_pick_pack_fee),
#             "fba_weight_handling_fee": format_currency(fba_weight_handling_fee),

#             "tax_amount": format_currency(tax_amount),
#             "new_mpfees": format_currency(new_charge),
#             "shippingfees": format_currency(shipping_final),

#             "profit": format_currency(profit),
#             "grossprofitper": round(profit_margin, 2),

#             "returnqty": return_units,
#             "retpercent": round(ret_percent, 2),

#             "tacos": round(tacos, 2),
#             "drr": round(drr, 2),

#             "stdcost": format_currency(cost),

#             # "gst": format_currency(tcs),
#             "gst": format_currency(0),
#             "tcs": format_currency(tcs),
#             "exp_settlement":format_currency(exp_settlement),
#         })

#         # ---------------- TOTALS ----------------
#         total_sales += gross_sales
#         total_net_sales += net_sales
#         total_profit += profit
#         total_qty += net_qty
#         total_returns += return_units
#         total_ads += ads
#         total_mpfees += mpfees
#         total_shipping += shipping_final
#         total_gst += gst
#         total_tcs += tcs
#         total_cost += cost
#         total_ret_percent += ret_percent
#         total_new_charge += new_charge
#         total_estimatefees += estimated_fees
#         total_mp_gst += mp_gst
#         total_taxable_value += taxable_value
#         total_gst_payable += gst_to_pay_amount
#         total_exp_settlement += exp_settlement

#     # ---------------- RESPONSE ----------------
#     return Response({
#         "status": True,
#         "message": "Success",
#         "pagination": {
#             "pageNo": page_no,
#             "pageSize": page_size,
#             "count": len(results)
#         },
#         "totals": {
#             "grosssales": round(total_sales, 2),
#             "netsales": format_currency(total_net_sales),
#             "total_netquantity": total_qty,
#             "profit": format_currency(total_profit),
#             "total_returns":total_returns,
#             "total_ret_percent":f"{round(total_ret_percent, 2)}%",

#             # "totalprofitmargin": (total_profit / total_net_sales * 100) if total_net_sales else 0,
#             "totalprofitmargin": round((total_profit / total_net_sales * 100), 2) if total_net_sales else 0,

#             "ads": format_currency(total_ads),
#             "mpfees": round(total_mpfees, 2),
#             "mp_gst": format_currency(total_mp_gst),
#             # "estimatefees": format_currency(total_estimatefees),
#             "estimatefees": format_currency(-abs(total_estimatefees)),
#             "total_new_mpfees": format_currency(total_new_charge),
#             "shipping": format_currency(total_shipping),
#             # "gst": format_currency(total_tcs),
#             "gst": format_currency(0),
#             "tcs": format_currency(total_tcs),
#             "cost": format_currency(total_cost),

#             "taxable_value":format_currency(total_taxable_value),

#             "gst_to_pay_amount":format_currency(total_gst_payable),

#             "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",

            
#             "exp_settlement":format_currency(total_exp_settlement),
#         },
#         "response": results[page_no * page_size:(page_no + 1) * page_size]
#     })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def amazon_profitability_parent_transactions_shipping(request):

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
        user=user,
        sku=OuterRef("seller_sku")
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

    
    # ---------------- TRANSACTION SHIPPING FEES ----------------
    # ---------------- TRANSACTION SHIPPING FEES — MFN POSTAGE FEE ONLY ----------------
    # all_order_ids = [row['order__amazon_order_id'] for row in asin_orders]
    # tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
    #     identifier_name='ORDER_ID',
    #     identifier_value__in=all_order_ids
    # ).values('transaction_id', 'identifier_value')

    # tx_to_order = {
    #     item['transaction_id']: item['identifier_value']
    #     for item in tx_identifiers
    # }

    # tx_shipping_map = {}

    # # MFN shipping cost posts as its own ServiceFee transaction
    # # (description "MfnPostageFee") — only count RELEASED (settled) ones
    # # to avoid double-counting the DEFERRED version of the same fee.
    # mfn_postage_txns = AmazonTransaction.objects.filter(
    #     id__in=tx_to_order.keys(),
    #     transaction_type='ServiceFee',
    #     transaction_status='RELEASED',
    #     description__icontains='MfnPostageFee'
    # ).values('id', 'total_amount')

    # for t in mfn_postage_txns:
    #     t_id = t['id']
    #     oid = tx_to_order.get(t_id)
    #     if not oid:
    #         continue
    #     tx_shipping_map[oid] = tx_shipping_map.get(oid, Decimal("0")) + Decimal(str(t['total_amount'] or 0))
    
    matching_order_ids = [row['order__amazon_order_id'] for row in asin_orders]
    tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        identifier_name="ORDER_ID",
        identifier_value__in=matching_order_ids
    ).values("transaction_id", "identifier_value")

    tx_to_order = {
        row["transaction_id"]: row["identifier_value"]
        for row in tx_identifiers
    }

    tx_shipping_map = {}

    # ------------------------------------------------------------
    # MFN SHIPPING
    # ------------------------------------------------------------
    mfn_postage_txns = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="ServiceFee",
        transaction_status="DEFERRED",
        description__icontains="MfnPostageFee",
    ).values("id", "total_amount")

    for txn in mfn_postage_txns:
        order_id = tx_to_order.get(txn["id"])
        if not order_id:
            continue

        tx_shipping_map[order_id] = (
            tx_shipping_map.get(order_id, Decimal("0"))
            + Decimal(str(txn["total_amount"] or 0))
        )

    # ------------------------------------------------------------
    # AFN / FBA SHIPPING
    # Shipment (DEFERRED)
    # Shipping + FBAWeightBasedFee
    # ------------------------------------------------------------

    afn_tx_ids = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="Shipment",
        transaction_status="DEFERRED",
    ).values_list("id", flat=True)

    afn_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=afn_tx_ids,
            breakdown_type__in=["FBAWeightBasedFee"],
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )

    for bd in afn_breakdowns:
        order_id = tx_to_order.get(bd["transaction_id"])
        if not order_id:
            continue

        tx_shipping_map[order_id] = (
            tx_shipping_map.get(order_id, Decimal("0"))
            + Decimal(str(bd["total"] or 0))
        )

    # ---------------- BUILD RESPONSE ----------------
    results = []

    total_sales = total_profit = total_ads = Decimal(0)
    total_net_sales = total_qty = Decimal(0)
    total_returns = total_shipping = Decimal(0)
    total_tcs = Decimal(0)
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

        tx_shipping_final = Decimal("0")
        for o in orders:
            oid = o['order__amazon_order_id']
            tx_shipping_final += tx_shipping_map.get(oid, Decimal("0"))
        shipping_price = tx_shipping_final
        
        
        # estimated_fees += promo_discount   #currently not use this 

        # ---------------- GST / TAXABLE ----------------

        # # Gross sales excluding GST
        # taxable_value = gross_sales

        # # GST collected from order
        # gst_to_pay_amount = item_tax

        # # GST %
        # gst_to_pay_perc = (
        #     (gst_to_pay_amount / taxable_value) * 100
        #     if taxable_value else Decimal("0")
        # )

        # # TCS = 1% of taxable value
        # tcs_total = gst_to_pay_amount * Decimal("0.01")

        # # adjusted_gross_sales = gross_sales + item_tax - promo_discount
        # adjusted_gross_sales = gross_sales + item_tax - promo_discount + shipping_price

        # ------------------------------------------------------------
        # ADJUSTED SALES
        # ------------------------------------------------------------

        # adjusted_gross_sales = (
        #     gross_sales
        #     + item_tax
        #     - promo_discount
        #     + shipping_price
        # )
        adjusted_gross_sales = (
            gross_sales
            + item_tax
         
            + shipping_price
        )

        # ------------------------------------------------------------
        # SKU GST / TCS
        # ------------------------------------------------------------

        gst_rate = Decimal(str(row.get("sku_gst_rate") or 0))
        tcs_rate = Decimal(str(row.get("sku_tcs_rate") or 0))

        # ------------------------------------------------------------
        # TAXABLE VALUE
        # GST INCLUDED SALES -> REMOVE GST
        # ------------------------------------------------------------

        if gst_rate > 0:

            taxable_value = (
                adjusted_gross_sales / (1 + (gst_rate / 100))
            )
            gst_to_pay_amount = adjusted_gross_sales - taxable_value
            
            # taxable_value = gross_sales

        else:

            taxable_value = gross_sales
            gst_to_pay_amount = item_tax

        # ------------------------------------------------------------
        # GST TO PAY
        # ------------------------------------------------------------

        # gst_to_pay_amount = (
        #     adjusted_gross_sales - taxable_value
        # )

        # ------------------------------------------------------------
        # TCS
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

        # ------------------------------------------------------------
        # GST %
        # ------------------------------------------------------------

        # gst_to_pay_perc = gst_rate
        
        if gst_rate:
            gst_to_pay_perc = gst_rate

        else:
          
            gst_to_pay_perc = (
                (gst_to_pay_amount / taxable_value) * 100
                if taxable_value else 1
            )  




        refund = rto = mpfees = shipping_fee = Decimal(0)
        return_units = Decimal(0)
        # tcs_total = Decimal(0)
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
            # ads += Decimal(f.get('ads') or 0)

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
                # tcs_total += Decimal(order_fee_map[asin]["tcs"])

            r = Decimal(f.get('refund') or 0)
            rto_amt = Decimal(f.get('rto') or 0)

            refund += r
            rto += rto_amt

            # total_estimatefees += estimated_fees

            if r < 0 or rto_amt < 0:
                return_units += qty

        # net_qty = max(gross_qty - return_units, 0)
        net_qty = max(gross_qty , 0)
        # net_sales = gross_sales + refund + rto
        net_sales = adjusted_gross_sales
        # total_estimatefees += estimated_fees
        shipping_final = shipping_price

        # mp_gst = (net_sales + shipping_final) * 0.18
       

        # mp_gst = (net_sales + shipping_final) * Decimal("0.18")  update on 13 july
        mp_gst = (estimated_fees + shipping_final) * Decimal("0.18")
        
        # total_cost = Decimal(row['total_cost'] or 0)

        # total_cost = Decimal(50) * net_qty
        
        standard_cost = Decimal(
            str(row.get("sku_standard_cost") or 0)
        )

        total_cost = standard_cost * net_qty

        # profit = net_sales + t_new_charge + shipping_final - total_cost + tcs_total
        # profit = net_sales - estimated_fees - shipping_final - tcs_total + mp_gst - total_cost
        
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

        # exp_settlement = (
        #     profit
        #     - total_cost
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
            # "child_sku": row['child_sku'],
            "image_url": row['image_url'],
            "channel": "Amazon-India",
            "channel1": "Amazon-India",

            "grossqty": int(gross_qty),
            "netqty": int(net_qty),

            "grosssales": format_currency(gross_sales),
            "netsales": format_currency(net_sales),

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

            "profit": format_currency(profit),
            "grossprofitper": round(profit_margin, 2),
            "retpercent": round(ret_percent, 2),
            "returnqty": int(return_units),
            # "tacos": round(tacos, 2),
            # "gst": format_currency(tcs_total),
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
            "taxable_value": format_currency(total_taxable_value),

            "gst_to_pay_amount": format_currency(total_gst_payable),
            "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",

            "exp_settlement": format_currency(total_exp_settlement),
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })




# workinng till may 20
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def sku_profit_report(request):

#     user = request.user
#     data = request.data

#     # ---------------- GET ASIN ----------------
#     filters = data.get("filters", {})
#     asin = data.get("parentProductId") or filters.get("parentProductId")

#     if not asin:
#         return Response({
#             "status": False,
#             "message": "parentProductId is required"
#         }, status=400)

#     pagination = data.get("pagination", {})
#     page_no = int(pagination.get("pageNo", 0))
#     page_size = int(pagination.get("pageSize", 25))


   
#     # ---------------- DATE FILTER ----------------
#     from_date = None
#     to_date = None

#     try:
#         if filters.get("fromDate"):
#             from_date = timezone.make_aware(
#                 datetime.strptime(filters["fromDate"], "%Y-%m-%d")
#             )

#         if filters.get("endDate"):
#             to_date = timezone.make_aware(
#                 datetime.strptime(filters["endDate"], "%Y-%m-%d")
#             ) + timedelta(days=1)

#         # ✅ FIX: handle single-day filter
#         if from_date and not to_date:
#             to_date = from_date + timedelta(days=1)

#     except Exception as e:
#         print("Date error:", e)
#     valid_orders = (
#         OrderItem.objects
#         .filter(order__user=user)
#     )

#     order_filter = Q(order__user=user, asin=asin)

#     if from_date:
#         order_filter &= Q(order__purchase_date__gte=from_date)

#     if to_date:
#         order_filter &= Q(order__purchase_date__lt=to_date)   # ✅ IMPORTANT

#     valid_order_ids = set(
#         valid_orders.values_list('order__amazon_order_id', flat=True)
#     )

#     # ---------------- FILTER ----------------
#     # order_filter = Q(order__user=user, asin=asin)
#     # order_filter = Q(order__user=user, asin=asin)

#     if valid_order_ids:
#         order_filter &= Q(order__amazon_order_id__in=valid_order_ids)

#     CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}

#     channels = filters.get("channel", {}).get("IN", [])
#     if channels:
#         marketplace_ids = [CHANNEL_MAP[ch] for ch in channels if ch in CHANNEL_MAP]
#         if marketplace_ids:
#             order_filter &= Q(order__marketplace_id__in=marketplace_ids)

#     if from_date:
#         order_filter &= Q(order__purchase_date__gte=from_date)
#     if to_date:
#         order_filter &= Q(order__purchase_date__lte=to_date)

#     # ---------------- ORDER ITEMS ----------------
#     items = (
#         OrderItem.objects
#         .filter(order_filter)
#         .exclude(order__order_status__icontains='Cancel')
#         .values('order__amazon_order_id', 'order__purchase_date')
#         .annotate(
#             title=Max('title'),
#             image=Max('image_url'),

#             grossqty=Sum('quantity_ordered'),
#             grosssales=Sum('item_price'),
#             promotion_discount=Sum('promotion_discount'),
#             avg_cost=Avg('item_price'),
#             item_tax=Sum('item_tax'),

#             shipping_income=Sum('shipping_price'),
#             shipping_price=Sum('shipping_price'),
#             total_cost=Sum(F('cost_price') * F('quantity_ordered'))
#         )
#         .order_by('-order__purchase_date')
#     )

#     # estimated_fee_data = (
#     #     AmazonEstimatedFee.objects
#     #     .filter(
#     #         order_item__order__user=user,
#     #         asin=asin
#     #     )
#     #     .values('order_item__order__amazon_order_id')
#     #     .annotate(
#     #         estimated_fees=Sum('total_fees')
#     #     )
#     # )

#     estimated_fee_data = (
#         AmazonEstimatedFee.objects
#         .filter(
#             order_item__order__user=user,
#             asin=asin
#         )
#         .values('order_item__order__amazon_order_id')
#         .annotate(
#             estimated_fees=Sum('total_fees'),

#             referral_fee=Sum('referral_fee'),
#             closing_fee=Sum('closing_fee'),
#             per_item_fee=Sum('per_item_fee'),

#             fba_fee=Sum('fba_fee'),
#             fba_pick_pack_fee=Sum('fba_pick_pack_fee'),
#             fba_weight_handling_fee=Sum('fba_weight_handling_fee'),

#             tax_amount=Sum('tax_amount'),
#         )
#     )

#     # estimated_fee_map = {
#     #     row['order_item__order__amazon_order_id']: Decimal(
#     #         str(row['estimated_fees'] or 0)
#     #     )
#     #     for row in estimated_fee_data
#     # }
#     estimated_fee_map = {
#         row['order_item__order__amazon_order_id']: {

#             "estimated_fees": float(row['estimated_fees'] or 0),

#             "referral_fee": float(row['referral_fee'] or 0),
#             "closing_fee": float(row['closing_fee'] or 0),
#             "per_item_fee": float(row['per_item_fee'] or 0),

#             "fba_fee": float(row['fba_fee'] or 0),
#             "fba_pick_pack_fee": float(row['fba_pick_pack_fee'] or 0),
#             "fba_weight_handling_fee": float(row['fba_weight_handling_fee'] or 0),

#             "tax_amount": float(row['tax_amount'] or 0),
#         }

#         for row in estimated_fee_data
#     }
#     # ---------------- FINANCE ----------------
#     # finance_qs = FinancialEvent.objects.filter(user=user)
#     finance_qs = FinancialEvent.objects.filter(
#         user=user,
#         amazon_order_id__in=valid_order_ids
#     )

#     if from_date:
#         finance_qs = finance_qs.filter(posted_date__gte=from_date)
#     if to_date:
#         finance_qs = finance_qs.filter(posted_date__lte=to_date)

#     finance_data = (
#         finance_qs
#         .values('amazon_order_id')
#         .annotate(
#             refund=Sum('total_amount', filter=Q(event_group="REFUND")),
#             ads=Sum('total_amount', filter=Q(event_type__icontains='Ad')),

#             commission=Sum('commission_fee'),
#             fulfillment=Sum('fulfillment_fee'),
#             other_fee=Sum('other_fee'),

#             shipping_fee=Sum('shipping_fee'),
#             gst=Sum('tax')
#         )
#     )

#     finance_map = {f['amazon_order_id']: f for f in finance_data}

#     # ---------------- RAW DATA (TCS) ----------------
#     raw_map = (
#         FinancialEvent.objects
#         .filter(user=user, amazon_order_id__in=valid_order_ids)
#         .exclude(raw_data=None)
#         .values('amazon_order_id', 'raw_data')
#     )

#     raw_data_map = {}
#     for r in raw_map:
#         raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])

#     # ---------------- BUILD RESPONSE ----------------
#     results = []

#     total_sales = total_profit = total_qty = 0
#     total_ads = total_mpfees = total_shipping = 0
#     total_gst = total_tcs = total_cost = 0
#     total_net_sales = 0
#     total_returns = 0
#     total_ret_percent =0
#     total_new_charge = 0
#     adjusted_gross_sales = 0
#     total_estimatefees = 0
#     total_mp_gst = 0

#     total_taxable_value = 0
#     total_gst_payable = 0

#     total_exp_settlement = 0

#     for row in items:

#         oid = row['order__amazon_order_id']

#         gross_qty = int(row['grossqty'] or 0)
#         gross_sales = float(row['grosssales'] or 0)

#         item_tax = float(row.get('item_tax') or 0)
#         promo_discount = float(row.get('promotion_discount') or 0)
       
#         # estimated_fees = float(
#         #     estimated_fee_map.get(oid, Decimal("0"))
#         # )

#         fee_data = estimated_fee_map.get(oid, {})

#         estimated_fees = fee_data.get("estimated_fees", 0)

#         referral_fee = fee_data.get("referral_fee", 0)
#         closing_fee = fee_data.get("closing_fee", 0)
#         per_item_fee = fee_data.get("per_item_fee", 0)

#         fba_fee = fee_data.get("fba_fee", 0)
#         fba_pick_pack_fee = fee_data.get("fba_pick_pack_fee", 0)
#         fba_weight_handling_fee = fee_data.get("fba_weight_handling_fee", 0)

#         tax_amount = fee_data.get("tax_amount", 0)

#         # adjusted_gross_sales = gross_sales + item_tax - promo_discount

#         shipping_income = float(row['shipping_income'] or 0)
#         shipping_price = float(row['shipping_price'] or 0)

#         adjusted_gross_sales = gross_sales + item_tax - promo_discount + shipping_price
        
#         # cost = float(row['total_cost'] or 0)
#         cost = float(50) * gross_qty

#         f = finance_map.get(oid, {})

#         refund = float(f.get('refund') or 0)
#         ads = float(f.get('ads') or 0)

#         mpfees = (
#             float(f.get('commission') or 0) +
#             float(f.get('fulfillment') or 0) +
#             float(f.get('other_fee') or 0)
#         )

#         shipping_fee = float(f.get('shipping_fee') or 0)
#         gst = float(f.get('gst') or 0)

#         # ---------------- TCS ----------------

#         # tcs = 0
#         # for raw in raw_data_map.get(oid, []):# ---------------- GST / TAXABLE ----------------

#         # Gross sales includes GST
#         # Taxable value = sales without GST
        
#         gst_to_pay_amount = item_tax

#         # TCS = 1% of taxable value
#         tcs = gst_to_pay_amount * 0.01

#         # GST amount payable
#         taxable_value = gross_sales

#         # GST percentage
#         gst_to_pay_perc = (
#             (gst_to_pay_amount / taxable_value) * 100
#             if taxable_value else 1
#         )
#         #     if not isinstance(raw, dict):
#         #         continue
#         #     try:
#         #         for item in raw.get("ShipmentItemList", []):
#         #             for charge in item.get("ItemChargeList", []):
#         #                 if charge.get("ChargeType") == "TCS-IGST":
#         #                     tcs += float(charge["ChargeAmount"]["CurrencyAmount"])
#         #     except:
#         #         pass


   
#         # ---------------- NEW FEES (SUM OF ALL FEETYPES) ----------------
#         new_charge = 0

#         for raw in raw_data_map.get(oid, []):
#             if not isinstance(raw, dict):
#                 continue

#             try:
#                 # ✅ Handle BOTH types
#                 item_lists = []
#                 item_lists.extend(raw.get("ShipmentItemList", []))
#                 item_lists.extend(raw.get("ShipmentItemAdjustmentList", []))

#                 for item in item_lists:

#                     fee_lists = []
#                     fee_lists.extend(item.get("ItemFeeList", []))               # ✅ NORMAL
#                     fee_lists.extend(item.get("ItemFeeAdjustmentList", []))     # ✅ REFUND

#                     for fee in fee_lists:
#                         amount = float(
#                             fee.get("FeeAmount", {}).get("CurrencyAmount", 0) or 0
#                         )
#                         new_charge += amount

#             except Exception:
#                 pass

#         # ---------------- RETURNS ----------------
#         return_units = abs(refund) / (gross_sales / gross_qty) if gross_qty and gross_sales else 0
#         return_units = int(round(return_units))

#         # net_qty = max(gross_qty - return_units, 0)
#         net_qty = max(gross_qty , 0)

#         # ---------------- CALCULATIONS ----------------
#         # net_sales = gross_sales + refund
#         net_sales = adjusted_gross_sales
#         # shipping_final = shipping_income  

#         shipping_final = shipping_income

#         # MP GST = 18% of (netsales + shipping)
#         mp_gst = (net_sales + shipping_final) * 0.18

        
#         # profit = net_sales + new_charge + shipping_final - cost + tcs
#         # profit = net_sales - estimated_fees - shipping_final - tcs
        
#         # profit = net_sales - estimated_fees - shipping_final - tcs + mp_gst - cost
#         profit = (
#             net_sales
#             - estimated_fees
#             - shipping_final
#             - cost
#             + tcs
#             + mp_gst
        
#         )

#         exp_settlement = profit - cost - tcs - mp_gst
        

#         profit_margin = (profit / net_sales * 100) if net_sales else 0
#         tacos = (ads / gross_sales * 100) if gross_sales else 0
#         drr = tacos
#         ret_percent = (return_units / net_qty * 100) if net_qty else 0

#         results.append({
#             "order_id": oid,
#             "date": row['order__purchase_date'],
#             "name": row['title'],
#             "image": row['image'],

#             "channel": "Amazon-India",
#             "channel1": "Amazon-India",
#             "redirecturl": f"https://www.amazon.in/dp/{asin}",

#             "grossqty": gross_qty,
#             "qty": net_qty,

#             "grosssales": round(gross_sales, 2),
#             "netsales": format_currency(net_sales),

#             "taxable_value":
#             format_currency(taxable_value),

#             "gst_to_pay_amount":
#             format_currency(gst_to_pay_amount),

#             "gst_to_pay_perc":
#             round(gst_to_pay_perc, 2),

#             "ads": format_currency(ads),
#             "mpfees": round(mpfees, 2),
#             "mp_gst": format_currency(mp_gst),
#             # "estimatefees": format_currency(estimated_fees),
#             "estimatefees": format_currency(-abs(estimated_fees)),
#             "referral_fee": format_currency(referral_fee),
#             "closing_fee": format_currency(closing_fee),
#             "per_item_fee": format_currency(per_item_fee),

#             "fba_fee": format_currency(fba_fee),
#             "fba_pick_pack_fee": format_currency(fba_pick_pack_fee),
#             "fba_weight_handling_fee": format_currency(fba_weight_handling_fee),

#             "tax_amount": format_currency(tax_amount),
#             "new_mpfees": format_currency(new_charge),
#             "shippingfees": format_currency(shipping_final),

#             "profit": format_currency(profit),
#             "grossprofitper": round(profit_margin, 2),

#             "returnqty": return_units,
#             "retpercent": round(ret_percent, 2),

#             "tacos": round(tacos, 2),
#             "drr": round(drr, 2),

#             "stdcost": format_currency(cost),

#             # "gst": format_currency(tcs),
#             "gst": format_currency(0),
#             "tcs": format_currency(tcs),
#             "exp_settlement":format_currency(exp_settlement),
#         })

#         # ---------------- TOTALS ----------------
#         total_sales += gross_sales
#         total_net_sales += net_sales
#         total_profit += profit
#         total_qty += net_qty
#         total_returns += return_units
#         total_ads += ads
#         total_mpfees += mpfees
#         total_shipping += shipping_final
#         total_gst += gst
#         total_tcs += tcs
#         total_cost += cost
#         total_ret_percent += ret_percent
#         total_new_charge += new_charge
#         total_estimatefees += estimated_fees
#         total_mp_gst += mp_gst
#         total_taxable_value += taxable_value
#         total_gst_payable += gst_to_pay_amount
#         total_exp_settlement += exp_settlement

#     # ---------------- RESPONSE ----------------
#     return Response({
#         "status": True,
#         "message": "Success",
#         "pagination": {
#             "pageNo": page_no,
#             "pageSize": page_size,
#             "count": len(results)
#         },
#         "totals": {
#             "grosssales": round(total_sales, 2),
#             "netsales": format_currency(total_net_sales),
#             "total_netquantity": total_qty,
#             "profit": format_currency(total_profit),
#             "total_returns":total_returns,
#             "total_ret_percent":f"{round(total_ret_percent, 2)}%",

#             # "totalprofitmargin": (total_profit / total_net_sales * 100) if total_net_sales else 0,
#             "totalprofitmargin": round((total_profit / total_net_sales * 100), 2) if total_net_sales else 0,

#             "ads": format_currency(total_ads),
#             "mpfees": round(total_mpfees, 2),
#             "mp_gst": format_currency(total_mp_gst),
#             # "estimatefees": format_currency(total_estimatefees),
#             "estimatefees": format_currency(-abs(total_estimatefees)),
#             "total_new_mpfees": format_currency(total_new_charge),
#             "shipping": format_currency(total_shipping),
#             # "gst": format_currency(total_tcs),
#             "gst": format_currency(0),
#             "tcs": format_currency(total_tcs),
#             "cost": format_currency(total_cost),

#             "taxable_value":format_currency(total_taxable_value),

#             "gst_to_pay_amount":format_currency(total_gst_payable),

#             "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",

            
#             "exp_settlement":format_currency(total_exp_settlement),
#         },
#         "response": results[page_no * page_size:(page_no + 1) * page_size]
#     })


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

    user = request.user
    data = request.data

    # ---------------- GET ASIN ----------------
    filters = data.get("filters", {})

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

        if from_date and not to_date:
            to_date = from_date + timedelta(days=1)

    except Exception as e:
        print("Date error:", e)

    order_filter = Q(
        order__user=user,
        seller_sku=sku
    )

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

            # ⚠️ CONFIRM THIS FIELD NAME — see note at bottom of file.
            # This must be whatever field on Order/OrderItem tells you
            # AFN (FBA) vs MFN (FBM). Replace 'order__fulfillment_channel'
            # with your actual field.
            'order__fulfillment_channel',

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
    # TRANSACTION SHIPPING FEES — MFN POSTAGE FEE ONLY
    # ============================================================

    # tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
    #     identifier_name='ORDER_ID',
    #     identifier_value__in=matching_order_ids
    # ).values('transaction_id', 'identifier_value')

    # tx_to_order = {
    #     item['transaction_id']: item['identifier_value']
    #     for item in tx_identifiers
    # }

    # tx_shipping_map = {}

    # # MFN shipping cost posts as its own ServiceFee transaction
    # # (description "MfnPostageFee") — pull the transaction's own total_amount.
    # mfn_postage_txns = AmazonTransaction.objects.filter(
    #     id__in=tx_to_order.keys(),
    #     transaction_type='ServiceFee',
    #     transaction_status='RELEASED',
    #     description__icontains='MfnPostageFee'
    # ).values('id', 'total_amount')

    # for t in mfn_postage_txns:
    #     t_id = t['id']
    #     oid_val = tx_to_order.get(t_id)
    #     if not oid_val:
    #         continue
    #     tx_shipping_map[oid_val] = tx_shipping_map.get(oid_val, 0.0) + float(t['total_amount'] or 0)
    
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

    tx_shipping_map = {}

    # ------------------------------------------------------------
    # MFN SHIPPING
    # ------------------------------------------------------------
    mfn_postage_txns = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="ServiceFee",
        transaction_status="DEFERRED",
        description__icontains="MfnPostageFee",
    ).values("id", "total_amount")

    for txn in mfn_postage_txns:
        order_id = tx_to_order.get(txn["id"])
        if not order_id:
            continue

        tx_shipping_map[order_id] = (
            tx_shipping_map.get(order_id, 0.0)
            + float(txn["total_amount"] or 0)
        )

    # ------------------------------------------------------------
    # AFN / FBA SHIPPING
    # Shipment (DEFERRED)
    # Shipping + FBAWeightBasedFee
    # ------------------------------------------------------------

    afn_tx_ids = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="Shipment",
        transaction_status="DEFERRED",
    ).values_list("id", flat=True)

    afn_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=afn_tx_ids,
            breakdown_type__in=["FBAWeightBasedFee"],
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )

    for bd in afn_breakdowns:
        order_id = tx_to_order.get(bd["transaction_id"])
        if not order_id:
            continue

        tx_shipping_map[order_id] = (
            tx_shipping_map.get(order_id, 0.0)
            + float(bd["total"] or 0)
        )

    print(tx_shipping_map)
   
    print(tx_to_order)
    print(tx_shipping_map)        
    print("tx_shipping_map>>>>>>>>>>>>>>>>>>", tx_shipping_map)  

    # ---------------- BUILD RESPONSE ----------------
    results = []

    total_sales = total_profit = total_qty = 0
    total_ads = total_mpfees = total_shipping = 0
    total_gst = total_tcs = total_cost = 0
    total_net_sales = 0
    total_returns = 0
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

        adjusted_gross_sales = gross_sales + item_tax + shipping_price

        standard_cost = float(row.get("sku_standard_cost") or 0)

        cost = standard_cost * gross_qty

        f = finance_map.get(oid, {})

        refund = float(f.get('refund') or 0)

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

        tcs = (
            taxable_value *
            ((tcs_rate or float("1")) / float("100"))
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

        # ---------------- CALCULATIONS ----------------
        net_sales = adjusted_gross_sales

        shipping_final = shipping_income
        print("shipping_final>>>>>>>>>>>>>>>>",shipping_final)

        mp_gst = (estimated_fees + shipping_final) * 0.18

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

        exp_settlement = (
            net_sales
            - shipping_final
            - tcs
            - mp_gst
        )

        profit_margin = (profit / net_sales * 100) if net_sales else 0
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

            "gst": format_currency(0),
            "tcs": format_currency(tcs),
            "exp_settlement": format_currency(exp_settlement),
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
        total_new_charge += new_charge
        total_estimatefees += estimated_fees
        total_mp_gst += mp_gst
        total_taxable_value += taxable_value
        total_gst_payable += gst_to_pay_amount
        total_exp_settlement += exp_settlement

    print("totale ads spends", total_ads)

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
            "total_returns": total_returns,
            "total_ret_percent": f"{round((total_returns / total_qty * 100), 2) if total_qty else 0.0}%",

            "totalprofitmargin": round((total_profit / total_net_sales * 100), 2) if total_net_sales else 0,

            "adSpend": format_currency(total_ads),
            "mpfees": round(total_mpfees, 2),
            "mp_gst": format_currency(total_mp_gst),
            "estimatefees": format_currency(-abs(total_estimatefees)),
            "total_new_mpfees": format_currency(total_new_charge),
            "shipping": format_currency(total_shipping),
            "gst": format_currency(0),
            "tcs": format_currency(total_tcs),
            "cost": format_currency(total_cost),

            "taxable_value": format_currency(total_taxable_value),

            "gst_to_pay_amount": format_currency(total_gst_payable),

            "gst_to_pay_perc": f"{round((total_gst_payable / total_taxable_value * 100), 2) if total_taxable_value else 1}%",

            "exp_settlement": format_currency(total_exp_settlement),
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })


# ============================================================
# ⚠️ ACTION NEEDED BEFORE THIS RUNS CORRECTLY
# ============================================================
# This file assumes the order's fulfillment channel is available via:
#     row.get('order__fulfillment_channel')
#
# That field name is a GUESS. Open your Order (or OrderItem) model and
# find the actual field that stores FBA vs FBM — common names are:
#     fulfillment_channel, is_fba, ship_service_level, fulfillment_type
#
# Then update BOTH of these spots:
#   1. In the `.values(...)` call inside the `items` queryset — replace
#      'order__fulfillment_channel' with the correct related field path.
#   2. Inside the loop — replace
#      row.get('order__fulfillment_channel') with the same path.
#
# Also double check that AmazonTransactionContext.fulfillment_network is
# actually being populated as "AFN"/"MFN" by your sync job (see
# save_contexts() in transaction_sync.py, ctx.get("fulfillmentNetwork")) —
# if Amazon returns different strings for this field, adjust the
# AFN/MFN matching logic above accordingly.
# ============================================================




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



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def amazon_profitability_details_transactions_shipping(request):

    user = request.user
    data_source_raw = request.data if request.method == 'POST' else request.GET
    
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
            body_data = json.loads(request._request.body)
            if isinstance(body_data, dict):
                data_source.update(body_data)
        except: pass

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
    
    # Rest of pagination
    pagination = data_source.get("pagination", {})
    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))

    from_date = to_date = None
    def parse_dt(dt_str, is_end=False):
        if not dt_str or not isinstance(dt_str, (str, bytes, date, datetime)) or len(str(dt_str)) < 10: 
            return None
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
        except Exception:
            return None

    from_date = parse_dt(from_date_str, is_end=False)
    to_date = parse_dt(to_date_str, is_end=True)

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

    # ---------------- TRANSACTION SHIPPING FEES — MFN POSTAGE FEE ONLY ----------------
    # all_order_ids = [row['order__amazon_order_id'] for row in asin_orders]
    # tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
    #     identifier_name='ORDER_ID',
    #     identifier_value__in=all_order_ids
    # ).values('transaction_id', 'identifier_value')

    # tx_to_order = {
    #     item['transaction_id']: item['identifier_value']
    #     for item in tx_identifiers
    # }

    # tx_shipping_map = {}

    # # MFN shipping cost posts as its own ServiceFee transaction
    # # (description "MfnPostageFee") — only count RELEASED (settled) ones
    # # to avoid double-counting the DEFERRED version of the same fee.
    # mfn_postage_txns = AmazonTransaction.objects.filter(
    #     id__in=tx_to_order.keys(),
    #     transaction_type='ServiceFee',
    #     transaction_status='RELEASED',
    #     description__icontains='MfnPostageFee'
    # ).values('id', 'total_amount')

    # for t in mfn_postage_txns:
    #     t_id = t['id']
    #     oid = tx_to_order.get(t_id)
    #     if not oid:
    #         continue
    #     tx_shipping_map[oid] = tx_shipping_map.get(oid, float("0")) + float(str(t['total_amount'] or 0))
    
    
    matching_order_ids = [row['order__amazon_order_id'] for row in asin_orders]
    tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        identifier_name="ORDER_ID",
        identifier_value__in=matching_order_ids
    ).values("transaction_id", "identifier_value")

    tx_to_order = {
        row["transaction_id"]: row["identifier_value"]
        for row in tx_identifiers
    }

    tx_shipping_map = {}

    # ------------------------------------------------------------
    # MFN SHIPPING
    # ------------------------------------------------------------
    mfn_postage_txns = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="ServiceFee",
        transaction_status="DEFERRED",
        description__icontains="MfnPostageFee",
    ).values("id", "total_amount")

    for txn in mfn_postage_txns:
        order_id = tx_to_order.get(txn["id"])
        if not order_id:
            continue

        tx_shipping_map[order_id] = (
            tx_shipping_map.get(order_id, 0.0)
            + float(txn["total_amount"] or 0)
        )

    # ------------------------------------------------------------
    # AFN / FBA SHIPPING
    # Shipment (DEFERRED)
    # Shipping + FBAWeightBasedFee
    # ------------------------------------------------------------

    afn_tx_ids = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="Shipment",
        transaction_status="DEFERRED",
    ).values_list("id", flat=True)

    afn_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=afn_tx_ids,
            breakdown_type__in=["FBAWeightBasedFee"],
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )

    for bd in afn_breakdowns:
        order_id = tx_to_order.get(bd["transaction_id"])
        if not order_id:
            continue

        tx_shipping_map[order_id] = (
            tx_shipping_map.get(order_id, 0.0)
            + float(bd["total"] or 0)
        )
    print("tx_shipping_map",tx_shipping_map)
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
        pass # replaced below

        # ---------------- GST / TAXABLE ---------------

        # ==========================================================
        # GST / TAXABLE / TCS
        # ==========================================================

        gross_sales = float(str(row['grosssales'] or 0))

        item_tax = float(str(row.get('item_tax') or 0))

        promo_discount = float(
            str(row.get('promotion_discount') or 0)
        )

        orders = asin_map.get(parent_asin, [])
        tx_shipping_final = 0
        for o in orders:
            oid = o['order__amazon_order_id']
            tx_shipping_final += tx_shipping_map.get(oid, 0)
        shipping_price = tx_shipping_final
        
        
        print("estimated_fees before",estimated_fees)
        print("promo_discount >>>>>>>>>>>>",promo_discount)
        # estimated_fees += promo_discount   #update to remove to add in estimate 
        
        print("estimated_fees after ????????????????????",estimated_fees)
        
        

        # ----------------------------------------------------------
        # ADJUSTED SALES
        # ----------------------------------------------------------

        # adjusted_gross_sales = ( gross_sales + item_tax - promo_discount + shipping_price ) 
        adjusted_gross_sales = ( gross_sales + item_tax + shipping_price )

        # ----------------------------------------------------------
        # GST RATE
        # ----------------------------------------------------------

        gst_rate = float(str(row.get("sku_gst_rate") or 0))

        # ----------------------------------------------------------
        # TCS RATE
        # ----------------------------------------------------------

        tcs_rate = float(str(row.get("sku_tcs_rate") or 1))

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
        

        # adjusted_gross_sales = gross_sales + item_tax - promo_discount + shipping_price
        adjusted_gross_sales = gross_sales + item_tax + shipping_price 
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
                report_date__lte=to_date.date()
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

        # mp_gst = (net_sales + shipping_final) * 0.18   changes on 13 july
        mp_gst = (estimated_fees + shipping_final) * 0.18 

        

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
            "grosssales": format_currency(gross_sales),
            "netsales": format_currency(net_sales),
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
            "taxable_value": format_currency(total_taxable_value),

            "gst_to_pay_amount": format_currency(total_gst_payable),
            "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",
            "exp_settlement": format_currency(total_exp_settlement),
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })


# asin by parent asin working till 20May
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def amazon_profitability_parent(request):

#     user = request.user
#     data = request.data

#     filters = data.get("filters", {})
#     pagination = data.get("pagination", {})

#     page_no = int(pagination.get("pageNo", 0))
#     page_size = int(pagination.get("pageSize", 25))

#     # ---------------- DATE FILTER ----------------
#     from_date = to_date = None
#     try:
#         if filters.get("fromDate"):
#             from_date = timezone.make_aware(datetime.strptime(filters["fromDate"], "%Y-%m-%d"))
#         if filters.get("toDate"):
#             to_date = timezone.make_aware(datetime.strptime(filters["toDate"], "%Y-%m-%d")) + timedelta(days=1)
#     except Exception as e:
#         print("Date error:", e)

#     order_filter = Q(order__user=user)

#     # ---------------- CHANNEL FILTER ----------------
#     CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}
#     channels = filters.get("channel", {}).get("IN", [])

#     if channels:
#         marketplace_ids = [CHANNEL_MAP.get(ch) for ch in channels if CHANNEL_MAP.get(ch)]
#         order_filter &= Q(order__marketplace_id__in=marketplace_ids)

#     # ---------------- PARENT FILTER (IMPORTANT) ----------------
#     parent_ids = filters.get("parentproductid", {}).get("IN", [])
#     if not parent_ids:
#         return Response({
#             "status": False,
#             "message": "parentproductid is required"
#         })

#     order_filter &= Q(parent_asin__in=parent_ids)

#     # ---------------- DATE APPLY ----------------
#     if from_date:
#         order_filter &= Q(order__purchase_date__gte=from_date)
#     if to_date:
#         order_filter &= Q(order__purchase_date__lte=to_date)


#     # ---------------- CHILD ASIN DATA ----------------
#     items = (
#         OrderItem.objects
#         .filter(order_filter)
#         .exclude(order__order_status__icontains='Cancel')
#         .values('asin', 'parent_asin')
#         .annotate(
#             title=Max('title'),
#             seller_sku=Max('seller_sku'),
#             image_url=Max('image_url'),
#             grossqty=Sum('quantity_ordered'),
#             quantity_shipped=Sum('quantity_shipped'),
#             shipping_price=Sum('shipping_price'),
#             total_cost=Sum(F('cost_price') * F('quantity_ordered')),
#             grosssales=Sum('item_price'),
#             promotion_discount=Sum('promotion_discount'),
#             avg_cost=Avg('item_price'),
#             item_tax=Sum('item_tax'),
#         )
#     )


#     # ---------------- ESTIMATED FEES ----------------
#     estimated_fee_qs = AmazonEstimatedFee.objects.filter(
#         order_item__order__user=user
#     )

#     if from_date:
#         estimated_fee_qs = estimated_fee_qs.filter(
#             order_item__order__purchase_date__gte=from_date
#         )

#     if to_date:
#         estimated_fee_qs = estimated_fee_qs.filter(
#             order_item__order__purchase_date__lte=to_date
#         )

#     if channels:
#         estimated_fee_qs = estimated_fee_qs.filter(
#             order_item__order__marketplace_id__in=marketplace_ids
#         )

#     # estimated_fee_data = (
#     #     estimated_fee_qs
#     #     .values('asin')
#     #     .annotate(
#     #         estimated_fees=Sum('total_fees')
#     #     )
#     # )

#     estimated_fee_data = (
#         estimated_fee_qs
#         .values('asin')
#         .annotate(
#             estimated_fees=Sum('total_fees'),

#             referral_fee=Sum('referral_fee'),
#             closing_fee=Sum('closing_fee'),
#             per_item_fee=Sum('per_item_fee'),

#             fba_fee=Sum('fba_fee'),
#             fba_pick_pack_fee=Sum('fba_pick_pack_fee'),
#             fba_weight_handling_fee=Sum('fba_weight_handling_fee'),

#             tax_amount=Sum('tax_amount'),
#         )
#     )

#     # estimated_fee_map = {
#     #     row['asin']: Decimal(str(row['estimated_fees'] or 0))
#     #     for row in estimated_fee_data
#     # }


#     estimated_fee_map = {
#         row['asin']: {
#             "estimated_fees": Decimal(str(row['estimated_fees'] or 0)),

#             "referral_fee": Decimal(str(row['referral_fee'] or 0)),
#             "closing_fee": Decimal(str(row['closing_fee'] or 0)),
#             "per_item_fee": Decimal(str(row['per_item_fee'] or 0)),

#             "fba_fee": Decimal(str(row['fba_fee'] or 0)),
#             "fba_pick_pack_fee": Decimal(str(row['fba_pick_pack_fee'] or 0)),
#             "fba_weight_handling_fee": Decimal(str(row['fba_weight_handling_fee'] or 0)),

#             "tax_amount": Decimal(str(row['tax_amount'] or 0)),
#         }
#         for row in estimated_fee_data
#     }

#     # ---------------- FINANCE ----------------
#     finances_qs = FinancialEvent.objects.filter(user=user)

#     if from_date:
#         finances_qs = finances_qs.filter(posted_date__gte=from_date)
#     if to_date:
#         finances_qs = finances_qs.filter(posted_date__lte=to_date)

#     finance_data = (
#         finances_qs
#         .values('amazon_order_id')
#         .annotate(
#             refund=Sum('total_amount', filter=Q(event_group="REFUND")),
#             rto=Sum('total_amount', filter=Q(event_group="RTO")),
#             ads=Sum('total_amount', filter=Q(event_type__icontains='Ad')),
#             commission=Sum('commission_fee'),
#             fulfillment=Sum('fulfillment_fee'),
#             other_fee=Sum('other_fee'),
#             shipping_fee=Sum('shipping_fee'),
#         )
#     )

#     finance_map = {f['amazon_order_id']: f for f in finance_data}

#     # ---------------- RAW MAP ----------------
#     raw_map = FinancialEvent.objects.filter(user=user).exclude(raw_data=None).values('amazon_order_id', 'raw_data')

#     raw_data_map = {}
#     for r in raw_map:
#         raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])

#     # ---------------- ORDER MAP ----------------
#     asin_orders = (
#         OrderItem.objects
#         .filter(order_filter)
#         .values('asin', 'parent_asin', 'order__amazon_order_id', 'quantity_ordered')
#     )

#     asin_map = {}
#     for row in asin_orders:
#         asin_map.setdefault(row['asin'], []).append(row)

#     # ---------------- SKU MAP ----------------
#     sku_asin_map = {
#         normalize_sku(k): v
#         for k, v in OrderItem.objects.filter(order_filter).values_list('seller_sku', 'asin')
#     }

#     # ---------------- TRANSACTION SHIPPING FEES ----------------
    # all_order_ids = [row['order__amazon_order_id'] for row in asin_orders]
    # tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
    #     identifier_name='ORDER_ID',
    #     identifier_value__in=all_order_ids
    # ).values('transaction_id', 'identifier_value')
    
    # tx_to_order = {
    #     item['transaction_id']: item['identifier_value'] 
    #     for item in tx_identifiers
    # }
    
    # shipping_breakdowns = AmazonTransactionBreakdown.objects.filter(
    #     transaction_id__in=tx_to_order.keys(),
    #     breakdown_type__in=['Shipping', 'ShippingChargeback']
    # ).values('transaction_id').annotate(total=Sum('amount'))
    
    # tx_shipping_map = {}
    # for bd in shipping_breakdowns:
    #     t_id = bd['transaction_id']
    #     oid = tx_to_order[t_id]
    #     tx_shipping_map[oid] = tx_shipping_map.get(oid, 0) + float(bd['total'] or 0)

    # ---------------- BUILD RESPONSE ----------------


#     results = []

#     total_sales = total_profit = total_ads = Decimal(0)
#     total_net_sales = total_qty = Decimal(0)
#     total_returns = total_shipping = Decimal(0)
#     total_tcs = Decimal(0)
#     total_mpfees = Decimal(0)   
#     total_ret_percent = Decimal(0)  
#     total_stdcost = Decimal(0) 
#     adjusted_gross_sales = Decimal(0) 
#     total_estimatefees = Decimal(0)
#     total_mp_gst = Decimal(0)

#     total_taxable_value = Decimal(0)
#     total_gst_payable = Decimal(0)
#     total_exp_settlement = Decimal(0)

#     for row in items:

#         asin = row['asin']
#         parent_asin = row['parent_asin']
#         child_sku = row['seller_sku']
    
#         orders = asin_map.get(asin, [])
        
#         # estimated_fees = estimated_fee_map.get(asin, Decimal("0"))

#         fee_data = estimated_fee_map.get(asin, {})

#         estimated_fees = fee_data.get("estimated_fees", Decimal("0"))

#         referral_fee = fee_data.get("referral_fee", Decimal("0"))
#         closing_fee = fee_data.get("closing_fee", Decimal("0"))
#         per_item_fee = fee_data.get("per_item_fee", Decimal("0"))

#         fba_fee = fee_data.get("fba_fee", Decimal("0"))
#         fba_pick_pack_fee = fee_data.get("fba_pick_pack_fee", Decimal("0"))
#         fba_weight_handling_fee = fee_data.get("fba_weight_handling_fee", Decimal("0"))

#         tax_amount = fee_data.get("tax_amount", Decimal("0"))

#         gross_qty = Decimal(row['grossqty'] or 0)
#         gross_sales = Decimal(row['grosssales'] or 0)

#         item_tax = Decimal(row.get('item_tax') or 0)
#         promo_discount = Decimal(row.get('promotion_discount') or 0)

#         shipping_price = Decimal(row.get('shipping_price') or 0)

#         # ---------------- GST / TAXABLE ----------------

#         # Gross sales excluding GST
#         taxable_value = gross_sales

#         # GST collected from order
#         gst_to_pay_amount = item_tax

#         # GST %
#         gst_to_pay_perc = (
#             (gst_to_pay_amount / taxable_value) * 100
#             if taxable_value else Decimal("0")
#         )

#         # TCS = 1% of taxable value
#         tcs_total = gst_to_pay_amount * Decimal("0.01")

#         # adjusted_gross_sales = gross_sales + item_tax - promo_discount
#         adjusted_gross_sales = gross_sales + item_tax - promo_discount + shipping_price

#         refund = rto = ads = mpfees = shipping_fee = Decimal(0)
#         return_units = Decimal(0)
#         # tcs_total = Decimal(0)
#         t_new_charge = Decimal(0)

#         for o in orders:
#             oid = o['order__amazon_order_id']
#             qty = Decimal(o['quantity_ordered'] or 0)

#             f = finance_map.get(oid, {})

#             refund += Decimal(f.get('refund') or 0)
#             rto += Decimal(f.get('rto') or 0)
#             ads += Decimal(f.get('ads') or 0)

#             mpfees += (
#                 Decimal(f.get('commission') or 0) +
#                 Decimal(f.get('fulfillment') or 0) +
#                 Decimal(f.get('other_fee') or 0)
#             )

#             shipping_fee += Decimal(f.get('shipping_fee') or 0)

#             order_fee_map = extract_fees_and_tcs_per_asin(
#                 raw_data_map.get(oid, []),
#                 sku_asin_map=sku_asin_map
#             )

#             if asin in order_fee_map:
#                 t_new_charge += Decimal(order_fee_map[asin]["fee"])
#                 # tcs_total += Decimal(order_fee_map[asin]["tcs"])

#             r = Decimal(f.get('refund') or 0)
#             rto_amt = Decimal(f.get('rto') or 0)

#             refund += r
#             rto += rto_amt

#             # total_estimatefees += estimated_fees

#             if r < 0 or rto_amt < 0:
#                 return_units += qty

#         # net_qty = max(gross_qty - return_units, 0)
#         net_qty = max(gross_qty , 0)
#         # net_sales = gross_sales + refund + rto
#         net_sales = adjusted_gross_sales
#         # total_estimatefees += estimated_fees
#         shipping_final = Decimal(row['shipping_price'] or 0)

#         # mp_gst = (net_sales + shipping_final) * 0.18
       

#         mp_gst = (net_sales + shipping_final) * Decimal("0.18")
        
#         # total_cost = Decimal(row['total_cost'] or 0)

#         total_cost = Decimal(50) * net_qty

#         # profit = net_sales + t_new_charge + shipping_final - total_cost + tcs_total
#         # profit = net_sales - estimated_fees - shipping_final - tcs_total + mp_gst - total_cost
#         profit = (
#             net_sales
#             - estimated_fees
#             - shipping_final
#             + tcs_total
#             + mp_gst
#             - total_cost
#         )

#         exp_settlement = (
#             profit
#             - total_cost
#             - tcs_total
#             - mp_gst
#         )
#         profit_margin = (profit / net_sales * 100) if net_sales else 0

#         ret_percent = (return_units / net_qty * 100) if net_qty else 0
        

#         results.append({
#             "asin": asin,
#             "parent_asin": parent_asin,
#             "name": row['title'],
#             "child_sku": clean_sku(child_sku),
#             "image_url": row['image_url'],
#             "channel": "Amazon-India",
#             "channel1": "Amazon-India",

#             "grossqty": int(gross_qty),
#             "netqty": int(net_qty),

#             "grosssales": format_currency(gross_sales),
#             "netsales": format_currency(net_sales),

#             "ads": format_currency(ads),
#             "mp_gst": format_currency(mp_gst),
#             "new_mpfees": format_currency(t_new_charge),
         
#             "estimatefees": format_currency(-abs(estimated_fees)),
#             "referral_fee": format_currency(referral_fee),
#             "closing_fee": format_currency(closing_fee),
#             "per_item_fee": format_currency(per_item_fee),

#             "fba_fee": format_currency(fba_fee),
#             "fba_pick_pack_fee": format_currency(fba_pick_pack_fee),
#             "fba_weight_handling_fee": format_currency(fba_weight_handling_fee),

#             "tax_amount": format_currency(tax_amount),
#             "shippingfees": format_currency(shipping_final),
#             "tcs": format_currency(tcs_total),

#             "profit": format_currency(profit),
#             "grossprofitper": round(profit_margin, 2),
#             "retpercent": round(ret_percent, 2),
#             "returnqty": int(return_units),
#             # "tacos": round(tacos, 2),
#             # "gst": format_currency(tcs_total),
#             "gst": format_currency(0),

#             "taxable_value": format_currency(taxable_value),
#             "gst_to_pay_amount": format_currency(gst_to_pay_amount),
#             "gst_to_pay_perc": round(gst_to_pay_perc, 2),
#             "exp_settlement": format_currency(exp_settlement),

#             "id": asin,
#             "stdcost": format_currency(total_cost),
#             "redirecturl": f"https://www.amazon.in/dp/{asin}" if asin else None,
#         })


#         total_sales += gross_sales
#         total_net_sales += net_sales
#         total_profit += profit
#         total_ads += ads
#         total_qty += net_qty
#         total_returns += return_units
#         total_shipping += shipping_final
#         total_tcs += tcs_total
#         total_mpfees += t_new_charge
#         total_ret_percent += ret_percent
#         total_stdcost += total_cost
#         total_estimatefees += Decimal(estimated_fees)
#         total_mp_gst += mp_gst
#         total_taxable_value += taxable_value
#         total_gst_payable += gst_to_pay_amount
#         total_exp_settlement += exp_settlement

#     return Response({
#         "status": True,
#         "message": "Success",
#         "pagination": {
#             "pageNo": page_no,
#             "pageSize": page_size,
#             "count": len(results)
#         },
#         "totals": {
#             "ads": format_currency(total_ads),
#             "netqty": total_qty,
#             "totalreturn": total_returns,
#             "totalreturnper": f"{round(total_ret_percent, 2)}%",
#             "grosssales": format_currency(total_sales),
#             "netsales": format_currency(total_net_sales),
#             "profit": format_currency(total_profit),
#             "grossprofitper": round((total_profit / total_net_sales * 100), 2) if total_net_sales else 0,
#             "mpfees": format_currency(total_mpfees),
#              "mp_gst": format_currency(total_mp_gst),
#             # "estimatefees": format_currency(total_estimatefees),
#             "estimatefees": format_currency(-abs(total_estimatefees)),
#             "total_new_mpfees": format_currency(total_mpfees),
#             "shippingfees": format_currency(total_shipping),
#             "tacos": (total_ads / total_sales * 100) if total_sales else 0,
#             "stdcost": format_currency(total_stdcost),
#             # "totalgst": format_currency(total_tcs),
#             "totalgst": format_currency(0),
#             "tcs": format_currency(total_tcs),
#             "taxable_value": format_currency(total_taxable_value),

#             "gst_to_pay_amount": format_currency(total_gst_payable),
#             "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",

#             "exp_settlement": format_currency(total_exp_settlement),
#         },
#         "response": results[page_no * page_size:(page_no + 1) * page_size]
#     })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sku_profitability_list_filtered(request):

    user = request.user
    data = request.data

    filters = data.get("filters", {})

    profit_filter = filters.get("profit_filter")

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

    # No parent filter needed for SKU list

    # ---------------- DATE APPLY ----------------
    if from_date:
        order_filter &= Q(order__purchase_date__gte=from_date)
    if to_date:
        order_filter &= Q(order__purchase_date__lte=to_date)


    # ============================================================
    # ITEMS QUERY WITH SKU LEVEL GST / COST / TCS
    # ============================================================

    listing_qs = AmazonListingItem.objects.filter(
        user=user,
        sku=OuterRef("seller_sku")
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
            'seller_sku',
            'seller_sku',

            # SKU DATA
            'sku_standard_cost',
            'sku_gst_rate',
            'sku_tcs_rate',
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
        .values('asin', 'seller_sku', 'order__amazon_order_id', 'quantity_ordered')
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

    
 
    # ---------------- TRANSACTION SHIPPING FEES — MFN POSTAGE FEE ONLY ----------------
    # ---------------- TRANSACTION SHIPPING FEES — MFN POSTAGE FEE ONLY ----------------
    all_order_ids = [row['order__amazon_order_id'] for row in asin_orders]
    tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        identifier_name='ORDER_ID',
        identifier_value__in=all_order_ids
    ).values('transaction_id', 'identifier_value')

    tx_to_order = {
        item['transaction_id']: item['identifier_value']
        for item in tx_identifiers
    }

    tx_shipping_map = {}

    # MFN shipping cost posts as its own ServiceFee transaction
    # (description "MfnPostageFee") — only count RELEASED (settled) ones
    # to avoid double-counting the DEFERRED version of the same fee.
    mfn_postage_txns = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type='ServiceFee',
        transaction_status='RELEASED',
        description__icontains='MfnPostageFee'
    ).values('id', 'total_amount')

    for t in mfn_postage_txns:
        t_id = t['id']
        oid = tx_to_order.get(t_id)
        if not oid:
            continue
        tx_shipping_map[oid] = tx_shipping_map.get(oid, Decimal("0")) + Decimal(str(t['total_amount'] or 0))
        
    t = AmazonTransaction.objects.filter(id=3140).values('id', 'transaction_type', 'transaction_status', 'description', 'total_amount').first()
    print("direct lookup:", t)    
        
    print("all_order_ids sample:", "403-1212366-4156345" in all_order_ids)
    print("tx_to_order:", tx_to_order)
    print("mfn_postage_txns:", list(mfn_postage_txns))
    print("tx_shipping_map:", tx_shipping_map)    

    # ---------------- BUILD RESPONSE ----------------
    results = []

    total_sales = total_profit = total_ads = Decimal(0)
    total_net_sales = total_qty = Decimal(0)
    total_returns = total_shipping = Decimal(0)
    total_tcs = Decimal(0)
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
        seller_sku = row['seller_sku']
        parent_asin = row.get('parent_asin')
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

        tx_shipping_final = Decimal("0")
        for o in orders:
            oid = o['order__amazon_order_id']
            tx_shipping_final += tx_shipping_map.get(oid, Decimal("0"))
        shipping_price = tx_shipping_final
        
        
        # estimated_fees += promo_discount #currently not use this 

        # ---------------- GST / TAXABLE ----------------

        # # Gross sales excluding GST
        # taxable_value = gross_sales

        # # GST collected from order
        # gst_to_pay_amount = item_tax

        # # GST %
        # gst_to_pay_perc = (
        #     (gst_to_pay_amount / taxable_value) * 100
        #     if taxable_value else Decimal("0")
        # )

        # # TCS = 1% of taxable value
        # tcs_total = gst_to_pay_amount * Decimal("0.01")

        # # adjusted_gross_sales = gross_sales + item_tax - promo_discount
        # adjusted_gross_sales = gross_sales + item_tax - promo_discount + shipping_price

        # ------------------------------------------------------------
        # ADJUSTED SALES
        # ------------------------------------------------------------

        # adjusted_gross_sales = (
        #     gross_sales
        #     + item_tax
        #     - promo_discount
        #     + shipping_price
        # )
        adjusted_gross_sales = (
            gross_sales
            + item_tax
         
            + shipping_price
        )

        # ------------------------------------------------------------
        # SKU GST / TCS
        # ------------------------------------------------------------

        gst_rate = Decimal(str(row.get("sku_gst_rate") or 0))
        tcs_rate = Decimal(str(row.get("sku_tcs_rate") or 0))

        # ------------------------------------------------------------
        # TAXABLE VALUE
        # GST INCLUDED SALES -> REMOVE GST
        # ------------------------------------------------------------

        if gst_rate > 0:

            taxable_value = (
                adjusted_gross_sales / (1 + (gst_rate / 100))
            )
            gst_to_pay_amount = adjusted_gross_sales - taxable_value
            
            # taxable_value = gross_sales

        else:

            taxable_value = gross_sales
            gst_to_pay_amount = item_tax

        # ------------------------------------------------------------
        # GST TO PAY
        # ------------------------------------------------------------

        # gst_to_pay_amount = (
        #     adjusted_gross_sales - taxable_value
        # )

        # ------------------------------------------------------------
        # TCS
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

        # ------------------------------------------------------------
        # GST %
        # ------------------------------------------------------------

        # gst_to_pay_perc = gst_rate
        
        if gst_rate:
            gst_to_pay_perc = gst_rate

        else:
          
            gst_to_pay_perc = (
                (gst_to_pay_amount / taxable_value) * 100
                if taxable_value else 1
            )  




        refund = rto = mpfees = shipping_fee = Decimal(0)
        return_units = Decimal(0)
        # tcs_total = Decimal(0)
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
            # ads += Decimal(f.get('ads') or 0)

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
                # tcs_total += Decimal(order_fee_map[asin]["tcs"])

            r = Decimal(f.get('refund') or 0)
            rto_amt = Decimal(f.get('rto') or 0)

            refund += r
            rto += rto_amt

            # total_estimatefees += estimated_fees

            if r < 0 or rto_amt < 0:
                return_units += qty

        # net_qty = max(gross_qty - return_units, 0)
        net_qty = max(gross_qty , 0)
        # net_sales = gross_sales + refund + rto
        net_sales = adjusted_gross_sales
        # total_estimatefees += estimated_fees
        shipping_final = shipping_price

        # mp_gst = (net_sales + shipping_final) * 0.18
       

        # mp_gst = (net_sales + shipping_final) * Decimal("0.18")  update on 13 july
        mp_gst = (estimated_fees + shipping_final) * Decimal("0.18")
        
        # total_cost = Decimal(row['total_cost'] or 0)

        # total_cost = Decimal(50) * net_qty
        
        standard_cost = Decimal(
            str(row.get("sku_standard_cost") or 0)
        )

        total_cost = standard_cost * net_qty

        # profit = net_sales + t_new_charge + shipping_final - total_cost + tcs_total
        # profit = net_sales - estimated_fees - shipping_final - tcs_total + mp_gst - total_cost
        
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

        # exp_settlement = (
        #     profit
        #     - total_cost
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

        tacos = (
            (abs(ads) / gross_sales) * 100
            if gross_sales else 0
        )

        ret_percent = (return_units / net_qty * 100) if net_qty else 0
        

        if profit_filter == "GT_0" and profit <= 0:
            continue
        if profit_filter == "LT_0" and profit >= 0:
            continue

        results.append({
            "asin": asin,
            "parent_asin": parent_asin,
            "name": row['title'],
            "child_sku": clean_sku(child_sku),
            # "child_sku": row['child_sku'],
            "image_url": row['image_url'],
            "channel": "Amazon-India",
            "channel1": "Amazon-India",

            "grossqty": int(gross_qty),
            "netqty": int(net_qty),

            "grosssales": format_currency(gross_sales),
            "netsales": format_currency(net_sales),

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

            "profit": format_currency(profit),
            "grossprofitper": round(profit_margin, 2),
            "retpercent": round(ret_percent, 2),
            "returnqty": int(return_units),
            # "tacos": round(tacos, 2),
            # "gst": format_currency(tcs_total),
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
            "taxable_value": format_currency(total_taxable_value),

            "gst_to_pay_amount": format_currency(total_gst_payable),
            "gst_to_pay_perc":f"{round((total_gst_payable / total_taxable_value * 100),2) if total_taxable_value else 1}%",

            "exp_settlement": format_currency(total_exp_settlement),
        },
        "response": results[page_no * page_size:(page_no + 1) * page_size]
    })




# workinng till may 20
# 