# services/campaign_negative_target_sync.py

from django.db import transaction

from amazon_ads.models import (
    AmazonAdsAccount,
    AdsCampaign,
    AdsCampaignNegativeTarget
)

from amazon_ads.utils import ads_matrix_api_request


def sync_campaign_negative_targets():

    accounts = AmazonAdsAccount.objects.filter(
            is_primary = True
        )

    total_saved = 0

    for account in accounts:

        print("\n" + "=" * 80)

        print(f"SYNCING ACCOUNT: {account.profile_id}")

        next_token = None

        while True:

            params = {
                "count": 1000
            }

            if next_token:
                params["nextToken"] = next_token

            response = ads_matrix_api_request(

                account=account,

                method="POST",

                endpoint="/sp/campaignNegativeTargets/list",

                payload=params,

                content_type="application/vnd.spCampaignNegativeTargetingClause.v3+json",

                accept_type="application/vnd.spCampaignNegativeTargetingClause.v3+json"
            )
            

            print(f"API STATUS: {response.status_code}")

            if response.status_code != 200:

                print(response.text)

                break

            data = response.json()

            negative_targets = data.get(
                "negativeTargets",
                []
            )

            print(
                f"TOTAL NEGATIVE TARGETS: {len(negative_targets)}"
            )

            for item in negative_targets:

                try:

                    negative_target_id = item.get(
                        "targetId"
                    )

                    campaign_id = item.get(
                        "campaignId"
                    )
                    extended_data = item.get(
                        "extendedData",
                        {}
                    )

                    if not negative_target_id:

                        continue

                    if not campaign_id:

                        continue

                    campaign = AdsCampaign.objects.filter(
                        campaign_id=int(campaign_id)
                    ).first()

                    if not campaign:

                        print(
                            f"CAMPAIGN NOT FOUND: {campaign_id}"
                        )

                        continue

                    with transaction.atomic():

                        AdsCampaignNegativeTarget.objects.update_or_create(

                            amazon_account=account,

                            negative_target_id=int(
                                negative_target_id
                            ),

                            defaults={

                                "campaign": campaign,

                                "expression_type":
                                item.get(
                                    "expressionType"
                                ),

                                "expression":
                                item.get(
                                    "expression",
                                    []
                                ),

                                "resolved_expression":
                                item.get(
                                    "resolvedExpression",
                                    []
                                ),

                                "state":
                                item.get(
                                    "state"
                                ),

                                "serving_status":
                                item.get(
                                    "servingStatus"
                                ),

                                "bid":
                                item.get(
                                    "bid",
                                    0
                                ) or 0,

                                 "creation_date_time":
                                extended_data.get(
                                    "creationDateTime"
                                ),

                                "last_update_date_time":
                                extended_data.get(
                                    "lastUpdateDateTime"
                                ),

                                "raw_data":
                                item
                            }
                        )

                    total_saved += 1

                    print(
                        f"SAVED NEGATIVE TARGET: {negative_target_id}"
                    )

                except Exception as e:

                    print(
                        f"ERROR SAVING TARGET: {str(e)}"
                    )

                    continue

            next_token = data.get(
                "nextToken"
            )

            if not next_token:

                break

    print("\n" + "=" * 80)

    print(
        f"TOTAL NEGATIVE TARGETS SAVED: {total_saved}"
    )

    return True


