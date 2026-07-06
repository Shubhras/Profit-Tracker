from django.core.management.base import BaseCommand

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.sync.adgroups_sync import sync_adgroups
from amazon_ads.services.sync.campaigns_sync import sync_campaigns
from amazon_ads.services.sync.keywords_sync import sync_keywords
from amazon_ads.services.sync.negative_keywords_sync import (
    sync_campaign_negative_keywords,
    sync_negative_keywords,
)
from amazon_ads.services.sync.negative_targets_sync import (
    sync_campaign_negative_targets,
    sync_negative_targets,
)
from amazon_ads.services.sync.portfolios_sync import sync_portfolios
from amazon_ads.services.sync.product_ads_sync import sync_productads
from amazon_ads.services.sync.targets_sync import sync_targets


class Command(BaseCommand):
    help = "Sync all Amazon Ads Sponsored Products entities"

    def handle(self, *args, **kwargs):

        accounts = AmazonAdsAccount.objects.filter(is_primary=True)

        for account in accounts:
            self.stdout.write("\n" + "=" * 80)
            self.stdout.write(
                self.style.SUCCESS(f"SYNCING ACCOUNT: {account.profile_id}")
            )
            self.stdout.write("=" * 80)

            self.stdout.write("\n" + "1. Portfolios")
            sync_portfolios(account)

            self.stdout.write("\n" + "2. Campaigns")
            sync_campaigns(account)

            self.stdout.write("\n" + "3. Ad Groups")
            sync_adgroups(account)

            self.stdout.write("\n" + "4. Product Ads")
            sync_productads(account)

            self.stdout.write("\n" + "5. Keywords")
            sync_keywords(account)

            self.stdout.write("\n" + "6. Targets")
            sync_targets(account)

            self.stdout.write("\n" + "7. Ad Group Negative Keywords")
            sync_negative_keywords(account)

            self.stdout.write("\n" + "8. Campaign Negative Keywords")
            sync_campaign_negative_keywords(account)

            self.stdout.write("\n" + "9. Ad Group Negative Targets")
            sync_negative_targets(account)

            self.stdout.write("\n" + "10. Campaign Negative Targets")
            sync_campaign_negative_targets(account)

        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS("AMAZON ADS SYNC COMPLETED"))
        self.stdout.write("=" * 80)
