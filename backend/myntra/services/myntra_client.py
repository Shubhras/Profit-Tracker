from datetime import date, timedelta
import base64

import requests
from django.conf import settings


# class MyntraClient:

#     BASE_URL = "https://api-integration.myntra.com"

#     def headers(self):
#         return {
#             "Accept": "application/json",
#             "Content-Type": "application/json",
#             "Authorization": f"Basic {settings.MYNTRA_BASIC_TOKEN}",
#             "access_token": settings.MYNTRA_ACCESS_TOKEN
#         }

#     # def schedule_orders_report(self):

#     #     url = f"{self.BASE_URL}/partner/v4/portal/report/SJIT_Orders_Report"

#     #     payload = {
#     #         "fromDate": "2025-10-01",
#     #         "toDate": "2026-01-01",
#     #         "partnerType": "SJIT"
#     #     }

#     #     response = requests.post(url, json=payload, headers=self.headers())

#     #     print("Status Code:", response.status_code)
#     #     print("Response:", response.text)

#     #     try:
#     #         return response.json()
#     #     except:
#     #         return {"error": response.text}

#     def schedule_orders_report(self):

#         url = f"{self.BASE_URL}/partner/v4/portal/report/SJIT_Orders_Report"

#         payload = {
#             "fromDate": "2025-10-01",
#             "toDate": "2026-01-01",
#             "partnerType": "SJIT"
#         }

#         try:
#             response = requests.post(
#                 url,
#                 json=payload,
#                 headers=self.headers(),
#                 timeout=10
#             )

#             print("Status Code:", response.status_code)
#             print("Response:", response.text)

#             return response.json()

#         except requests.exceptions.RequestException as e:
#             print("Myntra API Error:", str(e))

#             return {
#                 "error": "Connection failed",
#                 "details": str(e)
#             }

#     def fetch_report(self, job_id):

#         url = f"{self.BASE_URL}/partner/v4/portal/report/download/{job_id}"

#         headers = {
#             "access_token": settings.MYNTRA_ACCESS_TOKEN,
#             "x-partner-store": "omni"
#         }

#         response = requests.get(url, headers=headers)

#         return response.json()

#     def download_csv(self, csv_url):

#         response = requests.get(csv_url)

#         return response.content

# class MyntraClient:

#     BASE_URL = "https://api-integration.myntra.com"

#     def headers(self):
#         return {
#             "Accept": "application/json",
#             "Content-Type": "application/json",
#             "Authorization": f"Basic {settings.MYNTRA_BASIC_TOKEN}",
#             "access_token": settings.MYNTRA_ACCESS_TOKEN
#         }

#     def schedule_orders_report(self):

#         url = f"{self.BASE_URL}/partner/v4/portal/report/SJIT_Orders_Report"

#         payload = {
#             "fromDate": "2025-10-01",
#             "toDate": "2026-03-01",
#             "partnerType": settings.MYNTRA_PARTNER_TYPE
#         }

#         try:
#             response = requests.post(url, json=payload, headers=self.headers(), timeout=10)
#             return response.json()
#         except Exception as e:
#             return {"error": str(e)}

#     def fetch_report(self, job_id):

#         url = f"{self.BASE_URL}/partner/v4/portal/report/download/{job_id}"

#         headers = {
#             "Content-Type": "application/json",
#             "access_token": settings.MYNTRA_ACCESS_TOKEN,
#             "x-partner-store": "omni"
#         }

#         try:
#             response = requests.get(url, headers=headers, timeout=10)
#             return response.json()
#         except Exception as e:
#             return {"error": str(e)}

#     def download_csv(self, url):
#         return requests.get(url).content
class MyntraClient:

    BASE_URL = "https://api-integration.myntra.com"

    def __init__(self, basic_token=None, access_token=None, base_url=None):
        self.basic_token = basic_token
        self.access_token = access_token
        self.base_url = base_url or getattr(settings, "MYNTRA_BASE_URL", self.BASE_URL)

    @staticmethod
    def build_basic_token(merchant_id, secret_key):
        basic_auth = f"{merchant_id}:{secret_key}"
        return base64.b64encode(basic_auth.encode()).decode()

    def headers(self):
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        basic_token = self.basic_token or getattr(settings, "MYNTRA_BASIC_TOKEN", None)
        if basic_token:
            headers["Authorization"] = f"Basic {basic_token}"

        access_token = self.access_token or getattr(settings, "MYNTRA_ACCESS_TOKEN", None)
        if access_token:
            headers["access_token"] = access_token

        return headers

    def _default_date_range(self):
        today = date.today()
        from_date = today - timedelta(days=30)
        return from_date.isoformat(), today.isoformat()

    def schedule_orders_report(self, from_date=None, to_date=None, partner_type=None):

        url = f"{self.base_url}/partner/v4/portal/report/SJIT_Orders_Report"

        if not from_date or not to_date:
            default_from, default_to = self._default_date_range()
            from_date = from_date or default_from
            to_date = to_date or default_to

        payload = {
            "fromDate": from_date,
            "toDate": to_date,
            "partnerType": partner_type or settings.MYNTRA_PARTNER_TYPE,
        }

        last_error = None
        for attempt in range(3):
            try:
                response = requests.post(
                    url,
                    json=payload,
                    headers=self.headers(),
                    timeout=10
                )

                try:
                    data = response.json()
                except ValueError:
                    data = {"error": "Invalid JSON response", "details": response.text}

                print("Attempt:", attempt + 1, data)

                if response.ok and data.get("statusType") == "SUCCESS":
                    return data
                last_error = data

            except Exception as e:
                last_error = {"error": "Request failed", "details": str(e)}
                print("Error:", str(e))

        return last_error or {"error": "Failed after retries"}

    def fetch_report(self, job_id):

        url = f"{self.base_url}/partner/v4/portal/report/download/{job_id}"

        headers = self.headers()
        headers["x-partner-store"] = "omni"

        try:
            response = requests.get(url, headers=headers, timeout=10)
            return response.json()
        except Exception as e:
            return {"error": str(e)}

    def download_csv(self, url):

        try:
            response = requests.get(url, timeout=10)
            return response.content
        except Exception as e:
            return b""
