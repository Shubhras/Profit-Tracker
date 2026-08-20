from collections import defaultdict
from decimal import Decimal, InvalidOperation

from myntra.models import (
    MyntraListing,
    MyntraOrder,
    MyntraPaymentTransaction,
    MyntraReturn,
)

ZERO = Decimal(0)
HUNDRED = Decimal(100)
MP_GST_RATE = Decimal(18)


class MyntraProfitCalculator:
    """
    Central calculation service for Myntra Profit.

    Responsibilities:
    - Load Myntra data for the selected Profit date range.
    - Build payment / return lookup maps.
    - Calculate sales, fees, shipping and taxes.
    - Calculate expected settlement and profit.

    Important:
    RTO / Courier Return zero-profit business rules are NOT
    handled here.

    Those rules belong to the reporting layers:
        OrderSummary
        SKUSummary
        StyleSummary

    This calculator only calculates financial values.
    """

    def __init__(self, user, filters):
        from user_auth.models import get_effective_user
        self.user = get_effective_user(user)
        self.filters = filters or {}

    # =====================================================
    # HELPERS
    # =====================================================

    @staticmethod
    def _decimal(value):
        """
        Safely convert report/raw-data values to Decimal.

        Handles:
        - None
        - ""
        - "NA"
        - numeric strings
        - int / float
        - Decimal

        Invalid values become Decimal("0").
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
        except (InvalidOperation, ValueError, TypeError):
            return ZERO

    @staticmethod
    def _order_type(payment):
        """
        Normalize Myntra payment transaction direction.
        """

        return (payment.order_type or "").strip().lower()

    # =====================================================
    # DATA LOADERS
    # =====================================================

    def get_orders(self):
        """
        Orders are the source of truth for the Profit
        report's selected date range.

        Date filter:
            MyntraOrder.created_on
        """

        orders = MyntraOrder.objects.filter(user=self.user)

        start_date = self.filters.get("fromDate")
        end_date = self.filters.get("toDate")

        if start_date:
            orders = orders.filter(created_on__date__gte=start_date)

        if end_date:
            orders = orders.filter(created_on__date__lte=end_date)

        return orders.order_by("-created_on")

    def get_payments(self):
        """
        Return all available Myntra payment transactions
        for the user.

        We intentionally do NOT filter payment_date using
        the Profit date range.

        Profit is order-date based. A June order may settle
        in July, so payment transactions are joined later
        using order_line_id.
        """

        return MyntraPaymentTransaction.objects.filter(
            myntra_connection__user=self.user
        )

    def get_returns(self):
        """
        Return records belonging to orders currently
        included in the Profit date range.
        """

        orders = self.get_orders()

        order_line_ids = orders.values_list(
            "order_line_id",
            flat=True,
        )

        return MyntraReturn.objects.filter(
            myntra_connection__user=self.user,
            order_line_id__in=order_line_ids,
        )

    def get_listings(self):
        """
        Myntra listings.

        Product cost / user configuration can eventually
        be joined through listing/SKU data.
        """

        return MyntraListing.objects.filter(myntra_connection__user=self.user)

    # =====================================================
    # LOOKUP MAPS
    # =====================================================

    def build_payment_map(self, payments):
        """
        order_line_id -> payment transactions
        """

        payment_map = defaultdict(list)

        for payment in payments:
            if not payment.order_line_id:
                continue

            payment_map[payment.order_line_id].append(payment)

        return payment_map

    def build_return_map(self, returns):
        """
        order_line_id -> return records
        """

        return_map = defaultdict(list)

        for item in returns:
            if not item.order_line_id:
                continue

            return_map[item.order_line_id].append(item)

        return return_map

    # =====================================================
    # ORDER / SALES CALCULATIONS
    # =====================================================

    def calculate_gross_qty(self, orders):
        """
        One MyntraOrder row currently represents
        one ordered unit.
        """

        return len(orders)

    def calculate_gross_sales(self, orders):
        """
        Gross Sales = sum(order.final_amount)
        """

        return sum((order.final_amount or ZERO) for order in orders)

    def calculate_promo_discount(self, orders):
        """
        Myntra platform/coupon funded discount.

        Order report source:
            coupon_discount

        Payment report equivalent:
            platform_discount

        Profit currently uses the Order report value.
        """

        return sum((order.coupon_discount or ZERO) for order in orders)

    # =====================================================
    # ACTUAL SETTLEMENT
    # =====================================================

    def calculate_final_net_sales(self, payments):
        """
        Actual settlement received / reversed by Myntra.

        Forward settlements are normally positive.
        Reverse settlements are normally negative.

        We preserve Myntra's reported sign.
        """

        return sum((payment.settled_amount or ZERO) for payment in payments)

    # =====================================================
    # MARKETPLACE FEES
    # =====================================================

    def calculate_mp_fee_breakdown(self, payments):
        """
        Marketplace fee breakdown.

        Includes:
            commission
            fixed_fee
            pick_and_pack_fee
            payment_gateway_fee

        Does NOT include:
            shipping_fee
            logistics_commission
            MP GST
            TCS
            TDS

        Commission:
            Forward -> fee
            Reverse -> commission reversal

        Other fees:
            Currently kept according to the reported
            transaction until more reverse examples are
            available for validation.
        """

        commission = ZERO
        fixed_fee = ZERO
        pick_and_pack_fee = ZERO
        payment_gateway_fee = ZERO

        for payment in payments:
            order_type = self._order_type(payment)

            payment_commission = payment.commission or ZERO

            payment_fixed_fee = payment.fixed_fee or ZERO

            payment_pick_pack = payment.pick_and_pack_fee or ZERO

            payment_gateway = payment.payment_gateway_fee or ZERO

            if order_type == "forward":
                commission += payment_commission
                fixed_fee += payment_fixed_fee
                pick_and_pack_fee += payment_pick_pack
                payment_gateway_fee += payment_gateway

            elif order_type == "reverse":
                # Reverse transaction reverses the
                # original commission.
                commission -= payment_commission

                # Do not assume these reverse until
                # Myntra samples prove otherwise.
                fixed_fee += payment_fixed_fee
                pick_and_pack_fee += payment_pick_pack
                payment_gateway_fee += payment_gateway

        return {
            "commission": commission,
            "fixed_fee": fixed_fee,
            "pick_and_pack_fee": pick_and_pack_fee,
            "payment_gateway_fee": payment_gateway_fee,
        }

    def calculate_mp_fees(self, payments):
        """
        Net marketplace fees.

        Shipping/logistics and taxes are deliberately
        excluded.
        """

        breakdown = self.calculate_mp_fee_breakdown(payments)

        return (
            breakdown["commission"]
            + breakdown["fixed_fee"]
            + breakdown["pick_and_pack_fee"]
            + breakdown["payment_gateway_fee"]
        )

    # =====================================================
    # SHIPPING / LOGISTICS
    # =====================================================

    def calculate_shipping_breakdown(self, payments):
        """
        Myntra shipping/logistics breakdown.

        shipping_fee:
            Myntra's reported shipping field.

        logistics_commission:
            Logistics component validated as affecting
            settlement.

        These are kept separate so Reconciliation can
        expose the exact Myntra components.
        """

        forward_shipping = ZERO
        reverse_shipping = ZERO

        forward_logistics = ZERO
        reverse_logistics = ZERO

        for payment in payments:
            order_type = self._order_type(payment)

            shipping = payment.shipping_fee or ZERO

            logistics = payment.logistics_commission or ZERO

            if order_type == "forward":
                forward_shipping += shipping
                forward_logistics += logistics

            elif order_type == "reverse":
                reverse_shipping += shipping
                reverse_logistics += logistics

        return {
            "forward_shipping": forward_shipping,
            "reverse_shipping": reverse_shipping,
            "forward_logistics": forward_logistics,
            "reverse_logistics": reverse_logistics,
        }

    def calculate_shipping_fees(self, payments):
        """
        Profit-level Shipping value.

        Current validated settlement-impacting component:

            logistics_commission

        Therefore:

            Shipping =
                Forward Logistics
                + Reverse Logistics

        shipping_fee remains exposed separately in the
        breakdown for Reconciliation.
        """

        breakdown = self.calculate_shipping_breakdown(payments)

        return breakdown["forward_logistics"] + breakdown["reverse_logistics"]

    # =====================================================
    # MARKETPLACE GST
    # =====================================================

    def calculate_mp_gst(
        self,
        mp_fees,
        shipping_fees,
    ):
        """
        Marketplace GST.

        Current common Profit convention:

            MP GST =
                (MP Fees + Shipping) * 18%

        This follows the convention currently used by
        the Amazon Profit module.
        """

        mp_fees = mp_fees or ZERO
        shipping_fees = shipping_fees or ZERO

        fee_base = mp_fees + shipping_fees

        return fee_base * MP_GST_RATE / HUNDRED

    # =====================================================
    # CLAIM
    # =====================================================

    def calculate_claims(self, payments):
        """
        Claims/ForwardAutoSPF.

        Currently it is considered that the ForwardAutoSPF in NOD
        type transactions which contains order_line_id is claim
        """
        
        claim_amount = ZERO

        for payment in payments:
            order_type = (payment.order_type or "").strip().lower()
            nod_comment = (payment.nod_comment or "").strip().lower()

            if (
                order_type == "nod"
                and nod_comment == "forwardautospf"
                and payment.order_line_id
            ):
                claim_amount += payment.settled_amount or ZERO

        return claim_amount

    # =====================================================
    # TCS
    # =====================================================

    def calculate_tcs(self, payments):
        """
        Net TCS.

        Forward -> add
        Reverse -> subtract
        """

        total = ZERO

        for payment in payments:
            amount = (
                (payment.igst_tcs or ZERO)
                + (payment.cgst_tcs or ZERO)
                + (payment.sgst_tcs or ZERO)
            )

            order_type = self._order_type(payment)

            if order_type == "forward":
                total += amount

            elif order_type == "reverse":
                total -= amount

        return total

    # =====================================================
    # TDS
    # =====================================================

    def calculate_tds(self, payments):
        """
        Net TDS.

        Forward -> add
        Reverse -> subtract

        TDS is exposed in the response but is currently
        NOT part of the Profit formula.
        """

        total = ZERO

        for payment in payments:
            amount = payment.tds or ZERO

            order_type = self._order_type(payment)

            if order_type == "forward":
                total += amount

            elif order_type == "reverse":
                total -= amount

        return total

    # =====================================================
    # TAXABLE VALUE
    # =====================================================

    def calculate_taxable_value(self, payments):
        """
        Net taxable value from Myntra payment report.

        Source:
            raw_data["taxable_amount"]

        Forward -> add
        Reverse -> subtract
        """

        total = ZERO

        for payment in payments:
            raw = payment.raw_data or {}

            taxable_amount = self._decimal(raw.get("taxable_amount"))

            order_type = self._order_type(payment)

            if order_type == "forward":
                total += taxable_amount

            elif order_type == "reverse":
                total -= taxable_amount

        return total

    # =====================================================
    # GST TO PAY
    # =====================================================

    def calculate_gst_to_pay(self, payments):
        """
        Net sales GST from Myntra payment report.

        Sources:
            raw_data["igst_amount"]
            raw_data["cgst_amount"]
            raw_data["sgst_amount"]

        Forward -> add
        Reverse -> subtract
        """

        total = ZERO

        for payment in payments:
            raw = payment.raw_data or {}

            gst = (
                self._decimal(raw.get("igst_amount"))
                + self._decimal(raw.get("cgst_amount"))
                + self._decimal(raw.get("sgst_amount"))
            )

            order_type = self._order_type(payment)

            if order_type == "forward":
                total += gst

            elif order_type == "reverse":
                total -= gst

        return total

    # =====================================================
    # GST RATE
    # =====================================================

    def calculate_gst_percentage(self, payments):
        """
        GST rate reported by Myntra.

        Source:
            raw_data["tax_rate"]

        Order level:
            Normally returns the Forward transaction rate.

        SKU / Style level:
            If multiple GST rates exist, return an
            effective rate based on Forward taxable value.

        This avoids arbitrarily returning whichever
        payment transaction happened to appear first.
        """

        rates = set()

        total_taxable = ZERO
        total_gst = ZERO

        for payment in payments:
            if self._order_type(payment) != "forward":
                continue

            raw = payment.raw_data or {}

            tax_rate = self._decimal(raw.get("tax_rate"))

            taxable_amount = self._decimal(raw.get("taxable_amount"))

            gst_amount = (
                self._decimal(raw.get("igst_amount"))
                + self._decimal(raw.get("cgst_amount"))
                + self._decimal(raw.get("sgst_amount"))
            )

            if tax_rate:
                rates.add(tax_rate)

            total_taxable += taxable_amount
            total_gst += gst_amount

        # No GST data
        if not rates:
            return ZERO

        # All transactions use same GST rate
        if len(rates) == 1:
            return next(iter(rates))

        # Mixed GST rates:
        # return effective GST percentage.
        if total_taxable != ZERO:
            return total_gst / total_taxable * HUNDRED

        return ZERO

    # =====================================================
    # EXPECTED SETTLEMENT
    # =====================================================

    def calculate_expected_settlement(
        self,
        net_sales,
        mp_fees,
        shipping_fees,
        ad_spend,
        mp_gst,
        claim_amount,
        promo_discount,
        tcs,
    ):
        """
        Expected Settlement

        Common formula:

            Net Sales
            + MP Fees
            + Shipping
            + Ad Spend
            - MP GST
            - Claim
            - Promo
            + TCS

        Myntra fee/shipping/ad inputs are stored as
        expense amounts.

        Therefore positive expenses are converted to
        negative values before applying the common
        formula.

        IMPORTANT:
        Do not use abs() here.

        A negative MP fee may legitimately represent
        a net fee reversal. Using abs() would destroy
        that direction.
        """

        net_sales = net_sales or ZERO
        mp_fees = mp_fees or ZERO
        shipping_fees = shipping_fees or ZERO
        ad_spend = ad_spend or ZERO
        mp_gst = mp_gst or ZERO
        claim_amount = claim_amount or ZERO
        promo_discount = promo_discount or ZERO
        tcs = tcs or ZERO

        signed_mp_fees = -mp_fees
        signed_shipping = -shipping_fees
        signed_ads = -ad_spend

        return (
            net_sales
            + signed_mp_fees
            + signed_shipping
            + signed_ads
            - mp_gst
            - claim_amount
            - promo_discount
            + tcs
        )

    # =====================================================
    # PROFIT
    # =====================================================

    def calculate_profit(
        self,
        net_sales,
        mp_fees,
        shipping_fees,
        ad_spend,
        mp_gst,
        product_cost,
        claim_amount,
        promo_discount,
        gst_to_pay,
        tcs,
    ):
        """
        Profit

        Common formula:

            Net Sales
            + MP Fees
            + Shipping
            + Ad Spend
            - MP GST
            - Product Cost
            - Claim
            - Promo
            - GST To Pay
            + TCS

        Myntra MP Fees / Shipping / Ads are represented
        as expense amounts, therefore their signs are
        normalized for the common Profit formula.

        Product Cost, Claim, Promo and GST To Pay are
        direct deductions.

        IMPORTANT:
        Do not use abs() for MP Fees / Shipping because
        legitimate reversals must retain direction.
        """

        net_sales = net_sales or ZERO
        mp_fees = mp_fees or ZERO
        shipping_fees = shipping_fees or ZERO
        ad_spend = ad_spend or ZERO
        mp_gst = mp_gst or ZERO
        product_cost = product_cost or ZERO
        claim_amount = claim_amount or ZERO
        promo_discount = promo_discount or ZERO
        gst_to_pay = gst_to_pay or ZERO
        tcs = tcs or ZERO

        signed_mp_fees = -mp_fees
        signed_shipping = -shipping_fees
        signed_ads = -ad_spend

        return (
            net_sales
            + signed_mp_fees
            + signed_shipping
            + signed_ads
            - mp_gst
            - product_cost
            - claim_amount
            - promo_discount
            - gst_to_pay
            + tcs
        )

    # =====================================================
    # PROFIT %
    # =====================================================

    def calculate_profit_percentage(
        self,
        profit,
        net_sales,
        gross_sales=ZERO,
    ):
        """
        Profit percentage.

        Normal order / aggregate:
            Profit / Net Sales * 100

        Fully returned order / aggregate:
            Profit / Gross Sales * 100

        Using Gross Sales for a fully returned order
        allows customer-return losses to appear as
        negative percentages.

        RTO zero-profit behavior is handled by the
        Summary layer, not here.
        """

        profit = profit or ZERO
        net_sales = net_sales or ZERO
        gross_sales = gross_sales or ZERO

        if net_sales != ZERO:
            return profit / net_sales * HUNDRED

        if gross_sales != ZERO:
            return profit / gross_sales * HUNDRED

        return ZERO

    # =====================================================
    # RETURN CLASSIFICATION
    # =====================================================

    def classify_return(self, return_item):
        """
        Normalize Myntra return types into internal
        Profit categories.

        Current validated mappings:

            RTO
                -> COURIER_RETURN

            Return
                -> CUSTOMER_RETURN

        Unknown/future Myntra return types such as
        Exchange are intentionally NOT guessed.
        """

        if not return_item:
            return None

        return_type = (return_item.type or "").strip().upper()

        if return_type == "RTO":
            return "COURIER_RETURN"

        if return_type == "RETURN":
            return "CUSTOMER_RETURN"

        return return_type or None
