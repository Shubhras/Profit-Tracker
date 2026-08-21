from collections import defaultdict
from decimal import Decimal


class StyleSummary:
    """
    Myntra Style Level Profit Summary.

    Aggregates all Seller SKUs and Orders belonging
    to the same Myntra Style.
    """

    def __init__(self, calculator):
        self.calculator = calculator

    def execute(self):
        """
        Entry point for Style Summary.
        """

        orders = self.calculator.get_orders()
        payments = self.calculator.get_payments()
        returns = self.calculator.get_returns()

        # ==========================================
        # LOOKUP MAPS
        # ==========================================

        style_map = self.build_style_map(orders)

        payment_map = self.calculator.build_payment_map(payments)

        return_map = self.calculator.build_return_map(returns)

        return self.build_style_summary(
            style_map=style_map,
            payment_map=payment_map,
            return_map=return_map,
        )

    def build_style_map(
        self,
        orders,
    ):
        """
        Group all orders by Style ID.
        """

        style_map = defaultdict(list)

        for order in orders:
            style_map[order.style_id].append(order)

        return style_map

    def build_style_summary(
        self,
        style_map,
        payment_map,
        return_map,
    ):
        """
        Build one summary row per Style.

        Aggregates:
        - Seller SKUs
        - Quantity
        - Returns
        - Sales
        - Actual settlement
        - Promo discount
        - Marketplace fees
        - Shipping
        - Taxes
        - Expected settlement
        - Profit
        """

        response = []

        for style_id, style_orders in style_map.items():
            first_order = style_orders[0]

            # ==========================================
            # SELLER SKUS
            # ==========================================

            seller_skus = {order.seller_sku_code for order in style_orders}

            # ==========================================
            # STYLE PAYMENTS
            # ==========================================

            style_payments = []

            for order in style_orders:
                style_payments.extend(
                    payment_map.get(
                        order.order_line_id,
                        [],
                    )
                )

            finance_data_available = bool(style_payments)

            # ==========================================
            # QUANTITY
            # ==========================================

            gross_qty = self.calculator.calculate_gross_qty(style_orders) or 0

            return_qty = 0

            courier_return_count = 0
            customer_return_count = 0

            return_types = set()

            # ==========================================
            # SALES
            # ==========================================

            gross_sales = self.calculator.calculate_gross_sales(
                style_orders
            ) or Decimal(0)

            net_sales = Decimal(0)

            promo_discount = Decimal(0)

            # ==========================================
            # ORDER RETURN / NET SALES / PROMO
            # AGGREGATION
            # ==========================================

            for order in style_orders:
                order_returns = return_map.get(
                    order.order_line_id,
                    [],
                )

                order_return_qty = sum((item.quantity or 0) for item in order_returns)

                return_qty += order_return_qty

                # --------------------------------------
                # ORDER SALES
                # --------------------------------------

                order_gross_sales = self.calculator.calculate_gross_sales(
                    [order]
                ) or Decimal(0)

                # Successful/non-returned orders
                # contribute to Net Sales.
                #
                # Customer Return / RTO contributes 0.
                if order_return_qty == 0:
                    net_sales += order_gross_sales

                    promo_discount += self.calculator.calculate_promo_discount(
                        [order]
                    ) or Decimal(0)

                # --------------------------------------
                # RETURN CLASSIFICATION
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
                style_payments
            ) or Decimal(0)

            # ==========================================
            # MARKETPLACE FEES
            # ==========================================

            mp_fee_breakdown = self.calculator.calculate_mp_fee_breakdown(
                style_payments
            )

            commission = mp_fee_breakdown.get("commission") or Decimal(0)

            fixed_fee = mp_fee_breakdown.get("fixed_fee") or Decimal(0)

            pick_and_pack_fee = mp_fee_breakdown.get("pick_and_pack_fee") or Decimal(0)

            payment_gateway_fee = mp_fee_breakdown.get(
                "payment_gateway_fee"
            ) or Decimal(0)

            mp_fees = self.calculator.calculate_mp_fees(style_payments) or Decimal(0)

            # ==========================================
            # SHIPPING
            # ==========================================

            shipping_breakdown = self.calculator.calculate_shipping_breakdown(
                style_payments
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
                style_payments
            ) or Decimal(0)

            # ==========================================
            # MARKETPLACE GST
            # ==========================================

            mp_gst = self.calculator.calculate_mp_gst(
                mp_fees,
                shipping_fees,
            ) or Decimal(0)

            # ==========================================
            # TCS / TDS
            # ==========================================

            tcs = self.calculator.calculate_tcs(style_payments) or Decimal(0)

            tds = self.calculator.calculate_tds(style_payments) or Decimal(0)

            # ==========================================
            # TAXABLE VALUE / GST TO PAY
            # ==========================================

            taxable_value = self.calculator.calculate_taxable_value(
                style_payments
            ) or Decimal(0)

            gst_to_pay_amount = self.calculator.calculate_gst_to_pay(
                style_payments
            ) or Decimal(0)

            # ==========================================
            # GST %
            # ==========================================

            gst_to_pay_perc = self.calculator.calculate_gst_percentage(
                style_payments
            ) or Decimal(0)

            # ==========================================
            # CLAIMS
            # ==========================================

            claim_amount = self.calculator.calculate_claims(style_payments) or Decimal(
                0
            )

            # ==========================================
            # FUTURE DATA SOURCES
            # ==========================================

            # Amazon Ads equivalent will be
            # integrated later.
            ads = Decimal(0)

            # User Product Cost configuration
            # will be integrated later.
            product_cost = Decimal(0)

            # ==========================================
            # EXPECTED SETTLEMENT / PROFIT
            # ==========================================
            #
            # IMPORTANT:
            #
            # Calculate these ORDER BY ORDER.
            #
            # We cannot calculate Style Profit directly
            # from the aggregated Style totals because
            # RTO / Courier Return orders must contribute
            # ZERO Profit and Expected Settlement.
            #
            # Normal orders and Customer Returns still
            # contribute their actual profit/loss.
            # ==========================================

            expected_settlement = Decimal(0)
            profit = Decimal(0)

            for order in style_orders:
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

                # RTO contributes ZERO to Profit
                # and Expected Settlement.
                #
                # Actual Myntra financial transactions
                # remain included in the aggregate fields
                # above for Reconciliation.
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
                # ORDER PROMOTION DISCOUNT
                # --------------------------------------

                if order_return_qty > 0:
                    order_promo_discount = Decimal(0)
                else:
                    order_promo_discount = self.calculator.calculate_promo_discount(
                        [order]
                    ) or Decimal(0)

                # --------------------------------------
                # ORDER MARKETPLACE FEES
                # --------------------------------------

                order_mp_fees = self.calculator.calculate_mp_fees(
                    order_payments
                ) or Decimal(0)

                # --------------------------------------
                # ORDER SHIPPING
                # --------------------------------------

                order_shipping_fees = self.calculator.calculate_shipping_fees(
                    order_payments
                ) or Decimal(0)

                # --------------------------------------
                # ORDER MP GST
                # --------------------------------------

                order_mp_gst = self.calculator.calculate_mp_gst(
                    order_mp_fees,
                    order_shipping_fees,
                ) or Decimal(0)

                # --------------------------------------
                # ORDER TCS
                # --------------------------------------

                order_tcs = self.calculator.calculate_tcs(order_payments) or Decimal(0)

                # --------------------------------------
                # ORDER GST TO PAY
                # --------------------------------------

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
            #
            # If Net Sales exists:
            #     Profit / Net Sales * 100
            #
            # If everything was returned:
            #     Profit / Gross Sales * 100
            #
            # This allows Customer Return losses to
            # remain negative.
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
                    "style_id": style_id,
                    "style_name": first_order.style_name,
                    "brand": first_order.brand,
                    "seller_sku_count": len(seller_skus),
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
                    "tds": tds,
                    "taxable_value": taxable_value,
                    "gst_to_pay_amount": gst_to_pay_amount,
                    "gst_to_pay_perc": gst_to_pay_perc,
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
                    "expected_settlement": expected_settlement,
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
