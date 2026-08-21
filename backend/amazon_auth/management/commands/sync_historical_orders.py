from django.core.management.base import BaseCommand, CommandError

from amazon_auth.models import AmazonAccount
from amazon_auth.services.historical_orders_sync import (
    sync_historical_orders,
)


class Command(BaseCommand):
    help = "Sync historical Amazon orders"

    def add_arguments(self, parser):

        parser.add_argument(
            "--days",
            type=int,
            required=True,
            help="Number of historical days to sync",
        )

        parser.add_argument(
            "--user-id",
            type=int,
            required=False,
            help="Sync historical orders only for this Django user",
        )

    def handle(self, *args, **options):

        days = options["days"]
        user_id = options.get("user_id")

        # -------------------------------------------------
        # VALIDATE DAYS
        # -------------------------------------------------

        if days <= 0:
            raise CommandError("--days must be greater than 0.")

        # -------------------------------------------------
        # DETERMINE ACCOUNTS
        # -------------------------------------------------

        if user_id:
            accounts = AmazonAccount.objects.filter(user_id=user_id)

            if not accounts.exists():
                raise CommandError(f"No Amazon account found for user {user_id}.")

            print("\n" + "=" * 80)

            print(f"SYNCING HISTORICAL ORDERS FOR USER: {user_id}")

            print(f"AMAZON ACCOUNTS FOUND: {accounts.count()}")

            print("=" * 80)

        else:
            accounts = AmazonAccount.objects.all()

            print("\n" + "=" * 80)

            print("SYNCING HISTORICAL ORDERS FOR ALL ACCOUNTS")

            print(f"AMAZON ACCOUNTS FOUND: {accounts.count()}")

            print("=" * 80)

        # -------------------------------------------------
        # RUN SYNC
        # -------------------------------------------------

        result = sync_historical_orders(
            days=days,
            accounts=accounts,
        )

        # -------------------------------------------------
        # FINAL OUTPUT
        # -------------------------------------------------

        self.stdout.write(
            self.style.SUCCESS(
                "\n"
                "Historical order sync completed.\n"
                f"Accounts: {result['total_accounts']}\n"
                f"Created: {result['total_saved']}\n"
                f"Updated: {result['total_updated']}\n"
                f"Skipped: {result['total_skipped']}\n"
                f"Failed: {result['total_failed']}"
            )
        )
