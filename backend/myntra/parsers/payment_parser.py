import csv
from io import StringIO


class PaymentParser:
    def parse(self, csv_bytes):
        csv_text = csv_bytes.decode("utf-8-sig")
        reader = csv.DictReader(StringIO(csv_text))

        rows = []

        for row in reader:
            cleaned = {}

            for key, value in row.items():
                key = key.strip().lower().replace(" ", "_")

                if isinstance(value, str):
                    value = value.strip()

                cleaned[key] = value

            rows.append(cleaned)

        return rows
