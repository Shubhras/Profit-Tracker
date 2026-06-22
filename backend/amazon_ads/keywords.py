import requests
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AdsAdGroup, AdsCampaign, AdsKeyword, AmazonAdsAccount
from .utils import extract_amazon_errors, refresh_ads_access_token, get_primary_amazon_account


class UpdateSPKeywordView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request):

        data = request.data

        profile_id = data.get("profile_id")
        keywords = data.get("keywords", [])

        # ---------------- VALIDATION ----------------

        if not profile_id:
            return Response({
                "status": False,
                "message": "profile_id is required"
            }, status=400)

        if not keywords:
            return Response({
                "status": False,
                "message": "keywords data is required"
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

        url = f"{base_url}/sp/keywords"

        # ---------------- FORMAT PAYLOAD ----------------

        formatted_keywords = []

        for keyword in keywords:

            formatted_item = {
                **keyword
            }

            # Amazon v3 APIs require IDs as strings
            if formatted_item.get("keywordId"):
                formatted_item["keywordId"] = str(
                    formatted_item["keywordId"]
                )

            if formatted_item.get("campaignId"):
                formatted_item["campaignId"] = str(
                    formatted_item["campaignId"]
                )

            if formatted_item.get("adGroupId"):
                formatted_item["adGroupId"] = str(
                    formatted_item["adGroupId"]
                )

            formatted_keywords.append(formatted_item)

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spKeyword.v3+json",
            "Accept": "application/vnd.spKeyword.v3+json",
            "Prefer": "return=representation"
        }

        # ---------------- PAYLOAD ----------------

        payload = {
            "keywords": formatted_keywords
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

        updated_keywords = []

        success_items = response_data.get(
            "keywords",
            {}
        ).get(
            "success",
            []
        )

        for item in success_items:

            keyword_data = item.get("keyword", {})

            keyword_id = keyword_data.get("keywordId")

            if not keyword_id:
                continue

            try:

                keyword_obj = AdsKeyword.objects.get(
                    keyword_id=str(keyword_id)
                )

                # update state
                if keyword_data.get("state"):
                    keyword_obj.state = keyword_data.get("state")

                # update bid
                if keyword_data.get("bid") is not None:
                    keyword_obj.bid = float(
                        keyword_data.get("bid")
                    )

                # update raw data
                keyword_obj.raw_data = keyword_data

                keyword_obj.save()

                updated_keywords.append({
                    "keyword_id": keyword_id,
                    "status": "updated"
                })

            except AdsKeyword.DoesNotExist:

                updated_keywords.append({
                    "keyword_id": keyword_id,
                    "status": "not_found"
                })

        # ---------------- SUCCESS RESPONSE ----------------

        return Response({
            "status": True,
            "message": "Keywords updated successfully",
            "updated_count": len(updated_keywords),
            "data": updated_keywords,
            "amazon_response": response_data
        })

class CreateSPKeywordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        keywords = data.get("keywords", [])

        # ---------------- VALIDATION ----------------

        if not keywords:
            return Response(
                {"status": False, "message": "keywords data is required"}, status=400
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

        url = f"{base_url}/sp/keywords"

        # ---------------- FORMAT PAYLOAD ----------------

        formatted_keywords = []

        for keyword in keywords:
            formatted_item = {**keyword}

            if formatted_item.get("campaignId"):
                formatted_item["campaignId"] = str(formatted_item["campaignId"])

            if formatted_item.get("adGroupId"):
                formatted_item["adGroupId"] = str(formatted_item["adGroupId"])

            formatted_keywords.append(formatted_item)

        # ---------------- PAYLOAD ----------------

        payload = {"keywords": formatted_keywords}

        # ---------------- HEADERS ----------------

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/vnd.spKeyword.v3+json",
            "Accept": "application/vnd.spKeyword.v3+json",
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

        created_keywords = []

        success_items = response_data.get("keywords", {}).get("success", [])

        error_items = response_data.get("keywords", {}).get("error", [])

        parsed_errors = extract_amazon_errors(error_items)

        for item in success_items:
            keyword_data = item.get("keyword", {})

            keyword_id = keyword_data.get("keywordId")

            if not keyword_id:
                continue

            campaign = AdsCampaign.objects.filter(
                campaign_id=keyword_data.get("campaignId")
            ).first()

            ad_group = AdsAdGroup.objects.filter(
                ad_group_id=keyword_data.get("adGroupId")
            ).first()

            keyword_obj, created = AdsKeyword.objects.update_or_create(
                keyword_id=str(keyword_id),
                defaults={
                    "amazon_account": amazon_account,
                    "campaign": campaign,
                    "ad_group": ad_group,
                    "keyword_text": keyword_data.get("keywordText"),
                    "match_type": keyword_data.get("matchType"),
                    "bid": keyword_data.get("bid"),
                    "state": keyword_data.get("state"),
                    "raw_data": keyword_data,
                },
            )

            created_keywords.append(
                {
                    "keyword_id": keyword_id,
                    "keyword_text": keyword_obj.keyword_text,
                    "created": created,
                }
            )

        # ---------------- SUCCESS RESPONSE ----------------

        return Response(
            {
                "status": len(created_keywords) > 0,
                "message": "Keywords processed",
                "created_count": len(created_keywords),
                "error_count": len(parsed_errors),
                "errors": parsed_errors,
                "data": created_keywords,
                "amazon_response": response_data,
            }
        )