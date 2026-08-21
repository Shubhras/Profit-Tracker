from decimal import Decimal, InvalidOperation

ZERO = Decimal("0")


class BlinkitProfitCalculator:
    """
    Blinkit-specific profitability calculator.

    Responsibilities:
    - Calculate Blinkit financial metrics.
    - Keep calculations independent from reporting/aggregation.
    - Return Blinkit-native financial values.
    - Leave frontend/common DTO mapping to the adapter layer.

    Hierarchy:

        Item ID
            ↓
        Order ID

    OrderSummary and SKUSummary are responsible for aggregation.

    Important:
    ---------------------------------------------------------------
    Storage allocation is intentionally NOT handled here.

    Storage comes from the separate Blinkit Storage Charges report
    and will be handled separately by the storage allocation layer.

    Therefore:

        storage = 0
        mp_fees = commission

    for now.
    """

    def __init__(self, user=None, filters=None):
        self.user = user
        self.filters = filters or {}

    # ============================================================
    # HELPERS
    # ============================================================

    @staticmethod
    def _decimal(value):
        """
        Safely convert a value to Decimal.
        """

        if value is None:
            return ZERO

        if isinstance(value, Decimal):
            return value

        if isinstance(value, str):
            value = value.strip()

            if not value:
                return ZERO

            if value.upper() in {
                "NA",
                "N/A",
                "NONE",
                "NULL",
                "-",
            }:
                return ZERO

        try:
            return Decimal(str(value))

        except (
            InvalidOperation,
            ValueError,
            TypeError,
        ):
            return ZERO

    @staticmethod
    def _order_kind(order):
        """
        Normalize Blinkit order kind.

        Supported values:

            FORWARD
            RETURN
            CANCELLED
        """

        if not order:
            return ""

        return (order.order_kind or "").strip().upper()

    # ============================================================
    # QUANTITY
    # ============================================================

    def calculate_gross_qty(self, item):
        """
        Gross Quantity.

        Gross quantity represents the originally sold quantity.

        RETURN and CANCELLED rows are financial/event rows and
        therefore do not add to gross quantity.

        FORWARD:
            quantity

        RETURN:
            0

        CANCELLED:
            0
        """

        order_kind = self._order_kind(item.order)

        if order_kind in {
            "RETURN",
            "CANCELLED",
        }:
            return ZERO

        return self._decimal(item.quantity)

    def calculate_return_qty(self, item):
        """
        Return Quantity.

        Source:
            BlinkitOrder.order_kind == RETURN

        RETURN:
            quantity

        Otherwise:
            0
        """

        if self._order_kind(item.order) == "RETURN":
            return self._decimal(item.quantity)

        return ZERO

    def calculate_cancelled_qty(self, item):
        """
        Cancelled Quantity.

        Source:
            BlinkitOrder.order_kind == CANCELLED

        CANCELLED:
            quantity

        Otherwise:
            0
        """

        if self._order_kind(item.order) == "CANCELLED":
            return self._decimal(item.quantity)

        return ZERO

    def calculate_net_qty(self, item):
        """
        Net Quantity.

        Net Qty =
            Gross Qty
            - Return Qty
            - Cancelled Qty
        """

        gross_qty = self.calculate_gross_qty(item)

        return_qty = self.calculate_return_qty(item)

        cancelled_qty = self.calculate_cancelled_qty(item)

        return gross_qty - return_qty - cancelled_qty

    # ============================================================
    # SALES
    # ============================================================

    def calculate_gross_sales(self, item):
        """
        Gross Sales.

        Source:
            BlinkitOrderItem.total_gross_bill_amount

        IMPORTANT:
        The importer already preserves the sign of the source row.

        Therefore:

            FORWARD   -> positive
            RETURN    -> negative
            CANCELLED -> whatever the source row contains

        We do not manually reverse/negate the amount here.
        """

        return self._decimal(item.total_gross_bill_amount)

    def calculate_net_sales(self, item):
        """
        Net Sales.

        Blinkit's imported financial rows already contain the
        correct sign.

        Therefore we simply use the source amount.

        No manual RETURN/CANCELLED reversal is performed.
        """

        return self._decimal(item.total_gross_bill_amount)

    # ============================================================
    # PROMOTION / DISCOUNT
    # ============================================================

    def calculate_promo_discount(self, item):
        """
        Blinkit currently has no mapped promotion/coupon field.

        Therefore promotion discount is zero for now.
        """

        return ZERO

    # ============================================================
    # COMMISSION
    # ============================================================

    def calculate_commission(self, item):
        """
        Marketplace commission.

        Source:
            BlinkitOrderItem.commission_charge

        The imported value's sign is preserved.

        Example:

            FORWARD -> +26.70
            RETURN  -> -26.70
        """

        return self._decimal(item.commission_charge)

    def calculate_commission_gst(self, item):
        """
        GST on commission.

        Source:
            BlinkitOrderItem.commission_gst

        The imported value's sign is preserved.
        """

        return self._decimal(item.commission_gst)

    # ============================================================
    # STORAGE
    # ============================================================

    def calculate_storage(self):
        """
        Storage is intentionally NOT included in the calculator
        yet.

        Storage comes from the separate Blinkit Storage Charges
        report and will be allocated independently.

        Therefore:

            storage = 0
        """

        return ZERO

    # ============================================================
    # MARKETPLACE FEES
    # ============================================================

    def calculate_mp_fee_breakdown(self, item):
        """
        Marketplace fee breakdown.

        CURRENT definition:

            MP Fees = Commission

        Storage is intentionally excluded for now.

        Storage will be added later by the storage allocation /
        adapter layer.
        """

        commission = self.calculate_commission(item)

        storage = self.calculate_storage()

        mp_fees = commission + storage

        return {
            "commission": commission,
            "storage": storage,
            "mp_fees": mp_fees,
        }

    def calculate_mp_fees(self, item):
        """
        Total Marketplace Fees.

        For now:

            MP Fees = Commission
        """

        breakdown = self.calculate_mp_fee_breakdown(item)

        return breakdown["mp_fees"]

    # ============================================================
    # SHIPPING
    # ============================================================

    def calculate_shipping(self, item):
        """
        Shipping charge.

        Source:
            BlinkitOrderItem.shipping_charge

        The imported sign is preserved.
        """

        return self._decimal(item.shipping_charge)

    def calculate_shipping_gst(self, item):
        """
        GST on shipping.

        Source:
            BlinkitOrderItem.shipping_gst

        The imported sign is preserved.
        """

        return self._decimal(item.shipping_gst)

    # ============================================================
    # MARKETPLACE GST
    # ============================================================

    def calculate_mp_gst(self, item):
        """
        Marketplace GST.

        MP GST =
            Commission GST
            + Shipping GST
        """

        commission_gst = self.calculate_commission_gst(item)

        shipping_gst = self.calculate_shipping_gst(item)

        return commission_gst + shipping_gst

    # ============================================================
    # TCS
    # ============================================================

    def calculate_tcs(self, item):
        """
        TCS.

        Source:
            BlinkitOrderItem.tcs_amount

        The imported sign is preserved.
        """

        return self._decimal(item.tcs_amount)

    # ============================================================
    # TDS
    # ============================================================

    def calculate_tds_breakdown(self, item):
        """
        TDS breakdown.

        TDS =
            TDS 194O
            + TDS 194Q

        The imported signs are preserved.
        """

        tds_194o = self._decimal(item.tds_194o_amount)

        tds_194q = self._decimal(item.tds_194q_amount)

        return {
            "tds_194o": tds_194o,
            "tds_194q": tds_194q,
            "tds": (tds_194o + tds_194q),
        }

    def calculate_tds(self, item):
        """
        Total TDS.
        """

        breakdown = self.calculate_tds_breakdown(item)

        return breakdown["tds"]

    # ============================================================
    # GST PERCENTAGES
    # ============================================================

    def calculate_gst_percentage(self, item):
        """
        Preserve Blinkit's GST percentage fields separately.

        Sources:
            igst_percent
            cgst_percent
            sgst_percent
            cess_percent
        """

        return {
            "igst_percent": self._decimal(item.igst_percent),
            "cgst_percent": self._decimal(item.cgst_percent),
            "sgst_percent": self._decimal(item.sgst_percent),
            "cess_percent": self._decimal(item.cess_percent),
        }

    # ============================================================
    # TAXABLE VALUE
    # ============================================================

    def calculate_taxable_value(
        self,
        net_sales,
        gst_percentage,
    ):
        """
        Calculate taxable value.

        Supported GST rates:

            5%  -> Amount / 1.05
            12% -> Amount / 1.12
            18% -> Amount / 1.18
            28% -> Amount / 1.28

        If no supported GST rate is available,
        taxable value defaults to net sales.
        """

        net_sales = self._decimal(net_sales)

        igst = self._decimal(gst_percentage.get("igst_percent"))

        cgst = self._decimal(gst_percentage.get("cgst_percent"))

        sgst = self._decimal(gst_percentage.get("sgst_percent"))

        # --------------------------------------------------------
        # Determine applicable GST rate.
        #
        # Prefer IGST.
        # Otherwise CGST + SGST.
        # --------------------------------------------------------

        if igst > ZERO:
            gst_rate = igst
        else:
            gst_rate = cgst + sgst

        if gst_rate == Decimal("5"):
            return net_sales / Decimal("1.05")

        if gst_rate == Decimal("12"):
            return net_sales / Decimal("1.12")

        if gst_rate == Decimal("18"):
            return net_sales / Decimal("1.18")

        if gst_rate == Decimal("28"):
            return net_sales / Decimal("1.28")

        return net_sales

    # ============================================================
    # GST TO PAY
    # ============================================================

    def calculate_gst_to_pay(self, item):
        """
        GST to Pay.

        GST to Pay =
            IGST Amount
            + CGST Amount
            + SGST Amount
            + Cess Amount

        The source signs are preserved.
        """

        igst_amount = self._decimal(item.igst_amount)

        cgst_amount = self._decimal(item.cgst_amount)

        sgst_amount = self._decimal(item.sgst_amount)

        cess_amount = self._decimal(item.cess_amount)

        return igst_amount + cgst_amount + sgst_amount + cess_amount

    # ============================================================
    # CLAIMS
    # ============================================================

    def calculate_claims(self, item):
        """
        Claims.

        No mapped claims field has been established yet.
        """

        return ZERO

    # ============================================================
    # PRODUCT COST
    # ============================================================

    def calculate_product_cost(self, item):
        """
        Product cost / COGS.

        Currently zero.

        This will later come from user-provided product costing.
        """

        return ZERO

    # ============================================================
    # RETURN PERCENTAGE
    # ============================================================

    def calculate_return_percentage(
        self,
        gross_qty,
        return_qty,
    ):
        """
        Return Percentage.

        Return % =
            Return Qty / Gross Qty × 100

        Example:

            Gross Qty = 1
            Return Qty = 1

            Return % = 100%
        """

        gross_qty = self._decimal(gross_qty)

        return_qty = self._decimal(return_qty)

        if gross_qty == ZERO:
            return ZERO

        return return_qty / gross_qty * Decimal("100")

    # ============================================================
    # PROFIT
    # ============================================================

    def calculate_profit(
        self,
        net_sales,
        mp_fees,
        mp_gst,
        tcs,
        tds,
        product_cost,
        claims=ZERO,
    ):
        """
        Profit.

        Current structure:

            Net Sales
            - Marketplace Fees
            + Marketplace GST
            + TCS
            + TDS
            - Product Cost
            + Claims

        The signs of the imported financial values are preserved.

        Therefore a RETURN row naturally reverses the forward
        financial result.
        """

        net_sales = self._decimal(net_sales)

        mp_fees = self._decimal(mp_fees)

        mp_gst = self._decimal(mp_gst)

        tcs = self._decimal(tcs)

        tds = self._decimal(tds)

        product_cost = self._decimal(product_cost)

        claims = self._decimal(claims)

        return net_sales - mp_fees + mp_gst + tcs + tds - product_cost + claims

    # ============================================================
    # PROFIT PERCENTAGE
    # ============================================================

    def calculate_profit_percentage(
        self,
        profit,
        net_sales,
    ):
        """
        Profit Percentage.

        Profit % =
            Profit / Net Sales × 100
        """

        profit = self._decimal(profit)

        net_sales = self._decimal(net_sales)

        if net_sales == ZERO:
            return ZERO

        return profit / net_sales * Decimal("100")

    # ============================================================
    # COMPLETE ORDER ITEM CALCULATION
    # ============================================================

    def calculate_order_item(self, item):
        """
        Calculate all currently agreed Blinkit profitability
        values for one OrderItem.

        Important:

        This method does NOT:
        - allocate storage
        - reverse RETURN values manually
        - zero CANCELLED financial rows
        - perform frontend/common DTO mapping

        It reads the financial sign from the imported Blinkit row.

        Therefore:

            FORWARD:
                positive financial values

            RETURN:
                negative financial values

            CANCELLED:
                whatever financial rows Blinkit supplied

        Aggregation by order_id is handled by OrderSummary.
        """

        # --------------------------------------------------------
        # Quantity
        # --------------------------------------------------------

        gross_qty = self.calculate_gross_qty(item)

        return_qty = self.calculate_return_qty(item)

        cancelled_qty = self.calculate_cancelled_qty(item)

        net_qty = gross_qty - return_qty - cancelled_qty

        # --------------------------------------------------------
        # Sales
        # --------------------------------------------------------

        gross_sales = self.calculate_gross_sales(item)

        net_sales = self.calculate_net_sales(item)

        promo_discount = self.calculate_promo_discount(item)

        # --------------------------------------------------------
        # Marketplace Fees
        # --------------------------------------------------------

        mp_fee_breakdown = self.calculate_mp_fee_breakdown(item)

        commission = mp_fee_breakdown["commission"]

        storage = mp_fee_breakdown["storage"]

        mp_fees = mp_fee_breakdown["mp_fees"]

        # --------------------------------------------------------
        # Shipping
        # --------------------------------------------------------

        shipping = self.calculate_shipping(item)

        shipping_gst = self.calculate_shipping_gst(item)

        # --------------------------------------------------------
        # Marketplace GST
        # --------------------------------------------------------

        commission_gst = self.calculate_commission_gst(item)

        mp_gst = self.calculate_mp_gst(item)

        # --------------------------------------------------------
        # GST
        # --------------------------------------------------------

        gst_percentage = self.calculate_gst_percentage(item)

        taxable_value = self.calculate_taxable_value(
            net_sales=net_sales,
            gst_percentage=gst_percentage,
        )

        gst_to_pay = self.calculate_gst_to_pay(item)

        igst_amount = self._decimal(item.igst_amount)

        cgst_amount = self._decimal(item.cgst_amount)

        sgst_amount = self._decimal(item.sgst_amount)

        cess_amount = self._decimal(item.cess_amount)

        # --------------------------------------------------------
        # TCS / TDS
        # --------------------------------------------------------

        tcs = self.calculate_tcs(item)

        tds_breakdown = self.calculate_tds_breakdown(item)

        tds_194o = tds_breakdown["tds_194o"]

        tds_194q = tds_breakdown["tds_194q"]

        tds = tds_breakdown["tds"]

        # --------------------------------------------------------
        # Claims / Product Cost
        # --------------------------------------------------------

        claims = self.calculate_claims(item)

        product_cost = self.calculate_product_cost(item)

        # --------------------------------------------------------
        # Return %
        # --------------------------------------------------------

        return_percentage = self.calculate_return_percentage(
            gross_qty=gross_qty,
            return_qty=return_qty,
        )

        # --------------------------------------------------------
        # Profit
        # --------------------------------------------------------

        profit = self.calculate_profit(
            net_sales=net_sales,
            mp_fees=mp_fees,
            mp_gst=mp_gst,
            tcs=tcs,
            tds=tds,
            product_cost=product_cost,
            claims=claims,
        )

        profit_percentage = self.calculate_profit_percentage(
            profit=profit,
            net_sales=net_sales,
        )

        # --------------------------------------------------------
        # Final result
        # --------------------------------------------------------

        return {
            # ====================================================
            # Quantity
            # ====================================================
            "gross_qty": gross_qty,
            "return_qty": return_qty,
            "cancelled_qty": cancelled_qty,
            "net_qty": net_qty,
            "return_percentage": return_percentage,
            # ====================================================
            # Sales
            # ====================================================
            "gross_sales": gross_sales,
            "net_sales": net_sales,
            "promo_discount": promo_discount,
            # ====================================================
            # Marketplace Fees
            # ====================================================
            "commission": commission,
            "storage": storage,
            "mp_fees": mp_fees,
            # ====================================================
            # Shipping
            # ====================================================
            "shipping": shipping,
            "shipping_gst": shipping_gst,
            # ====================================================
            # Marketplace GST
            # ====================================================
            "commission_gst": commission_gst,
            "mp_gst": mp_gst,
            # ====================================================
            # GST Percentages
            # ====================================================
            "igst_percent": (gst_percentage["igst_percent"]),
            "cgst_percent": (gst_percentage["cgst_percent"]),
            "sgst_percent": (gst_percentage["sgst_percent"]),
            "cess_percent": (gst_percentage["cess_percent"]),
            # ====================================================
            # GST
            # ====================================================
            "taxable_value": taxable_value,
            "gst_to_pay": gst_to_pay,
            "igst_amount": igst_amount,
            "cgst_amount": cgst_amount,
            "sgst_amount": sgst_amount,
            "cess_amount": cess_amount,
            # ====================================================
            # TCS / TDS
            # ====================================================
            "tcs": tcs,
            "tds_194o": tds_194o,
            "tds_194q": tds_194q,
            "tds": tds,
            # ====================================================
            # Claims / Cost
            # ====================================================
            "claims": claims,
            "product_cost": product_cost,
            # ====================================================
            # Profit
            # ====================================================
            "profit": profit,
            "profit_percentage": profit_percentage,
        }
