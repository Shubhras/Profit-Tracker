from django.db import transaction

from amazon_ads.models import AdsCampaign
from amazon_ads.utils import ads_api_request


def sync_campaigns(account):

    print("\n" + "=" * 80)
    print(f"SYNCING CAMPAIGNS: {account.profile_id}")

    total_saved = 0

    existing_campaigns = {
        str(obj.campaign_id): obj
        for obj in AdsCampaign.objects.filter(amazon_account=account)
    }

    create_objects = []

    update_objects = []

    next_token = None

    while True:
        payload = {"maxResults": 1000}

        if next_token:
            payload["nextToken"] = next_token

        response = ads_api_request(
            account=account,
            method="POST",
            endpoint="/sp/campaigns/list",
            payload=payload,
        )

        print(f"API STATUS: {response.status_code}")

        if response.status_code != 200:
            print("CAMPAIGN SYNC ERROR")
            print(response.text)

            break

        data = response.json()

        campaigns = data.get("campaigns", [])

        print(f"CAMPAIGNS RECEIVED: {len(campaigns)}")

        for item in campaigns:
            try:
                campaign_id = str(item.get("campaignId"))

                dynamic_bidding = item.get("dynamicBidding", {})

                if campaign_id in existing_campaigns:
                    obj = existing_campaigns[campaign_id]

                    obj.name = item.get("name")
                    obj.start_date = item.get("startDate")
                    obj.end_date = item.get("endDate")
                    obj.state = item.get("state")
                    obj.campaign_type = item.get("campaignType")
                    obj.targeting_type = item.get("targetingType")
                    obj.daily_budget = item.get("budget", {}).get("budget", 0)

                    obj.budget_type = item.get("budget", {}).get("budgetType")

                    obj.bidding_strategy = dynamic_bidding.get("strategy")

                    obj.placement_bidding = dynamic_bidding.get("placementBidding", [])

                    obj.marketplace_budget_allocation = item.get(
                        "marketplaceBudgetAllocation"
                    )

                    obj.off_amazon_settings = item.get("offAmazonSettings", {})

                    obj.tags = item.get("tags", {})

                    obj.raw_data = item

                    update_objects.append(obj)

                else:
                    obj = AdsCampaign(
                        amazon_account=account,
                        campaign_id=int(campaign_id),
                        name=item.get("name"),
                        start_date=item.get("startDate"),
                        end_date=item.get("endDate"),
                        state=item.get("state"),
                        campaign_type=item.get("campaignType"),
                        targeting_type=item.get("targetingType"),
                        daily_budget=item.get("budget", {}).get("budget", 0),
                        budget_type=item.get("budget", {}).get("budgetType"),
                        bidding_strategy=dynamic_bidding.get("strategy"),
                        placement_bidding=dynamic_bidding.get("placementBidding", []),
                        marketplace_budget_allocation=item.get(
                            "marketplaceBudgetAllocation"
                        ),
                        off_amazon_settings=item.get("offAmazonSettings", {}),
                        tags=item.get("tags", {}),
                        raw_data=item,
                    )

                    create_objects.append(obj)

                    existing_campaigns[campaign_id] = obj

                total_saved += 1

            except Exception as e:
                print(f"FAILED CAMPAIGN {item.get('campaignId')}: {e}")

                continue

        next_token = data.get("nextToken")

        if not next_token:
            break

    # -------------------------------------------------
    # BULK CREATE
    # -------------------------------------------------

    if create_objects:
        with transaction.atomic():
            AdsCampaign.objects.bulk_create(
                create_objects,
                batch_size=500,
                ignore_conflicts=True,
            )

        print(f"CAMPAIGNS CREATED: {len(create_objects)}")

    # -------------------------------------------------
    # BULK UPDATE
    # -------------------------------------------------

    if update_objects:
        with transaction.atomic():
            AdsCampaign.objects.bulk_update(
                update_objects,
                [
                    "name",
                    "start_date",
                    "end_date",
                    "state",
                    "campaign_type",
                    "targeting_type",
                    "daily_budget",
                    "budget_type",
                    "bidding_strategy",
                    "placement_bidding",
                    "marketplace_budget_allocation",
                    "off_amazon_settings",
                    "tags",
                    "raw_data",
                ],
                batch_size=500,
            )

        print(f"CAMPAIGNS UPDATED: {len(update_objects)}")

    print("\n" + "=" * 80)
    print(f"TOTAL CAMPAIGNS SAVED: {total_saved}")
    print("=" * 80)

    return total_saved
