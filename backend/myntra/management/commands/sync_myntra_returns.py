from django.core.management.base import BaseCommand
from django.utils import timezone
from myntra.services.sync.return_sync import ReturnSyncService

from myntra.constants import MyntraReports, ReportStatus
from myntra.models import MyntraReportQueue


class Command(BaseCommand):
    help = "Sync Myntra Returns Report"

    def handle(self, *args, **options):
        queues = MyntraReportQueue.objects.filter(
            report_name=MyntraReports.RETURNS,
            status=ReportStatus.READY,
        ).select_related("connection")

        if not queues.exists():
            print("No Returns reports ready to sync.")
            return

        for queue in queues:
            print(f"Syncing Returns report: {queue.job_id}")

            try:
                service = ReturnSyncService(queue.connection)

                result = service.process_report(queue.download_url)

                queue.status = ReportStatus.COMPLETED
                queue.completed_at = timezone.now()

                queue.total_rows = result.get("total_rows", 0)
                queue.created_rows = result.get("created", 0)
                queue.updated_rows = result.get("updated", 0)
                queue.error_message = ""

                queue.save(
                    update_fields=[
                        "status",
                        "completed_at",
                        "total_rows",
                        "created_rows",
                        "updated_rows",
                        "error_message",
                    ]
                )

                print(
                    f"Synced {result['total_rows']} rows "
                    f"(Created: {result['created']}, "
                    f"Updated: {result['updated']})"
                )

            except Exception as exc:
                queue.status = ReportStatus.FAILED
                queue.error_message = str(exc)
                queue.save(update_fields=["status", "error_message"])

                print(f"✗ Failed: {exc}")
