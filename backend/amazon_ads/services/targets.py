import requests
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from amazon_ads.models import *
from amazon_ads.utils import (
    extract_amazon_errors,
    get_primary_amazon_account,
    refresh_ads_access_token,
)


class CreateSPTargetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        targets = data.get("targets", [])

        # ---------------- VALIDATION ----------------

        if not targets:
            return Response(
                {"status": False, "message": "targets data is required"}, status=400
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

        url = f"{base_url}/sp/targets"

        # ---------------- FORMAT PAYLOAD ----------------

        formatted_targets = []

        for target in targets:
            formatted_item = {**target}

            if formatted_item.get("campaignId"):
                formatted_item["campaignId"] = str(formatted_item["campaignId"])

            if formatted_item.get("adGroupId"):
                formatted_item["adGroupId"] = str(formatted_item["adGroupId"])

            formatted_targets.append(formatted_item)

        payload = {"targetingClauses": formatted_targets}

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spTargetingClause.v3+json",
            "Accept": "application/vnd.spTargetingClause.v3+json",
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

        created_targets = []

        success_items = response_data.get("targetingClauses", {}).get("success", [])

        error_items = response_data.get("targetingClauses", {}).get("error", [])

        parsed_errors = extract_amazon_errors(error_items)

        for item in success_items:
            target_data = item.get("targetingClause", {})

            target_id = target_data.get("targetId")

            if not target_id:
                continue

            campaign = AdsCampaign.objects.filter(
                campaign_id=target_data.get("campaignId")
            ).first()

            ad_group = AdsAdGroup.objects.filter(
                ad_group_id=target_data.get("adGroupId")
            ).first()

            target_obj, created = AdsTarget.objects.update_or_create(
                target_id=str(target_id),
                defaults={
                    "amazon_account": amazon_account,
                    "campaign": campaign,
                    "ad_group": ad_group,
                    "expression_type": target_data.get("expressionType"),
                    "expression": target_data.get("expression", []),
                    "bid": target_data.get(
                        "bid",
                    ),
                    "state": target_data.get("state"),
                    "raw_data": target_data,
                },
            )

            created_targets.append({"target_id": target_id, "created": created})

        # ---------------- SUCCESS RESPONSE ----------------

        return Response(
            {
                "status": len(created_targets) > 0,
                "message": "targets processed",
                "created_count": len(created_targets),
                "error_count": len(parsed_errors),
                "errors": parsed_errors,
                "data": created_targets,
                "amazon_response": response_data,
            }
        )
