from collections import defaultdict
from decimal import Decimal
from myntra.services.profit.myntra_fee_calculator import (
    get_myntra_fee_rules,
    calculate_myntra_estimated_fees,
)


class SKUSummary:
    """
    Style -> Seller SKU Summary

    Aggregates Myntra Profit data at Seller SKU level.
    """

    def __init__(self, calculator):
        self.calculator = calculator

    def execute(self, style_id=None):
        """
        Entry point for SKU Summary.
        """

        orders = self.calculator.get_orders()
        payments = self.calculator.get_payments()
        returns = self.calculator.get_returns()

        # ==========================================
        # LOOKUP MAPS
        # ==========================================

        sku_map = self.build_sku_map(
            orders,
            style_id=style_id,
        )

        payment_map = self.calculator.build_payment_map(payments)

        return_map = self.calculator.build_return_map(returns)

        return self.build_sku_summary(
            sku_map=sku_map,
            payment_map=payment_map,
            return_map=return_map,
        )

    def build_sku_map(
        self,
        orders,
        style_id=None,
    ):
        """
        Group all orders belonging to a Style
        by Seller SKU.
        """

        sku_map = defaultdict(list)

        for order in orders:
            if style_id is not None and order.style_id != style_id:
                continue

            sku_map[order.seller_sku_code].append(order)

        return sku_map

    def build_sku_summary(
        self,
        sku_map,
        payment_map,
        return_map,
    ):
        """
        Build one summary row per Seller SKU.

        Aggregates:
        - Quantity
        - Returns
        - Sales
        - Actual settlement
        - Promo
        - Marketplace fees
        - Shipping
        - Taxes
        - Expected settlement
        - Profit
        """

        response = []
        fee_rules = get_myntra_fee_rules(self.calculator.user)
        listing_tds_map = self.calculator.build_listing_tds_map()
        listing_tcs_map = self.calculator.build_listing_tcs_map()
        article_type_map = self.calculator.build_article_type_map()

        for seller_sku, sku_orders in sku_map.items():
            first_order = sku_orders[0]

            # ==========================================
            # SKU PAYMENTS
            # ==========================================

            sku_payments = []

            for order in sku_orders:
                sku_payments.extend(
                    payment_map.get(
                        order.order_line_id,
                        [],
                    )
                )

            finance_data_available = bool(sku_payments)

            # ==========================================
            # QUANTITY
            # ==========================================

            gross_qty = self.calculator.calculate_gross_qty(sku_orders) or 0

            return_qty = 0

            courier_return_count = 0
            customer_return_count = 0

            return_types = set()

            # ==========================================
            # SALES
            # ==========================================

            gross_sales = self.calculator.calculate_gross_sales(sku_orders) or Decimal(
                0
            )

            net_sales = Decimal(0)

            promo_discount = Decimal(0)

            # ==========================================
            # ORDER-LEVEL RETURN AGGREGATION
            # ==========================================

            for order in sku_orders:
                order_returns = return_map.get(
                    order.order_line_id,
                    [],
                )

                order_return_qty = sum((item.quantity or 0) for item in order_returns)

                return_qty += order_return_qty

                # --------------------------------------
                # NET SALES
                # --------------------------------------

                order_gross_sales = self.calculator.calculate_gross_sales(
                    [order]
                ) or Decimal(0)

                # --------------------------------------
                # NORMAL ORDER
                # --------------------------------------

                if order_return_qty == 0:
                    net_sales += order_gross_sales

                    # ----------------------------------
                    # PROMOTION
                    # ----------------------------------I

                    promo_discount += self.calculator.calculate_promo_discount(
                        [order]
                    ) or Decimal(0)

                # --------------------------------------
                # RETURN TYPES
                # --------------------------------------

                for return_item in order_returns:
                    qty = return_item.quantity or 0

                    return_category = self.calculator.classify_return(return_item)

                    if return_category == "COURIER_RETURN":
                        courier_return_count += qty

                    elif return_category == "CUSTOMER_RETURN":
                        customer_return_count += qty

                    if return_item.type:
                        return_types.add(return_item.type)

            # ==========================================
            # NET QTY
            # ==========================================

            net_qty = max(
                gross_qty - return_qty,
                0,
            )

            # ==========================================
            # RETURN %
            # ==========================================

            if gross_qty > 0:
                return_percentage = (
                    Decimal(str(return_qty)) / Decimal(str(gross_qty)) * Decimal(100)
                )
            else:
                return_percentage = Decimal(0)

            # ==========================================
            # ACTUAL SETTLEMENT
            # ==========================================

            final_net_sales = self.calculator.calculate_final_net_sales(
                sku_payments
            ) or Decimal(0)

            # ==========================================
            # MARKETPLACE FEES
            # ==========================================

            mp_fee_breakdown = self.calculator.calculate_mp_fee_breakdown(sku_payments)

            commission = mp_fee_breakdown.get("commission") or Decimal(0)

            fixed_fee = mp_fee_breakdown.get("fixed_fee") or Decimal(0)

            pick_and_pack_fee = mp_fee_breakdown.get("pick_and_pack_fee") or Decimal(0)

            payment_gateway_fee = mp_fee_breakdown.get(
                "payment_gateway_fee"
            ) or Decimal(0)

            mp_fees = self.calculator.calculate_mp_fees(sku_payments) or Decimal(0)

            # ==========================================
            # ESTIMATED MARKETPLACE FEES (RATE CARDS)
            # ==========================================
            sku_estimated_fees = Decimal(0)
            sku_estimated_commission = Decimal(0)
            sku_estimated_fixed_fee = Decimal(0)
            sku_estimated_return_fee = Decimal(0)
            sku_estimated_marketing_fee = Decimal(0)
            sku_estimated_shipping_fee = Decimal(0)
            sku_other_estimated_fees = Decimal(0)
            sku_has_rules = False

            for order in sku_orders:
                order_returns = return_map.get(order.order_line_id, [])
                order_return_qty = sum((item.quantity or 0) for item in order_returns)
                order_is_return = order_return_qty > 0

                order_courier_return_count = 0
                order_customer_return_count = 0
                for return_item in order_returns:
                    ret_cat = self.calculator.classify_return(return_item)
                    qty = return_item.quantity or 0
                    if ret_cat == "COURIER_RETURN":
                        order_courier_return_count += qty
                    elif ret_cat == "CUSTOMER_RETURN":
                        order_customer_return_count += qty

                order_is_courier_return = (
                    order_courier_return_count > 0 and order_customer_return_count == 0
                )
                order_is_customer_return = order_customer_return_count > 0

                order_gross_sales = self.calculator.calculate_gross_sales([order]) or Decimal(0)

                order_article_type = (getattr(order, "article_type", "") or "").strip()
                if not order_article_type:
                    order_article_type = (
                        article_type_map.get(str(order.seller_sku_code))
                        or article_type_map.get(str(order.style_id))
                        or ""
                    )

                est = calculate_myntra_estimated_fees(
                    gross_sales=order_gross_sales,
                    gross_qty=1,
                    article_type=order_article_type,
                    style_name=getattr(order, "style_name", "") or "",
                    is_return=order_is_return,
                    return_qty=order_return_qty,
                    is_courier_return=order_is_courier_return,
                    is_customer_return=order_is_customer_return,
                    rules=fee_rules,
                )
                if est is not None:
                    sku_has_rules = True
                    sku_estimated_fees += est["total_estimated_fees"]
                    sku_estimated_commission += est["estimated_commission"]
                    sku_estimated_fixed_fee += est["estimated_fixed_fee"]
                    sku_estimated_return_fee += est.get("estimated_return_fee", Decimal(0))
                    sku_estimated_marketing_fee += est.get("estimated_marketing_fee", Decimal(0))
                    sku_estimated_shipping_fee += est.get("estimated_shipping_fee", Decimal(0))
                    sku_other_estimated_fees += est.get("other_estimated_fees", Decimal(0))

            if not sku_has_rules:
                sku_estimated_fees = Decimal(0)
                sku_estimated_commission = Decimal(0)
                sku_estimated_fixed_fee = Decimal(0)
                sku_estimated_return_fee = Decimal(0)
                sku_estimated_marketing_fee = Decimal(0)
                sku_estimated_shipping_fee = Decimal(0)
                sku_other_estimated_fees = Decimal(0)

            if finance_data_available:
                actual_fees = mp_fees
                fees_leaks = max(Decimal(0), actual_fees - sku_estimated_fees)
            else:
                actual_fees = Decimal(0)
                fees_leaks = Decimal(0)

            # ==========================================
            # SHIPPING
            # ==========================================

            shipping_breakdown = self.calculator.calculate_shipping_breakdown(
                sku_payments
            )

            forward_shipping = shipping_breakdown.get("forward_shipping") or Decimal(0)

            reverse_shipping = shipping_breakdown.get("reverse_shipping") or Decimal(0)

            forward_logistics = shipping_breakdown.get("forward_logistics") or Decimal(
                0
            )

            reverse_logistics = shipping_breakdown.get("reverse_logistics") or Decimal(
                0
            )

            shipping_fees = self.calculator.calculate_shipping_fees(
                sku_payments
            ) or Decimal(0)

            # ==========================================
            # TAXES
            # ==========================================

            mp_gst = self.calculator.calculate_mp_gst(
                mp_fees,
                shipping_fees,
            ) or Decimal(0)

            actual_tcs = (
                self.calculator.calculate_tcs(sku_payments) or Decimal(0)
            ) if finance_data_available else Decimal(0)

            actual_tds = (
                self.calculator.calculate_tds(sku_payments) or Decimal(0)
            ) if finance_data_available else Decimal(0)

            taxable_value = self.calculator.calculate_taxable_value(
                sku_payments
            ) or Decimal(0)

            gst_to_pay_amount = self.calculator.calculate_gst_to_pay(
                sku_payments
            ) or Decimal(0)

            # ------------------------------------------
            # EXPECTED TCS / TDS & LEAKS
            # ------------------------------------------
            sku_style_id = getattr(first_order, "style_id", None)
            tds_rate = (
                listing_tds_map.get(str(seller_sku))
                or (listing_tds_map.get(str(sku_style_id)) if sku_style_id else None)
                or Decimal(0)
            )
            tcs_rate = (
                listing_tcs_map.get(str(seller_sku))
                or (listing_tcs_map.get(str(sku_style_id)) if sku_style_id else None)
                or Decimal(0)
            )

            effective_taxable = taxable_value
            if effective_taxable <= Decimal(0) and net_sales > Decimal(0):
                effective_taxable = net_sales

            if net_qty > 0 and effective_taxable > Decimal(0):
                if tds_rate > Decimal(0):
                    tds = round(effective_taxable * (tds_rate / Decimal("100")), 2)
                else:
                    tds = Decimal(0)

                if tcs_rate > Decimal(0):
                    tcs = round(effective_taxable * (tcs_rate / Decimal("100")), 2)
                else:
                    tcs = Decimal(0)
            else:
                tds = Decimal(0)
                tcs = Decimal(0)

            tcs_leaks = round(tcs - actual_tcs, 2)
            tds_leaks = round(tds - actual_tds, 2)

            # ==========================================
            # GST %
            # ==========================================
            #
            # A SKU normally has one GST rate.
            # Calculator currently gets the rate from
            # the Forward payment transaction.
            # ==========================================

            gst_to_pay_perc = self.calculator.calculate_gst_percentage(
                sku_payments
            ) or Decimal(0)

            # ==========================================
            # CLAIMS
            # ==========================================

            claim_amount = self.calculator.calculate_claims(sku_payments) or Decimal(0)

            # ==========================================
            # FUTURE DATA SOURCES
            # ==========================================

            ads = Decimal(0)

            product_cost = Decimal(0)

            # ==========================================
            # EXPECTED SETTLEMENT / PROFIT
            # ==========================================
            #
            # IMPORTANT:
            #
            # Do NOT calculate this directly from the
            # aggregated SKU totals.
            #
            # Courier-return orders must contribute
            # ZERO profit/expected settlement, while
            # normal orders and customer returns use
            # the normal formula.
            #
            # Therefore calculate each order's
            # contribution and then aggregate it.
            # ==========================================

            expected_settlement = Decimal(0)
            profit = Decimal(0)

            for order in sku_orders:
                # --------------------------------------
                # ORDER PAYMENTS
                # --------------------------------------

                order_payments = payment_map.get(
                    order.order_line_id,
                    [],
                )

                # --------------------------------------
                # ORDER RETURNS
                # --------------------------------------

                order_returns = return_map.get(
                    order.order_line_id,
                    [],
                )

                order_return_qty = sum((item.quantity or 0) for item in order_returns)

                order_courier_return_count = 0
                order_customer_return_count = 0

                for return_item in order_returns:
                    qty = return_item.quantity or 0

                    category = self.calculator.classify_return(return_item)

                    if category == "COURIER_RETURN":
                        order_courier_return_count += qty

                    elif category == "CUSTOMER_RETURN":
                        order_customer_return_count += qty

                # --------------------------------------
                # PURE COURIER RETURN / RTO
                # --------------------------------------

                is_order_courier_return = (
                    order_courier_return_count > 0 and order_customer_return_count == 0
                )

                # --------------------------------------
                # RTO CONTRIBUTES ZERO
                # --------------------------------------

                if is_order_courier_return:
                    continue

                # --------------------------------------
                # ORDER SALES
                # --------------------------------------

                order_gross_sales = self.calculator.calculate_gross_sales(
                    [order]
                ) or Decimal(0)

                order_net_sales = (
                    order_gross_sales if order_return_qty == 0 else Decimal(0)
                )

                # --------------------------------------
                # ORDER PROMOTION
                # --------------------------------------

                if order_return_qty > 0:
                    order_promo_discount = Decimal(0)
                else:
                    order_promo_discount = self.calculator.calculate_promo_discount(
                        [order]
                    ) or Decimal(0)

                # --------------------------------------
                # ORDER FEES
                # --------------------------------------

                order_mp_fees = self.calculator.calculate_mp_fees(
                    order_payments
                ) or Decimal(0)

                order_shipping_fees = self.calculator.calculate_shipping_fees(
                    order_payments
                ) or Decimal(0)

                order_mp_gst = self.calculator.calculate_mp_gst(
                    order_mp_fees,
                    order_shipping_fees,
                ) or Decimal(0)

                # --------------------------------------
                # ORDER TAX
                # --------------------------------------

                order_tcs = self.calculator.calculate_tcs(order_payments) or Decimal(0)

                order_gst_to_pay = self.calculator.calculate_gst_to_pay(
                    order_payments
                ) or Decimal(0)

                # --------------------------------------
                # FUTURE ORDER VALUES
                # --------------------------------------

                order_ads = Decimal(0)
                order_claim_amount = Decimal(0)
                order_product_cost = Decimal(0)

                # --------------------------------------
                # EXPECTED SETTLEMENT
                # --------------------------------------

                order_expected_settlement = (
                    self.calculator.calculate_expected_settlement(
                        net_sales=order_net_sales,
                        mp_fees=order_mp_fees,
                        shipping_fees=order_shipping_fees,
                        ad_spend=order_ads,
                        mp_gst=order_mp_gst,
                        claim_amount=order_claim_amount,
                        promo_discount=order_promo_discount,
                        tcs=order_tcs,
                    )
                    or Decimal(0)
                )

                expected_settlement += order_expected_settlement

                # --------------------------------------
                # PROFIT
                # --------------------------------------

                order_profit = self.calculator.calculate_profit(
                    net_sales=order_net_sales,
                    mp_fees=order_mp_fees,
                    shipping_fees=order_shipping_fees,
                    ad_spend=order_ads,
                    mp_gst=order_mp_gst,
                    product_cost=order_product_cost,
                    claim_amount=order_claim_amount,
                    promo_discount=order_promo_discount,
                    gst_to_pay=order_gst_to_pay,
                    tcs=order_tcs,
                ) or Decimal(0)

                profit += order_profit

            # ==========================================
            # PROFIT %
            # ==========================================

            profit_percentage = self.calculator.calculate_profit_percentage(
                profit=profit,
                net_sales=net_sales,
                gross_sales=gross_sales,
            ) or Decimal(0)

            # ==========================================
            # RESPONSE
            # ==========================================

            response.append(
                {
                    # ----------------------------------
                    # PRODUCT
                    # ----------------------------------
                    "seller_sku": seller_sku,
                    "style_id": first_order.style_id,
                    "style_name": first_order.style_name,
                    "brand": first_order.brand,
                    # ----------------------------------
                    # DATA AVAILABILITY
                    # ----------------------------------
                    "finance_data_available": (finance_data_available),
                    # ----------------------------------
                    # QUANTITY
                    # ----------------------------------
                    "gross_qty": gross_qty,
                    "net_qty": net_qty,
                    # ----------------------------------
                    # RETURNS
                    # ----------------------------------
                    "is_return": return_qty > 0,
                    "returnqty": return_qty,
                    "return_percentage": round(
                        return_percentage,
                        2,
                    ),
                    "return_type": (
                        ", ".join(sorted(return_types)) if return_types else None
                    ),
                    "courier_return_count": (courier_return_count),
                    "customer_return_count": (customer_return_count),
                    # ----------------------------------
                    # SALES
                    # ----------------------------------
                    "gross_sales": gross_sales,
                    "net_sales": net_sales,
                    "final_net_sales": final_net_sales,
                    "promo_discount": promo_discount,
                    # ----------------------------------
                    # MARKETPLACE FEES
                    # ----------------------------------
                    "mp_fees": mp_fees,
                    "commission": commission,
                    "fixed_fee": fixed_fee,
                    "pick_and_pack_fee": pick_and_pack_fee,
                    "payment_gateway_fee": payment_gateway_fee,
                    "estimated_fees": sku_estimated_fees,
                    "estimated_commission": sku_estimated_commission,
                    "estimated_fixed_fee": sku_estimated_fixed_fee,
                    "estimated_return_fee": sku_estimated_return_fee,
                    "estimated_marketing_fee": sku_estimated_marketing_fee,
                    "estimated_shipping_fee": sku_estimated_shipping_fee,
                    "other_estimated_fees": sku_other_estimated_fees,
                    "actual_fees": actual_fees,
                    "fees_leaks": fees_leaks,
                    # ----------------------------------
                    # SHIPPING
                    # ----------------------------------
                    "shipping_fees": shipping_fees,
                    "forward_shipping": forward_shipping,
                    "reverse_shipping": reverse_shipping,
                    "forward_logistics": forward_logistics,
                    "reverse_logistics": reverse_logistics,
                    # ----------------------------------
                    # TAXES
                    # ----------------------------------
                    "mp_gst": mp_gst,
                    "tcs": tcs,
                    "actual_tcs": actual_tcs,
                    "tcs_leaks": tcs_leaks,
                    "tds": tds,
                    "actual_tds": actual_tds,
                    "tds_leaks": tds_leaks,
                    "taxable_value": taxable_value,
                    "gst_to_pay_amount": (gst_to_pay_amount),
                    "gst_to_pay_perc": (gst_to_pay_perc),
                    # ----------------------------------
                    # ADS
                    # ----------------------------------
                    "ads": ads,
                    # ----------------------------------
                    # CLAIMS
                    # ----------------------------------
                    "claim_amount": claim_amount,
                    # ----------------------------------
                    # EXPECTED SETTLEMENT
                    # ----------------------------------
                    "expected_settlement": (expected_settlement),
                    # ----------------------------------
                    # PRODUCT COST
                    # ----------------------------------
                    "product_cost": product_cost,
                    # ----------------------------------
                    # PROFIT
                    # ----------------------------------
                    "profit": profit,
                    "profit_percentage": round(
                        profit_percentage,
                        2,
                    ),
                }
            )

        return response
