from django.core.management.base import BaseCommand

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.sync.targets_sync import sync_targets


class Command(BaseCommand):
    help = "Sync Amazon Ads Targets"

    def handle(self, *args, **kwargs):

        total_saved = 0

        accounts = AmazonAdsAccount.objects.filter(is_primary=True)

        for account in accounts:
            total_saved += sync_targets(account)

        self.stdout.write(self.style.SUCCESS(f"TOTAL TARGETS SAVED: {total_saved}"))
