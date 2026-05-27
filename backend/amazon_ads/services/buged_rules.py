import requests
from amazon_ads.models import AdsBudgetRule

class AmazonBudgetRuleService:

    BASE_URLS = {
        "eu": "https://advertising-api-eu.amazon.com",
        "na": "https://advertising-api.amazon.com",
        "fe": "https://advertising-api-fe.amazon.com",
    }

    ENDPOINTS = {
        "sp": "/sp/budgetRules",
        "sd": "/sd/budgetRules",
        "sb": "/sb/budgetRules",
    }



    @classmethod
    def sync_budget_rules(
        cls,
        amazon_account,
        access_token,
        profile_id,
        client_id,
        region="eu",
        ad_type="sp"
    ):

        base_url = cls.BASE_URLS.get(region)

        # -----------------------------------------
        # GET ALL CAMPAIGNS
        # -----------------------------------------

        campaign_url = f"{base_url}/sp/campaigns/list"

        campaign_headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),

            # IMPORTANT
            "Content-Type": "application/vnd.spCampaign.v3+json",
            "Accept": "application/vnd.spCampaign.v3+json",
        }

        all_campaigns = []
        next_token = None

        while True:

            campaign_payload = {
                "maxResults": 30
            }

            if next_token:
                campaign_payload["nextToken"] = next_token

            campaign_response = requests.post(
                campaign_url,
                headers=campaign_headers,
                json=campaign_payload
            )

            print("CAMPAIGN STATUS:", campaign_response.status_code)
            print("CAMPAIGN RESPONSE:", campaign_response.text)

            if campaign_response.status_code != 200:
                break

            campaign_data = campaign_response.json()

            campaigns = campaign_data.get("campaigns", [])

            all_campaigns.extend(campaigns)

            next_token = campaign_data.get("nextToken")

            if not next_token:
                break

        print("TOTAL CAMPAIGNS MAPPED:", len(all_campaigns))

        # -----------------------------------------
        # GET RULES
        # -----------------------------------------

        rules_url = f"{base_url}/sp/budgetRules"

        rule_headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Accept": "application/json",
        }

        next_token = None
        total_synced = 0

        while True:

            params = {
                "pageSize": 30,

                # IMPORTANT
                # sync all rule states
                "ruleStateFilter": [
                    "ACTIVE",
                    "PAUSED"
                ],

                # optional
                "ruleStatusFilter": [
                    "ACTIVE",
                    "PENDING_START",
                    "PAUSED",
                    "EXPIRED"
                ]
            }

            if next_token:
                params["nextToken"] = next_token

            response = requests.get(
                rules_url,
                headers=rule_headers,
                params=params
            )

            print("RULE STATUS:", response.status_code)
            print("RULE RESPONSE:", response.text)

            response.raise_for_status()

            data = response.json()

            rules = data.get(
                "budgetRulesForAdvertiserResponse",
                []
            )

            # -----------------------------------------
            # PROCESS RULES
            # -----------------------------------------

            for item in rules:

                rule_id = item.get("ruleId")

                associated_campaign_ids = []

                # -----------------------------------------
                # ASSOCIATION API
                # -----------------------------------------

                assoc_url = (
                    f"{base_url}/sp/budgetRules/"
                    f"{rule_id}/campaigns"
                )

                assoc_params = {
                    "pageSize": 30
                }

                assoc_response = requests.get(
                    assoc_url,
                    headers=rule_headers,
                    params=assoc_params
                )

                print(
                    f"ASSOC STATUS FOR {rule_id}:",
                    assoc_response.status_code
                )

                print(
                    "ASSOC RESPONSE:",
                    assoc_response.text
                )

                if assoc_response.status_code == 200:

                    assoc_data = assoc_response.json()

                    campaign_items = assoc_data.get(
                        "associatedCampaigns",
                        []
                    )

                    associated_campaign_ids = [
                        str(c.get("campaignId"))
                        for c in campaign_items
                    ]

                else:

                    print(
                        f"FAILED ASSOCIATION API FOR {rule_id}"
                    )

                # -----------------------------------------
                # FALLBACK MATCHING
                # -----------------------------------------

                if not associated_campaign_ids:

                    rule_name = (
                        item.get("ruleDetails", {})
                        .get("name", "")
                        .lower()
                    )

                    for campaign in all_campaigns:

                        campaign_name = (
                            campaign.get("name", "")
                            .lower()
                        )

                        if (
                            any(
                                word in campaign_name
                                for word in rule_name.split()
                                if len(word) > 3
                            )
                        ):
                            associated_campaign_ids.append(
                                str(campaign.get("campaignId"))
                            )

                associated_campaign_ids = list(
                    set(associated_campaign_ids)
                )

                # -----------------------------------------
                # SAVE RULE
                # -----------------------------------------

                AdsBudgetRule.objects.update_or_create(
                    amazon_account=amazon_account,
                    budget_rule_id=rule_id,
                    rule_type=ad_type,
                    defaults={
                        "profile_id": profile_id,
                        "name": item.get(
                            "ruleDetails",
                            {}
                        ).get("name"),

                        "rule_state": item.get(
                            "ruleState"
                        ),

                        "rule_status": item.get(
                            "ruleStatus"
                        ),

                        "created_date": item.get(
                            "createdDate"
                        ),

                        "last_updated_date": item.get(
                            "lastUpdatedDate"
                        ),

                        "rule_details": item.get(
                            "ruleDetails",
                            {}
                        ),

                        "raw_data": item,

                        "campaign_ids": associated_campaign_ids
                    }
                )

                total_synced += 1

            next_token = data.get("nextToken")

            if not next_token:
                break

        return {
            "success": True,
            "total_synced": total_synced,
            "total_campaigns": len(all_campaigns),
            "ad_type": ad_type
        }
    

    # @classmethod
    # def sync_budget_rules(
    #     cls,
    #     amazon_account,
    #     access_token,
    #     profile_id,
    #     client_id,
    #     region="eu",
    #     ad_type="sp"
    # ):

    #     base_url = cls.BASE_URLS.get(region)

    #     # -----------------------------------------
    #     # GET ALL CAMPAIGNS
    #     # -----------------------------------------

    #     campaign_url = f"{base_url}/sp/campaigns/list"

    #     campaign_headers = {
    #         "Authorization": f"Bearer {access_token}",
    #         "Amazon-Advertising-API-ClientId": client_id,
    #         "Amazon-Advertising-API-Scope": str(profile_id),

    #         # IMPORTANT
    #         "Content-Type": "application/vnd.spCampaign.v3+json",
    #         "Accept": "application/vnd.spCampaign.v3+json",
    #     }

    #     all_campaigns = []
    #     next_token = None

    #     while True:

    #         campaign_payload = {
    #             "maxResults": 30
    #         }

    #         if next_token:
    #             campaign_payload["nextToken"] = next_token

    #         campaign_response = requests.post(
    #             campaign_url,
    #             headers=campaign_headers,
    #             json=campaign_payload
    #         )

    #         print("CAMPAIGN STATUS:", campaign_response.status_code)
    #         print("CAMPAIGN RESPONSE:", campaign_response.text)

    #         if campaign_response.status_code != 200:
    #             break

    #         campaign_data = campaign_response.json()

    #         campaigns = campaign_data.get("campaigns", [])

    #         all_campaigns.extend(campaigns)

    #         next_token = campaign_data.get("nextToken")

    #         if not next_token:
    #             break

    #     print("TOTAL CAMPAIGNS MAPPED:", len(all_campaigns))

    #     # -----------------------------------------
    #     # GET RULES
    #     # -----------------------------------------

    #     rules_url = f"{base_url}/sp/budgetRules"

    #     rule_headers = {
    #         "Authorization": f"Bearer {access_token}",
    #         "Amazon-Advertising-API-ClientId": client_id,
    #         "Amazon-Advertising-API-Scope": str(profile_id),
    #         "Accept": "application/json",
    #     }

    #     next_token = None
    #     total_synced = 0

    #     while True:

    #         params = {
    #             "pageSize": 30,

    #             # IMPORTANT
    #             # sync all rule states
    #             "ruleStateFilter": [
    #                 "ACTIVE",
    #                 "PAUSED"
    #             ],

    #             # optional
    #             "ruleStatusFilter": [
    #                 "ACTIVE",
    #                 "PENDING_START",
    #                 "PAUSED",
    #                 "EXPIRED"
    #             ]
    #         }

    #         if next_token:
    #             params["nextToken"] = next_token

    #         response = requests.get(
    #             rules_url,
    #             headers=rule_headers,
    #             params=params
    #         )

    #         print("RULE STATUS:", response.status_code)
    #         print("RULE RESPONSE:", response.text)

    #         response.raise_for_status()

    #         data = response.json()

    #         rules = data.get(
    #             "budgetRulesForAdvertiserResponse",
    #             []
    #         )

    #         # -----------------------------------------
    #         # PROCESS RULES
    #         # -----------------------------------------

    #         for item in rules:

    #             rule_id = item.get("ruleId")

    #             associated_campaign_ids = []

    #             # -----------------------------------------
    #             # ASSOCIATION API
    #             # -----------------------------------------

    #             # assoc_url = (
    #             #     f"{base_url}/sp/budgetRules/"
    #             #     f"{rule_id}/campaigns"
    #             # )
    #             # -----------------------------------------
    #             # GET ASSOCIATED CAMPAIGNS
    #             # -----------------------------------------

    #             assoc_url = (
    #                 f"{base_url}/sp/budgetRules/"
    #                 f"{rule_id}/campaigns"
    #             )

    #             assoc_params = {
    #                 "pageSize": 30
    #             }

    #             assoc_response = requests.get(
    #                 assoc_url,
    #                 headers=rule_headers,
    #                 params=assoc_params
    #             )

    #             print(
    #                 f"ASSOC STATUS FOR {rule_id}:",
    #                 assoc_response.status_code
    #             )

    #             print(
    #                 "ASSOC RESPONSE:",
    #                 assoc_response.text
    #             )

    #             if assoc_response.status_code == 200:

    #                 assoc_data = assoc_response.json()

    #                 campaign_items = assoc_data.get(
    #                     "associatedCampaigns",
    #                     []
    #                 )

    #                 associated_campaign_ids = [
    #                     str(c.get("campaignId"))
    #                     for c in campaign_items
    #                 ]

    #             # -----------------------------------------
    #             # FALLBACK MATCHING
    #             # -----------------------------------------

    #             # if not associated_campaign_ids:

    #             #     rule_name = (
    #             #         item.get("ruleDetails", {})
    #             #         .get("name", "")
    #             #         .lower()
    #             #     )

    #             #     for campaign in all_campaigns:

    #             #         campaign_name = (
    #             #             campaign.get("name", "")
    #             #             .lower()
    #             #         )

    #             #         if (
    #             #             any(
    #             #                 word in campaign_name
    #             #                 for word in rule_name.split()
    #             #                 if len(word) > 3
    #             #             )
    #             #         ):
    #             #             associated_campaign_ids.append(
    #             #                 str(campaign.get("campaignId"))
    #             #             )

    #             # associated_campaign_ids = list(
    #             #     set(associated_campaign_ids)
    #             # )

    #             # -----------------------------------------
    #             # SAVE RULE
    #             # -----------------------------------------

    #             AdsBudgetRule.objects.update_or_create(
    #                 amazon_account=amazon_account,
    #                 budget_rule_id=rule_id,
    #                 rule_type=ad_type,
    #                 defaults={
    #                     "profile_id": profile_id,
    #                     "name": item.get(
    #                         "ruleDetails",
    #                         {}
    #                     ).get("name"),

    #                     "rule_state": item.get(
    #                         "ruleState"
    #                     ),

    #                     "rule_status": item.get(
    #                         "ruleStatus"
    #                     ),

    #                     "created_date": item.get(
    #                         "createdDate"
    #                     ),

    #                     "last_updated_date": item.get(
    #                         "lastUpdatedDate"
    #                     ),

    #                     "rule_details": item.get(
    #                         "ruleDetails",
    #                         {}
    #                     ),

    #                     "raw_data": item,

    #                     "campaign_ids": associated_campaign_ids
    #                 }
    #             )

    #             total_synced += 1

    #         next_token = data.get("nextToken")

    #         if not next_token:
    #             break

    #     return {
    #         "success": True,
    #         "total_synced": total_synced,
    #         "total_campaigns": len(all_campaigns),
    #         "ad_type": ad_type
    #     }
    
    # main working
    # create new rules 
    # @classmethod
    # def create_budget_rule(
    #     cls,
    #     amazon_account,
    #     access_token,
    #     profile_id,
    #     client_id,
    #     payload,
    #     region="eu",
    #     ad_type="sp"
    # ):

    #     url = (
    #         cls.BASE_URLS[region]
    #         + cls.ENDPOINTS[ad_type]
    #     )

    #     headers = {
    #         "Authorization": f"Bearer {access_token}",
    #         "Amazon-Advertising-API-ClientId": client_id,
    #         "Amazon-Advertising-API-Scope": str(profile_id),
    #         "Content-Type": "application/json",
    #         "Accept": "application/json",
    #     }
        
    #     campaign_ids = payload.pop("campaign_ids", [])
    #     response = requests.post(
    #         url,
    #         headers=headers,
    #         json=payload
    #     )

    #     print(response.status_code)
    #     print(response.text)



    #     response.raise_for_status()

    #     response_data = response.json()

    #     created_rules = response_data.get(
    #         "budgetRulesDetails",
    #         []
    #     )

    #     synced_rules = []

    #     for item in created_rules:

    #         rule_id = item.get("ruleId")

    #         obj, _ = AdsBudgetRule.objects.update_or_create(
    #             amazon_account=amazon_account,
    #             budget_rule_id=rule_id,
    #             rule_type=ad_type,
    #             defaults={
    #                 "profile_id": profile_id,
    #                 "name": item.get("name"),
    #                 "rule_state": item.get("ruleState"),
    #                 "rule_status": item.get("ruleStatus"),
    #                 "rule_details": item,
    #                 "raw_data": item,
    #                 "campaign_ids": campaign_ids,
                    
    #             }
    #         )

    #         synced_rules.append(obj.id)

    #     for item in created_rules:

    #         rule_id = item.get("ruleId")

    #         # -----------------------------------
    #         # ASSOCIATE CAMPAIGNS
    #         # -----------------------------------

    #         if campaign_ids:

    #             assoc_url = (
    #                 f"{cls.BASE_URLS[region]}"
    #                 f"/sp/budgetRules/{rule_id}/campaigns"
    #             )

    #             assoc_payload = {
    #                 "campaignIds": campaign_ids
    #             }

    #             assoc_headers = {
    #                 "Authorization": f"Bearer {access_token}",
    #                 "Amazon-Advertising-API-ClientId": client_id,
    #                 "Amazon-Advertising-API-Scope": str(profile_id),
    #                 "Content-Type": "application/json",
    #                 "Accept": "application/json",
    #             }

    #             assoc_response = requests.post(
    #                 assoc_url,
    #                 headers=assoc_headers,
    #                 json=assoc_payload
    #             )

    #             print("ASSOC STATUS:", assoc_response.status_code)
    #             print("ASSOC RESPONSE:", assoc_response.text)

    #             # optional
    #             assoc_response.raise_for_status()    

    #     return response_data
    
    @classmethod
    def create_budget_rule(
        cls,
        amazon_account,
        access_token,
        profile_id,
        client_id,
        payload,
        region="eu",
        ad_type="sp"
    ):

        print("\n============================")
        print("STEP 1 : ORIGINAL PAYLOAD")
        print("============================")
        print(payload)

        url = (
            cls.BASE_URLS[region]
            + cls.ENDPOINTS[ad_type]
        )

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        # -----------------------------------
        # EXTRACT CAMPAIGN IDS
        # -----------------------------------

        budget_rules = payload.get(
            "budgetRulesDetails",
            []
        )

        campaign_ids = []

        for rule in budget_rules:

            campaign_ids = rule.pop(
                "campaign_ids",
                []
            )

        print("\n============================")
        print("STEP 2 : PAYLOAD AFTER POP")
        print("============================")
        print(payload)

        print("\n============================")
        print("STEP 3 : EXTRACTED CAMPAIGN IDS")
        print("============================")
        print(campaign_ids)

        # -----------------------------------
        # CREATE RULE
        # -----------------------------------

        print("\n============================")
        print("STEP 4 : AMAZON CREATE API")
        print("============================")
        print("URL:", url)
        print("HEADERS:", headers)
        print("BODY:", payload)

        response = requests.post(
            url,
            headers=headers,
            json=payload
        )

        print("\n============================")
        print("STEP 5 : CREATE RESPONSE")
        print("============================")
        print("STATUS:", response.status_code)
        print("BODY:", response.text)

        response.raise_for_status()

        response_data = response.json()

        print("\n============================")
        print("STEP 6 : PARSED RESPONSE")
        print("============================")
        print(response_data)

        # IMPORTANT
        # Amazon returns "responses"
        # not "budgetRulesDetails"

        created_rules = response_data.get(
            "responses",
            []
        )

        print("\n============================")
        print("STEP 7 : CREATED RULES")
        print("============================")
        print(created_rules)

        synced_rules = []

        for item in created_rules:

            rule_id = item.get("ruleId")

            obj, _ = AdsBudgetRule.objects.update_or_create(
                amazon_account=amazon_account,
                budget_rule_id=rule_id,
                rule_type=ad_type,
                defaults={
                    "profile_id": profile_id,
                    "name": item.get("name"),
                    "rule_state": item.get("ruleState"),
                    "rule_status": item.get("ruleStatus"),
                    "rule_details": item,
                    "raw_data": item,
                    "campaign_ids": campaign_ids,
                }
            )

            synced_rules.append(obj.id)

            
            # -----------------------------------
            # ASSOCIATE CAMPAIGNS
            # -----------------------------------

            if campaign_ids:

                assoc_url = (
                    f"{cls.BASE_URLS[region]}"
                    f"/sp/budgetRulesAssociation"
                )

                assoc_payload = {
                    "budgetRulesAssociations": []
                }

                for campaign_id in campaign_ids:

                    assoc_payload["budgetRulesAssociations"].append({
                        "campaignId": int(campaign_id),
                        "ruleId": rule_id
                    })

                print("\n============================")
                print("STEP 10 : ASSOCIATE API")
                print("============================")
                print("URL:", assoc_url)
                print("BODY:", assoc_payload)

                assoc_response = requests.post(
                    assoc_url,
                    headers=headers,
                    json=assoc_payload
                )

                print("\n============================")
                print("STEP 11 : ASSOC RESPONSE")
                print("============================")
                print("STATUS:", assoc_response.status_code)
                print("BODY:", assoc_response.text)

                assoc_response.raise_for_status()

        print("\n============================")
        print("STEP 12 : FINAL RETURN")
        print("============================")

        return {
            "amazon_response": response_data,
            "synced_rules": synced_rules
        }


    @classmethod
    def update_budget_rule(
        cls,
        amazon_account,
        access_token,
        profile_id,
        client_id,
        payload,
        region="eu",
        ad_type="sp"
    ):

        url = (
            cls.BASE_URLS[region]
            + cls.ENDPOINTS[ad_type]
        )

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        response = requests.put(
            url,
            headers=headers,
            json=payload
        )

        print(response.status_code)
        print(response.text)

        response.raise_for_status()

        response_data = response.json()

        rules = payload.get("budgetRulesDetails", [])

        for item in rules:

            rule_id = item.get("ruleId")

            AdsBudgetRule.objects.filter(
                amazon_account=amazon_account,
                budget_rule_id=rule_id,
                rule_type=ad_type
            ).update(
                rule_state=item.get("ruleState"),
                rule_status=item.get("ruleStatus"),
                rule_details=item,
                raw_data=item
            )

        return response_data

    
    @classmethod
    def delete_budget_rule(
        cls,
        amazon_account,
        access_token,
        profile_id,
        client_id,
        budget_rule_id,
        campaign_id,
        region="eu",
        ad_type="sp"
    ):

        base_url = cls.BASE_URLS.get(region)

        url = (
            f"{base_url}/"
            f"{ad_type}/campaigns/"
            f"{campaign_id}/budgetRules/"
            f"{budget_rule_id}"
        )

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Amazon-Advertising-API-ClientId": client_id,
            "Amazon-Advertising-API-Scope": str(profile_id),
            "Accept": "application/json",
        }

        response = requests.delete(
            url,
            headers=headers
        )

        print("STATUS:", response.status_code)
        print("BODY:", response.text)

        response.raise_for_status()

        # remove locally
        # AdsBudgetRule.objects.filter(
        #     amazon_account=amazon_account,
        #     budget_rule_id=budget_rule_id,
        #     rule_type=ad_type
        # ).delete()

        rule_obj = AdsBudgetRule.objects.filter(
            amazon_account=amazon_account,
            budget_rule_id=budget_rule_id,
            rule_type=ad_type
        ).first()

        if rule_obj:

            updated_campaign_ids = [
                str(i)
                for i in (rule_obj.campaign_ids or [])
                if str(i) != str(campaign_id)
            ]

            rule_obj.campaign_ids = updated_campaign_ids

            # delete only if no campaigns left
            if not updated_campaign_ids:
                rule_obj.delete()
            else:
                rule_obj.save()

        return {
            "success": True,
            "status_code": response.status_code,
            "message": "Budget rule association removed",
            "response": response.json() if response.text.strip() else {}
        }

    # @classmethod
    # def delete_budget_rule(
    #     cls,
    #     amazon_account,
    #     access_token,
    #     profile_id,
    #     client_id,
    #     budget_rule_id,
    #     region="eu",
    #     ad_type="sp"
    # ):

    #     url = (
    #         cls.BASE_URLS[region]
    #         + cls.ENDPOINTS[ad_type]
    #         + f"/{budget_rule_id}"
    #     )

    #     # headers = {
    #     #     "Authorization": f"Bearer {access_token}",
    #     #     "Amazon-Advertising-API-ClientId": client_id,
    #     #     "Amazon-Advertising-API-Scope": str(profile_id),
    #     #     "Accept": "application/json",
    #     # }

    #     headers = {
    #     "Authorization": f"Bearer {access_token}",
    #     "Amazon-Advertising-API-ClientId": client_id,
    #     "Amazon-Advertising-API-Scope": str(profile_id),
    #     "Content-Type": "application/json",
    #     "Accept": "application/json",
    #   }

    #     response = requests.delete(
    #         url,
    #         headers=headers,
    #         json={}
    #     )

    #     print(response.status_code)
    #     print(response.text)

    #     # response.raise_for_status()
    #     print("STATUS:", response.status_code)
    #     print("HEADERS:", response.headers)
    #     print("BODY:", response.text)

    #     AdsBudgetRule.objects.filter(
    #         amazon_account=amazon_account,
    #         budget_rule_id=budget_rule_id,
    #         rule_type=ad_type
    #     ).delete()

    #     # return {
    #     #     "success": True
    #     # }
    
    #     return {
    #         "success": True,
    #         "status_code": response.status_code,
    #         "response": response.text
    #     } 
    

