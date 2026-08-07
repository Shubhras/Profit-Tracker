
from django.db import transaction

from myntra.constants import MyntraReports
from myntra.models import MyntraOrder
from myntra.parsers.order_parser import OrderParser
from myntra.services.sync.base_sync import BaseSyncService


class OrderSyncService(BaseSyncService):
    REPORT_NAME = MyntraReports.ORDERS

    def __init__(self, connection):
        super().__init__(connection)
        self.parser = OrderParser()

    def process_uploaded_file(self, csv_bytes):
        """
        Process an Orders CSV uploaded manually by the user.
    
        Uses the exact same:
        - OrderParser
        - _build()
        - _save()
    
        as the normal Myntra report sync.
        """
    
        rows = self.parser.parse(csv_bytes)
    
        orders = [
            self._build(row)
            for row in rows
        ]
    
        result = self._save(orders)
    
        return result


    def _build(self, row):

        return MyntraOrder(
            user=self.connection.user,
            myntra_connection=self.connection,
            seller_id=row.get("seller id"),
            warehouse_id=row.get("warehouse id"),
            po_type=row.get("po_type"),
            store_order_id=row.get("store order id"),
            order_release_id=row.get("order release id"),
            order_line_id=row.get("order line id"),
            seller_order_id=row.get("seller order id"),
            order_id_fk=row.get("order id fk"),
            style_id=row.get("style id"),
            seller_sku_code=row.get("seller sku code"),
            sku_id=row.get("sku id"),
            myntra_sku_code=row.get("myntra sku code"),
            size=row.get("size"),
            vendor_article_number=row.get("vendor article number"),
            brand=row.get("brand"),
            style_name=row.get("style name"),
            article_type=row.get("article type"),
            order_status=row.get("order status"),
            packet_id=row.get("packet id"),
            seller_packet_id=row.get("seller packe id"),  # <-- note this spelling
            courier_code=row.get("courier code"),
            order_tracking_number=row.get("order tracking number"),
            seller_warehouse_id=row.get("seller warehouse id"),
            cancellation_reason_id=row.get("cancellation reason id fk"),
            cancellation_reason=row.get("cancellation reason"),
            created_on=self._dt(row.get("created on")),
            packed_on=self._dt(row.get("packed on")),
            fmpu_date=self._dt(row.get("fmpu date")),
            inscanned_on=self._dt(row.get("inscanned on")),
            shipped_on=self._dt(row.get("shipped on")),
            delivered_on=self._dt(row.get("delivered on")),
            cancelled_on=self._dt(row.get("cancelled on")),
            rto_creation_date=self._dt(row.get("rto creation date")),
            lost_date=self._dt(row.get("lost date")),
            return_creation_date=self._dt(row.get("return creation date")),
            final_amount=self._decimal(row.get("final amount")),
            total_mrp=self._decimal(row.get("total mrp")),
            discount=self._decimal(row.get("discount")),
            coupon_discount=self._decimal(row.get("coupon discount")),
            shipping_charge=self._decimal(row.get("shipping charge")),
            gift_charge=self._decimal(row.get("gift charge")),
            tax_recovery=self._decimal(row.get("tax recovery")),
            seller_price=self._decimal(row.get("seller price")),
            city=row.get("city"),
            state=row.get("state"),
            zipcode=row.get("zipcode"),
            raw_data=row,
        )

    @transaction.atomic
    def _save(self, orders):
        if not orders:
            return {
                "created": 0,
                "updated": 0,
            }

        # Get all incoming order line ids
        incoming_ids = [order.order_line_id for order in orders]

        # Fetch existing orders from DB
        existing_orders = {
            order.order_line_id: order
            for order in MyntraOrder.objects.filter(order_line_id__in=incoming_ids)
        }

        create_orders = []
        update_orders = []

        for order in orders:
            existing = existing_orders.get(order.order_line_id)

            if existing:
                # bulk_update requires the primary key
                order.pk = existing.pk
                update_orders.append(order)
            else:
                create_orders.append(order)

        # Insert new records
        if create_orders:
            MyntraOrder.objects.bulk_create(create_orders)

        # Update existing records
        if update_orders:
            MyntraOrder.objects.bulk_update(
                update_orders,
                fields=[
                    "seller_id",
                    "warehouse_id",
                    "po_type",
                    "store_order_id",
                    "order_release_id",
                    "seller_order_id",
                    "order_id_fk",
                    "style_id",
                    "seller_sku_code",
                    "sku_id",
                    "myntra_sku_code",
                    "size",
                    "vendor_article_number",
                    "brand",
                    "style_name",
                    "article_type",
                    "order_status",
                    "packet_id",
                    "seller_packet_id",
                    "courier_code",
                    "order_tracking_number",
                    "seller_warehouse_id",
                    "cancellation_reason_id",
                    "cancellation_reason",
                    "created_on",
                    "packed_on",
                    "fmpu_date",
                    "inscanned_on",
                    "shipped_on",
                    "delivered_on",
                    "cancelled_on",
                    "rto_creation_date",
                    "lost_date",
                    "return_creation_date",
                    "final_amount",
                    "total_mrp",
                    "discount",
                    "coupon_discount",
                    "shipping_charge",
                    "gift_charge",
                    "tax_recovery",
                    "seller_price",
                    "city",
                    "state",
                    "zipcode",
                    "raw_data",
                ],
            )

        return len(create_orders), len(update_orders)
