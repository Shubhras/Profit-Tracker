from django.core.management.base import BaseCommand

from myntra.models import MyntraConnection
from myntra.services.sync.payment_sync import PaymentSyncService


class Command(BaseCommand):
    help = "Sync Myntra Payment Transactions"

    def add_arguments(self, parser):
        parser.add_argument(
            "--payment-method",
            type=str,
            required=True,
            help="Payment method (PREPAID or POSTPAID.)",
        )

        parser.add_argument(
            "--from-date",
            type=str,
            required=True,
            help="Start date (YYYY-MM-DD)",
        )

        parser.add_argument(
            "--to-date",
            type=str,
            required=True,
            help="End date (YYYY-MM-DD)",
        )

    def handle(self, *args, **options):

        payment_method = options["payment_method"]
        from_date = options["from_date"]
        to_date = options["to_date"]

        connections = MyntraConnection.objects.all()

        if not connections.exists():
            self.stdout.write(self.style.ERROR("No active Myntra connections found."))
            return

        for connection in connections:
            self.stdout.write(self.style.NOTICE(f"Syncing payments for {connection}"))

            service = PaymentSyncService(connection)

            result = service.sync(
                payment_method=payment_method,
                from_date=from_date,
                to_date=to_date,
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f"Payments: {result['payments']} | "
                    f"Created: {result['created']} | "
                    f"Updated: {result['updated']}"
                )
            )
