from django.core.management.base import BaseCommand
from django.utils import timezone

from myntra.constants import MyntraReports, ReportStatus
from myntra.models import MyntraReportQueue
from myntra.services.sync.listing_sync import ListingSyncService
from myntra.services.sync.order_sync import OrderSyncService
from myntra.services.sync.return_sync import ReturnSyncService


class Command(BaseCommand):
    help = "Sync all READY Myntra reports"

    SYNC_SERVICES = {
        MyntraReports.ORDERS: OrderSyncService,
        MyntraReports.RETURNS: ReturnSyncService,
        MyntraReports.LISTINGS: ListingSyncService,
    }

    def handle(self, *args, **options):

        reports = (
            MyntraReportQueue.objects.filter(
                status=ReportStatus.READY,
            )
            .select_related("myntra_connection")
            .order_by("scheduled_at")
        )

        if not reports.exists():
            self.stdout.write(self.style.WARNING("No READY reports found."))
            return

        self.stdout.write(
            self.style.SUCCESS(f"Found {reports.count()} report(s) to sync.\n")
        )

        for report in reports:
            service_class = self.SYNC_SERVICES.get(report.report_name)

            if not service_class:
                self.stderr.write(
                    self.style.ERROR(
                        f"No sync service registered for '{report.report_name}'"
                    )
                )
                continue

            self.stdout.write(f"Syncing {report.report_name} (Job ID: {report.job_id})")

            try:
                service = service_class(report.myntra_connection)

                result = service.process_report(report.download_url)

                report.status = ReportStatus.COMPLETED
                report.completed_at = timezone.now()

                # report.total_rows = result.get("total_rows", 0)
                # report.created_rows = result.get("created", 0)
                # report.updated_rows = result.get("updated", 0)
                report.error_message = None

                report.save(
                    update_fields=[
                        "status",
                        "completed_at",
                        # "total_rows",
                        # "created_rows",
                        # "updated_rows",
                        "error_message",
                    ]
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"{report.report_name} synced "
                        f"(Created: {result['created']}, "
                        f"Updated: {result['updated']})"
                    )
                )

            except Exception as exc:
                report.status = ReportStatus.FAILED
                report.error_message = str(exc)

                report.save(
                    update_fields=[
                        "status",
                        "error_message",
                    ]
                )

                self.stderr.write(
                    self.style.ERROR(f"Failed syncing {report.report_name}: {exc}")
                )

        self.stdout.write(self.style.SUCCESS("\nFinished syncing reports."))
