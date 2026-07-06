from django.core.management.base import BaseCommand

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.sync.campaigns_sync import sync_campaigns


class Command(BaseCommand):
    help = "Sync Amazon Ads Campaigns"

    def handle(self, *args, **kwargs):

        total_saved = 0

        accounts = AmazonAdsAccount.objects.filter(is_primary=True)

        for account in accounts:
            total_saved += sync_campaigns(account)

        self.stdout.write(self.style.SUCCESS("\n" + "=" * 80))

        self.stdout.write(self.style.SUCCESS(f"TOTAL CAMPAIGNS SAVED: {total_saved}"))

        self.stdout.write(self.style.SUCCESS("=" * 80))
