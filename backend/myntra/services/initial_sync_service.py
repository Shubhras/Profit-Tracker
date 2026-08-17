from datetime import timedelta

from django.utils import timezone

from myntra.constants import MyntraReports, ReportStatus
from myntra.models import MyntraReportQueue
from myntra.services.report_service import MyntraReportService
from myntra.services.sync.payment_sync import PaymentSyncService


class MyntraInitialSyncService:
    DEFAULT_DAYS = 30

    REPORTS = [
        MyntraReports.ORDERS,
        MyntraReports.RETURNS,
        MyntraReports.LISTINGS,
    ]

    PAYMENT_METHODS = [
        "PREPAID",
        "POSTPAID",
    ]

    def __init__(self, connection, days=None):
        self.connection = connection
        self.days = days or self.DEFAULT_DAYS

    def _get_date_range(self):
        """
        Keep the same date behavior as schedule_myntra_reports.
        """

        to_date = timezone.now().date() - timedelta(days=1)
        from_date = to_date - timedelta(days=self.days)

        return (
            from_date,
            to_date,
            from_date.isoformat(),
            to_date.isoformat(),
        )

    def _schedule_reports(
        self,
        from_date,
        to_date,
        api_from_date,
        api_to_date,
    ):
        service = MyntraReportService(self.connection)

        results = {}

        for report_name in self.REPORTS:
            response = service.schedule(
                report_name=report_name,
                partner_type=self.connection.partner_type,
                from_date=api_from_date,
                to_date=api_to_date,
            )

            if response.get("statusType") != "SUCCESS":
                raise Exception(
                    response.get("statusMessage")
                    or response.get("details")
                    or str(response)
                )

            job_id = str(response["jobId"])

            queue, created = MyntraReportQueue.objects.update_or_create(
                myntra_connection=self.connection,
                report_name=report_name,
                from_date=from_date,
                to_date=to_date,
                defaults={
                    "partner_type": self.connection.partner_type,
                    "job_id": job_id,
                    "status": ReportStatus.SCHEDULED,
                    "scheduled_at": timezone.now(),
                    "download_url": None,
                    "completed_at": None,
                    "error_message": None,
                },
            )

            results[report_name] = {
                "job_id": job_id,
                "created": created,
            }

        return results

    def _sync_payments(self, api_from_date, api_to_date):
        service = PaymentSyncService(self.connection)

        results = {}

        for payment_method in self.PAYMENT_METHODS:
            results[payment_method] = service.sync(
                payment_method=payment_method,
                from_date=api_from_date,
                to_date=api_to_date,
            )

        return results

    def run(self):
        (
            from_date,
            to_date,
            api_from_date,
            api_to_date,
        ) = self._get_date_range()

        reports = self._schedule_reports(
            from_date=from_date,
            to_date=to_date,
            api_from_date=api_from_date,
            api_to_date=api_to_date,
        )

        payments = self._sync_payments(
            api_from_date=api_from_date,
            api_to_date=api_to_date,
        )

        return {
            "from_date": api_from_date,
            "to_date": api_to_date,
            "reports": reports,
            "payments": payments,
        }
