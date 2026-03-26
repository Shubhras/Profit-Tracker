import time
import csv
from io import StringIO
import os

from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum

from .services.myntra_client import MyntraClient
from .models import MyntraOrder


# ✅ helper function (VERY IMPORTANT)
def safe_float(value):
    try:
        return float(value)
    except:
        return 0.0


# ✅ 1️⃣ FULL AUTO SYNC (MAIN API)
class SyncMyntraOrders(APIView):

    def get(self, request):

        client = MyntraClient()

        # ✅ STEP 1 — Schedule report
        schedule = client.schedule_orders_report()

        print("Schedule Response:", schedule)

        # ✅ FIX: validate response properly
        if schedule.get("statusType") != "SUCCESS":
            return Response({
                "status": "failed",
                "error": schedule
            })

        job_id = schedule.get("jobId")

        if not job_id:
            return Response({
                "status": "failed",
                "error": "No jobId received"
            })

        # ✅ STEP 2 — Poll for report completion
        for attempt in range(10):

            print(f"Polling attempt {attempt+1}...")

            report = client.fetch_report(job_id)

            print("Report Response:", report)

            if not report:
                return Response({
                    "status": "failed",
                    "error": "No response from Myntra"
                })

            # ✅ If report ready
            if report.get("status") == "COMPLETED":

                csv_url = report.get("successFile")

                if not csv_url:
                    return Response({
                        "status": "failed",
                        "error": "CSV URL not found"
                    })

                # ✅ STEP 3 — Download CSV
                csv_content = client.download_csv(csv_url)

                if not csv_content:
                    return Response({
                        "status": "failed",
                        "error": "CSV download failed"
                    })

                # ✅ Save CSV locally
                folder = "reports"
                os.makedirs(folder, exist_ok=True)

                file_name = f"{folder}/report_{job_id}.csv"

                with open(file_name, "wb") as f:
                    f.write(csv_content)

                print("CSV saved at:", file_name)

                # ✅ STEP 4 — Parse CSV
                reader = csv.DictReader(StringIO(csv_content.decode("utf-8")))

                orders_saved = 0

                for row in reader:
                    try:
                        order_id = row.get("order line id")
                        sku = row.get("seller sku code")

                        selling_price = safe_float(row.get("final amount"))
                        seller_price = safe_float(row.get("seller price"))
                        logistics_fee = safe_float(row.get("gt charges"))

                        profit = seller_price - logistics_fee

                        MyntraOrder.objects.update_or_create(
                            order_id=order_id,
                            defaults={
                                "sku": sku,
                                "selling_price": selling_price,
                                "commission": 0,
                                "logistics_fee": logistics_fee,
                                "profit": profit
                            }
                        )

                        orders_saved += 1

                    except Exception as e:
                        print("Row error:", e)

                return Response({
                    "status": "SUCCESS",
                    "job_id": job_id,
                    "orders_saved": orders_saved
                })

            # ❌ If report failed
            if report.get("status") == "FAILED":
                return Response({
                    "status": "failed",
                    "error": report
                })

            # ⏳ Wait before next poll
            time.sleep(5)

        # ⏳ Still processing
        return Response({
            "status": "processing",
            "job_id": job_id
        })


# ✅ 2️⃣ ORDERS LIST API
class MyntraOrdersList(APIView):

    def get(self, request):

        orders = MyntraOrder.objects.all().values()

        return Response({
            "count": len(orders),
            "data": list(orders)
        })


# ✅ 3️⃣ DASHBOARD API
class MyntraDashboard(APIView):

    def get(self, request):

        total_orders = MyntraOrder.objects.count()

        total_revenue = MyntraOrder.objects.aggregate(
            Sum("selling_price")
        )["selling_price__sum"] or 0

        total_profit = MyntraOrder.objects.aggregate(
            Sum("profit")
        )["profit__sum"] or 0

        return Response({
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_profit": total_profit
        })