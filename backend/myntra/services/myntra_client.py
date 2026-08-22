import base64
import logging
from datetime import date, timedelta

import requests
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)
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
    
    # TODO:
    # If Myntra returns 401 / invalid_access_token while the locally
    # tracked token is still valid, refresh the access token and retry
    # the request once.

    BASE_URL = "https://api-integration.myntra.com"

    def __init__(
        self,
        connection=None,
        basic_token=None,
        access_token=None,
        base_url=None,
    ):
        self.base_url = base_url or getattr(
            settings,
            "MYNTRA_BASE_URL",
            self.BASE_URL,
        )

        self.connection = connection

        if connection:
            self.basic_token = self.build_basic_token(
                connection.merchant_id,
                connection.secret_key,
            )
            self.access_token = connection.access_token
        else:
            self.basic_token = basic_token
            self.access_token = access_token

    @staticmethod
    def build_basic_token(merchant_id, secret_key):
        basic_auth = f"{merchant_id}:{secret_key}"
        return base64.b64encode(basic_auth.encode()).decode()

    def headers(self, ensure_token=True):
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

        basic_token = self.basic_token or getattr(settings, "MYNTRA_BASIC_TOKEN", None)

        if basic_token:
            headers["Authorization"] = f"Basic {basic_token}"

        if ensure_token and self.connection:
            access_token = self.ensure_valid_token()
        else:
            access_token = self.access_token or getattr(
                settings, "MYNTRA_ACCESS_TOKEN", None
            )

        if access_token:
            headers["access_token"] = access_token

        return headers
   
    @property
    def api_base_url(self):
        if (
            "pretr" in self.base_url
            or "api-integration" not in self.base_url
        ):
            return "https://api.pretr.com"
    
        return self.base_url

    def _default_date_range(self):
        today = date.today()
        from_date = today - timedelta(days=30)
        return from_date.isoformat(), today.isoformat()

    def generate_access_token(self):
        """
        Initial Myntra authentication.

        Myntra returns access_token and refresh_token
        in RESPONSE HEADERS.
        """

        if not self.connection:
            raise ValueError("MyntraConnection is required to generate a token.")

        if not self.connection.merchant_id:
            raise ValueError("Myntra merchant_id is missing.")

        if not self.connection.secret_key:
            raise ValueError("Myntra secret_key is missing.")

        url = f"{self.api_base_url}/authorization/generate_token"

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "secret_key": self.connection.secret_key,
        }

        payload = {
            "merchant_id": self.connection.merchant_id,
        }

        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=15,
        )

        try:
            data = response.json()
        except ValueError:
            data = {}

        if not response.ok:
            raise RuntimeError(
                f"Myntra token generation failed: "
                f"HTTP {response.status_code} - {response.text}"
            )

        access_token = response.headers.get("access_token")
        refresh_token = response.headers.get("refresh_token")

        if not access_token:
            raise RuntimeError(f"Myntra did not return access_token. Response: {data}")

        self.connection.access_token = access_token

        if refresh_token:
            self.connection.refresh_token = refresh_token

        self.connection.access_token_expires_at = timezone.now() + timedelta(days=30)

        self.connection.save(
            update_fields=[
                "access_token",
                "refresh_token",
                "access_token_expires_at",
                "updated_at",
            ]
        )

        # Keep current client instance synchronized.
        self.access_token = access_token

        return access_token

    def refresh_access_token(self):
        """
        Refresh an expired/expiring Myntra access token.
        """

        if not self.connection:
            raise ValueError("MyntraConnection is required to refresh token.")

        if not self.connection.refresh_token:
            raise RuntimeError("Myntra refresh_token is missing.")

        if not self.connection.merchant_id:
            raise RuntimeError("Myntra merchant_id is missing.")

        url = f"{self.api_base_url}/authorization/refresh_token"

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "refresh_token": self.connection.refresh_token,
        }

        payload = {
            "merchant_id": self.connection.merchant_id,
        }

        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=15,
        )

        try:
            data = response.json()
        except ValueError:
            data = {}

        if not response.ok:
            raise RuntimeError(
                f"Myntra token refresh failed: "
                f"HTTP {response.status_code} - {response.text}"
            )

        access_token = response.headers.get("access_token")

        if not access_token:
            raise RuntimeError(
                f"Myntra refresh did not return access_token. Response: {data}"
            )

        # Some implementations may rotate refresh tokens.
        new_refresh_token = response.headers.get("refresh_token")

        self.connection.access_token = access_token

        if new_refresh_token:
            self.connection.refresh_token = new_refresh_token

        self.connection.access_token_expires_at = timezone.now() + timedelta(days=30)

        self.connection.save(
            update_fields=[
                "access_token",
                "refresh_token",
                "access_token_expires_at",
                "updated_at",
            ]
        )

        self.access_token = access_token

        return access_token

    def ensure_valid_token(self):
        """
        Return a valid Myntra access token.

        Flow:
            valid access token
                -> use it

            expired/expiring + refresh token
                -> refresh it

            no token yet
                -> generate initial token
        """

        if not self.connection:
            return self.access_token

        if self.connection.access_token_is_valid():
            self.access_token = self.connection.access_token
            return self.access_token

        if self.connection.refresh_token:
            return self.refresh_access_token()

        return self.generate_access_token()

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
                    url, json=payload, headers=self.headers(), timeout=10
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
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.content

    def search_catalog_products(
        self,
        query=None,
        seller_approval_status="APR",
        start=0,
        cursor_mark="*",
    ):
        """
        Fetch product catalog details including imageCollection from Myntra API.
        URL format: /partner/catalog/v2/product/search/nofilter
        """
        url = f"{self.base_url}/partner/catalog/v2/product/search/nofilter"

        params = {
            "start": start,
            "cursorMark": cursor_mark,
        }

        if query:
            params["q"] = query

        if seller_approval_status:
            params["sellerApprovalStatus"] = seller_approval_status

        try:
            response = requests.get(
                url,
                headers=self.headers(),
                params=params,
                timeout=15,
            )
            return response.json()
        except Exception as e:
            logger.error(f"Myntra catalog search failed: {str(e)}")
            return {"error": str(e)}

