import json
from decimal import Decimal

from openpyxl import Workbook
from django.apps import apps
import time
import pandas as pd
from .models import * 

# 🔴 IMPORTANT: change app name here
from amazon_auth.models import Order  

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


def _get_sku_profits_for_dashboard(user, start_date, end_date, filters={}):
    from django.db.models import Sum, Max, Q, Subquery, OuterRef
    from amazon_auth.models import (
        OrderItem, AmazonEstimatedFee, AmazonListingItem,
        AmazonTransaction, AmazonTransactionRelatedIdentifier,
    )
    from amazon_ads.models import ProductAdMetric
    from collections import defaultdict

    order_filter = Q(order__user=user)
    if start_date:
        order_filter &= Q(order__purchase_date__gte=start_date)
    if end_date:
        order_filter &= Q(order__purchase_date__lte=end_date)
    
    channels = filters.get("channel", {}).get("IN", [])
    if channels:
        CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}
        marketplace_ids = [CHANNEL_MAP[ch] for ch in channels if ch in CHANNEL_MAP]
        if marketplace_ids:
            order_filter &= Q(order__marketplace_id__in=marketplace_ids)

    listing_qs = AmazonListingItem.objects.filter(
        user=user,
        sku=OuterRef("seller_sku")
    ).order_by("-updated_at")

    items = OrderItem.objects.filter(order_filter).exclude(
        order__order_status__icontains='Cancel'
    ).annotate(
        sku_standard_cost=Subquery(listing_qs.values("standard_cost")[:1]),
        sku_gst_rate=Subquery(listing_qs.values("gst_rate")[:1]),
        sku_tcs_rate=Subquery(listing_qs.values("tcs")[:1]),
    ).values('seller_sku').annotate(
        grosssales=Sum('item_price'),
        item_tax=Sum('item_tax'),
        promotion_discount=Sum('promotion_discount'),
        qty=Sum('quantity_ordered'),
        title=Max('title'),
        cost_price=Max('sku_standard_cost'),
        gst_rate=Max('sku_gst_rate'),
        tcs_rate=Max('sku_tcs_rate'),
    )

    ad_metrics = ProductAdMetric.objects.filter(
        product_ad__amazon_account__user=user,
        product_ad__amazon_account__is_primary=True
    )
    if start_date:
        ad_metrics = ad_metrics.filter(report_date__gte=start_date.date())
    if end_date:
        ad_metrics = ad_metrics.filter(report_date__lte=end_date.date())
    
    ads_map = defaultdict(float)
    for m in ad_metrics.select_related('product_ad'):
        ads_map[m.product_ad.sku] += float(m.cost or 0)

    fee_qs = AmazonEstimatedFee.objects.filter(
        amazon_account__user=user
    ).order_by('seller_sku', '-estimated_at')
    
    fee_map = {}
    for f in fee_qs:
        if f.seller_sku not in fee_map:
            fee_map[f.seller_sku] = float(f.total_fees or 0)

    # ---------------- SKU -> ORDERS MAP ----------------
    sku_orders = (
        OrderItem.objects
        .filter(order_filter)
        .exclude(order__order_status__icontains='Cancel')
        .values('seller_sku', 'order__amazon_order_id')
    )

    sku_to_orders = defaultdict(set)
    all_order_ids = set()
    for row in sku_orders:
        sku_to_orders[row['seller_sku']].add(row['order__amazon_order_id'])
        all_order_ids.add(row['order__amazon_order_id'])

    # ---------------- TRANSACTION SHIPPING FEES — MFN POSTAGE FEE ONLY ----------------
    # tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
    #     identifier_name='ORDER_ID',
    #     identifier_value__in=list(all_order_ids)
    # ).values('transaction_id', 'identifier_value')

    # tx_to_order = {
    #     item['transaction_id']: item['identifier_value']
    #     for item in tx_identifiers
    # }

    # tx_shipping_map = {}

    # # MFN shipping cost posts as its own ServiceFee transaction
    # # (description "MfnPostageFee") — only count RELEASED (settled) ones
    # # to avoid double-counting the DEFERRED version of the same fee.
    # mfn_postage_txns = AmazonTransaction.objects.filter(
    #     id__in=tx_to_order.keys(),
    #     transaction_type='ServiceFee',
    #     transaction_status='RELEASED',
    #     description__icontains='MfnPostageFee'
    # ).values('id', 'total_amount')

    # for t in mfn_postage_txns:
    #     t_id = t['id']
    #     oid = tx_to_order.get(t_id)
    #     if not oid:
    #         continue
    #     tx_shipping_map[oid] = tx_shipping_map.get(oid, 0.0) + float(t['total_amount'] or 0)
    
    # ---------------- TRANSACTION SHIPPING FEES (MFN + AFN/FBA) ----------------

    tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        identifier_name="ORDER_ID",
        identifier_value__in=list(all_order_ids)
    ).values("transaction_id", "identifier_value")

    tx_to_order = {
        row["transaction_id"]: row["identifier_value"]
        for row in tx_identifiers
    }

    tx_shipping_map = {}

    # ============================================================
    # MFN SHIPPING
    # ServiceFee -> RELEASED -> MfnPostageFee
    # ============================================================

    mfn_postage_txns = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="ServiceFee",
        transaction_status="DEFERRED",
        description__icontains="MfnPostageFee",
    ).values("id", "total_amount")

    for txn in mfn_postage_txns:
        order_id = tx_to_order.get(txn["id"])
        if not order_id:
            continue

        tx_shipping_map[order_id] = (
            tx_shipping_map.get(order_id, 0.0)
            + float(txn["total_amount"] or 0)
        )

    # ============================================================
    # AFN/FBA SHIPPING
    # Shipment -> DEFERRED
    # Shipping + FBAWeightBasedFee
    # ============================================================

    afn_transaction_ids = list(
        AmazonTransaction.objects.filter(
            id__in=tx_to_order.keys(),
            transaction_type="Shipment",
            transaction_status="DEFERRED",
        ).values_list("id", flat=True)
    )

    afn_shipping = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=afn_transaction_ids,
            breakdown_type__in=[
                "Shipping",
                "FBAWeightBasedFee",
            ],
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )

    for row in afn_shipping:
        order_id = tx_to_order.get(row["transaction_id"])
        if not order_id:
            continue

        tx_shipping_map[order_id] = (
            tx_shipping_map.get(order_id, 0.0)
            + float(row["total"] or 0)
        )

    sku_results = []
    for row in items:
        sku = row['seller_sku']
        if not sku:
            continue
        
        gross_sales = float(row['grosssales'] or 0)
        item_tax = float(row['item_tax'] or 0)
        promo_discount = float(row['promotion_discount'] or 0)

        # Sum shipping across all orders that contain this SKU
        shipping_final = sum(
            tx_shipping_map.get(oid, 0.0)
            for oid in sku_to_orders.get(sku, [])
        )

        qty = int(row['qty'] or 0)
        
        stdcost = float(row['cost_price'] or 0) * qty
        gst_rate = float(row['gst_rate'] or 0)
        tcs_rate = float(row['tcs_rate'] or 1)
        
        # ads_map stores raw positive spend — make it negative (expense)
        ads = -abs(ads_map.get(sku, 0))

        estimated_fees = fee_map.get(sku, 0) * qty
        
        net_sales = gross_sales + item_tax + shipping_final

        if gst_rate > 0:
            taxable_value = net_sales / (1 + (gst_rate / 100))
            gst_to_pay_amount = net_sales - taxable_value
        else:
            taxable_value = net_sales
            gst_to_pay_amount = item_tax

        tcs_total = taxable_value * (tcs_rate / 100)
        mp_gst = (estimated_fees + shipping_final) * 0.18

        profit = (
            net_sales
            - estimated_fees
            - shipping_final
            - stdcost
            + tcs_total
            + mp_gst
            + ads
            - gst_to_pay_amount
        )
        
        sku_results.append({
            "sku": sku,
            "name": row['title'],
            "profit": round(profit, 2),
            "shipping_final": round(shipping_final, 2),
        })

    return sku_results

def export_order_to_excel(file_path="orders.xlsx"):
    wb = Workbook()
    ws = wb.active
    ws.title = "Orders"

    fields = [field.name for field in Order._meta.fields]
    ws.append(fields)

    for obj in Order.objects.iterator(chunk_size=1000):
        row = []
        for field in fields:
            value = getattr(obj, field)

            if value is not None:
                value = str(value)
            else:
                value = ""

            row.append(value)

        ws.append(row)

    wb.save(file_path)


def export_all_tables_to_excel(file_path="all_data.xlsx"):
    wb = Workbook()
    wb.remove(wb.active)

    for model in apps.get_models():
        sheet = wb.create_sheet(title=model.__name__)

        fields = [field.name for field in model._meta.fields]
        sheet.append(fields)

        for obj in model.objects.iterator(chunk_size=1000):
            sheet.append([
                str(getattr(obj, f)) if getattr(obj, f) else ""
                for f in fields
            ])

    wb.save(file_path)


def export_order_items_to_excel(file_path="order_items.xlsx"):

    wb = Workbook()
    ws = wb.active
    ws.title = "OrderItems"

    fields = [field.name for field in OrderItem._meta.fields]
    ws.append(fields)

    for obj in OrderItem.objects.iterator(chunk_size=1000):
        row = []
        for field in fields:
            value = getattr(obj, field)

            # 🔹 Handle Foreign Keys nicely
            if field == "order":
                value = obj.order.id if obj.order else ""
            elif field == "product":
                value = str(obj.product) if hasattr(obj, "product") and obj.product else ""

            # 🔹 Handle general values
            elif value is not None:
                value = str(value)
            else:
                value = ""

            row.append(value)

        ws.append(row)

    wb.save(file_path)    



def export_financial_events_to_excel(file_path="financial_events.xlsx"):

    wb = Workbook()
    ws = wb.active
    ws.title = "FinancialEvents"

    fields = [field.name for field in FinancialEvent._meta.fields]
    ws.append(fields)

    for obj in FinancialEvent.objects.iterator(chunk_size=1000):
        row = []
        for field in fields:
            value = getattr(obj, field)

            # Better readable values
            if field == "user":
                value = obj.user.username if obj.user else ""
            elif field == "amazon_account":
                value = str(obj.amazon_account) if obj.amazon_account else ""
            elif field == "raw_data":
                value = str(value)[:500] if value else ""  # avoid huge JSON

            else:
                value = str(value) if value is not None else ""

            row.append(value)

        ws.append(row)

    wb.save(file_path)    



def export_all_data_to_single_excel(file_path="complete_data.xlsx"):


    wb = Workbook()
    wb.remove(wb.active)  # remove default sheet

    # ---------------------------
    # 🔹 Orders Sheet
    # ---------------------------
    ws_orders = wb.create_sheet(title="Orders")
    order_fields = [f.name for f in Order._meta.fields]
    ws_orders.append(order_fields)

    for obj in Order.objects.iterator(chunk_size=1000):
        ws_orders.append([
            str(getattr(obj, f)) if getattr(obj, f) else ""
            for f in order_fields
        ])

    # ---------------------------
    # 🔹 OrderItems Sheet
    # ---------------------------
    ws_items = wb.create_sheet(title="OrderItems")
    item_fields = [f.name for f in OrderItem._meta.fields]
    ws_items.append(item_fields)

    for obj in OrderItem.objects.iterator(chunk_size=1000):
        row = []
        for f in item_fields:
            value = getattr(obj, f)

            if f == "order":
                value = obj.order.id if obj.order else ""
            elif hasattr(value, "__str__"):
                value = str(value)
            else:
                value = value if value else ""

            row.append(value)

        ws_items.append(row)

    # ---------------------------
    # 🔹 Financial Events Sheet
    # ---------------------------
    ws_fin = wb.create_sheet(title="FinancialEvents")
    fin_fields = [f.name for f in FinancialEvent._meta.fields]
    ws_fin.append(fin_fields)

    for obj in FinancialEvent.objects.iterator(chunk_size=1000):
        row = []
        for f in fin_fields:
            value = getattr(obj, f)

            if f == "user":
                value = obj.user.username if obj.user else ""
            elif f == "amazon_account":
                value = str(obj.amazon_account) if obj.amazon_account else ""
            elif f == "raw_data":
                value = str(value)[:300] if value else ""  # limit size
            else:
                value = str(value) if value else ""

            row.append(value)

        ws_fin.append(row)

    # ---------------------------
    # 🔹 Reports Sheet
    # ---------------------------
    ws_rep = wb.create_sheet(title="Reports")
    rep_fields = [f.name for f in Report._meta.fields]
    ws_rep.append(rep_fields)

    for obj in Report.objects.iterator(chunk_size=1000):
        row = []
        for f in rep_fields:
            value = getattr(obj, f)

            if f == "user":
                value = obj.user.username if obj.user else ""
            elif f == "amazon_account":
                value = str(obj.amazon_account) if obj.amazon_account else ""
            elif f == "raw_data":
                value = str(value)[:300] if value else ""
            else:
                value = str(value) if value else ""

            row.append(value)

        ws_rep.append(row)

    # ---------------------------
    #  Save file
    # ---------------------------
    wb.save(file_path)


def update_orderitem_from_mapping():
    mappings = ProductMapping.objects.all()

    for m in mappings:
        OrderItem.objects.filter(seller_sku=m.seller_sku).update(
            parent_sku=m.parent_sku,
            product_name=m.product_name,
            brand=m.brand,
            cost_price=m.cost_price
        )
        

# amazon_auth/services/ad_importer.py


def safe_get(row, *keys):
    for k in keys:
        if k in row and pd.notna(row[k]):
            return row[k]
    return None


def import_ads_from_excel(file_path):
    # df = pd.read_excel(file_path)
    # df = pd.read_excel(file_path, engine="openpyxl")
    if not os.path.exists(file_path):
        raise Exception(f"File not found: {file_path}")

    if os.path.getsize(file_path) == 0:
        raise Exception("Ads file is empty")

    try:
        df = pd.read_excel(file_path, engine="openpyxl")
    except:
        df = pd.read_csv(file_path)

    for _, row in df.iterrows():
        sku = safe_get(row, 'advertised SKU', 'Advertised SKU', 'sku')
        if not sku:
            continue

        date_val = row.get('date')
        if pd.isna(date_val):
            continue

        AdReport.objects.update_or_create(
            sku=sku,
            date=pd.to_datetime(date_val).date(),
            defaults={
                "impressions": int(row.get('impressions', 0) or 0),
                "clicks": int(row.get('clicks', 0) or 0),
                "spend": float(row.get('spend', 0) or 0),
                "ad_sales": float(row.get('7 day total sales', 0) or 0),
                "ad_orders": int(row.get('7 day total orders', 0) or 0),
            }
        )

# from .spapi_manager import get_catalog_item

def safe_catalog_call(manager, asin, marketplace_id, retries=3):
    print("call catlog function")
    for attempt in range(retries):
        try:
            return manager.get_catalog_item(asin, marketplace_id)
        except Exception as e:
            print(f"Catalog API retry {attempt+1}: {e}")
            time.sleep(2 * (attempt + 1))  # exponential backoff
    return {}



def normalize_financial_events(payload):
    data = payload.get("payload", {}).get("FinancialEvents", {})

    result = {
        "shipments": [],
        "refunds": [],
        "fees": [],
        "adjustments": [],
        "summary": {
            "total_sales": 0,
            "total_refunds": 0,
            "total_fees": 0,
            "net": 0
        }
    }

    # ------------------
    # SHIPMENTS
    # ------------------
    for event in data.get("ShipmentEventList", []):
        total = 0

        for charge in event.get("OrderChargeList", []):
            total += charge["ChargeAmount"]["CurrencyAmount"]

        result["shipments"].append({
            "order_id": event.get("AmazonOrderId"),
            "posted_date": event.get("PostedDate"),
            "amount": total
        })

        result["summary"]["total_sales"] += total

    # ------------------
    # REFUNDS
    # ------------------
    for event in data.get("RefundEventList", []):
        total = 0

        for charge in event.get("OrderChargeList", []):
            total += charge["ChargeAmount"]["CurrencyAmount"]

        result["refunds"].append({
            "order_id": event.get("AmazonOrderId"),
            "posted_date": event.get("PostedDate"),
            "amount": total
        })

        result["summary"]["total_refunds"] += total

    # ------------------
    # FEES (from shipments + refunds)
    # ------------------
    for event_list_name in ["ShipmentEventList", "RefundEventList"]:
        for event in data.get(event_list_name, []):
            for fee in event.get("OrderFeeList", []):
                amount = fee["FeeAmount"]["CurrencyAmount"]

                result["fees"].append({
                    "type": fee["FeeType"],
                    "amount": amount
                })

                result["summary"]["total_fees"] += amount

    # ------------------
    # NET CALCULATION
    # ------------------
    result["summary"]["net"] = (
        result["summary"]["total_sales"]
        - result["summary"]["total_refunds"]
        - result["summary"]["total_fees"]
    )

    return result



# def classify_event(event_type):
#     if event_type == "ShipmentEvent":
#         return "SALE"
#     elif event_type == "RefundEvent":
#         return "REFUND"
#     elif event_type == "GuaranteeClaimEvent":
#         return "CLAIM"
#     elif event_type in ["ServiceFeeEvent", "FeeEvent"]:
#         return "FEE"
#     else:
#         return "OTHER"
    

def classify_event(event_type):
    if event_type == "ShipmentEvent":
        return "SALE"
    elif event_type == "RefundEvent":
        return "REFUND"
    elif event_type in ["GuaranteeClaimEvent", "ChargebackEvent"]:
        return "CLAIM"
    elif event_type in ["ServiceFeeEvent", "FeeEvent"]:
        return "FEE"
    elif event_type == "AdjustmentEvent":
        return "ADJUSTMENT"
    
    elif event_type in ["RetrochargeEvent"]:
        return "RTO"   # 🔥 IMPORTANT
    else:
        return "OTHER"

def get_val(row, *keys, default=0):
    for k in keys:
        if k in row and row[k] not in [None, ""]:
            return row[k]
    return default

def format_currency(value):
    value = float(value or 0)
    return f"-₹{abs(round(value, 2))}" if value < 0 else f"₹{round(value, 2)}"

# def extract_fees_and_tcs_per_asin(raw_list, sku_asin_map=None):
#     asin_map = {}

#     for raw in raw_list:
#         if not isinstance(raw, dict):
#             continue

#         try:
#             item_lists = []
#             item_lists.extend(raw.get("ShipmentItemList", []))
#             item_lists.extend(raw.get("ShipmentItemAdjustmentList", []))

#             for item in item_lists:
#                 # sku = item.get("SellerSKU")
#                 asin = item.get("ASIN")
#                 sku = normalize_sku(item.get("SellerSKU"))

#                 # 🔥 FIX SKU → ASIN
#                 if not asin and sku and sku_asin_map:
#                     asin = sku_asin_map.get(sku)

#                 if not asin:
#                     continue

#                 asin_map.setdefault(asin, {"fee": 0, "tcs": 0})

#                 # -------- FEES --------
#                 for fee in item.get("ItemFeeList", []) + item.get("ItemFeeAdjustmentList", []):
#                     asin_map[asin]["fee"] += float(
#                         fee.get("FeeAmount", {}).get("CurrencyAmount", 0) or 0
#                     )

#                 # -------- TCS --------
#                 for charge in item.get("ItemChargeList", []):
#                     if charge.get("ChargeType") == "TCS-IGST":
#                         asin_map[asin]["tcs"] += float(
#                             charge.get("ChargeAmount", {}).get("CurrencyAmount", 0) or 0
#                         )

#         except Exception:
#             pass

#     return asin_map


from decimal import Decimal

def extract_fees_and_tcs_per_asin(raw_list, sku_asin_map=None):
    asin_map = {}

    for raw in raw_list:
        if not isinstance(raw, dict):
            continue

        item_lists = []
        item_lists.extend(raw.get("ShipmentItemList", []))
        item_lists.extend(raw.get("ShipmentItemAdjustmentList", []))

        for item in item_lists:
            asin = item.get("ASIN")
            sku = normalize_sku(item.get("SellerSKU"))

            if not asin and sku and sku_asin_map:
                asin = sku_asin_map.get(sku)

            if not asin:
                continue

            asin_map.setdefault(asin, {"fee": Decimal(0), "tcs": Decimal(0)})

            for fee in item.get("ItemFeeList", []) + item.get("ItemFeeAdjustmentList", []):
                asin_map[asin]["fee"] += Decimal(
                    fee.get("FeeAmount", {}).get("CurrencyAmount", 0) or 0
                )

            for charge in item.get("ItemChargeList", []):
                if charge.get("ChargeType") == "TCS-IGST":
                    asin_map[asin]["tcs"] += Decimal(
                        charge.get("ChargeAmount", {}).get("CurrencyAmount", 0) or 0
                    )

    return asin_map

def normalize_sku(sku):
        return sku.replace(" COPY", "").strip() if sku else sku

def clean_sku(sku):
    if not sku:
        return sku
    return sku.replace("       ", "").strip()