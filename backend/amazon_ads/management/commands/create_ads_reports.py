# sync_ads_reports.py

from django.core.management.base import BaseCommand
from amazon_ads.utils import sync_reports


class Command(BaseCommand):

    help = "Create Amazon Ads Reports"

    def handle(self, *args, **kwargs):

        sync_reports()

        self.stdout.write(
            self.style.SUCCESS(
                "Reports Created"
            )
        )