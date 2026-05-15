# amazon_ads/management/commands/check_pending_reports.py

from django.core.management.base import BaseCommand

from amazon_ads.utils import (
    check_pending_reports
)


class Command(BaseCommand):

    help = "Check Pending Reports"

    def handle(self, *args, **kwargs):

        check_pending_reports()

        self.stdout.write(
            self.style.SUCCESS(
                "Reports Checked"
            )
        )