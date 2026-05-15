# sync_ads_searchterms.py

from django.core.management.base import BaseCommand
from amazon_ads.utils import (
    process_reports
)


class Command(BaseCommand):

    help = "Create Search Term Reports"

    def handle(self, *args, **kwargs):

        process_reports()

        self.stdout.write(
            self.style.SUCCESS(
                "Search Terms Reports Created"
            )
        )