from datetime import datetime
from decimal import Decimal

from django.db import transaction

from myntra.models import MyntraPaymentTransaction
from myntra.parsers.payment_parser import PaymentParser

from ..myntra_client_v4 import MyntraClientV4


class PaymentSyncService:
    def __init__(self, connection):
        self.connection = connection
        self.client = MyntraClientV4(connection)
        self.parser = PaymentParser()

    def get_payment_history(
        self,
        payment_method,
        from_date,
        to_date,
        page_no=0,
        page_size=100,
    ):
        return self.client.get_payment_history(
            payment_method=payment_method,
            from_date=from_date,
            to_date=to_date,
            page_no=page_no,
            page_size=page_size,
        )

    def download_csv(self, payment):
        return self.client.download_csv(payment["utrDetailsLink"])

    def _decimal(self, value):
        if value in ("", None):
            return None

        try:
            return Decimal(str(value).replace(",", ""))
        except Exception:
            return None

    def _date(self, value):
        if not value:
            return None

        value = value.strip()

        formats = (
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d",
            "%d-%m-%Y",
            "%d/%m/%Y",
        )

        for fmt in formats:
            try:
                return datetime.strptime(value, fmt).date()
            except ValueError:
                continue

        return None

    def _build(self, row, payment_method):
        return MyntraPaymentTransaction(
            myntra_connection=self.connection,
            payment_method=payment_method,
            neft_ref=row.get("neft_ref"),
            payment_date=self._date(row.get("payment_date")),
            order_line_id=row.get("order_line_id"),
            seller_order_id=row.get("seller_order_id"),
            store_order_id=row.get("store_order_id"),
            return_id=row.get("return_id"),
            order_type=row.get("order_type"),
            customer_paid_amount=self._decimal(row.get("customer_paid_amount")),
            settled_amount=self._decimal(row.get("settled_amount")),
            commission=self._decimal(row.get("commission")),
            shipping_fee=self._decimal(row.get("shipping_fee")),
            pick_and_pack_fee=self._decimal(row.get("pick_and_pack_fee")),
            fixed_fee=self._decimal(row.get("fixed_fee")),
            payment_gateway_fee=self._decimal(row.get("payment_gateway_fee")),
            logistics_commission=self._decimal(row.get("logistics_commission")),
            igst=self._decimal(row.get("igst")),
            cgst=self._decimal(row.get("cgst")),
            sgst=self._decimal(row.get("sgst")),
            igst_tcs=self._decimal(row.get("igst_tcs")),
            cgst_tcs=self._decimal(row.get("cgst_tcs")),
            sgst_tcs=self._decimal(row.get("sgst_tcs")),
            tds=self._decimal(row.get("tds")),
            seller_discount=self._decimal(row.get("seller_discount")),
            platform_discount=self._decimal(row.get("platform_discount")),
            total_discount=self._decimal(row.get("total_discount")),
            comments=row.get("comments"),
            raw_data=row,
        )

    @transaction.atomic
    def _save(self, transactions):
        if not transactions:
            return 0, 0

        existing = {
            (
                obj.neft_ref,
                obj.order_line_id,
                obj.order_type,
                obj.comments,
            ): obj
            for obj in MyntraPaymentTransaction.objects.filter(
                myntra_connection=self.connection
            )
        }

        create_list = []
        update_list = []

        for transaction in transactions:
            key = (
                transaction.neft_ref,
                transaction.order_line_id,
                transaction.order_type,
                transaction.comments,
            )

            obj = existing.get(key)

            if obj:
                transaction.pk = obj.pk
                update_list.append(transaction)
            else:
                create_list.append(transaction)

        if create_list:
            MyntraPaymentTransaction.objects.bulk_create(create_list)

        if update_list:
            MyntraPaymentTransaction.objects.bulk_update(
                update_list,
                fields=[
                    "payment_method",
                    "payment_date",
                    "seller_order_id",
                    "store_order_id",
                    "return_id",
                    "customer_paid_amount",
                    "settled_amount",
                    "commission",
                    "shipping_fee",
                    "pick_and_pack_fee",
                    "fixed_fee",
                    "payment_gateway_fee",
                    "logistics_commission",
                    "igst",
                    "cgst",
                    "sgst",
                    "igst_tcs",
                    "cgst_tcs",
                    "sgst_tcs",
                    "tds",
                    "seller_discount",
                    "platform_discount",
                    "total_discount",
                    "raw_data",
                ],
            )

        return len(create_list), len(update_list)

    def sync(
        self,
        payment_method,
        from_date,
        to_date,
    ):
        history = self.get_payment_history(
            payment_method,
            from_date,
            to_date,
        )

        payments = history.get(
            "data",
            {},
        ).get(
            "payments",
            [],
        )

        total_created = 0
        total_updated = 0

        for payment in payments:
            csv_bytes = self.download_csv(payment)

            rows = self.parser.parse(csv_bytes)

            transactions = [self._build(row, payment_method) for row in rows]
            for row in rows:
                if row.get("order_type") == "NOD":
                    print(
                        {
                            "neft_ref": row.get("neft_ref"),
                            "order_release_id": row.get("order_release_id"),
                            "packet_id": row.get("packet_id"),
                            "store_order_id": row.get("store_order_id"),
                            "seller_order_id": row.get("seller_order_id"),
                            "return_id": row.get("return_id"),
                            "settled_amount": row.get("settled_amount"),
                            "payment_date": row.get("payment_date"),
                        }
                    )

            created, updated = self._save(transactions)

            total_created += created
            total_updated += updated

        return {
            "payments": len(payments),
            "created": total_created,
            "updated": total_updated,
        }
