from django.core.management.base import BaseCommand
from django.db import transaction

from myntra.constants import MyntraReports, ReportStatus
from myntra.models import MyntraReportQueue
from myntra.services.sync.order_sync import OrderSyncService


class Command(BaseCommand):
    help = "Process READY Myntra Order reports"

    def handle(self, *args, **options):

        reports = (
            MyntraReportQueue.objects.filter(
                report_name=MyntraReports.ORDERS,
                status=ReportStatus.READY,
            )
            .select_related("myntra_connection")
            .order_by("created_at")
        )

        if not reports.exists():
            self.stdout.write(self.style.WARNING("No READY order reports found."))
            return

        self.stdout.write(f"Found {reports.count()} report(s).\n")

        for report in reports:
            self.stdout.write(f"Processing Queue #{report.id}")

            try:
                report.status = ReportStatus.PROCESSING
                report.save(update_fields=["status"])

                service = OrderSyncService(report.myntra_connection)

                result = service.process_report(report.download_url)

                report.status = ReportStatus.COMPLETED
                report.save(update_fields=["status"])

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Completed "
                        f"(Created={result['created']}, "
                        f"Updated={result['updated']})"
                    )
                )

            except Exception as exc:
                report.status = ReportStatus.FAILED
                report.error_message = str(exc)
                report.save(update_fields=["status", "error_message"])

                self.stderr.write(self.style.ERROR(f"Queue #{report.id} failed: {exc}"))

        self.stdout.write(self.style.SUCCESS("\nFinished processing reports."))
