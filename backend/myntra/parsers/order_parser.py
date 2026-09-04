import csv
import io
import pandas as pd


class OrderParser:

    def parse(self, csv_bytes):
        if csv_bytes.startswith(b"PK\x03\x04") or csv_bytes.startswith(b"\xd0\xcf\x11\xe0"):
            try:
                df = pd.read_excel(io.BytesIO(csv_bytes))
                df = df.where(pd.notnull(df), None)
                records = df.to_dict(orient="records")
                rows = []
                for rec in records:
                    cleaned = {}
                    for k, v in rec.items():
                        if k is None:
                            continue
                        k_str = str(k).strip()
                        if isinstance(v, str):
                            v = v.strip()
                            if v == "":
                                v = None
                        cleaned[k_str] = v
                    rows.append(cleaned)
                return rows
            except Exception:
                pass

        csv_text = csv_bytes.decode("utf-8-sig", errors="ignore")
        reader = csv.DictReader(io.StringIO(csv_text))

        rows = []

        for row in reader:
            cleaned = {}

            for key, value in row.items():
                if key is None:
                    continue

                key = str(key).strip()

                if isinstance(value, str):
                    value = value.strip()

                    if value == "":
                        value = None

                cleaned[key] = value

            rows.append(cleaned)

        return rows