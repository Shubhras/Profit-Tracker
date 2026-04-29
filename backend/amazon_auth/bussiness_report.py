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
from django.http import HttpResponse
from openpyxl import Workbook




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_daily_business_report(request):
    user = request.user
    start_date = request.data.get("start_date")
    end_date = request.data.get("end_date")

    # ✅ Validate input
    if not start_date or not end_date:
        return JsonResponse({
            "status": "error",
            "message": "start_date and end_date are required"
        }, status=400)

    accounts = AmazonAccount.objects.filter(user=user)

    if not accounts.exists():
        return JsonResponse({
            "status": "error",
            "message": "No Amazon accounts found"
        }, status=404)

    results = []

    for acc in accounts:
        try:
            # 🔁 Retry once (important)
            try:
                sync_business_report(acc, start_date, end_date)
            except Exception as first_error:
                print(f"Retrying for {acc.seller_central_id}...")
                sync_business_report(acc, start_date, end_date)

            results.append({
                "account": acc.seller_central_id,
                "status": "success"
            })

        except Exception as e:
            error_msg = str(e)

            # 🚨 Detect common issues
            if "403" in error_msg or "Session expired" in error_msg:
                error_type = "SESSION_EXPIRED"
            elif "Invalid JSON" in error_msg or "<html" in error_msg:
                error_type = "AUTH_BLOCKED"
            elif "selection_required" in error_msg:
                error_type = "INVALID_PAYLOAD"
            else:
                error_type = "UNKNOWN_ERROR"

            results.append({
                "account": acc.seller_central_id,
                "status": "failed",
                "error_type": error_type,
                "error": error_msg
            })

    return JsonResponse({
        "status": "completed",
        "total_accounts": accounts.count(),
        "results": results
    })


def sync_business_report(account, start_date, end_date):
    url = "https://sellercentral.amazon.in/business-reports/api"


    payload = {
        "operationName": "reportDataQuery",
        "variables": {
            "input": {
                "legacyReportId": "102:SalesTrafficTimeSeries",
                "granularity": "DAY",
                "startDate": start_date,
                "endDate": end_date,

                # 🔥 REQUIRED
                "page": 0,
                "size": 1000,

                "userSelectedRows": [
                    {
                        "dimension": "date"
                    }
                ],

                "selectedColumns": [
                    "SC_MA_Date_25913",
                    "SC_MA_OrderedProductSales_40591",
                    "SC_MA_UnitsOrdered_40590",
                    "SC_MA_TotalOrderItems_1",
                    "SC_MA_Sessions_Total",
                    "SC_MA_OrderItemSessionPercentage_1",
                    "SC_MA_UnitsRefunded_25980",
                    "SC_MA_RefundRate_25981",
                ]
            }
        },
        "query": """
        query reportDataQuery($input: GetReportDataInput) {
        getReportData(input: $input) {
            granularity
            hadPrevious
            hasNext
            size
            startDate
            endDate
            page
            columns {
            label
            valueFormat
            isGraphable
            translationKey
            }
            rows
        }
        }
        """
    }


    # payload = {
    #     "operationName": "reportDataQuery",
    #     "variables": {
    #         "input": {
    #             "legacyReportId": "102:SalesTrafficTimeSeries",
    #             "granularity": "DAY",
    #             "startDate": start_date,
    #             "endDate": end_date,

    #             # IMPORTANT
    #             "userSelectedRows": [],

    #             "selectedColumns": [
    #                 "SC_MA_Date_25913",
    #                 "SC_MA_OrderedProductSales_40591",
    #                 "SC_MA_UnitsOrdered_40590",
    #                 "SC_MA_TotalOrderItems_1",
    #                 "SC_MA_Sessions_Total",
    #                 "SC_MA_OrderItemSessionPercentage_1",
    #                 "SC_MA_UnitsRefunded_25980",
    #                 "SC_MA_RefundRate_25981",
    #             ]
    #         }
    #     },
    #     "query": """
    #     query reportDataQuery($input: GetReportDataInput) {
    #         getReportData(input: $input) {
    #             columns { label }
    #             rows
    #         }
    #     }
    #     """
    # }

    headers = {
        "cookie": account.ads_cookie,
        "x-csrf-token": account.csrf_token,
        "content-type": "application/json",
        "accept": "application/json",
        "origin": "https://sellercentral.amazon.in",
        "referer": "https://sellercentral.amazon.in/business-reports",
        "user-agent": "Mozilla/5.0",
        "x-requested-with": "XMLHttpRequest",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
    }

    # ✅ NOW safe
    # headers.update({
    #     "x-amz-rid": "S6XAW2NJ2V8SPPXPHGFC",
    #     "x-amz-request-id": "5Vxtd-7ZEgIJ_2McIjHoZTRKzu6kUuM2zv2JGmlB2sR2tLDjjQ5JwA==",
    #     "accept-language": "en-IN,en;q=0.9",
    #     "sec-ch-ua": "Chromium",
    # })

    # headers.update({
    #     "x-amz-rid": "6785M6VVZFXC7DASNSXG",
    #     "x-amz-request-id": "random",
    #     "accept-encoding": "zstd,gzip, deflate, br",
    #     "connection": "keep-alive",
    # })

    res = requests.post(url, json=payload, headers=headers)

    print("STATUS:", res.status_code)
    print("BODY:", res.text[:300])

    # 🚨 HTML = blocked / login page
    if "<html" in res.text.lower():
        raise Exception("Session expired / invalid cookie / blocked by Amazon")

    try:
        json_data = res.json()
    except Exception:
        raise Exception(f"Invalid JSON response: {res.text[:300]}")

    # 🚨 Handle Amazon errors properly
    if "data" not in json_data:
        raise Exception(f"Unexpected response: {json_data}")

    report = json_data["data"].get("getReportData")

    if not report:
        raise Exception(f"Empty report data: {json_data}")

    columns = [col["label"] for col in report["columns"]]

    # ✅ SAFE converters
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

    # ✅ PROCESS DATA
    for row in report["rows"]:
        try:
            row_dict = dict(zip(columns, row))

            date = datetime.utcfromtimestamp(int(row_dict["Date"])).date()

            BusinessReport.objects.update_or_create(
                amazon_account=account,
                date=date,
                defaults={
                    "user": account.user,
                    "ordered_product_sales": to_float(row_dict.get("Ordered Product Sales")),
                    "units_ordered": to_int(row_dict.get("Units Ordered")),
                    "total_order_items": to_int(row_dict.get("Total Order Items")),
                    "sessions_total": to_int(row_dict.get("Sessions - Total")),
                    "order_item_session_percentage": to_float(row_dict.get("Order Item Session Percentage")),
                    "units_refunded": to_int(row_dict.get("Units Refunded")),
                    "refund_rate": to_float(row_dict.get("Refund Rate")),
                }
            )

        except Exception as e:
            print("Row error:", e)
            continue

    return {"status": "success"}


def get_spapi_headers(account):
    """
    Build SP-API headers using stored tokens.
    (Simple version - assumes LWA token already stored)
    """

    if not account.access_token:
        raise Exception("Missing LWA access token")

    return {
        "Authorization": f"Bearer {account.access_token}",
        "x-amz-access-token": account.access_token,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def sync_reports_for_account(request, account, report_type=None, marketplace_id=None):
    sp = SPAPIManager(user=request.user, account=account)

    params = {
        "pageSize": 10
    }

    if report_type:
        params["reportTypes"] = [report_type]

    if marketplace_id:
        params["marketplaceIds"] = [marketplace_id]

    response = sp.request(
        "GET",
        "/reports/2021-06-30/reports",
        params=params
    )

    data = response

    created_or_updated = []

    for r in data.get("reports", []):
        report, created = AmazonReport.objects.update_or_create(
            account=account,
            report_id=r["reportId"],
            defaults={
                "report_type": r.get("reportType"),
                "marketplace_id": marketplace_id or account.marketplace_id,
                "processing_status": r.get("processingStatus"),
                "created_time": r.get("createdTime"),
                "data_start_time": r.get("dataStartTime"),
                "data_end_time": r.get("dataEndTime"),
                "report_document_id": r.get("reportDocumentId"),
            }
        )

        created_or_updated.append(report.report_id)

    return {
        "total": len(created_or_updated),
        "report_ids": created_or_updated
    }
@api_view(["POST"])
@permission_classes([IsAuthenticated])


def manual_sync_amazon_reports(request):

    account_id = request.data.get("account_id")
    report_type = request.data.get("report_type")
    marketplace_id = request.data.get("marketplace_id")

    accounts = AmazonAccount.objects.filter(user=request.user)

    if account_id:
        accounts = accounts.filter(id=account_id)

    if not accounts.exists():
        return Response({"error": "No account found"}, status=404)

    results = []

    for account in accounts:
        try:
            result = sync_reports_for_account(account, report_type, marketplace_id,request)
            results.append({
                "account": account.seller_central_id,
                "status": "success",
                "data": result
            })

        except Exception as e:
            results.append({
                "account": account.seller_central_id,
                "status": "failed",
                "error": str(e)
            })

    return Response({
        "status": "completed",
        "results": results
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_business_report_excel(request):
    user = request.user

    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")

    if not start_date or not end_date:
        return HttpResponse("start_date and end_date required", status=400)

    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    except:
        return HttpResponse("Invalid date format. Use YYYY-MM-DD", status=400)

    queryset = BusinessReport.objects.filter(
        user=user,
        date__range=[start_date, end_date]
    ).order_by("date")

    # ✅ Create Excel
    wb = Workbook()
    ws = wb.active
    ws.title = "Business Report"

    # ✅ Headers
    headers = [
        "Date", "Parent ASIN", "Child ASIN", "Title",

        "Ordered Sales", "Ordered Sales B2B",
        "Units Ordered", "Units Ordered B2B",
        "Total Orders", "Total Orders B2B",

        "Sessions", "Sessions B2B",
        "Page Views", "Page Views B2B",

        "Mobile Sessions", "Browser Sessions",
        "Mobile Page Views", "Browser Page Views",

        "Session %", "Page Views %",

        "Unit Session %", "Unit Session % B2B",
        "Buy Box %", "Buy Box % B2B",

        "Units Refunded", "Refund Rate",

        "Units Shipped", "Orders Shipped", "Shipped Sales",
    ]

    ws.append(headers)

    # ✅ Data rows
    for obj in queryset:
        ws.append([
            obj.date,
            obj.parent_asin,
            obj.child_asin,
            obj.title,

            float(obj.ordered_product_sales),
            float(obj.ordered_product_sales_b2b),

            obj.units_ordered,
            obj.units_ordered_b2b,

            obj.total_order_items,
            obj.total_order_items_b2b,

            obj.sessions_total,
            obj.sessions_total_b2b,

            obj.page_views_total,
            obj.page_views_total_b2b,

            obj.sessions_mobile_app,
            obj.sessions_browser,

            obj.page_views_mobile_app,
            obj.page_views_browser,

            obj.session_percentage_total,
            obj.page_views_percentage_total,

            obj.unit_session_percentage,
            obj.unit_session_percentage_b2b,

            obj.buy_box_percentage,
            obj.buy_box_percentage_b2b,

            obj.units_refunded,
            obj.refund_rate,

            obj.units_shipped,
            obj.orders_shipped,
            float(obj.shipped_product_sales),
        ])

    # ✅ Response
    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response["Content-Disposition"] = f'attachment; filename=business_report_{start_date}_to_{end_date}.xlsx'

    wb.save(response)
    return response