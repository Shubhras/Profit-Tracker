# amazon_ads/services/budget_rules.py

from amazon_ads.models import (
    AmazonAdsAccount,
    AdsBudgetRule
)

from amazon_ads.utils import ads_matrix_api_request,ads_rules_api_request

def sync_budget_rules():

    accounts = AmazonAdsAccount.objects.filter(
        is_primary=True
    )

    for account in accounts:

        print("\n" + "=" * 80)
        print(f"ACCOUNT: {account.id}")

        response = ads_rules_api_request(
            account=account,
            method="POST",
            endpoint="/sp/budgetRules/list",
            payload={
                "pageSize": 100
            }
        )

        # response = ads_rules_api_request(

        #     account=account,

        #     method="POST",

        #     endpoint="/sp/budgetRules/list",

        #     payload={
        #         "pageSize": 100
        #     },

        #     content_type="application/json",

        #     accept_type="application/json"
        # )

        print(f"STATUS: {response.status_code}")
        print(response.text)

        if response.status_code != 200:
            continue

        data = response.json()

        rules = data.get("budgetRules", [])

        print(f"TOTAL RULES: {len(rules)}")

        for rule in rules:

            AdsBudgetRule.objects.update_or_create(

                rule_id=rule.get("ruleId"),

                defaults={

                    "amazon_account": account,

                    "name": rule.get("name"),

                    "rule_type": rule.get("ruleType"),

                    "state": rule.get("state"),

                    "associated_campaigns_count":
                    rule.get(
                        "associatedCampaignsCount",
                        0
                    ),

                    "budget_rule_details":
                    rule.get(
                        "budgetRuleDetails",
                        {}
                    ),

                    "created_at_amazon":
                    rule.get("createdDate"),

                    "last_updated_at_amazon":
                    rule.get("lastUpdatedDate"),

                    "raw_data": rule
                }
            )

    print("Budget Rules Synced")

