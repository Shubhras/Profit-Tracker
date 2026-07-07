from django.db import transaction

from amazon_ads.models import (
    AdsAdGroup,
    AdsCampaign,
    AdsProductAd,
)
from amazon_ads.utils import ads_matrix_api_request


def sync_productads(account):

    print("\n" + "=" * 80)
    print(f"SYNCING PRODUCT ADS: {account.profile_id}")

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

    existing_ads = {
        str(obj.ad_id): obj
        for obj in AdsProductAd.objects.filter(amazon_account=account)
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
                "adGroupIdFilter": {"include": batch_adgroup_ids},
            }

            if next_token:
                payload["nextToken"] = next_token

            response = ads_matrix_api_request(
                account=account,
                method="POST",
                endpoint="/sp/productAds/list",
                payload=payload,
                content_type="application/vnd.spproductad.v3+json",
                accept_type="application/vnd.spproductad.v3+json",
            )

            print(f"API STATUS: {response.status_code}")

            if response.status_code != 200:
                print("PRODUCT AD SYNC ERROR")
                print(response.text)

                break

            data = response.json()

            product_ads = data.get("productAds", [])

            print(f"PRODUCT ADS RECEIVED: {len(product_ads)}")

            for item in product_ads:
                try:
                    ad_id = str(item.get("adId"))

                    ad_group = adgroup_map.get(str(item.get("adGroupId")))

                    if not ad_group:
                        continue

                    campaign = campaign_map.get(str(item.get("campaignId")))

                    if not campaign:
                        campaign = ad_group.campaign

                    if ad_id in existing_ads:
                        obj = existing_ads[ad_id]

                        obj.campaign = campaign

                        obj.ad_group = ad_group

                        obj.asin = item.get("asin")

                        obj.sku = item.get("sku")

                        obj.state = item.get("state")

                        obj.raw_data = item

                        update_objects.append(obj)

                    else:
                        obj = AdsProductAd(
                            amazon_account=account,
                            campaign=campaign,
                            ad_group=ad_group,
                            ad_id=int(ad_id),
                            asin=item.get("asin"),
                            sku=item.get("sku"),
                            state=item.get("state"),
                            raw_data=item,
                        )
                        create_objects.append(obj)

                        existing_ads[ad_id] = obj

                    total_saved += 1

                except Exception as e:
                    print(f"FAILED PRODUCT AD {item.get('adId')}: {e}")

                    continue

            next_token = data.get("nextToken")

            if not next_token:
                break

    # -------------------------------------------------
    # BULK CREATE
    # -------------------------------------------------

    if create_objects:
        with transaction.atomic():
            AdsProductAd.objects.bulk_create(
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
            AdsProductAd.objects.bulk_update(
                update_objects,
                [
                    "campaign",
                    "ad_group",
                    "asin",
                    "sku",
                    "state",
                    "raw_data",
                ],
                batch_size=500,
            )

        print(f"UPDATED: {len(update_objects)}")

    print("\n" + "=" * 80)
    print(f"TOTAL PRODUCT ADS SAVED: {total_saved}")
    print("=" * 80)

    return total_saved
