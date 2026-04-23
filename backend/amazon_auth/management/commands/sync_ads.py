
from django.core.management.base import BaseCommand
from amazon_auth.models import AmazonAccount
from amazon_auth.views import sync_orders, sync_finances
from django.contrib.auth.models import User
from amazon_auth.utils import *
from amazon_auth.ads_campins import *
from datetime import datetime, date, timedelta

import logging
from rest_framework.test import force_authenticate
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Sync Amazon Ads Campaign Data"

    def handle(self, *args, **kwargs):
        accounts = AmazonAccount.objects.all()

        today = date.today().strftime("%Y-%m-%d")

        for account in accounts:
            print(f"Syncing Ads for {account.seller_id}")
            sync_ad_campaigns(account, today, today)

        print("Ads Sync Completed")