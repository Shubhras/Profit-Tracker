from datetime import timedelta   

from django.core.management.base import BaseCommand
from django.utils import timezone

from myntra.constants import (
    MyntraReports,
    ReportStatus,
)
from myntra.models import (
    MyntraConnection,
    MyntraReportQueue,
)
from myntra.services.report_service import MyntraReportService


class Command(BaseCommand):     #first command
    help = "Schedule Myntra reports"

    REPORTS = [
        MyntraReports.ORDERS,
        MyntraReports.RETURNS,
        MyntraReports.LISTINGS,
    ]

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=15,
            help="Number of days to fetch (default: 15)",
        )

    def handle(self, *args, **options):
        days = options["days"]

        # Store dates as date objects for DB
        to_date = timezone.now().date() - timedelta(days=1)

        from_date = to_date - timedelta(days=days)

        # API expects ISO strings
        api_from_date = from_date.isoformat()
        api_to_date = to_date.isoformat()

        connections = MyntraConnection.objects.all()

        if not connections.exists():
            self.stdout.write(self.style.WARNING("No Myntra connections found."))
            return

        for connection in connections:
            service = MyntraReportService(connection)

            for report_name in self.REPORTS:
                self.stdout.write(f"Scheduling {report_name} Report for {connection}")

                try:
                    response = service.schedule(
                        report_name=report_name,
                        partner_type=connection.partner_type,
                        from_date=api_from_date,
                        to_date=api_to_date,
                    )

                    self.stdout.write(f"Schedule Response: {response}")

                    if response.get("statusType") != "SUCCESS":
                        raise Exception(
                            response.get("statusMessage")
                            or response.get("details")
                            or response
                        )

                    job_id = str(response["jobId"])

                    queue, created = MyntraReportQueue.objects.update_or_create(
                        myntra_connection=connection,
                        report_name=report_name,
                        from_date=from_date,
                        to_date=to_date,
                        defaults={
                            "partner_type": connection.partner_type,
                            "job_id": job_id,
                            "status": ReportStatus.SCHEDULED,
                            "scheduled_at": timezone.now(),
                            "download_url": None,
                            "completed_at": None,
                            "error_message": None,
                        },
                    )

                    action = "Created" if created else "Updated"

                    self.stdout.write(
                        self.style.SUCCESS(
                            f"{action} {report_name} queue entry. Job ID: {job_id}"
                        )
                    )

                except Exception as exc:
                    self.stderr.write(
                        self.style.ERROR(
                            f"Failed to schedule {report_name} for {connection}: {exc}"
                        )
                    )
