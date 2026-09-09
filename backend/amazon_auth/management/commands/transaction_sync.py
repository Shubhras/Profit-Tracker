from django.core.management.base import BaseCommand
from datetime import datetime, timedelta

from amazon_auth.models import AmazonAccount
from amazon_auth.services.transaction_sync import sync_transactions_for_account
from django.utils import timezone
from django.db.models import Q
from subscription.models import UserSubscription

class Command(BaseCommand):

    help = "Sync Amazon Transactions"

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

        posted_after = (
            datetime.utcnow() - timedelta(days=7)
        ).isoformat() + "Z"

        for account in accounts:

            try:
                sync_transactions_for_account(
                    account,
                    posted_after
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Synced account {account.id}"
                    )
                )

            except Exception as e:

                self.stdout.write(
                    self.style.ERROR(
                        f"Error account {account.id}: {str(e)}"
                    )
                )
                
                