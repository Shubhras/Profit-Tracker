from .models import *
import requests

class AmazonAdsClient:
    def __init__(self, account):
        self.base_url = "https://advertising.amazon.in/a9g-api-gateway"
        self.account = account

        print("cookes:", self.account.ads_cookie)
        print("token:", self.account.csrf_token)

    def post(self, path, payload):
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",

            "Amazon-Advertising-API-CSRF-Token": self.account.csrf_token,
            "Amazon-Advertising-API-CSRF-Data": self.account.csrf_data,

            "Amazon-Ads-Account-ID": "amzn1.ads-account.g.db3vfk2gor48xhz7cef9sm776",
            "Amazon-Advertising-API-AdvertiserId": "ENTITY3MQ3KYEE8G3CA",

            # ❗ this should be YOUR APP CLIENT ID (not csrf)
            "Amazon-Advertising-API-ClientId": self.account.app_client_id,

            "Amazon-Advertising-API-MarketplaceId": "A21TJRUUN4KGV",

            "Origin": "https://advertising.amazon.in",
            "Referer": "https://advertising.amazon.in/cm/campaign-manager",
            "User-Agent": "Mozilla/5.0",

            "Cookie": self.account.ads_cookie,
        }

        url = f"{self.base_url}{path}"

        response = requests.post(url, json=payload, headers=headers)

        print("STATUS:", response.status_code)
        print("BODY:", response.text)

        return response.json()
    

def sync_ad_campaigns(account, start_date, end_date):
    # client = AmazonAccount(account)
    client = AmazonAdsClient(account)

    payload = {
        "reportConfig": {
            "reportId": "CrossProgramCampaignReport",
            "startDate": start_date,
            "endDate": end_date,
            "timeUnits": ["SUMMARY", "DAILY"],
            "fields": [
                "campaignId", "campaignName", "programType",
                "campaignType", "campaignTargetingType",
                "state", "statusName", "portfolioName",
                "campaignBudgetAmount", "campaignBudgetType",
                "startDate", "spend", "sales", "orders",
                "cpc", "acos", "roas"
            ],
            "offsetPagination": {"size": 50, "offset": 0}
        }
    }

    response = client.post("/cm/dds/retrieveReport", payload)
    print("FULL ADS RESPONSE:", response)

    report = response.get("report", {})
    data = report.get("data", [])
    daily_data = report.get("timeUnitsData", {}).get("DAILY", {})

    count = 0

    for item in data:
        campaign, _ = AdCampaign.objects.update_or_create(
        amazon_account=account,
        campaign_id=item.get("campaignId"),
        defaults={
            "user": account.user,   #  FIX HERE

            "campaign_name": item.get("campaignName"),
            "program_type": item.get("programType"),
            "campaign_type": item.get("campaignType"),
            "targeting_type": item.get("campaignTargetingType"),
            "state": item.get("state"),
            "status_name": item.get("statusName"),
            "portfolio_name": item.get("portfolioName"),
            "budget_amount": item.get("campaignBudgetAmount"),
            "budget_type": item.get("campaignBudgetType"),
            "start_date": item.get("startDate"),
        }
    )

        # Save metrics

        daily_data = report.get("timeUnitsData", {}).get("DAILY", {})

        dates = daily_data.get("startDates", [])
        spends = daily_data.get("spend", [])
        sales = daily_data.get("sales", [])
        orders = daily_data.get("orders", [])
        cpc = daily_data.get("cpc", [])
        acos = daily_data.get("acos", [])
        roas = daily_data.get("roas", [])

        for i, dt in enumerate(dates):
            AdCampaignMetrics.objects.update_or_create(
                campaign=campaign,
                date=dt,
                defaults={
                    "spend": daily_data.get("spend", [0]*len(dates))[i],
                    "sales": daily_data.get("sales", [0]*len(dates))[i],
                    "orders": daily_data.get("orders", [0]*len(dates))[i],
                    "cpc": daily_data.get("cpc", [0]*len(dates))[i],
                    "acos": daily_data.get("acos", [0]*len(dates))[i],
                    "roas": daily_data.get("roas", [0]*len(dates))[i],
                }
            )
        # if daily_data:
        #     AdCampaignMetrics.objects.update_or_create(
        #         campaign=campaign,
        #         date=start_date,
        #         defaults={
        #             "spend": daily_data.get("spend", [0])[0],
        #             "sales": daily_data.get("sales", [0])[0],
        #             "orders": daily_data.get("orders", [0])[0],
        #             "cpc": daily_data.get("cpc", [0])[0],
        #             "acos": daily_data.get("acos", [0])[0],
        #             "roas": daily_data.get("roas", [0])[0],
        #         }
        #     )

        count += 1

    return count



from datetime import date
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_ads_manual(request):
    """
    Manually sync Amazon Ads Campaign data
    """

    user = request.user

    start_date = request.data.get("start_date")
    end_date = request.data.get("end_date")

    # Default = today
    if not start_date:
        start_date = date.today().strftime("%Y-%m-%d")
    if not end_date:
        end_date = start_date

    accounts = AmazonAccount.objects.filter(user=user)

    if not accounts.exists():
        return Response({
            "status": "error",
            "message": "No Amazon accounts found"
        }, status=400)

    total_synced = 0
    errors = []

    for account in accounts:
        try:
            synced_count = sync_ad_campaigns(account, start_date, end_date)
            total_synced += synced_count

        except Exception as e:
            errors.append({
                "account": account.seller_central_id,
                "error": str(e)
            })

    return Response({
        "status": "success",
        "message": "Ads sync completed",
        "date_range": f"{start_date} → {end_date}",
        "total_synced": total_synced,
        "errors": errors
    })