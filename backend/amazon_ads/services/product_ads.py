import requests
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from amazon_ads.models import *
from amazon_ads.utils import refresh_ads_access_token, extract_amazon_errors, get_primary_amazon_account


class CreateSPProductAdView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        product_ads = data.get("product_ads", [])

        # ---------------- VALIDATION ----------------

        if not product_ads:
            return Response(
                {"status": False, "message": "ad_groups data is required"}, status=400
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

        url = f"{base_url}/sp/productAds"

        # ---------------- FORMAT PAYLOAD ----------------

        formatted_product_ads = []

        for product_ad in product_ads:
            formatted_item = {**product_ad}

            if formatted_item.get("campaignId"):
                formatted_item["campaignId"] = str(formatted_item["campaignId"])

            if formatted_item.get("adGroupId"):
                formatted_item["adGroupId"] = str(formatted_item["adGroupId"])

            formatted_product_ads.append(formatted_item)

        payload = {"productAds": formatted_product_ads}

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spProductAd.v3+json",
            "Accept": "application/vnd.spProductAd.v3+json",
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

        created_product_ads = []

        success_items = response_data.get("productAds", {}).get("success", [])

        error_items = response_data.get("productAds", {}).get("error", [])
        
        parsed_errors = extract_amazon_errors(error_items)
                
        for item in success_items:
            product_ad_data = item.get("productAd", {})

            ad_id = product_ad_data.get("adId")

            if not ad_id:
                continue

            campaign = AdsCampaign.objects.filter(
                campaign_id=product_ad_data.get("campaignId")
            ).first()

            ad_group = AdsAdGroup.objects.filter(
                ad_group_id=product_ad_data.get("adGroupId")
            ).first()

            product_ad_obj, created = AdsProductAd.objects.update_or_create(
                ad_id=ad_id,
                defaults={
                    "amazon_account": amazon_account,
                    "campaign": campaign,
                    "ad_group": ad_group,
                    "asin": product_ad_data.get("asin"),
                    "sku": product_ad_data.get("sku"),
                    "state": product_ad_data.get("state"),
                    "raw_data": product_ad_data,
                },
            )

            created_product_ads.append(
                {
                    "ad_id": ad_id,
                    "sku": product_ad_obj.sku,
                    "asin": product_ad_obj.asin,
                    "created": created,
                }
            )

        # ---------------- SUCCESS RESPONSE ----------------

        return Response(
            {
                "status": len(created_product_ads) > 0,
                "message": "ProductAd processed",
                "created_count": len(created_product_ads),
                "error_count": len(parsed_errors),
                "errors": parsed_errors,
                "data": created_product_ads,
                "amazon_response": response_data,
            }
        )
