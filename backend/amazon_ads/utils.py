import requests
import json
from django.conf import settings
from .models import *

from datetime import timedelta
from django.utils import timezone
import gzip
from django.db.models.functions import Trim
from django.db.models import Q

REGION_URLS = {
    "NA": "https://advertising-api.amazon.com",
    "EU": "https://advertising-api-eu.amazon.com",
    "FE": "https://advertising-api-fe.amazon.com",
}

import time
import requests

from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from django.db import close_old_connections

# =====================================================
# RETRY SESSION
# =====================================================

session = requests.Session()

retries = Retry(
    total=5,
    backoff_factor=2,
    status_forcelist=[
        429,
        500,
        502,
        503,
        504
    ],
    allowed_methods=[
        "GET",
        "POST"
    ]
)

adapter = HTTPAdapter(
    max_retries=retries,
    pool_connections=20,
    pool_maxsize=20
)

session.mount("https://", adapter)

# REPORT_CONFIGS = [

#     {
#         "report_type": "spCampaigns",

#         "group_by": ["campaign"],

#         "columns": [

#             "date",
#             "campaignId",
#             "campaignName",
#             "impressions",
#             "clicks",
#             "cost",
#             "sales14d",
#             "purchases14d",
#             "unitsSoldClicks14d",
#             "clickThroughRate",
#             "costPerClick",
#             "acosClicks14d",
#             "roasClicks14d"
#         ]
#     },

#     {
#         "report_type": "spSearchTerm",

#         "group_by": ["searchTerm"],

#         "columns": [

#             "date",
#             "matchType",
#             "campaignId",
#             "campaignName",
#             "searchTerm",
#             "impressions",
#             "clicks",
#             "cost",
#             "sales14d",
#             "purchases14d",
#             "acosClicks14d",
#             "roasClicks14d"
#         ]
#     },

#     {
#         "report_type": "spTargeting",

#         "group_by": ["targeting"],

#         "columns": [

#             "date",
#             "campaignId",
#             "adGroupId",
#             "targetId",
#             "impressions",
#             "clicks",
#             "cost",
#             "sales14d",
#             "purchases14d",
#             "acosClicks14d",
#             "roasClicks14d"
#         ]
#     },
#     {
#         "report_type": "spKeywords",

#         "group_by": ["keyword"],

#         "columns": [

#             "date",
#             "campaignId",
#             "adGroupId",
#             "keywordId",
#             "keyword",
#             "matchType",
#             "impressions",
#             "clicks",
#             "cost",
#             "sales14d",
#             "purchases14d",
#             "unitsSoldClicks14d",
#             "acosClicks14d",
#             "roasClicks14d"
#         ]
#     },

#     {
#         "report_type": "spAdvertisedProduct",

#         "group_by": ["advertiser"],

#         "columns": [

#             "date",
#             "campaignId",
#             "adId",
#             "advertisedAsin",
#             "impressions",
#             "clicks",
#             "cost",
#             "sales14d",
#             "purchases14d"
#         ]
#     }
# ]


REPORT_CONFIGS = [

    {
        "report_type": "spCampaigns",

        "group_by": ["campaign"],

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
        ]
    },

    {
        "report_type": "spSearchTerm",

        "group_by": ["searchTerm"],

        "columns": [
            "date",
            "matchType",
            "campaignId",
            "campaignName",
            "searchTerm",
            "impressions",
            "clicks",
            "cost",
            "sales14d",
            "purchases14d",
            "acosClicks14d",
            "roasClicks14d"
        ]
    },

    {
        "report_type": "spTargeting",

        "group_by": ["targeting"],

        "columns": [
            "date",
            "campaignId",
            "adGroupId",
            "keywordId",
            "targeting",
            "impressions",
            "clicks",
            "cost",
            "sales14d",
            "purchases14d",
            "acosClicks14d",
            "roasClicks14d"
        ]
    },
    {
        "report_type": "spKeywords",

        "group_by": ["adGroup"],

        "columns": [
            "date",
            "keywordId",
            "keywordText",
            "matchType",
            "impressions",
            "clicks",
            "cost",
            "sales14d",
            "purchases14d"
        ]
    },

    {
        "report_type": "spAdvertisedProduct",

        "group_by": ["advertiser"],

        "columns": [
            "date",
            "campaignId",
            "adId",
            "advertisedAsin",
            "impressions",
            "clicks",
            "cost",
            "sales14d",
            "purchases14d"
        ]
    }
]




def refresh_ads_access_token(account):

    url = "https://api.amazon.com/auth/o2/token"

    payload = {
        "grant_type": "refresh_token",
        "refresh_token": account.refresh_token,
        "client_id": settings.AMAZON_ADS_CLIENT_ID,
        "client_secret": settings.AMAZON_ADS_CLIENT_SECRET,
    }

    response = requests.post(url, data=payload)

    if response.status_code != 200:
        print(response.text)
        return None

    data = response.json()

    access_token = data.get("access_token")

    account.access_token = access_token
    account.save(update_fields=["access_token"])

    return access_token


def ads_api_request(
    account,
    method,
    endpoint,
    params=None,
    payload=None
):

    access_token = refresh_ads_access_token(account)

    headers = {
        "Authorization": f"Bearer {access_token}",

        "Amazon-Advertising-API-ClientId":
        settings.AMAZON_ADS_CLIENT_ID,

        "Amazon-Advertising-API-Scope":
        str(account.profile_id),

        "Content-Type":
        "application/vnd.spcampaign.v3+json",

        "Accept":
        "application/vnd.spcampaign.v3+json"
    }

    base_url = REGION_URLS.get(account.region)

    url = f"{base_url}{endpoint}"

    response = requests.request(
        method=method,
        url=url,
        headers=headers,
        params=params,
        json=payload,
        timeout=60
    )

    return response


def ads_matrix_api_request(
    account,
    method,
    endpoint,
    session=None,
    payload=None,
    content_type=None,
    accept_type=None
):

    if not session:
        session = requests.Session()

    access_token = refresh_ads_access_token(account)

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Amazon-Advertising-API-ClientId":
        settings.AMAZON_ADS_CLIENT_ID,
        # "Amazon-Advertising-API-Scope":
        # account.profile_id,
        "Amazon-Advertising-API-Scope": str(account.profile_id),
        "Content-Type": content_type,
        "Accept": accept_type
    }

    base_url = REGION_URLS.get(account.region)

    url = f"{base_url}{endpoint}"

    print(f"URL: {url}")

    response = session.request(

        method=method,

        url=url,

        headers=headers,

        json=payload,

        timeout=120
    )

    return response


def create_report(
    account,
    report_type,
    start_date,
    end_date,
    columns,
    group_by=None
):

    if group_by is None:
        group_by = ["campaign"]

    payload = {

        "name": report_type,

        "startDate":
        start_date.strftime("%Y-%m-%d"),

        "endDate":
        end_date.strftime("%Y-%m-%d"),

        "configuration": {

            "adProduct":
            "SPONSORED_PRODUCTS",

            "groupBy":
            group_by,

            "columns":
            columns,

            "reportTypeId":
            report_type,

            "timeUnit":
            "DAILY",

            "format":
            "GZIP_JSON"
        }
    }

    return ads_matrix_api_request(

        account=account,

        method="POST",

        endpoint="/reporting/reports",

        payload=payload,

        content_type=
        "application/vnd.createasyncreportrequest.v3+json",

        accept_type=
        "application/vnd.createasyncreportresponse.v3+json"
    )

def sync_reports():

    end_date = timezone.now().date()

    start_date = end_date - timedelta(days=7)

    # accounts = AmazonAdsAccount.objects.all()
    accounts = AmazonAdsAccount.objects.filter(
                is_primary = True
            )

    print("STARTING ADS REPORT SYNC")

    for account in accounts:

        print(f"\nACCOUNT: {account.profile_id}")

        for config in REPORT_CONFIGS:

            report_type = config["report_type"]

            print(f"CREATING REPORT: {report_type}")

            existing_report = AdsReportLog.objects.filter(

                amazon_account=account,

                report_type=report_type,

                start_date=start_date,

                end_date=end_date,

                status__in=[
                    "PENDING",
                    "PROCESSING",
                    "IN_PROGRESS",
                    "QUEUED"
                ]

            ).first()

            if existing_report:

                print(
                    f"REPORT ALREADY EXISTS: "
                    f"{existing_report.report_id}"
                )

                continue

            try:

                response = create_report(

                    account=account,

                    report_type=report_type,

                    start_date=start_date,

                    end_date=end_date,

                    columns=config["columns"],

                    group_by=config["group_by"]
                )

                print("STATUS:", response.status_code)
                print("BODY:", response.text)

                if response.status_code not in [200, 202]:

                    print(
                        f"FAILED: {report_type}"
                    )

                    continue

                data = response.json()

                AdsReportLog.objects.create(

                    amazon_account=account,

                    report_id=data["reportId"],

                    report_type=report_type,

                    start_date=start_date,

                    end_date=end_date,

                    status=data.get(
                        "status",
                        "PENDING"
                    ),

                    raw_response=data
                )

                print(
                    f"CREATED: {report_type}"
                )

            except Exception as e:

                print(
                    f"ERROR: {report_type}"
                )

                print(str(e))

    print("\nALL REPORTS CREATED")

    return True


# amazon_ads/sync_searchterms.py
def sync_searchterms():

    end_date = timezone.now().date()

    start_date = end_date - timedelta(days=7)

    # accounts = AmazonAdsAccount.objects.all()
    accounts = AmazonAdsAccount.objects.filter(
            is_primary = True
    )

    for account in accounts:

        response = create_report(

            account=account,

            report_type="spSearchTerm",

            start_date=start_date,

            end_date=end_date,

            columns=[

                "date",

                "campaignName",

                "searchTerm",

                "impressions",

                "clicks",

                "cost",

                "sales14d",

                "purchases14d",

                "acosClicks14d",

                "roasClicks14d"
            ],

            group_by=["searchTerm"]
        )

        if response.status_code not in [200, 202]:

            print(response.text)

            continue

        data = response.json()

        AdsReportLog.objects.update_or_create(

            report_id=data["reportId"],

            defaults={

                "amazon_account":
                account,

                "report_type":
                "spSearchTerm",

                "start_date":
                start_date,

                "end_date":
                end_date,

                "status":
                data.get("status"),

                "raw_response":
                data
            }
        )

    return True



# amazon_ads/process_reports.py

def process_reports():

    # reports = AdsReportLog.objects.filter(

    #     status__in=[
    #         "PENDING",
    #         "PROCESSING",
    #         "IN_PROGRESS",
    #         "QUEUED"
    #     ]
    # )
    reports = AdsReportLog.objects.filter(
        status="COMPLETED"
    ).exclude(
        download_url__isnull=True
    )

    print(f"TOTAL REPORTS TO PROCESS: {reports.count()}")

    for report in reports:

        print("\n" + "=" * 80)

        print(f"PROCESSING REPORT: {report.report_id}")

        print(f"REPORT TYPE: {report.report_type}")

        print(f"CURRENT STATUS: {report.status}")

        try:

            response = ads_matrix_api_request(

                account=report.amazon_account,

                method="GET",

                endpoint=f"/reporting/reports/{report.report_id}",

                content_type=
                "application/vnd.createasyncreportrequest.v3+json",

                accept_type=
                "application/vnd.createasyncreportrequest.v3+json"
            )

            print(f"API STATUS: {response.status_code}")

            if response.status_code != 200:

                print("FAILED TO FETCH REPORT STATUS")

                print(response.text)

                continue

            data = response.json()

            status = data.get("status")

            report.status = status

            if status == "COMPLETED":

                report.download_url = data.get("url")

            report.raw_response = data

            report.save()

            print(f"UPDATED STATUS: {status}")

            # -------------------------------------------------
            # REPORT STILL PROCESSING
            # -------------------------------------------------

            if status != "COMPLETED":

                print("REPORT NOT READY YET")

                continue

            # -------------------------------------------------
            # DOWNLOAD URL MISSING
            # -------------------------------------------------

            if not report.download_url:

                print("DOWNLOAD URL NOT FOUND")

                continue

            # -------------------------------------------------
            # DOWNLOAD REPORT
            # -------------------------------------------------

            print("DOWNLOADING REPORT...")

            r = requests.get(
                report.download_url,
                timeout=120
            )

            if r.status_code != 200:

                print("FAILED TO DOWNLOAD REPORT")

                continue

            rows = json.loads(
                gzip.decompress(r.content)
            )

            print(f"TOTAL ROWS: {len(rows)}")

            # =================================================
            # CAMPAIGN REPORT
            # =================================================

            if report.report_type == "spCampaigns":

                total_saved = 0

                for row in rows:

                    campaign_id = row.get("campaignId")

                    if not campaign_id:
                        continue

                    campaign = AdsCampaign.objects.filter(
                        campaign_id=campaign_id
                    ).first()

                    if not campaign:

                        print(
                            f"CAMPAIGN NOT FOUND: {campaign_id}"
                        )

                        continue

                    CampaignMetric.objects.update_or_create(

                        campaign=campaign,

                        report_date=row.get("date"),

                        defaults={

                            "impressions":
                            row.get("impressions") or 0,

                            "clicks":
                            row.get("clicks") or 0,

                            "cost":
                            row.get("cost") or 0,

                            "sales":
                            row.get("sales14d") or 0,

                            "orders":
                            row.get("purchases14d") or 0,

                            "units":
                            row.get(
                                "unitsSoldClicks14d"
                            ) or 0,

                            "ctr":
                            row.get(
                                "clickThroughRate"
                            ) or 0,

                            "cpc":
                            row.get(
                                "costPerClick"
                            ) or 0,

                            "acos":
                            row.get(
                                "acosClicks14d"
                            ) or 0,

                            "roas":
                            row.get(
                                "roasClicks14d"
                            ) or 0,

                            "raw_data":
                            row
                        }
                    )

                    total_saved += 1

                print(
                    f"CAMPAIGN METRICS SAVED: {total_saved}"
                )

            # =================================================
            # SEARCH TERM REPORT
            # =================================================

            elif report.report_type == "spSearchTerm":

                total_saved = 0

                for row in rows:

                    campaign_id = str(row.get("campaignId", "")).strip()

                    print("ROW CAMPAIGN ID:", campaign_id)

                    if not campaign_id:
                        print("NO CAMPAIGN ID")
                        continue

                    campaign = AdsCampaign.objects.filter(
                        campaign_id=str(campaign_id).strip()
                    ).first()

                    if not campaign:

                        print(
                            f"CAMPAIGN NOT FOUND: {campaign_id}"
                        )

                        continue

                    search_term = row.get("searchTerm")

                    print("SEARCH TERM:", search_term)

                    if not search_term:
                        print("NO SEARCH TERM")
                        continue

                    SearchTermMetric.objects.update_or_create(

                        campaign=campaign,

                        search_term=search_term,

                        report_date=row.get("date"),

                        defaults={

                            "impressions": row.get("impressions", 0),

                            "clicks": row.get("clicks", 0),

                            "cost": row.get("cost", 0),

                            "sales": row.get("sales14d", 0),

                            "orders": row.get("purchases14d", 0),

                            "acos": row.get("acosClicks14d") or 0,

                            "roas": row.get("roasClicks14d") or 0,

                            "raw_data": row
                        }
                    )

                    total_saved += 1

                    print(f"SAVED SEARCH TERM: {search_term}")

                print(
                    f"SEARCH TERM METRICS SAVED: {total_saved}"
                )
           
            # =================================================
            # KEYWORD REPORT
            # =================================================

            elif report.report_type == "spKeywords":

                total_saved = 0

                print("PROCESSING KEYWORD REPORT")

                for row in rows:

                    try:

                        keyword_id = str(
                            row.get("keywordId", "")
                        ).strip()

                        if not keyword_id:

                            print("KEYWORD ID MISSING")
                            continue

                        print(f"KEYWORD ID: {keyword_id}")

                        keyword = AdsKeyword.objects.filter(
                            keyword_id=keyword_id
                        ).first()

                        if not keyword:

                            print(
                                f"KEYWORD NOT FOUND: {keyword_id}"
                            )

                            continue

                        metric, created = KeywordMetric.objects.update_or_create(

                            keyword=keyword,

                            report_date=row.get("date"),

                            defaults={

                                "impressions":
                                int(row.get("impressions", 0) or 0),

                                "clicks":
                                int(row.get("clicks", 0) or 0),

                                "cost":
                                float(row.get("cost", 0) or 0),

                                "sales":
                                float(row.get("sales14d", 0) or 0),

                                "orders":
                                int(row.get("purchases14d", 0) or 0),

                                "acos":
                                float(
                                    row.get("acosClicks14d") if row.get("acosClicks14d") is not None
                                    else ((row.get("cost", 0) / row.get("sales14d")) * 100 if row.get("sales14d", 0) > 0 else 0)
                                ),

                                "roas":
                                float(
                                    row.get("roasClicks14d") if row.get("roasClicks14d") is not None
                                    else (row.get("sales14d", 0) / row.get("cost") if row.get("cost", 0) > 0 else 0)
                                ),

                                "raw_data":
                                row
                            }
                        )

                        total_saved += 1

                        if created:
                            print(
                                f"CREATED KEYWORD METRIC: {keyword_id}"
                            )
                        else:
                            print(
                                f"UPDATED KEYWORD METRIC: {keyword_id}"
                            )

                    except Exception as e:

                        print(
                            f"KEYWORD SAVE ERROR: {str(e)}"
                        )

                        continue

                print(
                    f"TOTAL KEYWORD METRICS SAVED: {total_saved}"
                )

          

            # =================================================
            # TARGET REPORT
            # =================================================

            elif report.report_type == "spTargeting":

                total_saved = 0

                print("PROCESSING TARGET REPORT")

                for row in rows:

                    try:

                        target_id = str(
                            row.get("keywordId") or row.get("targetId") or ""
                        ).strip()

                        if not target_id:

                            print("TARGET ID MISSING")
                            continue

                        print(f"TARGET ID: {target_id}")

                        target = AdsTarget.objects.filter(
                            target_id=target_id
                        ).first()

                        if not target:

                            print(
                                f"TARGET NOT FOUND: {target_id}"
                            )

                            continue

                        metric, created = TargetMetric.objects.update_or_create(

                            target=target,

                            report_date=row.get("date"),

                            defaults={

                                "impressions":
                                int(row.get("impressions", 0) or 0),

                                "clicks":
                                int(row.get("clicks", 0) or 0),

                                "cost":
                                float(row.get("cost", 0) or 0),

                                "sales":
                                float(row.get("sales14d", 0) or 0),

                                "orders":
                                int(row.get("purchases14d", 0) or 0),

                                "raw_data":
                                row
                            }
                        )

                        total_saved += 1

                        if created:
                            print(
                                f"CREATED TARGET METRIC: {target_id}"
                            )
                        else:
                            print(
                                f"UPDATED TARGET METRIC: {target_id}"
                            )

                    except Exception as e:

                        print(
                            f"TARGET SAVE ERROR: {str(e)}"
                        )

                        continue

                print(
                    f"TOTAL TARGET METRICS SAVED: {total_saved}"
                )

            # elif report.report_type == "spTargeting":

            #     total_saved = 0

            #     for row in rows:

            #         target_id = row.get("targetId")

            #         if not target_id:
            #             continue

            #         target = AdsTarget.objects.filter(
            #             target_id=target_id
            #         ).first()

            #         if not target:

            #             print(
            #                 f"TARGET NOT FOUND: {target_id}"
            #             )

            #             continue

            #         TargetMetric.objects.update_or_create(

            #             target=target,

            #             report_date=row.get("date"),

            #             defaults={

            #                 "impressions":
            #                 row.get("impressions", 0),

            #                 "clicks":
            #                 row.get("clicks", 0),

            #                 "cost":
            #                 row.get("cost", 0),

            #                 "sales":
            #                 row.get("sales14d", 0),

            #                 "orders":
            #                 row.get("purchases14d", 0),

            #                 "raw_data":
            #                 row
            #             }
            #         )

            #         total_saved += 1

            #     print(
            #         f"TARGET METRICS SAVED: {total_saved}"
            #     )

            # =================================================
            # PRODUCT AD REPORT
            # =================================================

            elif report.report_type == "spAdvertisedProduct":

                total_saved = 0

                for row in rows:

                    ad_id = row.get("adId")

                    if not ad_id:
                        continue

                    product_ad = AdsProductAd.objects.filter(
                        ad_id=ad_id
                    ).first()

                    if not product_ad:

                        print(
                            f"PRODUCT AD NOT FOUND: {ad_id}"
                        )

                        continue

                    ProductAdMetric.objects.update_or_create(

                        product_ad=product_ad,

                        report_date=row.get("date"),

                        defaults={

                            "impressions":
                            row.get("impressions") or 0,

                            "clicks":
                            row.get("clicks") or 0,

                            "cost":
                            row.get("cost") or 0,

                            "sales":
                            row.get("sales14d") or 0,

                            "orders":
                            row.get("purchases14d") or 0,

                            "raw_data":
                            row
                        }
                    )

                    total_saved += 1

                print(
                    f"PRODUCT AD METRICS SAVED: {total_saved}"
                )

            # =================================================
            # FINAL STATUS
            # =================================================

            report.status = "IMPORTED"

            report.save(
                update_fields=["status"]
            )

            print(
                f"REPORT IMPORTED: {report.report_id}"
            )

        except Exception as e:

            print(
                f"ERROR PROCESSING REPORT: {report.report_id}"
            )

            print(str(e))

            continue

    print("\nALL REPORTS PROCESSED")

    return True


# def process_reports():

#     reports = AdsReportLog.objects.all()

#     print("TOTAL REPORTS:", reports.count())

#     for report in reports:

#         print("PROCESSING:", report.report_id)
#         print("CURRENT STATUS:", report.status)

#         response = ads_matrix_api_request(

#             account=report.amazon_account,

#             method="GET",

#             endpoint=f"/reporting/reports/{report.report_id}",

#             content_type="application/vnd.createasyncreportrequest.v3+json",

#             accept_type="application/vnd.createasyncreportrequest.v3+json"
#         )

#         print("API STATUS:", response.status_code)
#         print("API BODY:", response.text)

#         data = response.json()

#         status = data.get("status")

#         report.status = status

#         if status == "COMPLETED":

#             report.download_url = data.get("url")

#         report.raw_response = data

#         report.save()

#         print("UPDATED STATUS:", status)

#         if status != "COMPLETED":
#             continue

#         if not report.download_url:
#             continue

#         r = requests.get(report.download_url)

#         rows = json.loads(
#             gzip.decompress(r.content)
#         )

#         print("ROWS:", len(rows))

#     return True





def check_pending_reports():

    print("CHECK FUNCTION RUNNING")

    reports = (
        AdsReportLog.objects
        .annotate(
            clean_status=Trim("status")
        )
        .filter(
            Q(clean_status__iexact="PENDING") |
            Q(clean_status__iexact="PROCESSING") |
            Q(clean_status__iexact="IN_PROGRESS") |
            Q(clean_status__iexact="QUEUED")
        )
    )

    print(f"TOTAL REPORTS TO CHECK: {reports.count()}")

    for report in reports:

        print("\n" + "=" * 100)

        print(f"REPORT ID: {report.report_id}")
        print(f"REPORT TYPE: {report.report_type}")

        try:

            # =====================================================
            # IMPORTANT:
            # USE ads_matrix_api_request
            # =====================================================

            response = ads_matrix_api_request(

                account=report.amazon_account,

                method="GET",

                endpoint=f"/reporting/reports/{report.report_id}",

                content_type="application/vnd.createasyncreportrequest.v3+json",

                accept_type="application/vnd.createasyncreportrequest.v3+json"
            )

            print("STATUS CODE:", response.status_code)

            if response.status_code != 200:

                print("FAILED TO CHECK REPORT")
                print(response.text)

                continue

            data = response.json()

            print("FULL RESPONSE:")
            print(data)

            # =====================================================
            # AMAZON STATUS
            # =====================================================

            amazon_status = str(
                data.get("status", "")
            ).strip().upper()

            print("AMAZON STATUS:", amazon_status)

            # =====================================================
            # UPDATE STATUS
            # =====================================================

            report.status = amazon_status

            # =====================================================
            # SAVE DOWNLOAD URL
            # =====================================================

            download_url = data.get("url")

            if download_url:

                report.download_url = download_url

                print("DOWNLOAD URL SAVED")

            # =====================================================
            # SAVE RAW RESPONSE
            # =====================================================

            report.raw_response = data

            report.save()

            print(
                f"UPDATED SUCCESSFULLY -> "
                f"{report.report_id} : {amazon_status}"
            )

        except Exception as e:

            print(
                f"ERROR IN REPORT: {report.report_id}"
            )

            print(str(e))

    print("\nALL REPORTS CHECKED")

    return True

def extract_amazon_errors(error_items):

    parsed_errors = []

    for item in error_items:

        for error in item.get(
            "errors",
            []
        ):

            error_value = error.get(
                "errorValue",
                {}
            )

            for value in error_value.values():

                parsed_errors.append({

                    "message":
                    value.get("message"),

                    "reason":
                    value.get("reason")
                })

    return parsed_errors

def get_primary_amazon_account(user):

    account = AmazonAdsAccount.objects.get(
        user=user,
        is_primary=True
    )

    if not account:
        raise Exception(
            "No primary Amazon account found"
        )

    return account