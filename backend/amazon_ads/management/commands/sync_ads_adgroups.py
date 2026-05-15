# amazon_ads/management/commands/sync_ads_adgroups.py

from django.core.management.base import BaseCommand

from amazon_ads.utils import sync_adgroups


class Command(BaseCommand):

    help = "Sync Amazon Ads AdGroups"

    def handle(self, *args, **kwargs):

        sync_adgroups()

        self.stdout.write(
            self.style.SUCCESS(
                "AdGroups Synced"
            )
        )