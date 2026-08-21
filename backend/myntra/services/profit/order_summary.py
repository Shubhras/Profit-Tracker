from decimal import Decimal


class OrderSummary:
    """
    Seller SKU -> Order Summary

    Myntra Order Level Profit report.
    """

    def __init__(self, calculator):
        self.calculator = calculator

    def execute(self, seller_sku=None, style_id=None):
        """
        Entry point for Order Summary.
        """

        orders = self.calculator.get_orders()
        payments = self.calculator.get_payments()
        returns = self.calculator.get_returns()

        # ==========================================
        # LOOKUP MAPS
        # ==========================================

        payment_map = self.calculator.build_payment_map(payments)
        return_map = self.calculator.build_return_map(returns)

        return self.build_order_summary(
            orders=orders,
            seller_sku=seller_sku,
            style_id=style_id,
            payment_map=payment_map,
            return_map=return_map,
        )

    def build_order_summary(
        self,
        orders,
        payment_map,
        return_map,
        seller_sku=None,
        style_id=None,
    ):
        """
        Build one row per Myntra order.

        Includes:
        - Quantity
        - Sales
        - Returns
        - Promo discount
        - Marketplace fees
        - Shipping
        - Taxes
        - Expected settlement
        - Profit
        """

        response = []

        for order in orders:
            # ==========================================
            # SKU FILTER
            # ==========================================

            if seller_sku is not None and order.seller_sku_code != seller_sku:
                continue

            if style_id is not None and str(order.style_id) != str(style_id):
                continue

            # ==========================================
            # RELATED DATA
            # ==========================================

            order_payments = payment_map.get(
                order.order_line_id,
                [],
            )

            order_returns = return_map.get(
                order.order_line_id,
                [],
            )

            finance_data_available = bool(order_payments)

            # ==========================================
            # QUANTITY
            # ==========================================

            gross_qty = 1

            return_qty = sum((item.quantity or 0) for item in order_returns)

            # Defensive protection against bad/duplicate
            # return data making quantity negative.
            net_qty = max(
                gross_qty - return_qty,
                0,
            )

            if gross_qty > 0:
                return_percentage = (
                    Decimal(str(return_qty)) / Decimal(str(gross_qty)) * Decimal(100)
                )
            else:
                return_percentage = Decimal(0)

            # ==========================================
            # RETURN CLASSIFICATION
            # ==========================================

            courier_return_count = 0
            customer_return_count = 0

            return_types = set()

            for return_item in order_returns:
                qty = return_item.quantity or 0

                return_category = self.calculator.classify_return(return_item)

                if return_category == "COURIER_RETURN":
                    courier_return_count += qty

                elif return_category == "CUSTOMER_RETURN":
                    customer_return_count += qty

                if return_item.type:
                    return_types.add(return_item.type)

            is_return = return_qty > 0

            return_type = ", ".join(sorted(return_types)) if return_types else None

            first_return = order_returns[0] if order_returns else None

            # Pure RTO / courier return.
            #
            # We intentionally do NOT zero the underlying
            # payment/fee/shipping values. Those remain
            # available for Reconciliation.
            is_courier_return = courier_return_count > 0 and customer_return_count == 0

            # ==========================================
            # SALES
            # ==========================================

            gross_sales = self.calculator.calculate_gross_sales([order]) or Decimal(0)

            if is_return:
                promo_discount = Decimal(0)
            else:
                promo_discount = self.calculator.calculate_promo_discount(
                    [order]
                ) or Decimal(0)

            # ==========================================
            # NET SALES
            # ==========================================
            #
            # Successful order -> Gross Sales
            # Returned order   -> 0
            net_sales = gross_sales if net_qty > 0 else Decimal(0)

            # ==========================================
            # ACTUAL SETTLEMENT
            # ==========================================

            final_net_sales = self.calculator.calculate_final_net_sales(
                order_payments
            ) or Decimal(0)

            # ==========================================
            # MARKETPLACE FEES
            # ==========================================

            mp_fee_breakdown = self.calculator.calculate_mp_fee_breakdown(
                order_payments
            )

            commission = mp_fee_breakdown.get("commission") or Decimal(0)

            fixed_fee = mp_fee_breakdown.get("fixed_fee") or Decimal(0)

            pick_and_pack_fee = mp_fee_breakdown.get("pick_and_pack_fee") or Decimal(0)

            payment_gateway_fee = mp_fee_breakdown.get(
                "payment_gateway_fee"
            ) or Decimal(0)

            mp_fees = self.calculator.calculate_mp_fees(order_payments) or Decimal(0)

            # ==========================================
            # SHIPPING
            # ==========================================

            shipping_breakdown = self.calculator.calculate_shipping_breakdown(
                order_payments
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
                order_payments
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

            tcs = self.calculator.calculate_tcs(order_payments) or Decimal(0)

            tds = self.calculator.calculate_tds(order_payments) or Decimal(0)

            # ==========================================
            # TAXABLE VALUE / GST TO PAY
            # ==========================================

            taxable_value = self.calculator.calculate_taxable_value(
                order_payments
            ) or Decimal(0)

            gst_to_pay_amount = self.calculator.calculate_gst_to_pay(
                order_payments
            ) or Decimal(0)

            gst_to_pay_perc = self.calculator.calculate_gst_percentage(
                order_payments
            ) or Decimal(0)

            # ==========================================
            # CLAIMS
            # ==========================================

            claim_amount = self.calculator.calculate_claims(order_payments) or Decimal(
                0
            )

            # ==========================================
            # FUTURE DATA SOURCES
            # ==========================================

            # Ads integration will populate this later.
            ads = Decimal(0)

            # User product-cost configuration will
            # populate this later.
            product_cost = Decimal(0)

            # ==========================================
            # EXPECTED SETTLEMENT / PROFIT
            # ==========================================

            if is_courier_return:
                # --------------------------------------
                # RTO / COURIER RETURN
                # --------------------------------------
                #
                # Profit-report business rule:
                #
                # Courier returns do not contribute
                # profit or loss.
                #
                # Actual settlement / fees / shipping
                # remain untouched above so they can
                # later be exposed in Reconciliation.
                # --------------------------------------
                promo_discount = Decimal(0)
                expected_settlement = Decimal(0)
                profit = Decimal(0)
                profit_percentage = Decimal(0)

            else:
                # --------------------------------------
                # NORMAL SALE / CUSTOMER RETURN
                # --------------------------------------

                expected_settlement = self.calculator.calculate_expected_settlement(
                    net_sales=net_sales,
                    mp_fees=mp_fees,
                    shipping_fees=shipping_fees,
                    ad_spend=ads,
                    mp_gst=mp_gst,
                    claim_amount=claim_amount,
                    promo_discount=promo_discount,
                    tcs=tcs,
                ) or Decimal(0)

                profit = self.calculator.calculate_profit(
                    net_sales=net_sales,
                    mp_fees=mp_fees,
                    shipping_fees=shipping_fees,
                    ad_spend=ads,
                    mp_gst=mp_gst,
                    product_cost=product_cost,
                    claim_amount=claim_amount,
                    promo_discount=promo_discount,
                    gst_to_pay=gst_to_pay_amount,
                    tcs=tcs,
                ) or Decimal(0)

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
                    # PRODUCT / ORDER
                    # ----------------------------------
                    "order_line_id": order.order_line_id,
                    "seller_order_id": order.seller_order_id,
                    "style_id": order.style_id,
                    "seller_sku": order.seller_sku_code,
                    "style_name": order.style_name,
                    "brand": order.brand,
                    "status": order.order_status,
                    "created_on": order.created_on,
                    # ----------------------------------
                    # DATA AVAILABILITY
                    # ----------------------------------
                    "finance_data_available": finance_data_available,
                    # ----------------------------------
                    # QUANTITY
                    # ----------------------------------
                    "gross_qty": gross_qty,
                    "net_qty": net_qty,
                    # ----------------------------------
                    # RETURNS
                    # ----------------------------------
                    "is_return": is_return,
                    "returnqty": return_qty,
                    "return_percentage": round(
                        return_percentage,
                        2,
                    ),
                    "return_type": return_type,
                    "courier_return_count": courier_return_count,
                    "customer_return_count": customer_return_count,
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
                    # ----------------------------------
                    # RETURN VALIDATION
                    # ----------------------------------
                    "return_id": (first_return.return_id if first_return else None),
                    "return_status": (
                        first_return.return_status if first_return else None
                    ),
                    "return_reason": (
                        first_return.return_reason if first_return else None
                    ),
                }
            )

        return response
