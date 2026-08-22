from django.core.management.base import BaseCommand

from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.historical_ads_reports import (
    create_historical_ads_reports,
)


class Command(BaseCommand):
    help = "Create historical Amazon Ads reports"

    def add_arguments(self, parser):

        parser.add_argument(
            "--days",
            type=int,
            default=60,
            help="Number of historical days to fetch (maximum 95)",
        )

    def handle(self, *args, **options):

        days = options["days"]

        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        if days <= 0:
            self.stdout.write(self.style.ERROR("--days must be greater than 0"))

            return

        if days > 95:
            self.stdout.write(self.style.ERROR("--days cannot be greater than 95"))

            return

        # -------------------------------------------------
        # ACCOUNTS
        # -------------------------------------------------

        accounts = AmazonAdsAccount.objects.filter(is_primary=True)

        total_created = 0
        total_skipped = 0
        total_failed = 0

        print("\n" + "=" * 80)
        print("STARTING HISTORICAL ADS REPORT SYNC")
        print("=" * 80)

        print(f"REQUESTED DAYS: {days}")
        print(f"TOTAL ACCOUNTS: {accounts.count()}")

        # -------------------------------------------------
        # PROCESS ACCOUNTS
        # -------------------------------------------------

        for account in accounts:
            result = create_historical_ads_reports(
                account=account,
                days=days,
            )

            total_created += result["total_created"]

            total_skipped += result["total_skipped"]

            total_failed += result["total_failed"]

        # -------------------------------------------------
        # FINAL SUMMARY
        # -------------------------------------------------

        print("\n" + "=" * 80)
        print("HISTORICAL ADS REPORT SYNC COMPLETED")
        print("=" * 80)

        print(f"TOTAL REPORTS CREATED : {total_created}")

        print(f"TOTAL REPORT TYPES SKIPPED : {total_skipped}")

        print(f"TOTAL REPORTS FAILED : {total_failed}")

        print("=" * 80)

        if total_failed > 0:
            self.stdout.write(
                self.style.WARNING(
                    "Historical Ads report creation completed with failures."
                )
            )

        else:
            self.stdout.write(
                self.style.SUCCESS("Historical Ads report creation completed.")
            )
