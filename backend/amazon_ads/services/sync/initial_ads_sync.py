from amazon_ads.services.historical_ads_reports import (
    create_historical_ads_reports,
)
from amazon_ads.services.sync.adgroups_sync import (
    sync_adgroups,
)
from amazon_ads.services.sync.campaigns_sync import (
    sync_campaigns,
)
from amazon_ads.services.sync.keywords_sync import (
    sync_keywords,
)
from amazon_ads.services.sync.negative_keywords_sync import (
    sync_negative_keywords,
)
from amazon_ads.services.sync.negative_targets_sync import (
    sync_campaign_negative_targets,
)
from amazon_ads.services.sync.portfolios_sync import (
    sync_portfolios,
)
from amazon_ads.services.sync.product_ads_sync import (
    sync_productads,
)
from amazon_ads.services.sync.targets_sync import (
    sync_targets,
)


def run_initial_ads_sync(account, days):

    print("\n" + "=" * 80)
    print(f"STARTING INITIAL ADS SYNC: {account.profile_id}") 
    print("=" * 80)

    total_failed = 0

    # -------------------------------------------------
    # PORTFOLIOS
    # -------------------------------------------------

    try:
        sync_portfolios(account)

    except Exception as e:
        print(f"PORTFOLIO SYNC FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # CAMPAIGNS
    # -------------------------------------------------

    try:
        sync_campaigns(account)

    except Exception as e:
        print(f"CAMPAIGN SYNC FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # AD GROUPS
    # -------------------------------------------------

    try:
        sync_adgroups(account)

    except Exception as e:
        print(f"ADGROUP SYNC FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # PRODUCT ADS
    # -------------------------------------------------

    try:
        sync_productads(account)

    except Exception as e:
        print(f"PRODUCT ADS SYNC FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # KEYWORDS
    # -------------------------------------------------

    try:
        sync_keywords(account)

    except Exception as e:
        print(f"KEYWORD SYNC FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # TARGETS
    # -------------------------------------------------

    try:
        sync_targets(account)

    except Exception as e:
        print(f"TARGET SYNC FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # NEGATIVE KEYWORDS
    # -------------------------------------------------

    try:
        sync_negative_keywords(account)

    except Exception as e:
        print(f"NEGATIVE KEYWORD SYNC FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # CAMPAIGN NEGATIVE TARGETS
    # -------------------------------------------------

    try:
        sync_campaign_negative_targets(account)

    except Exception as e:
        print(f"CAMPAIGN NEGATIVE TARGET SYNC FAILED: {e}")

        total_failed += 1

    # -------------------------------------------------
    # HISTORICAL ADS REPORTS
    # -------------------------------------------------

    try:
        report_result = create_historical_ads_reports(
            account=account,
            days=days,
        )

        total_failed += report_result["total_failed"]

    except Exception as e:
        print(f"HISTORICAL ADS REPORT SYNC FAILED: {e}")

        total_failed += 1

     # -------------------------------------------------
     # FINAL STATUS
     # -------------------------------------------------
 
    if total_failed == 0:
        account.initial_sync_required = False
        account.initial_sync_completed = True

    else:
        account.initial_sync_required = True
        account.initial_sync_completed = False

    account.save(
        update_fields=[
            "initial_sync_required",
            "initial_sync_completed",
        ]
    )

    # -------------------------------------------------
    # FINAL SUMMARY
    # -------------------------------------------------

    print("\n" + "=" * 80)
    print(f"INITIAL ADS SYNC COMPLETED: {account.profile_id}")
    print("=" * 80)

    return {
        "total_failed": total_failed,
    }
