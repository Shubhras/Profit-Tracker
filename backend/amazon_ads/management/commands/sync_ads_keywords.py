from django.core.management.base import BaseCommand

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.sync.keywords_sync import sync_keywords


class Command(BaseCommand):
    help = "Sync Amazon Ads Keywords"

    def handle(self, *args, **kwargs):

        total_saved = 0

        accounts = AmazonAdsAccount.objects.filter(is_primary=True)

        for account in accounts:
            total_saved += sync_keywords(account)

        self.stdout.write(self.style.SUCCESS(f"TOTAL KEYWORDS SAVED: {total_saved}"))
