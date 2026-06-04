# management/commands/sync_negative_keywords.py

from django.core.management.base import BaseCommand

from amazon_ads.services.negative_keyword_sync import (
    sync_negative_keywords
)


class Command(BaseCommand):

    help = "Sync Amazon Ads Negative Keywords"

    def handle(self, *args, **kwargs):

        sync_negative_keywords()

        self.stdout.write(

            self.style.SUCCESS(
                "Negative Keywords Synced"
            )
        )