# sync_ads_targets.py

from django.core.management.base import BaseCommand
from amazon_ads.utils import sync_targets


class Command(BaseCommand):

    help = "Sync Amazon Ads Targets"

    def handle(self, *args, **kwargs):

        sync_targets()

        self.stdout.write(
            self.style.SUCCESS(
                "Targets Synced"
            )
        )