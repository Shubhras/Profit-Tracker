import csv

from django.http import HttpResponse

from myntra.models import (
    MyntraOrder,
    MyntraPaymentTransaction,
    MyntraReturn,
)


class MyntraProfitValidationExporter:
    def __init__(self, user):
        self.user = user

    def export(self):
        """
        Export raw Order + Payment + Return data for validation.

        IMPORTANT:
        One order may have multiple payment transactions.
        Therefore one order may produce multiple CSV rows.
        """

        orders = MyntraOrder.objects.filter(user=self.user).order_by("created_on")

        payments = MyntraPaymentTransaction.objects.filter(
            myntra_connection__user=self.user
        )

        returns = MyntraReturn.objects.filter(myntra_connection__user=self.user)

        payment_map = self._build_payment_map(payments)
        return_map = self._build_return_map(returns)

        response = HttpResponse(content_type="text/csv")

        response["Content-Disposition"] = (
            'attachment; filename="myntra_profit_validation.csv"'
        )

        writer = csv.DictWriter(
            response,
            fieldnames=self._headers(),
        )

        writer.writeheader()

        for order in orders:
            order_payments = payment_map.get(
                order.order_line_id,
                [],
            )

            order_returns = return_map.get(
                order.order_line_id,
                [],
            )

            # -----------------------------
            # Order-level calculated totals
            # -----------------------------

            final_net_sales = sum(
                payment.settled_amount or 0 for payment in order_payments
            )

            estimated_fees = sum(
                (
                    (payment.commission or 0)
                    + (payment.shipping_fee or 0)
                    + (payment.pick_and_pack_fee or 0)
                    + (payment.fixed_fee or 0)
                    + (payment.payment_gateway_fee or 0)
                    + (payment.logistics_commission or 0)
                )
                for payment in order_payments
            )

            marketplace_gst = sum(
                ((payment.igst or 0) + (payment.cgst or 0) + (payment.sgst or 0))
                for payment in order_payments
            )

            tcs = sum(
                (
                    (payment.igst_tcs or 0)
                    + (payment.cgst_tcs or 0)
                    + (payment.sgst_tcs or 0)
                )
                for payment in order_payments
            )

            # -------------------------------------------------
            # No payment exists for this order
            # -------------------------------------------------

            if not order_payments:
                writer.writerow(
                    self._build_row(
                        order=order,
                        payment=None,
                        order_returns=order_returns,
                        payment_count=0,
                        final_net_sales=final_net_sales,
                        estimated_fees=estimated_fees,
                        marketplace_gst=marketplace_gst,
                        tcs=tcs,
                    )
                )

                continue

            # -------------------------------------------------
            # One CSV row PER payment transaction
            # -------------------------------------------------

            for payment in order_payments:
                writer.writerow(
                    self._build_row(
                        order=order,
                        payment=payment,
                        order_returns=order_returns,
                        payment_count=len(order_payments),
                        final_net_sales=final_net_sales,
                        estimated_fees=estimated_fees,
                        marketplace_gst=marketplace_gst,
                        tcs=tcs,
                    )
                )

        return response

    # =========================================================
    # MAPS
    # =========================================================

    def _build_payment_map(self, payments):

        payment_map = {}

        for payment in payments:
            payment_map.setdefault(payment.order_line_id, []).append(payment)

        return payment_map

    def _build_return_map(self, returns):

        return_map = {}

        for item in returns:
            return_map.setdefault(item.order_line_id, []).append(item)

        return return_map

    # =========================================================
    # ROW
    # =========================================================

    def _build_row(
        self,
        order,
        payment,
        order_returns,
        payment_count,
        final_net_sales,
        estimated_fees,
        marketplace_gst,
        tcs,
    ):

        first_return = order_returns[0] if order_returns else None

        return {
            # ==========================================
            # ORDER
            # ==========================================
            "style_id": order.style_id,
            "style_name": order.style_name,
            "seller_sku": order.seller_sku_code,
            "order_line_id": order.order_line_id,
            "seller_order_id": order.seller_order_id,
            "store_order_id": order.store_order_id,
            "order_status": order.order_status,
            "created_on": order.created_on,
            "final_amount": order.final_amount,
            # ==========================================
            # PAYMENT LINK
            # ==========================================
            "payment_count": payment_count,
            "payment_method": (payment.payment_method if payment else ""),
            "neft_ref": (payment.neft_ref if payment else ""),
            "payment_date": (payment.payment_date if payment else ""),
            "order_type": (payment.order_type if payment else ""),
            # ==========================================
            # RAW PAYMENT VALUES
            # ==========================================
            "customer_paid_amount": (payment.customer_paid_amount if payment else ""),
            "settled_amount": (payment.settled_amount if payment else ""),
            "commission": (payment.commission if payment else ""),
            "shipping_fee": (payment.shipping_fee if payment else ""),
            "pick_and_pack_fee": (payment.pick_and_pack_fee if payment else ""),
            "fixed_fee": (payment.fixed_fee if payment else ""),
            "payment_gateway_fee": (payment.payment_gateway_fee if payment else ""),
            "logistics_commission": (payment.logistics_commission if payment else ""),
            # ==========================================
            # GST
            # ==========================================
            "igst": (payment.igst if payment else ""),
            "cgst": (payment.cgst if payment else ""),
            "sgst": (payment.sgst if payment else ""),
            # ==========================================
            # TCS
            # ==========================================
            "igst_tcs": (payment.igst_tcs if payment else ""),
            "cgst_tcs": (payment.cgst_tcs if payment else ""),
            "sgst_tcs": (payment.sgst_tcs if payment else ""),
            "tds": (payment.tds if payment else ""),
            # ==========================================
            # DISCOUNTS
            # ==========================================
            "seller_discount": (payment.seller_discount if payment else ""),
            "platform_discount": (payment.platform_discount if payment else ""),
            "total_discount": (payment.total_discount if payment else ""),
            # ==========================================
            # RETURN
            # ==========================================
            "is_return": bool(order_returns),
            "return_count": len(order_returns),
            "return_id": (first_return.return_id if first_return else ""),
            "return_status": (first_return.return_status if first_return else ""),
            "return_reason": (first_return.return_reason if first_return else ""),
            # ==========================================
            # CURRENT CALCULATIONS
            # ==========================================
            "calculated_gross_qty": 1,
            "calculated_gross_sales": (order.final_amount or 0),
            "calculated_final_net_sales": (final_net_sales),
            "calculated_estimated_fees": (estimated_fees),
            "calculated_marketplace_gst": (marketplace_gst),
            "calculated_tcs": tcs,
        }

    # =========================================================
    # HEADERS
    # =========================================================

    def _headers(self):

        return [
            # Order
            "style_id",
            "style_name",
            "seller_sku",
            "order_line_id",
            "seller_order_id",
            "store_order_id",
            "order_status",
            "created_on",
            "final_amount",
            # Payment identification
            "payment_count",
            "payment_method",
            "neft_ref",
            "payment_date",
            "order_type",
            # Payment
            "customer_paid_amount",
            "settled_amount",
            "commission",
            "shipping_fee",
            "pick_and_pack_fee",
            "fixed_fee",
            "payment_gateway_fee",
            "logistics_commission",
            # GST
            "igst",
            "cgst",
            "sgst",
            # TCS
            "igst_tcs",
            "cgst_tcs",
            "sgst_tcs",
            "tds",
            # Discounts
            "seller_discount",
            "platform_discount",
            "total_discount",
            # Returns
            "is_return",
            "return_count",
            "return_id",
            "return_status",
            "return_reason",
            # Calculated
            "calculated_gross_qty",
            "calculated_gross_sales",
            "calculated_final_net_sales",
            "calculated_estimated_fees",
            "calculated_marketplace_gst",
            "calculated_tcs",
        ]
