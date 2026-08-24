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
from .payment_reconcyle import (
    combined_payment_reconcile_overview,
    combined_payment_reconcile_by_parent_asin,
    combined_payment_reconcile_by_parentproductid
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
        
        from_date_val = request.GET.get("fromDate") or request.GET.get("from_date") or request.GET.get("startDate") or request.GET.get("start_date")
        if from_date_val:
            filters["fromDate"] = from_date_val
            filters["start_date"] = from_date_val
            post_data["start_date"] = from_date_val
            
        to_date_val = request.GET.get("toDate") or request.GET.get("to_date") or request.GET.get("endDate") or request.GET.get("end_date")
        if to_date_val:
            filters["toDate"] = to_date_val
            filters["endDate"] = to_date_val
            filters["end_date"] = to_date_val
            post_data["end_date"] = to_date_val
            
        targeting_type_val = request.GET.get("targeting_type") or request.GET.get("targetingType")
        if targeting_type_val:
            filters["targeting_type"] = targeting_type_val
            post_data["targeting_type"] = targeting_type_val

        state_val = request.GET.get("state")
        if state_val:
            filters["state"] = state_val
            post_data["state"] = state_val

        campaign_id_val = request.GET.get("campaign_id") or request.GET.get("campaignId")
        if campaign_id_val:
            filters["campaign_id"] = campaign_id_val
            post_data["campaign_id"] = campaign_id_val

        search_val = request.GET.get("search") or request.GET.get("q") or request.GET.get("searchTerm")
        if search_val:
            filters["search"] = search_val
            post_data["search"] = search_val

        if override_params and 'POST' in override_params:
            post_data.update(override_params['POST'])

        post_data["filters"] = filters
        django_req._body = json.dumps(post_data).encode('utf-8')
        django_req.META['CONTENT_TYPE'] = 'application/json'

    django_req.user = getattr(request, 'user', None)
    from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
    drf_req = Request(django_req, parsers=[JSONParser(), FormParser(), MultiPartParser()])
    drf_req.user = getattr(request, 'user', None)
    drf_req._full_data = post_data
    
    if hasattr(view_func_or_class, 'as_view'):
        view_func = view_func_or_class.as_view()
        response = view_func(django_req)
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

def parse_export_date(val):
    if not val:
        return None
    val_str = str(val).strip()
    if not val_str or val_str.lower() in ('none', 'null', '', 'undefined'):
        return None
    if len(val_str) >= 10:
        sub_str = val_str[:10]
        try:
            return datetime.datetime.strptime(sub_str, "%Y-%m-%d").date()
        except Exception:
            pass
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.datetime.strptime(val_str, fmt).date()
        except Exception:
            pass
    return None

def generic_export_view(request, view_func_or_class, column_mapping, filename_base, response_format, override_params=None, list_key='results', totals_key='totals', formatter_func=None, report_type_name=None):
    from_date = None
    to_date = None
    
    # Try to extract dates from GET/POST across filters dict, top-level data, and GET params
    sources_to_check = []
    if request.method == 'POST':
        if hasattr(request, 'data') and isinstance(request.data, dict):
            sources_to_check.append(request.data)
            filters_obj = request.data.get("filters")
            if isinstance(filters_obj, dict):
                sources_to_check.append(filters_obj)
    if hasattr(request, 'GET') and request.GET:
        sources_to_check.append(request.GET)

    from_date_keys = ['fromDate', 'from_date', 'start_date', 'startDate', 'from']
    to_date_keys = ['toDate', 'to_date', 'endDate', 'end_date', 'to']

    for src in sources_to_check:
        if not from_date:
            for k in from_date_keys:
                if k in src and src[k]:
                    from_date = parse_export_date(src[k])
                    if from_date:
                        break
        if not to_date:
            for k in to_date_keys:
                if k in src and src[k]:
                    to_date = parse_export_date(src[k])
                    if to_date:
                        break

    user = getattr(request, 'user', None)
    if user and not getattr(user, 'is_authenticated', False):
        user = None

    exported_report = None
    try:
        exported_report = ExportedReport.objects.create(
            user=user,
            report_type=report_type_name if report_type_name else filename_base,
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
            try:
                exported_report.file.save(filename_with_ext, ContentFile(file_data))
                exported_report.status = "COMPLETED"
                exported_report.save()
            except Exception as save_err:
                import traceback
                print(f"Warning: Could not save report file to disk media folder ({save_err}). Returning file directly.")
                traceback.print_exc()
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

def format_val_currency(val):
    if val is None or val == '' or val == '-':
        return '₹0.0'
    if isinstance(val, (int, float)):
        return f"₹{round(float(val), 2)}"
    val_str = str(val).strip()
    if val_str.startswith('₹') or val_str.startswith('-₹'):
        return val_str
    try:
        fval = float(val_str.replace('₹', '').replace(',', ''))
        return f"₹{round(fval, 2)}"
    except (ValueError, TypeError):
        return val_str

def format_sku_report_export(data_list, totals_dict=None):
    if not isinstance(data_list, list):
        data_list = []
        
    formatted_list = []
    tot_gross_q = 0
    tot_final_net_q = 0
    tot_ret_q = 0
    tot_cour_ret = 0
    tot_cust_ret = 0

    for item in data_list:
        if not isinstance(item, dict):
            continue
            
        g_q = int(item.get('grossqty', 0) or 0)
        f_net_q = int(item.get('final_net_qty') if item.get('final_net_qty') is not None else (item.get('qty', 0) or 0))
        r_q = int(item.get('returnqty', 0) or 0)
        cour_r = int(item.get('courier_return_count', 0) or 0)
        cust_r = int(item.get('customer_return_count', 0) or 0)

        tot_gross_q += g_q
        tot_final_net_q += f_net_q
        tot_ret_q += r_q
        tot_cour_ret += cour_r
        tot_cust_ret += cust_r

        row = {}
        row['order_id'] = item.get('order_id', '')
        row['date'] = str(item.get('date', ''))
        row['name'] = item.get('name', '')
        row['channel'] = item.get('channel', 'Amazon-India')
        
        row['grossqty'] = g_q
        row['final_net_qty'] = f_net_q
        row['returnqty'] = r_q
        row['courier_return_count'] = cour_r
        row['customer_return_count'] = cust_r
        
        ret_perc = item.get('retpercent') if item.get('retpercent') is not None else item.get('returnPercent', 0)
        if isinstance(ret_perc, (int, float)):
            row['retpercent'] = f"{round(float(ret_perc), 2)}%"
        else:
            val = str(ret_perc or 0)
            row['retpercent'] = val if val.endswith('%') else f"{val}%"
            
        row['promo_discount'] = format_val_currency(item.get('promo_discount'))
        row['netsales'] = format_val_currency(item.get('grosssales') if item.get('grosssales') is not None else item.get('netsales'))
        row['final_net_sales'] = format_val_currency(item.get('final_net_sales') or item.get('netsales'))
        
        row['mpfees'] = format_val_currency(item.get('mpfees') if item.get('mpfees') is not None else item.get('estimatefees'))
        row['shippingfees'] = format_val_currency(item.get('shippingfees') or item.get('shipping'))
        row['mp_gst'] = format_val_currency(item.get('mp_gst'))
        row['tcs'] = format_val_currency(item.get('tcs'))
        row['ads'] = format_val_currency(item.get('ads') or item.get('adSpend'))
        row['taxable_value'] = format_val_currency(item.get('taxable_value') or item.get('taxableValue'))
        row['gst_to_pay_amount'] = format_val_currency(item.get('gst_to_pay_amount'))
        
        gst_perc = item.get('gst_to_pay_perc', 0)
        if isinstance(gst_perc, (int, float)):
            row['gst_to_pay_perc'] = f"{round(float(gst_perc), 2)}%"
        else:
            val = str(gst_perc or 0)
            row['gst_to_pay_perc'] = val if val.endswith('%') else f"{val}%"
            
        row['claim_amount'] = format_val_currency(item.get('claim_amount'))
        row['exp_settlement'] = format_val_currency(item.get('exp_settlement') or item.get('settleAmount'))
        row['stdcost'] = format_val_currency(item.get('stdcost') or item.get('std'))
        row['profit'] = format_val_currency(item.get('profit'))
        
        prof_perc = item.get('grossprofitper') if item.get('grossprofitper') is not None else item.get('profitPercent', 0)
        if isinstance(prof_perc, (int, float)):
            row['grossprofitper'] = f"{round(float(prof_perc), 2)}%"
        else:
            val = str(prof_perc or 0)
            row['grossprofitper'] = val if val.endswith('%') else f"{val}%"
            
        formatted_list.append(row)
        
    formatted_totals = None
    if isinstance(totals_dict, dict):
        formatted_totals = {
            'order_id': 'Total',
            'date': '',
            'name': '',
            'channel': '',
            'grossqty': totals_dict.get('grossqty', tot_gross_q),
            'final_net_qty': totals_dict.get('total_final_net_qty') if totals_dict.get('total_final_net_qty') is not None else totals_dict.get('final_net_qty', tot_final_net_q),
            'returnqty': totals_dict.get('total_returns') if totals_dict.get('total_returns') is not None else (totals_dict.get('total_return_count') if totals_dict.get('total_return_count') is not None else totals_dict.get('returnqty', tot_ret_q)),
            'courier_return_count': totals_dict.get('courier_return_count', tot_cour_ret),
            'customer_return_count': totals_dict.get('customer_return_count', tot_cust_ret),
            'retpercent': str(totals_dict.get('total_ret_percent') or totals_dict.get('totalreturnper') or totals_dict.get('retpercent') or '0%'),
            'promo_discount': format_val_currency(totals_dict.get('total_promo_discount') or totals_dict.get('promo_discount')),
            'netsales': format_val_currency(totals_dict.get('grosssales') if totals_dict.get('grosssales') is not None else totals_dict.get('netsales')),
            'final_net_sales': format_val_currency(totals_dict.get('total_final_net_sales') or totals_dict.get('final_net_sales') or totals_dict.get('netsales')),
            'mpfees': format_val_currency(totals_dict.get('estimatefees') if totals_dict.get('estimatefees') is not None else totals_dict.get('mpfees')),
            'shippingfees': format_val_currency(totals_dict.get('shipping') or totals_dict.get('shippingfees')),
            'mp_gst': format_val_currency(totals_dict.get('mp_gst')),
            'tcs': format_val_currency(totals_dict.get('tcs')),
            'ads': format_val_currency(totals_dict.get('adSpend') or totals_dict.get('ads')),
            'taxable_value': format_val_currency(totals_dict.get('taxable_value')),
            'gst_to_pay_amount': format_val_currency(totals_dict.get('gst_to_pay_amount')),
            'gst_to_pay_perc': str(totals_dict.get('gst_to_pay_perc') or '0%'),
            'claim_amount': format_val_currency(totals_dict.get('total_claim_amount') or totals_dict.get('claim_amount')),
            'exp_settlement': format_val_currency(totals_dict.get('exp_settlement')),
            'stdcost': format_val_currency(totals_dict.get('cost') or totals_dict.get('stdcost')),
            'profit': format_val_currency(totals_dict.get('profit')),
            'grossprofitper': f"{totals_dict.get('totalprofitmargin') if totals_dict.get('totalprofitmargin') is not None else (totals_dict.get('grossprofitper') or 0)}%" if not str(totals_dict.get('totalprofitmargin') or totals_dict.get('grossprofitper') or '').endswith('%') else str(totals_dict.get('totalprofitmargin') or totals_dict.get('grossprofitper'))
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
    "final_net_qty": "Net Qty",
    "returnqty": "Return Qty",
    "courier_return_count": "Courier Return Count",
    "customer_return_count": "Customer Return Count",
    "retpercent": "Return %",
    "promo_discount": "Promo Discount",
    "netsales": "Gross Sales",
    "final_net_sales": "Net Sales",
    "mpfees": "MP Fees",
    "shippingfees": "Shipping Fees",
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
            "profit_asin_level",
            response_format,
            override_params=override_params,
            list_key="response",
            totals_key="totals",
            formatter_func=format_details_export,
            report_type_name="profit_asin_level"
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
        "profit_sku_level",
        response_format,
        override_params=override_params,
        list_key="response",
        totals_key="totals",
        formatter_func=format_details_export,
        report_type_name="profit_sku_level"
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
        "profit_order_level_report",
        response_format,
        override_params=override_params,
        list_key="response",
        totals_key="totals",
        formatter_func=format_sku_report_export,
        report_type_name="profit_order_level_report"
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

RECONCILE_DETAILS_COLUMNS = {
    "channel": "Channel",
    "asin": "Parent ASIN / Product",
    "netqty": "Gross Qty",
    "final_net_qty": "Net Qty",
    "returnqty": "Return Qty",
    "courier_return_count": "Courier Return Qty",
    "customer_return_count": "Customer Return Qty",
    "retpercent": "Return %",
    "promo_discount": "Promo Discount",
    "netsales": "Gross Sales",
    "final_net_sales": "Net Sales",
    "mpfees": "MP Fees",
    "shippingfees": "Shipping Fees",
    "mp_gst": "MP-GST",
    "tcs": "TCS",
    "actual_fees": "Actual MP Fees",
    "fees_leaks": "Fee Leaks",
    "actual_shipping_charges": "Actual Shipping",
    "shipping_leaks": "Shipping Leaks",
    "actual_mp_gst": "Actual MP-GST",
    "actual_tcs": "Actual TCS",
    "tcs_leaks": "TCS Leaks",
    "settlement_paid_in_bank": "Bank Settled Amount",
    "unsettled_not_paid": "Unsettled Amount",
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

RECONCILE_PARENT_COLUMNS = {
    "child_sku": "Child SKU / Style Code",
    **RECONCILE_DETAILS_COLUMNS
}

RECONCILE_ORDER_COLUMNS = {
    "order_id": "Order ID",
    "date": "Order Date",
    "name": "Title",
    "channel": "Channel",
    "grossqty": "Gross Qty",
    "final_net_qty": "Net Qty",
    "returnqty": "Return Qty",
    "courier_return_count": "Courier Return Count",
    "customer_return_count": "Customer Return Count",
    "retpercent": "Return %",
    "promo_discount": "Promo Discount",
    "netsales": "Gross Sales",
    "final_net_sales": "Net Sales",
    "mpfees": "MP Fees",
    "shippingfees": "Shipping Fees",
    "mp_gst": "MP-GST",
    "tcs": "TCS",
    "actual_fees": "Actual MP Fees",
    "fees_leaks": "Fee Leaks",
    "actual_shipping_charges": "Actual Shipping",
    "shipping_leaks": "Shipping Leaks",
    "actual_mp_gst": "Actual MP-GST",
    "actual_tcs": "Actual TCS",
    "tcs_leaks": "TCS Leaks",
    "settlement_paid_in_bank": "Bank Settled Amount",
    "unsettled_not_paid": "Unsettled Amount",
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

def format_reconcile_order_export(data_list, totals_dict=None):
    formatted_list, formatted_totals = format_sku_report_export(data_list, totals_dict)
    
    if isinstance(data_list, list):
        for idx, item in enumerate(data_list):
            if idx < len(formatted_list) and isinstance(item, dict):
                formatted_list[idx]['actual_fees'] = format_val_currency(item.get('actual_fees'))
                formatted_list[idx]['fees_leaks'] = format_val_currency(item.get('fees_leaks'))
                formatted_list[idx]['actual_shipping_charges'] = format_val_currency(item.get('actual_shipping_charges'))
                formatted_list[idx]['shipping_leaks'] = format_val_currency(item.get('shipping_leaks'))
                formatted_list[idx]['actual_mp_gst'] = format_val_currency(item.get('actual_mp_gst'))
                formatted_list[idx]['actual_tcs'] = format_val_currency(item.get('actual_tcs'))
                formatted_list[idx]['tcs_leaks'] = format_val_currency(item.get('tcs_leaks'))
                formatted_list[idx]['settlement_paid_in_bank'] = format_val_currency(item.get('settlement_paid_in_bank'))
                formatted_list[idx]['unsettled_not_paid'] = format_val_currency(item.get('unsettled_not_paid'))
                
    if isinstance(formatted_totals, dict) and isinstance(totals_dict, dict):
        formatted_totals['actual_fees'] = format_val_currency(totals_dict.get('total_actual_fees') or totals_dict.get('actual_fees'))
        formatted_totals['fees_leaks'] = format_val_currency(totals_dict.get('total_fees_leaks') or totals_dict.get('fees_leaks'))
        formatted_totals['actual_shipping_charges'] = format_val_currency(totals_dict.get('total_actual_shipping') or totals_dict.get('actual_shipping_charges'))
        formatted_totals['shipping_leaks'] = format_val_currency(totals_dict.get('total_shipping_leaks') or totals_dict.get('shipping_leaks'))
        formatted_totals['actual_mp_gst'] = format_val_currency(totals_dict.get('total_actual_mp_gst') or totals_dict.get('actual_mp_gst'))
        formatted_totals['actual_tcs'] = format_val_currency(totals_dict.get('total_actual_tcs') or totals_dict.get('actual_tcs'))
        formatted_totals['tcs_leaks'] = format_val_currency(totals_dict.get('total_tcs_leaks') or totals_dict.get('tcs_leaks'))
        formatted_totals['settlement_paid_in_bank'] = format_val_currency(totals_dict.get('total_settlement_paid_in_bank') or totals_dict.get('settlement_paid_in_bank'))
        formatted_totals['unsettled_not_paid'] = format_val_currency(totals_dict.get('total_unsettled_not_paid') or totals_dict.get('unsettled_not_paid'))
        
    return formatted_list, formatted_totals

def format_reconcile_details_export(data_list, totals_dict=None):
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

        row['actual_fees'] = item.get('actual_fees', '₹0.0')
        row['fees_leaks'] = item.get('fees_leaks', '₹0.0')
        row['actual_shipping_charges'] = item.get('actual_shipping_charges', '₹0.0')
        row['shipping_leaks'] = item.get('shipping_leaks', '₹0.0')
        row['actual_mp_gst'] = item.get('actual_mp_gst', '₹0.0')
        row['actual_tcs'] = item.get('actual_tcs', '₹0.0')
        row['tcs_leaks'] = item.get('tcs_leaks', '₹0.0')
        row['settlement_paid_in_bank'] = item.get('settlement_paid_in_bank', '₹0.0')
        row['unsettled_not_paid'] = item.get('unsettled_not_paid', '₹0.0')

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
            'actual_fees': totals_dict.get('total_actual_fees') or totals_dict.get('actual_fees', '₹0.0'),
            'fees_leaks': totals_dict.get('total_fees_leaks') or totals_dict.get('fees_leaks', '₹0.0'),
            'actual_shipping_charges': totals_dict.get('total_actual_shipping') or totals_dict.get('actual_shipping_charges', '₹0.0'),
            'shipping_leaks': totals_dict.get('total_shipping_leaks') or totals_dict.get('shipping_leaks', '₹0.0'),
            'actual_mp_gst': totals_dict.get('total_actual_mp_gst') or totals_dict.get('actual_mp_gst', '₹0.0'),
            'actual_tcs': totals_dict.get('total_actual_tcs') or totals_dict.get('actual_tcs', '₹0.0'),
            'tcs_leaks': totals_dict.get('total_tcs_leaks') or totals_dict.get('tcs_leaks', '₹0.0'),
            'settlement_paid_in_bank': totals_dict.get('total_settlement_paid_in_bank') or totals_dict.get('settlement_paid_in_bank', '₹0.0'),
            'unsettled_not_paid': totals_dict.get('total_unsettled_not_paid') or totals_dict.get('unsettled_not_paid', '₹0.0'),
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

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_payment_reconcile_overview(request):
    response_format = (request.query_params.get("file_format") or request.query_params.get("export_format") or request.query_params.get("format") or "xlsx").lower()
    override_params = {
        "POST": {
            "pagination": {"pageNo": 0, "pageSize": 100000}
        }
    }
    return generic_export_view(
        request,
        combined_payment_reconcile_overview,
        RECONCILE_DETAILS_COLUMNS,
        "payment_reconcile_asin_level",
        response_format,
        override_params=override_params,
        list_key="response",
        totals_key="totals",
        formatter_func=format_reconcile_details_export,
        report_type_name="payment_reconcile_asin_level"
    )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_payment_reconcile_by_parent_asin(request):
    response_format = (request.query_params.get("file_format") or request.query_params.get("export_format") or request.query_params.get("format") or "xlsx").lower()
    override_params = {
        "POST": {
            "pagination": {"pageNo": 0, "pageSize": 100000}
        }
    }
    return generic_export_view(
        request,
        combined_payment_reconcile_by_parent_asin,
        RECONCILE_PARENT_COLUMNS,
        "payment_reconcile_sku_level",
        response_format,
        override_params=override_params,
        list_key="response",
        totals_key="totals",
        formatter_func=format_reconcile_details_export,
        report_type_name="payment_reconcile_sku_level"
    )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_payment_reconcile_by_parentproductid(request):
    response_format = (request.query_params.get("file_format") or request.query_params.get("export_format") or request.query_params.get("format") or "xlsx").lower()
    override_params = {
        "POST": {
            "pagination": {"pageNo": 0, "pageSize": 100000}
        }
    }
    return generic_export_view(
        request,
        combined_payment_reconcile_by_parentproductid,
        RECONCILE_ORDER_COLUMNS,
        "payment_reconcile_order_level",
        response_format,
        override_params=override_params,
        list_key="response",
        totals_key="totals",
        formatter_func=format_reconcile_order_export,
        report_type_name="payment_reconcile_order_level"
    )

# EXPORT HISTORY AND DOWNLOAD
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_export_history(request):
    from django.db.models import Q
    if request.user and request.user.is_authenticated:
        exports = ExportedReport.objects.filter(Q(user=request.user) | Q(user__isnull=True)).order_by("-created_at")
    else:
        exports = ExportedReport.objects.filter(user__isnull=True).order_by("-created_at")
        
    # Search by report_type / file_name
    search = request.GET.get('search') or request.GET.get('report_type')
    if search:
        search = search.strip()
        exports = exports.filter(
            Q(report_type__icontains=search) | Q(file_name__icontains=search)
        )

    # Date range filter for created_at
    from_date = request.GET.get('from_date') or request.GET.get('start_date') or request.GET.get('date_from')
    to_date = request.GET.get('to_date') or request.GET.get('end_date') or request.GET.get('date_to')

    if from_date:
        try:
            d_from = str(from_date).split('T')[0].strip()
            if d_from:
                exports = exports.filter(created_at__date__gte=d_from)
        except Exception:
            pass

    if to_date:
        try:
            d_to = str(to_date).split('T')[0].strip()
            if d_to:
                exports = exports.filter(created_at__date__lte=d_to)
        except Exception:
            pass

    # Pagination (Backend only)
    total_count = exports.count()

    try:
        page = max(int(request.GET.get('page', 1)), 1)
    except (ValueError, TypeError):
        page = 1

    try:
        page_size = max(int(request.GET.get('page_size', 10)), 1)
    except (ValueError, TypeError):
        page_size = 10

    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    start = (page - 1) * page_size
    end = start + page_size
    paginated_exports = exports[start:end]

    data = []
    for exp in paginated_exports:
        data.append({
            "id": exp.id,
            "report_type": exp.report_type,
            "file_name": exp.file_name,
            "format": exp.format,
            "from_date": str(exp.from_date) if exp.from_date else None,
            "to_date": str(exp.to_date) if exp.to_date else None,
            "status": exp.status,
            "created_at": exp.created_at.isoformat() if exp.created_at else None,
            "download_url": f"/api/amazon/exports/history/{exp.id}/download/"
        })

    return Response({
        "success": True,
        "count": total_count,
        "total_pages": total_pages,
        "current_page": page,
        "page_size": page_size,
        "results": data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_export_file(request, export_id):
    from django.db.models import Q
    try:
        if request.user and request.user.is_authenticated:
            exp = ExportedReport.objects.get(Q(user=request.user) | Q(user__isnull=True), id=export_id)
        else:
            exp = ExportedReport.objects.get(user__isnull=True, id=export_id)
    except ExportedReport.DoesNotExist:
        raise Http404("Export not found")
        
    if exp.status != "COMPLETED" or not exp.file:
        return Response({"success": False, "message": "File not ready or failed to generate"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        file_content = exp.file.read()
    except Exception as e:
        return Response({"success": False, "message": f"File read error: {str(e)}"}, status=status.HTTP_404_NOT_FOUND)
        
    if exp.format == 'csv':
        content_type = 'text/csv'
    elif exp.format == 'xlsx':
        content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    else:
        content_type = 'application/pdf'
        
    response = HttpResponse(file_content, content_type=content_type)
    response['Content-Disposition'] = f'attachment; filename="{exp.file_name}"'
    return response


@api_view(['DELETE', 'POST'])
@permission_classes([IsAuthenticated])
def delete_export_file(request, export_id=None):
    from django.db.models import Q
    ids_to_delete = []
    if export_id:
        ids_to_delete.append(export_id)

    req_ids = request.data.get('ids') or request.data.get('export_ids')
    if req_ids and isinstance(req_ids, list):
        ids_to_delete.extend(req_ids)

    if not ids_to_delete:
        return Response({"success": False, "message": "No export ID provided"}, status=status.HTTP_400_BAD_REQUEST)

    if request.user and request.user.is_authenticated:
        exports = ExportedReport.objects.filter(Q(user=request.user) | Q(user__isnull=True), id__in=ids_to_delete)
    else:
        exports = ExportedReport.objects.filter(user__isnull=True, id__in=ids_to_delete)

    deleted_count = 0
    for exp in exports:
        try:
            if exp.file:
                exp.file.delete(save=False)
            exp.delete()
            deleted_count += 1
        except Exception:
            pass

    if deleted_count > 0:
        return Response({"success": True, "message": f"Successfully deleted {deleted_count} report(s)"})
    else:
        return Response({"success": False, "message": "No reports found or failed to delete"}, status=status.HTTP_404_NOT_FOUND)


CAMPAIGN_COLUMNS = {
    "name": "Campaign Name",
    "state": "State",
    "targeting_type": "Targeting Type",
    "daily_budget": "Daily Budget",
    "budget_type": "Budget Type",
    "bidding_strategy": "Bidding Strategy",
    "marketplace_budget_allocation": "Marketplace Budget Allocation",
    "start_date": "Start Date",
    "end_date": "End Date",
    "country_code": "Country Code",
    "currency_code": "Currency Code",
    "impressions": "Impressions",
    "clicks": "Clicks",
    "cost": "Cost",
    "sales": "Sales",
    "orders": "Orders",
    "units": "Units",
    "acos": "ACOS",
    "roas": "ROAS",
}


def format_campaigns_export(data_list, totals_dict=None):
    if not isinstance(data_list, list):
        data_list = []

    formatted = []
    for item in data_list:
        if not isinstance(item, dict):
            continue

        metrics = item.get("metrics") or {}
        if not isinstance(metrics, dict):
            metrics = {}

        formatted.append({
            "name": item.get("name", ""),
            "state": item.get("state", ""),
            "targeting_type": item.get("targeting_type", ""),
            "daily_budget": item.get("daily_budget", 0),
            "budget_type": item.get("budget_type", ""),
            "bidding_strategy": item.get("bidding_strategy", ""),
            "marketplace_budget_allocation": item.get("marketplace_budget_allocation", ""),
            "start_date": item.get("start_date", ""),
            "end_date": item.get("end_date", ""),
            "country_code": item.get("country_code", ""),
            "currency_code": item.get("currency_code", ""),
            "impressions": metrics.get("impressions", 0),
            "clicks": metrics.get("clicks", 0),
            "cost": metrics.get("cost", 0),
            "sales": metrics.get("sales", 0),
            "orders": metrics.get("orders", 0),
            "units": metrics.get("units", 0),
            "acos": metrics.get("acos", 0),
            "roas": metrics.get("roas", 0),
        })

    return formatted, None


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_amazon_ads_campaigns(request):
    from amazon_ads.views import CampaignListView

    response_format = (
        request.query_params.get("file_format")
        or request.query_params.get("export_format")
        or request.query_params.get("format")
        or "xlsx"
    ).lower()

    override_params = {
        "POST": {
            "page": 1,
            "page_size": 100000
        },
        "GET": {
            "page": 1,
            "page_size": 100000
        }
    }

    return generic_export_view(
        request,
        CampaignListView,
        CAMPAIGN_COLUMNS,
        "ads_campaings",
        response_format,
        override_params=override_params,
        list_key="results",
        totals_key=None,
        formatter_func=format_campaigns_export,
        report_type_name="ads_campaings"
    )


AD_GROUP_COLUMNS = {
    "state": "State",
    "ad_group_id": "Ad Group ID",
    "name": "Name",
    "campaign_name": "Campaign Name",
    "default_bid": "Default Bid",
    "country_code": "Country Code",
    "currency_code": "Currency Code",
    "impressions": "Impressions",
    "clicks": "Clicks",
    "cost": "Cost",
    "sales": "Sales",
    "orders": "Orders",
    "units": "Units",
    "acos": "ACOS",
    "roas": "ROAS",
}


def format_ad_groups_export(data_list, totals_dict=None):
    if not isinstance(data_list, list):
        data_list = []

    formatted = []
    for item in data_list:
        if not isinstance(item, dict):
            continue

        metrics = item.get("metrics") or {}
        if not isinstance(metrics, dict):
            metrics = {}

        formatted.append({
            "state": item.get("state", ""),
            "ad_group_id": str(item.get("ad_group_id", "")),
            "name": item.get("name", ""),
            "campaign_name": item.get("campaign_name", ""),
            "default_bid": item.get("default_bid", 0),
            "country_code": item.get("country_code", ""),
            "currency_code": item.get("currency_code", ""),
            "impressions": metrics.get("impressions", 0),
            "clicks": metrics.get("clicks", 0),
            "cost": metrics.get("cost", 0),
            "sales": metrics.get("sales", 0),
            "orders": metrics.get("orders", 0),
            "units": metrics.get("units", 0),
            "acos": metrics.get("acos", 0),
            "roas": metrics.get("roas", 0),
        })

    return formatted, None


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_amazon_ads_ad_groups(request):
    from amazon_ads.views import AdsAdGroupListView

    response_format = (
        request.query_params.get("file_format")
        or request.query_params.get("export_format")
        or request.query_params.get("format")
        or "xlsx"
    ).lower()

    override_params = {
        "POST": {
            "page": 1,
            "page_size": 100000
        },
        "GET": {
            "page": 1,
            "page_size": 100000
        }
    }

    return generic_export_view(
        request,
        AdsAdGroupListView,
        AD_GROUP_COLUMNS,
        "ads_ad_groups",
        response_format,
        override_params=override_params,
        list_key="results",
        totals_key=None,
        formatter_func=format_ad_groups_export,
        report_type_name="ads_ad_groups"
    )


# ==============================================================================
# AMAZON ADS SEARCH TERMS EXPORT
# ==============================================================================

SEARCH_TERM_COLUMNS = {
    "campaign_name": "Campaign Name",
    "search_term": "Search Term",
    "match_type": "Match Type",
    "report_date": "Report Date",
    "clicks": "Clicks",
    "cost": "Cost",
    "sales": "Sales",
    "orders": "Orders",
    "acos": "ACOS",
    "roas": "ROAS",
}


def format_search_terms_export(data_list, totals_dict=None):
    if not isinstance(data_list, list):
        data_list = []

    formatted = []
    for item in data_list:
        if not isinstance(item, dict):
            continue

        formatted.append({
            "campaign_name": item.get("campaign_name", ""),
            "search_term": item.get("search_term", ""),
            "match_type": item.get("match_type", ""),
            "report_date": item.get("report_date", ""),
            "clicks": item.get("clicks", 0),
            "cost": item.get("cost", 0),
            "sales": item.get("sales", 0),
            "orders": item.get("orders", 0),
            "acos": item.get("acos", 0),
            "roas": item.get("roas", 0),
        })

    return formatted, None


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_amazon_ads_search_terms(request):
    from amazon_ads.views import SearchTermMetricListView

    response_format = (
        request.query_params.get("file_format")
        or request.query_params.get("export_format")
        or request.query_params.get("format")
        or "xlsx"
    ).lower()

    override_params = {
        "POST": {
            "page": 1,
            "page_size": 100000,
            "pagination": {
                "pageNo": 1,
                "pageSize": 100000
            }
        },
        "GET": {
            "page": 1,
            "page_size": 100000
        }
    }

    return generic_export_view(
        request,
        SearchTermMetricListView,
        SEARCH_TERM_COLUMNS,
        "ads_search_terms",
        response_format,
        override_params=override_params,
        list_key="data",
        totals_key=None,
        formatter_func=format_search_terms_export,
        report_type_name="ads_search_terms"
    )


# ==============================================================================
# AMAZON ADS AD PRODUCTS EXPORT
# ==============================================================================

AD_PRODUCT_COLUMNS = {
    "sku": "SKU",
    "asin": "ASIN",
    "state": "State",
    "total_ads": "Total Ads",
    "impressions": "Impressions",
    "clicks": "Clicks",
    "cost": "Cost (₹)",
    "sales": "Sales (₹)",
    "orders": "Orders",
    "units": "Units",
    "acos": "ACOS (%)",
    "roas": "ROAS",
}


def format_ad_products_export(data_list, totals_dict=None):
    if not isinstance(data_list, list):
        data_list = []

    formatted = []
    for item in data_list:
        if not isinstance(item, dict):
            continue

        metrics = item.get("metrics") or {}

        formatted.append({
            "sku": item.get("sku", ""),
            "asin": item.get("asin", ""),
            "state": item.get("state", ""),
            "total_ads": item.get("total_ads", 0),
            "impressions": item.get("impressions", 0),
            "clicks": item.get("clicks", 0),
            "cost": item.get("cost", 0),
            "sales": item.get("sales", 0),
            "orders": item.get("orders", 0),
            "units": metrics.get("units", 0),
            "acos": metrics.get("acos", 0),
            "roas": metrics.get("roas", 0),
        })

    return formatted, None


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_amazon_ads_ad_products(request):
    from amazon_ads.views import ProductSKUReportView

    response_format = (
        request.query_params.get("file_format")
        or request.query_params.get("export_format")
        or request.query_params.get("format")
        or "xlsx"
    ).lower()

    override_params = {
        "POST": {
            "page": 1,
            "page_size": 100000,
            "pagination": {
                "page": 1,
                "page_size": 100000
            }
        },
        "GET": {
            "page": 1,
            "page_size": 100000
        }
    }

    return generic_export_view(
        request,
        ProductSKUReportView,
        AD_PRODUCT_COLUMNS,
        "ads_ad_products",
        response_format,
        override_params=override_params,
        list_key="results",
        totals_key=None,
        formatter_func=format_ad_products_export,
        report_type_name="ads_ad_products"
    )


# ==============================================================================
# AMAZON ADS KEYWORDS EXPORT
# ==============================================================================

KEYWORD_COLUMNS = {
    "keyword_id": "Keyword ID",
    "keyword_text": "Keyword Text",
    "match_type": "Match Type",
    "state": "State",
    "bid": "Bid (₹)",
    "campaign_name": "Campaign Name",
    "ad_group_name": "Ad Group Name",
    "created_at": "Created At",
}


def format_keywords_export(data_list, totals_dict=None):
    if not isinstance(data_list, list):
        data_list = []

    formatted = []
    for item in data_list:
        if not isinstance(item, dict):
            continue

        formatted.append({
            "keyword_id": item.get("keyword_id", ""),
            "keyword_text": item.get("keyword_text", ""),
            "match_type": item.get("match_type", ""),
            "state": item.get("state", ""),
            "bid": item.get("bid", 0),
            "campaign_name": item.get("campaign_name", ""),
            "ad_group_name": item.get("ad_group_name", ""),
            "created_at": item.get("created_at", ""),
        })

    return formatted, totals_dict


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_amazon_ads_keywords(request):
    from amazon_ads.views import AdsKeywordListView

    response_format = (
        request.query_params.get("file_format")
        or request.query_params.get("export_format")
        or request.query_params.get("format")
        or "xlsx"
    ).lower()

    override_params = {
        "POST": {
            "page": 1,
            "page_size": 100000,
            "pagination": {
                "page": 1,
                "page_size": 100000
            }
        },
        "GET": {
            "page": 1,
            "page_size": 100000
        }
    }

    return generic_export_view(
        request,
        AdsKeywordListView,
        KEYWORD_COLUMNS,
        "ads_keywords",
        response_format,
        override_params=override_params,
        list_key="results",
        totals_key="summary",
        formatter_func=format_keywords_export,
        report_type_name="ads_keywords"
    )


CAMPAIGN_BY_SKU_COLUMNS = {
    "state": "State",
    "campaign_id": "Campaign ID",
    "name": "Campaign Name",
    "targeting_type": "Targeting Type",
    "daily_budget": "Daily Budget",
    "bidding_strategy": "Bidding Strategy",
    "start_date": "Start Date",
    "total_ads": "Total Ads",
    "impressions": "Impressions",
    "clicks": "Clicks",
    "cost": "Cost",
    "sales": "Sales",
    "orders": "Orders",
    "units": "Units",
    "acos": "ACOS (%)",
    "roas": "ROAS",
}


def format_campaign_by_sku_export(results, totals_dict=None):
    formatted = []
    for item in results:
        formatted.append({
            "state": item.get("state", ""),
            "campaign_id": item.get("campaign_id", ""),
            "name": item.get("name", ""),
            "targeting_type": item.get("targeting_type", ""),
            "daily_budget": item.get("daily_budget", 0),
            "bidding_strategy": item.get("bidding_strategy", ""),
            "start_date": item.get("start_date", ""),
            "total_ads": item.get("total_ads", 0),
            "impressions": item.get("impressions", 0),
            "clicks": item.get("clicks", 0),
            "cost": item.get("cost", 0),
            "sales": item.get("sales", 0),
            "orders": item.get("orders", 0),
            "units": item.get("units", 0),
            "acos": item.get("acos", 0),
            "roas": item.get("roas", 0),
        })
    return formatted, None


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_amazon_ads_campaign_by_sku(request):
    from amazon_ads.views import CampaignBySKUView

    response_format = (
        request.query_params.get("file_format")
        or request.query_params.get("export_format")
        or request.query_params.get("format")
        or "xlsx"
    ).lower()

    override_params = {
        "POST": {
            "page": 1,
            "page_size": 100000,
            "pagination": {
                "page": 1,
                "page_size": 100000
            }
        },
        "GET": {
            "page": 1,
            "page_size": 100000
        }
    }

    return generic_export_view(
        request,
        CampaignBySKUView,
        CAMPAIGN_BY_SKU_COLUMNS,
        "ads_campaign_by_sku",
        response_format,
        override_params=override_params,
        list_key="results",
        formatter_func=format_campaign_by_sku_export,
        report_type_name="ads_campaign_by_sku"
    )


ADGROUP_BY_CAMPAIGN_COLUMNS = {
    "ad_group_id": "Ad Group ID",
    "campaign_id": "Campaign ID",
    "campaign_name": "Campaign Name",
    "name": "Ad Group Name",
    "state": "State",
    "default_bid": "Default Bid",
    "total_ads": "Total Ads",
    "impressions": "Impressions",
    "clicks": "Clicks",
    "cost": "Cost",
    "sales": "Sales",
    "orders": "Orders",
    "units": "Units",
    "acos": "ACOS (%)",
    "roas": "ROAS",
}


def format_adgroup_by_campaign_export(results, totals_dict=None):
    formatted = []
    for item in results:
        formatted.append({
            "ad_group_id": item.get("ad_group_id", ""),
            "campaign_id": item.get("campaign_id", ""),
            "campaign_name": item.get("campaign_name", ""),
            "name": item.get("name", ""),
            "state": item.get("state", ""),
            "default_bid": item.get("default_bid", 0),
            "total_ads": item.get("total_ads", 0),
            "impressions": item.get("impressions", 0),
            "clicks": item.get("clicks", 0),
            "cost": item.get("cost", 0),
            "sales": item.get("sales", 0),
            "orders": item.get("orders", 0),
            "units": item.get("units", 0),
            "acos": item.get("acos", 0),
            "roas": item.get("roas", 0),
        })
    return formatted, None


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_amazon_ads_adgroup_by_campaign(request):
    from amazon_ads.views import AdGroupByCampaignView

    response_format = (
        request.query_params.get("file_format")
        or request.query_params.get("export_format")
        or request.query_params.get("format")
        or "xlsx"
    ).lower()

    override_params = {
        "POST": {
            "page": 1,
            "page_size": 100000,
            "pagination": {
                "page": 1,
                "page_size": 100000
            }
        },
        "GET": {
            "page": 1,
            "page_size": 100000
        }
    }

    return generic_export_view(
        request,
        AdGroupByCampaignView,
        ADGROUP_BY_CAMPAIGN_COLUMNS,
        "ads_adgroup_by_campaign",
        response_format,
        override_params=override_params,
        list_key="results",
        formatter_func=format_adgroup_by_campaign_export,
        report_type_name="ads_adgroup_by_campaign"
    )


CATALOG_DETAILS_COLUMNS = {
    "asin": "ASIN",
    "brand": "Brand",
    "item_name": "Product Name",
    "sales_rank": "Product Category Rank",
    "display_group_rank": "Master Category Rank",
    "sales_rank_category": "Product Category",
    "display_group_rank_title": "Group Category Rank",
}


def format_catalog_details_export(results, totals_dict=None):
    formatted = []
    for item in results:
        formatted.append({
            "asin": item.get("asin", ""),
            "brand": item.get("brand", ""),
            "item_name": item.get("item_name", ""),
            "sales_rank": item.get("sales_rank", 0),
            "display_group_rank": item.get("display_group_rank", 0),
            "sales_rank_category": item.get("sales_rank_category", ""),
            "display_group_rank_title": item.get("display_group_rank_title", ""),
        })
    return formatted, None


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def export_amazon_catalog_details(request):
    from amazon_auth.catelog_details import AmazonCatalogDetailsAPIView

    response_format = (
        request.query_params.get("file_format")
        or request.query_params.get("export_format")
        or request.query_params.get("format")
        or "xlsx"
    ).lower()

    override_params = {
        "POST": {
            "page": 1,
            "page_size": 100000,
        },
        "GET": {
            "page": 1,
            "page_size": 100000
        }
    }

    return generic_export_view(
        request,
        AmazonCatalogDetailsAPIView,
        CATALOG_DETAILS_COLUMNS,
        "catalog_list_details",
        response_format,
        override_params=override_params,
        list_key="data",
        formatter_func=format_catalog_details_export,
        report_type_name="catalog_list_details"
    )








