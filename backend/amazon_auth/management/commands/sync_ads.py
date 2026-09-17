
from django.core.management.base import BaseCommand
from amazon_auth.models import AmazonAccount
from amazon_auth.views import sync_orders, sync_finances
from django.contrib.auth.models import User
from amazon_auth.utils import *
from amazon_auth.ads_campins import *
from datetime import datetime, date, timedelta
from django.utils import timezone
from django.db.models import Q
from subscription.models import UserSubscription
import logging
from rest_framework.test import force_authenticate
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Sync Amazon Ads Campaign Data"

    def handle(self, *args, **kwargs):
        # accounts = AmazonAccount.objects.all()
        now = timezone.now()
        # 1. Fetch only users with an active, paid, non-expired subscription
        active_user_ids = (
            UserSubscription.objects.filter(is_paid=True)
            .filter(
                (Q(status="active") & (Q(end_date__gt=now) | Q(end_date__isnull=True)))
                | (Q(status="cancelled") & Q(end_date__gt=now))
            )
            .values_list("user_id", flat=True)
            .distinct()
        )
        accounts = AmazonAccount.objects.filter(
            user_id__in=active_user_ids
        ).select_related("user")
        if not accounts.exists():
            self.stdout.write(self.style.WARNING("No Amazon accounts found with an active, paid subscription."))
            return
        today = date.today().strftime("%Y-%m-%d")

        for account in accounts:
            print(f"Syncing Ads for {account.seller_id}")
            sync_ad_campaigns(account, today, today)

        print("Ads Sync Completed")