import os
import requests
import hashlib
import hmac
import time
import json
from datetime import datetime, timedelta
from urllib.parse import urlparse, quote
from django.core.cache import cache
from .models import AmazonAccount
from django.contrib.auth.models import User

class SPAPIManager:
    def __init__(self, user=None, account=None):
        self.user = user
        self.account = account
        
        # Default/Global credentials from ENV
        self.client_id = os.getenv("AMAZON_CLIENT_ID")
        self.client_secret = os.getenv("AMAZON_CLIENT_SECRET")
        self.refresh_token = os.getenv("AMAZON_REFRESH_TOKEN")
        self.marketplace_id = os.getenv("MARKETPLACE_ID")
        self.region_env = os.getenv("AMAZON_REGION")
        
        # AWS Credentials (Always from ENV as these are Developer-wide)
        self.aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        
        # Check if user is authenticated (handle AnonymousUser)
        is_authenticated = self.user and not getattr(self.user, 'is_anonymous', False)

        # Use provided account or find existing one
        if self.account:
            try:
                if self.account.app_client_id:
                    self.client_id = self.account.app_client_id
                if self.account.app_client_secret:
                    self.client_secret = self.account.app_client_secret
                
                self.refresh_token = self.account.get_refresh_token()
                self.marketplace_id = self.account.marketplace_id
                self.region_env = self.account.region.lower() if self.account.region else None
            except Exception:
                pass
        elif is_authenticated:
            try:
                # Fallback to the first account if none specified
                self.account = AmazonAccount.objects.filter(user=self.user).first()
                if self.account:
                    if self.account.app_client_id:
                        self.client_id = self.account.app_client_id
                    if self.account.app_client_secret:
                        self.client_secret = self.account.app_client_secret
                    
                    self.refresh_token = self.account.get_refresh_token()
                    self.marketplace_id = self.account.marketplace_id
                    self.region_env = self.account.region.lower() if self.account.region else None
            except AmazonAccount.DoesNotExist:
                pass


        # Force India marketplace to use EU endpoint if not explicitly overridden by ENV
        if self.marketplace_id in ["A21TJRUUN4KGV"] and not os.getenv("AMAZON_REGION"):
            self.region_env = "eu"

        # Default region if still not set
        if not self.region_env:
            self.region_env = "na"
        
        self.host = f"sellingpartnerapi-{self.region_env}.amazon.com"
        
        # AWS SigV4 Region mapping
        self.aws_region = "us-east-1"
        if self.region_env == "eu":
            self.aws_region = "eu-west-1"
        elif self.region_env == "fe":
            self.aws_region = "us-west-2"

    def get_access_token(self):
        url = "https://api.amazon.com/auth/o2/token"
        if not self.refresh_token:
            if self.user:
                 raise Exception(f"No Amazon connection found for user {self.user.username}.")
            raise Exception("AMAZON_REFRESH_TOKEN is missing in environment variables.")

        payload = {
            "grant_type": "refresh_token",
            "refresh_token": self.refresh_token,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }

        res = requests.post(url, data=payload)
        if res.status_code != 200:
            raise Exception(f"Failed to get access token: {res.text}")
            
        return res.json().get("access_token")

    def _sign(self, key, msg):
        return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()

    def _get_signature_key(self, key, date_stamp, region_name, service_name):
        k_date = self._sign(('AWS4' + key).encode('utf-8'), date_stamp)
        k_region = self._sign(k_date, region_name)
        k_service = self._sign(k_region, service_name)
        k_signing = self._sign(k_service, 'aws4_request')
        return k_signing

    def request(self, method, path, params=None, data=None):
        access_token = self.get_access_token()
        url = f"https://{self.host}{path}"
        
        # SigV4 Signing logic
        t = datetime.utcnow()
        amz_date = t.strftime('%Y%m%dT%H%M%SZ')
        date_stamp = t.strftime('%Y%m%d')
        
        # Prepare parameters for canonical query string
        if params:
            # Sort params alphabetically
            sorted_params = sorted(params.items())
            canonical_querystring = '&'.join([f"{quote(str(k), safe='')}={quote(str(v), safe='')}" for k, v in sorted_params])
        else:
            canonical_querystring = ''

        # Headers
        headers = {
            'host': self.host,
            'x-amz-date': amz_date,
            'x-amz-access-token': access_token,
            'Content-Type': 'application/json'
        }
        
        # Canonical headers (must be sorted alphabetically)
        canonical_headers = f"content-type:application/json\nhost:{self.host}\nx-amz-access-token:{access_token}\nx-amz-date:{amz_date}\n"
        signed_headers = 'content-type;host;x-amz-access-token;x-amz-date'
        
        payload_hash = hashlib.sha256((data or '').encode('utf-8')).hexdigest()
        
        canonical_request = f"{method}\n{path}\n{canonical_querystring}\n{canonical_headers}\n{signed_headers}\n{payload_hash}"
        
        algorithm = 'AWS4-HMAC-SHA256'
        credential_scope = f"{date_stamp}/{self.aws_region}/execute-api/aws4_request"
        string_to_sign = f"{algorithm}\n{amz_date}\n{credential_scope}\n{hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()}"
        
        signing_key = self._get_signature_key(self.aws_secret_key, date_stamp, self.aws_region, 'execute-api')
        signature = hmac.new(signing_key, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()
        
        authorization_header = f"{algorithm} Credential={self.aws_access_key}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}"
        headers['Authorization'] = authorization_header

        response = requests.request(method, url, params=params, headers=headers, data=data)
        return response.json()

    def get_orders(self, **kwargs):
        """
        Returns orders that are created or updated during the specified time period.
        Supports all parameters from SP-API Orders v0.
        """
        path = "/orders/v0/orders"
        
        # Prepare parameters
        params = {}
        
        # Required parameters logic
        if "MarketplaceIds" not in kwargs:
            params["MarketplaceIds"] = self.marketplace_id
        else:
            marketplaces = kwargs.get("MarketplaceIds")
            params["MarketplaceIds"] = ",".join(marketplaces) if isinstance(marketplaces, list) else marketplaces

        # Either CreatedAfter or LastUpdatedAfter is required
        if "CreatedAfter" not in kwargs and "LastUpdatedAfter" not in kwargs and "SellerOrderId" not in kwargs and "AmazonOrderIds" not in kwargs:
            params["CreatedAfter"] = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
        
        param_mapping = [
            "CreatedAfter", "CreatedBefore", "LastUpdatedAfter", "LastUpdatedBefore",
            "OrderStatuses", "FulfillmentChannels", "PaymentMethods", "SellerOrderId",
            "MaxResultsPerPage", "EasyShipShipmentStatuses", "ElectronicInvoiceStatuses",
            "NextToken", "AmazonOrderIds", "ActualFulfillmentSupplySourceId", "IsISPU",
            "StoreChainStoreId", "EarliestDeliveryDateBefore", "EarliestDeliveryDateAfter",
            "LatestDeliveryDateBefore", "LatestDeliveryDateAfter"
        ]

        for key in param_mapping:
            if key in kwargs:
                val = kwargs[key]
                if isinstance(val, list):
                    params[key] = ",".join(val)
                elif isinstance(val, bool):
                    params[key] = "true" if val else "false"
                else:
                    params[key] = val

        return self.request("GET", path, params=params)

    def fetch_orders(self, **kwargs):
        """Flexible method for fetching orders with various filters"""
        return self.get_orders(**kwargs)

    def get_order(self, order_id):
        """Returns the order that you specify by order_id."""
        path = f"/orders/v0/orders/{order_id}"
        return self.request("GET", path)

    # def get_order_buyer_info(self, order_id):
    #     """Returns buyer information for the order that you specify."""
    #     path = f"/orders/v0/orders/{order_id}/buyerInfo"
    #     return self.request("GET", path)

    def get_order_address(self, order_id):
        """Returns the shipping address for the order that you specify."""
        path = f"/orders/v0/orders/{order_id}/address"
        return self.request("GET", path)

    def get_order_items(self, order_id, next_token=None):
        """Returns detailed order item information for the order that you specify."""
        path = f"/orders/v0/orders/{order_id}/orderItems"
        params = {"NextToken": next_token} if next_token else None  
        return self.request("GET", path, params=params)
    

    
    def get_order_financial_events(self, order_id, max_results=100, next_token=None):
        """Returns all financial events for the specified order."""
        path = f"/finances/v0/orders/{order_id}/financialEvents"
        params = {"MaxResultsPerPage": max_results}
        if next_token:
            params["NextToken"] = next_token
        return self.request("GET", path, params=params)

    def list_financial_events(self, **kwargs):
        """Returns financial events for the specified data range."""
        path = "/finances/v0/financialEvents"
        params = {}
        
        param_mapping = ["MaxResultsPerPage", "PostedAfter", "PostedBefore", "NextToken"]
        for key in param_mapping:
            if key in kwargs:
                params[key] = kwargs[key]
        
        # Default PostedAfter if not provided (SP-API requires it if PostedBefore is present)
        if not params.get("PostedAfter") and not params.get("NextToken"):
            params["PostedAfter"] = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")

        return self.request("GET", path, params=params)

    def get_reports(self, **kwargs):
        """Returns report details for the reports that match the filters specification."""
        path = "/reports/2021-06-30/reports"
        params = {}
        
        # param_mapping = [
        #     "reportTypes", "processingStatuses", "marketplaceIds", 
        #     "pageSize", "createdSince", "createdUntil", "nextToken"
        # ]

        param_mapping = [
            "reportTypes",
            "processingStatuses",
            "marketplaceIds",
            "pageSize",
            "createdSince",
            "createdUntil",
            "nextToken",
            "reportIds",  # ✅ ADD THIS
        ]
        
        for key in param_mapping:
            if key in kwargs:
                val = kwargs[key]
                if isinstance(val, list):
                    params[key] = ",".join(val)
                else:
                    params[key] = val
        
        return self.request("GET", path, params=params)
    

    def new_create_report(self, report_type, start_date, end_date):
        import json

        path = "/reports/2021-06-30/reports"
        
        payload = {
            "reportType": report_type,
            "marketplaceIds": ["A21TJRUUN4KGV"],
            "dataStartTime": start_date,
            "dataEndTime": end_date,
            "reportOptions": {
                "dateGranularity": "DAY",
                # "asinGranularity": "PARENT"
                "asinGranularity": "CHILD"  
            }
        }

        # ✅ convert dict → JSON string
        payload_json = json.dumps(payload)

        return self.request("POST", path, data=payload_json)

    def get_report(self, report_id):
        """Returns report details for the report specified by report_id."""
        path = f"/reports/2021-06-30/reports/{report_id}"
        return self.request("GET", path)
    

    def get_catalog_item(self, asin, marketplace_id):
        path = f"/catalog/2022-04-01/items/{asin}"

        params = {
            "marketplaceIds": marketplace_id,
            "includedData": "attributes,images,relationships"  # ✅ ADD THIS
        }

        return self.request("GET", path, params=params)
    

    def create_settlement_report(self, start_date=None, end_date=None):
        return self.create_report(
            report_type="GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE",
            dataStartTime=start_date,
            dataEndTime=end_date
        )

    def create_report(self, report_type, **kwargs):
        """Creates a report."""
        path = "/reports/2021-06-30/reports"
        
        # Mandatory fields
        payload = {
            "reportType": report_type,
            "marketplaceIds": kwargs.get("marketplaceIds", [self.marketplace_id])
        }
        
        # Optional fields
        if "dataStartTime" in kwargs:
            payload["dataStartTime"] = kwargs["dataStartTime"]
        if "dataEndTime" in kwargs:
            payload["dataEndTime"] = kwargs["dataEndTime"]
        if "reportOptions" in kwargs:
            payload["reportOptions"] = kwargs["reportOptions"]
            
        return self.request("POST", path, data=json.dumps(payload))

    def get_report_document(self, document_id):
        """Returns the information required for retrieving a report document's contents."""
        path = f"/reports/2021-06-30/documents/{document_id}"
        return self.request("GET", path)
    

    def list_returns(self, **kwargs):
        path = "/externalFulfillment/2024-09-11/returns"
        

        params = {}

        allowed_params = [
            "returnLocationId",
            "rmaId",
            "status",
            "reverseTrackingId",
            "createdSince",
            "createdUntil",
            "lastUpdatedSince",
            "lastUpdatedUntil",
            "maxResults",
            "nextToken"
        ]

        for key in allowed_params:
            if key in kwargs and kwargs[key] is not None:
                params[key] = kwargs[key]

        return self.request("GET", path, params=params)