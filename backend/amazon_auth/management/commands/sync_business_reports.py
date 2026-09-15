from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from amazon_auth.models import AmazonAccount
from amazon_auth.bussiness_report import sync_business_report
from django.utils import timezone
from django.db.models import Q
from subscription.models import UserSubscription

class Command(BaseCommand):
    help = "Sync daily business reports"

    def handle(self, *args, **kwargs):
        self.stdout.write("CRON STARTED: Sync Business Reports")

        today = timezone.now().date()
        start_date = today - timedelta(days=1)  # yesterday
        end_date = today

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
        for acc in accounts:
            try:
                sync_business_report(
                    acc,
                    start_date=str(start_date),
                    end_date=str(end_date)
                )
                self.stdout.write(f" Synced: {acc.seller_id}")
            except Exception as e:
                self.stdout.write(f"Failed: {acc.seller_id} - {str(e)}")

        self.stdout.write("CRON FINISHED")