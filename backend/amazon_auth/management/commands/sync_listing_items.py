# amazon_auth/management/commands/sync_listing_items.py

from django.core.management.base import BaseCommand

from amazon_auth.models import AmazonAccount
from django.utils import timezone
from django.db.models import Q
from subscription.models import UserSubscription

from amazon_auth.listing_items import (
    sync_listing_items
)


class Command(BaseCommand):

    help = "Sync Amazon Listing Items"

    def handle(self, *args, **kwargs):

        # accounts = AmazonAccount.objects.all()
        now = timezone.now()
        # 1. Fetch only users with an active, paid, non-expired subscription
        active_user_ids = (
            UserSubscription.objects.filter(
                status="active",
                is_paid=True,
            )
            .filter(Q(end_date__gt=now) | Q(end_date__isnull=True))
            .values_list("user_id", flat=True)
            .distinct()
        )
        accounts = AmazonAccount.objects.filter(
            user_id__in=active_user_ids
        ).select_related("user")
        if not accounts.exists():
            self.stdout.write(self.style.WARNING("No Amazon accounts found with an active, paid subscription."))
            return
        for account in accounts:

            try:

                total = sync_listing_items(
                    user=account.user,
                    account=account
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"{account.seller_central_id} -> {total} synced"
                    )
                )

            except Exception as e:

                self.stdout.write(
                    self.style.ERROR(
                        str(e)
                    )
                )