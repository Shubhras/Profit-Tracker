import os
import secrets
import requests
import json
from datetime import datetime, timedelta
from django.shortcuts import redirect, render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .spapi_manager import SPAPIManager
from .models import AmazonAccount, Order, FinancialEvent, Report
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Map ENV variables correctly from .env
AMAZON_CLIENT_ID = os.getenv("AMAZON_CLIENT_ID")
AMAZON_CLIENT_SECRET = os.getenv("AMAZON_CLIENT_SECRET")
AMAZON_APP_ID = os.getenv("AMAZON_APP_ID")
REDIRECT_URI = os.getenv("REDIRECT_URI")

def format_date(dt):
    """Formats datetime to Amazon ISO8601 string with Z suffix"""
    return dt.strftime('%Y-%m-%dT%H:%M:%SZ')

# =========================================
# 1. CONNECT → Redirect to Amazon
# =========================================
@login_required
def amazon_connect(request):
    state = secrets.token_hex(16)
    request.session["amazon_state"] = state
    request.session["code_used"] = False
    
    auth_url = (
        "https://sellercentral.amazon.in/apps/authorize/consent"
        f"?application_id={AMAZON_APP_ID}"
        f"&state={state}"
        f"&redirect_uri={REDIRECT_URI}"

    )
    return redirect(auth_url)

# =========================================
# 2. CALLBACK → Handle Amazon response
# =========================================
def amazon_callback(request):
    state = request.GET.get("state")
    code = request.GET.get("spapi_oauth_code")
    seller_id = request.GET.get("selling_partner_id")
    
    session_state = request.session.get("amazon_state")
    if not session_state or state != session_state:
        return JsonResponse({"error": "Invalid state parameter."}, status=400)
    
    if not code:
        return JsonResponse({"error": "Authorization code missing"}, status=400)
    
    if request.session.get("code_used"):
        return JsonResponse({"error": "Code already used"}, status=400)

    request.session["code_used"] = True

    lwa_token_url = "https://api.amazon.com/auth/o2/token"
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": AMAZON_CLIENT_ID,
        "client_secret": AMAZON_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
    }
 
    try:
        response = requests.post(lwa_token_url, data=payload)
        response.raise_for_status()
        data = response.json()
        refresh_token = data.get("refresh_token")
        
        user = request.user if request.user.is_authenticated else User.objects.first()
        
        # Link account to both user and seller_id to allow multiple unique accounts
        account, created = AmazonAccount.objects.get_or_create(
            user=user, 
            seller_central_id=seller_id,
            defaults={
                'marketplace_id': "A21TJRUUN4KGV", # Default to India
                'region': "EU"
            }
        )
        
        account.app_client_id = AMAZON_CLIENT_ID
        account.app_client_secret = AMAZON_CLIENT_SECRET
        account.set_refresh_token(refresh_token)
        account.save()

        return JsonResponse({
            "status": "success", 
            "message": "Amazon connected successfully", 
            "seller_id": seller_id,
            "is_new": created
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)






from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .spapi_manager import SPAPIManager
from .models import Order, FinancialEvent, Report
from datetime import datetime

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def sync_reports(request):
    """
    Fetches Amazon reports for ALL connected accounts and saves them to the local database.
    """
    try:
        user = request.user
        accounts = AmazonAccount.objects.filter(user=user)
        
        if not accounts.exists():
            return JsonResponse({"status": "error", "message": "No Amazon accounts connected."}, status=400)

        total_saved = 0
        sync_details = []

        for account in accounts:
            manager = SPAPIManager(user=user, account=account)
            
            # Get params from URL, or use defaults
            params = request.GET.dict()
            if not params.get('reportTypes') and not params.get('nextToken'):
                params['reportTypes'] = [
                    'GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE',
                    'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_LAST_UPDATE_GENERAL'
                ]

            data = manager.get_reports(**params)

            if "errors" in data:
                sync_details.append({"seller_id": account.seller_central_id, "status": "error", "errors": data["errors"]})
                continue

            reports = data.get("reports", [])
            account_saved_count = 0

            for report in reports:
                Report.objects.update_or_create(
                    amazon_report_id=report.get("reportId"),
                    amazon_account=account, # Ensure isolation by account
                    defaults={
                        "user": user,
                        "report_type": report.get("reportType"),
                        "processing_status": report.get("processingStatus"),
                        "created_time": parse_date(report.get("createdTime")),
                        "data_start_time": parse_date(report.get("dataStartTime")) if report.get("dataStartTime") else None,
                        "data_end_time": parse_date(report.get("dataEndTime")) if report.get("dataEndTime") else None,
                        "report_document_id": report.get("reportDocumentId"),
                        "raw_data": report
                    }
                )
                account_saved_count += 1
            
            total_saved += account_saved_count
            sync_details.append({"seller_id": account.seller_central_id, "status": "success", "synced_count": account_saved_count})

        return JsonResponse({
            "status": "success", 
            "message": f"Reports synced for {len(sync_details)} accounts", 
            "total_synced": total_saved,
            "details": sync_details
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

def parse_date(date_str):
    # Handle ISO format with or without milliseconds
    try:
        # Try full format first
        if '.' in date_str:
            dt = datetime.strptime(date_str.split('.')[0], "%Y-%m-%dT%H:%M:%S")
        else:
            dt = datetime.strptime(date_str.replace('Z', ''), "%Y-%m-%dT%H:%M:%S")
        return timezone.make_aware(dt)
    except Exception:
        return timezone.now()


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def sync_finances(request):
    """
    Fetches global financial events for ALL connected accounts and saves them to the local database.
    Ensures that data for different sellers is isolated and duplicates are avoided.
    """
    try:
        user = request.user
        accounts = AmazonAccount.objects.filter(user=user)
        
        if not accounts.exists():
            return JsonResponse({"status": "error", "message": "No Amazon accounts connected."}, status=400)

        total_saved = 0
        sync_details = []

        import hashlib
        import json
        from django.db import transaction
        
        for account in accounts:
            manager = SPAPIManager(user=user, account=account)
            
            # Allow seller to specify dates
            kwargs = {}
            if request.GET.get('PostedAfter'): kwargs['PostedAfter'] = request.GET.get('PostedAfter')
            if request.GET.get('PostedBefore'): kwargs['PostedBefore'] = request.GET.get('PostedBefore')
            
            data = manager.list_financial_events(**kwargs)

            if "errors" in data:
                sync_details.append({"seller_id": account.seller_central_id, "status": "error", "errors": data["errors"]})
                continue

            events_raw = data.get("payload", {}).get("FinancialEvents", {})
            account_saved_count = 0

            # Use a slightly more robust extraction logic for financial totals
            with transaction.atomic():
                for category, event_list in events_raw.items():
                    if not isinstance(event_list, list) or not category.endswith('List'):
                        continue
                    
                    event_base_type = category.replace('List', '')
                    
                    for event in event_list:
                        # Uniqueness key: Unique combination that Amazon sends
                        # Many events have an 'EventId' or 'GroupId', but we'll combine fields for a stable hash
                        event_str = json.dumps(event, sort_keys=True)
                        unique_hash = hashlib.sha256(event_str.encode()).hexdigest()
                        
                        amazon_order_id = event.get("AmazonOrderId") or event.get("OrderId")
                        posted_date_str = event.get("PostedDate") or event.get("TransactionPostedDate")
                        
                        if not posted_date_str:
                            continue
                        
                        posted_date = parse_date(posted_date_str)
                        
                        # Summarize total amount for this specific event entry
                        total_event_amount = 0.0
                        currency = None

                        def sum_charges_and_fees(items, charge_key, fee_key):
                            nonlocal total_event_amount, currency
                            for item in items:
                                for charge in item.get(charge_key, []):
                                    amt = float(charge.get("ChargeAmount", {}).get("CurrencyAmount", 0))
                                    total_event_amount += amt
                                    if not currency: currency = charge.get("ChargeAmount", {}).get("CurrencyCode")
                                for fee in item.get(fee_key, []):
                                    amt = float(fee.get("FeeAmount", {}).get("CurrencyAmount", 0))
                                    total_event_amount += amt
                                    if not currency: currency = fee.get("FeeAmount", {}).get("CurrencyCode")

                        if "ShipmentItemList" in event:
                            sum_charges_and_fees(event["ShipmentItemList"], "ItemChargeList", "ItemFeeList")
                        if "ShipmentItemAdjustmentList" in event:
                            sum_charges_and_fees(event["ShipmentItemAdjustmentList"], "ItemChargeAdjustmentList", "ItemFeeAdjustmentList")
                        
                        # Global order charges if any
                        for charge in event.get("OrderChargeList", []):
                            amt = float(charge.get("ChargeAmount", {}).get("CurrencyAmount", 0))
                            total_event_amount += amt
                            if not currency: currency = charge.get("ChargeAmount", {}).get("CurrencyCode")

                        # If total is still 0, check top level 'TotalAmount' if it exists in some events
                        if total_event_amount == 0 and "TotalAmount" in event:
                             total_event_amount = float(event["TotalAmount"].get("CurrencyAmount", 0))
                             currency = event["TotalAmount"].get("CurrencyCode")

                        # IDEMPOTENT SAVE
                        # We use update_or_create with unique_hash to ensure no duplicates
                        obj, created = FinancialEvent.objects.update_or_create(
                            amazon_account=account,
                            unique_hash=unique_hash,
                            defaults={
                                'user': user,
                                'amazon_order_id': amazon_order_id,
                                'event_type': event_base_type,
                                'posted_date': posted_date,
                                'total_amount': total_event_amount,
                                'currency_code': currency,
                                'raw_data': event
                            }
                        )
                        if created:
                            account_saved_count += 1

            total_saved += account_saved_count
            sync_details.append({"seller_id": account.seller_central_id, "status": "success", "synced_count": account_saved_count})

        return JsonResponse({
            "status": "success", 
            "message": f"Financial events synced for {len(sync_details)} accounts", 
            "total_synced": total_saved,
            "details": sync_details
        })
    except Exception as e:
        import traceback
        return JsonResponse({'status': 'error', 'message': str(e), 'trace': traceback.format_exc()}, status=500)
            
        total_saved += account_saved_count
        sync_details.append({"seller_id": account.seller_central_id, "status": "success", "synced_count": account_saved_count})

        return JsonResponse({
            "status": "success", 
            "message": f"Financial events synced for {len(sync_details)} accounts", 
            "total_synced": total_saved,
            "details": sync_details
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def sync_orders(request):
    """
    Fetches Amazon orders for ALL connected accounts and saves them to the local database.
    """
    user = request.user
    accounts = AmazonAccount.objects.filter(user=user)
    
    if not accounts.exists():
        return JsonResponse({"status": "error", "message": "No Amazon accounts connected."}, status=400)

    total_saved = 0
    sync_details = []

    from django.db import transaction
    for account in accounts:
        manager = SPAPIManager(user=user, account=account)
        
        # Allow seller to specify dates
        kwargs = {}
        if request.GET.get('CreatedAfter'): kwargs['CreatedAfter'] = request.GET.get('CreatedAfter')
        if request.GET.get('CreatedBefore'): kwargs['CreatedBefore'] = request.GET.get('CreatedBefore')
        
        data = manager.fetch_orders(**kwargs)

        if "errors" in data:
            sync_details.append({"seller_id": account.seller_central_id, "status": "error", "errors": data["errors"]})
            continue

        orders_list = data.get("payload", {}).get("Orders", [])
        account_saved_count = 0

        for o in orders_list:
            amazon_order_id = o.get("AmazonOrderId")
            
            # 1. Network Call First (Outside of any DB save to prevent locking)
            items_list = []
            try:
                items_data = manager.get_order_items(amazon_order_id)
                items_list = items_data.get("payload", {}).get("OrderItems", [])
            except Exception:
                pass 

            # 2. Database Save Second (Wrapped in a tiny, fast transaction)
            with transaction.atomic():
                # Extract simple totals
                total_info = o.get("OrderTotal", {})
                total_amount = total_info.get("Amount", 0)
                currency = total_info.get("CurrencyCode")

                order, created = Order.objects.update_or_create(
                    amazon_account=account,
                    amazon_order_id=amazon_order_id,
                    defaults={
                        'user': user,
                        'purchase_date': parse_date(o.get("PurchaseDate")),
                        'last_update_date': parse_date(o.get("LastUpdateDate")),
                        'order_status': o.get("OrderStatus"),
                        'fulfillment_channel': o.get("FulfillmentChannel"),
                        'items_shipped': o.get("NumberOfItemsShipped", 0),
                        'items_unshipped': o.get("NumberOfItemsUnshipped", 0),
                        'payment_method': o.get("PaymentMethod"),
                        'marketplace_id': o.get("MarketplaceId"),
                        'total_amount': total_amount,
                        'currency_code': currency,
                        'buyer_name': o.get("BuyerInfo", {}).get("BuyerName"),
                        'city': o.get("ShippingAddress", {}).get("City"),
                        'state': o.get("ShippingAddress", {}).get("StateOrRegion"),
                        'country': o.get("ShippingAddress", {}).get("CountryCode"),
                    }
                )
                
                # Fetch and sync items for this order
                from .models import OrderItem
                for item in items_list:
                    OrderItem.objects.update_or_create(
                        order=order,
                        order_item_id=item.get("OrderItemId"),
                        defaults={
                            'seller_sku': item.get("SellerSKU"),
                            'title': item.get("Title"),
                            'quantity_ordered': item.get("QuantityOrdered", 0),
                            'quantity_shipped': item.get("QuantityShipped", 0),
                            'item_price': item.get("ItemPrice", {}).get("Amount", 0),
                            'item_tax': item.get("ItemTax", {}).get("Amount", 0),
                            'shipping_price': item.get("ShippingPrice", {}).get("Amount", 0),
                        }
                    )

            account_saved_count += 1
        
        total_saved += account_saved_count
        sync_details.append({"seller_id": account.seller_central_id, "status": "success", "synced_count": account_saved_count})

    return JsonResponse({
        "status": "success",
        "message": f"Orders synced for {len(sync_details)} accounts",
        "total_synced": total_saved,
        "details": sync_details
    })

@login_required
def list_db_orders(request):
    """Returns all orders stored in the local database for this user"""
    orders = Order.objects.filter(user=request.user).order_by('-purchase_date')
    data = []
    for order in orders:
        data.append({
            "order_id": order.amazon_order_id,
            "status": order.order_status,
            "date": order.purchase_date.strftime("%Y-%m-%d %H:%M"),
            "total": f"{order.total_amount} {order.currency_code}" if order.total_amount else "N/A",
            "buyer": order.buyer_name,
            "city": order.city
        })
    return JsonResponse({"status": "success", "count": len(data), "orders": data})

@login_required
def list_db_order_items(request, order_id):
    """Returns all items for a specific order stored in the local database"""
    try:
        order = Order.objects.get(amazon_order_id=order_id, user=request.user)
        items = order.items.all()
        data = [{
            "item_id": i.order_item_id,
            "sku": i.seller_sku,
            "title": i.title,
            "qty": i.quantity_ordered,
            "price": float(i.item_price)
        } for i in items]
        return JsonResponse({"status": "success", "items": data})
    except Order.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Order not found"}, status=404)


# =========================================
# 3. DATA API VIEWS
# =========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_orders(request):
    """
    Directly calls the SP-API GetOrders and returns the raw response.
    Supports flexible marketplace parameter names in the URL.
    Example: /api/amazon/orders/?marketplace_id=A21TJRUUN4KGV
    """
    try:
        manager = SPAPIManager(user=request.user)
        
        # Capture all parameters
        params = request.GET.dict()
        
        # Add aliases for marketplace_id to ensure it's captured correctly from the URL
        if 'marketplace_id' in params:
            params['MarketplaceIds'] = params.pop('marketplace_id')
        elif 'marketplaceId' in params:
            params['MarketplaceIds'] = params.pop('marketplaceId')
            
        response = manager.get_orders(**params)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
def get_order_details(request, order_id):
    """
    Fetches details for a single Amazon Order ID.
    Example: /api/amazon/orders/404-1274605-5615510/
    """
    try:
        manager = SPAPIManager(user=request.user)
        response = manager.get_order(order_id)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def get_order_buyer_info(request, order_id):
    """
    Fetches buyer information for a single Amazon Order ID.
    Example: /api/amazon/orders/404-1274605-5615510/buyerInfo/
    """
    try:
        manager = SPAPIManager(user=request.user)
        response = manager.get_order_buyer_info(order_id)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def get_order_address(request, order_id):
    """
    Fetches shipping address for a single Amazon Order ID.
    Example: /api/amazon/orders/404-1274605-5615510/address/
    """
    try:
        manager = SPAPIManager(user=request.user)
        response = manager.get_order_address(order_id)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def get_order_items(request, order_id):
    """
    Fetches detailed order item information for a single Amazon Order ID.
    Supports NextToken for pagination.
    Example: /api/amazon/orders/404-1274605-5615510/orderItems/
    """
    try:
        manager = SPAPIManager(user=request.user)
        next_token = request.GET.get('NextToken')
        response = manager.get_order_items(order_id, next_token=next_token)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def get_order_finances(request, order_id):
    """
    Fetches all financial events for a single Amazon Order ID.
    Supports MaxResultsPerPage and NextToken.
    Example: /api/amazon/orders/404-1274605-5615510/finances/
    """
    try:
        manager = SPAPIManager(user=request.user)
        max_results = request.GET.get('MaxResultsPerPage', 100)
        next_token = request.GET.get('NextToken')
        response = manager.get_order_financial_events(order_id, max_results=max_results, next_token=next_token)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def list_financial_events(request):
    """
    Returns global financial events for a specified date range.
    Example: /api/amazon/finances/?PostedAfter=2024-01-01T00:00:00Z
    """
    try:
        manager = SPAPIManager(user=request.user)
        params = request.GET.dict()
        response = manager.list_financial_events(**params)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def get_reports(request):
    """
    Returns report details for the reports that match the filters.
    Example: /api/amazon/reports/?reportTypes=GET_FLAT_FILE_OPEN_LISTINGS_DATA
    """
    try:
        manager = SPAPIManager(user=request.user)
        params = request.GET.dict()
        response = manager.get_reports(**params)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

# @login_required
def get_report(request, report_id):
    """
    Fetches details for a single Amazon Report ID.
    Example: /api/amazon/report/12345/
    """
    try:
        manager = SPAPIManager(user=request.user)
        response = manager.get_report(report_id)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)



# @login_required
def get_report_document(request, document_id):
    """
    Returns the information required for retrieving a report document's contents.
    Example: /api/amazon/report-document/amzn1.spdoc.12345/
    """
    try:
        manager = SPAPIManager(user=request.user)
        response = manager.get_report_document(document_id)
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@login_required
def create_report(request):
    """
    Creates a new report on Amazon.
    Example: /api/amazon/create-report/?reportType=GET_MERCHANTS_LISTINGS_DATA
    """
    try:
        user = request.user
        manager = SPAPIManager(user=user)
        
        report_type = request.GET.get('reportType')
        if not report_type:
            return JsonResponse({'status': 'error', 'message': 'reportType is required'}, status=400)
            
        kwargs = request.GET.dict()
        if 'marketplaceIds' in kwargs:
            kwargs['marketplaceIds'] = kwargs['marketplaceIds'].split(',')
            
        response = manager.create_report(report_type, **kwargs)
        
        if 'reportId' in response:
            Report.objects.create(
                user=user,
                amazon_account=manager.account,
                amazon_report_id=response['reportId'],
                report_type=report_type,
                processing_status='SUBMITTED',
                created_time=datetime.utcnow(),
                raw_data=response
            )
            
        return JsonResponse(response)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profit_card(request):
    """
    Focused API for the main Profit summary card: Profit, Margin, ROI.
    """
    user = request.user
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    if start_date_str:
        start_date = timezone.make_aware(datetime.strptime(start_date_str, '%Y-%m-%d'))
    else:
        start_date = timezone.now() - timedelta(days=30)
        
    if end_date_str:
        end_date = timezone.make_aware(datetime.strptime(end_date_str, '%Y-%m-%d'))
    else:
        end_date = timezone.now()

    # Financial logic
    finances_qs = FinancialEvent.objects.filter(user=user, posted_date__range=(start_date, end_date))
    orders_qs = Order.objects.filter(user=user, purchase_date__range=(start_date, end_date))

    total_sales = orders_qs.aggregate(val=Sum('total_amount'))['val'] or 0
    total_net = finances_qs.aggregate(val=Sum('total_amount'))['val'] or 0
    
    net_profit = float(total_net)
    margin = (net_profit / float(total_sales) * 100) if total_sales > 0 else 0
    roi = (margin * 2.34) # Simplified ROI logic based on typical margins

    return JsonResponse({
        "status": "success",
        "data": {
            "profit": round(net_profit, 2),
            "margin": f"{round(margin)}%",
            "roi": f"{round(roi)}%"
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_product_analytics(request):
    """
    Groups data by SKU for the product-level profit table.
    """
    user = request.user
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    if start_date_str:
        start_date = timezone.make_aware(datetime.strptime(start_date_str, '%Y-%m-%d'))
    else:
        start_date = timezone.now() - timedelta(days=30)
        
    if end_date_str:
        end_date = timezone.make_aware(datetime.strptime(end_date_str, '%Y-%m-%d'))
    else:
        end_date = timezone.now()

    # Base filtering
    from .models import OrderItem
    items_qs = OrderItem.objects.filter(order__user=user, order__purchase_date__range=(start_date, end_date))
    
    # Aggregate by SKU
    skus = items_qs.values('seller_sku', 'title').annotate(
        net_qty=Sum('quantity_shipped'),
        gross_sales=Sum('item_price')
    )

    data = []
    for s in skus:
        sku = s['seller_sku']
        # For simplicity, we'll estimate fees as 15% of gross sales 
        # (In a real app, you'd match these with FinancialEvents linked to this order/item)
        gross = float(s['gross_sales'] or 0)
        qty = s['net_qty'] or 0
        mp_fees = -(gross * 0.15)
        shipping = -(qty * 45) # Estimate 45 per shipment
        ad_spend = -(gross * 0.08) # Estimate 8% ad spend
        
        profit = gross + mp_fees + shipping + ad_spend
        profit_pct = (profit / gross * 100) if gross > 0 else 0
        
        data.append({
            "sku": sku,
            "title": s['title'],
            "net_qty": qty,
            "net_sales": round(gross, 2),
            "mp_fees": round(mp_fees, 2),
            "shipping": round(shipping, 2),
            "ad_spend": round(ad_spend, 2),
            "profit": round(profit, 2),
            "profit_percent": f"{round(profit_pct)}%"
        })

    return JsonResponse({"status": "success", "products": data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_full_dashboard(request):
    """
    Unified API for the entire dashboard. 
    If ?live=true is passed, it triggers a sync with Amazon first.
    """
    print(f"DEBUG: get_full_dashboard called for user {request.user}")
    user = request.user
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')
    is_live = request.GET.get('live', 'false').lower() == 'true'

    if start_date_str:
        start_date = timezone.make_aware(datetime.strptime(start_date_str, '%Y-%m-%d'))
    else:
        start_date = timezone.now() - timedelta(days=30)
        
    if end_date_str:
        end_date = timezone.make_aware(datetime.strptime(end_date_str, '%Y-%m-%d'))
    else:
        end_date = timezone.now()

    # AUTO-SYNC FEATURE
    if is_live:
        # We call the sync functions internally (without requiring a separate HTTP call)
        # Note: In a large system, this should be a Celery task, but for direct use we call them here.
        try:
            # We simulate a request object for the internal calls
            sync_orders(request._request) 
            sync_finances(request._request)
        except Exception as e:
            print(f"Auto-sync failed: {e}")

    # 1. CORE METRICS
    orders_qs = Order.objects.filter(user=user, purchase_date__range=(start_date, end_date))
    finances_qs = FinancialEvent.objects.filter(user=user, posted_date__range=(start_date, end_date))
    
    # Financial aggregate sums based on real data
    total_sales_gross = float(orders_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
    
    # Accurate revenue and fee breakdown from finances
    revenue_events = finances_qs.filter(event_type='ShipmentEvent', total_amount__gt=0)
    total_revenue_fin = float(revenue_events.aggregate(val=Sum('total_amount'))['val'] or 0)
    
    # Fees are usually negative
    fee_events = finances_qs.filter(total_amount__lt=0)
    total_fees = float(fee_events.aggregate(val=Sum('total_amount'))['val'] or 0)
    
    # If no fees are found in finances for this period, estimate them (approx 15-20% for Amazon)
    # This ensures the user sees 'Real' profit even if they haven't synced finances lately.
    has_real_fees = finances_qs.exists()
    estimated_fees = 0
    if not has_real_fees and total_sales_gross > 0:
        estimated_fees = -(total_sales_gross * 0.18) # 18% estimate
    
    actual_fees = total_fees if has_real_fees else estimated_fees

    # Refunds
    refund_events = finances_qs.filter(event_type__icontains='Refund')
    total_refunds = float(refund_events.aggregate(val=Sum('total_amount'))['val'] or 0)
    
    # Net Revenue (Orders Gross + All Fees + Refunds)
    # Using Order Gross as anchor if finances are sparse
    calculated_net_revenue = total_sales_gross + actual_fees + total_refunds
    
    # COGS - If we don't have real costs, we use 45% as a standard estimate
    cogs_est = total_sales_gross * 0.45 
    net_profit = calculated_net_revenue - cogs_est
    margin = (net_profit / total_sales_gross * 100) if total_sales_gross > 0 else 0
    roi = (net_profit / cogs_est * 100) if cogs_est > 0 else 0
    
    # 2. AD METRICS
    ad_events = finances_qs.filter(Q(event_type__icontains='ServiceFee') | Q(raw_data__icontains='Ad'))
    ad_spend = float(ad_events.aggregate(val=Sum('total_amount'))['val'] or 0)
    if ad_spend == 0 and total_sales_gross > 0:
        ad_spend = -(total_sales_gross * 0.10) # 10% estimate
    
    tacos = (abs(ad_spend) / total_sales_gross * 100) if total_sales_gross > 0 else 0

    # 3. REAL BREAKDOWN TABLE
    cancelled_orders = orders_qs.filter(order_status='Cancelled')
    
    breakdown = {
        "gross": {"qty": orders_qs.count(), "amount": round(total_sales_gross, 2)},
        "cancelled": {
            "qty": cancelled_orders.count(), 
            "amount": round(float(cancelled_orders.aggregate(val=Sum('total_amount'))['val'] or 0), 2)
        },
        "refunds": {
            "qty": refund_events.values('amazon_order_id').distinct().count(), 
            "amount": round(total_refunds, 2)
        },
        "fees": {
            "amount": round(actual_fees, 2),
            "is_estimated": not has_real_fees
        },
        "net": {
            "qty": orders_qs.exclude(order_status='Cancelled').count(), 
            "amount": round(calculated_net_revenue, 2)
        }
    }

    # 4. TRENDS (Date-wise breakdown)
    trends = orders_qs.annotate(date=TruncDate('purchase_date')).values('date').annotate(
        sales=Sum('total_amount'),
        qty=Count('id')
    ).order_by('date')
    
    trends_data = []
    for t in trends:
        daily_sales = float(t['sales'] or 0)
        # Apply the same logic used for header metrics to each day
        daily_fees = daily_sales * 0.18 # Estimated
        daily_cogs = daily_sales * 0.45 # Estimated
        daily_profit = daily_sales - daily_fees - daily_cogs
        
        trends_data.append({
            "date": t['date'],
            "sales": round(daily_sales, 2),
            "qty": t['qty'],
            "estimated_profit": round(daily_profit, 2),
            "margin": f"{round((daily_profit/daily_sales*100))}%" if daily_sales > 0 else "0%"
        })

    # 5. GEOGRAPHY (Detailed Regional Breakdown)
    states = orders_qs.values('state').distinct()
    geo_data_detailed = []
    
    # Global/General entry for overheads (like storage fees that aren't per-order)
    global_overhead_ads = 0
    global_storage_fees = 0
    if not finances_qs.exists() and total_sales_gross > 0:
        global_overhead_ads = -(total_sales_gross * 0.10)
        global_storage_fees = -(total_sales_gross * 0.02)
    else:
        # Sum up ad events that aren't linked to a specific order
        global_overhead_ads = float(finances_qs.filter(amazon_order_id__isnull=True).filter(
            Q(event_type__icontains='ServiceFee') | Q(raw_data__icontains='Ad')
        ).aggregate(val=Sum('total_amount'))['val'] or 0)
        
        global_storage_fees = float(finances_qs.filter(event_type__icontains='Storage').aggregate(val=Sum('total_amount'))['val'] or 0)

    # entry 0 placeholder for globals or overhead
    geo_data_detailed.append({
        "ads": f"{round(global_overhead_ads, 2)}",
        "adspercent": 0.0,
        "grossqty": None,
        "gsttopay": "0",
        "id": None,
        "mpfees": "0.00",
        "netqty": 0,
        "netsales": "0.00",
        "otherfees": "0",
        "profit": f"{round(global_overhead_ads + global_storage_fees, 2)}",
        "profitcogs": "0.00",
        "profitmargin": "0",
        "qtyshipped": 0,
        "refund": "0.00",
        "retpercent": 0.0,
        "returnqty": 0,
        "revenue": "0.00",
        "shippercent": 0.0,
        "shippingfees": "0.00",
        "storagefees": f"{round(global_storage_fees, 2)}",
        "tacos": "0"
    })

    for s_meta in states:
        state_name = s_meta['state'] or "UNKNOWN"
        state_orders = orders_qs.filter(state=state_name)
        state_order_ids = state_orders.values_list('amazon_order_id', flat=True)
        state_finances = finances_qs.filter(amazon_order_id__in=state_order_ids)
        
        rev = float(state_orders.aggregate(val=Sum('total_amount'))['val'] or 0)
        qty = state_orders.aggregate(val=Sum('items_shipped'))['val'] or 0
        
        # Real or Estimated Fees
        if state_finances.exists():
            mp_fees = float(state_finances.filter(total_amount__lt=0).exclude(event_type__icontains='Shipping').aggregate(val=Sum('total_amount'))['val'] or 0)
            ship_fees = float(state_finances.filter(event_type__icontains='Shipping').aggregate(val=Sum('total_amount'))['val'] or 0)
            refunds = float(state_finances.filter(event_type__icontains='Refund').aggregate(val=Sum('total_amount'))['val'] or 0)
            ads = float(state_finances.filter(Q(event_type__icontains='Ad') | Q(raw_data__icontains='Sponsored')).aggregate(val=Sum('total_amount'))['val'] or 0)
        else:
            mp_fees = -(rev * 0.15)
            ship_fees = -(qty * 65)
            refunds = 0
            ads = -(rev * 0.08)

        cogs = -(rev * 0.45)
        profit = rev + mp_fees + ship_fees + ads + cogs + refunds
        
        geo_data_detailed.append({
            "id": state_name,
            "revenue": f"{round(rev, 2)}",
            "netsales": f"{round(rev + refunds, 2)}",
            "grossqty": qty,
            "netqty": qty, # could adjust for returns if data available
            "qtyshipped": qty,
            "mpfees": f"{round(mp_fees, 2)}",
            "shippingfees": f"{round(ship_fees, 2)}",
            "ads": f"{round(ads, 2)}",
            "adspercent": round((abs(ads)/rev*100), 2) if rev > 0 else 0,
            "profit": f"{round(profit, 2)}",
            "profitcogs": f"{round(cogs, 2)}",
            "profitmargin": f"{round((profit/rev*100), 2)}" if rev > 0 else "0",
            "refund": f"{round(refunds, 2)}",
            "returnqty": 0,
            "retpercent": 0.0,
            "shippercent": round((abs(ship_fees)/rev*100), 2) if rev > 0 else 0,
            "gsttopay": "0", # Placeholder
            "otherfees": "0",
            "storagefees": "0",
            "tacos": f"{round((abs(ads)/rev*100), 2)}" if rev > 0 else "0"
        })

    return JsonResponse({
        "status": "success",
        "currency": "INR",
        "header_metrics": {
            "sales": round(total_sales_gross, 2),
            "profit": round(net_profit, 2),
            "margin": f"{round(margin)}%",
            "roi": f"{round(roi)}%",
            "ad_spend": round(ad_spend, 2),
            "tacos": f"{round(tacos)}%"
        },
        "breakdown_table": breakdown,
        "trends": trends_data,
        "geography": geo_data_detailed,
        "top_orders": {
            "profitable": list(orders_qs.order_by('-total_amount')[:5].values('amazon_order_id', 'total_amount')),
            "losing": list(finances_qs.filter(total_amount__lt=0).order_by('total_amount')[:5].values('amazon_order_id', 'total_amount'))
        },
        "warnings": ["Financial data for this period is incomplete. Fees and Ad Spend are estimated."] if not has_real_fees else []
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ads_analytics(request):
    """
    Analyzes Ad Spend and advertising impact using Financial Events.
    For high-detail (Campaigns, keywords), the Amazon Advertising API is required.
    """
    user = request.user
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    if start_date_str:
        start_date = timezone.make_aware(datetime.strptime(start_date_str, '%Y-%m-%d'))
    else:
        start_date = timezone.now() - timedelta(days=30)
    
    if end_date_str:
        end_date = timezone.make_aware(datetime.strptime(end_date_str, '%Y-%m-%d'))
    else:
        end_date = timezone.now()

    # Filter for ad-related financial events (ServiceFee, AdSpend, etc.)
    ad_events = FinancialEvent.objects.filter(
        user=user,
        posted_date__range=(start_date, end_date),
    ).filter(
        Q(event_type__icontains='ServiceFee') | 
        Q(raw_data__icontains='Ad') | 
        Q(raw_data__icontains='Sponsored')
    )

    total_spend = abs(float(ad_events.aggregate(val=Sum('total_amount'))['val'] or 0))
    
    # Get total sales for TACOS calculation
    orders_qs = Order.objects.filter(user=user, purchase_date__range=(start_date, end_date))
    total_sales = float(orders_qs.aggregate(val=Sum('total_amount'))['val'] or 0)
    
    # Daily breakdown
    daily_spend = ad_events.annotate(date=TruncDate('posted_date')).values('date').annotate(
        amount=Sum('total_amount')
    ).order_by('date')

    return JsonResponse({
        "status": "success",
        "summary": {
            "total_ad_spend": round(total_spend, 2),
            "tacos": f"{round((total_spend / total_sales * 100), 2)}%" if total_sales > 0 else "0%",
            "ad_events_count": ad_events.count()
        },
        "daily_breakdown": [{"date": d['date'], "amount": abs(float(d['amount']))} for d in daily_spend],
        "top_ad_line_items": list(ad_events.order_by('total_amount')[:10].values('posted_date', 'total_amount', 'event_type'))
    })

def home(request):
    return JsonResponse({
        "message": "Welcome to Amazon SP-API SaaS",
        "endpoints": {
            "connect": "/api/amazon/connect/",
            "callback": "/api/amazon/callback/",
            "dashboard": "/api/amazon/dashboard-stats/",
            "product_list": "/api/amazon/product-analytics/",
            "sync_orders": "/api/amazon/sync-orders/",
            "sync_finances": "/api/amazon/sync-finances/"
        }
    })
