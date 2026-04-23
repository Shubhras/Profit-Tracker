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

# def sync_business_report(account, start_date, end_date):
#     url = "https://sellercentral.amazon.in/business-reports/api"

#     payload = {
#         "operationName": "getReportData",
#         "variables": {
#             "input": {
#                 "legacyReportId": "102:SalesTrafficTimeSeries",
#                 "granularity": "DAY",
#                 "startDate": start_date,
#                 "endDate": end_date,

#                 #  REQUIRED FIX
#                 "userSelectedRows": [],

#                 "selectedColumns": [
#                     "SC_MA_Date_25913",
#                     "SC_MA_OrderedProductSales_40591",
#                     "SC_MA_UnitsOrdered_40590",
#                     "SC_MA_TotalOrderItems_1",
#                     "SC_MA_Sessions_Total",
#                     "SC_MA_OrderItemSessionPercentage_1",
#                     "SC_MA_UnitsRefunded_25980",
#                     "SC_MA_RefundRate_25981",
#                 ]
#             }
#         },
#         "query": """
#         query getReportData($input: GetReportDataInput) {
#         getReportData(input: $input) {
#             columns {
#             label
#             }
#             rows
#         }
#         }
#         """
#     }

#     headers = {
#         "cookie": account.ads_cookie,
#         "x-csrf-token": account.csrf_token,
#         "content-type": "application/json",
#         "user-agent": "Mozilla/5.0",
#         "accept": "application/json",
#         "origin": "https://sellercentral.amazon.in",
#         "referer": "https://sellercentral.amazon.in/business-reports",
#     }

#     res = requests.post(url, json=payload, headers=headers)

#     print("STATUS:", res.status_code)
#     print("BODY:", res.text[:300])

#     # 🚨 Detect HTML (auth issue)
#     if "<html" in res.text.lower():
#         raise Exception("Session expired / invalid cookie / blocked by Amazon")

#     try:
#         json_data = res.json()
#     except Exception:
#         raise Exception(f"Invalid JSON response: {res.text[:300]}")

#     if "data" not in json_data:
#         raise Exception(f"Unexpected response: {json_data}")

#     report = json_data["data"]["getReportData"]

#     columns = [col["label"] for col in report["columns"]]

#     for row in report["rows"]:
#         row_dict = dict(zip(columns, row))

#         date = datetime.utcfromtimestamp(int(row_dict["Date"])).date()

#         BusinessReport.objects.update_or_create(
#             amazon_account=account,
#             date=date,
#             defaults={
#                 "user": account.user,
#                 "ordered_product_sales": float(row_dict.get("Ordered Product Sales") or 0),
#                 "units_ordered": int(row_dict.get("Units Ordered") or 0),
#                 "total_order_items": int(row_dict.get("Total Order Items") or 0),
#                 "sessions_total": int(row_dict.get("Sessions - Total") or 0),
#                 "order_item_session_percentage": float(row_dict.get("Order Item Session Percentage") or 0),
#                 "units_refunded": int(row_dict.get("Units Refunded") or 0),
#                 "refund_rate": float(row_dict.get("Refund Rate") or 0),
#             }
#         )

#     return {"status": "success"}


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




# amazon report 


import requests
import time
import hashlib
import hmac
import base64


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


from datetime import datetime, timedelta

from datetime import datetime, timedelta
import requests
# from amazon_auth.spapi_manager.SPAPIManager import get_access_token
from amazon_auth.spapi_manager import SPAPIManager



# def get_access_token(self):
#     cache_key = f"lwa_token_{self.app_client_id}"

#     token = cache.get(cache_key)
#     if token:
#         return token

#     url = "https://api.amazon.com/auth/o2/token"

#     payload = {
#         # "grant_type": "refresh_token",
#         # "refresh_token": self.refresh_token,
#         "client_id": self.app_client_id,
#         "client_secret": self.app_client_secret,
#     }

#     res = requests.post(url, data=payload)

#     if res.status_code != 200:
#         raise Exception(res.text)

#     data = res.json()

#     cache.set(cache_key, data["access_token"], timeout=3500)

#     return data["access_token"]

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