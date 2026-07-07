from django.core.management.base import BaseCommand

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.sync.negative_keywords_sync import (
    sync_campaign_negative_keywords,
    sync_negative_keywords,
)


class Command(BaseCommand):
    help = "Sync Amazon Ads Negative Keywords"

    def handle(self, *args, **kwargs):

        total_saved = 0

        accounts = AmazonAdsAccount.objects.filter(is_primary=True)

        for account in accounts:
            adgroup_saved = sync_negative_keywords(account)

            campaign_saved = sync_campaign_negative_keywords(account)

            total_saved += adgroup_saved + campaign_saved

        self.stdout.write(
            self.style.SUCCESS(f"TOTAL NEGATIVE KEYWORDS SAVED: {total_saved}")
        )
