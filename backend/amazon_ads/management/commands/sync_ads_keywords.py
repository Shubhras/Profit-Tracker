# sync_ads_keywords.py

from django.core.management.base import BaseCommand
from amazon_ads.utils import sync_keywords


class Command(BaseCommand):

    help = "Sync Amazon Ads Keywords"

    def handle(self, *args, **kwargs):

        sync_keywords()

        self.stdout.write(
            self.style.SUCCESS(
                "Keywords Synced"
            )
        )