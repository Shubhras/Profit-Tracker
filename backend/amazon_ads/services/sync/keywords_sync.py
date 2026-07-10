from django.db import transaction

from amazon_ads.models import (
    AdsAdGroup,
    AdsCampaign,
    AdsKeyword,
)
from amazon_ads.utils import ads_matrix_api_request


def sync_keywords(account):

    print("\n" + "=" * 80)
    print(f"SYNCING KEYWORDS: {account.profile_id}")

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

    existing_keywords = {
        str(obj.keyword_id): obj
        for obj in AdsKeyword.objects.filter(amazon_account=account)
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
                endpoint="/sp/keywords/list",
                payload=payload,
                content_type="application/vnd.spkeyword.v3+json",
                accept_type="application/vnd.spkeyword.v3+json",
            )

            print(f"API STATUS: {response.status_code}")

            if response.status_code != 200:
                print("KEYWORD SYNC ERROR")
                print(response.text)

                break

            data = response.json()

            keywords = data.get("keywords", [])

            print(f"KEYWORDS RECEIVED: {len(keywords)}")

            for item in keywords:
                try:
                    keyword_id = str(item.get("keywordId"))

                    campaign = campaign_map.get(str(item.get("campaignId")))

                    ad_group = adgroup_map.get(str(item.get("adGroupId")))

                    if not campaign or not ad_group:
                        continue

                    if keyword_id in existing_keywords:
                        obj = existing_keywords[keyword_id]

                        obj.campaign = campaign
                        obj.ad_group = ad_group
                        obj.keyword_text = item.get("keywordText")
                        obj.match_type = item.get("matchType")
                        obj.bid = item.get("bid", 0)
                        obj.state = item.get("state")
                        obj.raw_data = item

                        update_objects.append(obj)

                    else:
                        obj = AdsKeyword(
                            amazon_account=account,
                            campaign=campaign,
                            ad_group=ad_group,
                            keyword_id=keyword_id,
                            keyword_text=item.get("keywordText"),
                            match_type=item.get("matchType"),
                            bid=item.get("bid", 0),
                            state=item.get("state"),
                            raw_data=item,
                        )

                        create_objects.append(obj)

                        existing_keywords[keyword_id] = obj

                    total_saved += 1

                except Exception as e:
                    print(f"FAILED KEYWORD {item.get('keywordId')}: {e}")

                    continue

            next_token = data.get("nextToken")

            if not next_token:
                break

    # -------------------------------------------------
    # BULK CREATE
    # -------------------------------------------------

    if create_objects:
        with transaction.atomic():
            AdsKeyword.objects.bulk_create(
                create_objects,
                batch_size=500,
                ignore_conflicts=True,
            )

        print(f"CREATED: {len(create_objects)}")

    # -------------------------------------------------
    # BULK UPDATE
    # -------------------------------------------------

    if update_objects:
        with transaction.atomic():
            AdsKeyword.objects.bulk_update(
                update_objects,
                [
                    "campaign",
                    "ad_group",
                    "keyword_text",
                    "match_type",
                    "bid",
                    "state",
                    "raw_data",
                ],
                batch_size=500,
            )

        print(f"UPDATED: {len(update_objects)}")

    print("\n" + "=" * 80)
    print(f"TOTAL KEYWORDS SAVED: {total_saved}")
    print("=" * 80)

    return total_saved
