# views.py

from datetime import datetime, timedelta

from django.utils.dateparse import parse_datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from amazon_auth.models import AmazonAccount
# from .utils import get_access_token
from .spapi_manager import SPAPIManager


class AmazonTransactionsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get_region_endpoint(self, region):
        region = (region or "").upper()

        endpoints = {
            "NA": "https://sellingpartnerapi-na.amazon.com",
            "EU": "https://sellingpartnerapi-eu.amazon.com",
            "FE": "https://sellingpartnerapi-fe.amazon.com",
        }

        return endpoints.get(region, endpoints["NA"])

    def get(self, request):
        user=request.user

        # amazon_account_id = request.query_params.get("amazon_account_id")
        amazon_account = AmazonAccount.objects.get(
                user=request.user
            )

        if not amazon_account:
            return Response(
                {
                    "status": False,
                    "message": "amazon_account not found"
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        posted_after = request.query_params.get("postedAfter")
        posted_before = request.query_params.get("postedBefore")

        marketplace_id = request.query_params.get(
            "marketplaceId",
            amazon_account.marketplace_id
        )

        transaction_status = request.query_params.get("transactionStatus")
        related_identifier_name = request.query_params.get("relatedIdentifierName")
        related_identifier_value = request.query_params.get("relatedIdentifierValue")
        next_token = request.query_params.get("nextToken")

        # Validate postedAfter
        if not posted_after and not related_identifier_value:
            return Response(
                {
                    "status": False,
                    "message": "postedAfter is required if relatedIdentifierValue is not provided"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Default postedBefore = now - 2 mins
        if not posted_before:
            posted_before = (
                datetime.utcnow() - timedelta(minutes=2)
            ).isoformat() + "Z"

        # Optional datetime validation
        if posted_after:
            parsed_after = parse_datetime(posted_after)

            if not parsed_after:
                return Response(
                    {
                        "status": False,
                        "message": "Invalid postedAfter datetime format"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        parsed_before = parse_datetime(posted_before)

        if not parsed_before:
            return Response(
                {
                    "status": False,
                    "message": "Invalid postedBefore datetime format"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # access_token = get_access_token(amazon_account)
            sp_api = SPAPIManager(account=amazon_account)

            access_token = sp_api.get_access_token()
            # access_token = amazon_account.access_token

            endpoint = self.get_region_endpoint(amazon_account.region)

            url = f"{endpoint}/finances/2024-06-19/transactions"

            headers = {
                "x-amz-access-token": access_token,
                "accept": "application/json"
            }

            params = {}

            if posted_after:
                params["postedAfter"] = posted_after

            if posted_before:
                params["postedBefore"] = posted_before

            if marketplace_id:
                params["marketplaceId"] = marketplace_id

            if transaction_status:
                params["transactionStatus"] = transaction_status

            if related_identifier_name:
                params["relatedIdentifierName"] = related_identifier_name

            if related_identifier_value:
                params["relatedIdentifierValue"] = related_identifier_value

            if next_token:
                params["nextToken"] = next_token

            import requests

            response = requests.get(
                url,
                headers=headers,
                params=params
            )

            response_data = response.json()

            if response.status_code != 200:
                return Response(
                    {
                        "status": False,
                        "message": "Failed to fetch transactions",
                        "amazon_response": response_data
                    },
                    status=response.status_code
                )

            payload = response_data.get("payload", {})

            return Response(
                {
                    "status": True,
                    "message": "Transactions fetched successfully",
                    "data": {
                        "nextToken": payload.get("nextToken"),
                        "transactions": payload.get("transactions", []),
                    },
                    "meta": {
                        "rate_limit": response.headers.get("x-amzn-RateLimit-Limit"),
                        "request_id": response.headers.get("x-amzn-RequestId"),
                    }
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
            