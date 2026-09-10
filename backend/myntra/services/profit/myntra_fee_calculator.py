from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


def get_myntra_fee_rules(user):
    """
    Fetches active MarketplaceEstimatedFeeRule records for Myntra for the given user.
    Uses effective user to support sub-user accounts.
    """
    if not user:
        return []

    try:
        from user_auth.sub_user import get_effective_user
        user = get_effective_user(user)
    except Exception:
        pass

    try:
        from amazon_auth.models import MarketplaceEstimatedFeeRule
        return list(
            MarketplaceEstimatedFeeRule.objects.filter(
                user=user,
                marketplace__iexact="Myntra",
                on=True,
            ).order_by("id")
        )
    except Exception as e:
        logger.error(f"Error fetching Myntra fee rules: {e}")
        return []


def _match_group(groups, article_type, style_name):
    """
    Finds the best matching category group from rule.groups.
    When by_cat is True, only matches if article_type or style_name matches the group label.
    Returns None if no group matches (or falls back to an explicit catch-all group like 'all'/'default').
    """
    if not groups:
        return None

    art_lower = (article_type or "").strip().lower()
    style_lower = (style_name or "").strip().lower()

    # 1. Exact or substring match on article_type
    if art_lower:
        for g in groups:
            label_lower = (g.get("label") or "").lower()
            if art_lower in label_lower or label_lower in art_lower:
                return g

    # 2. Word match on article_type (e.g. "Tops", "Dresses")
    if art_lower:
        art_words = [
            w for w in art_lower.replace("›", " ").replace(">", " ").replace("/", " ").replace("-", " ").split()
            if len(w) > 2
        ]
        for g in groups:
            label_lower = (g.get("label") or "").lower()
            for w in art_words:
                w_stem = w[:-2] if w.endswith("es") and len(w) > 4 else (w[:-1] if w.endswith("s") and len(w) > 3 else w)
                if w in label_lower or w_stem in label_lower:
                    return g

    # 3. Match from style_name keywords
    if style_lower:
        for g in groups:
            label_lower = (g.get("label") or "").lower()
            label_words = [
                w for w in label_lower.replace("›", " ").replace(">", " ").replace("/", " ").replace("-", " ").split()
                if len(w) > 3 and w not in ("apparel", "women", "womens", "mens", "kids")
            ]
            for w in label_words:
                w_stem = w[:-2] if w.endswith("es") and len(w) > 4 else (w[:-1] if w.endswith("s") and len(w) > 3 else w)
                if w in style_lower or w_stem in style_lower:
                    return g

    # 4. Check for an explicit fallback group (e.g., "all", "all categories", "default", "other")
    for g in groups:
        label_lower = (g.get("label") or "").strip().lower()
        if label_lower in ("all", "all categories", "default", "other", "others", "rest", "standard"):
            return g

    return None


def _evaluate_slabs(slabs, unit_price):
    """
    Given slabs [[low, high, rate], ...], finds the slab for unit_price and returns Decimal(rate).
    """
    if not slabs:
        return Decimal("0.00")

    for s in slabs:
        if not s or len(s) < 3:
            continue
        try:
            low = Decimal(str(s[0])) if s[0] not in ("", None) else Decimal("0")
        except Exception:
            low = Decimal("0")

        try:
            high = Decimal(str(s[1])) if s[1] not in ("", None) else None
        except Exception:
            high = None

        try:
            rate = Decimal(str(s[2])) if s[2] not in ("", None) else Decimal("0")
        except Exception:
            rate = Decimal("0")

        if unit_price >= low and (high is None or unit_price < high):
            return rate

    # Fallback to last slab if unit_price is above all defined ranges
    last_slab = slabs[-1]
    try:
        return Decimal(str(last_slab[2])) if len(last_slab) > 2 and last_slab[2] not in ("", None) else Decimal("0")
    except Exception:
        return Decimal("0")


def calculate_myntra_estimated_fees(
    gross_sales=0,
    gross_qty=1,
    article_type="",
    style_name="",
    is_return=False,
    return_qty=0,
    is_courier_return=False,
    is_customer_return=False,
    rules=None,
):
    """
    Calculates estimated marketplace fees for a Myntra order row based on
    the user's configured MarketplaceEstimatedFeeRule records.

    Return rules:
    - Courier Return (RTO): Customer never received the product, no sale occurred.
      Commission = 0, Fixed fee = 0, Return fee = 0. Total = 0.
    - Customer Return: Sale is reversed. Commission = 0, Fixed fee = 0, Marketing fee = 0.
      Only configured Return Fee rule applies (multiplied by return_qty).
    - Delivered / Normal Sale: Commission, Fixed fee, and Marketing fee apply. Return fee is 0.

    Returns dict with fee breakdown and total_estimated_fees, or None if rules are not provided.
    """
    if not rules:
        return None

    # Courier Return (RTO) has 0 marketplace fees
    if is_courier_return:
        return {
            "estimated_commission": Decimal("0.00"),
            "estimated_fixed_fee": Decimal("0.00"),
            "estimated_return_fee": Decimal("0.00"),
            "estimated_marketing_fee": Decimal("0.00"),
            "estimated_shipping_fee": Decimal("0.00"),
            "other_estimated_fees": Decimal("0.00"),
            "total_estimated_fees": Decimal("0.00"),
        }

    try:
        gross_sales_dec = Decimal(str(gross_sales or 0))
    except Exception:
        gross_sales_dec = Decimal("0.00")

    try:
        gross_qty_int = int(gross_qty or 1)
    except Exception:
        gross_qty_int = 1

    if gross_qty_int <= 0:
        gross_qty_int = 1

    unit_price = gross_sales_dec / Decimal(gross_qty_int)

    is_order_return = bool(is_return or is_customer_return or return_qty > 0)

    estimated_commission = Decimal("0.00")
    estimated_fixed_fee = Decimal("0.00")
    estimated_return_fee = Decimal("0.00")
    estimated_marketing_fee = Decimal("0.00")
    estimated_shipping_fee = Decimal("0.00")
    other_estimated_fees = Decimal("0.00")

    for rule in rules:
        if not getattr(rule, "on", True):
            continue

        rule_name = (getattr(rule, "name", "") or "").strip().lower()

        # If order is returned: only return fee rules apply!
        # Commission, fixed closing fee, marketing fee on net sales are refunded/zero.
        if is_order_return:
            if "return" not in rule_name:
                continue
        else:
            # If normal delivered order: return fee rules do NOT apply.
            if "return" in rule_name:
                continue

        fee_amount = Decimal("0.00")
        groups = getattr(rule, "groups", []) or []
        how = getattr(rule, "how", "pct")

        has_cat_slabs = bool(getattr(rule, "by_cat", False) and groups and any(g.get("slabs") for g in groups if isinstance(g, dict)))

        if how == "pct":
            val = Decimal(str(getattr(rule, "value", 0) or 0))
            fee_amount = (gross_sales_dec * val) / Decimal("100")

        elif how == "pct-slab" or (has_cat_slabs and how != "flat-slab"):
            group = _match_group(groups, article_type, style_name) if getattr(rule, "by_cat", False) else (groups[0] if groups else None)
            if group:
                rate = _evaluate_slabs(group.get("slabs", []), unit_price)
                fee_amount = (gross_sales_dec * rate) / Decimal("100")
            elif how == "flat":
                val = Decimal(str(getattr(rule, "value", 0) or 0))
                multiplier = int(return_qty or 1) if "return" in rule_name else gross_qty_int
                fee_amount = val * Decimal(multiplier)

        elif how == "flat-slab":
            group = _match_group(groups, article_type, style_name) if getattr(rule, "by_cat", False) else (groups[0] if groups else None)
            if group:
                flat_amt = _evaluate_slabs(group.get("slabs", []), unit_price)
                multiplier = int(return_qty or 1) if "return" in rule_name else gross_qty_int
                fee_amount = flat_amt * Decimal(multiplier)

        elif how == "flat":
            val = Decimal(str(getattr(rule, "value", 0) or 0))
            multiplier = int(return_qty or 1) if "return" in rule_name else gross_qty_int
            fee_amount = val * Decimal(multiplier)

        elif how == "weight":
            group = groups[0] if groups else None
            if group:
                flat_amt = _evaluate_slabs(group.get("slabs", []), unit_price)
                fee_amount = flat_amt * Decimal(gross_qty_int)

        # Categorize fee into standard fields
        if "commission" in rule_name:
            estimated_commission += fee_amount
        elif "fixed" in rule_name or "closing" in rule_name:
            estimated_fixed_fee += fee_amount
        elif "return" in rule_name:
            estimated_return_fee += fee_amount
        elif "market" in rule_name:
            estimated_marketing_fee += fee_amount
        elif "ship" in rule_name or "logistic" in rule_name:
            estimated_shipping_fee += fee_amount
        else:
            other_estimated_fees += fee_amount

    # Sum ALL configured and enabled fees into total_estimated
    total_estimated = (
        estimated_commission
        + estimated_fixed_fee
        + estimated_return_fee
        + estimated_marketing_fee
        + estimated_shipping_fee
        + other_estimated_fees
    )

    return {
        "estimated_commission": round(estimated_commission, 2),
        "estimated_fixed_fee": round(estimated_fixed_fee, 2),
        "estimated_return_fee": round(estimated_return_fee, 2),
        "estimated_marketing_fee": round(estimated_marketing_fee, 2),
        "estimated_shipping_fee": round(estimated_shipping_fee, 2),
        "other_estimated_fees": round(other_estimated_fees, 2),
        "total_estimated_fees": round(total_estimated, 2),
    }
