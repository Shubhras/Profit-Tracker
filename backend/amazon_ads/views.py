from django.shortcuts import render
from rest_framework.decorators import api_view
from .models import *
from amazon_ads.services.campaigns import sync_campaigns
import secrets
from django.shortcuts import redirect
from rest_framework.permissions import IsAuthenticated, AllowAny
import requests
from .utils import *
from django.conf import settings
from django.core.cache import cache
import gzip
import json
from django.db.models import Q
from django.db.models import Sum
from django.db.models import Avg
from .serializers import *
from rest_framework.views import APIView
from user_auth.models import User 
from amazon_auth.models import AmazonAccount , AmazonListingItem
from rest_framework import status
from django.db.models import (
    Q,
    Sum,
    Count,
    F,
    Avg,
    FloatField,
    ExpressionWrapper,
    OuterRef,
    Subquery
)
from django.core.paginator import Paginator
from django.db.models.functions import Coalesce



AMAZON_ADS_REDIRECT_URI="https://trackmyprofit.com/api/amazon/callback/advertise"


from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class CustomPagination(PageNumberPagination):

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100
    def get_paginated_response(self, data):

        return Response({
            "status": True,
            "pagination": {
                "page": self.page.number,
                "page_size": self.page.paginator.per_page,
                "total_pages": self.page.paginator.num_pages,
                "total_records": self.page.paginator.count,
            },
            "results": data
        })
    
@api_view(["GET"])
def sync_campaigns_api(request):

    account = AmazonAdsAccount.objects.first()

    sync_campaigns(account)

    return Response({
        "status": True,
        "message": "Campaigns synced"
    })


client_id= settings.AMAZON_ADS_CLIENT_ID

class AmazonAdsConnectView(APIView):

    authentication_classes = []
    permission_classes = []

    def get(self, request):

        user_id = request.GET.get("user_id")

        if not user_id:
            return Response({
                "status": False,
                "message": "user_id required"
            })

        state = f"{user_id}:{secrets.token_hex(16)}"

        request.session["amazon_ads_state"] = state
        client_id= settings.AMAZON_ADS_CLIENT_ID
        print("client_id",client_id)

        auth_url = (
            "https://www.amazon.com/ap/oa?"
            f"client_id={settings.AMAZON_ADS_CLIENT_ID}"
            "&scope=advertising::campaign_management"
            "&response_type=code"
            f"&state={state}"
            f"&redirect_uri="
            f"{AMAZON_ADS_REDIRECT_URI}"
        )

        return redirect(auth_url)
    

class AmazonAdsCallbackView(APIView):

    authentication_classes = []
    permission_classes = []

    def get(self, request):

        code = request.GET.get("code")

        state = request.GET.get("state")

        error = request.GET.get("error")

        if error:
            return Response({
                "status": False,
                "error": error
            })

        if not code:
            return Response({
                "status": False,
                "message": "Authorization code missing"
            })

        # Prevent duplicate code use
        if cache.get(code):

            return Response({
                "status": False,
                "message": "Code already used"
            })

        cache.set(code, True, timeout=300)

        # Validate session state
        session_state = request.session.get(
            "amazon_ads_state"
        )

        # if (
        #     not session_state
        #     or session_state != state
        # ):

        #     return Response({
        #         "status": False,
        #         "message": "Invalid state"
        #     })

        # Extract user
        try:

            user_id = state.split(":")[0]

            user = User.objects.get(id=user_id)

            amazon_account = AmazonAccount.objects.filter(
                user=user
            ).first()

        except Exception as e:

            return Response({
                "status": False,
                "message": str(e)
            })

        # Exchange auth code
        token_response = self.exchange_token(code)

        client_id= settings.AMAZON_ADS_CLIENT_ID
        # print("client_id<<<<<<<<<<<<<<<<<<<<<<<",client_id)

        client_secreate= settings.AMAZON_ADS_CLIENT_SECRET
        # print("client_secreate>>>>>>>>>>>>>>>>>>>>>",client_secreate)

        if not token_response["status"]:

            return Response(token_response)

        access_token = token_response["access_token"]

        refresh_token = token_response["refresh_token"]


        # Fetch advertiser profiles
        profile_response = self.fetch_profiles(
            access_token
        )

        if not profile_response["status"]:

            return Response(profile_response)

        profiles = profile_response["profiles"]

        saved_profiles = []

        for profile in profiles:

            account, created = (
                AmazonAdsAccount.objects.update_or_create(
                    profile_id=profile["profileId"],
                    defaults={

                        "user": user,
                        "amazon_account":amazon_account,

                        "country_code":
                        profile.get("countryCode"),

                        "currency_code":
                        profile.get("currencyCode"),

                        "access_token":
                        access_token,

                        "refresh_token":
                        refresh_token,

                        "client_id":
                        settings.AMAZON_ADS_CLIENT_ID,

                        "client_secret":
                        settings.AMAZON_ADS_CLIENT_SECRET,

                        "account_info":
                        profile,

                        "region": "EU"
                    }
                )
            )

            saved_profiles.append({
                "profile_id":
                profile["profileId"],

                "country":
                profile.get("countryCode"),

                "created":
                created
            })

        return Response({
            "status": True,
            "message": "Amazon Ads connected",
            "profiles": saved_profiles
        })

    # =========================
    # TOKEN EXCHANGE
    # =========================

    def exchange_token(self, code):

        token_url = "https://api.amazon.com/auth/o2/token"

        payload = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": settings.AMAZON_ADS_CLIENT_ID,
            "client_secret": settings.AMAZON_ADS_CLIENT_SECRET,
            "redirect_uri": settings.AMAZON_ADS_REDIRECT_URI,
        }

        print("PAYLOAD:", payload)

        try:

            response = requests.post(
                token_url,
                data=payload,
                headers={
                    "Content-Type":
                    "application/x-www-form-urlencoded",

                    "Accept":
                    "application/json",

                    "User-Agent":
                    "TrackMyProfit/1.0"
                },
                timeout=30
            )

            print("STATUS:", response.status_code)
            print("BODY:", response.text)

        except requests.exceptions.RequestException as e:

            print("TOKEN ERROR:", str(e))

            return {
                "status": False,
                "message": str(e)
            }

        if response.status_code != 200:

            return {
                "status": False,
                "message": response.text
            }

        data = response.json()

        return {
            "status": True,
            "access_token": data.get("access_token"),
            "refresh_token": data.get("refresh_token")
        }
    # =========================
    # FETCH PROFILES
    # =========================

    def fetch_profiles(self, access_token):

        try:

            response = requests.get(
                "https://advertising-api-eu.amazon.com/v2/profiles",
                headers={
                    "Authorization":
                    f"Bearer {access_token}",

                    "Amazon-Advertising-API-ClientId":
                    settings.AMAZON_ADS_CLIENT_ID
                },
                timeout=30
            )

        except Exception as e:

            return {
                "status": False,
                "message": str(e)
            }

        print("PROFILE STATUS:", response.status_code)
        print("PROFILE RESPONSE:", response.text)

        if response.status_code != 200:

            return {
                "status": False,
                "message": response.text
            }

        return {
            "status": True,
            "profiles": response.json()
        } 
    

class SyncCampaignsView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        account = AmazonAdsAccount.objects.filter(
            user=request.user,
            is_primary=True
        ).first()

        if not account:

            return Response({
                "status": False,
                "message": "Primary Amazon Ads account not found"
            })

        payload = {
            "maxResults": 1000
        }

        response = ads_api_request(
            account=account,
            method="POST",
            endpoint="/sp/campaigns/list",
            payload=payload,
           
        )

        if response.status_code != 200:

            return Response({
                "status": False,
                "message": response.text
            })

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

                    "amazon_account": account,

                    "name": item.get("name"),

                    "start_date": item.get("startDate"),

                    "state": item.get("state"),

                    "campaign_type": item.get("campaignType"),

                    "targeting_type": item.get("targetingType"),

                    "daily_budget": item.get(
                        "budget", {}
                    ).get("budget", 0),

                    "budget_type": item.get(
                        "budget", {}
                    ).get("budgetType"),

                    "bidding_strategy": dynamic_bidding.get(
                        "strategy"
                    ),

                    "placement_bidding": dynamic_bidding.get(
                        "placementBidding", []
                    ),

                    "marketplace_budget_allocation":
                    item.get("marketplaceBudgetAllocation"),

                    "off_amazon_settings":
                    item.get("offAmazonSettings", {}),

                    "tags":
                    item.get("tags", {}),

                    "raw_data":
                    item
                }
            )

            saved += 1

        return Response({
            "status": True,
            "saved": saved,
            "campaigns":campaigns
        })


class SyncCampaignMetricsView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        start_date = request.data.get("start_date")
        end_date = request.data.get("end_date")

        if not start_date or not end_date:

            return Response({
                "status": False,
                "message": "start_date and end_date are required"
            })

        account = AmazonAdsAccount.objects.filter(
            user=request.user,
            is_primary=True
        ).first()

        if not account:

            return Response({
                "status": False,
                "message":
                "Primary Amazon Ads account not found"
            })

        # =========================
        # CREATE REPORT
        # =========================

        print("START:", start_date)
        print("END:", end_date)

        payload = {

        "name": "Campaign Performance Report",

        "startDate": start_date,

        "endDate": end_date,

        "configuration": {

            "adProduct": "SPONSORED_PRODUCTS",

            "groupBy": ["campaign"],

            "columns": [

                "date",

                "campaignId",

                "campaignName",

                "impressions",

                "clicks",

                "cost",

                "sales14d",

                "purchases14d",

                "unitsSoldClicks14d",

                "clickThroughRate",

                "costPerClick",

                "acosClicks14d",

                "roasClicks14d"
            ],

            "reportTypeId": "spCampaigns",

            "timeUnit": "DAILY",

            "format": "GZIP_JSON"
        }
    }
        response = ads_matrix_api_request(
            account=account,
            method="POST",
            endpoint="/reporting/reports",
            payload=payload,
            content_type="application/vnd.createasyncreportrequest.v3+json",
            accept_type="application/vnd.createasyncreportresponse.v3+json"
        )

        if response.status_code == 425:

            duplicate_message = response.json().get("detail", "")

            # extract report id
            report_id = duplicate_message.split(":")[-1].strip()

        elif response.status_code in [200, 202]:

            report_id = response.json().get("reportId")

        else:

            return Response({
                "status": False,
                "message": response.text
            })

        # report_id = response.json().get(
        #     "reportId"
        # )

        # if not report_id:

        #     return Response({
        #         "status": False,
        #         "message": "Report ID not received"
        #     })

        # =========================
        # CHECK REPORT STATUS
        # =========================

        import time

        report_data = None

        for i in range(20):

            report_response = ads_matrix_api_request(

                account=account,

                method="GET",

                endpoint=f"/reporting/reports/{report_id}",

                content_type="application/json",

                accept_type="application/vnd.asyncreportresource.v3+json"
            )

            report_data = report_response.json()

            status = report_data.get("status")

            print(f"REPORT STATUS: {status}")

            if status == "COMPLETED":
                break

            if status in ["FAILED", "CANCELLED"]:
                return Response({
                    "status": False,
                    "message": f"Report {status}",
                    "data": report_data
                })

            time.sleep(10)

        # report_response = ads_matrix_api_request(
        #     account=account,
        #     method="GET",
        #     endpoint=f"/reporting/reports/{report_id}",
        #     content_type="application/json",
        #     accept_type="application/vnd.asyncreportresource.v3+json"
        # )

        # report_data = report_response.json()

        # status = report_data.get("status")

        # if status != "COMPLETED":

        #     return Response({
        #         "status": False,
        #         "message":
        #         f"Report status: {status}"
        #     })

        download_url = report_data.get("url")

        if not download_url:

            return Response({
                "status": False,
                "message": "Download URL missing"
            })

        # =========================
        # DOWNLOAD REPORT
        # =========================

        download_response = requests.get(
            download_url
        )

        decompressed = gzip.decompress(
            download_response.content
        )

        rows = json.loads(decompressed)

        saved = 0

        # =========================
        # SAVE METRICS
        # =========================

        for row in rows:

            campaign = AdsCampaign.objects.filter(
                campaign_id=row.get("campaignId")
            ).first()

            if not campaign:
                continue

            CampaignMetric.objects.update_or_create(

                campaign=campaign,

                report_date=row.get("date"),

                defaults={

                    "impressions":
                    row.get("impressions", 0),

                    "clicks":
                    row.get("clicks", 0),

                    "cost":
                    row.get("cost", 0),

                    "sales":
                    row.get("sales14d", 0),

                    "orders":
                    row.get("purchases14d", 0),

                    "units":
                    row.get("unitsSoldClicks14d", 0),

                    "ctr":
                    row.get("clickThroughRate", 0),

                    "cpc":
                    row.get("costPerClick", 0),

                    "acos":
                    row.get("acosClicks14d", 0),

                    "roas":
                    row.get("roasClicks14d", 0),

                    "raw_data":
                    row
                }
            )

            saved += 1

        return Response({
            "status": True,
            "saved": saved
        })
    


class CampaignListView(APIView):

    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def post(self, request):
        user = request.user
        data = request.data
        search = data.get("search")
        state = data.get("state")

        campaign_type = data.get("campaign_type")
        targeting_type = data.get(
            "targeting_type"
        )

        ordering = data.get(
            "ordering",
            "-start_date"
        )

        queryset = AdsCampaign.objects.filter(
            amazon_account__user=user,
            amazon_account__is_primary = True
        ).select_related(
            "amazon_account"
        ).prefetch_related(
            "campaignmetric_set"
        )

        if search:

            queryset = queryset.filter(

                Q(name__icontains=search) |
                Q(campaign_id__icontains=search)
            )

        if state:
            queryset = queryset.filter(
                state=state
            )

        if campaign_type:
            queryset = queryset.filter(
                campaign_type=campaign_type
            )

        if targeting_type:
            queryset = queryset.filter(
                targeting_type=targeting_type
            )
        queryset = queryset.order_by(
            ordering
        )

        total_campaigns = queryset.count()
        total_budget = queryset.aggregate(
            total=Sum("daily_budget")
        )["total"] or 0

        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(
            queryset,
            request
        )

        serializer = AdsCampaignSerializer(
            paginated_queryset,
            many=True
        )

        response = paginator.get_paginated_response(
            serializer.data
        )

        response.data["summary"] = {

            "total_campaigns":total_campaigns,
            "total_budget":total_budget
        }

        return response
    



class AdsAdGroupListView(APIView):

    permission_classes = [IsAuthenticated]

    pagination_class = CustomPagination

    def post(self, request):

        user = request.user

        data = request.data

        search = data.get("search")

        state = data.get("state")

        campaign_id = data.get(
            "campaign_id"
        )

        ordering = data.get(
            "ordering",
            "-created_at"
        )

        queryset = AdsAdGroup.objects.filter(
            amazon_account__user=user,
            amazon_account__is_primary=True
        ).select_related(
            "amazon_account",
            "campaign"
        )

        if search:

            queryset = queryset.filter(

                Q(name__icontains=search) |

                Q(ad_group_id__icontains=search)
            )

        if state:

            queryset = queryset.filter(
                state=state
            )

        if campaign_id:

            queryset = queryset.filter(
                campaign__campaign_id=campaign_id
            )

        queryset = queryset.order_by(
            ordering
        )

        total_ad_groups = queryset.count()

        average_bid = queryset.aggregate(
            avg_bid=Avg("default_bid")
        )["avg_bid"] or 0

        paginator = self.pagination_class()

        paginated_queryset = paginator.paginate_queryset(
            queryset,
            request
        )

        serializer = AdsAdGroupSerializer(
            paginated_queryset,
            many=True
        )

        response = paginator.get_paginated_response(
            serializer.data
        )

        response.data["summary"] = {

            "total_ad_groups":
            total_ad_groups,

            "average_default_bid":
            round(average_bid, 2)
        }

        return response
    

class AdsKeywordListView(APIView):

    permission_classes = [IsAuthenticated]

    pagination_class = CustomPagination

    def post(self, request):

        user = request.user
        data = request.data
        search = data.get("search")
        state = data.get("state")
        match_type = data.get("match_type")
        campaign_id = data.get("campaign_id")
        ad_group_id = data.get("ad_group_id")
        ordering = data.get("ordering", "-created_at")
        queryset = AdsKeyword.objects.filter(
            amazon_account__user=user,
            amazon_account__is_primary = True
        ).select_related(
            "amazon_account",
            "campaign",
            "ad_group"
        )

        if search:

            queryset = queryset.filter(

                Q(keyword_text__icontains=search) |

                Q(keyword_id__icontains=search)
            )

        if state:
            queryset = queryset.filter(
                state=state
            )

        if match_type:
            queryset = queryset.filter(
                match_type=match_type
            )

        if campaign_id:
            queryset = queryset.filter(
                campaign__campaign_id=campaign_id
            )

        if ad_group_id:
            queryset = queryset.filter(
                ad_group__ad_group_id=ad_group_id
            )

        queryset = queryset.order_by(
            ordering
        )

        total_keywords = queryset.count()

        average_bid = queryset.aggregate(
            avg_bid=Avg("bid")
        )["avg_bid"] or 0

        paginator = self.pagination_class()

        paginated_queryset = paginator.paginate_queryset(
            queryset,
            request
        )

        serializer = AdsKeywordSerializer(
            paginated_queryset,
            many=True
        )

        response = paginator.get_paginated_response(
            serializer.data
        )

        response.data["summary"] = {

            "total_keywords":
            total_keywords,

            "average_bid":
            round(average_bid, 2)
        }

        return response
    


# class AdsProductAdListView(APIView):

#     permission_classes = [IsAuthenticated]

#     pagination_class = CustomPagination

#     def post(self, request):

#         user = request.user

#         data = request.data

#         search = data.get("search")

#         state = data.get("state")

#         campaign_id = data.get(
#             "campaign_id"
#         )

#         ad_group_id = data.get(
#             "ad_group_id"
#         )

#         ordering = data.get(
#             "ordering",
#             "-created_at"
#         )

#         queryset = AdsProductAd.objects.filter(
#             amazon_account__user=user,
#             amazon_account__is_primary = True
#         ).select_related(
#             "amazon_account",
#             "campaign",
#             "ad_group"
#         )

#         if search:

#             queryset = queryset.filter(

#                 Q(asin__icontains=search) |

#                 Q(sku__icontains=search) |

#                 Q(ad_id__icontains=search)
#             )

#         if state:

#             queryset = queryset.filter(
#                 state=state
#             )

#         if campaign_id:

#             queryset = queryset.filter(
#                 campaign__campaign_id=campaign_id
#             )

#         if ad_group_id:

#             queryset = queryset.filter(
#                 ad_group__ad_group_id=ad_group_id
#             )

#         queryset = queryset.order_by(
#             ordering
#         )

#         total_ads = queryset.count()

#         paginator = self.pagination_class()

#         paginated_queryset = paginator.paginate_queryset(
#             queryset,
#             request
#         )

#         serializer = AdsProductAdSerializer(
#             paginated_queryset,
#             many=True
#         )

#         response = paginator.get_paginated_response(
#             serializer.data
#         )

#         response.data["summary"] = {

#             "total_product_ads":
#             total_ads
#         }

#         return response    



class ProductSKUReportView(APIView):

    permission_classes = [IsAuthenticated]

    pagination_class = CustomPagination

    def post(self, request):

        user = request.user

        data = request.data

        search = data.get("search")

        state = data.get("state")

        campaign_id = data.get(
            "campaign_id"
        )

        ad_group_id = data.get(
            "ad_group_id"
        )

        start_date = data.get(
            "start_date"
        )

        end_date = data.get(
            "end_date"
        )

        ordering = data.get(
            "ordering",
            "-sales"
        )

        queryset = AdsProductAd.objects.filter(
            amazon_account__user=user,
            amazon_account__is_primary=True
        )

        # SEARCH FILTER
        if search:

            queryset = queryset.filter(

                Q(sku__icontains=search) |

                Q(asin__icontains=search)
            )

        # STATE FILTER
        if state:

            queryset = queryset.filter(
                state=state
            )

        # CAMPAIGN FILTER
        if campaign_id:

            queryset = queryset.filter(
                campaign__campaign_id=campaign_id
            )

        # AD GROUP FILTER
        if ad_group_id:

            queryset = queryset.filter(
                ad_group__ad_group_id=ad_group_id
            )

        # DATE FILTER
        if start_date and end_date:

            queryset = queryset.filter(
                productadmetric__report_date__range=[
                    start_date,
                    end_date
                ]
            )

        # =====================================================
        # AMAZON LISTING SUBQUERY
        # =====================================================

        listing_queryset = AmazonListingItem.objects.filter(
            sku=OuterRef("sku"),
            user=user
        ).order_by("-id")

        # GROUP BY SKU
        
        queryset = queryset.values(

            "sku",
            "asin",
            "state"

        ).annotate(
        # queryset = queryset.values(

        #     "sku",
        #     "asin"

        # ).annotate(

            item_name=Subquery(
                listing_queryset.values("item_name")[:1]
            ),

            image_url=Subquery(
                listing_queryset.values("image_url")[:1]
            ),

            total_ads=Count(
                "id",
                distinct=True
            ),

            impressions=Sum(
                "productadmetric__impressions"
            ),

            clicks=Sum(
                "productadmetric__clicks"
            ),

            cost=Sum(
                "productadmetric__cost"
            ),

            sales=Sum(
                "productadmetric__sales"
            ),

            orders=Sum(
                "productadmetric__orders"
            )

        ).order_by(
            ordering
        )

        total_skus = queryset.count()

        paginator = self.pagination_class()

        paginated_queryset = paginator.paginate_queryset(
            queryset,
            request
        )

        response = paginator.get_paginated_response(
            paginated_queryset
        )

        response.data["summary"] = {

            "total_skus":
            total_skus
        }

        return response
    

# class ProductSKUReportView(APIView):

#     permission_classes = [IsAuthenticated]

#     pagination_class = CustomPagination

#     def post(self, request):

#         user = request.user

#         data = request.data

#         search = data.get("search")

#         state = data.get("state")

#         campaign_id = data.get(
#             "campaign_id"
#         )

#         ad_group_id = data.get(
#             "ad_group_id"
#         )

#         start_date = data.get(
#             "start_date"
#         )

#         end_date = data.get(
#             "end_date"
#         )

#         ordering = data.get(
#             "ordering",
#             "-sales"
#         )

#         queryset = AdsProductAd.objects.filter(
#             amazon_account__user=user,
#             amazon_account__is_primary=True
#         )

#         # SEARCH FILTER
#         if search:

#             queryset = queryset.filter(

#                 Q(sku__icontains=search) |

#                 Q(asin__icontains=search)
#             )

#         # STATE FILTER
#         if state:

#             queryset = queryset.filter(
#                 state=state
#             )

#         # CAMPAIGN FILTER
#         if campaign_id:

#             queryset = queryset.filter(
#                 campaign__campaign_id=campaign_id
#             )

#         # AD GROUP FILTER
#         if ad_group_id:

#             queryset = queryset.filter(
#                 ad_group__ad_group_id=ad_group_id
#             )

#         # DATE FILTER
#         if start_date and end_date:

#             queryset = queryset.filter(
#                 productadmetric__report_date__range=[
#                     start_date,
#                     end_date
#                 ]
#             )

#         # GROUP BY SKU
#         queryset = queryset.values(

#             "sku",
#             "asin"

#         ).annotate(

#             total_ads=Count(
#                 "id",
#                 distinct=True
#             ),

#             impressions=Sum(
#                 "productadmetric__impressions"
#             ),

#             clicks=Sum(
#                 "productadmetric__clicks"
#             ),

#             cost=Sum(
#                 "productadmetric__cost"
#             ),

#             sales=Sum(
#                 "productadmetric__sales"
#             ),

#             orders=Sum(
#                 "productadmetric__orders"
#             )

#         ).order_by(
#             ordering
#         )

#         total_skus = queryset.count()

#         paginator = self.pagination_class()

#         paginated_queryset = paginator.paginate_queryset(
#             queryset,
#             request
#         )

#         response = paginator.get_paginated_response(
#             paginated_queryset
#         )

#         response.data["summary"] = {

#             "total_skus":
#             total_skus
#         }

#         return response


class CampaignBySKUView(APIView):

    permission_classes = [IsAuthenticated]

    pagination_class = CustomPagination

    def post(self, request):

        user = request.user

        data = request.data

        sku = data.get("sku")

        search = data.get("search")

        state = data.get("state")

        start_date = data.get(
            "start_date"
        )

        end_date = data.get(
            "end_date"
        )

        ordering = data.get(
            "ordering",
            "-sales"
        )

        queryset = AdsCampaign.objects.filter(
            amazon_account__user=user,
            amazon_account__is_primary=True,
            adsproductad__sku=sku
        ).distinct()

        # SEARCH FILTER
        if search:

            queryset = queryset.filter(
                Q(name__icontains=search) |

                Q(campaign_id__icontains=search)
            )

        # STATE FILTER
        if state:

            queryset = queryset.filter(
                state=state
            )

        # DATE FILTER
        if start_date and end_date:

            queryset = queryset.filter(
                campaignmetric__report_date__range=[
                    start_date,
                    end_date
                ]
            )

        # METRICS
        queryset = queryset.annotate(

            total_ads=Count(
                "adsproductad",
                distinct=True
            ),

            impressions=Sum(
                "campaignmetric__impressions"
            ),

            clicks=Sum(
                "campaignmetric__clicks"
            ),

            cost=Sum(
                "campaignmetric__cost"
            ),

            sales=Sum(
                "campaignmetric__sales"
            ),

            orders=Sum(
                "campaignmetric__orders"
            ),

            units=Sum(
                "campaignmetric__units"
            )

        ).order_by(
            ordering
        )

        total_campaigns = queryset.count()

        paginator = self.pagination_class()

        paginated_queryset = paginator.paginate_queryset(
            queryset,
            request
        )

        results = []

        for campaign in paginated_queryset:

            results.append({

                "id":
                campaign.id,

                "campaign_id":
                campaign.campaign_id,

                "name":
                campaign.name,

                "state":
                campaign.state,

                "campaign_type":
                campaign.campaign_type,

                "targeting_type":
                campaign.targeting_type,

                "daily_budget":
                campaign.daily_budget,

                "budget_type":
                campaign.budget_type,

                "bidding_strategy":
                campaign.bidding_strategy,

                "start_date":
                campaign.start_date,

                "total_ads":
                campaign.total_ads or 0,

                "impressions":
                campaign.impressions or 0,

                "clicks":
                campaign.clicks or 0,

                "cost":
                campaign.cost or 0,

                "sales":
                campaign.sales or 0,

                "orders":
                campaign.orders or 0,

                "units":
                campaign.units or 0,

                "acos":
                round(
                    (
                        (campaign.cost or 0) /
                        (campaign.sales or 1)
                    ) * 100,
                    2
                ) if campaign.sales else 0,

                "roas":
                round(
                    (
                        (campaign.sales or 0) /
                        (campaign.cost or 1)
                    ),
                    2
                ) if campaign.cost else 0

            })

        response = paginator.get_paginated_response(
            results
        )

        response.data["summary"] = {

            "total_campaigns":
            total_campaigns
        }

        return response
    


class AdGroupByCampaignView(APIView):

    permission_classes = [IsAuthenticated]

    pagination_class = CustomPagination

    def post(self, request):

        user = request.user

        data = request.data

        campaign_id = data.get(
            "campaign_id"
        )

        sku = data.get("sku")

        search = data.get("search")

        state = data.get("state")

        ordering = data.get(
            "ordering",
            "-sales"
        )

        start_date = data.get(
            "start_date"
        )

        end_date = data.get(
            "end_date"
        )

        queryset = AdsAdGroup.objects.filter(
            amazon_account__user=user,
            amazon_account__is_primary=True,
            campaign__campaign_id=campaign_id
        ).distinct()

        # SKU FILTER
        if sku:

            queryset = queryset.filter(
                adsproductad__sku=sku
            )

        # SEARCH FILTER
        if search:

            queryset = queryset.filter(

                Q(name__icontains=search) |

                Q(ad_group_id__icontains=search)
            )

        # STATE FILTER
        if state:

            queryset = queryset.filter(
                state=state
            )

        # DATE FILTER
        if start_date and end_date:

            queryset = queryset.filter(
                campaign__campaignmetric__report_date__range=[
                    start_date,
                    end_date
                ]
            )

        # ANNOTATIONS
        queryset = queryset.annotate(

            total_ads=Count(
                "adsproductad",
                distinct=True
            ),

            impressions=Sum(
                "campaign__campaignmetric__impressions"
            ),

            clicks=Sum(
                "campaign__campaignmetric__clicks"
            ),

            cost=Sum(
                "campaign__campaignmetric__cost"
            ),

            sales=Sum(
                "campaign__campaignmetric__sales"
            ),

            orders=Sum(
                "campaign__campaignmetric__orders"
            ),

            units=Sum(
                "campaign__campaignmetric__units"
            )

        ).order_by(
            ordering
        )

        total_ad_groups = queryset.count()

        paginator = self.pagination_class()

        paginated_queryset = paginator.paginate_queryset(
            queryset,
            request
        )

        results = []

        for ad_group in paginated_queryset:

            results.append({

                "id":
                ad_group.id,

                "ad_group_id":
                ad_group.ad_group_id,

                "campaign_id":
                ad_group.campaign.campaign_id,

                "campaign_name":
                ad_group.campaign.name,

                "name":
                ad_group.name,

                "state":
                ad_group.state,

                "default_bid":
                ad_group.default_bid,

                "total_ads":
                ad_group.total_ads or 0,

                "impressions":
                ad_group.impressions or 0,

                "clicks":
                ad_group.clicks or 0,

                "cost":
                ad_group.cost or 0,

                "sales":
                ad_group.sales or 0,

                "orders":
                ad_group.orders or 0,

                "units":
                ad_group.units or 0,

                "acos":
                round(
                    (
                        (ad_group.cost or 0) /
                        (ad_group.sales or 1)
                    ) * 100,
                    2
                ) if ad_group.sales else 0,

                "roas":
                round(
                    (
                        (ad_group.sales or 0) /
                        (ad_group.cost or 1)
                    ),
                    2
                ) if ad_group.cost else 0

            })

        response = paginator.get_paginated_response(
            results
        )

        response.data["summary"] = {

            "total_ad_groups":
            total_ad_groups
        }

        return response
    

class QueryAdsView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        body = request.data.get("body", {})
        

        account = AmazonAdsAccount.objects.filter(
            user=user,
            is_primary=True
        ).first()

        if not account:

            return Response({

                "status": False,

                "message": "Amazon Ads account not found"
            })

        advertiser_account_id = str(
            account.profile_id
        )

        payload = {

            "body": {

                "accessRequestedAccount": {

                    "advertiserAccountId":
                    advertiser_account_id
                },

                "adProductFilter": {

                    "include":
                    body.get(
                        "adProductFilter",
                        {}
                    ).get(
                        "include",
                        [
                            "SPONSORED_PRODUCTS"
                        ]
                    )
                },

                "maxResults":
                body.get(
                    "maxResults",
                    100
                )
            }
        }

        if body.get("adGroupIdFilter"):

            payload["body"][
                "adGroupIdFilter"
            ] = body.get(
                "adGroupIdFilter"
            )

        if body.get("adIdFilter"):

            payload["body"][
                "adIdFilter"
            ] = body.get(
                "adIdFilter"
            )

        if body.get("campaignIdFilter"):

            payload["body"][
                "campaignIdFilter"
            ] = body.get(
                "campaignIdFilter"
            )

        if body.get("marketplaceScopeFilter"):

            payload["body"][
                "marketplaceScopeFilter"
            ] = body.get(
                "marketplaceScopeFilter"
            )

        if body.get("nameFilter"):

            payload["body"][
                "nameFilter"
            ] = body.get(
                "nameFilter"
            )

        if body.get("stateFilter"):

            payload["body"][
                "stateFilter"
            ] = body.get(
                "stateFilter"
            )

        if body.get("nextToken"):

            payload["body"][
                "nextToken"
            ] = body.get(
                "nextToken"
            )

        # response = ads_api_request(

        #     account=account,

        #     method="POST",

        #     endpoint="/query/ads",

        #     payload=payload
        # )

        response = ads_matrix_api_request(

            account=account,

            method="POST",

            endpoint="/query/ads",

            payload=payload,

            content_type="application/json",

            accept_type="application/json"
        )

        print(response.request.headers)

        if response.status_code != 200:

            return Response({

                "status": False,

                "message": response.text
            })

        response_data = response.json()

        ads = response_data.get(
            "ads",
            []
        )

        next_token = response_data.get(
            "nextToken"
        )

        return Response({

            "status": True,

            "count": len(ads),

            "next_token": next_token,

            "filters_used": payload,

            "results": ads
        })    
    


class SearchTermMetricListView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        filters = data.get("filters", {})
        pagination = data.get("pagination", {})

        page_no = int(pagination.get("pageNo", 1))
        page_size = int(pagination.get("pageSize", 10))

        queryset = SearchTermMetric.objects.select_related(
            "campaign",
            "campaign__amazon_account"
        ).all()

        # =========================================================
        # SEARCH
        # =========================================================

        search = filters.get("search")

        if search:
            queryset = queryset.filter(
                Q(search_term__icontains=search) |
                Q(campaign__name__icontains=search)
            )

        # =========================================================
        # FILTERS
        # =========================================================

        campaign_id = filters.get("campaign_id")

        if campaign_id:
            queryset = queryset.filter(
                campaign__campaign_id=campaign_id
            )

        # ---------------- MATCH TYPE FILTER ----------------

        match_types = filters.get("match_types", [])

        if match_types:
            queryset = queryset.filter(
                raw_data__matchType__in=match_types
            )

        # ---------------- DATE FILTER ----------------

        from_date = filters.get("from_date")
        to_date = filters.get("to_date")

        if from_date and to_date:
            queryset = queryset.filter(
                report_date__range=[from_date, to_date]
            )

        elif from_date:
            queryset = queryset.filter(
                report_date__gte=from_date
            )

        elif to_date:
            queryset = queryset.filter(
                report_date__lte=to_date
            )

        # ---------------- ACOS FILTER ----------------

        min_acos = filters.get("min_acos")
        max_acos = filters.get("max_acos")

        if min_acos not in [None, ""]:
            queryset = queryset.filter(
                acos__gte=min_acos
            )

        if max_acos not in [None, ""]:
            queryset = queryset.filter(
                acos__lte=max_acos
            )

        # ---------------- ROAS FILTER ----------------

        min_roas = filters.get("min_roas")
        max_roas = filters.get("max_roas")

        if min_roas not in [None, ""]:
            queryset = queryset.filter(
                roas__gte=min_roas
            )

        if max_roas not in [None, ""]:
            queryset = queryset.filter(
                roas__lte=max_roas
            )

        # =========================================================
        # TOP SUMMARY CARDS
        # =========================================================

        summary = queryset.aggregate(

            total_spend=Coalesce(
                Sum("cost"),
                0,
                output_field=FloatField()
            ),

            total_impressions=Coalesce(
                Sum("impressions"),
                0
            ),

            total_clicks=Coalesce(
                Sum("clicks"),
                0
            ),

            total_orders=Coalesce(
                Sum("orders"),
                0
            ),

            total_sales=Coalesce(
                Sum("sales"),
                0,
                output_field=FloatField()
            ),

            avg_acos=Coalesce(
                Avg("acos"),
                0,
                output_field=FloatField()
            )
        )

        # =========================================================
        # MATCH TYPE DISTRIBUTION (PIE CHART)
        # =========================================================

        match_type_distribution = []

        match_type_qs = (
            queryset
            .values("raw_data__matchType")
            .annotate(
                total=Count("id")
            )
            .order_by("-total")
        )

        total_terms_count = queryset.count()

        for row in match_type_qs:

            match_name = row["raw_data__matchType"] or "Unknown"

            percentage = 0

            if total_terms_count > 0:
                percentage = round(
                    (row["total"] / total_terms_count) * 100,
                    2
                )

            match_type_distribution.append({
                "match_type": match_name,
                "count": row["total"],
                "percentage": percentage
            })

        # =========================================================
        # TOP PERFORMING TERMS
        # =========================================================

        top_terms_qs = (
            queryset
            .order_by("-sales")[:5]
        )

        top_performing_terms = []

        for item in top_terms_qs:

            top_performing_terms.append({
                "search_term": item.search_term,
                "sales": item.sales,
                "orders": item.orders,
                "acos": item.acos,
                "roas": item.roas
            })

        # =========================================================
        # SORTING
        # =========================================================

        sort_by = filters.get(
            "sort_by",
            "report_date"
        )

        sort_order = filters.get(
            "sort_order",
            "desc"
        )

        allowed_sort_fields = [
            "report_date",
            "impressions",
            "clicks",
            "cost",
            "sales",
            "orders",
            "acos",
            "roas",
        ]

        if sort_by not in allowed_sort_fields:
            sort_by = "report_date"

        if sort_order == "desc":
            sort_by = f"-{sort_by}"

        queryset = queryset.order_by(sort_by)

        # =========================================================
        # PAGINATION
        # =========================================================

        paginator = Paginator(queryset, page_size)

        page_obj = paginator.get_page(page_no)

        results = []

        for item in page_obj:

            match_type = (
                item.raw_data.get("matchType")
                if item.raw_data else None
            )

            results.append({
                "id": item.id,

                "campaign_id": (
                    item.campaign.id
                    if item.campaign else None
                ),

                "campaign_name": (
                    item.campaign.name
                    if item.campaign else None
                ),

                "search_term": item.search_term,

                "match_type": match_type,

                "report_date": item.report_date,

                "impressions": item.impressions,

                "clicks": item.clicks,

                "cost": item.cost,

                "sales": item.sales,

                "orders": item.orders,

                "acos": item.acos,

                "roas": item.roas,

                "raw_data": item.raw_data,
            })

        # =========================================================
        # FINAL RESPONSE
        # =========================================================

        return Response({

            "status": True,

            "message": "Search term metrics fetched successfully",

            # =====================================================
            # NEW DASHBOARD RESPONSE
            # =====================================================

            "dashboard": {

                # ---------------- TOP CARDS ----------------

                "summary_cards": {

                    "total_spend": round(
                        summary["total_spend"],
                        2
                    ),

                    "impressions": summary[
                        "total_impressions"
                    ],

                    "clicks": summary[
                        "total_clicks"
                    ],

                    "orders": summary[
                        "total_orders"
                    ],

                    "sales": round(
                        summary["total_sales"],
                        2
                    ),

                    "acos": round(
                        summary["avg_acos"],
                        2
                    )
                },

                # ---------------- PIE CHART ----------------

                "match_type_distribution": {
                    "total_terms": total_terms_count,
                    "data": match_type_distribution
                },

                # ---------------- TOP TERMS ----------------

                "top_performing_terms": top_performing_terms
            },

            # =====================================================
            # EXISTING RESPONSE (UNCHANGED)
            # =====================================================

            "data": results,

            "pagination": {
                "pageNo": page_no,
                "pageSize": page_size,
                "totalPages": paginator.num_pages,
                "totalItems": paginator.count,
            }
        })
        
        


class ProductAdMetricListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            queryset = ProductAdMetric.objects.filter(
                product_ad__amazon_account__user=request.user
            ).select_related(
                "product_ad",
                "product_ad__campaign",
                "product_ad__ad_group",
            )

            # =====================================================
            # FILTERS
            # =====================================================

            campaign_id = request.GET.get("campaign_id")

            ad_group_id = request.GET.get("ad_group_id")

            product_ad_id = request.GET.get("product_ad_id")

            sku = request.GET.get("sku")

            asin = request.GET.get("asin")

            state = request.GET.get("state")

            search = request.GET.get("search")

            start_date = request.GET.get("start_date")

            end_date = request.GET.get("end_date")

            ordering = request.GET.get("ordering", "-total_sales")

            # =====================================================
            # FILTER : CAMPAIGN
            # =====================================================

            if campaign_id:

                queryset = queryset.filter(
                    product_ad__campaign__campaign_id=campaign_id
                )

            # =====================================================
            # FILTER : AD GROUP
            # =====================================================

            if ad_group_id:

                queryset = queryset.filter(
                    product_ad__ad_group__ad_group_id=ad_group_id
                )

            # =====================================================
            # FILTER : PRODUCT AD
            # =====================================================

            if product_ad_id:

                queryset = queryset.filter(
                    product_ad__ad_id=product_ad_id
                )

            # =====================================================
            # FILTER : SKU
            # =====================================================

            if sku:

                queryset = queryset.filter(
                    product_ad__sku__icontains=sku
                )

            # =====================================================
            # FILTER : ASIN
            # =====================================================

            if asin:

                queryset = queryset.filter(
                    product_ad__asin__icontains=asin
                )

            # =====================================================
            # FILTER : STATE
            # =====================================================

            if state:

                queryset = queryset.filter(
                    product_ad__state__iexact=state
                )

            # =====================================================
            # FILTER : DATE RANGE
            # =====================================================

            if start_date and end_date:

                queryset = queryset.filter(
                    report_date__range=[start_date, end_date]
                )

            elif start_date:

                queryset = queryset.filter(
                    report_date__gte=start_date
                )

            elif end_date:

                queryset = queryset.filter(
                    report_date__lte=end_date
                )

            # =====================================================
            # SEARCH
            # =====================================================

            if search:

                queryset = queryset.filter(

                    Q(product_ad__sku__icontains=search)

                    |

                    Q(product_ad__asin__icontains=search)

                    |

                    Q(product_ad__campaign__name__icontains=search)

                    |

                    Q(product_ad__ad_group__name__icontains=search)
                )

            # =====================================================
            # GROUP BY PRODUCT AD
            # =====================================================

            queryset = queryset.values(

                "product_ad_id",

                "product_ad__ad_id",

                "product_ad__sku",

                "product_ad__asin",

                "product_ad__state",

                "product_ad__campaign__campaign_id",

                "product_ad__campaign__name",

                "product_ad__ad_group__ad_group_id",

                "product_ad__ad_group__name",

            ).annotate(

                total_impressions=Sum("impressions"),

                total_clicks=Sum("clicks"),

                total_cost=Sum("cost"),

                total_sales=Sum("sales"),

                total_orders=Sum("orders"),

            )

            # =====================================================
            # CALCULATED METRICS
            # =====================================================

            queryset = queryset.annotate(

                ctr=ExpressionWrapper(

                    (
                        F("total_clicks") * 100.0
                    ) / F("total_impressions"),

                    output_field=FloatField()

                ),

                cpc=ExpressionWrapper(

                    F("total_cost") / F("total_clicks"),

                    output_field=FloatField()

                ),

                acos=ExpressionWrapper(

                    (
                        F("total_cost") * 100.0
                    ) / F("total_sales"),

                    output_field=FloatField()

                ),

                roas=ExpressionWrapper(

                    F("total_sales") / F("total_cost"),

                    output_field=FloatField()

                ),
            )

            # =====================================================
            # ORDERING
            # =====================================================

            allowed_ordering = [

                "total_sales",
                "-total_sales",

                "total_cost",
                "-total_cost",

                "total_clicks",
                "-total_clicks",

                "total_impressions",
                "-total_impressions",

                "total_orders",
                "-total_orders",

                "roas",
                "-roas",

                "acos",
                "-acos",
            ]

            if ordering not in allowed_ordering:

                ordering = "-total_sales"

            queryset = queryset.order_by(ordering)

            # =====================================================
            # SUMMARY
            # =====================================================

            summary = queryset.aggregate(

                total_impressions=Sum("total_impressions"),

                total_clicks=Sum("total_clicks"),

                total_cost=Sum("total_cost"),

                total_sales=Sum("total_sales"),

                total_orders=Sum("total_orders"),
            )

            # =====================================================
            # EXTRA SUMMARY METRICS
            # =====================================================

            total_impressions = summary.get("total_impressions") or 0

            total_clicks = summary.get("total_clicks") or 0

            total_cost = summary.get("total_cost") or 0

            total_sales = summary.get("total_sales") or 0

            summary["ctr"] = round(

                (
                    total_clicks * 100
                ) / total_impressions,

                2

            ) if total_impressions else 0

            summary["cpc"] = round(

                total_cost / total_clicks,

                2

            ) if total_clicks else 0

            summary["acos"] = round(

                (
                    total_cost * 100
                ) / total_sales,

                2

            ) if total_sales else 0

            summary["roas"] = round(

                total_sales / total_cost,

                2

            ) if total_cost else 0

            # =====================================================
            # PAGINATION
            # =====================================================

            paginator = CustomPagination()

            paginated_queryset = paginator.paginate_queryset(
                queryset,
                request
            )

            # =====================================================
            # RESPONSE
            # =====================================================

            return paginator.get_paginated_response({

                "status": True,

                "message": "Product ad metrics fetched successfully",

                "summary": summary,

                "data": paginated_queryset
            })

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )    


class AdsTargetListAPIView(APIView):

    permission_classes = [IsAuthenticated]
    pagination_class = CustomPagination

    def post(self, request):

        try:

            user = request.user
            data = request.data
            search = data.get("search")
            state = data.get("state")
            campaign_id = data.get(
                "campaign_id"
            )

            ad_group_id = data.get(
                "ad_group_id"
            )

            expression_type = data.get(
                "expression_type"
            )

            ordering = data.get(
                "ordering",
                "-id"
            )

            queryset = AdsTarget.objects.filter(
                amazon_account__user=user,
                amazon_account__is_primary=True
            ).select_related(
                "campaign",
                "ad_group",
            )

            # =====================================================
            # SEARCH
            # =====================================================

            if search:

                queryset = queryset.filter(
                    Q(target_id__icontains=search) |
                    Q(campaign__name__icontains=search) |
                    Q(ad_group__name__icontains=search)
                )

            # =====================================================
            # STATE FILTER
            # =====================================================

            if state:

                queryset = queryset.filter(
                    state=state
                )

            # =====================================================
            # CAMPAIGN FILTER
            # =====================================================

            if campaign_id:

                queryset = queryset.filter(
                    campaign__campaign_id=campaign_id
                )

            # =====================================================
            # AD GROUP FILTER
            # =====================================================

            if ad_group_id:

                queryset = queryset.filter(
                    ad_group__ad_group_id=ad_group_id
                )

            # =====================================================
            # EXPRESSION TYPE FILTER
            # =====================================================

            if expression_type:

                queryset = queryset.filter(
                    expression_type=expression_type
                )

            queryset = queryset.values(

                "id",
                "target_id",
                "expression_type",
                "expression",
                "bid",
                "state",
                "created_at",
                "campaign__campaign_id",
                "campaign__name",
                "ad_group__ad_group_id",
                "ad_group__name",

            ).order_by(
                ordering
            )

            total_targets = queryset.count()
            paginator = self.pagination_class()
            paginated_queryset = paginator.paginate_queryset(
                queryset,
                request
            )
            response = paginator.get_paginated_response(
                paginated_queryset
            )
            response.data["summary"] = {
                "total_targets":
                total_targets
            }

            return response

        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )



class CampaignNegativeTargetListView(APIView):

    permission_classes = [IsAuthenticated]

    pagination_class = CustomPagination

    def post(self, request):

        user = request.user

        data = request.data

        amazon_account_id = data.get(
            "amazon_account_id"
        )

        campaign_id = data.get(
            "campaign_id"
        )

        negative_target_id = data.get(
            "negative_target_id"
        )

        state = data.get(
            "state"
        )

        expression_type = data.get(
            "expression_type"
        )

        search = data.get(
            "search"
        )

        ordering = data.get(
            "ordering",
            "-id"
        )

        queryset = AdsCampaignNegativeTarget.objects.filter(

            amazon_account__user=user

        ).select_related(

            "amazon_account",
            "campaign"

        )

        # ---------------------------------------------------
        # AMAZON ACCOUNT FILTER
        # ---------------------------------------------------

        if amazon_account_id:

            queryset = queryset.filter(
                amazon_account_id=amazon_account_id
            )

        # ---------------------------------------------------
        # CAMPAIGN FILTER
        # ---------------------------------------------------

        if campaign_id:

            queryset = queryset.filter(
                campaign__campaign_id=int(campaign_id)
            )

        # ---------------------------------------------------
        # NEGATIVE TARGET FILTER
        # ---------------------------------------------------

        if negative_target_id:

            queryset = queryset.filter(
                negative_target_id=int(
                    negative_target_id
                )
            )

        # ---------------------------------------------------
        # STATE FILTER
        # ---------------------------------------------------

        if state:

            queryset = queryset.filter(
                state__iexact=state
            )

        # ---------------------------------------------------
        # EXPRESSION TYPE FILTER
        # ---------------------------------------------------

        if expression_type:

            queryset = queryset.filter(
                expression_type__iexact=
                expression_type
            )

        # ---------------------------------------------------
        # SEARCH
        # ---------------------------------------------------

        if search:

            queryset = queryset.filter(

                Q(campaign__name__icontains=search) |

                Q(state__icontains=search) |

                Q(serving_status__icontains=search) |

                Q(expression_type__icontains=search) |

                Q(negative_target_id__icontains=search)
            )

        # ---------------------------------------------------
        # ORDERING
        # ---------------------------------------------------

        queryset = queryset.order_by(
            ordering
        )

        # ---------------------------------------------------
        # PAGINATION
        # ---------------------------------------------------

        paginator = self.pagination_class()

        paginated_queryset = paginator.paginate_queryset(
            queryset,
            request
        )

        serializer = AdsCampaignNegativeTargetSerializer(
            paginated_queryset,
            many=True
        )

        return paginator.get_paginated_response(
            serializer.data
        )
    


# views.py

from django.db.models import Q

from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated

from amazon_ads.models import AdsNegativeKeyword

from amazon_ads.serializers import (
    AdsNegativeKeywordSerializer
)


class NegativeKeywordListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        search = request.data.get("search")

        campaign_id = request.data.get(
            "campaign_id"
        )

        ad_group_id = request.data.get(
            "ad_group_id"
        )

        state = request.data.get("state")

        match_type = request.data.get(
            "match_type"
        )

        page = int(
            request.data.get("page", 1)
        )

        page_size = int(
            request.data.get("page_size", 10)
        )

        queryset = AdsNegativeKeyword.objects.filter(
            amazon_account__user=user
        ).select_related(
            "campaign",
            "ad_group",
            "amazon_account"
        ).order_by(
            "-id"
        )

        # -----------------------------------------
        # SEARCH
        # -----------------------------------------

        if search:

            queryset = queryset.filter(

                Q(keyword_text__icontains=search) |

                Q(
                    campaign__name__icontains=search
                ) |

                Q(
                    ad_group__name__icontains=search
                ) |

                Q(
                    negative_keyword_id__icontains=search
                )
            )

        # -----------------------------------------
        # FILTERS
        # -----------------------------------------

        if campaign_id:

            queryset = queryset.filter(
                campaign__campaign_id=campaign_id
            )

        if ad_group_id:

            queryset = queryset.filter(
                ad_group__ad_group_id=ad_group_id
            )

        if state:

            queryset = queryset.filter(
                state=state
            )

        if match_type:

            queryset = queryset.filter(
                match_type=match_type
            )

        total_records = queryset.count()

        start = (page - 1) * page_size

        end = start + page_size

        queryset = queryset[start:end]

        serializer = AdsNegativeKeywordSerializer(
            queryset,
            many=True
        )

        return Response({

            "status": True,

            "message":
            "Negative Keywords List",

            "total_records":
            total_records,

            "page":
            page,

            "page_size":
            page_size,

            "data":
            serializer.data
        })
    
    
