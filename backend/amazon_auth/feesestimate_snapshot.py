import time
from decimal import Decimal

from amazon_auth.models import AmazonEstimatedFee, AmazonListingItem
from amazon_auth.spapi_manager import SPAPIManager


def save_fee_estimate_snapshot(order_item, user, listing=None):
    """
    Experimental fee-estimate function for INITIAL SYNC.

    Differences from the normal save_fee_estimate():

    - Uses the current AmazonListingItem offer price when available.
    - Falls back to the OrderItem price if no usable listing price exists.
    - Reuses an existing estimate if one already exists.
    - Uses the OrderItem's Amazon account.
    - Keeps the same Amazon Fees Estimate API and fee parsing logic.
    """

    # ============================================================
    # EXISTING ESTIMATE
    # ============================================================

    existing_fee = AmazonEstimatedFee.objects.filter(order_item=order_item).first()

    if existing_fee:
        print(
            f"FEE ALREADY EXISTS => {order_item.seller_sku} | {existing_fee.total_fees}"
        )
        return existing_fee

    # ============================================================
    # LISTING
    # ============================================================

    if listing is None:
        listing = (
            AmazonListingItem.objects.filter(
                amazon_account=order_item.order.amazon_account,
                marketplace_id=order_item.order.amazon_account.marketplace_id,
                sku=order_item.seller_sku,
            )
            .order_by("-updated_at")
            .first()
        )

    # ============================================================
    # CREATE MANAGER USING THE ACTUAL AMAZON ACCOUNT
    # ============================================================

    manager = SPAPIManager(
        user=user,
        account=order_item.order.amazon_account,
    )

    # ============================================================
    # SELLING PRICE
    # ============================================================

    selling_price = None

    # ------------------------------------------------------------
    # 1. TRY CURRENT LISTING B2C OFFER
    # ------------------------------------------------------------

    if listing:
        offers = listing.offers or []

        for offer in offers:
            if (
                offer.get("marketplaceId")
                == order_item.order.amazon_account.marketplace_id
                and offer.get("offerType") == "B2C"
            ):
                price_data = offer.get("price", {})

                amount = price_data.get("amount")

                if amount is not None:
                    try:
                        selling_price = Decimal(str(amount))
                    except Exception:
                        selling_price = None

                    if selling_price is not None:
                        print(
                            f"LISTING PRICE USED => "
                            f"{order_item.seller_sku} => "
                            f"{selling_price}"
                        )

                        break

    # ------------------------------------------------------------
    # 2. FALLBACK TO ORDER ITEM PRICE
    # ------------------------------------------------------------

    if selling_price is None:
        if order_item.quantity_ordered:
            selling_price = Decimal(str(order_item.item_price)) / Decimal(
                str(order_item.quantity_ordered)
            )

        else:
            selling_price = Decimal("0")

        print(f"ORDER ITEM PRICE USED => {order_item.seller_sku} => {selling_price}")

    # ============================================================
    # VALIDATE PRICE
    # ============================================================

    if selling_price <= 0:
        print(f"INVALID SELLING PRICE => {order_item.seller_sku} => {selling_price}")

        return None

    # ============================================================
    # FULFILLMENT
    # ============================================================

    fulfillment_channel = (order_item.order.fulfillment_channel or "").upper()

    is_fba = fulfillment_channel == "AFN"

    print(f"FULFILLMENT => {fulfillment_channel} => {'FBA' if is_fba else 'FBM'}")

    # ============================================================
    # RETRY LOGIC
    # ============================================================

    max_retries = 3

    response = None
    result = {}

    for attempt in range(max_retries):
        print(
            f"TRY {attempt + 1}/{max_retries} => "
            f"{order_item.seller_sku} | "
            f"PRICE={selling_price}"
        )

        try:
            response = manager.get_my_fees_estimate_for_sku(
                seller_sku=order_item.seller_sku,
                amount=float(selling_price),
                currency="INR",
                shipping=0,
                is_fba=is_fba,
                identifier=f"initial-fee-{order_item.id}",
            )

            print("SP API RESPONSE => ", response)

        except Exception as e:
            print(f"API EXCEPTION => {order_item.seller_sku} => {e}")

            if attempt < max_retries - 1:
                time.sleep(2)
                continue

            return None

        # ========================================================
        # RESPONSE
        # ========================================================

        payload = response.get("payload", {})

        result = payload.get("FeesEstimateResult", {})

        status_value = result.get("Status")

        error_data = result.get("Error", {})

        error_code = error_data.get("Code")

        error_message = error_data.get("Message")

        # ========================================================
        # SUCCESS
        # ========================================================

        if status_value == "Success":
            print(f"SUCCESS => {order_item.seller_sku}")

            break

        # ========================================================
        # INVALID SKU / PERMANENT FAILURE
        # ========================================================

        elif error_code == "InvalidParameterValue":
            print(f"INVALID SKU => {order_item.seller_sku} => {error_message}")

            return None

        # ========================================================
        # INTERNAL ERROR
        # ========================================================

        elif error_code == "InternalError":
            print(f"INTERNAL ERROR => {order_item.seller_sku} => RETRYING...")

            if attempt < max_retries - 1:
                time.sleep(2)

            continue

        # ========================================================
        # UNKNOWN ERROR
        # ========================================================

        else:
            print(
                f"UNKNOWN FEE ERROR => "
                f"{order_item.seller_sku} => "
                f"CODE={error_code} | "
                f"MESSAGE={error_message}"
            )

            return None

    # ============================================================
    # FINAL CHECK
    # ============================================================

    if result.get("Status") != "Success":
        print(f"FAILED AFTER RETRIES => {order_item.seller_sku}")

        return None

    # ============================================================
    # PARSE FEES
    # ============================================================

    fees_estimate = result.get("FeesEstimate", {})

    total_fees = Decimal(
        str(fees_estimate.get("TotalFeesEstimate", {}).get("Amount", 0))
    )

    fee_detail_list = fees_estimate.get("FeeDetailList", [])

    referral_fee = Decimal("0")
    closing_fee = Decimal("0")
    per_item_fee = Decimal("0")
    fba_fee = Decimal("0")
    pick_pack_fee = Decimal("0")
    weight_handling_fee = Decimal("0")
    total_tax = Decimal("0")

    for fee in fee_detail_list:
        fee_type = fee.get("FeeType")

        final_fee = Decimal(str(fee.get("FinalFee", {}).get("Amount", 0)))

        tax_amount = Decimal(str(fee.get("TaxAmount", {}).get("Amount", 0)))

        total_tax += tax_amount

        if fee_type == "ReferralFee":
            referral_fee = final_fee

        elif fee_type == "VariableClosingFee":
            closing_fee = final_fee

        elif fee_type == "PerItemFee":
            per_item_fee = final_fee

        elif fee_type == "FBAFees":
            fba_fee = final_fee

            included_fees = fee.get("IncludedFeeDetailList", [])

            for sub_fee in included_fees:
                sub_type = sub_fee.get("FeeType")

                sub_final_fee = Decimal(
                    str(sub_fee.get("FinalFee", {}).get("Amount", 0))
                )

                if sub_type == "FBAPickAndPack":
                    pick_pack_fee = sub_final_fee

                elif sub_type == "FBAWeightHandling":
                    weight_handling_fee = sub_final_fee

    # ============================================================
    # ESTIMATION TIME
    # ============================================================

    estimated_time = fees_estimate.get("TimeOfFeesEstimation")

    # ============================================================
    # SAVE
    # ============================================================

    fee_obj = AmazonEstimatedFee.objects.create(
        order_item=order_item,
        amazon_account=(order_item.order.amazon_account),
        seller_sku=order_item.seller_sku,
        asin=order_item.asin,
        marketplace_id=manager.marketplace_id,
        currency="INR",
        selling_price=selling_price,
        total_fees=total_fees,
        referral_fee=referral_fee,
        closing_fee=closing_fee,
        per_item_fee=per_item_fee,
        fba_fee=fba_fee,
        fba_pick_pack_fee=pick_pack_fee,
        fba_weight_handling_fee=weight_handling_fee,
        tax_amount=total_tax,
        raw_response=response,
        fulfillment_channel=fulfillment_channel,
        estimated_at=estimated_time,
    )

    print(f"FEE SAVED => {order_item.seller_sku} => {total_fees}")

    return fee_obj
