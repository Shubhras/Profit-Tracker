# =========================================================
# OPTIMIZATION RULES API SERVICE
# =========================================================

# FILE:
# amazon_ads/services/optimization_rules.py


import requests

from amazon_ads.models import (
    AmazonAdsAccount,
    AdsOptimizationRule
)


class AmazonOptimizationRuleService:

    BASE_URLS = {
        "na": "https://advertising-api.amazon.com",
        "eu": "https://advertising-api-eu.amazon.com",
        "fe": "https://advertising-api-fe.amazon.com",
    }

    # ---------------------------------------------------------
    # COMMON HEADERS
    # ---------------------------------------------------------

    @classmethod
    def get_headers(
        cls,
        access_token,
        client_id,
        profile_id
    ):

        return {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    # =========================================================
    # SYNC OPTIMIZATION RULES
    # =========================================================

    @classmethod
    def sync_optimization_rules(
        cls,
        amazon_account,
        access_token,
        profile_id,
        client_id,
        region="eu"
    ):

        base_url = cls.BASE_URLS[region]

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            # "Accept": "application/vnd.spoptimizationrules.v1+json",
            "Content-Type": "application/json",
        }

        # =====================================================
        # STEP 1 : GET ALL CAMPAIGNS
        # =====================================================

        campaigns_url = (
            f"{base_url}/sp/campaigns/list"
        )

        campaign_payload = {
            "stateFilter": {
                "include": [
                    "ENABLED",
                    "PAUSED",
                    "ARCHIVED"
                ]
            },
            "maxResults": 1000
        }

        campaign_response = requests.post(
            campaigns_url,
            headers=headers,
            json=campaign_payload
        )

        print("\n============================")
        print("STEP 1 : CAMPAIGN RESPONSE")
        print("============================")
        print(campaign_response.status_code)
        print(campaign_response.text)

        campaign_response.raise_for_status()

        campaigns_data = campaign_response.json()

        campaigns = campaigns_data.get(
            "campaigns",
            []
        )

        all_rules = {}

        # =====================================================
        # STEP 2 : SEARCH RULES CAMPAIGN-WISE
        # =====================================================

        search_url = (
            f"{base_url}/sp/rules/optimization/search"
        )

        for campaign in campaigns:

            campaign_id = str(
                campaign.get("campaignId")
            )

            search_payload = {
                "optimizationRuleFilter": {
                    "campaignId": {
                        "values": [campaign_id],
                        "filterType": "EXACT_MATCH"
                    },
                    "ruleCategory": {
                        "values": ["BID"],
                        "filterType": "EXACT_MATCH"
                    },
                    "ruleSubCategory": {
                        "values": ["SCHEDULE"],
                        "filterType": "EXACT_MATCH"
                    }
                }
            }

            response = requests.post(
                search_url,
                headers=headers,
                json=search_payload
            )

            print("\n============================")
            print("SEARCH RULES")
            print("============================")
            print("CAMPAIGN:", campaign_id)
            print("STATUS:", response.status_code)
            print("BODY:", response.text)

            if response.status_code != 200:
                continue

            response_data = response.json()

            rules = response_data.get(
                "optimizationRules",
                []
            )

            for rule in rules:

                rule_id = rule.get(
                    "optimizationRuleId"
                )

                if not rule_id:
                    continue

                # -----------------------------------------
                # MERGE CAMPAIGN IDS
                # -----------------------------------------

                existing_campaign_ids = (
                    all_rules.get(rule_id, {})
                    .get("campaign_ids", [])
                )

                merged_campaign_ids = list(
                    set(existing_campaign_ids + [campaign_id])
                )

                rule["campaign_ids"] = merged_campaign_ids

                all_rules[rule_id] = rule

        # =====================================================
        # STEP 3 : SAVE TO DB
        # =====================================================

        synced_rules = []

        for rule_id, rule in all_rules.items():

            obj, created = (
                AdsOptimizationRule.objects.update_or_create(
                    amazon_account=amazon_account,
                    optimization_rule_id=rule_id,
                    defaults={
                        "profile_id": profile_id,
                        "rule_name": rule.get("ruleName"),
                        "rule_category": rule.get("ruleCategory"),
                        "rule_sub_category": rule.get(
                            "ruleSubCategory"
                        ),
                        "status": rule.get("status"),
                        "recurrence": rule.get(
                            "recurrence",
                            {}
                        ),
                        "conditions": rule.get(
                            "conditions",
                            {}
                        ),
                        "action": rule.get(
                            "action",
                            {}
                        ),
                        "raw_data": rule
                    }
                )
            )

            synced_rules.append({
                "optimization_rule_id": rule_id,
                "created": created
            })

        print("\n============================")
        print("FINAL SYNCED RULES")
        print("============================")
        print(synced_rules)

        return synced_rules

    # @classmethod
    # def sync_optimization_rules(
    #     cls,
    #     amazon_account,
    #     access_token,
    #     profile_id,
    #     client_id,
    #     region="eu"
    # ):

    #     print("\n============================")
    #     print("SYNC OPTIMIZATION RULES")
    #     print("============================")

    #     url = (
    #         f"{cls.BASE_URLS[region]}"
    #         f"/sp/rules/optimization/search"
    #     )

    #     headers = cls.get_headers(
    #         access_token,
    #         client_id,
    #         profile_id
    #     )

    #     payload = {
    #         "maxResults": 100
    #     }

    #     response = requests.post(
    #         url,
    #         headers=headers,
    #         json=payload
    #     )

    #     print("STATUS:", response.status_code)
    #     print("BODY:", response.text)

    #     response.raise_for_status()

    #     response_data = response.json()

    #     optimization_rules = response_data.get(
    #         "optimizationRules",
    #         []
    #     )

    #     synced_rule_ids = []

    #     # -----------------------------------------------------
    #     # SAVE RULES
    #     # -----------------------------------------------------

    #     for rule in optimization_rules:

    #         optimization_rule_id = rule.get(
    #             "optimizationRuleId"
    #         )

    #         synced_rule_ids.append(
    #             optimization_rule_id
    #         )

    #         campaign_ids = []

    #         # -------------------------------------------------
    #         # GET ASSOCIATED CAMPAIGNS
    #         # -------------------------------------------------

    #         search_assoc_url = (
    #             f"{cls.BASE_URLS[region]}"
    #             f"/sp/rules/optimization/search"
    #         )

    #         assoc_payload = {
    #             "optimizationRuleFilter": {
    #                 "optimizationRuleId": {
    #                     "values": [
    #                         optimization_rule_id
    #                     ],
    #                     "filterType": "EXACT_MATCH"
    #                 }
    #             }
    #         }

    #         assoc_response = requests.post(
    #             search_assoc_url,
    #             headers=headers,
    #             json=assoc_payload
    #         )

    #         if assoc_response.status_code == 200:

    #             assoc_data = assoc_response.json()

    #             assoc_rules = assoc_data.get(
    #                 "optimizationRules",
    #                 []
    #             )

    #             if assoc_rules:

    #                 campaign_ids = assoc_rules[0].get(
    #                     "campaignIds",
    #                     []
    #                 )

    #         # -------------------------------------------------
    #         # SAVE DB
    #         # -------------------------------------------------

    #         AdsOptimizationRule.objects.update_or_create(
    #             amazon_account=amazon_account,
    #             optimization_rule_id=optimization_rule_id,
    #             defaults={
    #                 "rule_name": rule.get("ruleName"),
    #                 "rule_category": rule.get("ruleCategory"),
    #                 "rule_sub_category": rule.get(
    #                     "ruleSubCategory"
    #                 ),
    #                 "status": rule.get("status"),
    #                 "campaign_ids": campaign_ids,
    #                 "raw_data": rule,
    #             }
    #         )

    #     # -----------------------------------------------------
    #     # REMOVE DELETED RULES
    #     # -----------------------------------------------------

    #     AdsOptimizationRule.objects.filter(
    #         amazon_account=amazon_account
    #     ).exclude(
    #         optimization_rule_id__in=synced_rule_ids
    #     ).delete()

    #     print("\n============================")
    #     print("SYNC COMPLETED")
    #     print("============================")
    #     print(synced_rule_ids)

    #     return {
    #         "total_synced": len(synced_rule_ids),
    #         "rules": synced_rule_ids
    #     }


    # =========================================================
    # GET RULE LIST
    # =========================================================

    @classmethod
    def get_optimization_rules_list(
        cls,
        amazon_account,
        page=1,
        page_size=20,
        search=None
    ):

        queryset = AdsOptimizationRule.objects.filter(
            amazon_account=amazon_account
        ).order_by("-id")

        if search:

            queryset = queryset.filter(
                rule_name__icontains=search
            )

        total = queryset.count()

        start = (page - 1) * page_size
        end = start + page_size

        queryset = queryset[start:end]

        data = []

        for item in queryset:

            data.append({
                "id": item.id,
                "optimization_rule_id": item.optimization_rule_id,
                "rule_name": item.rule_name,
                "rule_category": item.rule_category,
                "rule_sub_category": item.rule_sub_category,
                "status": item.status,
                "campaign_ids": item.campaign_ids,
                "raw_data": item.raw_data,
                "created_at": item.created_at,
                "updated_at": item.updated_at,
            })

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "results": data
        }

    # =========================================================
    # CREATE OPTIMIZATION RULE
    # =========================================================

    @classmethod
    def create_optimization_rule(
        cls,
        amazon_account,
        access_token,
        profile_id,
        client_id,
        payload,
        region="eu"
    ):

        print("\n============================")
        print("CREATE OPTIMIZATION RULE")
        print("============================")
        print(payload)

        url = (
            f"{cls.BASE_URLS[region]}"
            f"/sp/rules/optimization"
        )

        headers = cls.get_headers(
            access_token,
            client_id,
            profile_id
        )

        response = requests.post(
            url,
            headers=headers,
            json=payload
        )

        print("STATUS:", response.status_code)
        print("BODY:", response.text)

        response.raise_for_status()

        response_data = response.json()

        responses = response_data.get(
            "responses",
            []
        )

        for item in responses:

            rule = item.get(
                "optimizationRule",
                {}
            )

            optimization_rule_id = rule.get(
                "optimizationRuleId"
            )

            AdsOptimizationRule.objects.update_or_create(
                amazon_account=amazon_account,
                optimization_rule_id=optimization_rule_id,
                defaults={
                    "rule_name": rule.get("ruleName"),
                    "rule_category": rule.get("ruleCategory"),
                    "rule_sub_category": rule.get("ruleSubCategory"),
                    "status": rule.get("status"),
                    "raw_data": rule,
                }
            )

        return response_data

    # =========================================================
    # UPDATE OPTIMIZATION RULE
    # =========================================================

    @classmethod
    def update_optimization_rule(
        cls,
        amazon_account,
        access_token,
        profile_id,
        client_id,
        payload,
        region="eu"
    ):

        print("\n============================")
        print("UPDATE OPTIMIZATION RULE")
        print("============================")
        print(payload)

        url = (
            f"{cls.BASE_URLS[region]}"
            f"/sp/rules/optimization"
        )

        headers = cls.get_headers(
            access_token,
            client_id,
            profile_id
        )

        response = requests.put(
            url,
            headers=headers,
            json=payload
        )

        print("STATUS:", response.status_code)
        print("BODY:", response.text)

        response.raise_for_status()

        response_data = response.json()

        responses = response_data.get(
            "responses",
            []
        )

        for item in responses:

            rule = item.get(
                "optimizationRule",
                {}
            )

            optimization_rule_id = rule.get(
                "optimizationRuleId"
            )

            AdsOptimizationRule.objects.filter(
                amazon_account=amazon_account,
                optimization_rule_id=optimization_rule_id
            ).update(
                rule_name=rule.get("ruleName"),
                rule_category=rule.get("ruleCategory"),
                rule_sub_category=rule.get("ruleSubCategory"),
                status=rule.get("status"),
                raw_data=rule,
            )

        return response_data

    # =========================================================
    # DELETE OPTIMIZATION RULE
    # =========================================================

    @classmethod
    def delete_optimization_rule(
        cls,
        amazon_account,
        access_token,
        profile_id,
        client_id,
        optimization_rule_id,
        region="eu"
    ):

        print("\n============================")
        print("DELETE OPTIMIZATION RULE")
        print("============================")
        print(optimization_rule_id)

        url = (
            f"{cls.BASE_URLS[region]}"
            f"/sp/rules/optimization/"
            f"{optimization_rule_id}"
        )

        headers = cls.get_headers(
            access_token,
            client_id,
            profile_id
        )

        response = requests.delete(
            url,
            headers=headers
        )

        print("STATUS:", response.status_code)
        print("BODY:", response.text)

        response.raise_for_status()

        AdsOptimizationRule.objects.filter(
            amazon_account=amazon_account,
            optimization_rule_id=optimization_rule_id
        ).delete()

        return response.json()

    # =========================================================
    # SEARCH OPTIMIZATION RULES
    # =========================================================

    @classmethod
    def search_optimization_rules(
        cls,
        access_token,
        profile_id,
        client_id,
        payload,
        region="eu"
    ):

        print("\n============================")
        print("SEARCH OPTIMIZATION RULES")
        print("============================")
        print(payload)

        url = (
            f"{cls.BASE_URLS[region]}"
            f"/sp/rules/optimization/search"
        )

        headers = cls.get_headers(
            access_token,
            client_id,
            profile_id
        )

        response = requests.post(
            url,
            headers=headers,
            json=payload
        )

        print("STATUS:", response.status_code)
        print("BODY:", response.text)

        response.raise_for_status()

        return response.json()

    # =========================================================
    # ASSOCIATE RULE TO CAMPAIGN
    # =========================================================

    @classmethod
    def associate_optimization_rule(
        cls,
        access_token,
        profile_id,
        client_id,
        campaign_id,
        optimization_rule_ids,
        region="eu"
    ):

        print("\n============================")
        print("ASSOCIATE OPTIMIZATION RULE")
        print("============================")

        url = (
            f"{cls.BASE_URLS[region]}"
            f"/sp/campaigns/{campaign_id}"
            f"/optimizationRules"
        )

        payload = {
            "optimizationRuleIds": optimization_rule_ids
        }

        headers = cls.get_headers(
            access_token,
            client_id,
            profile_id
        )

        headers["Accept"] = (
            "application/vnd.spoptimizationrules.v1+json"
        )

        response = requests.post(
            url,
            headers=headers,
            json=payload
        )

        print("STATUS:", response.status_code)
        print("BODY:", response.text)

        response.raise_for_status()

        return response.json()