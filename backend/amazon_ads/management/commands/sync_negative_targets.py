from django.core.management.base import BaseCommand

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.sync.negative_targets_sync import (
    sync_campaign_negative_targets,
    sync_negative_targets,
)


class Command(BaseCommand):
    help = "Sync Amazon Ads Negative Keywords"

    def handle(self, *args, **kwargs):

        total_saved = 0

        accounts = AmazonAdsAccount.objects.filter(is_primary=True)

        for account in accounts:
            adgroup_saved = sync_negative_targets(account)

            campaign_saved = sync_campaign_negative_targets(account)

            total_saved += adgroup_saved + campaign_saved

        self.stdout.write(
            self.style.SUCCESS(f"TOTAL NEGATIVE TARGETS SAVED: {total_saved}")
        )
