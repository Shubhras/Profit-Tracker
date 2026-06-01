# management/commands/sync_campaign_negative_targets.py

from django.core.management.base import BaseCommand

from amazon_ads.services.campaign_negative_target_sync import (
    sync_campaign_negative_targets
)


class Command(BaseCommand):

    help = "Sync Amazon Campaign Negative Targets"

    def handle(self, *args, **kwargs):

        sync_campaign_negative_targets()

        self.stdout.write(

            self.style.SUCCESS(
                "Campaign Negative Targets Synced"
            )
        )

        