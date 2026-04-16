import json
from decimal import Decimal

# ---------------------------
# HELPER: RAW DATA PARSER
# ---------------------------
def extract_financials(raw_data):
    result = {
        "revenue": Decimal('0.00'),
        "fees": Decimal('0.00'),
        "tds": Decimal('0.00'),
        "promotions": Decimal('0.00'),
        "other": Decimal('0.00')
    }

    try:
        data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data

        for item in data.get("ShipmentItemList", []):

            # Revenue
            for charge in item.get("ItemChargeList", []):
                amt = Decimal(str(charge.get("ChargeAmount", {}).get("CurrencyAmount", 0)))
                if charge.get("ChargeType") in ["Principal", "Tax"]:
                    result["revenue"] += amt
                else:
                    result["other"] += amt

            # Fees
            for fee in item.get("ItemFeeList", []):
                amt = Decimal(str(fee.get("FeeAmount", {}).get("CurrencyAmount", 0)))
                result["fees"] += abs(amt)

            # TDS
            for tax in item.get("ItemTaxWithheldList", []):
                for t in tax.get("TaxesWithheld", []):
                    amt = Decimal(str(t.get("ChargeAmount", {}).get("CurrencyAmount", 0)))
                    result["tds"] += abs(amt)

            # Promotions
            for promo in item.get("PromotionList", []):
                amt = Decimal(str(promo.get("PromotionAmount", {}).get("CurrencyAmount", 0)))
                result["promotions"] += abs(amt)

    except Exception:
        pass

    return result

