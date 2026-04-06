import sys
import os
import requests
import datetime
from auth.LwaRequest import LwaAccessTokenRequest
from auth.aws_signer import AWSSigV4Signer

# Point to the generated client folder
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'client'))

# Region → SP-API endpoint mapping
REGION_ENDPOINTS = {
    "NA":      "https://sellingpartnerapi-na.amazon.com",
    "EU":      "https://sellingpartnerapi-eu.amazon.com",
    "FE":      "https://sellingpartnerapi-fe.amazon.com",
    "SANDBOX": "https://sandbox.sellingpartnerapi-na.amazon.com",
}

class SPAPIClient:
    def __init__(self, config):
        self.config = config
        self.access_token = None
        self._authenticate()

    def _authenticate(self):
        """Exchange refresh token for a short-lived access token."""
        lwa = LwaAccessTokenRequest(self.config)
        self.access_token = lwa.get_access_token()

    def get_api_client(self, api_class_name: str):
        """
        Returns a configured API client that correctly signs requests with AWS SigV4.
        """
        import swagger_client
        from swagger_client import Configuration, ApiClient

        # Setup base configuration
        config = Configuration()
        config.host = REGION_ENDPOINTS.get(self.config.region, REGION_ENDPOINTS["NA"])

        # Instantiate the generated ApiClient
        api_client = ApiClient(configuration=config)
        
        # Inject the LWA access token (Standard header)
        api_client.default_headers["x-amz-access-token"] = self.access_token

        # Retrieve AWS Credentials from .env (for SaaS scaling)
        aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
        aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        aws_region = os.getenv("AMAZON_DEFAULT_REGION", "us-east-1") # Map region properly if needed

        # Create a Signer instance
        signer = AWSSigV4Signer(
            access_key=aws_access_key,
            secret_key=aws_secret_key,
            region=aws_region
        )

        # 🚀 CUSTOM WRAPPER: Override the api_client.call_api method to inject the signature
        # This is necessary because SigV4 depends on the specific path, query, and payload of every request.
        original_call_api = api_client.call_api

        def signed_call_api(*args, **kwargs):
            # 1. Prepare common parameters
            method = args[1] if len(args) > 1 else kwargs.get('method')
            resource_path = args[0] if len(args) > 0 else kwargs.get('resource_path')
            
            # Construct full URL for signing
            full_url = config.host + resource_path
            
            # 2. Capture the existing headers (including LWA token)
            headers = api_client.default_headers.copy()
            if 'header_params' in kwargs:
                headers.update(kwargs['header_params'])

            # 3. Compute Body hash if present
            body = kwargs.get('body', '')

            # 4. SIGN THE REQUEST (Add Authorization and X-Amz-Date)
            signed_headers = signer.sign_headers(method, full_url, headers, body=str(body))
            
            # 5. Inject back into kwargs
            kwargs['header_params'] = signed_headers
            
            # Call original method with signed parameters
            return original_call_api(*args, **kwargs)

        # Apply our custom signed method
        api_client.call_api = signed_call_api

        # Dynamically get the API class (e.g. OrdersV0Api, ReportsApi, etc.)
        api_class = getattr(swagger_client, api_class_name)
        return api_class(api_client=api_client)