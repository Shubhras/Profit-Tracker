from amazon_ads.models import AdsCampaign
from amazon_ads.utils import ads_api_request


def sync_campaigns(account):

    payload = {
        "maxResults": 1000
    }

    response = ads_api_request(
        account=account,
        method="POST",
        endpoint="/sp/campaigns/list",
        payload=payload
    )

    if response.status_code != 200:

        print("CAMPAIGN SYNC ERROR")
        print(response.text)

        return False

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

                "amazon_account":
                account,

                "name":
                item.get("name"),

                "start_date":
                item.get("startDate"),

                "state":
                item.get("state"),

                "campaign_type":
                item.get("campaignType"),

                "targeting_type":
                item.get("targetingType"),

                "daily_budget":
                item.get("budget", {}).get(
                    "budget", 0
                ),

                "budget_type":
                item.get("budget", {}).get(
                    "budgetType"
                ),

                "bidding_strategy":
                dynamic_bidding.get(
                    "strategy"
                ),

                "placement_bidding":
                dynamic_bidding.get(
                    "placementBidding", []
                ),

                "marketplace_budget_allocation":
                item.get(
                    "marketplaceBudgetAllocation"
                ),

                "off_amazon_settings":
                item.get(
                    "offAmazonSettings", {}
                ),

                "tags":
                item.get(
                    "tags", {}
                ),

                "raw_data":
                item
            }
        )

        saved += 1

    print(f"TOTAL CAMPAIGNS SAVED: {saved}")

    return True