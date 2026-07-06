from django.core.management.base import BaseCommand

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.sync.portfolios_sync import sync_portfolios


class Command(BaseCommand):
    help = "Sync Amazon Ads Portfolios"

    def handle(self, *args, **kwargs):

        total_saved = 0

        accounts = AmazonAdsAccount.objects.filter(is_primary=True)

        for account in accounts:
            total_saved += sync_portfolios(account)

        self.stdout.write(self.style.SUCCESS(f"TOTAL PORTFOLIOS SAVED: {total_saved}"))
