from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decimal import Decimal
from django.db.models import Q
from django.http import JsonResponse
from datetime import datetime, timedelta
from calendar import monthrange
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate
from user_auth.models import get_effective_user

from .views import (
    amazon_profitability_details_transactions_shipping,
    amazon_profitability_parent_transactions_shipping,
    sku_profit_report_transactions_shipping,
    get_full_dashboard,
)
from .utils import format_currency

def parse_currency_to_decimal(val):
    if val in (None, ""):
        return Decimal(0)
    val_str = str(val).replace("₹", "").replace(",", "").strip()
    try:
        return Decimal(val_str)
    except:
        return Decimal(0)


def _combine_totals(amazon_t, myntra_t, type="style"):
    def get_sum(field, is_currency=True):
        val_am = amazon_t.get(field, 0)
        val_my = myntra_t.get(field, 0)
        if is_currency:
            num_am = parse_currency_to_decimal(val_am)
            num_my = parse_currency_to_decimal(val_my)
            return num_am + num_my
        else:
            try:
                num_am = int(val_am or 0)
            except:
                num_am = 0
            try:
                num_my = int(val_my or 0)
            except:
                num_my = 0
            return num_am + num_my

    combined = {}
    
    if type == "style" or type == "sku":
        netqty = get_sum("netqty", is_currency=False)
        total_final_net_qty = get_sum("total_final_net_qty", is_currency=False)
        totalreturn = get_sum("totalreturn", is_currency=False)
        
        if netqty > 0:
            return_percentage = (Decimal(totalreturn) / Decimal(netqty)) * Decimal(100)
        elif total_final_net_qty > 0:
            return_percentage = (Decimal(totalreturn) / Decimal(total_final_net_qty)) * Decimal(100)
        else:
            return_percentage = Decimal(0)
            
        grosssales = get_sum("grosssales")
        netsales = get_sum("netsales")
        total_final_net_sales = get_sum("total_final_net_sales")
        profit = get_sum("profit")
        ads = get_sum("ads")
        
        if total_final_net_sales > 0:
            profit_perc = (profit / total_final_net_sales) * Decimal(100)
        elif netsales > 0:
            profit_perc = (profit / netsales) * Decimal(100)
        elif grosssales > 0:
            profit_perc = (profit / grosssales) * Decimal(100)
        else:
            profit_perc = Decimal(0)
            
        combined.update({
            "ads": format_currency(ads),
            "netqty": netqty,
            "total_final_net_qty": total_final_net_qty,
            "totalreturn": totalreturn,
            "totalreturnper": f"{round(return_percentage, 2)}%",
            "total_ret_percent": f"{round(return_percentage, 2)}%",
            "grosssales": format_currency(grosssales),
            "netsales": format_currency(netsales),
            "total_final_net_sales": format_currency(total_final_net_sales),
            "profit": format_currency(profit),
            "grossprofitper": float(round(profit_perc, 2)),
            "mpfees": format_currency(get_sum("mpfees")),
            "mp_gst": format_currency(get_sum("mp_gst")),
            "estimatefees": format_currency(-abs(get_sum("estimatefees"))),
            "total_new_mpfees": format_currency(get_sum("total_new_mpfees")),
            "shippingfees": format_currency(get_sum("shippingfees")),
            "tacos": float(round((ads / grosssales * Decimal(100)) if grosssales else Decimal(0), 2)),
            "stdcost": format_currency(get_sum("stdcost")),
            "totalgst": format_currency(0),
            "tcs": format_currency(get_sum("tcs")),
            "taxable_value": format_currency(get_sum("taxable_value")),
            
            "gst_to_pay_amount": format_currency(get_sum("gst_to_pay_amount")),
            "gst_to_pay_perc": f"{round((get_sum('gst_to_pay_amount') / get_sum('taxable_value') * Decimal(100)), 2) if get_sum('taxable_value') else 0}%",
            "exp_settlement": format_currency(get_sum("exp_settlement")),
            "total_promo_discount": format_currency(get_sum("total_promo_discount")),
            "total_return_count": get_sum("total_return_count", is_currency=False),
            "courier_return_count": get_sum("courier_return_count", is_currency=False),
            "customer_return_count": get_sum("customer_return_count", is_currency=False),
            "courier_return_price": format_currency(get_sum("courier_return_price")),
            "customer_return_price": format_currency(get_sum("customer_return_price")),
            
            "total_claim_count": get_sum("total_claim_count", is_currency=False),
            "total_claim_amount": format_currency(get_sum("total_claim_amount")),
            "total_replacement_return_count": get_sum("total_replacement_return_count", is_currency=False),
            "total_actual_fees": format_currency(get_sum("actual_fees") or get_sum("total_actual_fees")),
            "total_fees_leaks": format_currency(get_sum("fees_leaks") or get_sum("total_fees_leaks")),
            "total_actual_shipping": format_currency(get_sum("actual_shipping_charges") or get_sum("total_actual_shipping")),
            "total_shipping_leaks": format_currency(get_sum("shipping_leaks") or get_sum("total_shipping_leaks")),
            "total_actual_mp_gst": format_currency(get_sum("actual_mp_gst") or get_sum("total_actual_mp_gst")),
            "total_actual_tcs": format_currency(get_sum("actual_tcs") or get_sum("total_actual_tcs")),
            "total_tcs_leaks": format_currency(get_sum("tcs_leaks") or get_sum("total_tcs_leaks")),
            "total_expected_settlement": format_currency(get_sum("expected_settlement") or get_sum("total_expected_settlement") or get_sum("exp_settlement")),
            "total_settlement_paid_in_bank": format_currency(get_sum("settlement_paid_in_bank") or get_sum("total_settlement_paid_in_bank")),
            "total_unsettled_not_paid": format_currency(get_sum("unsettled_not_paid") or get_sum("total_unsettled_not_paid")),

            "actual_fees": format_currency(get_sum("actual_fees") or get_sum("total_actual_fees")),
            "fees_leaks": format_currency(get_sum("fees_leaks") or get_sum("total_fees_leaks")),
            "actual_shipping_charges": format_currency(get_sum("actual_shipping_charges") or get_sum("total_actual_shipping")),
            "shipping_leaks": format_currency(get_sum("shipping_leaks") or get_sum("total_shipping_leaks")),
            "actual_mp_gst": format_currency(get_sum("actual_mp_gst") or get_sum("total_actual_mp_gst")),
            "actual_tcs": format_currency(get_sum("actual_tcs") or get_sum("total_actual_tcs")),
            "tcs_leaks": format_currency(get_sum("tcs_leaks") or get_sum("total_tcs_leaks")),
            "settlement_paid_in_bank": format_currency(get_sum("settlement_paid_in_bank") or get_sum("total_settlement_paid_in_bank")),
            "unsettled_not_paid": format_currency(get_sum("unsettled_not_paid") or get_sum("total_unsettled_not_paid")),
        })
        
    elif type == "order":
        total_qty = get_sum("total_netquantity", is_currency=False)
        if total_qty == 0:
            total_qty = get_sum("netqty", is_currency=False) or get_sum("gross_qty", is_currency=False)

        total_final_net_qty = get_sum("total_final_net_qty", is_currency=False)
        if total_final_net_qty == 0:
            total_final_net_qty = get_sum("net_qty", is_currency=False)

        total_returns = get_sum("total_returns", is_currency=False) or get_sum("totalreturn", is_currency=False)

        if total_qty > 0:
            return_percentage = (Decimal(total_returns) / Decimal(total_qty)) * Decimal(100)
        else:
            return_percentage = Decimal(0)

        grosssales = get_sum("grosssales")
        netsales = get_sum("netsales") or get_sum("net_sales")
        total_final_net_sales = get_sum("total_final_net_sales") or get_sum("final_net_sales")
        profit = get_sum("profit")

        if netsales > 0:
            profit_perc = (profit / netsales) * Decimal(100)
        elif grosssales > 0:
            profit_perc = (profit / grosssales) * Decimal(100)
        else:
            profit_perc = Decimal(0)

        ad_spend = get_sum("adSpend") or get_sum("ads")
        shipping = get_sum("shipping") or get_sum("shippingfees")

        combined.update({
            "grosssales": float(round(grosssales, 2)),
            "netsales": format_currency(netsales),
            "total_net_sales": format_currency(netsales),
            "total_final_net_sales": format_currency(total_final_net_sales),
            "total_netquantity": total_qty,
            "total_final_net_qty": total_final_net_qty,
            "profit": format_currency(profit),
            "total_returns": total_returns,
            "totalreturnper": f"{round(return_percentage, 2)}%",
            "total_ret_percent": f"{round(return_percentage, 2)}%",
            "totalprofitmargin": float(round(profit_perc, 2)),

            "adSpend": format_currency(ad_spend),
            "mpfees": float(round(get_sum("mpfees"), 2)),
            "mp_gst": format_currency(get_sum("mp_gst")),
            "estimatefees": format_currency(-abs(get_sum("estimatefees"))),
            "total_new_mpfees": format_currency(get_sum("total_new_mpfees")),
            "shipping": format_currency(shipping),
            "gst": format_currency(0),
            "tcs": format_currency(get_sum("tcs")),
            "cost": format_currency(get_sum("cost") or get_sum("stdcost")),

            "taxable_value": format_currency(get_sum("taxable_value")),
            "gst_to_pay_amount": format_currency(get_sum("gst_to_pay_amount")),
            "gst_to_pay_perc": f"{round((get_sum('gst_to_pay_amount') / get_sum('taxable_value') * Decimal(100)), 2) if get_sum('taxable_value') else 0}%",
            "exp_settlement": format_currency(get_sum("exp_settlement")),
            "total_promo_discount": format_currency(get_sum("total_promo_discount")),
            "total_return_count": get_sum("total_return_count", is_currency=False) or total_returns,
            "courier_return_count": get_sum("courier_return_count", is_currency=False),
            "customer_return_count": get_sum("customer_return_count", is_currency=False),
            "courier_return_price": format_currency(get_sum("courier_return_price")),
            "customer_return_price": format_currency(get_sum("customer_return_price")),

            "total_claim_count": get_sum("total_claim_count", is_currency=False),
            "total_claim_amount": format_currency(get_sum("total_claim_amount")),
            "total_replacement_return_count": get_sum("total_replacement_return_count", is_currency=False),

            "actual_fees": format_currency(get_sum("actual_fees")),
            "fees_leaks": format_currency(get_sum("fees_leaks")),
            "actual_shipping_charges": format_currency(get_sum("actual_shipping_charges")),
            "shipping_leaks": format_currency(get_sum("shipping_leaks")),
            "actual_mp_gst": format_currency(get_sum("actual_mp_gst")),
            "actual_tcs": format_currency(get_sum("actual_tcs")),
            "tcs_leaks": format_currency(get_sum("tcs_leaks")),
            "expected_settlement": format_currency(get_sum("expected_settlement") or get_sum("exp_settlement")),
            "settlement_paid_in_bank": format_currency(get_sum("settlement_paid_in_bank")),
            "unsettled_not_paid": format_currency(get_sum("unsettled_not_paid")),
        })
        
    return combined


def get_undecorated_view(view_func):
    view_class = getattr(view_func, 'view_class', None)
    if not view_class:
        return view_func
    for method in ['post', 'get', 'put', 'delete', 'patch']:
        handler = getattr(view_class, method, None)
        if handler:
            if hasattr(handler, '__closure__') and handler.__closure__:
                for cell in handler.__closure__:
                    if callable(cell.cell_contents):
                        return cell.cell_contents
    return view_func


def _call_view_for_all_results(view_func, request):
    import copy
    original_data = copy.deepcopy(request.data)
    
    new_data = copy.deepcopy(original_data) if isinstance(original_data, dict) else {}
    if "pagination" not in new_data:
        new_data["pagination"] = {}
    new_data["pagination"]["pageSize"] = 1000000
    new_data["pagination"]["pageNo"] = 0
    
    request._full_data = new_data
    try:
        undecorated_func = get_undecorated_view(view_func)
        response = undecorated_func(request)
    finally:
        request._full_data = original_data
        
    return response


from dataclasses import dataclass, asdict
from typing import Optional, Any, Dict, List

def _safe_float(val, default: float = 0.0) -> float:
    if val in (None, ""):
        return default
    val_str = str(val).replace("₹", "").replace(",", "").replace("%", "").strip()
    try:
        return float(val_str)
    except:
        return default

def _safe_int(val, default: int = 0) -> int:
    if val in (None, ""):
        return default
    try:
        return int(float(str(val).replace(",", "").strip()))
    except:
        return default

def _safe_str(val, default: str = "") -> str:
    if val is None:
        return default
    return str(val)

def _format_curr(val) -> str:
    if isinstance(val, str) and "₹" in val:
        return val
    num_val = _safe_float(val)
    if num_val < 0:
        return f"-₹{abs(round(num_val, 2))}"
    else:
        return f"₹{round(num_val, 2)}"


@dataclass
class ProfitabilityItemDTO:
    asin: str = "-"
    parent_asin: str = "-"
    name: str = "-"
    channel: str = "-"
    image_url: str = ""
    grossqty: int = 0
    qty: int = 0
    netqty: int = 0
    final_net_qty: int = 0
    returnqty: int = 0
    courier_return_count: int = 0
    customer_return_count: int = 0
    retpercent: float = 0.0
    promo_discount: Any = "₹0.0"
    grosssales: Any = "₹0.0"
    netsales: Any = "₹0.0"
    final_net_sales: Any = "₹0.0"
    mpfees: Any = "₹0.0"
    estimatefees: Any = "₹0.0"
    referral_fee: Any = "₹0.0"
    closing_fee: Any = "₹0.0"
    per_item_fee: Any = "₹0.0"
    fba_fee: Any = "₹0.0"
    fba_pick_pack_fee: Any = "₹0.0"
    fba_weight_handling_fee: Any = "₹0.0"
    shippingfees: Any = "₹0.0"
    mp_gst: Any = "₹0.0"
    tcs: Any = "₹0.0"
    ads: Any = "₹0.0"
    taxable_value: Any = "₹0.0"
    gst_to_pay_amount: Any = "₹0.0"
    gst_to_pay_perc: float = 0.0
    claim_amount: Any = "₹0.0"
    claim_count: int = 0
    exp_settlement: Any = "₹0.0"
    stdcost: Any = "₹0.0"
    profit: Any = "₹0.0"
    grossprofitper: float = 0.0
    tacos: float = 0.0
    courier_return_price: Any = "₹0.0"
    customer_return_price: Any = "₹0.0"
    replacement_return_count: int = 0
    redirecturl: str = ""
    child_sku: str = ""
    order_id: str = ""
    date: str = ""

    actual_fees: Any = "₹0.0"
    fees_leaks: Any = "₹0.0"
    actual_shipping_charges: Any = "₹0.0"
    shipping_leaks: Any = "₹0.0"
    actual_mp_gst: Any = "₹0.0"
    actual_tcs: Any = "₹0.0"
    tcs_leaks: Any = "₹0.0"
    expected_settlement: Any = "₹0.0"
    settlement_paid_in_bank: Any = "₹0.0"
    unsettled_not_paid: Any = "₹0.0"

    def to_dict(self) -> dict:
        return asdict(self)


class ProfitabilityDTOAdapter:
    @staticmethod
    def from_row(row: dict, default_channel: Optional[str] = None) -> ProfitabilityItemDTO:
        if not isinstance(row, dict):
            return ProfitabilityItemDTO()

        channel = _safe_str(row.get("channel") or default_channel or "-")

        asin = _safe_str(row.get("asin") or row.get("style_id") or row.get("sku") or row.get("seller_sku") or "-")
        parent_asin = _safe_str(row.get("parent_asin") or row.get("parent_style_id") or row.get("parentproductid") or "-")
        name = _safe_str(row.get("name") or row.get("title") or row.get("style_name") or "-")
        image_url = _safe_str(row.get("image_url") or row.get("image") or "")
        redirecturl = _safe_str(row.get("redirecturl") or "")
        child_sku = _safe_str(row.get("child_sku") or row.get("seller_sku") or row.get("sku") or "")
        order_id = _safe_str(row.get("order_id") or "")
        date = _safe_str(row.get("date") or row.get("order_date") or "")

        grossqty = _safe_int(row.get("grossqty") if row.get("grossqty") is not None else (row.get("gross_qty") or row.get("qty")))
        netqty = _safe_int(row.get("netqty") if row.get("netqty") is not None else (row.get("gross_qty") or grossqty))
        qty = grossqty
        if row.get("final_net_qty") is not None:
            final_net_qty = _safe_int(row.get("final_net_qty"))
        elif row.get("net_qty") is not None:
            final_net_qty = _safe_int(row.get("net_qty"))
        else:
            final_net_qty = _safe_int(row.get("qty") if row.get("qty") is not None else netqty)
        returnqty = _safe_int(row.get("returnqty") or row.get("totalreturn") or row.get("return_count") or row.get("returns"))
        courier_return_count = _safe_int(row.get("courier_return_count") or row.get("courier_returns"))
        customer_return_count = _safe_int(row.get("customer_return_count") or row.get("customer_returns"))
        claim_count = _safe_int(row.get("claim_count") or row.get("claims"))
        replacement_return_count = _safe_int(row.get("replacement_return_count"))

        grosssales = _format_curr(row.get("grosssales") if row.get("grosssales") is not None else row.get("gross_sales"))
        netsales = _format_curr(row.get("netsales") if row.get("netsales") is not None else row.get("net_sales"))
        final_net_sales = _format_curr(row.get("final_net_sales") if row.get("final_net_sales") is not None else (row.get("net_sales") or row.get("netsales")))
        promo_discount = _format_curr(row.get("promo_discount") if row.get("promo_discount") is not None else row.get("promotions"))

        mpfees = _format_curr(row.get("mpfees") if row.get("mpfees") is not None else (row.get("estimatefees") or row.get("commission")))
        estimatefees = _format_curr(row.get("estimatefees") if row.get("estimatefees") is not None else (row.get("mpfees") or mpfees))
        referral_fee = _format_curr(row.get("referral_fee"))
        closing_fee = _format_curr(row.get("closing_fee"))
        per_item_fee = _format_curr(row.get("per_item_fee"))
        fba_fee = _format_curr(row.get("fba_fee"))
        fba_pick_pack_fee = _format_curr(row.get("fba_pick_pack_fee"))
        fba_weight_handling_fee = _format_curr(row.get("fba_weight_handling_fee"))
        shippingfees = _format_curr(row.get("shippingfees") if row.get("shippingfees") is not None else row.get("logistics_charge"))
        mp_gst = _format_curr(row.get("mp_gst"))
        tcs = _format_curr(row.get("tcs"))
        ads = _format_curr(row.get("ads") if row.get("ads") is not None else row.get("ad_spend"))
        taxable_value = _format_curr(row.get("taxable_value"))
        gst_to_pay_amount = _format_curr(row.get("gst_to_pay_amount") if row.get("gst_to_pay_amount") is not None else row.get("gsttopay"))
        gst_to_pay_perc = _safe_float(row.get("gst_to_pay_perc"))
        claim_amount = _format_curr(row.get("claim_amount") if row.get("claim_amount") is not None else row.get("total_claim_amount"))
        exp_settlement = _format_curr(row.get("exp_settlement"))
        stdcost = _format_curr(row.get("stdcost") if row.get("stdcost") is not None else (row.get("stdCost") or row.get("cogs")))
        profit = _format_curr(row.get("profit"))
        grossprofitper = _safe_float(row.get("grossprofitper") if row.get("grossprofitper") is not None else row.get("profitmargin"))
        retpercent = _safe_float(row.get("retpercent") if row.get("retpercent") is not None else row.get("totalreturnper"))
        tacos = _safe_float(row.get("tacos"))
        courier_return_price = _format_curr(row.get("courier_return_price"))
        customer_return_price = _format_curr(row.get("customer_return_price"))

        actual_fees = _format_curr(row.get("actual_fees"))
        fees_leaks = _format_curr(row.get("fees_leaks"))
        actual_shipping_charges = _format_curr(row.get("actual_shipping_charges"))
        shipping_leaks = _format_curr(row.get("shipping_leaks"))
        actual_mp_gst = _format_curr(row.get("actual_mp_gst"))
        actual_tcs = _format_curr(row.get("actual_tcs"))
        tcs_leaks = _format_curr(row.get("tcs_leaks"))
        expected_settlement = _format_curr(row.get("expected_settlement") if row.get("expected_settlement") is not None else row.get("exp_settlement"))
        settlement_paid_in_bank = _format_curr(row.get("settlement_paid_in_bank"))
        unsettled_not_paid = _format_curr(row.get("unsettled_not_paid"))

        return ProfitabilityItemDTO(
            asin=asin,
            parent_asin=parent_asin,
            name=name,
            channel=channel,
            image_url=image_url,
            grossqty=grossqty,
            qty=qty,
            netqty=netqty,
            final_net_qty=final_net_qty,
            returnqty=returnqty,
            courier_return_count=courier_return_count,
            customer_return_count=customer_return_count,
            retpercent=retpercent,
            promo_discount=promo_discount,
            grosssales=grosssales,
            netsales=netsales,
            final_net_sales=final_net_sales,
            mpfees=mpfees,
            estimatefees=estimatefees,
            referral_fee=referral_fee,
            closing_fee=closing_fee,
            per_item_fee=per_item_fee,
            fba_fee=fba_fee,
            fba_pick_pack_fee=fba_pick_pack_fee,
            fba_weight_handling_fee=fba_weight_handling_fee,
            shippingfees=shippingfees,
            mp_gst=mp_gst,
            tcs=tcs,
            ads=ads,
            taxable_value=taxable_value,
            gst_to_pay_amount=gst_to_pay_amount,
            gst_to_pay_perc=gst_to_pay_perc,
            claim_amount=claim_amount,
            claim_count=claim_count,
            exp_settlement=exp_settlement,
            stdcost=stdcost,
            profit=profit,
            grossprofitper=grossprofitper,
            tacos=tacos,
            courier_return_price=courier_return_price,
            customer_return_price=customer_return_price,
            replacement_return_count=replacement_return_count,
            redirecturl=redirecturl,
            child_sku=child_sku,
            order_id=order_id,
            date=date,
            actual_fees=actual_fees,
            fees_leaks=fees_leaks,
            actual_shipping_charges=actual_shipping_charges,
            shipping_leaks=shipping_leaks,
            actual_mp_gst=actual_mp_gst,
            actual_tcs=actual_tcs,
            tcs_leaks=tcs_leaks,
            expected_settlement=expected_settlement,
            settlement_paid_in_bank=settlement_paid_in_bank,
            unsettled_not_paid=unsettled_not_paid,
        )


def enrich_dto_image_urls(dto_rows, user=None):
    if not dto_rows:
        return dto_rows

    missing_dtos = [
        item for item in dto_rows
        if not getattr(item, "image_url", None)
        or str(getattr(item, "image_url", "")).strip() in ("", "None", "nan", "-")
    ]
    if not missing_dtos:
        return dto_rows

    skus = set()
    asins = set()
    parent_asins = set()

    for item in missing_dtos:
        sku = getattr(item, "child_sku", None) or getattr(item, "seller_sku", None)
        asin = getattr(item, "asin", None)
        parent_asin = getattr(item, "parent_asin", None)

        if sku and str(sku).strip() not in ("", "-"):
            skus.add(str(sku).strip())
        if asin and str(asin).strip() not in ("", "-"):
            asins.add(str(asin).strip())
        if parent_asin and str(parent_asin).strip() not in ("", "-"):
            parent_asins.add(str(parent_asin).strip())

    image_map = {}

    try:
        from myntra.models import MyntraListing
        my_qs = MyntraListing.objects.filter(image_url__isnull=False).exclude(image_url="")
        if user:
            my_qs = my_qs.filter(myntra_connection__user=user)
        for ml in my_qs.values("style_id", "seller_sku_code", "image_url"):
            img = ml["image_url"]
            if img:
                if ml.get("seller_sku_code"):
                    image_map[str(ml["seller_sku_code"])] = img
                if ml.get("style_id"):
                    image_map[str(ml["style_id"])] = img
    except Exception:
        pass

    try:
        from amazon_auth.models import AmazonListingItem
        ali_qs = AmazonListingItem.objects.filter(image_url__isnull=False).exclude(image_url="")
        if user:
            ali_qs = ali_qs.filter(user=user)
        query = Q()
        if skus:
            query |= Q(sku__in=skus)
        if asins:
            query |= Q(asin__in=asins)
        if query:
            for ali in ali_qs.filter(query).values("sku", "asin", "image_url"):
                img = ali["image_url"]
                if img:
                    if ali.get("sku"):
                        image_map.setdefault(str(ali["sku"]), img)
                    if ali.get("asin"):
                        image_map.setdefault(str(ali["asin"]), img)
    except Exception:
        pass

    try:
        from amazon_auth.models import ProductMapping
        pm_qs = ProductMapping.objects.filter(image_url__isnull=False).exclude(image_url="")
        if user:
            pm_qs = pm_qs.filter(account__user=user)
        query = Q()
        if skus:
            query |= Q(seller_sku__in=skus)
        if asins:
            query |= Q(asin__in=asins)
        if parent_asins:
            query |= Q(parent_asin__in=parent_asins)
        if query:
            for pm in pm_qs.filter(query).values("seller_sku", "asin", "parent_asin", "image_url"):
                img = pm["image_url"]
                if img:
                    if pm.get("seller_sku"):
                        image_map.setdefault(str(pm["seller_sku"]), img)
                    if pm.get("asin"):
                        image_map.setdefault(str(pm["asin"]), img)
                    if pm.get("parent_asin"):
                        image_map.setdefault(str(pm["parent_asin"]), img)
    except Exception:
        pass

    try:
        from amazon_auth.models import OrderItem
        oi_qs = OrderItem.objects.filter(image_url__isnull=False).exclude(image_url="")
        if user:
            oi_qs = oi_qs.filter(order__user=user)
        query = Q()
        if skus:
            query |= Q(seller_sku__in=skus)
        if asins:
            query |= Q(asin__in=asins)
        if parent_asins:
            query |= Q(parent_asin__in=parent_asins)
        if query:
            for oi in oi_qs.filter(query).values("seller_sku", "asin", "parent_asin", "image_url"):
                img = oi["image_url"]
                if img:
                    if oi.get("seller_sku"):
                        image_map.setdefault(str(oi["seller_sku"]), img)
                    if oi.get("asin"):
                        image_map.setdefault(str(oi["asin"]), img)
                    if oi.get("parent_asin"):
                        image_map.setdefault(str(oi["parent_asin"]), img)
    except Exception:
        pass

    for item in missing_dtos:
        sku = str(getattr(item, "child_sku", "") or getattr(item, "seller_sku", "") or "")
        asin = str(getattr(item, "asin", "") or "")
        parent_asin = str(getattr(item, "parent_asin", "") or "")

        img = (
            image_map.get(sku) or
            image_map.get(asin) or
            image_map.get(parent_asin) or
            ""
        )
        if img:
            item.image_url = img

    return dto_rows


def enrich_row_image_urls(rows, user=None):
    if not rows:
        return rows

    missing_rows = [
        r for r in rows
        if isinstance(r, dict) and (not r.get("image_url") and not r.get("image") or str(r.get("image_url") or r.get("image")).strip() in ("", "None", "nan", "-"))
    ]
    if not missing_rows:
        return rows

    skus = set()
    asins = set()
    parent_asins = set()

    for r in missing_rows:
        sku = r.get("child_sku") or r.get("seller_sku") or r.get("sku")
        asin = r.get("asin")
        parent_asin = r.get("parent_asin") or r.get("parentproductid")

        if sku and str(sku).strip() not in ("", "-"):
            skus.add(str(sku).strip())
        if asin and str(asin).strip() not in ("", "-"):
            asins.add(str(asin).strip())
        if parent_asin and str(parent_asin).strip() not in ("", "-"):
            parent_asins.add(str(parent_asin).strip())

    image_map = {}

    try:
        from myntra.models import MyntraListing
        my_qs = MyntraListing.objects.filter(image_url__isnull=False).exclude(image_url="")
        if user:
            my_qs = my_qs.filter(myntra_connection__user=user)
        for ml in my_qs.values("style_id", "seller_sku_code", "image_url"):
            img = ml["image_url"]
            if img:
                if ml.get("seller_sku_code"):
                    image_map[str(ml["seller_sku_code"])] = img
                if ml.get("style_id"):
                    image_map[str(ml["style_id"])] = img
    except Exception:
        pass

    try:
        from amazon_auth.models import AmazonListingItem
        ali_qs = AmazonListingItem.objects.filter(image_url__isnull=False).exclude(image_url="")
        if user:
            ali_qs = ali_qs.filter(user=user)
        query = Q()
        if skus:
            query |= Q(sku__in=skus)
        if asins:
            query |= Q(asin__in=asins)
        if query:
            for ali in ali_qs.filter(query).values("sku", "asin", "image_url"):
                img = ali["image_url"]
                if img:
                    if ali.get("sku"):
                        image_map.setdefault(str(ali["sku"]), img)
                    if ali.get("asin"):
                        image_map.setdefault(str(ali["asin"]), img)
    except Exception:
        pass

    try:
        from amazon_auth.models import ProductMapping
        pm_qs = ProductMapping.objects.filter(image_url__isnull=False).exclude(image_url="")
        if user:
            pm_qs = pm_qs.filter(account__user=user)
        query = Q()
        if skus:
            query |= Q(seller_sku__in=skus)
        if asins:
            query |= Q(asin__in=asins)
        if parent_asins:
            query |= Q(parent_asin__in=parent_asins)
        if query:
            for pm in pm_qs.filter(query).values("seller_sku", "asin", "parent_asin", "image_url"):
                img = pm["image_url"]
                if img:
                    if pm.get("seller_sku"):
                        image_map.setdefault(str(pm["seller_sku"]), img)
                    if pm.get("asin"):
                        image_map.setdefault(str(pm["asin"]), img)
                    if pm.get("parent_asin"):
                        image_map.setdefault(str(pm["parent_asin"]), img)
    except Exception:
        pass

    try:
        from amazon_auth.models import OrderItem
        oi_qs = OrderItem.objects.filter(image_url__isnull=False).exclude(image_url="")
        if user:
            oi_qs = oi_qs.filter(order__user=user)
        query = Q()
        if skus:
            query |= Q(seller_sku__in=skus)
        if asins:
            query |= Q(asin__in=asins)
        if parent_asins:
            query |= Q(parent_asin__in=parent_asins)
        if query:
            for oi in oi_qs.filter(query).values("seller_sku", "asin", "parent_asin", "image_url"):
                img = oi["image_url"]
                if img:
                    if oi.get("seller_sku"):
                        image_map.setdefault(str(oi["seller_sku"]), img)
                    if oi.get("asin"):
                        image_map.setdefault(str(oi["asin"]), img)
                    if oi.get("parent_asin"):
                        image_map.setdefault(str(oi["parent_asin"]), img)
    except Exception:
        pass

    for r in missing_rows:
        sku = str(r.get("child_sku") or r.get("seller_sku") or r.get("sku") or "")
        asin = str(r.get("asin") or "")
        parent_asin = str(r.get("parent_asin") or r.get("parentproductid") or "")

        img = (
            image_map.get(sku) or
            image_map.get(asin) or
            image_map.get(parent_asin) or
            ""
        )
        if img:
            r["image_url"] = img
            r["image"] = img

    return rows


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def combined_profitability_details_transactions_shipping(request):
    user = get_effective_user(request.user)
    data = request.data or {}
    
    filters = data.get("filters", {})
    pagination = data.get("pagination", {})
    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))
    
    search_term = filters.get("search") or filters.get("searchTerm") or filters.get("q") or filters.get("keyword")
    if isinstance(search_term, list) and search_term:
        search_term = search_term[0]
    if search_term:
        search_term = str(search_term).strip()
        
    from_date_str = filters.get('fromDate') or filters.get('start_date') or filters.get('from_date') or filters.get('startDate')
    to_date_str = filters.get('toDate') or filters.get('end_date') or filters.get('to_date') or filters.get('endDate')
    
    channels = filters.get("channel", {}).get("IN", []) if isinstance(filters.get("channel"), dict) else []
    
    has_myntra = "Myntra" in channels
    has_amazon = "Amazon-India" in channels or len(channels) == 0
    
    if has_amazon and not has_myntra:
        undecorated = get_undecorated_view(amazon_profitability_details_transactions_shipping)
        res = undecorated(request)
        if res.status_code == 200 and isinstance(res.data, dict) and "response" in res.data:
            res.data["response"] = enrich_row_image_urls(res.data["response"], user)
        return res
        
    amazon_rows = []
    myntra_rows = []
    amazon_totals = {}
    myntra_totals = {}
    
    if has_amazon:
        amazon_res = _call_view_for_all_results(amazon_profitability_details_transactions_shipping, request)
        if amazon_res.status_code == 200 and isinstance(amazon_res.data, dict):
            amazon_rows = amazon_res.data.get("response", [])
            amazon_totals = amazon_res.data.get("totals", {})
            
    if has_myntra:
        from myntra.services.profit.calculator import MyntraProfitCalculator
        from myntra.services.profit.style_summary import StyleSummary
        from myntra.amazon_adapter import MyntraAmazonProfitAdapter
        
        from_date_local = None
        to_date_local = None
        try:
            if from_date_str:
                from_date_local = datetime.strptime(str(from_date_str).split('T')[0], "%Y-%m-%d").date()
            if to_date_str:
                to_date_local = datetime.strptime(str(to_date_str).split('T')[0], "%Y-%m-%d").date()
        except:
            pass
            
        myntra_filters = {
            "fromDate": from_date_local,
            "toDate": to_date_local,
        }
        
        calculator = MyntraProfitCalculator(user=user, filters=myntra_filters)
        summary = StyleSummary(calculator)
        myntra_raw_rows = summary.execute()
        
        if search_term:
            search_term_lower = search_term.lower()
            myntra_raw_rows = [
                r for r in myntra_raw_rows
                if search_term_lower in str(r.get("style_id") or "").lower()
                or search_term_lower in str(r.get("style_name") or "").lower()
                or search_term_lower in str(r.get("brand") or "").lower()
            ]
            
        myntra_adapted = MyntraAmazonProfitAdapter.style_response(
            rows=myntra_raw_rows,
            page_no=0,
            page_size=1000000
        )
        myntra_rows = myntra_adapted.get("response", [])
        myntra_totals = myntra_adapted.get("totals", {})
        
    amazon_dtos = [ProfitabilityDTOAdapter.from_row(r, default_channel="Amazon-India") for r in amazon_rows]
    myntra_dtos = [ProfitabilityDTOAdapter.from_row(r, default_channel="Myntra") for r in myntra_rows]

    if has_myntra and not has_amazon:
        dto_rows = myntra_dtos
    else:
        dto_rows = amazon_dtos + myntra_dtos

    dto_rows = enrich_dto_image_urls(dto_rows, user)
    dto_rows.sort(key=lambda item: item.grosssales, reverse=True)
    
    combined_totals = _combine_totals(amazon_totals, myntra_totals, type="style")
    total_count = len(dto_rows)
    paginated_dtos = dto_rows[page_no * page_size : (page_no + 1) * page_size]
    paginated_rows = [dto.to_dict() for dto in paginated_dtos]
    
    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": total_count,
        },
        "totals": combined_totals,
        "response": paginated_rows
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def combined_profitability_parent_transactions_shipping(request):
    user = get_effective_user(request.user)
    data = request.data or {}
    
    filters = data.get("filters", {})
    pagination = data.get("pagination", {})
    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))
    
    search_term = filters.get("search") or filters.get("searchTerm") or filters.get("q") or filters.get("keyword")
    if isinstance(search_term, list) and search_term:
        search_term = search_term[0]
    if search_term:
        search_term = str(search_term).strip()
        
    from_date_str = filters.get('fromDate')
    to_date_str = filters.get('toDate')
    parent_ids = filters.get("parentproductid", {}).get("IN", [])
    
    channels = filters.get("channel", {}).get("IN", []) if isinstance(filters.get("channel"), dict) else []
    
    has_myntra = "Myntra" in channels
    has_amazon = "Amazon-India" in channels or len(channels) == 0
    
    if has_amazon and not has_myntra:
        undecorated = get_undecorated_view(amazon_profitability_parent_transactions_shipping)
        res = undecorated(request)
        if res.status_code == 200 and isinstance(res.data, dict) and "response" in res.data:
            res.data["response"] = enrich_row_image_urls(res.data["response"], user)
        return res
        
    amazon_rows = []
    myntra_rows = []
    amazon_totals = {}
    myntra_totals = {}
    
    if has_amazon:
        amazon_res = _call_view_for_all_results(amazon_profitability_parent_transactions_shipping, request)
        if amazon_res.status_code == 200 and isinstance(amazon_res.data, dict):
            amazon_rows = amazon_res.data.get("response", [])
            amazon_totals = amazon_res.data.get("totals", {})
            
    if has_myntra:
        from myntra.services.profit.calculator import MyntraProfitCalculator
        from myntra.services.profit.sku_summary import SKUSummary
        from myntra.amazon_adapter import MyntraAmazonProfitAdapter
        
        from_date_local = None
        to_date_local = None
        try:
            if from_date_str:
                from_date_local = datetime.strptime(str(from_date_str).split('T')[0], "%Y-%m-%d").date()
            if to_date_str:
                to_date_local = datetime.strptime(str(to_date_str).split('T')[0], "%Y-%m-%d").date()
        except:
            pass
            
        myntra_filters = {
            "fromDate": from_date_local,
            "toDate": to_date_local,
        }
        
        calculator = MyntraProfitCalculator(user=user, filters=myntra_filters)
        summary = SKUSummary(calculator)
        
        style_id = str(parent_ids[0]) if parent_ids else None
        if style_id:
            myntra_raw_rows = summary.execute(style_id=style_id)
        else:
            myntra_raw_rows = []
            
        if search_term:
            search_term_lower = search_term.lower()
            myntra_raw_rows = [
                r for r in myntra_raw_rows
                if search_term_lower in str(r.get("seller_sku") or r.get("seller_sku_code") or "").lower()
                or search_term_lower in str(r.get("style_name") or "").lower()
                or search_term_lower in str(r.get("brand") or "").lower()
            ]
            
        myntra_adapted = MyntraAmazonProfitAdapter.sku_response(
            rows=myntra_raw_rows,
            page_no=0,
            page_size=1000000
        )
        myntra_rows = myntra_adapted.get("response", [])
        myntra_totals = myntra_adapted.get("totals", {})
        
    amazon_dtos = [ProfitabilityDTOAdapter.from_row(r, default_channel="Amazon-India") for r in amazon_rows]
    myntra_dtos = [ProfitabilityDTOAdapter.from_row(r, default_channel="Myntra") for r in myntra_rows]

    if has_myntra and not has_amazon:
        dto_rows = myntra_dtos
    else:
        dto_rows = amazon_dtos + myntra_dtos

    dto_rows = enrich_dto_image_urls(dto_rows, user)
    dto_rows.sort(key=lambda item: item.grosssales, reverse=True)
    
    combined_totals = _combine_totals(amazon_totals, myntra_totals, type="sku")
    total_count = len(dto_rows)
    paginated_dtos = dto_rows[page_no * page_size : (page_no + 1) * page_size]
    paginated_rows = [dto.to_dict() for dto in paginated_dtos]
    
    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": total_count,
        },
        "totals": combined_totals,
        "response": paginated_rows
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def combined_sku_profit_report_transactions_shipping(request):
    user = get_effective_user(request.user)
    data = request.data or {}
    
    filters = data.get("filters", {})
    pagination = data.get("pagination", {})
    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))
    
    search_term = data.get("search") or filters.get("search") or filters.get("searchTerm") or filters.get("q")
    if isinstance(search_term, list) and search_term:
        search_term = search_term[0]
    if search_term:
        search_term = str(search_term).strip()
        
    from_date_str = filters.get('fromDate')
    to_date_str = filters.get('endDate')
    sku = data.get("sku") or filters.get("sku")
    parent_product_id = data.get("parentProductId") or filters.get("parentProductId") or filters.get("parent_product_id") or data.get("asin") or filters.get("asin") or filters.get("parent_asin")
    
    channels = filters.get("channel", {}).get("IN", []) if isinstance(filters.get("channel"), dict) else []
    
    has_myntra = "Myntra" in channels
    has_amazon = "Amazon-India" in channels or len(channels) == 0
    
    if has_amazon and not has_myntra:
        undecorated = get_undecorated_view(sku_profit_report_transactions_shipping)
        res = undecorated(request)
        if res.status_code == 200 and isinstance(res.data, dict) and "response" in res.data:
            res.data["response"] = enrich_row_image_urls(res.data["response"], user)
        return res
        
    amazon_rows = []
    myntra_rows = []
    amazon_totals = {}
    myntra_totals = {}
    
    if has_amazon:
        amazon_res = _call_view_for_all_results(sku_profit_report_transactions_shipping, request)
        if amazon_res.status_code == 200 and isinstance(amazon_res.data, dict):
            amazon_rows = amazon_res.data.get("response", [])
            amazon_totals = amazon_res.data.get("totals", {})
            
    if has_myntra:
        from myntra.services.profit.calculator import MyntraProfitCalculator
        from myntra.services.profit.order_summary import OrderSummary
        from myntra.amazon_adapter import MyntraAmazonProfitAdapter
        
        from_date_local = None
        to_date_local = None
        try:
            if from_date_str:
                from_date_local = datetime.strptime(str(from_date_str).split('T')[0], "%Y-%m-%d").date()
            if to_date_str:
                to_date_local = datetime.strptime(str(to_date_str).split('T')[0], "%Y-%m-%d").date()
        except:
            pass
            
        myntra_filters = {
            "fromDate": from_date_local,
            "toDate": to_date_local,
        }
        
        calculator = MyntraProfitCalculator(user=user, filters=myntra_filters)
        summary = OrderSummary(calculator)
        
        if sku or parent_product_id:
            myntra_raw_rows = summary.execute(seller_sku=sku, style_id=parent_product_id)
        else:
            myntra_raw_rows = summary.execute()
            
        if search_term:
            search_term_lower = search_term.lower()
            myntra_raw_rows = [
                r for r in myntra_raw_rows
                if search_term_lower in str(r.get("order_line_id") or r.get("order_id") or "").lower()
                or search_term_lower in str(r.get("style_name") or "").lower()
                or search_term_lower in str(r.get("brand") or "").lower()
            ]
            
        myntra_adapted = MyntraAmazonProfitAdapter.order_response(
            rows=myntra_raw_rows,
            page_no=0,
            page_size=1000000
        )
        myntra_rows = myntra_adapted.get("response", [])
        myntra_totals = myntra_adapted.get("totals", {})
        
    amazon_dtos = [ProfitabilityDTOAdapter.from_row(r, default_channel="Amazon-India") for r in amazon_rows]
    myntra_dtos = [ProfitabilityDTOAdapter.from_row(r, default_channel="Myntra") for r in myntra_rows]

    if has_myntra and not has_amazon:
        dto_rows = myntra_dtos
    else:
        dto_rows = amazon_dtos + myntra_dtos

    dto_rows = enrich_dto_image_urls(dto_rows, user)
    dto_rows.sort(key=lambda item: item.grosssales, reverse=True)
    
    combined_totals = _combine_totals(amazon_totals, myntra_totals, type="order")
    total_count = len(dto_rows)
    paginated_dtos = dto_rows[page_no * page_size : (page_no + 1) * page_size]
    paginated_rows = [dto.to_dict() for dto in paginated_dtos]
    
    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": total_count,
        },
        "totals": combined_totals,
        "response": paginated_rows
    })


def get_myntra_dashboard_stats(user, from_date_str, to_date_str):
    from myntra.services.profit.calculator import MyntraProfitCalculator
    from myntra.services.profit.style_summary import StyleSummary
    from myntra.models import MyntraOrder
    from django.db.models import Sum
    from datetime import datetime
    
    from_date_local = None
    to_date_local = None
    try:
        if from_date_str:
            from_date_local = datetime.strptime(str(from_date_str).split('T')[0], "%Y-%m-%d").date()
        if to_date_str:
            to_date_local = datetime.strptime(str(to_date_str).split('T')[0], "%Y-%m-%d").date()
    except:
        pass
        
    myntra_filters = {
        "fromDate": from_date_local,
        "toDate": to_date_local,
    }
    
    calculator = MyntraProfitCalculator(user=user, filters=myntra_filters)
    summary = StyleSummary(calculator)
    myntra_raw_rows = summary.execute()
    
    # Aggregate values from style rows
    gross_sales = Decimal(0)
    net_sales = Decimal(0)
    final_net_sales = Decimal(0)
    profit = Decimal(0)
    mp_fees = Decimal(0)
    shipping_fees = Decimal(0)
    ads = Decimal(0)
    
    gross_qty = 0
    net_qty = 0
    final_net_qty = 0
    return_qty = 0
    courier_return_count = 0
    customer_return_count = 0
    claim_count = 0
    claim_amount = Decimal(0)
    
    for r in myntra_raw_rows:
        g_sales = Decimal(str(r.get("gross_sales") or 0))
        n_sales = Decimal(str(r.get("net_sales") or 0))
        gross_sales += g_sales
        net_sales += g_sales
        final_net_sales += n_sales
        profit += Decimal(str(r.get("profit") or 0))
        mp_fees += Decimal(str(r.get("mp_fees") or 0))
        shipping_fees += Decimal(str(r.get("shipping_fees") or 0))
        ads += Decimal(str(r.get("ads") or 0))
        
        g_qty = int(r.get("gross_qty") or 0)
        n_qty = int(r.get("net_qty") or 0)
        gross_qty += g_qty
        net_qty += g_qty
        final_net_qty += n_qty
        return_qty += int(r.get("returnqty") or 0)
        courier_return_count += int(r.get("courier_return_count") or 0)
        customer_return_count += int(r.get("customer_return_count") or 0)
        claim_count += int(r.get("claim_count") or 0)
        claim_amount += Decimal(str(r.get("claim_amount") or 0))
        
    # Calculate trends
    orders = MyntraOrder.objects.filter(user=user)
    if from_date_local:
        orders = orders.filter(created_on__date__gte=from_date_local)
    if to_date_local:
        orders = orders.filter(created_on__date__lte=to_date_local)
        
    # Group by date
    from django.db.models.functions import TruncDate
    from django.db.models import Count
    trends_qs = orders.annotate(date=TruncDate('created_on')).values('date').annotate(
        sales=Sum('seller_price'),
        qty=Count('id')
    ).order_by('date')
    
    margin_factor = float(profit / net_sales) if net_sales else 0.0
    
    trends_data = {}
    for t in trends_qs:
        if t['date']:
            d_str = t['date'].strftime('%m-%d')
            sales_val = float(t['sales'] or 0.0)
            qty_val = int(t['qty'] or 0)
            trends_data[d_str] = {
                "sales": sales_val,
                "qty": qty_val,
                "estimated_profit": sales_val * margin_factor
            }
            
    # Calculate top/losing SKUs
    from myntra.services.profit.sku_summary import SKUSummary
    sku_summary = SKUSummary(calculator)
    myntra_skus = sku_summary.execute()
    
    top_skus_mapped = []
    for r in myntra_skus:
        sku_code = r.get("seller_sku") or r.get("seller_sku_code") or ""
        top_skus_mapped.append({
            "child_sku": sku_code,
            "sku": sku_code,
            "profit": float(r.get("profit") or 0),
            "net_sales": float(r.get("net_sales") or 0),
            "grosssales": f"₹{round(float(r.get('gross_sales') or 0), 2)}",
            "shippingfees": float(r.get("shipping_fees") or 0),
            "channel": "Myntra-India",
        })
        
    return {
        "gross_sales": gross_sales,
        "net_sales": net_sales,
        "final_net_sales": final_net_sales,
        "profit": profit,
        "mp_fees": mp_fees,
        "shipping_fees": shipping_fees,
        "ads": ads,
        "gross_qty": gross_qty,
        "net_qty": net_qty,
        "final_net_qty": final_net_qty,
        "return_qty": return_qty,
        "courier_return_count": courier_return_count,
        "customer_return_count": customer_return_count,
        "claim_count": claim_count,
        "claim_amount": claim_amount,
        "trends": trends_data,
        "skus": top_skus_mapped
    }


def _combine_dashboard_stats(amazon_data, myntra_data):
    # Header Metrics
    am_header = amazon_data.get("header_metrics", {})
    
    m_sales = myntra_data["net_sales"]
    m_final_net_sales = myntra_data.get("final_net_sales", Decimal(0))
    m_profit = myntra_data["profit"]
    m_shipping = myntra_data["shipping_fees"]
    m_ads = -abs(myntra_data["ads"])  # keep ads negative as expense
    m_return_count = myntra_data["return_qty"]
    m_courier_return = myntra_data["courier_return_count"]
    m_customer_return = myntra_data["customer_return_count"]
    m_claim_count = myntra_data["claim_count"]
    m_claim_amount = myntra_data["claim_amount"]
    
    # Parse Amazon values
    am_sales = Decimal(str(am_header.get("sales") or 0))
    am_final_net_sales = Decimal(str(am_header.get("total_final_net_sales") or 0))
    am_profit = Decimal(str(am_header.get("profit") or 0))
    am_shipping = parse_currency_to_decimal(am_header.get("shipping"))
    am_ads = parse_currency_to_decimal(am_header.get("ad_spend"))
    
    # Merged sales/profit
    combined_sales = am_sales + m_sales
    combined_final_net_sales = am_final_net_sales + m_final_net_sales
    combined_profit = am_profit + m_profit
    combined_shipping = am_shipping + m_shipping
    combined_ads = am_ads + m_ads
    
    combined_margin = (combined_profit / combined_sales * 100) if combined_sales else Decimal(0)
    
    roi_str = am_header.get("roi") or "0%"
    combined_tacos = (abs(combined_ads) / combined_sales * 100) if combined_sales else Decimal(0)
    
    combined_return_count = int(am_header.get("total_return_count") or 0) + m_return_count
    combined_courier_return = int(am_header.get("courier_return_count") or 0) + m_courier_return
    combined_customer_return = int(am_header.get("customer_return_count") or 0) + m_customer_return
    
    combined_return_amount = parse_currency_to_decimal(am_header.get("return_amount"))
    combined_courier_amount = parse_currency_to_decimal(am_header.get("courier_return_amount"))
    combined_customer_amount = parse_currency_to_decimal(am_header.get("customer_return_amount"))
    
    combined_claim_count = int(am_header.get("total_claim_count") or 0) + m_claim_count
    combined_claim_amount = parse_currency_to_decimal(am_header.get("claim_amount")) + m_claim_amount
    
    header_metrics = {
        "sales": round(float(combined_sales), 2),
        "total_final_net_sales": round(float(combined_final_net_sales), 2),
        "profit": round(float(combined_profit), 2),
        "margin": f"{round(combined_margin)}%",
        "roi": roi_str,
        "ad_spend": format_currency(combined_ads),
        "tacos": f"{round(combined_tacos)}%",
        "shipping": format_currency(combined_shipping),
        "total_return_count": combined_return_count,
        "courier_return_count": combined_courier_return,
        "customer_return_count": combined_customer_return,
        "return_amount": format_currency(combined_return_amount),
        "courier_return_amount": format_currency(combined_courier_amount),
        "customer_return_amount": format_currency(combined_customer_amount),
        "total_claim_count": combined_claim_count,
        "claim_amount": format_currency(combined_claim_amount),
    }
    
    # Breakdown Table
    am_table = amazon_data.get("breakdown_table", {})
    
    def parse_table_row(row):
        if not row:
            return {"qty": 0, "amount": Decimal(0)}
        qty = int(row.get("qty") or 0)
        amount = parse_currency_to_decimal(row.get("amount"))
        return {"qty": qty, "amount": amount}
        
    gross = parse_table_row(am_table.get("gross"))
    cancelled = parse_table_row(am_table.get("cancelled"))
    cancelled_rto = parse_table_row(am_table.get("cancelled(RTO)"))
    returned = parse_table_row(am_table.get("returned"))
    returned_rto = parse_table_row(am_table.get("returned(RTO)"))
    returned_cref = parse_table_row(am_table.get("returned(CRef)"))
    claim = parse_table_row(am_table.get("claim"))
    net = parse_table_row(am_table.get("net"))
    ret_courier = parse_table_row(am_table.get("returned_courier"))
    ret_customer = parse_table_row(am_table.get("returned_customer"))
    
    fees_amount = Decimal(str(am_table.get("fees", {}).get("amount") or 0))
    
    gross["qty"] += myntra_data["gross_qty"]
    gross["amount"] += myntra_data["gross_sales"]
    
    returned["qty"] += myntra_data["return_qty"]
    returned_rto["qty"] += myntra_data["courier_return_count"]
    
    returned_cref["qty"] += myntra_data["claim_count"]
    returned_cref["amount"] += myntra_data["claim_amount"]
    
    claim["qty"] += myntra_data["claim_count"]
    claim["amount"] += myntra_data["claim_amount"]
    
    fees_amount += myntra_data["mp_fees"]
    
    net["qty"] += myntra_data["net_qty"]
    net["amount"] += myntra_data["net_sales"]
    
    ret_courier["qty"] += myntra_data["courier_return_count"]
    ret_customer["qty"] += myntra_data["customer_return_count"]
    
    breakdown_table = {
        "gross": {"qty": gross["qty"], "amount": format_currency(gross["amount"])},
        "cancelled": {"qty": cancelled["qty"], "amount": format_currency(cancelled["amount"])},
        "cancelled(RTO)": {"qty": cancelled_rto["qty"], "amount": format_currency(cancelled_rto["amount"])},
        "returned": {"qty": returned["qty"], "amount": format_currency(returned["amount"])},
        "returned(RTO)": {"qty": returned_rto["qty"], "amount": format_currency(returned_rto["amount"])},
        "returned(CRef)": {"qty": returned_cref["qty"], "amount": format_currency(returned_cref["amount"])},
        "claim": {"qty": claim["qty"], "amount": format_currency(claim["amount"])},
        "fees": {"amount": round(float(fees_amount), 2), "method": "calculated"},
        "net": {"qty": net["qty"], "amount": format_currency(net["amount"])},
        "returned_courier": {"qty": ret_courier["qty"], "amount": format_currency(ret_courier["amount"])},
        "returned_customer": {"qty": ret_customer["qty"], "amount": format_currency(ret_customer["amount"])},
    }
    
    # Trends
    am_trends = amazon_data.get("trends", [])
    m_trends = myntra_data.get("trends", {})
    
    merged_trends = {}
    for t in am_trends:
        dt = t.get("date")
        if dt:
            merged_trends[dt] = {
                "sales": float(t.get("sales") or 0.0),
                "qty": int(t.get("qty") or 0),
                "estimated_profit": float(t.get("estimated_profit") or 0.0),
                "profit_new": float(t.get("profit_new") or 0.0),
            }
            
    for dt, val in m_trends.items():
        if dt in merged_trends:
            merged_trends[dt]["sales"] += val["sales"]
            merged_trends[dt]["qty"] += val["qty"]
            merged_trends[dt]["estimated_profit"] += val["estimated_profit"]
            merged_trends[dt]["profit_new"] += val["estimated_profit"]
        else:
            merged_trends[dt] = {
                "sales": val["sales"],
                "qty": val["qty"],
                "estimated_profit": val["estimated_profit"],
                "profit_new": val["estimated_profit"],
            }
            
    trends_list = []
    for dt in sorted(merged_trends.keys()):
        val = merged_trends[dt]
        trends_list.append({
            "date": dt,
            "sales": round(val["sales"], 2),
            "qty": val["qty"],
            "estimated_profit": round(val["estimated_profit"], 2),
            "profit_new": round(val["profit_new"], 2),
        })
        
    # Top/Losing SKUs
    am_top = amazon_data.get("top_orders", {})
    am_prof = am_top.get("profitable", {}).get("data", [])
    am_lose = am_top.get("losing", {}).get("data", [])
    
    m_skus = myntra_data.get("skus", [])
    
    combined_skus = []
    for s in am_prof:
        combined_skus.append({
            "child_sku": s.get("child_sku") or s.get("sku") or "",
            "sku": s.get("sku") or s.get("child_sku") or "",
            "profit": float(s.get("profit") or 0),
            "net_sales": float(s.get("net_sales") or s.get("sales") or 0),
            "grosssales": s.get("grosssales") or f"₹{round(float(s.get('sales') or 0), 2)}",
            "shippingfees": float(s.get("shippingfees") or 0),
            "channel": s.get("channel", "Amazon-India"),
        })
    for s in am_lose:
        combined_skus.append({
            "child_sku": s.get("child_sku") or s.get("sku") or "",
            "sku": s.get("sku") or s.get("child_sku") or "",
            "profit": float(s.get("profit") or 0),
            "net_sales": float(s.get("net_sales") or s.get("sales") or 0),
            "grosssales": s.get("grosssales") or f"₹{round(float(s.get('sales') or 0), 2)}",
            "shippingfees": float(s.get("shippingfees") or 0),
            "channel": s.get("channel", "Amazon-India"),
        })
        
    combined_skus.extend(m_skus)
    
    profitable_skus = [s for s in combined_skus if s["profit"] > 0]
    losing_skus = [s for s in combined_skus if s["profit"] < 0]
    
    profitable_skus.sort(key=lambda x: x["profit"], reverse=True)
    losing_skus.sort(key=lambda x: x["profit"])
    
    top_orders = {
        "profitable": {
            "total_count": len(profitable_skus),
            "total_amount": f"₹{round(sum(s['profit'] for s in profitable_skus), 2)}",
            "data": profitable_skus[:20]
        },
        "losing": {
            "total_count": len(losing_skus),
            "total_amount": f"-₹{abs(round(sum(s['profit'] for s in losing_skus), 2))}",
            "data": losing_skus[:20]
        }
    }
    
    return {
        "status": "success",
        "statusCode": 200,
        "currency": "INR",
        "startDate": amazon_data.get("startDate"),
        "endDate": amazon_data.get("endDate"),
        "header_metrics": header_metrics,
        "breakdown_table": breakdown_table,
        "trends": trends_list,
        "top_orders": top_orders,
        "warnings": amazon_data.get("warnings", [])
    }


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def combined_get_full_dashboard(request):
    user = get_effective_user(request.user)
    
    data_source_raw = request.data if request.method == 'POST' else request.GET
    data_source = {}
    if data_source_raw:
        if hasattr(data_source_raw, 'dict'):
            data_source.update(data_source_raw.dict())
        else:
            data_source.update(data_source_raw)
            
    if not data_source:
        try:
            import json
            body_data = json.loads(request._request.body)
            if isinstance(body_data, dict):
                data_source.update(body_data)
        except:
            pass
            
    search_data = {}
    search_data.update(data_source)
    if isinstance(search_data.get('filters'), dict):
        search_data.update(search_data.get('filters'))
        
    def find_key(keys):
        for k in keys:
            val = search_data.get(k)
            if isinstance(val, list) and val:
                val = val[0]
            if val:
                return str(val)
        return None
        
    from_date_str = find_key(['fromDate'])
    to_date_str = find_key(['toDate'])
    
    channels = search_data.get("channel", {}).get("IN", []) if isinstance(search_data.get("channel"), dict) else []
    
    has_myntra = "Myntra" in channels
    has_amazon = "Amazon-India" in channels or len(channels) == 0
    
    if has_amazon and not has_myntra:
        undecorated = get_undecorated_view(get_full_dashboard)
        return undecorated(request)
        
    amazon_res_data = {
        "status": "success",
        "statusCode": 200,
        "header_metrics": {},
        "breakdown_table": {},
        "trends": [],
        "top_orders": {"profitable": {"data": []}, "losing": {"data": []}}
    }
    
    if has_amazon:
        undecorated = get_undecorated_view(get_full_dashboard)
        amazon_res = undecorated(request)
        if amazon_res.status_code == 200:
            import json
            amazon_res_data = json.loads(amazon_res.content.decode('utf-8'))
            
    myntra_res_data = {
        "net_sales": Decimal(0),
        "gross_sales": Decimal(0),
        "profit": Decimal(0),
        "mp_fees": Decimal(0),
        "shipping_fees": Decimal(0),
        "ads": Decimal(0),
        "gross_qty": 0,
        "net_qty": 0,
        "return_qty": 0,
        "courier_return_count": 0,
        "customer_return_count": 0,
        "claim_count": 0,
        "claim_amount": Decimal(0),
        "trends": {},
        "skus": []
    }
    
    if has_myntra:
        myntra_res_data = get_myntra_dashboard_stats(user, from_date_str, to_date_str)
        
    if has_myntra and not has_amazon:
        empty_amazon = {
            "status": "success",
            "statusCode": 200,
            "currency": "INR",
            "startDate": from_date_str,
            "endDate": to_date_str,
            "header_metrics": {
                "sales": 0.0,
                "total_final_net_sales": 0.0,
                "profit": 0.0,
                "margin": "0%",
                "roi": "0%",
                "ad_spend": "₹0.0",
                "tacos": "0%",
                "shipping": "₹0.0",
                "total_return_count": 0,
                "courier_return_count": 0,
                "customer_return_count": 0,
                "return_amount": "₹0.0",
                "courier_return_amount": "₹0.0",
                "customer_return_amount": "₹0.0",
                "total_claim_count": 0,
                "claim_amount": "₹0.0"
            },
            "breakdown_table": {},
            "trends": [],
            "top_orders": {"profitable": {"data": []}, "losing": {"data": []}},
            "warnings": []
        }
        res_data = _combine_dashboard_stats(empty_amazon, myntra_res_data)
        return JsonResponse(res_data)
        
    res_data = _combine_dashboard_stats(amazon_res_data, myntra_res_data)
    return JsonResponse(res_data)


def _parse_num_safe(val):
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).replace('₹', '').replace(',', '').strip()
    try:
        return float(s)
    except Exception:
        return 0.0


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def combined_dashboard_profitability(request):
    """
    Returns channel-level summary for dashboard-profitability API
    using the exact same calculation formulas & filters as combined_profitability_details_transactions_shipping.
    """
    req_to_pass = getattr(request, '_request', request)
    res = combined_profitability_details_transactions_shipping(req_to_pass)
    
    if res.status_code != 200 or not isinstance(res.data, dict):
        return res

    detail_rows = res.data.get("response", [])
    overall_totals = res.data.get("totals", {})

    by_channel = {}
    for r in detail_rows:
        ch = r.get("channel") or "Amazon-India"
        if ch not in by_channel:
            by_channel[ch] = []
        by_channel[ch].append(r)

    channel_summary = []
    for ch, rows in by_channel.items():
        gross_qty = sum(_parse_num_safe(r.get("grossqty")) for r in rows)
        net_qty = sum(_parse_num_safe(r.get("final_net_qty") or r.get("netqty")) for r in rows)
        return_qty = sum(_parse_num_safe(r.get("returnqty")) for r in rows)
        
        gross_sales = sum(_parse_num_safe(r.get("grosssales")) for r in rows)
        net_sales = sum(_parse_num_safe(r.get("final_net_sales") or r.get("netsales")) for r in rows)
        mp_fees = sum(_parse_num_safe(r.get("estimatefees") or r.get("mpfees")) for r in rows)
        shipping = sum(_parse_num_safe(r.get("shippingfees") or r.get("shipping")) for r in rows)
        mp_gst = sum(_parse_num_safe(r.get("mp_gst")) for r in rows)
        tcs = sum(_parse_num_safe(r.get("tcs")) for r in rows)
        ads = sum(_parse_num_safe(r.get("ads")) for r in rows)
        std_cost = sum(_parse_num_safe(r.get("stdcost")) for r in rows)
        gst_to_pay = sum(_parse_num_safe(r.get("gst_to_pay_amount")) for r in rows)
        claim_amt = sum(_parse_num_safe(r.get("claim_amount")) for r in rows)
        settlement = sum(_parse_num_safe(r.get("exp_settlement") or r.get("settleAmount")) for r in rows)
        profit = sum(_parse_num_safe(r.get("profit")) for r in rows)

        ret_pct = round((return_qty / gross_qty * 100), 2) if gross_qty else 0.0
        profit_pct = round((profit / net_sales * 100), 2) if net_sales else 0.0
        gross_profit = net_sales + mp_fees + shipping

        channel_summary.append({
            "channel": ch,
            "channel1": ch,
            "view": ch,
            "name": ch,
            "id": ch,
            "producttitle": ch,
            "grossqty": int(gross_qty),
            "netqty": int(net_qty),
            "returnqty": int(return_qty),
            "retpercent": ret_pct,
            "grosssales": round(gross_sales, 2),
            "netsales": round(net_sales, 2),
            "mpfees": round(mp_fees, 2),
            "shippingfees": round(shipping, 2),
            "shipping": round(shipping, 2),
            "mp_gst": round(mp_gst, 2),
            "tcs": round(tcs, 2),
            "ads": round(ads, 2),
            "stdcost": round(std_cost, 2),
            "stdCost": round(std_cost, 2),
            "gsttopay": round(gst_to_pay, 2),
            "claim_amount": round(claim_amt, 2),
            "exp_settlement": round(settlement, 2),
            "profit": round(profit, 2),
            "grossprofit": round(gross_profit, 2),
            "grossprofitper": profit_pct,
            "profitmargin": profit_pct,
            "rowcount": len(rows),
        })

    # Compute overall totals by summing channel summary
    total_gross_qty = sum(c["grossqty"] for c in channel_summary)
    total_net_qty = sum(c["netqty"] for c in channel_summary)
    total_return_qty = sum(c["returnqty"] for c in channel_summary)
    total_gross_sales = sum(c["grosssales"] for c in channel_summary)
    total_net_sales = sum(c["netsales"] for c in channel_summary)
    total_mp_fees = sum(c["mpfees"] for c in channel_summary)
    total_shipping = sum(c["shippingfees"] for c in channel_summary)
    total_ads = sum(c["ads"] for c in channel_summary)
    total_std_cost = sum(c["stdcost"] for c in channel_summary)
    total_gst_to_pay = sum(c["gsttopay"] for c in channel_summary)
    total_claim_amt = sum(c["claim_amount"] for c in channel_summary)
    total_settlement = sum(c["exp_settlement"] for c in channel_summary)
    total_profit = sum(c["profit"] for c in channel_summary)
    total_gross_profit = sum(c["grossprofit"] for c in channel_summary)

    total_ret_pct = round((total_return_qty / total_gross_qty * 100), 2) if total_gross_qty else 0.0
    total_profit_pct = round((total_profit / total_net_sales * 100), 2) if total_net_sales else 0.0

    totals = {
        "grossqty": total_gross_qty,
        "netqty": total_net_qty,
        "returnqty": total_return_qty,
        "retpercent": total_ret_pct,
        "grosssales": round(total_gross_sales, 2),
        "netsales": round(total_net_sales, 2),
        "mpfees": round(total_mp_fees, 2),
        "shippingfees": round(total_shipping, 2),
        "shipping": round(total_shipping, 2),
        "ads": round(total_ads, 2),
        "stdcost": round(total_std_cost, 2),
        "stdCost": round(total_std_cost, 2),
        "gsttopay": round(total_gst_to_pay, 2),
        "claim_amount": round(total_claim_amt, 2),
        "exp_settlement": round(total_settlement, 2),
        "profit": round(total_profit, 2),
        "grossprofit": round(total_gross_profit, 2),
        "grossprofitper": total_profit_pct,
        "profitmargin": total_profit_pct,
    }

    return Response({
        "status": True,
        "message": "Success",
        "response": channel_summary,
        "totals": totals,
        "pagination": {
            "pageNo": 0,
            "pageSize": 25,
            "total": len(channel_summary)
        }
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def combined_profitability_monthwise(request):
    """
    Returns monthly summarized profitability data using the exact same calculation logic
    as combined_profitability_details_transactions_shipping for complete formula parity across the app.
    """
    data_source_raw = getattr(request, 'data', None) or (request.POST if request.method == 'POST' else request.GET)
    data_source = {}
    if data_source_raw:
        if hasattr(data_source_raw, 'dict'):
            data_source.update(data_source_raw.dict())
        elif isinstance(data_source_raw, dict):
            data_source.update(data_source_raw)
            
    f_child = data_source.get('filter') or data_source.get('filters') or {}
    if isinstance(f_child, dict):
        data_source.update(f_child)

    def find_val(keys):
        for k in keys:
            v = data_source.get(k)
            if isinstance(v, list) and len(v) > 0: v = v[0]
            if v and str(v).strip(): return str(v).strip()
            for sk, sv in data_source.items():
                if sk.lower() == k.lower():
                    if isinstance(sv, list) and len(sv) > 0: sv = sv[0]
                    if sv and str(sv).strip(): return str(sv).strip()
        return None

    from_date_str = find_val(['fromDate', 'start_date', 'from_date', 'startDate'])
    to_date_str = find_val(['toDate', 'end_date', 'to_date', 'endDate'])

    def parse_dt(dt_str, is_end=False):
        if not dt_str or len(str(dt_str)) < 10:
            return (timezone.now() - timedelta(days=60)) if not is_end else timezone.now()
        try:
            clean_str = str(dt_str).split('T')[0]
            dt = datetime.strptime(clean_str, '%Y-%m-%d')
            if is_end:
                dt = dt.replace(hour=23, minute=59, second=59)
            return dt
        except Exception:
            return (timezone.now() - timedelta(days=60)) if not is_end else timezone.now()

    start_date = parse_dt(from_date_str, False)
    end_date = parse_dt(to_date_str, True)

    channels = data_source.get('channel') or data_source.get('channels')
    if isinstance(channels, dict) and 'IN' in channels:
        channels = channels['IN']
    elif not isinstance(channels, list):
        channels = ['Amazon-India', 'Myntra']

    curr = start_date.replace(day=1).date() if isinstance(start_date, datetime) else start_date.replace(day=1)
    last = end_date.replace(day=1).date() if isinstance(end_date, datetime) else end_date.replace(day=1)

    factory = APIRequestFactory()
    response_list = []

    while curr <= last:
        _, max_day = monthrange(curr.year, curr.month)
        m_start = f'{curr.year:04d}-{curr.month:02d}-01'
        m_end = f'{curr.year:04d}-{curr.month:02d}-{max_day:02d}'
        month_key = curr.strftime('%m-%Y')

        m_filters = {
            'channel': {'IN': channels},
            'fromDate': m_start,
            'toDate': m_end
        }

        month_req = factory.post('/api/amazon/profitability/details/', {'filters': m_filters}, format='json')
        force_authenticate(month_req, user=get_effective_user(request.user))

        res = combined_profitability_details_transactions_shipping(month_req)
        detail_rows = res.data.get('response', []) if res.status_code == 200 and isinstance(res.data, dict) else []

        gross_qty = sum(_parse_num_safe(r.get('grossqty')) for r in detail_rows)
        net_qty = sum(_parse_num_safe(r.get('final_net_qty') or r.get('netqty')) for r in detail_rows)
        return_qty = sum(_parse_num_safe(r.get('returnqty')) for r in detail_rows)
        claim_qty = sum(_parse_num_safe(r.get('claim_count')) for r in detail_rows)
        courier_ret = sum(_parse_num_safe(r.get('courier_return_count')) for r in detail_rows)

        gross_sales = sum(_parse_num_safe(r.get('grosssales')) for r in detail_rows)
        net_sales = sum(_parse_num_safe(r.get('final_net_sales') or r.get('netsales')) for r in detail_rows)
        mp_fees = sum(_parse_num_safe(r.get('estimatefees') or r.get('mpfees')) for r in detail_rows)
        shipping = sum(_parse_num_safe(r.get('shippingfees') or r.get('shipping')) for r in detail_rows)
        ads = sum(_parse_num_safe(r.get('ads')) for r in detail_rows)
        std_cost = sum(_parse_num_safe(r.get('stdcost')) for r in detail_rows)
        claim_amt = sum(_parse_num_safe(r.get('claim_amount')) for r in detail_rows)
        profit = sum(_parse_num_safe(r.get('profit')) for r in detail_rows)
        return_sales = sum(_parse_num_safe(r.get('customer_return_price')) for r in detail_rows)

        ret_pct = round((return_qty / gross_qty * 100), 2) if gross_qty else 0.0
        profit_pct = round((profit / net_sales * 100), 2) if net_sales else 0.0
        gross_asp = round(gross_sales / gross_qty, 2) if gross_qty else 0.0
        net_asp = round(net_sales / net_qty, 2) if net_qty else 0.0
        tacos = round(abs(ads) / net_sales * 100, 2) if net_sales else 0.0

        response_list.append({
            'month': month_key,
            'grossqty': int(gross_qty),
            'netqty': int(net_qty),
            'claimqty': int(claim_qty),
            'cancelledcanqty': 0,
            'cancelledrtoqty': int(courier_ret),
            'returnedrtoqty': int(courier_ret),
            'returnedcreturnqty': int(return_qty),
            'replacedqty': 0,
            'grosssales': round(gross_sales, 2),
            'cancelledcansales': 0.0,
            'cancelledrtosales': 0.0,
            'returnedrtosales': 0.0,
            'returnedcreturnsales': round(abs(return_sales), 2),
            'claimsales': round(claim_amt, 2),
            'netsales': round(net_sales, 2),
            'marketplacefees': round(mp_fees, 2),
            'shipfees': round(shipping, 2),
            'stdcost': round(std_cost, 2),
            'ads': round(ads, 2),
            'accountcharges': 0.0,
            'otherfees': 0.0,
            'profit': round(profit, 2),
            'grossasp': gross_asp,
            'netasp': net_asp,
            'tacos': tacos,
            'retpercent': ret_pct,
            'profitmargin': profit_pct
        })

        if curr.month == 12:
            curr = curr.replace(year=curr.year + 1, month=1)
        else:
            curr = curr.replace(month=curr.month + 1)

    return Response({
        "status": True,
        "message": "Success",
        "message_code": "E1",
        "response": response_list
    })


