# amazon_ads/management/commands/sync_budget_rules.py

from django.core.management.base import BaseCommand

from amazon_ads.budget_rules import (
    sync_budget_rules
)


class Command(BaseCommand):

    help = "Sync Amazon Ads Budget Rules"

    def handle(self, *args, **kwargs):

        sync_budget_rules()

        self.stdout.write(

            self.style.SUCCESS(
                "Budget Rules Synced"
            )
        )