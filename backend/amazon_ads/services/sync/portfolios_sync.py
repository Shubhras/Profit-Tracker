from django.db import transaction

from amazon_ads.models import (
    AdsPortfolio,
)
from amazon_ads.utils import ads_api_request


def sync_portfolios(account):

    print("\n" + "=" * 80)
    print(f"SYNCING PORTFOLIOS: {account.profile_id}")

    total_saved = 0
    
    existing_portfolios = {
        str(obj.portfolio_id): obj
        for obj in AdsPortfolio.objects.filter(amazon_account=account)
    }

    create_objects = []
    update_objects = []

    next_token = None

    while True:
        payload = {
            "maxResults": 1000,
        }

        if next_token:
            payload["nextToken"] = next_token

        response = ads_api_request(
            account=account,
            method="POST",
            endpoint="/portfolios/list",
            payload=payload,
        )

        print(f"API STATUS: {response.status_code}")

        if response.status_code != 200:
            print("PORTFOLIO SYNC ERROR")
            print(response.text)

            break

        data = response.json()

        portfolios = data.get("portfolios", [])

        print(f"PORTFOLIOS RECEIVED: {len(portfolios)}")

        for item in portfolios:
            try:
                portfolio_id = str(item.get("portfolioId"))

                budget = item.get("budget", {})

                if portfolio_id in existing_portfolios:
                    obj = existing_portfolios[portfolio_id]

                    obj.name = item.get("name")
                    obj.state = item.get("state")
                    obj.in_budget = item.get("inBudget")
                    obj.currency_code = budget.get("currencyCode")
                    obj.budget_policy = budget.get("policy")
                    obj.raw_data = item

                    update_objects.append(obj)

                else:
                    obj = AdsPortfolio(
                        amazon_account=account,
                        portfolio_id=portfolio_id,
                        name=item.get("name"),
                        state=item.get("state"),
                        in_budget=item.get("inBudget"),
                        currency_code=budget.get("currencyCode"),
                        budget_policy=budget.get("policy"),
                        raw_data=item,
                    )

                    create_objects.append(obj)

                    existing_portfolios[portfolio_id] = obj

                total_saved += 1

            except Exception as e:
                print(f"FAILED PORTFOLIO {item.get('portfolioId')}: {e}")

                continue

        next_token = data.get("nextToken")

        if not next_token:
            break

    # -------------------------------------------------
    # BULK CREATE
    # -------------------------------------------------

    if create_objects:
        with transaction.atomic():
            AdsPortfolio.objects.bulk_create(
                create_objects,
                batch_size=500,
                ignore_conflicts=True,
            )

        print(f"PORTFOLIOS CREATED: {len(create_objects)}")

    # -------------------------------------------------
    # BULK UPDATE
    # -------------------------------------------------

    if update_objects:
        with transaction.atomic():
            AdsPortfolio.objects.bulk_update(
                update_objects,
                [
                    "name",
                    "state",
                    "in_budget",
                    "currency_code",
                    "budget_policy",
                    "raw_data",
                ],
                batch_size=500,
            )

        print(f"PORTFOLIOS UPDATED: {len(update_objects)}")

    print("\n" + "=" * 80)
    print(f"TOTAL PORTFOLIOS SAVED: {total_saved}")
    print("=" * 80)

    return total_saved
