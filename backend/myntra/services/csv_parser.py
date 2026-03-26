import csv
import io


def safe_float(value):
    try:
        return float(value)
    except:
        return 0.0


def parse_csv(csv_bytes):

    decoded = csv_bytes.decode("utf-8")
    csv_file = io.StringIO(decoded)

    reader = csv.DictReader(csv_file)

    data = []

    for row in reader:
        data.append(row)

    return data