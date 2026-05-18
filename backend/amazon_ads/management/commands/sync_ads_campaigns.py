# amazon_ads/management/commands/sync_ads_campaigns.py

from django.core.management.base import BaseCommand

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.campaigns import sync_campaigns


class Command(BaseCommand):

    help = "Sync Amazon Ads Campaigns"

    def handle(self, *args, **kwargs):  

        accounts = AmazonAdsAccount.objects.filter(
            is_primary = True
        )

        for account in accounts:

            print(
                f"SYNCING ACCOUNT: {account.profile_id}"
            )

            sync_campaigns(account)

        print("CAMPAIGN SYNC COMPLETED")