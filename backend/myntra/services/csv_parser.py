import csv
import io
import re


def safe_float(value):
    try:
        if value is None:
            return 0.0
        if isinstance(value, (int, float)):
            return float(value)

        text = str(value).strip()
        if not text:
            return 0.0

        text = text.replace(",", "")
        match = re.search(r"-?\d+(?:\.\d+)?", text)
        return float(match.group(0)) if match else 0.0
    except Exception:
        return 0.0


def parse_csv(csv_bytes):

    decoded = csv_bytes.decode("utf-8")
    csv_file = io.StringIO(decoded)

    reader = csv.DictReader(csv_file)

    data = []

    for row in reader:
        data.append(row)

    return data
