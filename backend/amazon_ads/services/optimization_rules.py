# =========================================================
# OPTIMIZATION RULES API SERVICE
# =========================================================

# FILE:
# amazon_ads/services/optimization_rules.py


import requests

from amazon_ads.models import (
    AmazonAdsAccount,AdsCampaign,
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

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Accept": "application/vnd.spoptimizationrules.v1+json",
            "Content-Type": "application/json",
        }

        url = (
            f"{cls.BASE_URLS[region]}"
            f"/sp/rules/optimization/search"
        )

        synced_rules = []

        # =====================================================
        # GET EXISTING CAMPAIGNS FROM DB
        # =====================================================

        campaigns = AdsCampaign.objects.filter(
            amazon_account=amazon_account
        )

        for campaign in campaigns:

            payload = {
                "optimizationRuleFilter": {
                    "campaignId": {
                        "values": [
                            str(campaign.campaign_id)
                        ],
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

            print("\n============================")
            print("SEARCH RULES")
            print("============================")
            print("CAMPAIGN:", campaign.campaign_id)

            response = requests.post(
                url,
                headers=headers,
                json=payload
            )

            print("STATUS:", response.status_code)
            print("BODY:", response.text)

            if response.status_code != 200:
                continue

            response_data = response.json()

            optimization_rules = response_data.get(
                "optimizationRules",
                []
            )

            for rule in optimization_rules:

                optimization_rule_id = rule.get(
                    "optimizationRuleId"
                )

                obj, created = (
                    AdsOptimizationRule.objects.update_or_create(
                        amazon_account=amazon_account,
                        optimization_rule_id=optimization_rule_id,
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
                            "raw_data": rule,
                        }
                    )
                )

                synced_rules.append({
                    "optimization_rule_id": optimization_rule_id,
                    "rule_name": rule.get("ruleName"),
                    "campaign_id": campaign.campaign_id,
                    "created": created
                })

        return {
            "total_synced": len(synced_rules),
            "rules": synced_rules
        }
    
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