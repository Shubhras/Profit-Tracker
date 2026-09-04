import csv
import io
from io import StringIO
import pandas as pd


class ReturnParser:
    BOOL_FIELDS = {
        "is_refunded",
    }

    INT_FIELDS = {
        "quantity",
    }

    COLUMN_MAPPING = {
        "seller id": "seller_id",
        "warehouse id": "warehouse_id",
        "model": "model",
        "myntra sku code": "myntra_sku_code",
        "seller sku code": "seller_sku_code",
        "style id": "style_id",
        "sku id": "sku_id",
        "brand": "brand",
        "order created date": "order_created_date",
        "inscanned on": "inscanned_on",
        "fmpu date": "fmpu_date",
        "order delivered date": "order_delivered_date",
        "return created date": "return_created_date",
        "refunded date": "refunded_date",
        "order rto date": "order_rto_date",
        "is refunded": "is_refunded",
        "exchange id": "exchange_id",
        "order id": "order_id",
        "order group id": "order_group_id",
        "order line id": "order_line_id",
        "seller order id": "seller_order_id",
        "type": "type",
        "status": "status",
        "store packet id": "store_packet_id",
        "seller packet id fk": "seller_packet_id_fk",
        "quantity": "quantity",
        "return id": "return_id",
        "return mode": "return_mode",
        "return reason": "return_reason",
        "return status": "return_status",
        "forward tracking number": "forward_tracking_number",
        "return tracking number": "return_tracking_number",
        "master bag id": "master_bag_id",
        "lmdo status": "lmdo_status",
        "lmdo last modified on": "lmdo_last_modified_on",
        "gatepass id": "gatepass_id",
        "gatepass status": "gatepass_status",
        "gatepass type": "gatepass_type",
        "gatepass lastmodified": "gatepass_lastmodified",
    }

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
                        key = str(k).strip()
                        if isinstance(v, str):
                            v = v.strip()
                            if v == "":
                                v = None
                        if key in self.BOOL_FIELDS:
                            v = self._parse_bool(v)
                        elif key in self.INT_FIELDS:
                            v = self._parse_int(v)
                        cleaned[key] = v
                    rows.append(cleaned)
                return rows
            except Exception:
                pass

        csv_text = csv_bytes.decode("utf-8-sig", errors="ignore")
        reader = csv.DictReader(StringIO(csv_text))

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

                if key in self.BOOL_FIELDS:
                    value = self._parse_bool(value)

                elif key in self.INT_FIELDS:
                    value = self._parse_int(value)

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

    @staticmethod
    def _parse_int(value):
        if value in ("", None):
            return 0

        try:
            return int(value)
        except (ValueError, TypeError):
            return 0
