import requests
import logging
from .myntra_client import MyntraClient

logger = logging.getLogger(__name__)


class MyntraClientV4(MyntraClient):

    def get_order_list(self, start_date, end_date, page=0, status_code=None):
        base = "https://api.pretr.com" if "pretr" in self.base_url or "api-integration" not in self.base_url else self.base_url
        url = f"{base}/partner/v4/order/getOrderList"
        params = {
            "page": page,
            "startDate": start_date,
            "endDate": end_date
        }
        if status_code:
            params["statusCode"] = status_code

        try:
            response = requests.get(url, headers=self.headers(), params=params, timeout=15)
            if response.status_code == 200:
                return response.json()
            return {"error": f"HTTP {response.status_code}", "details": response.text}
        except Exception as e:
            logger.error(f"Error fetching order list from Myntra: {e}")
            return {"error": "Request failed", "details": str(e)}

    def get_order_by_id(self, seller_order_id):
        base = "https://api.pretr.com" if "pretr" in self.base_url or "api-integration" not in self.base_url else self.base_url
        url = f"{base}/partner/v4/order/{seller_order_id}"
        try:
            response = requests.get(url, headers=self.headers(), timeout=15)
            if response.status_code == 200:
                return response.json()
            return {"error": f"HTTP {response.status_code}", "details": response.text}
        except Exception as e:
            logger.error(f"Error fetching order details from Myntra: {e}")
            return {"error": "Request failed", "details": str(e)}

    def get_returns_list(self, start_date, end_date, return_type="CUSTOMER_RETURN", page=0, destination_warehouse_ids=None):
        base = "https://api.pretr.com" if "pretr" in self.base_url or "api-integration" not in self.base_url else self.base_url
        url = f"{base}/partner/v4/returns/returnRecon"
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
            if response.status_code == 200:
                return response.json()
            return {"error": f"HTTP {response.status_code}", "details": response.text}
        except Exception as e:
            logger.error(f"Error fetching returns from Myntra: {e}")
            return {"error": "Request failed", "details": str(e)}

    def get_payment_history(self, payment_method, from_date, to_date, page_no=1, page_size=20):
        base = "https://api.pretr.com" if "pretr" in self.base_url or "api-integration" not in self.base_url else self.base_url
        url = f"{base}/partner/v4/payments/history/{payment_method}"
        params = {
            "fromDate": from_date,
            "toDate": to_date,
            "pageNo": page_no,
            "pageSize": page_size
        }
        try:
            response = requests.get(url, headers=self.headers(), params=params, timeout=15)
            if response.status_code == 200:
                return response.json()
            return {"error": f"HTTP {response.status_code}", "details": response.text}
        except Exception as e:
            logger.error(f"Error fetching payment history from Myntra: {e}")
            return {"error": "Request failed", "details": str(e)}

    def get_return_details(self, return_id):
        base = "https://api.pretr.com" if "pretr" in self.base_url or "api-integration" not in self.base_url else self.base_url
        url = f"{base}/partner/v4/returns/returnRecon"
        try:
            response = requests.post(url, headers=self.headers(), json={"id": return_id}, timeout=15)
            if response.status_code == 200:
                return response.json()
            return {"error": f"HTTP {response.status_code}", "details": response.text}
        except Exception as e:
            logger.error(f"Error fetching return details from Myntra: {e}")
            return {"error": "Request failed", "details": str(e)}

