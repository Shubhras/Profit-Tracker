import json
import datetime
from django.http import HttpResponse, HttpRequest, Http404
from django.core.files.base import ContentFile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status

# Import analytical views
from .views import (
    amazon_profitability_details_transactions_shipping,
    amazon_profitability_parent_transactions_shipping,
    sku_profit_report_transactions_shipping,
    sku_profitability_list_filtered,
    get_profitability_monthwise,
    get_amazon_data_reconcile_paymentsummary,
    get_bank_transfer_workflow
)
from .profit import (
    combined_profitability_details_transactions_shipping,
    combined_profitability_parent_transactions_shipping,
    combined_sku_profit_report_transactions_shipping,
    get_undecorated_view
)
from .reconcile import (
    AmazonTransactionsGroupedAPIView,
    AmazonOrderRelatedTransactionsAPIView,
    AmazonRefundTransactionsAPIView
)

from .models import ExportedReport
from .export_utils import generate_csv, generate_xlsx, generate_pdf

def get_data_from_view(view_func_or_class, request, override_params=None):
    if hasattr(request, '_request'):
        django_req = request._request
    else:
        django_req = request
        
    # Copy query params if GET available
    if hasattr(request, 'GET') and request.GET:
        django_req.GET = request.GET.copy()
    
    # Apply GET overrides
    if override_params and "GET" in override_params:
        if not hasattr(django_req, 'GET') or django_req.GET is None:
            django_req.GET = {}
        for gk, gv in override_params["GET"].items():
            django_req.GET[gk] = gv

    # Parse channel filter if present in query params or request data
    channel_list = []
    get_channel = None
    if hasattr(request, 'GET'):
        get_channel = request.GET.get("channel") or request.GET.get("filters[channel]")
    if get_channel:
        if isinstance(get_channel, str):
            if get_channel.lower() in ["all", "combined"]:
                channel_list = ["Amazon-India", "Myntra"]
            else:
                channel_list = [c.strip() for c in get_channel.split(",") if c.strip()]
        elif isinstance(get_channel, list):
            channel_list = get_channel
            
    # Handle POST data
    post_data = {}
    if request.method == 'POST':
        if hasattr(request, 'data') and isinstance(request.data, dict):
            post_data.update(request.data)
        elif getattr(request, 'body', None):
            try:
                post_data.update(json.loads(request.body.decode('utf-8')))
            except:
                pass
        if override_params and 'POST' in override_params:
            post_data.update(override_params['POST'])
            
        filters = post_data.setdefault("filters", {})
        if not isinstance(filters, dict):
            filters = {}
            post_data["filters"] = filters

        if channel_list and "channel" not in filters:
            filters["channel"] = {"IN": channel_list}
            
        django_req._body = json.dumps(post_data).encode('utf-8')
        django_req.META['CONTENT_TYPE'] = 'application/json'
    else:
        # Construct DRF POST payload for GET requests if target view requires POST filters
        post_data = {"pagination": {"pageNo": 0, "pageSize": 100000}}
        filters = {}
        if channel_list:
            filters["channel"] = {"IN": channel_list}
        
        from_date_val = request.GET.get("fromDate") or request.GET.get("from_date") or request.GET.get("startDate")
        if from_date_val:
            filters["fromDate"] = from_date_val
            
        to_date_val = request.GET.get("toDate") or request.GET.get("to_date") or request.GET.get("endDate")
        if to_date_val:
            filters["toDate"] = to_date_val
            
        search_val = request.GET.get("search") or request.GET.get("q") or request.GET.get("searchTerm")
        if search_val:
            filters["search"] = search_val

        if override_params and 'POST' in override_params:
            post_data.update(override_params['POST'])

        post_data["filters"] = filters
        django_req._body = json.dumps(post_data).encode('utf-8')
        django_req.META['CONTENT_TYPE'] = 'application/json'

    from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
    drf_req = Request(django_req, parsers=[JSONParser(), FormParser(), MultiPartParser()])
    drf_req.user = getattr(request, 'user', None)
    drf_req._full_data = post_data
    
    if hasattr(view_func_or_class, 'as_view'):
        view_func = view_func_or_class.as_view()
        response = view_func(drf_req)
    else:
        target_func = get_undecorated_view(view_func_or_class)
        response = target_func(drf_req)
        
    if hasattr(response, 'data'):
        return response.data
    else:
        try:
            return json.loads(response.content.decode('utf-8'))
        except:
            return {}

def generic_export_view(request, view_func_or_class, column_mapping, filename_base, response_format, override_params=None, list_key='results', totals_key='totals', formatter_func=None):
    from_date = None
    to_date = None
    
    # Try to extract dates from GET/POST
    date_source = {}
    if request.method == 'POST':
        if hasattr(request, 'data') and isinstance(request.data, dict):
            date_source = request.data.get("filters", {})
    else:
        date_source = request.GET
        
    for k in ['fromDate', 'from_date', 'start_date']:
        if k in date_source:
            try:
                from_date = datetime.datetime.strptime(str(date_source[k]), "%Y-%m-%d").date()
                break
            except:
                pass
                
    for k in ['toDate', 'to_date', 'end_date']:
        if k in date_source:
            try:
                to_date = datetime.datetime.strptime(str(date_source[k]), "%Y-%m-%d").date()
                break
            except:
                pass

    user = getattr(request, 'user', None)
    if user and not getattr(user, 'is_authenticated', False):
        user = None

    exported_report = None
    try:
        exported_report = ExportedReport.objects.create(
            user=user,
            report_type=filename_base,
            file_name=f"{filename_base}.{response_format}",
            format=response_format,
            from_date=from_date,
            to_date=to_date,
            status="PROCESSING"
        )
        
        # Call the target view
        data = get_data_from_view(view_func_or_class, request, override_params)
        
        # Format the list of data using custom formatter if provided
        if formatter_func:
            raw_list = data.get(list_key) if isinstance(data, dict) else (data if isinstance(data, list) else [])
            raw_totals = data.get(totals_key) if totals_key and isinstance(data, dict) else None
            res_formatter = formatter_func(raw_list, raw_totals)
            if isinstance(res_formatter, tuple) and len(res_formatter) == 2:
                data_list, totals_dict = res_formatter
            else:
                data_list = res_formatter
                totals_dict = None
        else:
            data_list = data.get(list_key) if isinstance(data, dict) else None
            if data_list is None and isinstance(data, dict):
                data_list = data.get('response') or data.get('results') or data.get('data') or []
            if not isinstance(data_list, list) and isinstance(data, list):
                data_list = data
            elif not isinstance(data_list, list):
                data_list = []
            totals_dict = data.get(totals_key) if totals_key and isinstance(data, dict) else None
            
        headers = list(column_mapping.values())
        keys = list(column_mapping.keys())
        
        # Generate file content based on format
        if response_format == 'csv':
            content_type = 'text/csv'
            file_data = generate_csv(data_list, headers, keys, totals_dict)
        elif response_format == 'xlsx':
            content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            file_data = generate_xlsx(data_list, headers, keys, totals_dict)
        else: # pdf
            content_type = 'application/pdf'
            file_data = generate_pdf(data_list, headers, keys, filename_base, totals_dict)
            
        # Save file to ExportedReport instance
        filename_with_ext = f"{filename_base}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.{response_format}"
        if exported_report:
            exported_report.file.save(filename_with_ext, ContentFile(file_data))
            exported_report.status = "COMPLETED"
            exported_report.save()
        
        # Return response with file download
        response = HttpResponse(file_data, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{filename_with_ext}"'
        return response
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        if exported_report:
            exported_report.status = "FAILED"
            exported_report.save()
        return Response({"success": False, "message": f"Export failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# COLUMN MAPPINGS
DETAILS_COLUMNS = {
    "channel": "Channel",
    "asin": "View",
    "netqty": "Gross Qty",
    "final_net_qty": "Net Qty",
    "returnqty": "Return Qty",
    "courier_return_count": "Courier Return Count",
    "customer_return_count": "Customer Return Count",
    "retpercent": "Return %",
    "promo_discount": "Promo Discount",
    "netsales": "Gross Sales",
    "final_net_sales": "Net Sales",
    "mpfees": "MP fees",
    "shippingfees": "Shipping",
    "mp_gst": "MP-GST",
    "tcs": "TCS",
    "ads": "Ad Spend",
    "taxable_value": "Taxable Value",
    "gst_to_pay_amount": "GST to Pay",
    "gst_to_pay_perc": "GST to Pay %",
    "claim_amount": "Claim Amount",
    "exp_settlement": "Expected Settlement",
    "stdcost": "Product Cost",
    "profit": "Profit",
    "grossprofitper": "Profit %"
}

def format_details_export(data_list, totals_dict=None):
    if not isinstance(data_list, list):
        data_list = []
        
    formatted_list = []
    for item in data_list:
        if not isinstance(item, dict):
            continue
        
        row = {}
        row['channel'] = item.get('channel', '')
        row['asin'] = item.get('asin') or item.get('view') or item.get('seller_sku') or item.get('child_sku') or ''
        row['netqty'] = item.get('netQty') if 'netQty' in item else (item.get('netqty') if 'netqty' in item else item.get('qty', item.get('grossqty', 0)))
        row['final_net_qty'] = item.get('final_net_qty') if item.get('final_net_qty') is not None else item.get('netqty', 0)
        row['returnqty'] = item.get('returnqty', 0)
        row['courier_return_count'] = item.get('courier_return_count', 0)
        row['customer_return_count'] = item.get('customer_return_count', 0)
        
        ret_perc = item.get('retpercent') if item.get('retpercent') is not None else item.get('returnPercent', 0)
        if isinstance(ret_perc, (int, float)):
            row['retpercent'] = f"{ret_perc}%"
        else:
            val = str(ret_perc or 0)
            row['retpercent'] = val if val.endswith('%') else f"{val}%"
            
        row['promo_discount'] = item.get('promo_discount', '₹0.0')
        row['netsales'] = item.get('netsales') or item.get('grosssales', '₹0.0')
        row['final_net_sales'] = item.get('final_net_sales', '₹0.0')
        
        row['mpfees'] = item.get('mpfees', '₹0.0')
        row['shippingfees'] = item.get('shippingfees') or item.get('shipping', '₹0.0')
        row['mp_gst'] = item.get('mp_gst', '₹0.0')
        row['tcs'] = item.get('tcs', '₹0.0')
        row['ads'] = item.get('ads') or item.get('adSpend', '₹0.0')
        row['taxable_value'] = item.get('taxable_value') or item.get('taxableValue', '₹0.0')
        row['gst_to_pay_amount'] = item.get('gst_to_pay_amount', '₹0.0')
        
        gst_perc = item.get('gst_to_pay_perc', 0)
        if isinstance(gst_perc, (int, float)):
            row['gst_to_pay_perc'] = f"{gst_perc}%"
        else:
            val = str(gst_perc or 0)
            row['gst_to_pay_perc'] = val if val.endswith('%') else f"{val}%"
            
        row['claim_amount'] = item.get('claim_amount', '₹0.0')
        row['exp_settlement'] = item.get('exp_settlement') or item.get('settleAmount', '₹0.0')
        row['stdcost'] = item.get('stdcost', '₹0.0')
        row['profit'] = item.get('profit', '₹0.0')
        
        prof_perc = item.get('grossprofitper') if item.get('grossprofitper') is not None else item.get('profitPercent', 0)
        if isinstance(prof_perc, (int, float)):
            row['grossprofitper'] = f"{prof_perc}%"
        else:
            val = str(prof_perc or 0)
            row['grossprofitper'] = val if val.endswith('%') else f"{val}%"
            
        formatted_list.append(row)
        
    formatted_totals = None
    if isinstance(totals_dict, dict):
        formatted_totals = {
            'channel': 'Total',
            'asin': '',
            'netqty': totals_dict.get('netqty') or totals_dict.get('qty', 0),
            'final_net_qty': totals_dict.get('total_final_net_qty') or totals_dict.get('final_net_qty', 0),
            'returnqty': totals_dict.get('totalreturn') or totals_dict.get('returnqty', 0),
            'courier_return_count': totals_dict.get('courier_return_count', 0),
            'customer_return_count': totals_dict.get('customer_return_count', 0),
            'retpercent': totals_dict.get('totalreturnper') or totals_dict.get('retpercent', '0%'),
            'promo_discount': totals_dict.get('total_promo_discount') or totals_dict.get('promo_discount', '₹0.0'),
            'netsales': totals_dict.get('netsales') or totals_dict.get('grosssales', '₹0.0'),
            'final_net_sales': totals_dict.get('total_final_net_sales') or totals_dict.get('final_net_sales', '₹0.0'),
            'mpfees': totals_dict.get('mpfees', '₹0.0'),
            'shippingfees': totals_dict.get('shippingfees') or totals_dict.get('shipping', '₹0.0'),
            'mp_gst': totals_dict.get('mp_gst', '₹0.0'),
            'tcs': totals_dict.get('tcs', '₹0.0'),
            'ads': totals_dict.get('ads', '₹0.0'),
            'taxable_value': totals_dict.get('taxable_value', '₹0.0'),
            'gst_to_pay_amount': totals_dict.get('gst_to_pay_amount', '₹0.0'),
            'gst_to_pay_perc': totals_dict.get('gst_to_pay_perc', '0%'),
            'claim_amount': totals_dict.get('total_claim_amount') or totals_dict.get('claim_amount', '₹0.0'),
            'exp_settlement': totals_dict.get('exp_settlement', '₹0.0'),
            'stdcost': totals_dict.get('stdcost', '₹0.0'),
            'profit': totals_dict.get('profit', '₹0.0'),
            'grossprofitper': f"{totals_dict.get('grossprofitper', 0)}%" if not str(totals_dict.get('grossprofitper', '')).endswith('%') else totals_dict.get('grossprofitper')
        }
        
    return formatted_list, formatted_totals

PARENT_COLUMNS = {
    "child_sku": "Child SKU / Style Code",
    **DETAILS_COLUMNS
}

SKU_REPORT_COLUMNS = {
    "order_id": "Order ID",
    "date": "Order Date",
    "name": "Title",
    "channel": "Channel",
    "grossqty": "Gross Qty",
    "qty": "Net Qty",
    "final_net_qty": "Final Net Qty",
    "grosssales": "Gross Sales",
    "netsales": "Net Sales",
    "final_net_sales": "Final Net Sales",
    "taxable_value": "Taxable Value",
    "gst_to_pay_amount": "GST to Pay",
    "gst_to_pay_perc": "GST to Pay %",
    "ads": "Ad Spend",
    "mpfees": "MP Fees",
    "mp_gst": "MP GST",
    "estimatefees": "Estimated Fees",
    "referral_fee": "Referral Fee",
    "closing_fee": "Closing Fee",
    "per_item_fee": "Per Item Fee",
    "fba_fee": "FBA Fee",
    "fba_pick_pack_fee": "FBA Pick & Pack Fee",
    "fba_weight_handling_fee": "FBA Weight Handling Fee",
    "tax_amount": "Tax Amount",
    "shippingfees": "Shipping Fees",
    "profit": "Profit",
    "grossprofitper": "Profit %",
    "returnqty": "Return Qty",
    "retpercent": "Return %",
    "tacos": "TACOS %",
    "stdcost": "Product Cost",
    "tcs": "TCS",
    "exp_settlement": "Expected Settlement",
    "promo_discount": "Promo Discount",
    "return_amount": "Return Amount",
    "courier_return_count": "Courier Return Qty",
    "customer_return_count": "Customer Return Qty",
    "courier_return_price": "Courier Return Price",
    "customer_return_price": "Customer Return Price",
    "claim_count": "Claim Qty",
    "claim_amount": "Claim Amount",
    "replacement_return_count": "Replacement Return Qty"
}

MONTHWISE_COLUMNS = {
    "month": "Month",
    "grossqty": "Gross Qty",
    "netqty": "Net Qty",
    "cancelledcanqty": "Cancelled Can Qty",
    "returnedcreturnqty": "Customer Return Qty",
    "claimqty": "Claim Qty",
    "grosssales": "Gross Sales",
    "cancelledcansales": "Cancelled Can Sales",
    "returnedcreturnsales": "Customer Return Sales",
    "claimsales": "Claim Sales",
    "netsales": "Net Sales",
    "mpfees": "MP Fees",
    "shipfees": "Shipping Fees",
    "ads": "Ad Spend",
    "stdcost": "COGS",
    "settledamount": "Settled Amount",
    "profit": "Profit",
    "retpercent": "Return %",
    "tacos": "TACOS %",
    "profitmargin": "Profit Margin %",
    "grossasp": "Gross ASP",
    "netasp": "Net ASP"
}

PAYMENT_SUMMARY_COLUMNS = {
    "metric": "Metric",
    "count": "Count",
    "amount": "Amount"
}

BANK_TRANSFER_COLUMNS = {
    "metric": "Metric",
    "value": "Value"
}

GROUPED_TRANSACTIONS_COLUMNS = {
    "settlement_date": "Settlement Date",
    "sales": "Sales",
    "refunds": "Refunds",
    "expenses": "Expenses",
    "others": "Others",
    "payout_amount": "Payout Amount",
    "total_transactions": "Total Transactions"
}

TRANSACTION_COLUMNS = {
    "transaction_id": "Transaction ID",
    "order_id": "Order ID",
    "transaction_type": "Transaction Type",
    "transaction_status": "Transaction Status",
    "description": "Description",
    "posted_date": "Posted Date",
    "total_amount": "Total Amount",
    "currency_code": "Currency Code"
}

# FORMATTERS FOR CARD SUMMARIES
def format_payment_summary(response_data):
    data = response_data.get("data", [{}, {}]) if isinstance(response_data, dict) else [{}, {}]
    row0 = data[0] if isinstance(data, list) and len(data) > 0 else {}
    return [
        {
            "metric": "Settled Orders",
            "count": row0.get("settledorderscount", 0),
            "amount": row0.get("settledordersamount", 0.0)
        },
        {
            "metric": "Unsettled Variance",
            "count": row0.get("unsettledvariancecount", 0),
            "amount": row0.get("unsettledvarianceamount", 0.0)
        },
        {
            "metric": "Bank Variance",
            "count": row0.get("bankvariancecount", 0),
            "amount": row0.get("bankvarianceamount", 0.0)
        }
    ]

def format_bank_transfer(response_data):
    data = response_data.get("data", {}) if isinstance(response_data, dict) else {}
    metrics = [
        ("Remittance Amount", data.get("remittance_amount", 0.0)),
        ("Negative Adjustment", data.get("negative_adjustment", 0.0)),
        ("Total", data.get("total", 0.0)),
        ("Orders Paid", data.get("orders_paid", 0.0)),
        ("Fees", data.get("fees", 0.0)),
        ("TDS", data.get("tds", 0.0)),
        ("Promotions", data.get("promotions", 0.0)),
        ("Advertisement Cost", data.get("advertisement_cost", 0.0)),
        ("Reserve Adjustment", data.get("reserve_adjustment", 0.0)),
        ("Other Adjustment", data.get("other_adjustment", 0.0)),
    ]
    return [{"metric": m[0], "value": m[1]} for m in metrics]

# EXPORT VIEWS
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_profitability_details(request):
    print("DEBUG 1 - ENTER EXPORT VIEW")
    try:
        response_format = (request.query_params.get("file_format") or request.query_params.get("export_format") or request.query_params.get("format") or "xlsx").lower()
        print("DEBUG 2 - GOT FORMAT", response_format)
        override_params = {
            "POST": {
                "pagination": {"pageNo": 0, "pageSize": 100000}
            }
        }
        print("DEBUG 3 - CALLING GENERIC EXPORT VIEW")
        res = generic_export_view(
            request,
            combined_profitability_details_transactions_shipping,
            DETAILS_COLUMNS,
            "profitability_details",
            response_format,
            override_params=override_params,
            list_key="response",
            totals_key="totals",
            formatter_func=format_details_export
        )
        print("DEBUG 4 - GENERIC EXPORT VIEW RETURNED", type(res), getattr(res, 'status_code', None))
        return res
    except Exception as e:
        import traceback
        print("DEBUG EXCEPTION IN EXPORT VIEW:")
        traceback.print_exc()
        raise e

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_profitability_details_by_parent_asin(request):
    response_format = (request.query_params.get("file_format") or request.query_params.get("export_format") or request.query_params.get("format") or "xlsx").lower()
    override_params = {
        "POST": {
            "pagination": {"pageNo": 0, "pageSize": 100000}
        }
    }
    return generic_export_view(
        request,
        combined_profitability_parent_transactions_shipping,
        PARENT_COLUMNS,
        "profitability_details_by_parent_asin",
        response_format,
        override_params=override_params,
        list_key="response",
        totals_key="totals",
        formatter_func=format_details_export
    )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_sku_profit_report(request):
    response_format = (request.query_params.get("file_format") or request.query_params.get("export_format") or request.query_params.get("format") or "xlsx").lower()
    override_params = {
        "POST": {
            "pagination": {"pageNo": 0, "pageSize": 100000}
        }
    }
    return generic_export_view(
        request,
        combined_sku_profit_report_transactions_shipping,
        SKU_REPORT_COLUMNS,
        "sku_profit_report",
        response_format,
        override_params=override_params,
        list_key="response",
        totals_key="totals"
    )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_sku_profitability_list_filtered(request):
    response_format = (request.query_params.get("file_format") or request.query_params.get("export_format") or request.query_params.get("format") or "xlsx").lower()
    override_params = {
        "POST": {
            "pagination": {"pageNo": 0, "pageSize": 100000}
        }
    }
    return generic_export_view(
        request,
        sku_profitability_list_filtered,
        PARENT_COLUMNS,
        "sku_profitability_list_filtered",
        response_format,
        override_params=override_params,
        list_key="response",
        totals_key="totals",
        formatter_func=format_details_export
    )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_profitability_monthwise(request):
    response_format = request.query_params.get("format", "xlsx").lower()
    return generic_export_view(
        request,
        get_profitability_monthwise,
        MONTHWISE_COLUMNS,
        "profitability_monthwise",
        response_format,
        list_key="response",
        totals_key=None
    )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_paymentsummary(request):
    response_format = request.query_params.get("format", "xlsx").lower()
    return generic_export_view(
        request,
        get_amazon_data_reconcile_paymentsummary,
        PAYMENT_SUMMARY_COLUMNS,
        "reconcile_paymentsummary",
        response_format,
        formatter_func=format_payment_summary
    )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_bank_transfer_workflow(request):
    response_format = request.query_params.get("format", "xlsx").lower()
    return generic_export_view(
        request,
        get_bank_transfer_workflow,
        BANK_TRANSFER_COLUMNS,
        "bank_transfer_workflow",
        response_format,
        formatter_func=format_bank_transfer
    )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_grouped_transactions(request):
    response_format = request.query_params.get("format", "xlsx").lower()
    override_params = {
        "GET": {"page_size": 100000, "page": 1}
    }
    return generic_export_view(
        request,
        AmazonTransactionsGroupedAPIView,
        GROUPED_TRANSACTIONS_COLUMNS,
        "grouped_transactions",
        response_format,
        override_params=override_params,
        list_key="results",
        totals_key=None
    )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_order_settlement_dashboard(request):
    response_format = request.query_params.get("format", "xlsx").lower()
    override_params = {
        "GET": {"page_size": 100000, "page": 1}
    }
    return generic_export_view(
        request,
        AmazonOrderRelatedTransactionsAPIView,
        TRANSACTION_COLUMNS,
        "order_settlement_dashboard",
        response_format,
        override_params=override_params,
        list_key="results",
        totals_key=None
    )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_refund_transactions(request):
    response_format = request.query_params.get("format", "xlsx").lower()
    override_params = {
        "GET": {"page_size": 100000, "page": 1}
    }
    return generic_export_view(
        request,
        AmazonRefundTransactionsAPIView,
        TRANSACTION_COLUMNS,
        "refund_transactions",
        response_format,
        override_params=override_params,
        list_key="results",
        totals_key=None
    )

# EXPORT HISTORY AND DOWNLOAD
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_export_history(request):
    exports = ExportedReport.objects.filter(user=request.user).order_by("-created_at")
    data = []
    for exp in exports:
        data.append({
            "id": exp.id,
            "report_type": exp.report_type,
            "file_name": exp.file_name,
            "format": exp.format,
            "from_date": str(exp.from_date) if exp.from_date else None,
            "to_date": str(exp.to_date) if exp.to_date else None,
            "status": exp.status,
            "created_at": exp.created_at.isoformat(),
            "download_url": f"/exports/history/{exp.id}/download/"
        })
    return Response({"success": True, "results": data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_export_file(request, export_id):
    try:
        exp = ExportedReport.objects.get(id=export_id, user=request.user)
    except ExportedReport.DoesNotExist:
        raise Http404("Export not found")
        
    if exp.status != "COMPLETED" or not exp.file:
        return Response({"success": False, "message": "File not ready or failed to generate"}, status=status.HTTP_400_BAD_REQUEST)
        
    file_content = exp.file.read()
    
    if exp.format == 'csv':
        content_type = 'text/csv'
    elif exp.format == 'xlsx':
        content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    else:
        content_type = 'application/pdf'
        
    response = HttpResponse(file_content, content_type=content_type)
    response['Content-Disposition'] = f'attachment; filename="{exp.file_name}"'
    return response
