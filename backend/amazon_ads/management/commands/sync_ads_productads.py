# amazon_ads/management/commands/sync_ads_productads.py

from django.core.management.base import BaseCommand

from amazon_ads.utils import (
    sync_productads
)


class Command(BaseCommand):

    help = "Sync Amazon Ads Product Ads"

    def handle(self, *args, **kwargs):

        sync_productads()

        self.stdout.write(
            self.style.SUCCESS(
                "Product Ads Synced"
            )
        )