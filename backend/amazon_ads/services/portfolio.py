import requests
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from amazon_ads.models import *
from amazon_ads.serializers import AdsPortfolioSerializer
from amazon_ads.utils import (
    extract_amazon_errors,
    get_primary_amazon_account,
    refresh_ads_access_token,
)


class PortfolioListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        account = get_primary_amazon_account(request.user)

        portfolios = AdsPortfolio.objects.filter(amazon_account=account)

        serializer = AdsPortfolioSerializer(portfolios, many=True)

        return Response(serializer.data)


class CreatePortfolioView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        # ---------------- VALIDATION ----------------

        portfolio_name = data.get("name")

        if not portfolio_name:
            return Response(
                {"status": False, "message": "name is required"}, status=400
            )

        # ---------------- AMAZON ACCOUNT ----------------

        try:
            amazon_account = get_primary_amazon_account(request.user)

            profile_id = amazon_account.profile_id

        except Exception as e:
            return Response({"status": False, "message": str(e)}, status=404)

        # ---------------- ACCESS TOKEN ----------------

        access_token = refresh_ads_access_token(amazon_account)

        client_id = amazon_account.client_id

        region = amazon_account.region

        # ---------------- REGION URL ----------------

        if region == "EU":
            base_url = "https://advertising-api-eu.amazon.com"

        elif region == "FE":
            base_url = "https://advertising-api-fe.amazon.com"

        else:
            base_url = "https://advertising-api.amazon.com"

        url = f"{base_url}/portfolios"

        # ---------------- PAYLOAD ----------------

        payload = {"portfolios": [{"name": portfolio_name, "state": "ENABLED"}]}

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spPortfolio.v3+json",
            "Accept": "application/vnd.spPortfolio.v3+json",
            "Prefer": "return=representation",
        }

        # ---------------- AMAZON REQUEST ----------------

        try:
            response = requests.post(url, headers=headers, json=payload)

            response_data = response.json()

        except Exception as e:
            return Response(
                {
                    "status": False,
                    "message": "Amazon API request failed",
                    "error": str(e),
                },
                status=500,
            )

        # ---------------- AMAZON ERROR ----------------

        if response.status_code not in [200, 201, 207]:
            return Response(
                {
                    "status": False,
                    "message": "Amazon API error",
                    "amazon_response": response_data,
                },
                status=response.status_code,
            )

        # ---------------- SAVE TO DB ----------------

        created_portfolios = []

        success_items = response_data.get("portfolios", {}).get("success", [])

        error_items = response_data.get("portfolios", {}).get("error", [])

        parsed_errors = extract_amazon_errors(error_items)

        for item in success_items:
            portfolio_data = item.get("portfolio", {})

            portfolio_id = portfolio_data.get("portfolioId") or item.get("portfolioId")

            if not portfolio_id:
                continue

            budget_data = portfolio_data.get("budget", {})

            portfolio_obj, created = AdsPortfolio.objects.update_or_create(
                portfolio_id=str(portfolio_id),
                defaults={
                    "amazon_account": amazon_account,
                    "name": portfolio_data.get("name"),
                    "state": portfolio_data.get("state"),
                    "in_budget": portfolio_data.get("inBudget", True),
                    "currency_code": budget_data.get("currencyCode"),
                    "budget_policy": budget_data.get("policy"),
                    "raw_data": portfolio_data,
                },
            )

            created_portfolios.append(
                {
                    "portfolio_id": portfolio_obj.portfolio_id,
                    "name": portfolio_obj.name,
                    "created": created,
                }
            )

        # ---------------- SUCCESS RESPONSE ----------------

        return Response(
            {
                "status": len(created_portfolios) > 0,
                "message": "Portfolio processed",
                "created_count": len(created_portfolios),
                "error_count": len(parsed_errors),
                "errors": parsed_errors,
                "data": created_portfolios,
                "amazon_response": response_data,
            }
        )
