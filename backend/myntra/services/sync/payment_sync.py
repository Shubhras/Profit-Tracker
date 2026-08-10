import hashlib
import json
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

    def _transaction_key(self, row):
        normalized = {
            str(key): "" if value is None else str(value).strip()
            for key, value in row.items()
        }

        payload = json.dumps(
            normalized,
            sort_keys=True,
            separators=(",", ":"),
        )

        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def _build(self, row, payment_method):
        return MyntraPaymentTransaction(
            myntra_connection=self.connection,
            transaction_key=self._transaction_key(row),
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
            nod_comment=row.get("nod_comment"),
            comments=row.get("comments"),
            raw_data=row,
        )

    @transaction.atomic
    def _save(self, transactions):
        if not transactions:
            return 0, 0

        existing = {
            obj.transaction_key: obj
            for obj in MyntraPaymentTransaction.objects.filter(
                myntra_connection=self.connection
            )
        }

        create_list = []
        update_list = []

        for transaction in transactions:
            key = transaction.transaction_key

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
                    "nod_comment",
                    "comments",
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
        skipped = 0
        failed = 0

        for payment in payments:
            download_url = payment.get("utrDetailsLink")

            # ==========================================
            # VALIDATE DOWNLOAD LINK
            # ==========================================

            if (
                not download_url
                or not isinstance(download_url, str)
                or not download_url.startswith(("http://", "https://"))
            ):
                skipped += 1

                print(
                    "Skipping payment report - download link unavailable:",
                    {
                        "utrNumber": payment.get("utrNumber"),
                        "paymentDate": payment.get("paymentDate"),
                        "amount": payment.get("amount"),
                        "utrDetailsLink": download_url,
                    },
                )

                continue

            # ==========================================
            # DOWNLOAD
            # ==========================================

            try:
                csv_bytes = self.download_csv(payment)

            except Exception as exc:
                failed += 1

                print(
                    "Failed to download payment report:",
                    {
                        "utrNumber": payment.get("utrNumber"),
                        "error": str(exc),
                    },
                )

                continue

            # ==========================================
            # PARSE
            # ==========================================

            rows = self.parser.parse(csv_bytes)

            transactions = [self._build(row, payment_method) for row in rows]

            # ==========================================
            # SAVE
            # ==========================================

            created, updated = self._save(transactions)

            total_created += created
            total_updated += updated

        return {
            "payments": len(payments),
            "created": total_created,
            "updated": total_updated,
            "skipped": skipped,
            "failed": failed,
        }

    def sync_uploaded_csv(
        self,
        csv_bytes,
        payment_method,
    ):
        """
        Import a manually uploaded Myntra payment transaction CSV.

        Uses the same parser, model builder and upsert logic
        as the Payment History API sync.
        """

        rows = self.parser.parse(csv_bytes)

        if not rows:
            return {
                "rows": 0,
                "created": 0,
                "updated": 0,
            }

        transactions = [self._build(row, payment_method) for row in rows]

        created, updated = self._save(transactions)

        return {
            "rows": len(rows),
            "created": created,
            "updated": updated,
        }
