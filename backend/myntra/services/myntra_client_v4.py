import logging

import requests
from django.conf import settings

from .myntra_client import MyntraClient

logger = logging.getLogger(__name__)


class MyntraClientV4(MyntraClient):

    def _log_call(self, endpoint, status="SUCCESS", response_time_ms=0):
        try:
            from admin_auth.models import log_api_call
            user = self.connection.user if self.connection else None
            acc_id = getattr(self.connection, 'vendor_id', '') if self.connection else ''
            acc_name = getattr(self.connection, 'seller_name', '') if self.connection else ''
            log_api_call(
                user=user,
                service_type='Myntra',
                account_id=acc_id,
                account_name=acc_name,
                api_endpoint=endpoint,
                call_count=1,
                status=status,
                response_time_ms=response_time_ms
            )
        except Exception:
            pass

    def get_order_list(self, start_date, end_date, page=0, status_code=None):
        url = f"{self.api_base_url}/partner/v4/order/getOrderList"
        params = {
            "page": page,
            "startDate": start_date,
            "endDate": end_date
        }
        if status_code:
            params["statusCode"] = status_code

        try:
            response = requests.get(url, headers=self.headers(), params=params, timeout=15)
            self._log_call("/partner/v4/order/getOrderList", status="SUCCESS" if response.status_code == 200 else f"HTTP_{response.status_code}")
            if response.status_code == 200:
                return response.json()
            return {"error": f"HTTP {response.status_code}", "details": response.text}
        except Exception as e:
            self._log_call("/partner/v4/order/getOrderList", status="FAILED")
            logger.error(f"Error fetching order list from Myntra: {e}")
            return {"error": "Request failed", "details": str(e)}

    def get_order_by_id(self, seller_order_id):
        endpoint = f"/partner/v4/order/{seller_order_id}"
        url = f"{self.api_base_url}{endpoint}"
        try:
            response = requests.get(url, headers=self.headers(), timeout=15)
            self._log_call("/partner/v4/order/{seller_order_id}", status="SUCCESS" if response.status_code == 200 else f"HTTP_{response.status_code}")
            if response.status_code == 200:
                return response.json()
            return {"error": f"HTTP {response.status_code}", "details": response.text}
        except Exception as e:
            self._log_call("/partner/v4/order/{seller_order_id}", status="FAILED")
            logger.error(f"Error fetching order details from Myntra: {e}")
            return {"error": "Request failed", "details": str(e)}

    def get_returns_list(self, start_date, end_date, return_type="CUSTOMER_RETURN", page=0, destination_warehouse_ids=None):
        url = f"{self.api_base_url}/partner/v4/returns/returnRecon"
        payload = {
            "startDate": start_date,
            "endDate": end_date,
            "page": page,
            "returnType": return_type
        }
        if destination_warehouse_ids:
            payload["destinationWarehouseIds"] = destination_warehouse_ids

        try:
            response = requests.post(url, headers=self.headers(), json=payload, timeout=15)
            self._log_call("/partner/v4/returns/returnRecon", status="SUCCESS" if response.status_code == 200 else f"HTTP_{response.status_code}")
            if response.status_code == 200:
                return response.json()
            return {"error": f"HTTP {response.status_code}", "details": response.text}
        except Exception as e:
            self._log_call("/partner/v4/returns/returnRecon", status="FAILED")
            logger.error(f"Error fetching returns from Myntra: {e}")
            return {"error": "Request failed", "details": str(e)}

    def get_payment_history(self, payment_method, from_date, to_date, page_no=0, page_size=20):
        url = f"{self.api_base_url}/partner/v4/payments/history/{payment_method}"
        params = {
            "fromDate": from_date,
            "toDate": to_date,
            "pageNo": page_no,
            "pageSize": page_size
        }
        try:
            response = requests.get(url, headers=self.headers(), params=params, timeout=15)
            self._log_call(f"/partner/v4/payments/history/{payment_method}", status="SUCCESS" if response.status_code == 200 else f"HTTP_{response.status_code}")
            if response.status_code == 200:
                return response.json()
            return {"error": f"HTTP {response.status_code}", "details": response.text}
        except Exception as e:
            self._log_call(f"/partner/v4/payments/history/{payment_method}", status="FAILED")
            logger.error(f"Error fetching payment history from Myntra: {e}")
            return {"error": "Request failed", "details": str(e)}

    def get_return_details(self, return_id):
        url = f"{self.api_base_url}/partner/v4/returns/returnRecon"
        try:
            response = requests.post(url, headers=self.headers(), json={"id": return_id}, timeout=15)
            self._log_call("/partner/v4/returns/returnRecon", status="SUCCESS" if response.status_code == 200 else f"HTTP_{response.status_code}")
            if response.status_code == 200:
                return response.json()
            return {"error": f"HTTP {response.status_code}", "details": response.text}
        except Exception as e:
            self._log_call("/partner/v4/returns/returnRecon", status="FAILED")
            logger.error(f"Error fetching return details from Myntra: {e}")
            return {"error": "Request failed", "details": str(e)}

    def schedule_report(
        self, report_name, partner_type=None, from_date=None, to_date=None
    ):
        url = f"{self.api_base_url}/partner/v4/portal/report/{report_name}"
        partner_type = partner_type or self.connection.partner_type
        payload = {"partnerType": partner_type}

        if from_date:
            payload["fromDate"] = from_date

        if to_date:
            payload["toDate"] = to_date

        try:
            print("URL:", url)
            print("Payload:", payload)
            response = requests.post(
                url, headers=self.headers(), json=payload, timeout=15
            )
            self._log_call(f"/partner/v4/portal/report/{report_name}", status="SUCCESS" if response.status_code == 200 else f"HTTP_{response.status_code}")

            if response.status_code == 200:
                return response.json()

            return {"error": f"HTTP {response.status_code}", "details": response.text}

        except Exception as e:
            self._log_call(f"/partner/v4/portal/report/{report_name}", status="FAILED")
            logger.error(f"Error scheduling Myntra report: {e}")
            return {"error": "Request failed", "details": str(e)}