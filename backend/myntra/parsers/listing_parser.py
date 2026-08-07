import csv
from io import StringIO


class ListingParser:
    BOOL_FIELDS = {
        "is_active",
    }

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

                if key in self.BOOL_FIELDS:
                    value = self._parse_bool(value)

                cleaned[key] = value

            rows.append(cleaned)

        return rows

    @staticmethod
    def _parse_bool(value):
        if value is None:
            return False

        value = str(value).strip().lower()

        return value in (
            "1",
            "true",
            "yes",
            "y",
        )
