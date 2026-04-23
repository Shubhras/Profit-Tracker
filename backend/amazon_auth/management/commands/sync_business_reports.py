from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from amazon_auth.models import AmazonAccount
from amazon_auth.bussiness_report import sync_business_report


class Command(BaseCommand):
    help = "Sync daily business reports"

    def handle(self, *args, **kwargs):
        self.stdout.write("CRON STARTED: Sync Business Reports")

        today = timezone.now().date()
        start_date = today - timedelta(days=1)  # yesterday
        end_date = today

        accounts = AmazonAccount.objects.all()

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