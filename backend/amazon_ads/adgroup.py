import json

import requests
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AdsAdGroup, AdsCampaign, AmazonAdsAccount
from .utils import extract_amazon_errors, refresh_ads_access_token, get_primary_amazon_account


class UpdateSPAdGroupView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request):

        data = request.data

        profile_id = data.get("profile_id")
        ad_groups = data.get("ad_groups", [])

        # ---------------- VALIDATION ----------------

        if not profile_id:
            return Response({
                "status": False,
                "message": "profile_id is required"
            }, status=400)

        if not ad_groups:
            return Response({
                "status": False,
                "message": "ad_groups data is required"
            }, status=400)

        # ---------------- AMAZON ACCOUNT ----------------

        try:
            amazon_account = AmazonAdsAccount.objects.get(
                profile_id=profile_id
            )

        except AmazonAdsAccount.DoesNotExist:
            return Response({
                "status": False,
                "message": "Amazon account not found"
            }, status=404)

        # ---------------- REFRESH TOKEN ----------------

        access_token = refresh_ads_access_token(amazon_account)
        client_id = amazon_account.client_id
        region = amazon_account.region

        # ---------------- REGION BASE URL ----------------

        if region == "EU":
            base_url = "https://advertising-api-eu.amazon.com"

        elif region == "FE":
            base_url = "https://advertising-api-fe.amazon.com"

        else:
            base_url = "https://advertising-api.amazon.com"

        url = f"{base_url}/sp/adGroups"

        # ---------------- CONVERT IDS TO STRING ----------------

        formatted_ad_groups = []

        for ad_group in ad_groups:

            formatted_item = {
                **ad_group
            }

            # Amazon v3 APIs require IDs as strings
            if formatted_item.get("adGroupId"):
                formatted_item["adGroupId"] = str(
                    formatted_item["adGroupId"]
                )

            if formatted_item.get("campaignId"):
                formatted_item["campaignId"] = str(
                    formatted_item["campaignId"]
                )

            formatted_ad_groups.append(formatted_item)

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spAdGroup.v3+json",
            "Accept": "application/vnd.spAdGroup.v3+json",
            "Prefer": "return=representation"
        }

        # ---------------- PAYLOAD ----------------

        payload = {
            "adGroups": formatted_ad_groups
        }

        # ---------------- AMAZON API REQUEST ----------------

        try:

            response = requests.put(
                url,
                headers=headers,
                json=payload
            )

            response_data = response.json()

        except Exception as e:
            return Response({
                "status": False,
                "message": "Amazon API request failed",
                "error": str(e)
            }, status=500)

        # ---------------- AMAZON ERROR ----------------

        if response.status_code not in [200, 207]:

            return Response({
                "status": False,
                "message": "Amazon API error",
                "amazon_response": response_data
            }, status=response.status_code)

        # ---------------- SAVE UPDATED DATA ----------------

        updated_ad_groups = []

        success_items = response_data.get(
            "adGroups",
            {}
        ).get(
            "success",
            []
        )

        for item in success_items:

            ad_group_data = item.get("adGroup", {})

            ad_group_id = ad_group_data.get("adGroupId")

            if not ad_group_id:
                continue

            try:

                ad_group_obj = AdsAdGroup.objects.get(
                    ad_group_id=int(ad_group_id)
                )

                # update only state
                if ad_group_data.get("state"):
                    ad_group_obj.state = ad_group_data.get("state")

                # update only default bid
                if ad_group_data.get("defaultBid") is not None:
                    ad_group_obj.default_bid = float(
                        ad_group_data.get("defaultBid")
                    )

                ad_group_obj.save()

                updated_ad_groups.append({
                    "ad_group_id": ad_group_id,
                    "status": "updated"
                })

            except AdsAdGroup.DoesNotExist:

                updated_ad_groups.append({
                    "ad_group_id": ad_group_id,
                    "status": "not_found"
                })
        # ---------------- SUCCESS RESPONSE ----------------

        return Response({
            "status": True,
            "message": "Ad groups updated successfully",
            "updated_count": len(updated_ad_groups),
            "data": updated_ad_groups,
            "amazon_response": response_data
        })

class CreateSPAdGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        ad_groups = data.get("ad_groups", [])

        # ---------------- VALIDATION ----------------


        if not ad_groups:
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

        url = f"{base_url}/sp/adGroups"

        # ---------------- FORMAT PAYLOAD ----------------

        formatted_ad_groups = []

        for ad_group in ad_groups:
            formatted_item = {**ad_group}

            if formatted_item.get("campaignId"):
                formatted_item["campaignId"] = str(formatted_item["campaignId"])

            formatted_ad_groups.append(formatted_item)

        payload = {"adGroups": formatted_ad_groups}

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spAdGroup.v3+json",
            "Accept": "application/vnd.spAdGroup.v3+json",
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

        created_ad_groups = []

        success_items = response_data.get("adGroups", {}).get("success", [])

        error_items = response_data.get("adGroup", {}).get("error", [])

        parsed_errors = extract_amazon_errors(error_items)

        for item in success_items:
            ad_group_data = item.get("adGroup", {})

            ad_group_id = ad_group_data.get("adGroupId")

            if not ad_group_id:
                continue

            campaign = AdsCampaign.objects.filter(
                campaign_id=ad_group_data.get("campaignId")
            ).first()

            ad_group_obj, created = AdsAdGroup.objects.update_or_create(
                ad_group_id=ad_group_id,
                defaults={
                    "amazon_account": amazon_account,
                    "campaign": campaign,
                    "name": ad_group_data.get("name"),
                    "state": ad_group_data.get("state"),
                    "default_bid": ad_group_data.get("defaultBid", 0),
                    "raw_data": ad_group_data,
                },
            )

            created_ad_groups.append(
                {
                    "ad_group_id": ad_group_id,
                    "name": ad_group_obj.name,
                    "created": created,
                }
            )

        # ---------------- SUCCESS RESPONSE ----------------

        return Response(
            {
                "status": len(created_ad_groups) > 0,
                "message": "AdGroup processed",
                "created_count": len(created_ad_groups),
                "error_count": len(parsed_errors),
                "errors": parsed_errors,
                "data": created_ad_groups,
                "amazon_response": response_data,
            }
        )