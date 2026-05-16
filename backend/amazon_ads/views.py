from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response

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
from amazon_auth.models import AmazonAccount 

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
            amazon_account__user=user
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
            amazon_account__user=user
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
    


class AdsProductAdListView(APIView):

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

        ordering = data.get(
            "ordering",
            "-created_at"
        )

        queryset = AdsProductAd.objects.filter(
            amazon_account__user=user,
            amazon_account__is_primary = True
        ).select_related(
            "amazon_account",
            "campaign",
            "ad_group"
        )

        if search:

            queryset = queryset.filter(

                Q(asin__icontains=search) |

                Q(sku__icontains=search) |

                Q(ad_id__icontains=search)
            )

        if state:

            queryset = queryset.filter(
                state=state
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

        total_ads = queryset.count()

        paginator = self.pagination_class()

        paginated_queryset = paginator.paginate_queryset(
            queryset,
            request
        )

        serializer = AdsProductAdSerializer(
            paginated_queryset,
            many=True
        )

        response = paginator.get_paginated_response(
            serializer.data
        )

        response.data["summary"] = {

            "total_product_ads":
            total_ads
        }

        return response    
    

    