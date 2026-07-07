from django.db import transaction
from django.utils.dateparse import parse_datetime

from amazon_ads.models import (
    AdsAdGroup,
    AdsCampaign,
    AdsNegativeKeyword,
)
from amazon_ads.utils import ads_matrix_api_request

# =====================================================
# AD GROUP NEGATIVE KEYWORDS
# =====================================================


def sync_negative_keywords(account):

    print("\n" + "=" * 80)
    print(f"SYNCING NEGATIVE KEYWORDS: {account.profile_id}")

    total_saved = 0

    campaign_map = {
        str(c.campaign_id): c
        for c in AdsCampaign.objects.filter(amazon_account=account).only(
            "id", "campaign_id"
        )
    }

    adgroup_map = {
        str(a.ad_group_id): a
        for a in AdsAdGroup.objects.filter(amazon_account=account).only(
            "id", "campaign", "ad_group_id"
        )
    }

    adgroup_ids = list(adgroup_map.keys())

    existing_negative_keywords = {
        str(obj.negative_keyword_id): obj
        for obj in AdsNegativeKeyword.objects.filter(amazon_account=account)
    }

    create_objects = []

    update_objects = []

    # -------------------------------------------------
    # PROCESS 100 ADGROUPS PER REQUEST
    # -------------------------------------------------

    for i in range(0, len(adgroup_ids), 100):
        batch_adgroup_ids = adgroup_ids[i : i + 100]

        next_token = None

        while True:
            payload = {
                "maxResults": 1000,
                "includeExtendedDataFields": True,
                "adGroupIdFilter": {"include": batch_adgroup_ids},
            }

            if next_token:
                payload["nextToken"] = next_token

            response = ads_matrix_api_request(
                account=account,
                method="POST",
                endpoint="/sp/negativeKeywords/list",
                payload=payload,
                content_type="application/vnd.spNegativeKeyword.v3+json",
                accept_type="application/vnd.spNegativeKeyword.v3+json",
            )

            print(f"API STATUS: {response.status_code}")

            if response.status_code != 200:
                print("NEGATIVE KEYWORD SYNC ERROR")
                print(response.text)

                break

            data = response.json()

            negative_keywords = data.get("negativeKeywords", [])

            print(f"NEGATIVE KEYWORDS RECEIVED: {len(negative_keywords)}")

            for item in negative_keywords:
                try:
                    negative_keyword_id = str(item.get("keywordId"))

                    campaign = campaign_map.get(str(item.get("campaignId")))

                    ad_group = adgroup_map.get(str(item.get("adGroupId")))

                    if not campaign or not ad_group:
                        continue
                    extended_data = item.get("extendedData", {})
                    creation_date_time = (
                        parse_datetime(extended_data.get("creationDateTime"))
                        if extended_data.get("creationDateTime")
                        else None
                    )

                    last_update_date_time = (
                        parse_datetime(extended_data.get("lastUpdateDateTime"))
                        if extended_data.get("lastUpdateDateTime")
                        else None
                    )
                    if negative_keyword_id in existing_negative_keywords:
                        obj = existing_negative_keywords[negative_keyword_id]

                        obj.campaign = campaign
                        obj.ad_group = ad_group
                        obj.keyword_text = item.get("keywordText")
                        obj.match_type = item.get("matchType")
                        obj.state = item.get("state")
                        obj.serving_status = extended_data.get("servingStatus")
                        obj.creation_date_time = creation_date_time
                        obj.last_update_date_time = last_update_date_time
                        obj.native_language_keyword = item.get(
                            "nativeLanguageKeyword", False
                        )
                        obj.raw_data = item

                        update_objects.append(obj)

                    else:
                        obj = AdsNegativeKeyword(
                            amazon_account=account,
                            campaign=campaign,
                            ad_group=ad_group,  # or None in campaign sync
                            negative_keyword_id=int(negative_keyword_id),
                            keyword_text=item.get("keywordText"),
                            match_type=item.get("matchType"),
                            state=item.get("state"),
                            serving_status=extended_data.get("servingStatus"),
                            creation_date_time=creation_date_time,
                            last_update_date_time=last_update_date_time,
                            native_language_keyword=item.get(
                                "nativeLanguageKeyword",
                                False,
                            ),
                            raw_data=item,
                        )

                        create_objects.append(obj)

                        existing_negative_keywords[negative_keyword_id] = obj

                    total_saved += 1

                except Exception as e:
                    print(f"FAILED NEGATIVE KEYWORD {item.get('keywordId')}: {e}")

                    continue

            next_token = data.get("nextToken")

            if not next_token:
                break

    # -------------------------------------------------
    # BULK CREATE
    # -------------------------------------------------

    if create_objects:
        with transaction.atomic():
            AdsNegativeKeyword.objects.bulk_create(
                create_objects,
                batch_size=500,
                ignore_conflicts=True,
            )

        print(f"NEGATIVE KEYWORDS CREATED: {len(create_objects)}")

    # -------------------------------------------------
    # BULK UPDATE
    # -------------------------------------------------

    if update_objects:
        with transaction.atomic():
            AdsNegativeKeyword.objects.bulk_update(
                update_objects,
                [
                    "campaign",
                    "ad_group",
                    "keyword_text",
                    "match_type",
                    "state",
                    "serving_status",
                    "creation_date_time",
                    "last_update_date_time",
                    "native_language_keyword",
                    "raw_data",
                ],
                batch_size=500,
            )

        print(f"NEGATIVE KEYWORDS UPDATED: {len(update_objects)}")

    print("\n" + "=" * 80)
    print(f"TOTAL NEGATIVE KEYWORDS SAVED: {total_saved}")
    print("=" * 80)

    return total_saved


# =====================================================
# CAMPAIGN NEGATIVE KEYWORDS
# =====================================================


def sync_campaign_negative_keywords(account):

    print("\n" + "=" * 80)
    print(f"SYNCING CAMPAIGN NEGATIVE KEYWORDS: {account.profile_id}")

    total_saved = 0

    campaign_map = {
        str(c.campaign_id): c
        for c in AdsCampaign.objects.filter(amazon_account=account).only(
            "id", "campaign_id"
        )
    }

    campaign_ids = list(campaign_map.keys())

    existing_negative_keywords = {
        str(obj.negative_keyword_id): obj
        for obj in AdsNegativeKeyword.objects.filter(amazon_account=account)
    }

    create_objects = []

    update_objects = []

    # -------------------------------------------------
    # PROCESS 100 CAMPAIGNS PER REQUEST
    # -------------------------------------------------

    for i in range(0, len(campaign_ids), 100):
        batch_campaign_ids = campaign_ids[i : i + 100]

        next_token = None

        while True:
            payload = {
                "maxResults": 1000,
                "includeExtendedDataFields": True,
                "campaignIdFilter": {"include": batch_campaign_ids},
            }

            if next_token:
                payload["nextToken"] = next_token

            response = ads_matrix_api_request(
                account=account,
                method="POST",
                endpoint="/sp/campaignNegativeKeywords/list",
                payload=payload,
                content_type="application/vnd.spCampaignNegativeKeyword.v3+json",
                accept_type="application/vnd.spCampaignNegativeKeyword.v3+json",
            )

            print(f"API STATUS: {response.status_code}")

            if response.status_code != 200:
                print("CAMPAIGN NEGATIVE KEYWORD SYNC ERROR")
                print(response.text)

                break

            data = response.json()

            negative_keywords = data.get("campaignNegativeKeywords", [])

            print(f"CAMPAIGN NEGATIVE KEYWORDS RECEIVED: {len(negative_keywords)}")

            for item in negative_keywords:
                try:
                    negative_keyword_id = str(item.get("keywordId"))

                    campaign = campaign_map.get(str(item.get("campaignId")))

                    if not campaign:
                        continue
                    extended_data = item.get("extendedData", {})
                    creation_date_time = (
                        parse_datetime(extended_data.get("creationDateTime"))
                        if extended_data.get("creationDateTime")
                        else None
                    )

                    last_update_date_time = (
                        parse_datetime(extended_data.get("lastUpdateDateTime"))
                        if extended_data.get("lastUpdateDateTime")
                        else None
                    )
                    if negative_keyword_id in existing_negative_keywords:
                        obj = existing_negative_keywords[negative_keyword_id]

                        obj.campaign = campaign
                        obj.ad_group = None
                        obj.keyword_text = item.get("keywordText")
                        obj.match_type = item.get("matchType")
                        obj.state = item.get("state")
                        obj.serving_status = extended_data.get("servingStatus")
                        obj.creation_date_time = creation_date_time
                        obj.last_update_date_time = last_update_date_time
                        obj.native_language_keyword = item.get(
                            "nativeLanguageKeyword", False
                        )
                        obj.raw_data = item

                        update_objects.append(obj)

                    else:
                        obj = AdsNegativeKeyword(
                            amazon_account=account,
                            campaign=campaign,
                            ad_group=None,
                            negative_keyword_id=int(negative_keyword_id),
                            keyword_text=item.get("keywordText"),
                            match_type=item.get("matchType"),
                            state=item.get("state"),
                            serving_status=extended_data.get("servingStatus"),
                            creation_date_time=creation_date_time,
                            last_update_date_time=last_update_date_time,
                            native_language_keyword=item.get(
                                "nativeLanguageKeyword",
                                False,
                            ),
                            raw_data=item,
                        )

                        create_objects.append(obj)

                        existing_negative_keywords[negative_keyword_id] = obj

                    total_saved += 1

                except Exception as e:
                    print(
                        f"FAILED CAMPAIGN NEGATIVE KEYWORD {item.get('keywordId')}: {e}"
                    )

                    continue

            next_token = data.get("nextToken")

            if not next_token:
                break

    # -------------------------------------------------
    # BULK CREATE
    # -------------------------------------------------

    if create_objects:
        with transaction.atomic():
            AdsNegativeKeyword.objects.bulk_create(
                create_objects,
                batch_size=500,
                ignore_conflicts=True,
            )

        print(f"CAMPAIGN NEGATIVE KEYWORDS CREATED: {len(create_objects)}")

    # -------------------------------------------------
    # BULK UPDATE
    # -------------------------------------------------

    if update_objects:
        with transaction.atomic():
            AdsNegativeKeyword.objects.bulk_update(
                update_objects,
                [
                    "campaign",
                    "ad_group",
                    "keyword_text",
                    "match_type",
                    "state",
                    "serving_status",
                    "creation_date_time",
                    "last_update_date_time",
                    "native_language_keyword",
                    "raw_data",
                ],
                batch_size=500,
            )

        print(f"CAMPAIGN NEGATIVE KEYWORDS UPDATED: {len(update_objects)}")

    print("\n" + "=" * 80)
    print(f"CAMPAIGN TOTAL NEGATIVE KEYWORDS SAVED: {total_saved}")
    print("=" * 80)

    return total_saved
