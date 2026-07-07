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


class CreateSPNegativeKeywordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        negative_keywords = data.get("negative_keywords", [])

        # ---------------- VALIDATION ----------------

        if not negative_keywords:
            return Response(
                {"status": False, "message": "negative_keywords data is required"},
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

        url = f"{base_url}/sp/negativeKeywords"

        # ---------------- FORMAT PAYLOAD ----------------

        formatted_negative_keywords = []

        for keyword in negative_keywords:
            formatted_item = {**keyword}

            if formatted_item.get("campaignId"):
                formatted_item["campaignId"] = str(formatted_item["campaignId"])

            if formatted_item.get("adGroupId"):
                formatted_item["adGroupId"] = str(formatted_item["adGroupId"])

            formatted_negative_keywords.append(formatted_item)

        payload = {"negativeKeywords": formatted_negative_keywords}

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spNegativeKeyword.v3+json",
            "Accept": "application/vnd.spNegativeKeyword.v3+json",
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

        created_negative_keywords = []

        success_items = response_data.get("negativeKeywords", {}).get("success", [])

        error_items = response_data.get("negativeKeywords", {}).get("error", [])

        parsed_errors = extract_amazon_errors(error_items)

        for item in success_items:
            negative_keyword_data = item.get("negativeKeyword", {})

            negative_keyword_id = item.get("negativeKeywordId")

            if not negative_keyword_id:
                negative_keyword_id = negative_keyword_data.get("keywordId")

            if not negative_keyword_id:
                continue

            campaign = AdsCampaign.objects.filter(
                campaign_id=negative_keyword_data.get("campaignId")
            ).first()

            ad_group = AdsAdGroup.objects.filter(
                ad_group_id=negative_keyword_data.get("adGroupId")
            ).first()

            negative_keyword_obj, created = AdsNegativeKeyword.objects.update_or_create(
                negative_keyword_id=int(negative_keyword_id),
                defaults={
                    "amazon_account": amazon_account,
                    "campaign": campaign,
                    "ad_group": ad_group,
                    "keyword_text": negative_keyword_data.get("keywordText"),
                    "match_type": negative_keyword_data.get("matchType"),
                    "state": negative_keyword_data.get("state"),
                    "native_language_keyword": bool(
                        negative_keyword_data.get("nativeLanguageKeyword")
                    ),
                    "serving_status": negative_keyword_data.get("extendedData", {}).get(
                        "servingStatus"
                    ),
                    "raw_data": negative_keyword_data,
                },
            )

            created_negative_keywords.append(
                {
                    "negative_keyword_id": negative_keyword_id,
                    "keyword_text": negative_keyword_obj.keyword_text,
                    "created": created,
                }
            )

        # ---------------- SUCCESS RESPONSE ----------------

        return Response(
            {
                "status": len(created_negative_keywords) > 0,
                "message": "Negative keywords processed",
                "created_count": len(created_negative_keywords),
                "error_count": len(parsed_errors),
                "errors": parsed_errors,
                "data": created_negative_keywords,
                "amazon_response": response_data,
            }
        )


class CreateSPCampaignNegativeKeywordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        negative_keywords = data.get("negative_keywords", [])

        # ---------------- VALIDATION ----------------

        if not negative_keywords:
            return Response(
                {"status": False, "message": "negative_keywords data is required"},
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

        url = f"{base_url}/sp/campaignNegativeKeywords"

        # ---------------- FORMAT PAYLOAD ----------------

        formatted_negative_keywords = []

        for keyword in negative_keywords:
            formatted_item = {**keyword}

            if formatted_item.get("campaignId"):
                formatted_item["campaignId"] = str(formatted_item["campaignId"])

            formatted_negative_keywords.append(formatted_item)

        # ---------------- PAYLOAD ----------------

        payload = {"campaignNegativeKeywords": formatted_negative_keywords}

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spCampaignNegativeKeyword.v3+json",
            "Accept": "application/vnd.spCampaignNegativeKeyword.v3+json",
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

        created_negative_keywords = []

        success_items = response_data.get("campaignNegativeKeywords", {}).get(
            "success", []
        )

        error_items = response_data.get("campaignNegativeKeywords", {}).get("error", [])

        parsed_errors = extract_amazon_errors(error_items)

        for item in success_items:
            negative_keyword_data = item.get("campaignNegativeKeyword", {})

            negative_keyword_id = item.get("campaignNegativeKeywordId")

            if not negative_keyword_id:
                negative_keyword_id = negative_keyword_data.get("keywordId")

            if not negative_keyword_id:
                continue

            campaign = AdsCampaign.objects.filter(
                campaign_id=negative_keyword_data.get("campaignId")
            ).first()

            negative_keyword_obj, created = AdsNegativeKeyword.objects.update_or_create(
                negative_keyword_id=int(negative_keyword_id),
                defaults={
                    "amazon_account": amazon_account,
                    "campaign": campaign,
                    "ad_group": None,
                    "keyword_text": negative_keyword_data.get("keywordText"),
                    "match_type": negative_keyword_data.get("matchType"),
                    "state": negative_keyword_data.get("state"),
                    "native_language_keyword": bool(
                        negative_keyword_data.get("nativeLanguageKeyword")
                    ),
                    "serving_status": negative_keyword_data.get("extendedData", {}).get(
                        "servingStatus"
                    ),
                    "raw_data": negative_keyword_data,
                },
            )

            created_negative_keywords.append(
                {
                    "negative_keyword_id": negative_keyword_id,
                    "keyword_text": negative_keyword_obj.keyword_text,
                    "created": created,
                }
            )

        # ---------------- SUCCESS RESPONSE ----------------

        return Response(
            {
                "status": len(created_negative_keywords) > 0,
                "message": "Campaign negative keywords processed",
                "created_count": len(created_negative_keywords),
                "error_count": len(parsed_errors),
                "errors": parsed_errors,
                "data": created_negative_keywords,
                "amazon_response": response_data,
            }
        )
