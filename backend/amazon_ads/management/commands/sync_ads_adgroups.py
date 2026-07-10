from django.core.management.base import BaseCommand

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.sync.adgroups_sync import sync_adgroups


class Command(BaseCommand):
    help = "Sync Amazon Ads AdGroups"

    def handle(self, *args, **kwargs):

        total_saved = 0

        accounts = AmazonAdsAccount.objects.filter(is_primary=True)

        for account in accounts:
            total_saved += sync_adgroups(account)

        self.stdout.write(self.style.SUCCESS(f"TOTAL ADGROUPS SAVED: {total_saved}"))
