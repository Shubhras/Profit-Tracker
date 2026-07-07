import requests
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from amazon_ads.models import (
    AdsAdGroup,
    AdsCampaign,
    AdsNegativeTarget,
)
from amazon_ads.utils import (
    extract_amazon_errors,
    get_primary_amazon_account,
    refresh_ads_access_token,
)


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

        # ---------------- SAVE TO DB ----------------

        created_negative_targets = []

        success_items = response_data.get("negativeTargetingClauses", {}).get(
            "success", []
        )

        error_items = response_data.get("negativeTargetingClauses", {}).get("error", [])

        parsed_errors = extract_amazon_errors(error_items)

        for item in success_items:
            target_data = item.get("negativeTargetingClause", {})

            target_id = item.get("targetId")

            if not target_id:
                target_id = target_data.get("targetId")

            if not target_id:
                continue

            campaign = AdsCampaign.objects.filter(
                campaign_id=target_data.get("campaignId")
            ).first()

            ad_group = AdsAdGroup.objects.filter(
                ad_group_id=target_data.get("adGroupId")
            ).first()

            negative_target, created = AdsNegativeTarget.objects.update_or_create(
                negative_target_id=str(target_id),
                defaults={
                    "amazon_account": amazon_account,
                    "campaign": campaign,
                    "ad_group": ad_group,
                    "expression_type": target_data.get("expressionType"),
                    "expression": target_data.get("expression", []),
                    "resolved_expression": target_data.get("resolvedExpression", []),
                    "state": target_data.get("state"),
                    "serving_status": target_data.get("extendedData", {}).get(
                        "servingStatus"
                    ),
                    "raw_data": target_data,
                },
            )

            created_negative_targets.append(
                {"negative_target_id": target_id, "created": created}
            )

        # ---------------- SUCCESS RESPONSE ----------------

        return Response(
            {
                "status": len(success_items) > 0,
                "message": "Negative targets processed",
                "created_count": len(created_negative_targets),
                "error_count": len(parsed_errors),
                "errors": parsed_errors,
                "data": created_negative_targets,
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

        # ---------------- SAVE TO DB ----------------

        created_negative_targets = []

        success_items = response_data.get("campaignNegativeTargetingClauses", {}).get(
            "success", []
        )

        error_items = response_data.get("campaignNegativeTargetingClauses", {}).get(
            "error", []
        )

        parsed_errors = extract_amazon_errors(error_items)

        for item in success_items:
            target_data = item.get("campaignNegativeTargetingClauses", {})

            target_id = item.get("campaignNegativeTargetingClauseId")

            if not target_id:
                target_id = target_data.get("targetId")

            if not target_id:
                continue

            campaign = AdsCampaign.objects.filter(
                campaign_id=target_data.get("campaignId")
            ).first()

            negative_target, created = AdsNegativeTarget.objects.update_or_create(
                negative_target_id=str(target_id),
                defaults={
                    "amazon_account": amazon_account,
                    "campaign": campaign,
                    "ad_group": None,
                    "expression_type": target_data.get("expressionType"),
                    "expression": target_data.get("expression", []),
                    "resolved_expression": target_data.get("resolvedExpression", []),
                    "state": target_data.get("state"),
                    "serving_status": target_data.get("extendedData", {}).get(
                        "servingStatus"
                    ),
                    "raw_data": target_data,
                },
            )

            created_negative_targets.append(
                {"negative_target_id": target_id, "created": created}
            )

        # ---------------- SUCCESS RESPONSE ----------------

        return Response(
            {
                "status": len(success_items) > 0,
                "message": "Campaign negative targets processed",
                "created_count": len(created_negative_targets),
                "error_count": len(parsed_errors),
                "errors": parsed_errors,
                "data": created_negative_targets,
                "amazon_response": response_data,
            }
        )
