import csv
import io


class OrderParser:

    def parse(self, csv_bytes):
        csv_text = csv_bytes.decode("utf-8-sig")

        reader = csv.DictReader(io.StringIO(csv_text))

        rows = []

        for row in reader:
            cleaned = {}

            for key, value in row.items():
                if key is None:
                    continue

                key = key.strip()

                if isinstance(value, str):
                    value = value.strip()

                    if value == "":
                        value = None

                cleaned[key] = value

            rows.append(cleaned)

        return rows