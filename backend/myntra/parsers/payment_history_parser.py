import csv
import io


class PaymentHistoryParser:

    def parse(self, csv_bytes):
        """
        Parse Myntra Payment History CSV.
        Args:
            csv_bytes (bytes): Raw CSV downloaded from Myntra.
        Returns:
            list[dict]
        """

        text = csv_bytes.decode("utf-8-sig")

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