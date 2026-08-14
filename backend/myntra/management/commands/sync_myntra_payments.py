from datetime import date, timedelta

from django.core.management.base import BaseCommand

from myntra.models import MyntraConnection
from myntra.services.sync.payment_sync import PaymentSyncService


class Command(BaseCommand):
    help = "Sync Myntra PREPAID and POSTPAID payment transactions"

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=30,
            help="Number of days to sync from today (default: 30)",
        )

        parser.add_argument(
            "--from",
            dest="from_date",
            type=str,
            help="Start date (YYYY-MM-DD)",
        )

        parser.add_argument(
            "--to",
            dest="to_date",
            type=str,
            help="End date (YYYY-MM-DD)",
        )

    def handle(self, *args, **options):

        today = date.today()

        # Exact range takes priority
        if options["from_date"] or options["to_date"]:
            if not options["from_date"] or not options["to_date"]:
                self.stdout.write(
                    self.style.ERROR("Both --from and --to must be provided together.")
                )
                return

            from_date = options["from_date"]
            to_date = options["to_date"]

        else:
            days = options["days"]

            if days <= 0:
                self.stdout.write(self.style.ERROR("--days must be greater than 0."))
                return

            from_date = (today - timedelta(days=days)).isoformat()

            to_date = today.isoformat()

        connections = MyntraConnection.objects.all()

        if not connections.exists():
            self.stdout.write(self.style.ERROR("No active Myntra connections found."))
            return

        payment_methods = [
            "PREPAID",
            "POSTPAID",
        ]

        self.stdout.write(
            self.style.NOTICE(f"Syncing Myntra payments from {from_date} to {to_date}")
        )

        for connection in connections:
            self.stdout.write(self.style.NOTICE(f"\nConnection: {connection}"))

            service = PaymentSyncService(connection)

            for payment_method in payment_methods:
                self.stdout.write(self.style.NOTICE(f"Syncing {payment_method}..."))

                try:
                    result = service.sync(
                        payment_method=payment_method,
                        from_date=from_date,
                        to_date=to_date,
                    )

                    self.stdout.write(
                        self.style.SUCCESS(
                            f"{payment_method}: "
                            f"Payments={result['payments']} | "
                            f"Created={result['created']} | "
                            f"Updated={result['updated']}"
                        )
                    )

                except Exception as exc:
                    self.stdout.write(
                        self.style.ERROR(f"{payment_method} sync failed: {exc}")
                    )

        self.stdout.write(self.style.SUCCESS("\nMyntra payment sync completed."))
