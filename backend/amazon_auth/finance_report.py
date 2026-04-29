import requests
from django.conf import settings


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.dateparse import parse_datetime
from .models import *
from .utils import normalize_financial_events


class AmazonFinancesClient:

    # BASE_URL = "https://sellingpartnerapi-na.amazon.com"
    BASE_URL = "https://sellingpartnerapi-eu.amazon.com"

    def __init__(self, access_token):
        self.access_token = access_token

    def _headers(self):
        return {
            "accept": "application/json",
            "x-amz-access-token": self.access_token
        }

    def get_financial_events_by_order(self, order_id, next_token=None):
        url = f"{self.BASE_URL}/finances/v0/orders/{order_id}/financialEvents"

        params = {
            "MaxResultsPerPage": 100
        }

        if next_token:
            params["NextToken"] = next_token

        response = requests.get(url, headers=self._headers(), params=params)
        return response.json()
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .spapi_manager import SPAPIManager


class OrderFinancialEventsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):

        try:
            # 🔥 USE YOUR EXISTING MANAGER
            sp = SPAPIManager(user=request.user)

            all_data = {}
            next_token = None

            while True:
                response = sp.get_order_financial_events(
                    order_id=order_id,
                    max_results=100,
                    next_token=next_token
                )

                payload = response.get("payload", {})
                events = payload.get("FinancialEvents", {})

                # merge safely
                for key, value in events.items():
                    if key not in all_data:
                        all_data[key] = []
                    all_data[key].extend(value or [])

                next_token = payload.get("NextToken")

                if not next_token:
                    break

            return Response({
                "status": "success",
                "order_id": order_id,
                "data": all_data
            })

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=500)
        



# for second 

import requests
import csv
from io import StringIO
import requests
import csv
from io import StringIO


def safe_float(val):
    try:
        return float(val)
    except (TypeError, ValueError):
        return 0.0
    

import requests
import csv
import gzip
from io import StringIO, BytesIO


def normalize_key(row, key):
    for k in row.keys():
        if k.replace("-", "").lower() == key.replace("-", "").lower():
            return row.get(k)
    return None

def parse_settlement_report(download_url):
    res = requests.get(download_url)

    if res.headers.get("Content-Encoding") == "gzip" or download_url.endswith(".gz"):
        buffer = BytesIO(res.content)
        with gzip.GzipFile(fileobj=buffer) as f:
            content = f.read().decode("utf-8")
    else:
        content = res.content.decode("utf-8")

    reader = csv.DictReader(StringIO(content), delimiter="\t")

    data = []

    for row in reader:
        order_id = row.get("order-id")

        if not order_id:
            continue

        data.append({
            "order_id": order_id,

            # SALES
            "price_type": row.get("price-type"),
            "price_amount": safe_float(row.get("price-amount")),

            # FEES
            "fee_type": row.get("item-related-fee-type"),
            "fee_amount": safe_float(row.get("item-related-fee-amount")),

            "order_fee": safe_float(row.get("order-fee-amount")),
            "shipping_fee": safe_float(row.get("shipment-fee-amount")),

            # PROMO / OTHER
            "promotion": safe_float(row.get("promotion-amount")),
            "other": safe_float(row.get("other-amount")),
        })

    return data


def build_profit_summary(rows):
    summary = {}

    for row in rows:
        order_id = row.get("order_id")
        if not order_id:
            continue

        if order_id not in summary:
            summary[order_id] = {
                "sales": 0.0,
                "fees": 0.0,
                "refunds": 0.0,
                "tax": 0.0,
                "shipping": 0.0,
                "net": 0.0
            }

        price_type = (row.get("price_type") or "").strip().lower()
        price = row.get("price_amount", 0)

        # ✅ SALES
        if "principal" in price_type:
            summary[order_id]["sales"] += price

        # ✅ TAX (exclude TCS)
        elif "tax" in price_type and "tcs" not in price_type:
            summary[order_id]["tax"] += price

        # ✅ REFUND
        elif "refund" in price_type:
            summary[order_id]["refunds"] += price

        # ✅ TCS = deduction
        elif "tcs" in price_type:
            summary[order_id]["fees"] += price

        # ✅ FEES (all combined)
        summary[order_id]["fees"] += (
            row.get("fee_amount", 0)
            + row.get("order_fee", 0)
            + row.get("shipping_fee", 0)
            + row.get("promotion", 0)
            + row.get("other", 0)
        )

    # NET
    for order_id, val in summary.items():
        val["net"] = (
            val["sales"]
            + val["tax"]
            + val["fees"]
            + val["refunds"]
        )

    return summary
# specific order  
# class SettlementReportView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, order_id):

#         try:
#             sp = SPAPIManager(user=request.user)

#             # Step 1: Create report
#             # ✅ Step 1: Get existing settlement reports
#             reports = sp.get_reports(
#                 reportTypes=["GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE"],
#                 processingStatuses=["DONE"],
#                 pageSize=5
#             )

#             report_list = reports.get("reports", [])

#             if not report_list:
#                 return Response({
#                     "status": "error",
#                     "message": "No settlement reports available yet"
#                 })

#             # use latest
#             latest_report = report_list[0]
#             report_id = latest_report.get("reportId")

#             # ✅ Step 2: Get report details
#             report_data = sp.get_report(report_id)

#             document_id = report_data.get("reportDocumentId")

#             if not document_id:
#                 return Response({
#                     "status": "error",
#                     "message": "Document not ready"
#                 })

#             # ✅ Step 3: Get download URL
#             doc = sp.get_report_document(document_id)
#             download_url = doc.get("url")

#             if not download_url:
#                 return Response({
#                     "status": "error",
#                     "message": "Download URL not found"
#                 })

#             # Step 4: Parse
#             rows = parse_settlement_report(download_url)

#             # 🔥 Filter ONLY requested order
#             rows = [r for r in rows if r["order_id"] == order_id]

#             if not rows:
#                 return Response({
#                     "status": "success",
#                     "order_id": order_id,
#                     "message": "No settlement data yet (not settled or very recent)",
#                     "data": {}
#                 })

#             # Step 5: Build summary
#             summary = build_profit_summary(rows)

#             return Response({
#                 "status": "success",
#                 "order_id": order_id,
#                 "data": summary.get(order_id, {})
#             })

#         except Exception as e:
#             return Response({
#                 "status": "error",
#                 "message": str(e)
#             })


class SettlementReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:
            sp = SPAPIManager(user=request.user)

            # 🔹 Step 1: Get reports
            # reports = sp.get_reports(
            #     reportTypes=["GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE"],
            #     processingStatuses=["DONE"],
            #     pageSize=5
            # )

            reports = sp.get_reports(
                reportTypes=["GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE"],
                processingStatuses=["DONE"],
                createdSince="2026-04-01T00:00:00Z",
                createdUntil="2026-04-22T00:00:00Z"
            )

            print("REPORT API RESPONSE:", reports)

            report_list = reports.get("reports", [])

            if not report_list:
                return Response({
                    "status": "error",
                    "message": "No settlement reports available"
                })

            # 🔥 DO NOT blindly take first report
            valid_report = None
            # for rpt in report_list:
            #     if rpt.get("processingStatus") == "DONE":
            #         valid_report = rpt
            #         break


            all_rows = []
            total_saved_orders = 0

            for rpt in report_list:
                if rpt.get("processingStatus") != "DONE":
                    continue

                report_id = rpt.get("reportId")

                report_data = sp.get_report(report_id)
                document_id = report_data.get("reportDocumentId")

                if not document_id:
                    continue

                doc = sp.get_report_document(document_id)
                download_url = doc.get("url")

                if not download_url:
                    continue

                rows = parse_settlement_report(download_url)
                all_rows.extend(rows)

            # IMPORTANT: check all_rows instead
            if not all_rows:
                return Response({
                    "status": "success",
                    "message": "No settlement data found",
                    "data": {}
                })

            #  Build summary from ALL reports
            summary = build_profit_summary(all_rows)


            # 🔹 Correct date per report
            data_start = parse_datetime(rpt.get("dataStartTime"))
            data_end = parse_datetime(rpt.get("dataEndTime"))
            account = AmazonAccount.objects.filter(user=request.user).first()

            for order_id, val in summary.items():
                SettlementOrderSummary.objects.update_or_create(
                    amazon_account=account,
                    amazon_order_id=order_id,
                    data_start_time=data_start,
                    data_end_time=data_end,
                    defaults={
                        "user": request.user,
                        "sales": val["sales"],
                        "fees": val["fees"],
                        "refunds": val["refunds"],
                        "tax": val["tax"],
                        "shipping": val["shipping"],
                        "net": val["net"],
                        "report_id": report_id,
                        "report_document_id": document_id
                    }
                )

            total_saved_orders += len(summary)

            return Response({
                "status": "success",
                "total_orders": len(summary),
                "data": summary
            })
        except Exception as e:
            print("ERROR:", str(e))
            return Response({
                "status": "error",
                "message": str(e)
            })
