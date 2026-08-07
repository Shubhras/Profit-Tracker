from datetime import datetime
from decimal import Decimal

from django.utils import timezone

from myntra.services.report_service import MyntraReportService


class BaseSyncService:
    REPORT_NAME = None

    def __init__(self, connection):
        self.connection = connection
        self.report = MyntraReportService(connection)

    def schedule(
        self,
        from_date=None,
        to_date=None,
        partner_type=None,
    ):
        return self.report.schedule(
            report_name=self.REPORT_NAME,
            partner_type=self.connection.partner_type,
            from_date=from_date,
            to_date=to_date,
        )

    def check(self, job_id):
        return self.report.is_ready(job_id)

    def download(self, download_url):
        return self.report.download(download_url)

    def process_report(self, download_url):
        csv_bytes = self.download(download_url)
        rows = self.parser.parse(csv_bytes)
        objects = self._process_rows(rows)

        created, updated = self._save(objects)

        return {
            "success": True,
            "total_rows": len(rows),
            "created": created,
            "updated": updated,
        }

    def _process_rows(self, rows):
        objects = []
    
        for index, row in enumerate(rows):
            if index == 0:
                print("FIRST ROW:")
                print(row)
    
            try:
                objects.append(self._build(row))
            except Exception as exc:
                print(f"Failed to process row: {exc}")
    
        return objects

    @staticmethod
    def _date(value):
        if not value:
            return None

        value = value.strip()

        formats = (
            "%d-%m-%Y",
            "%Y-%m-%d",
        )

        for fmt in formats:
            try:
                return datetime.strptime(value, fmt).date()
            except ValueError:
                continue

        return None

    @staticmethod
    def _decimal(value):
        if value in ("", None):
            return Decimal("0.00")
        return Decimal(str(value))

    @staticmethod
    def _dt(value):
        if not value:
            return None

        value = value.strip()

        formats = (
            "%d-%m-%Y %H:%M:%S",
            "%d-%m-%Y",
            "%Y-%m-%d %H:%M:%S.%f",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d",
        )

        for fmt in formats:
            try:
                parsed = datetime.strptime(value, fmt)
                return timezone.make_aware(parsed, timezone.get_current_timezone())
            except ValueError:
                continue

        return None

    # def parse(self, csv_bytes):
    #     raise NotImplementedError

    # def save(self, rows):
    #     raise NotImplementedError

    # def sync(self, **kwargs):
    #     raise NotImplementedError
