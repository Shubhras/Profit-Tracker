import requests
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from amazon_ads.models import *
from amazon_ads.models import AdsCampaign
from amazon_ads.utils import (
    ads_api_request,
    extract_amazon_errors,
    refresh_ads_access_token,
    get_primary_amazon_account
)


def sync_campaigns(account):

    payload = {
        "maxResults": 1000
    }

    response = ads_api_request(
        account=account,
        method="POST",
        endpoint="/sp/campaigns/list",
        payload=payload
    )

    if response.status_code != 200:

        print("CAMPAIGN SYNC ERROR")
        print(response.text)

        return False

    data = response.json()

    campaigns = data.get("campaigns", [])

    saved = 0

    for item in campaigns:

        dynamic_bidding = item.get(
            "dynamicBidding", {}
        )

        AdsCampaign.objects.update_or_create(

            campaign_id=item["campaignId"],

            defaults={

                "amazon_account":
                account,

                "name":
                item.get("name"),

                "start_date":
                item.get("startDate"),

                "state":
                item.get("state"),

                "campaign_type":
                item.get("campaignType"),

                "targeting_type":
                item.get("targetingType"),

                "daily_budget":
                item.get("budget", {}).get(
                    "budget", 0
                ),

                "budget_type":
                item.get("budget", {}).get(
                    "budgetType"
                ),

                "bidding_strategy":
                dynamic_bidding.get(
                    "strategy"
                ),

                "placement_bidding":
                dynamic_bidding.get(
                    "placementBidding", []
                ),

                "marketplace_budget_allocation":
                item.get(
                    "marketplaceBudgetAllocation"
                ),

                "off_amazon_settings":
                item.get(
                    "offAmazonSettings", {}
                ),

                "tags":
                item.get(
                    "tags", {}
                ),

                "raw_data":
                item
            }
        )

        saved += 1

    print(f"TOTAL CAMPAIGNS SAVED: {saved}")

    return True




class UpdateSPCampaignView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request):

        data = request.data

        profile_id = data.get("profile_id")
        campaigns = data.get("campaigns", [])

        # ---------------- VALIDATION ----------------

        if not profile_id:
            return Response({
                "status": False,
                "message": "profile_id is required"
            }, status=400)

        if not campaigns:
            return Response({
                "status": False,
                "message": "campaigns data is required"
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

        url = f"{base_url}/sp/campaigns"

        # ---------------- FORMAT PAYLOAD ----------------

        formatted_campaigns = []

        for campaign in campaigns:

            formatted_item = {
                **campaign
            }

            # Amazon v3 APIs require IDs as strings
            if formatted_item.get("campaignId"):
                formatted_item["campaignId"] = str(
                    formatted_item["campaignId"]
                )

            if formatted_item.get("portfolioId"):
                formatted_item["portfolioId"] = str(
                    formatted_item["portfolioId"]
                )

            formatted_campaigns.append(formatted_item)

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spCampaign.v3+json",
            "Accept": "application/vnd.spCampaign.v3+json",
            "Prefer": "return=representation"
        }

        # ---------------- PAYLOAD ----------------

        payload = {
            "campaigns": formatted_campaigns
        }

        # ---------------- AMAZON REQUEST ----------------

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

        # ---------------- UPDATE DB ----------------

        updated_campaigns = []

        success_items = response_data.get(
            "campaigns",
            {}
        ).get(
            "success",
            []
        )

        for item in success_items:

            campaign_data = item.get("campaign", {})

            campaign_id = campaign_data.get("campaignId")

            if not campaign_id:
                continue

            try:

                campaign_obj = AdsCampaign.objects.get(
                    campaign_id=int(campaign_id)
                )

                # update state
                if campaign_data.get("state"):
                    campaign_obj.state = campaign_data.get("state")

                # update budget
                budget_data = campaign_data.get("budget", {})

                if budget_data.get("budget") is not None:
                    campaign_obj.daily_budget = float(
                        budget_data.get("budget")
                    )

                # update bidding strategy
                dynamic_bidding = campaign_data.get(
                    "dynamicBidding",
                    {}
                )

                if dynamic_bidding.get("strategy"):
                    campaign_obj.bidding_strategy = dynamic_bidding.get(
                        "strategy"
                    )

                # save raw response
                campaign_obj.raw_data = campaign_data

                campaign_obj.save()

                updated_campaigns.append({
                    "campaign_id": campaign_id,
                    "status": "updated"
                })

            except AdsCampaign.DoesNotExist:

                updated_campaigns.append({
                    "campaign_id": campaign_id,
                    "status": "not_found"
                })

        # ---------------- SUCCESS RESPONSE ----------------

        return Response({
            "status": True,
            "message": "Campaigns updated successfully",
            "updated_count": len(updated_campaigns),
            "data": updated_campaigns,
            "amazon_response": response_data
        })

class CreateSPCampaignView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

       
        campaigns = data.get("campaigns", [])

        # ---------------- VALIDATION ----------------

       

        if not campaigns:
            return Response(
                {"status": False, "message": "campaigns data is required"}, status=400
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

        url = f"{base_url}/sp/campaigns"

        # ---------------- FORMAT PAYLOAD ----------------

        formatted_campaigns = []

        for campaign in campaigns:
            formatted_item = {**campaign}

            if formatted_item.get("portfolioId"):
                formatted_item["portfolioId"] = str(formatted_item["portfolioId"])

            formatted_campaigns.append(formatted_item)

        payload = {"campaigns": formatted_campaigns}

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spCampaign.v3+json",
            "Accept": "application/vnd.spCampaign.v3+json",
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

        created_campaigns = []

        success_items = response_data.get("campaigns", {}).get("success", [])

        error_items = response_data.get("campaigns", {}).get("error", [])

        parsed_errors = extract_amazon_errors(error_items)

        for item in success_items:
            campaign_data = item.get("campaign", {})

            campaign_id = campaign_data.get("campaignId")

            if not campaign_id:
                continue

            dynamic_bidding = campaign_data.get("dynamicBidding", {})

            budget_data = campaign_data.get("budget", {})

            campaign_obj, created = AdsCampaign.objects.update_or_create(
                campaign_id=int(campaign_id),
                defaults={
                    "amazon_account": amazon_account,
                    "name": campaign_data.get("name"),
                    "state": campaign_data.get("state"),
                    "start_date": campaign_data.get("startDate"),
                    "campaign_type": campaign_data.get("campaignType"),
                    "targeting_type": campaign_data.get("targetingType"),
                    "daily_budget": budget_data.get("budget", 0),
                    "budget_type": budget_data.get("budgetType"),
                    "bidding_strategy": dynamic_bidding.get("strategy"),
                    "placement_bidding": dynamic_bidding.get("placementBidding", []),
                    "marketplace_budget_allocation": campaign_data.get(
                        "marketplaceBudgetAllocation"
                    ),
                    "off_amazon_settings": campaign_data.get("offAmazonSettings", {}),
                    "tags": campaign_data.get("tags", {}),
                    "raw_data": campaign_data,
                },
            )

            created_campaigns.append(
                {
                    "campaign_id": campaign_id,
                    "name": campaign_obj.name,
                    "created": created,
                }
            )

        # ---------------- SUCCESS RESPONSE ----------------

        return Response(
            {
                "status": len(created_campaigns) > 0,
                "message": "Campaign processed",
                "created_count": len(created_campaigns),
                "error_count": len(parsed_errors),
                "errors": parsed_errors,
                "data": created_campaigns,
                "amazon_response": response_data,
            }
        )