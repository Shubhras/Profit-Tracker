from django.core.management.base import BaseCommand
from django.utils import timezone

from myntra.constants import ReportStatus
from myntra.models import MyntraReportQueue
from myntra.services.report_service import MyntraReportService


class Command(BaseCommand):
    help = "Check status of scheduled Myntra reports"

    def handle(self, *args, **options):

        reports = (
            MyntraReportQueue.objects.filter(status=ReportStatus.SCHEDULED)
            .select_related("myntra_connection")
            .order_by("scheduled_at")
        )

        if not reports.exists():
            self.stdout.write(self.style.WARNING("No scheduled reports found."))
            return

        self.stdout.write(
            self.style.SUCCESS(f"Found {reports.count()} scheduled report(s).\n")
        )

        for report in reports:
            self.stdout.write(f"Checking Job ID: {report.job_id}")

            try:
                service = MyntraReportService(report.myntra_connection)

                response = service.is_ready(report.job_id)

                self.stdout.write(f"Response: {response}")

                if response["ready"]:
                    report.download_url = response["download_url"]
                    report.status = ReportStatus.READY
                    report.completed_at = timezone.now()
                    report.error_message = None

                    report.save(
                        update_fields=[
                            "download_url",
                            "status",
                            "completed_at",
                            "error_message",
                        ]
                    )

                    self.stdout.write(
                        self.style.SUCCESS(f"✓ Report READY - Job {report.job_id}")
                    )

                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f"⏳ Report still generating - Job {report.job_id}"
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
                    self.style.ERROR(f"✗ Error checking Job {report.job_id}: {exc}")
                )

        self.stdout.write(self.style.SUCCESS("\nFinished checking scheduled reports."))
