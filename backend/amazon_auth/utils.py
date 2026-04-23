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

def safe_catalog_call(manager, asin, marketplace_id, retries=3):
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


