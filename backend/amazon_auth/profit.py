from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decimal import Decimal
from django.http import JsonResponse
from datetime import datetime

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
        
        if total_final_net_qty > 0:
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
        else:
            profit_perc = profit
            
        combined.update({
            "ads": format_currency(ads),
            "netqty": netqty,
            "total_final_net_qty": total_final_net_qty,
            "totalreturn": totalreturn,
            "totalreturnper": f"{round(return_percentage, 2)}%",
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
            "gst_to_pay_perc": f"{round((get_sum('gst_to_pay_amount') / get_sum('taxable_value') * Decimal(100)), 2) if get_sum('taxable_value') else 1}%",
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
        })
        
    elif type == "order":
        total_qty = get_sum("total_netquantity", is_currency=False)
        total_returns = get_sum("total_returns", is_currency=False)
        
        if total_qty > 0:
            return_percentage = (Decimal(total_returns) / Decimal(total_qty)) * Decimal(100)
        else:
            return_percentage = Decimal(0)
            
        grosssales = get_sum("grosssales")
        netsales = get_sum("netsales")
        profit = get_sum("profit")
        
        if netsales > 0:
            profit_perc = (profit / netsales) * Decimal(100)
        else:
            profit_perc = Decimal(0)
            
        combined.update({
            "grosssales": float(round(grosssales, 2)),
            "netsales": format_currency(netsales),
            "total_netquantity": total_qty,
            "profit": format_currency(profit),
            "total_returns": total_returns,
            "total_ret_percent": f"{round(return_percentage, 2)}%",
            "totalprofitmargin": float(round(profit_perc, 2)),
            
            "adSpend": format_currency(get_sum("adSpend")),
            "mpfees": float(round(get_sum("mpfees"), 2)),
            "mp_gst": format_currency(get_sum("mp_gst")),
            "estimatefees": format_currency(-abs(get_sum("estimatefees"))),
            "total_new_mpfees": format_currency(get_sum("total_new_mpfees")),
            "shipping": format_currency(get_sum("shipping")),
            "gst": format_currency(0),
            "tcs": format_currency(get_sum("tcs")),
            "cost": format_currency(get_sum("cost")),
            
            "taxable_value": format_currency(get_sum("taxable_value")),
            "gst_to_pay_amount": format_currency(get_sum("gst_to_pay_amount")),
            "gst_to_pay_perc": f"{round((get_sum('gst_to_pay_amount') / get_sum('taxable_value') * Decimal(100)), 2) if get_sum('taxable_value') else 1}%",
            "exp_settlement": format_currency(get_sum("exp_settlement")),
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

        grossqty = _safe_int(row.get("grossqty") or row.get("gross_qty") or row.get("qty"))
        netqty = _safe_int(row.get("netqty") or row.get("net_qty") or row.get("qty"))
        qty = netqty
        final_net_qty = _safe_int(row.get("final_net_qty") or row.get("net_qty") or netqty)
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
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def combined_profitability_details_transactions_shipping(request):
    user = request.user
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
        return undecorated(request)
        
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
    user = request.user
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
        return undecorated(request)
        
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
        
        style_id = parent_ids[0] if parent_ids else None
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
    user = request.user
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
    
    channels = filters.get("channel", {}).get("IN", []) if isinstance(filters.get("channel"), dict) else []
    
    has_myntra = "Myntra" in channels
    has_amazon = "Amazon-India" in channels or len(channels) == 0
    
    if has_amazon and not has_myntra:
        undecorated = get_undecorated_view(sku_profit_report_transactions_shipping)
        return undecorated(request)
        
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
        
        if sku:
            myntra_raw_rows = summary.execute(seller_sku=sku)
        else:
            myntra_raw_rows = []
            
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
    profit = Decimal(0)
    mp_fees = Decimal(0)
    shipping_fees = Decimal(0)
    ads = Decimal(0)
    
    gross_qty = 0
    net_qty = 0
    return_qty = 0
    courier_return_count = 0
    customer_return_count = 0
    claim_count = 0
    claim_amount = Decimal(0)
    
    for r in myntra_raw_rows:
        gross_sales += Decimal(str(r.get("gross_sales") or 0))
        net_sales += Decimal(str(r.get("net_sales") or 0))
        profit += Decimal(str(r.get("profit") or 0))
        mp_fees += Decimal(str(r.get("mp_fees") or 0))
        shipping_fees += Decimal(str(r.get("shipping_fees") or 0))
        ads += Decimal(str(r.get("ads") or 0))
        
        gross_qty += int(r.get("gross_qty") or 0)
        net_qty += int(r.get("net_qty") or 0)
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
        "profit": profit,
        "mp_fees": mp_fees,
        "shipping_fees": shipping_fees,
        "ads": ads,
        "gross_qty": gross_qty,
        "net_qty": net_qty,
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
    combined_final_net_sales = am_final_net_sales + m_sales
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
    user = request.user
    
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
