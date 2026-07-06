from django.db import transaction

from amazon_ads.models import (
    AdsAdGroup,
    AdsCampaign,
)
from amazon_ads.utils import ads_matrix_api_request


def sync_adgroups(account):

    print("\n" + "=" * 80)
    print(f"SYNCING ADGROUPS: {account.profile_id}")

    total_saved = 0

    campaign_map = {
        str(c.campaign_id): c
        for c in AdsCampaign.objects.filter(amazon_account=account).only(
            "id", "campaign_id"
        )
    }

    campaign_ids = list(campaign_map.keys())

    existing_adgroups = {
        str(obj.ad_group_id): obj
        for obj in AdsAdGroup.objects.filter(amazon_account=account)
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
                endpoint="/sp/adGroups/list",
                payload=payload,
                content_type="application/vnd.spadgroup.v3+json",
                accept_type="application/vnd.spadgroup.v3+json",
            )

            print(f"API STATUS: {response.status_code}")

            if response.status_code != 200:
                print("ADGROUP SYNC ERROR")
                print(response.text)

                break

            data = response.json()

            ad_groups = data.get("adGroups", [])

            print(f"ADGROUPS RECEIVED: {len(ad_groups)}")

            for item in ad_groups:
                try:
                    ad_group_id = str(item.get("adGroupId"))

                    campaign = campaign_map.get(str(item.get("campaignId")))

                    if not campaign:
                        continue

                    if ad_group_id in existing_adgroups:
                        obj = existing_adgroups[ad_group_id]

                        obj.campaign = campaign
                        obj.name = item.get("name")
                        obj.state = item.get("state")
                        obj.default_bid = item.get("defaultBid", 0)
                        obj.raw_data = item

                        update_objects.append(obj)

                    else:
                        obj = AdsAdGroup(
                            amazon_account=account,
                            campaign=campaign,
                            ad_group_id=int(ad_group_id),
                            name=item.get("name"),
                            state=item.get("state"),
                            default_bid=item.get("defaultBid", 0),
                            raw_data=item,
                        )

                        create_objects.append(obj)

                        existing_adgroups[ad_group_id] = obj

                    total_saved += 1

                except Exception as e:
                    print(f"FAILED ADGROUP {item.get('adGroupId')}: {e}")

                    continue

            next_token = data.get("nextToken")

            if not next_token:
                break

    # -------------------------------------------------
    # BULK CREATE
    # -------------------------------------------------

    if create_objects:
        with transaction.atomic():
            AdsAdGroup.objects.bulk_create(
                create_objects, batch_size=500, ignore_conflicts=True
            )

        print(f"CREATED: {len(create_objects)}")

    # -------------------------------------------------
    # BULK UPDATE
    # -------------------------------------------------

    if update_objects:
        with transaction.atomic():
            AdsAdGroup.objects.bulk_update(
                update_objects,
                [
                    "campaign",
                    "name",
                    "state",
                    "default_bid",
                    "raw_data",
                ],
                batch_size=500,
            )

        print(f"UPDATED: {len(update_objects)}")

    print("\n" + "=" * 80)
    print(f"TOTAL ADGROUPS SAVED: {total_saved}")
    print("=" * 80)

    return total_saved
