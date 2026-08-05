from myntra.services.myntra_client_v4 import MyntraClientV4


class MyntraReportService:
    def __init__(self, connection):
        self.connection = connection
        self.client = MyntraClientV4(connection)

    def schedule(
        self,
        report_name,
        from_date=None,
        to_date=None,
        partner_type=None,
    ):
        return self.client.schedule_report(
            report_name=report_name,
            partner_type=partner_type,
            from_date=from_date,
            to_date=to_date,
        )

    def is_ready(self, job_id):
        response = self.client.fetch_report(job_id)
        response = self.client.fetch_report(job_id)
        success_file = response.get("successFile")
    
        return {
            "ready": bool(success_file),
            "download_url": success_file,
            "status": response.get("status"),
            "message": response.get("statusMessage"),
            "response": response,
        }

    def download(self, url):
        return self.client.download_csv(url)
