# services/negative_keyword_sync.py

from django.db import transaction
from django.utils.dateparse import parse_datetime

from amazon_ads.models import (
    AmazonAdsAccount,
    AdsCampaign,
    AdsAdGroup,
    AdsNegativeKeyword
)

from amazon_ads.utils import ads_matrix_api_request


def sync_negative_keywords():

    accounts = AmazonAdsAccount.objects.filter(
        is_primary=True
    )

    total_saved = 0

    for account in accounts:

        print("\n" + "=" * 80)
        print(f"SYNCING ACCOUNT: {account.profile_id}")

        next_token = None

        while True:

            payload = {
                "maxResults": 1000,
                "includeExtendedDataFields": True
            }

            if next_token:
                payload["nextToken"] = next_token

            response = ads_matrix_api_request(

                account=account,

                method="POST",

                endpoint="/sp/negativeKeywords/list",

                payload=payload,

                content_type=
                "application/vnd.spNegativeKeyword.v3+json",

                accept_type=
                "application/vnd.spNegativeKeyword.v3+json"
            )

            print(f"API STATUS: {response.status_code}")

            if response.status_code != 200:

                print(response.text)
                break

            data = response.json()

            negative_keywords = data.get(
                "negativeKeywords",
                []
            )

            print(
                f"TOTAL NEGATIVE KEYWORDS: "
                f"{len(negative_keywords)}"
            )

            for item in negative_keywords:

                try:

                    negative_keyword_id = item.get(
                        "keywordId"
                    )

                    campaign_id = item.get(
                        "campaignId"
                    )

                    ad_group_id = item.get(
                        "adGroupId"
                    )

                    extended_data = item.get(
                        "extendedData",
                        {}
                    )

                    if not negative_keyword_id:
                        continue

                    if not campaign_id:
                        continue

                    campaign = AdsCampaign.objects.filter(
                        campaign_id=int(campaign_id)
                    ).first()

                    if not campaign:

                        print(
                            f"CAMPAIGN NOT FOUND: "
                            f"{campaign_id}"
                        )

                        continue

                    ad_group = None

                    if ad_group_id:

                        ad_group = AdsAdGroup.objects.filter(
                            ad_group_id=int(ad_group_id)
                        ).first()

                        if not ad_group:

                            print(
                                f"AD GROUP NOT FOUND: "
                                f"{ad_group_id}"
                            )

                    creation_date_time = parse_datetime(
                        extended_data.get(
                            "creationDateTime"
                        )
                    ) if extended_data.get(
                        "creationDateTime"
                    ) else None

                    last_update_date_time = parse_datetime(
                        extended_data.get(
                            "lastUpdateDateTime"
                        )
                    ) if extended_data.get(
                        "lastUpdateDateTime"
                    ) else None

                    with transaction.atomic():

                        AdsNegativeKeyword.objects.update_or_create(

                            amazon_account=account,

                            negative_keyword_id=int(
                                negative_keyword_id
                            ),

                            defaults={

                                "campaign":
                                campaign,

                                "ad_group":
                                ad_group,

                                "keyword_text":
                                item.get(
                                    "keywordText"
                                ),

                                "match_type":
                                item.get(
                                    "matchType"
                                ),

                                "state":
                                item.get(
                                    "state"
                                ),

                                "serving_status":
                                extended_data.get(
                                    "servingStatus"
                                ),

                                "creation_date_time":
                                creation_date_time,

                                "last_update_date_time":
                                last_update_date_time,

                                "native_language_keyword":
                                item.get(
                                    "nativeLanguageKeyword",
                                    False
                                ),

                                "raw_data":
                                item
                            }
                        )

                    total_saved += 1

                    print(
                        f"SAVED NEGATIVE KEYWORD: "
                        f"{negative_keyword_id}"
                    )

                except Exception as e:

                    print(
                        f"ERROR SAVING KEYWORD: "
                        f"{str(e)}"
                    )

                    continue

            next_token = data.get(
                "nextToken"
            )

            if not next_token:
                break

    print("\n" + "=" * 80)

    print(
        f"TOTAL NEGATIVE KEYWORDS SAVED: "
        f"{total_saved}"
    )

    return True