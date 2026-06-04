# views.py

from datetime import datetime, timedelta

from django.utils.dateparse import parse_datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from amazon_auth.models import *
# from .utils import get_access_token
from .spapi_manager import SPAPIManager
from django.db.models import Q
from django.core.paginator import Paginator



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
            
      


class AmazonTransactionListView(APIView):

    permission_classes = [IsAuthenticated]

    def get_breakdown_tree(self, breakdown):

        children = breakdown.children.all()

        return {
            "id": breakdown.id,
            "breakdown_type": breakdown.breakdown_type,
            "amount": breakdown.amount,
            "currency_code": breakdown.currency_code,
            "children": [
                self.get_breakdown_tree(child)
                for child in children
            ]
        }

    def get(self, request):

        # ==========================================
        # Query Params
        # ==========================================

        search = request.query_params.get("search")
        transaction_id = request.query_params.get("transaction_id")
        transaction_status = request.query_params.get("transaction_status")
        transaction_type = request.query_params.get("transaction_type")

        posted_date_from = request.query_params.get("posted_date_from")
        posted_date_to = request.query_params.get("posted_date_to")

        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 10))

        # ==========================================
        # Base Queryset
        # ==========================================

        queryset = AmazonTransaction.objects.filter(
            amazon_account__user=request.user
        ).prefetch_related(
            "related_identifiers",
            "contexts",
            "breakdowns",
            "breakdowns__children"
        ).order_by("-posted_date")

        # ==========================================
        # Filters
        # ==========================================

        if transaction_id:
            queryset = queryset.filter(
                transaction_id=transaction_id
            )

        if transaction_status:
            queryset = queryset.filter(
                transaction_status__iexact=transaction_status
            )

        if transaction_type:
            queryset = queryset.filter(
                transaction_type__iexact=transaction_type
            )

        if posted_date_from:
            queryset = queryset.filter(
                posted_date__date__gte=posted_date_from
            )

        if posted_date_to:
            queryset = queryset.filter(
                posted_date__date__lte=posted_date_to
            )

        # ==========================================
        # Search
        # ==========================================

        if search:

            queryset = queryset.filter(
                Q(transaction_id__icontains=search) |
                Q(description__icontains=search) |
                Q(transaction_type__icontains=search) |
                Q(transaction_status__icontains=search)
            )

        # ==========================================
        # Pagination
        # ==========================================

        paginator = Paginator(queryset, page_size)

        current_page = paginator.get_page(page)

        results = []

        for txn in current_page:

            # ======================================
            # Related Identifiers
            # ======================================

            related_identifiers = []

            for rel in txn.related_identifiers.all():

                related_identifiers.append({
                    "id": rel.id,
                    "identifier_name": rel.identifier_name,
                    "identifier_value": rel.identifier_value,
                })

            # ======================================
            # Contexts
            # ======================================

            contexts = []

            for ctx in txn.contexts.all():

                contexts.append({
                    "id": ctx.id,
                    "context_type": ctx.context_type,

                    # Product Context
                    "asin": ctx.asin,
                    "sku": ctx.sku,
                    "quantity_shipped": ctx.quantity_shipped,
                    "fulfillment_network": ctx.fulfillment_network,

                    # Deferred Context
                    "deferral_reason": ctx.deferral_reason,
                    "maturity_date": ctx.maturity_date,

                    # Amazon Pay Context
                    "store_name": ctx.store_name,
                    "order_type": ctx.order_type,
                    "channel": ctx.channel,

                    "raw_context": ctx.raw_context,
                })

            # ======================================
            # Root Breakdowns
            # ======================================

            root_breakdowns = txn.breakdowns.filter(
                parent__isnull=True
            )

            breakdowns = [
                self.get_breakdown_tree(bd)
                for bd in root_breakdowns
            ]

            # ======================================
            # Final Transaction Data
            # ======================================

            results.append({
                "id": txn.id,
                "transaction_id": txn.transaction_id,
                "transaction_type": txn.transaction_type,
                "transaction_status": txn.transaction_status,
                "description": txn.description,
                "posted_date": txn.posted_date,
                "total_amount": txn.total_amount,
                "currency_code": txn.currency_code,

                "related_identifiers": related_identifiers,

                "contexts": contexts,

                "breakdowns": breakdowns,

                "raw_payload": txn.raw_payload,

                "created_at": txn.created_at,
                "updated_at": txn.updated_at,
            })

        # ==========================================
        # Response
        # ==========================================

        return Response(
            {
                "status": True,
                "message": "Transactions fetched successfully",

                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_pages": paginator.num_pages,
                    "total_records": paginator.count,
                    "has_next": current_page.has_next(),
                    "has_previous": current_page.has_previous(),
                },

                "data": results
            },
            status=status.HTTP_200_OK
        )
        
                    