import requests
from django.db.models import Q, Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView, status

from amazon_ads.models import *
from amazon_ads.utils import (
    extract_amazon_errors,
    get_primary_amazon_account,
    refresh_ads_access_token,
)
from amazon_auth.models import AmazonCatalogDetails


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


class CampaignProductListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # ---------------- USER ----------------

        user = request.user

        data = request.data
        from_date = data.get("fromDate")
        end_date = data.get("endDate")

        # ---------------- AMAZON ACCOUNT ----------------

        try:
            amazon_account = get_primary_amazon_account(user)

        except Exception as e:
            return Response(
                {
                    "status": False,
                    "message": str(e),
                },
                status=404,
            )

        # ---------------- FILTERS ----------------

        asin = data.get("asin")
        parent_asin = data.get("parent_asin")
        brand = data.get("brand")
        marketplace_id = data.get("marketplace_id")
        search = data.get("search", "")

        pagination = data.get("pagination", {})

        page_no = max(1, int(pagination.get("page", 1)))
        page_size = min(max(1, int(pagination.get("page_size", 10))), 100)

        queryset = AmazonCatalogDetails.objects.filter(user=user).order_by(
            "-created_at"
        )

        # ---------------- FILTERS ----------------

        if asin:
            queryset = queryset.filter(asin=asin)

        if parent_asin:
            queryset = queryset.filter(parent_asin=parent_asin)

        if brand:
            queryset = queryset.filter(brand__icontains=brand)

        if marketplace_id:
            queryset = queryset.filter(marketplace_id=marketplace_id)

        # ---------------- SEARCH ----------------

        if search:
            sku_matches = AdsProductAd.objects.filter(
                amazon_account=amazon_account,
                sku__icontains=search,
            ).values_list("asin", flat=True)

            queryset = queryset.filter(
                Q(item_name__icontains=search)
                | Q(brand__icontains=search)
                | Q(asin__icontains=search)
                | Q(asin__in=sku_matches)
            )

        # ---------------- PAGINATION ----------------

        total_count = queryset.count()

        start = (page_no - 1) * page_size

        end = start + page_size

        queryset = queryset[start:end]

        # ---------------- PERFORMANCE QUERY ----------------
        metrics_queryset = ProductAdMetric.objects.filter(
            product_ad__amazon_account=amazon_account
        )
        if from_date:
            metrics_queryset = metrics_queryset.filter(report_date__gte=from_date)

        if end_date:
            metrics_queryset = metrics_queryset.filter(report_date__lte=end_date)
        metrics = metrics_queryset.values("product_ad__asin").annotate(
            ad_spend=Sum("cost"),
            ad_sales=Sum("sales"),
            orders=Sum("orders"),
            impressions=Sum("impressions"),
            clicks=Sum("clicks"),
        )

        metrics_by_asin = {
            row["product_ad__asin"]: {
                "adSpend": row["ad_spend"] or 0,
                "adSales": row["ad_sales"] or 0,
                "orders": row["orders"] or 0,
                "impressions": row["impressions"] or 0,
                "clicks": row["clicks"] or 0,
            }
            for row in metrics
        }

        # ---------------- PRODUCT ADS LOOKUP ----------------

        product_ads = list(
            AdsProductAd.objects.filter(amazon_account=amazon_account).values(
                "asin",
                "sku",
            )
        )

        sku_by_asin = {row["asin"]: row["sku"] for row in product_ads}

        advertised_asins = {row["asin"] for row in product_ads}

        # ---------------- BUILD RESPONSE ----------------

        products = list(
            queryset.values(
                "asin",
                "item_name",
                "brand",
                "image_url",
            )
        )

        default_performance = {
            "adSpend": 0,
            "adSales": 0,
            "orders": 0,
            "impressions": 0,
            "clicks": 0,
        }

        # ---------------- ATTACH PERFORMANCE ----------------

        for product in products:
            asin = product["asin"]

            product["sku"] = sku_by_asin.get(asin)

            product["isAdvertised"] = asin in advertised_asins

            product["performance"] = metrics_by_asin.get(
                asin,
                default_performance.copy(),
            )

        # ---------------- RESPONSE ----------------

        return Response(
            {
                "status": True,
                "statusCode": 200,
                "message": "Campaign products fetched successfully",
                "totalCount": total_count,
                "pageNo": page_no,
                "pageSize": page_size,
                "totalPages": (total_count + page_size - 1) // page_size,
                "data": products,
            },
            status=status.HTTP_200_OK,
        )
