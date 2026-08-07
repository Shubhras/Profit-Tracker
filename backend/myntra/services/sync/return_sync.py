from django.db import transaction

from myntra.constants import MyntraReports
from myntra.models import MyntraReturn
from myntra.parsers.return_parser import ReturnParser
from myntra.services.sync.base_sync import BaseSyncService


class ReturnSyncService(BaseSyncService):
    REPORT_NAME = MyntraReports.RETURNS

    def __init__(self, connection):
        super().__init__(connection)
        self.parser = ReturnParser()

    def process_uploaded_file(self, csv_bytes):
        """
        Process a Returns CSV uploaded manually by the user.

        Uses the same parser/build/save pipeline
        as the normal Myntra report sync.
        """

        rows = self.parser.parse(csv_bytes)

        returns = [self._build(row) for row in rows]

        created, updated = self._save(returns)

        return {
            "rows": len(rows),
            "created": created,
            "updated": updated,
        }

    def _build(self, row):
        return MyntraReturn(
            myntra_connection=self.connection,
            # Product Information
            seller_id=row.get("seller_id"),
            warehouse_id=row.get("warehouse_id"),
            model=row.get("model"),
            myntra_sku_code=row.get("myntra_sku_code"),
            seller_sku_code=row.get("seller_sku_code"),
            style_id=row.get("style_id"),
            sku_id=row.get("sku_id"),
            brand=row.get("brand"),
            # Dates
            order_created_date=self._date(row.get("order_created_date")),
            inscanned_on=self._date(row.get("inscanned_on")),
            fmpu_date=self._date(row.get("fmpu_date")),
            order_delivered_date=self._date(row.get("order_delivered_date")),
            return_created_date=self._date(row.get("return_created_date")),
            refunded_date=self._date(row.get("refunded_date")),
            order_rto_date=self._date(row.get("order_rto_date")),
            # Return Details
            is_refunded=row.get("is_refunded"),
            exchange_id=row.get("exchange_id"),
            # Order Details
            order_id=row.get("order_id"),
            order_group_id=row.get("order_group_id"),
            order_line_id=row.get("order_line_id"),
            seller_order_id=row.get("seller_order_id"),
            # Status
            type=row.get("type"),
            status=row.get("status"),
            # Packet Information
            store_packet_id=row.get("store_packet_id"),
            seller_packet_id_fk=row.get("seller_packet_id_fk"),
            quantity=row.get("quantity"),
            # Return Metadata
            return_id=row.get("return_id"),
            return_mode=row.get("return_mode"),
            return_reason=row.get("return_reason"),
            return_status=row.get("return_status"),
            # Tracking
            forward_tracking_number=row.get("forward_tracking_number"),
            return_tracking_number=row.get("return_tracking_number"),
            # Logistics
            master_bag_id=row.get("master_bag_id"),
            lmdo_status=row.get("lmdo_status"),
            lmdo_last_modified_on=self._date(row.get("lmdo_last_modified_on")),
            gatepass_id=row.get("gatepass_id"),
            gatepass_status=row.get("gatepass_status"),
            gatepass_type=row.get("gatepass_type"),
            gatepass_lastmodified=self._date(row.get("gatepass_lastmodified")),
            raw_data=row,
        )

    @transaction.atomic
    def _save(self, returns):
        if not returns:
            return 0, 0

        incoming_ids = [r.order_line_id for r in returns if r.order_line_id]

        existing_returns = {
            r.order_line_id: r
            for r in MyntraReturn.objects.filter(order_line_id__in=incoming_ids)
        }

        create_returns = []
        update_returns = []

        for return_obj in returns:
            existing = existing_returns.get(return_obj.order_line_id)

            if existing:
                return_obj.pk = existing.pk
                update_returns.append(return_obj)
            else:
                create_returns.append(return_obj)

        if create_returns:
            MyntraReturn.objects.bulk_create(create_returns)

        if update_returns:
            MyntraReturn.objects.bulk_update(
                update_returns,
                fields=[
                    "seller_id",
                    "warehouse_id",
                    "model",
                    "myntra_sku_code",
                    "seller_sku_code",
                    "style_id",
                    "sku_id",
                    "brand",
                    "order_created_date",
                    "inscanned_on",
                    "fmpu_date",
                    "order_delivered_date",
                    "return_created_date",
                    "refunded_date",
                    "order_rto_date",
                    "is_refunded",
                    "exchange_id",
                    "order_id",
                    "order_group_id",
                    "seller_order_id",
                    "type",
                    "status",
                    "store_packet_id",
                    "seller_packet_id_fk",
                    "quantity",
                    "return_id",
                    "return_mode",
                    "return_reason",
                    "return_status",
                    "forward_tracking_number",
                    "return_tracking_number",
                    "master_bag_id",
                    "lmdo_status",
                    "lmdo_last_modified_on",
                    "gatepass_id",
                    "gatepass_status",
                    "gatepass_type",
                    "gatepass_lastmodified",
                    "raw_data",
                ],
            )

        return len(create_returns), len(update_returns)
