import csv
import io
import pandas as pd


class PaymentHistoryParser:

    def parse(self, csv_bytes):
        """
        Parse Myntra Payment History CSV or Excel.
        Args:
            csv_bytes (bytes): Raw CSV or Excel downloaded from Myntra.
        Returns:
            list[dict]
        """
        if csv_bytes.startswith(b"PK\x03\x04") or csv_bytes.startswith(b"\xd0\xcf\x11\xe0"):
            try:
                df = pd.read_excel(io.BytesIO(csv_bytes))
                df = df.where(pd.notnull(df), None)
                records = df.to_dict(orient="records")
                rows = []
                for rec in records:
                    rows.append(self._clean_row(rec))
                return rows
            except Exception:
                pass

        text = csv_bytes.decode("utf-8-sig", errors="ignore")

        reader = csv.DictReader(io.StringIO(text))

        rows = []

        for row in reader:
            rows.append(self._clean_row(row))

        return rows

    def _clean_row(self, row):

        cleaned = {}

        for key, value in row.items():

            key = key.strip()

            if value is None:
                cleaned[key] = None
                continue

            value = value.strip()

            if value == "":
                cleaned[key] = None
            else:
                cleaned[key] = value

        return cleaned