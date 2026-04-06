# import time
# from .myntra_client import MyntraClient
# from .csv_parser import parse_csv


# class MyntraReportService:

#     def __init__(self):
#         self.client = MyntraClient()

#     def get_orders_report(self):

#         # Step 1: Schedule report
#         schedule_response = self.client.schedule_orders_report()

#         job_id = schedule_response.get("jobId")

#         if not job_id:
#             return {
#                 "status": "error",
#                 "message": schedule_response
#             }

#         # Step 2: Wait for report generation
#         for _ in range(10):

#             report_status = self.client.fetch_report(job_id)

#             if report_status.get("status") == "COMPLETED":

#                 csv_url = report_status.get("successFile")

#                 # Step 3: Download CSV
#                 csv_data = self.client.download_csv(csv_url)

#                 # Step 4: Parse CSV
#                 parsed_data = parse_csv(csv_data)

#                 return {
#                     "status": "success",
#                     "job_id": job_id,
#                     "data": parsed_data
#                 }

#             time.sleep(5)

#         return {
#             "status": "processing",
#             "job_id": job_id
#         }



import time
import logging

from .myntra_client import MyntraClient
from .csv_parser import parse_csv, safe_float
from ..models import MyntraOrder

logger = logging.getLogger(__name__)


class MyntraReportService:

    def __init__(self):
        self.client = MyntraClient()

    # ✅ MAIN FLOW
    def get_orders_report(self):

        schedule_response = self.client.schedule_orders_report()
        job_id = schedule_response.get("jobId")

        if not job_id:
            return {
                "status": "error",
                "message": schedule_response
            }

        for _ in range(10):

            report_status = self.client.fetch_report(job_id)

            if report_status.get("status") == "COMPLETED":

                csv_url = report_status.get("successFile")
                csv_data = self.client.download_csv(csv_url)

                parsed_data = parse_csv(csv_data)

                return {
                    "status": "success",
                    "job_id": job_id,
                    "data": parsed_data
                }

            if report_status.get("status") == "FAILED":
                return {
                    "status": "failed",
                    "error": report_status
                }

            time.sleep(5)

        return {
            "status": "processing",
            "job_id": job_id
        }

    # ✅ SAVE TO DB
    def save_orders(self, data):

        orders_saved = 0

        for row in data:
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
                logger.error(f"Row error: {e}")

        return orders_saved