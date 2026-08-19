from decimal import Decimal

from myntra.services.profit.sku_summary import SKUSummary


class MyntraAmazonProfitAdapter:
    """
    Converts Myntra Profit responses into the response contract
    currently expected by the Amazon Profit frontend.

    IMPORTANT:
    This class contains NO profit/business calculations.
    It only renames, formats and structures existing Myntra data.
    """

    CHANNEL = "Myntra-India"

    @staticmethod
    def _decimal(value):
        if value in (None, ""):
            return Decimal(0)

        try:
            return Decimal(str(value))
        except Exception:
            return Decimal(0)

    @classmethod
    def _money(cls, value):
        """
        Match current Amazon frontend currency format.
        """
        value = cls._decimal(value)

        # Keep behavior simple/compatible with Amazon:
        # ₹0.0
        # ₹7680.0
        # ₹7480.0
        return f"₹{round(value, 2)}"

    @staticmethod
    def _number(value, default=0):
        if value in (None, ""):
            return default

        return value

    # =========================================================
    # STYLE -> AMAZON PARENT ASIN SHAPE
    # =========================================================

    @classmethod
    def style_row(cls, row):
        style_id = str(row.get("style_id") or "")

        gross_qty = cls._number(row.get("gross_qty"))
        net_qty = cls._number(row.get("net_qty"))
        return_qty = cls._number(row.get("returnqty"))

        return {
            # -------------------------------------------------
            # PRODUCT
            # -------------------------------------------------
            # We deliberately put style_id here because the
            # existing frontend uses item.asin for "View"
            # and for drill-down navigation.
            "asin": style_id,
            "parent_asin": style_id,
            "id": style_id,
            "name": row.get("style_name") or "",
            "brand": row.get("brand") or "",
            # Myntra image support can be added later.
            "image_url": None,
            "channel": cls.CHANNEL,
            "channel1": cls.CHANNEL,
            # Don't invent a Myntra product URL here.
            "redirecturl": f"https://myntra.com/{style_id}",
            # -------------------------------------------------
            # QUANTITY
            # -------------------------------------------------
            # IMPORTANT:
            # Current Amazon frontend labels item.netqty
            # as "Gross Qty".
            "grossqty": gross_qty,
            "qty": gross_qty,
            "netqty": gross_qty,
            "final_net_qty": net_qty,
            # -------------------------------------------------
            # SALES
            # -------------------------------------------------
            "grosssales": cls._money(row.get("gross_sales")),
            # Current Amazon frontend displays `netsales`
            # under Gross Sales.
            "netsales": cls._money(row.get("gross_sales")),
            "final_net_sales": cls._money(row.get("net_sales")),
            "promo_discount": cls._money(row.get("promo_discount")),
            # -------------------------------------------------
            # RETURNS
            # -------------------------------------------------
            "returnqty": return_qty,
            "retpercent": cls._number(row.get("return_percentage")),
            "return_type": row.get("return_type"),
            "is_return": bool(row.get("is_return")),
            "return_count": return_qty,
            "return_amount": cls._money(0),
            "courier_return_count": cls._number(row.get("courier_return_count")),
            "customer_return_count": cls._number(row.get("customer_return_count")),
            "courier_return_price": cls._money(0),
            "customer_return_price": cls._money(0),
            # -------------------------------------------------
            # MARKETPLACE FEES
            # -------------------------------------------------
            "mpfees": cls._money(row.get("mp_fees")),
            # Frontend actually reads estimatefees for MP Fees.
            # Therefore expose the same Myntra value here too.
            "estimatefees": cls._money(row.get("mp_fees")),
            "new_mpfees": cls._money(row.get("mp_fees")),
            "commission": cls._money(row.get("commission")),
            "fixed_fee": cls._money(row.get("fixed_fee")),
            "pick_and_pack_fee": cls._money(row.get("pick_and_pack_fee")),
            "payment_gateway_fee": cls._money(row.get("payment_gateway_fee")),
            # Amazon-specific fee fields.
            # Keep them present so existing frontend/modal code
            # doesn't have to care which marketplace is active.
            "referral_fee": cls._money(row.get("commission")),
            "closing_fee": cls._money(row.get("fixed_fee")),
            "per_item_fee": cls._money(0),
            "fba_fee": cls._money(0),
            "fba_pick_pack_fee": cls._money(row.get("pick_and_pack_fee")),
            "fba_weight_handling_fee": cls._money(0),
            "tax_amount": cls._money(0),
            # -------------------------------------------------
            # SHIPPING
            # -------------------------------------------------
            "shippingfees": cls._money(row.get("shipping_fees")),
            "forward_shipping": cls._money(row.get("forward_shipping")),
            "reverse_shipping": cls._money(row.get("reverse_shipping")),
            "forward_logistics": cls._money(row.get("forward_logistics")),
            "reverse_logistics": cls._money(row.get("reverse_logistics")),
            # -------------------------------------------------
            # TAX
            # -------------------------------------------------
            "mp_gst": cls._money(row.get("mp_gst")),
            "gst": cls._money(row.get("mp_gst")),
            "tcs": cls._money(row.get("tcs")),
            "tds": cls._money(row.get("tds")),
            "taxable_value": cls._money(row.get("taxable_value")),
            "gst_to_pay_amount": cls._money(row.get("gst_to_pay_amount")),
            "gst_to_pay_perc": cls._number(row.get("gst_to_pay_perc")),
            # -------------------------------------------------
            # ADS
            # -------------------------------------------------
            "ads": cls._money(row.get("ads")),
            "ads_sales": cls._money(0),
            "ads_clicks": 0,
            "ads_orders": 0,
            "ads_impressions": 0,
            "tacos": 0.0,
            # -------------------------------------------------
            # COST
            # -------------------------------------------------
            "stdcost": cls._money(row.get("product_cost")),
            "stdcost_per_unit": 0.0,
            "stdcostmissingqty": 0,
            "stdcost_missing_percentage": 0.0,
            # -------------------------------------------------
            # SETTLEMENT / PROFIT
            # -------------------------------------------------
            "exp_settlement": cls._money(row.get("expected_settlement")),
            "profit": cls._money(row.get("profit")),
            "grossprofitper": cls._number(row.get("profit_percentage")),
            # -------------------------------------------------
            # CLAIMS
            # -------------------------------------------------
            "is_claim": cls._number(row.get("claim_count")) > 0,
            "claim_count": cls._number(row.get("claim_count")),
            "claim_amount": cls._money(row.get("claim_amount")),
            # -------------------------------------------------
            # REPLACEMENTS
            # -------------------------------------------------
            "is_replacement_return": False,
            "replacement_return_count": 0,
            # -------------------------------------------------
            # MYNTRA METADATA
            # -------------------------------------------------
            # Doesn't hurt Amazon frontend and remains useful
            # when debugging Myntra.
            "seller_sku_count": cls._number(row.get("seller_sku_count")),
            "finance_data_available": bool(row.get("finance_data_available")),
        }

    # =========================================================
    # STYLE -> AMAZON CHILD SKU SHAPE
    # =========================================================

    @classmethod
    def sku_row(cls, row):
        seller_sku = str(row.get("seller_sku") or row.get("seller_sku_code") or "")

        style_id = str(row.get("style_id") or "")

        gross_qty = cls._number(row.get("gross_qty"))
        net_qty = cls._number(row.get("net_qty"))
        return_qty = cls._number(row.get("returnqty"))

        return {
            # ==========================================
            # IDENTIFIERS
            # ==========================================
            "asin": style_id,
            "parent_asin": style_id,
            # Amazon frontend SKU identifier
            "sku": seller_sku,
            "seller_sku": seller_sku,
            "child_sku": seller_sku,
            "id": seller_sku,
            "name": row.get("style_name") or "",
            "brand": row.get("brand") or "",
            "image_url": None,
            "channel": cls.CHANNEL,
            "channel1": cls.CHANNEL,
            "redirecturl": f"https://myntra.com/{style_id}",
            # ==========================================
            # QUANTITY
            # ==========================================
            "grossqty": gross_qty,
            "qty": gross_qty,
            "netqty": gross_qty,
            "final_net_qty": net_qty,
            # ==========================================
            # SALES
            # ==========================================
            "grosssales": cls._money(row.get("gross_sales")),
            "netsales": cls._money(row.get("gross_sales")),
            "final_net_sales": cls._money(row.get("net_sales")),
            "promo_discount": cls._money(row.get("promo_discount")),
            # ==========================================
            # RETURNS
            # ==========================================
            "returnqty": return_qty,
            "retpercent": cls._number(row.get("return_percentage")),
            "return_type": row.get("return_type"),
            "is_return": bool(row.get("is_return")),
            "return_count": return_qty,
            "return_amount": cls._money(0),
            "courier_return_count": cls._number(row.get("courier_return_count")),
            "customer_return_count": cls._number(row.get("customer_return_count")),
            "courier_return_price": cls._money(0),
            "customer_return_price": cls._money(0),
            # ==========================================
            # MARKETPLACE FEES
            # ==========================================
            "mpfees": cls._money(row.get("mp_fees")),
            "estimatefees": cls._money(row.get("mp_fees")),
            "new_mpfees": cls._money(row.get("mp_fees")),
            "commission": cls._money(row.get("commission")),
            "fixed_fee": cls._money(row.get("fixed_fee")),
            "pick_and_pack_fee": cls._money(row.get("pick_and_pack_fee")),
            "payment_gateway_fee": cls._money(row.get("payment_gateway_fee")),
            "referral_fee": cls._money(row.get("commission")),
            "closing_fee": cls._money(row.get("fixed_fee")),
            "per_item_fee": cls._money(0),
            "fba_fee": cls._money(0),
            "fba_pick_pack_fee": cls._money(row.get("pick_and_pack_fee")),
            "fba_weight_handling_fee": cls._money(0),
            "tax_amount": cls._money(0),
            # ==========================================
            # SHIPPING
            # ==========================================
            "shippingfees": cls._money(row.get("shipping_fees")),
            "forward_shipping": cls._money(row.get("forward_shipping")),
            "reverse_shipping": cls._money(row.get("reverse_shipping")),
            "forward_logistics": cls._money(row.get("forward_logistics")),
            "reverse_logistics": cls._money(row.get("reverse_logistics")),
            # ==========================================
            # TAX
            # ==========================================
            "mp_gst": cls._money(row.get("mp_gst")),
            "gst": cls._money(row.get("mp_gst")),
            "tcs": cls._money(row.get("tcs")),
            "tds": cls._money(row.get("tds")),
            "taxable_value": cls._money(row.get("taxable_value")),
            "gst_to_pay_amount": cls._money(row.get("gst_to_pay_amount")),
            "gst_to_pay_perc": cls._number(row.get("gst_to_pay_perc")),
            # ==========================================
            # ADS
            # ==========================================
            "ads": cls._money(row.get("ads")),
            "ads_sales": cls._money(0),
            "ads_clicks": 0,
            "ads_orders": 0,
            "ads_impressions": 0,
            "tacos": 0.0,
            # ==========================================
            # PRODUCT COST
            # ==========================================
            "stdcost": cls._money(row.get("product_cost")),
            "stdcost_per_unit": 0.0,
            "stdcostmissingqty": 0,
            "stdcost_missing_percentage": 0.0,
            # ==========================================
            # SETTLEMENT / PROFIT
            # ==========================================
            "exp_settlement": cls._money(row.get("expected_settlement")),
            "profit": cls._money(row.get("profit")),
            "grossprofitper": cls._number(row.get("profit_percentage")),
            # ==========================================
            # CLAIMS
            # ==========================================
            "is_claim": cls._number(row.get("claim_count")) > 0,
            "claim_count": cls._number(row.get("claim_count")),
            "claim_amount": cls._money(row.get("claim_amount")),
            # ==========================================
            # REPLACEMENT
            # ==========================================
            "is_replacement_return": False,
            "replacement_return_count": 0,
            # ==========================================
            # MYNTRA DEBUG METADATA
            # ==========================================
            "finance_data_available": bool(row.get("finance_data_available")),
        }

    # =========================================================
    # ORDER -> AMAZON ORDER ID SHAPE
    # =========================================================
    @classmethod
    def order_row(cls, row):
        order_id = str(row.get("order_line_id") or row.get("order_id") or "")

        seller_sku = str(row.get("seller_sku") or row.get("seller_sku_code") or "")

        style_id = str(row.get("style_id") or "")

        gross_qty = cls._number(row.get("gross_qty"))
        net_qty = cls._number(row.get("net_qty"))
        return_qty = cls._number(row.get("returnqty"))

        return {
            # ==========================================
            # IDENTIFIERS
            # ==========================================
            "id": order_id,
            # Amazon compatibility
            "asin": order_id,
            "order_id": order_id,
            "amazon_order_id": order_id,
            "sku": seller_sku,
            "seller_sku": seller_sku,
            "parent_asin": style_id,
            "name": row.get("style_name") or "",
            "brand": row.get("brand") or "",
            "image_url": None,
            "channel": cls.CHANNEL,
            "channel1": cls.CHANNEL,
            "redirecturl": f"https://myntra.com/{style_id}",
            # ==========================================
            # QUANTITY
            # ==========================================
            "grossqty": gross_qty,
            "qty": gross_qty,
            "netqty": gross_qty,
            "final_net_qty": net_qty,
            # ==========================================
            # SALES
            # ==========================================
            "grosssales": cls._money(row.get("gross_sales")),
            "netsales": cls._money(row.get("gross_sales")),
            "final_net_sales": cls._money(row.get("net_sales")),
            "promo_discount": cls._money(row.get("promo_discount")),
            # ==========================================
            # RETURNS
            # ==========================================
            "returnqty": return_qty,
            "retpercent": cls._number(row.get("return_percentage")),
            "return_type": row.get("return_type"),
            "is_return": bool(row.get("is_return")),
            "return_count": return_qty,
            "courier_return_count": cls._number(row.get("courier_return_count")),
            "customer_return_count": cls._number(row.get("customer_return_count")),
            "return_amount": cls._money(0),
            "courier_return_price": cls._money(0),
            "customer_return_price": cls._money(0),
            # ==========================================
            # FEES
            # ==========================================
            "mpfees": cls._money(row.get("mp_fees")),
            "estimatefees": cls._money(row.get("mp_fees")),
            "new_mpfees": cls._money(row.get("mp_fees")),
            "commission": cls._money(row.get("commission")),
            "referral_fee": cls._money(row.get("commission")),
            "fixed_fee": cls._money(row.get("fixed_fee")),
            "closing_fee": cls._money(row.get("fixed_fee")),
            "pick_and_pack_fee": cls._money(row.get("pick_and_pack_fee")),
            "fba_pick_pack_fee": cls._money(row.get("pick_and_pack_fee")),
            "payment_gateway_fee": cls._money(row.get("payment_gateway_fee")),
            "per_item_fee": cls._money(0),
            "fba_fee": cls._money(0),
            "fba_weight_handling_fee": cls._money(0),
            "tax_amount": cls._money(0),
            # ==========================================
            # SHIPPING
            # ==========================================
            "shippingfees": cls._money(row.get("shipping_fees")),
            "forward_shipping": cls._money(row.get("forward_shipping")),
            "reverse_shipping": cls._money(row.get("reverse_shipping")),
            "forward_logistics": cls._money(row.get("forward_logistics")),
            "reverse_logistics": cls._money(row.get("reverse_logistics")),
            # ==========================================
            # TAX
            # ==========================================
            "mp_gst": cls._money(row.get("mp_gst")),
            "gst": cls._money(row.get("mp_gst")),
            "tcs": cls._money(row.get("tcs")),
            "tds": cls._money(row.get("tds")),
            "taxable_value": cls._money(row.get("taxable_value")),
            "gst_to_pay_amount": cls._money(row.get("gst_to_pay_amount")),
            "gst_to_pay_perc": cls._number(row.get("gst_to_pay_perc")),
            # ==========================================
            # ADS
            # ==========================================
            "ads": cls._money(row.get("ads")),
            "ads_sales": cls._money(0),
            "ads_clicks": 0,
            "ads_orders": 0,
            "ads_impressions": 0,
            "tacos": 0.0,
            # ==========================================
            # PRODUCT COST
            # ==========================================
            "stdcost": cls._money(row.get("product_cost")),
            "stdcost_per_unit": 0.0,
            "stdcostmissingqty": 0,
            "stdcost_missing_percentage": 0.0,
            # ==========================================
            # SETTLEMENT / PROFIT
            # ==========================================
            "exp_settlement": cls._money(row.get("expected_settlement")),
            "profit": cls._money(row.get("profit")),
            "grossprofitper": cls._number(row.get("profit_percentage")),
            # ==========================================
            # CLAIM
            # ==========================================
            "claim_count": cls._number(row.get("claim_count")),
            "claim_amount": cls._money(row.get("claim_amount")),
            "is_claim": cls._number(row.get("claim_count")) > 0,
            "is_replacement_return": False,
            "replacement_return_count": 0,
            # Myntra-specific metadata is safe to retain
            "finance_data_available": bool(row.get("finance_data_available")),
        }

    # =========================================================
    # TOTALS
    # =========================================================

    @classmethod
    def style_totals(cls, rows):
        def total(field):
            return sum(
                (cls._decimal(row.get(field)) for row in rows),
                Decimal(0),
            )

        gross_qty = sum(int(row.get("gross_qty") or 0) for row in rows)

        net_qty = sum(int(row.get("net_qty") or 0) for row in rows)

        return_qty = sum(int(row.get("returnqty") or 0) for row in rows)

        gross_sales = total("gross_sales")
        net_sales = total("net_sales")
        final_net_sales = sum(
            (cls._decimal(row.get("final_net_sales") if row.get("final_net_sales") else row.get("net_sales")) for row in rows),
            Decimal(0),
        )

        profit = total("profit")

        # Weighted/overall profit percentage rather than
        # summing row percentages.
        if final_net_sales > Decimal(0):
            profit_percentage = (profit / final_net_sales) * Decimal(100)
        elif net_sales > Decimal(0):
            profit_percentage = (profit / net_sales) * Decimal(100)
        elif gross_sales > Decimal(0):
            profit_percentage = (profit / gross_sales) * Decimal(100)
        else:
            profit_percentage = Decimal(0)

        return_percentage = (
            (Decimal(return_qty) / Decimal(gross_qty) * Decimal(100))
            if gross_qty
            else Decimal(0)
        )

        taxable_val = total("taxable_value")
        gst_pay_amt = total("gst_to_pay_amount")
        gst_pay_perc = (
            f"{round((gst_pay_amt / taxable_val * Decimal(100)), 2)}%"
            if taxable_val > Decimal(0)
            else "0%"
        )

        return {
            "ads": cls._money(total("ads")),
            # Current frontend uses netqty for Gross Qty.
            "netqty": gross_qty,
            "total_final_net_qty": net_qty,
            "totalreturn": return_qty,
            "totalreturnper": (f"{round(return_percentage, 2)}%"),
            # Current frontend uses netsales for Gross Sales.
            "grosssales": cls._money(gross_sales),
            "netsales": cls._money(gross_sales),
            "total_final_net_sales": cls._money(final_net_sales),
            "profit": cls._money(profit),
            "grossprofitper": float(round(profit_percentage, 2)),
            "mpfees": cls._money(total("mp_fees")),
            "estimatefees": cls._money(total("mp_fees")),
            "total_new_mpfees": cls._money(total("mp_fees")),
            "mp_gst": cls._money(total("mp_gst")),
            "shippingfees": cls._money(total("shipping_fees")),
            "stdcost": cls._money(total("product_cost")),
            "tcs": cls._money(total("tcs")),
            "taxable_value": cls._money(taxable_val),
            "gst_to_pay_amount": cls._money(gst_pay_amt),
            "gst_to_pay_perc": gst_pay_perc,
            "exp_settlement": cls._money(total("expected_settlement")),
            "total_promo_discount": cls._money(total("promo_discount")),
            "total_return_count": return_qty,
            "courier_return_count": sum(
                int(row.get("courier_return_count") or 0) for row in rows
            ),
            "customer_return_count": sum(
                int(row.get("customer_return_count") or 0) for row in rows
            ),
            "courier_return_price": cls._money(0),
            "customer_return_price": cls._money(0),
            "total_claim_count": sum(int(row.get("claim_count") or 0) for row in rows),
            "total_claim_amount": cls._money(total("claim_amount")),
            "total_replacement_return_count": 0,
            "tacos": 0.0,
            "totalgst": cls._money(total("mp_gst")),
        }

    @classmethod
    def order_totals(cls, rows):
        def total(field):
            return sum(
                (cls._decimal(row.get(field)) for row in rows),
                Decimal(0),
            )

        gross_qty = sum(int(row.get("gross_qty") or 0) for row in rows)
        net_qty = sum(int(row.get("net_qty") or 0) for row in rows)
        return_qty = sum(int(row.get("returnqty") or 0) for row in rows)

        gross_sales = total("gross_sales")
        net_sales = total("net_sales")
        final_net_sales = sum(
            (cls._decimal(row.get("final_net_sales") if row.get("final_net_sales") else row.get("net_sales")) for row in rows),
            Decimal(0),
        )

        profit = total("profit")

        if final_net_sales > Decimal(0):
            profit_percentage = (profit / final_net_sales) * Decimal(100)
        elif net_sales > Decimal(0):
            profit_percentage = (profit / net_sales) * Decimal(100)
        elif gross_sales > Decimal(0):
            profit_percentage = (profit / gross_sales) * Decimal(100)
        else:
            profit_percentage = Decimal(0)

        return_percentage = (
            (Decimal(return_qty) / Decimal(gross_qty) * Decimal(100))
            if gross_qty
            else Decimal(0)
        )

        taxable_val = total("taxable_value")
        gst_pay_amt = total("gst_to_pay_amount")
        gst_pay_perc = (
            f"{round((gst_pay_amt / taxable_val * Decimal(100)), 2)}%"
            if taxable_val > Decimal(0)
            else "0%"
        )

        return {
            "grosssales": float(round(gross_sales, 2)),
            "netsales": cls._money(net_sales),
            "total_net_sales": cls._money(net_sales),
            "total_final_net_sales": cls._money(final_net_sales),
            "netqty": gross_qty,
            "total_netquantity": gross_qty,
            "total_final_net_qty": net_qty,
            "profit": cls._money(profit),
            "totalreturn": return_qty,
            "total_returns": return_qty,
            "totalreturnper": f"{round(return_percentage, 2)}%",
            "total_ret_percent": f"{round(return_percentage, 2)}%",
            "totalprofitmargin": float(round(profit_percentage, 2)),
            "adSpend": cls._money(total("ads")),
            "mpfees": float(round(total("mp_fees"), 2)),
            "mp_gst": cls._money(total("mp_gst")),
            "estimatefees": cls._money(-abs(total("mp_fees"))),
            "total_new_mpfees": cls._money(total("mp_fees")),
            "shipping": cls._money(total("shipping_fees")),
            "gst": cls._money(0),
            "tcs": cls._money(total("tcs")),
            "cost": cls._money(total("product_cost")),
            "taxable_value": cls._money(taxable_val),
            "gst_to_pay_amount": cls._money(gst_pay_amt),
            "gst_to_pay_perc": gst_pay_perc,
            "exp_settlement": cls._money(total("expected_settlement")),
            "total_promo_discount": cls._money(total("promo_discount")),
            "total_return_count": return_qty,
            "courier_return_count": sum(int(row.get("courier_return_count") or 0) for row in rows),
            "customer_return_count": sum(int(row.get("customer_return_count") or 0) for row in rows),
            "courier_return_price": cls._money(0),
            "customer_return_price": cls._money(0),
            "total_claim_count": sum(int(row.get("claim_count") or 0) for row in rows),
            "total_claim_amount": cls._money(total("claim_amount")),
            "total_replacement_return_count": 0,
        }

    # =========================================================
    # FULL AMAZON RESPONSE CONTRACT
    # =========================================================

    @classmethod
    def style_response(
        cls,
        rows,
        page_no=0,
        page_size=10,
    ):
        """
        Produce:

        {
            status,
            message,
            pagination,
            totals,
            response
        }

        matching the Amazon Profit endpoint.
        """

        rows = list(rows)

        total_count = len(rows)

        try:
            page_no = max(int(page_no), 0)
        except (TypeError, ValueError):
            page_no = 0

        try:
            page_size = max(int(page_size), 1)
        except (TypeError, ValueError):
            page_size = 10

        start = page_no * page_size
        end = start + page_size

        page_rows = rows[start:end]

        return {
            "status": True,
            "message": "Success",
            "pagination": {
                "pageNo": page_no,
                "pageSize": page_size,
                "count": total_count,
            },
            # IMPORTANT:
            # totals are calculated across the complete filtered
            # result, not only the current page.
            "totals": cls.style_totals(rows),
            "response": [cls.style_row(row) for row in page_rows],
        }

    @classmethod
    def sku_response(
        cls,
        rows,
        page_no=0,
        page_size=10,
    ):
        rows = list(rows)

        total_count = len(rows)

        try:
            page_no = max(int(page_no), 0)
        except (TypeError, ValueError):
            page_no = 0

        try:
            page_size = max(int(page_size), 1)
        except (TypeError, ValueError):
            page_size = 10

        start = page_no * page_size
        end = start + page_size

        page_rows = rows[start:end]

        return {
            "status": True,
            "message": "Success",
            "pagination": {
                "pageNo": page_no,
                "pageSize": page_size,
                "count": total_count,
            },
            # Same totals function works because
            # SKU summary uses the same financial field names.
            "totals": cls.style_totals(rows),
            "response": [cls.sku_row(row) for row in page_rows],
        }

    @classmethod
    def order_response(
        cls,
        rows,
        page_no=0,
        page_size=10,
    ):
        """
        Produce:

        {
            "status": True,
            "message": "Success",
            "pagination": { ... },
            "totals": { ... },
            "response": [ ... ]
        }
        """
        rows = list(rows)

        total_count = len(rows)

        try:
            page_no = max(int(page_no), 0)
        except (TypeError, ValueError):
            page_no = 0

        try:
            page_size = max(int(page_size), 1)
        except (TypeError, ValueError):
            page_size = 10

        start = page_no * page_size
        end = start + page_size

        page_rows = rows[start:end]

        return {
            "status": True,
            "message": "Success",
            "pagination": {
                "pageNo": page_no,
                "pageSize": page_size,
                "count": total_count,
            },
            "totals": cls.order_totals(rows),
            "response": [cls.order_row(row) for row in page_rows],
        }


from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from myntra.services.profit.calculator import MyntraProfitCalculator
from myntra.services.profit.style_summary import StyleSummary


class MyntraAmazonStyleSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # -------------------------------------------------
        # Amazon frontend sends dates inside filters
        # -------------------------------------------------

        frontend_filters = request.data.get("filters", {})

        filters = {
            "fromDate": frontend_filters.get("fromDate"),
            "toDate": frontend_filters.get("toDate"),
        }

        calculator = MyntraProfitCalculator(
            user=request.user,
            filters=filters,
        )

        summary = StyleSummary(calculator)

        rows = summary.execute()

        # -------------------------------------------------
        # Pagination from existing Amazon frontend payload
        # -------------------------------------------------

        pagination = request.data.get("pagination", {})

        page_no = pagination.get("pageNo", 0)
        page_size = pagination.get("pageSize", 10)

        data = MyntraAmazonProfitAdapter.style_response(
            rows=rows,
            page_no=page_no,
            page_size=page_size,
        )

        return Response(data)


class MyntraAmazonSKUSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, style_id):

        frontend_filters = request.data.get(
            "filters",
            {},
        )

        filters = {
            "fromDate": frontend_filters.get("fromDate"),
            "toDate": frontend_filters.get("toDate"),
        }

        calculator = MyntraProfitCalculator(
            user=request.user,
            filters=filters,
        )

        summary = SKUSummary(calculator)

        rows = summary.execute(
            style_id=style_id,
        )

        pagination = request.data.get(
            "pagination",
            {},
        )

        data = MyntraAmazonProfitAdapter.sku_response(
            rows=rows,
            page_no=pagination.get("pageNo", 0),
            page_size=pagination.get("pageSize", 10),
        )

        return Response(data)


from myntra.services.profit.order_summary import OrderSummary


class MyntraAmazonOrderSummaryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, seller_sku):

        frontend_filters = request.data.get(
            "filters",
            {},
        )

        filters = {
            "fromDate": frontend_filters.get("fromDate"),
            "toDate": frontend_filters.get("endDate"),
        }

        calculator = MyntraProfitCalculator(
            user=request.user,
            filters=filters,
        )

        summary = OrderSummary(calculator)

        rows = summary.execute(
            seller_sku=seller_sku,
        )

        pagination = request.data.get(
            "pagination",
            {},
        )

        data = MyntraAmazonProfitAdapter.order_response(
            rows=rows,
            page_no=pagination.get("pageNo", 0),
            page_size=pagination.get("pageSize", 10),
        )

        return Response(data)
