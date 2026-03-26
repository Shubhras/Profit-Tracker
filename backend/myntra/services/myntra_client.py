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



import requests
from django.conf import settings


class MyntraClient:

    BASE_URL = "https://api-integration.myntra.com"

    def headers(self):
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Basic {settings.MYNTRA_BASIC_TOKEN}",
            "access_token": settings.MYNTRA_ACCESS_TOKEN
        }

    def schedule_orders_report(self):

        url = f"{self.BASE_URL}/partner/v4/portal/report/SJIT_Orders_Report"

        payload = {
            "fromDate": "2025-03-01",
            "toDate": "2025-03-20",
            "partnerType": settings.MYNTRA_PARTNER_TYPE
        }

        for attempt in range(3):
            try:
                response = requests.post(
                    url,
                    json=payload,
                    headers=self.headers(),
                    timeout=10
                )

                data = response.json()

                print("Attempt:", attempt + 1, data)

                if data.get("statusType") == "SUCCESS":
                    return data

            except Exception as e:
                print("Error:", str(e))

        return {"error": "Failed after retries"}

    def fetch_report(self, job_id):

        url = f"{self.BASE_URL}/partner/v4/portal/report/download/{job_id}"

        headers = {
            "Content-Type": "application/json",
            "access_token": settings.MYNTRA_ACCESS_TOKEN,
            "x-partner-store": "omni"
        }

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