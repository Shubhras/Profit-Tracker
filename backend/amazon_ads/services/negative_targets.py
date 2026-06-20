import requests
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.utils import refresh_ads_access_token, extract_amazon_errors, get_primary_amazon_account


class CreateSPNegativeTargetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        negative_targets = data.get("negative_targets", [])

        # ---------------- VALIDATION ----------------

        if not negative_targets:
            return Response(
                {"status": False, "message": "negative_targets data is required"},
                status=400,
            )

        # ---------------- AMAZON ACCOUNT ----------------

        try:
            amazon_account = get_primary_amazon_account()
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

        url = f"{base_url}/sp/negativeTargets"

        # ---------------- FORMAT PAYLOAD ----------------

        formatted_negative_targets = []

        for target in negative_targets:
            formatted_item = {**target}

            if formatted_item.get("campaignId"):
                formatted_item["campaignId"] = str(formatted_item["campaignId"])

            if formatted_item.get("adGroupId"):
                formatted_item["adGroupId"] = str(formatted_item["adGroupId"])

            formatted_negative_targets.append(formatted_item)

        payload = {"negativeTargetingClauses": formatted_negative_targets}

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spNegativeTargetingClause.v3+json",
            "Accept": "application/vnd.spNegativeTargetingClause.v3+json",
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

        # ---------------- SUCCESS RESPONSE ----------------

        return Response(
            {
                "status": True,
                "message": "Negative targets created successfully",
                "amazon_response": response_data,
            }
        )


class CreateSPCampaignNegativeTargetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        negative_targets = data.get("negative_targets", [])

        # ---------------- VALIDATION ----------------

        if not negative_targets:
            return Response(
                {"status": False, "message": "negative_targets data is required"},
                status=400,
            )

        # ---------------- AMAZON ACCOUNT ----------------

        try:
            amazon_account = get_primary_amazon_account()
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

        url = f"{base_url}/sp/campaignNegativeTargets"

        # ---------------- FORMAT PAYLOAD ----------------

        formatted_negative_targets = []

        for target in negative_targets:
            formatted_item = {**target}

            if formatted_item.get("campaignId"):
                formatted_item["campaignId"] = str(formatted_item["campaignId"])

            formatted_negative_targets.append(formatted_item)

        # ---------------- PAYLOAD ----------------

        payload = {"campaignNegativeTargetingClauses": formatted_negative_targets}

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spCampaignNegativeTargetingClause.v3+json",
            "Accept": "application/vnd.spCampaignNegativeTargetingClause.v3+json",
            "Prefer": "return=representation",
        }

        # ---------------- AMAZON REQUEST ----------------

        try:
            print("URL:", url)
            print("PAYLOAD:", payload)

            response = requests.post(url, headers=headers, json=payload)

            print("STATUS:", response.status_code)
            print("RESPONSE:", response.text)

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

        # ---------------- RESPONSE PARSING ----------------

        success_items = response_data.get("campaignNegativeTargetingClauses", {}).get(
            "success", []
        )

        error_items = response_data.get("campaignNegativeTargetingClauses", {}).get(
            "error", []
        )

        parsed_errors = extract_amazon_errors(error_items)

        # ---------------- SUCCESS RESPONSE ----------------

        return Response(
            {
                "status": len(success_items) > 0,
                "message": "Campaign negative targets processed",
                "created_count": len(success_items),
                "error_count": len(parsed_errors),
                "errors": parsed_errors,
                "amazon_response": response_data,
            }
        )
