from datetime import datetime, date
from decimal import Decimal
from zoneinfo import ZoneInfo
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Sum, Avg, Max, Case, When, F, DecimalField, OuterRef, Subquery

from amazon_auth.models import (
    OrderItem, AmazonListingItem, AmazonEstimatedFee,
    FinancialEvent, AmazonTransaction, AmazonTransactionRelatedIdentifier,
    AmazonTransactionBreakdown, ProductMapping
)
from amazon_ads.models import ProductAdMetric
from amazon_auth.utils import normalize_sku, filter_ads_by_local_range, extract_fees_and_tcs_per_asin
from amazon_auth.profit import (
    ProfitabilityDTOAdapter, _combine_totals, _call_view_for_all_results,
    get_undecorated_view, format_currency, parse_currency_to_decimal
)
from amazon_auth.views import sku_profit_report_transactions_shipping


IST = ZoneInfo("Asia/Kolkata")


def parse_dt(dt_str, is_end=False):
    if not dt_str or not isinstance(dt_str, (str, bytes, date, datetime)) or len(str(dt_str)) < 10:
        return None, None
    try:
        if isinstance(dt_str, (datetime, date)):
            dt = dt_str
        else:
            clean_str = str(dt_str).split('T')[0]
            dt = datetime.strptime(clean_str, '%Y-%m-%d')

        if is_end:
            dt = dt.replace(hour=23, minute=59, second=59)
        else:
            dt = dt.replace(hour=0, minute=0, second=0)

        dt_ist = dt.replace(tzinfo=IST)
        dt_utc = dt_ist.astimezone(ZoneInfo("UTC"))
        return dt_utc, dt_ist
    except Exception:
        return None, None


def _payment_reconcile_details_transactions_shipping_logic(request, by_sku=False):
    """
    Payment Reconciliation Overview API Logic.
    Calculates standard profitability metrics along with Reconciliation Actuals & Leaks:
    - actual_fees & fees_leaks
    - actual_shipping_charges & shipping_leaks
    - actual_mp_gst
    - actual_tcs & tcs_leaks
    - expected_settlement
    - settlement_paid_in_bank
    - unsettled_not_paid
    """
    user = request.user
    data_source_raw = request.data if hasattr(request, 'data') and request.data else (request.GET if hasattr(request, 'GET') else {})

    data_source = {}
    if data_source_raw:
        if hasattr(data_source_raw, 'dict'):
            data_source.update(data_source_raw.dict())
        else:
            data_source.update(data_source_raw)

    if not data_source and hasattr(request, '_full_data') and isinstance(request._full_data, dict):
        data_source.update(request._full_data)

    if not data_source:
        try:
            import json
            if hasattr(request, '_request') and hasattr(request._request, 'body'):
                body_data = json.loads(request._request.body)
                if isinstance(body_data, dict):
                    data_source.update(body_data)
        except Exception:
            pass

    search_data = {}
    search_data.update(data_source)

    for fk in ['filters', 'filter']:
        f_val = search_data.get(fk)
        if isinstance(f_val, str):
            try:
                import json
                f_val = json.loads(f_val)
            except Exception:
                pass
        if isinstance(f_val, dict):
            search_data.update(f_val)

    temp_updates = {}
    for k, v in search_data.items():
        for prefix in ['filters[', 'filter[']:
            if k.startswith(prefix) and k.endswith(']'):
                real_key = k[len(prefix):-1]
                temp_updates[real_key] = v
    search_data.update(temp_updates)

    def find_key(keys):
        for k in keys:
            val = search_data.get(k)
            if isinstance(val, dict):
                continue
            if isinstance(val, list) and len(val) > 0:
                val = val[0]
            if val and isinstance(val, (str, int, float)) and str(val).strip():
                return str(val).strip()
            for sk, sv in search_data.items():
                if sk.lower() == k.lower():
                    if isinstance(sv, dict):
                        continue
                    if isinstance(sv, list) and len(sv) > 0:
                        sv = sv[0]
                    if sv and isinstance(sv, (str, int, float)) and str(sv).strip():
                        return str(sv).strip()
        return None

    from_date_str = find_key(['fromDate', 'start_date', 'from_date', 'startDate'])
    to_date_str = find_key(['toDate', 'end_date', 'to_date', 'endDate'])
    search_term = find_key(['search', 'searchTerm', 'q', 'keyword'])

    pagination = data_source.get("pagination", {})
    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))

    from_date, from_date_ist = parse_dt(from_date_str, is_end=False)
    to_date, to_date_ist = parse_dt(to_date_str, is_end=True)

    order_filter = Q(order__user=user)

    CHANNEL_MAP = {"Amazon-India": "A21TJRUUN4KGV"}

    filters = {}
    f_val = data_source.get("filters") or data_source.get("filter")
    if isinstance(f_val, str):
        try:
            import json
            f_val = json.loads(f_val)
        except Exception:
            pass
    if isinstance(f_val, dict):
        filters.update(f_val)

    channels = filters.get("channel", {}).get("IN", []) if isinstance(filters.get("channel"), dict) else []
    if channels:
        marketplace_ids = [CHANNEL_MAP.get(ch) for ch in channels if CHANNEL_MAP.get(ch)]
        order_filter &= Q(order__marketplace_id__in=marketplace_ids)

    parent_ids = filters.get("parentproductid", {}).get("IN", []) if isinstance(filters.get("parentproductid"), dict) else []
    if parent_ids:
        order_filter &= (Q(parent_asin__in=parent_ids) | Q(asin__in=parent_ids))

    if search_term:
        order_filter &= (
            Q(asin__icontains=search_term) |
            Q(parent_asin__icontains=search_term) |
            Q(seller_sku__icontains=search_term)
        )

    if from_date:
        order_filter &= Q(order__purchase_date__gte=from_date)
    if to_date:
        order_filter &= Q(order__purchase_date__lte=to_date)

    listing_qs = AmazonListingItem.objects.filter(
        user=user,
        sku=OuterRef("seller_sku")
    ).order_by("-updated_at")

    values_fields = ('asin', 'parent_asin', 'seller_sku') if by_sku else ('parent_asin',)
    items = (
        OrderItem.objects
        .filter(order_filter)
        .exclude(order__order_status__icontains='Cancel')
        .annotate(
            sku_standard_cost=Subquery(listing_qs.values("standard_cost")[:1]),
            sku_gst_rate=Subquery(listing_qs.values("gst_rate")[:1]),
            sku_tcs_rate=Subquery(listing_qs.values("tcs")[:1]),
            sku_region=Subquery(listing_qs.values("region")[:1]),
        )
        .values(*values_fields)
        .annotate(
            title=Max('title'),
            image_url=Max('image_url'),
            grossqty=Sum('quantity_ordered'),
            quantity_shipped=Sum('quantity_shipped'),
            shipping_income=Sum('shipping_income'),
            shipping_price=Sum('shipping_price'),
            discount=Sum('discount'),
            item_tax=Sum('item_tax'),
            grosssales=Sum(
                Case(
                    When(Q(order__order_status__icontains='Pending') & Q(item_price=0), then=F('new_item_price')),
                    default=F('item_price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),
            promotion_discount=Sum('promotion_discount'),
            avg_cost=Avg(
                Case(
                    When(Q(order__order_status__icontains='Pending') & Q(item_price=0), then=F('new_item_price')),
                    default=F('item_price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2)
                )
            ),
            sku_standard_cost=Max('sku_standard_cost'),
            sku_gst_rate=Max('sku_gst_rate'),
            sku_tcs_rate=Max('sku_tcs_rate'),
            sku_region=Max('sku_region'),
        )
    )

    estimated_fee_qs = AmazonEstimatedFee.objects.filter(
        order_item__order__user=user
    ).exclude(order_item__order__order_status__icontains='Cancel')

    if from_date:
        estimated_fee_qs = estimated_fee_qs.filter(order_item__order__purchase_date__gte=from_date)
    if to_date:
        estimated_fee_qs = estimated_fee_qs.filter(order_item__order__purchase_date__lte=to_date)
    if parent_ids:
        estimated_fee_qs = estimated_fee_qs.filter(order_item__parent_asin__in=parent_ids)

    estimated_fee_data = (
        estimated_fee_qs
        .values('asin')
        .annotate(
            estimated_fees=Sum('total_fees'),
            referral_fee=Sum('referral_fee'),
            closing_fee=Sum('closing_fee'),
            per_item_fee=Sum('per_item_fee'),
            fba_fee=Sum('fba_fee'),
            fba_pick_pack_fee=Sum('fba_pick_pack_fee'),
            fba_weight_handling_fee=Sum('fba_weight_handling_fee'),
            tax_amount=Sum('tax_amount'),
        )
    )

    estimated_fee_by_asin = {
        row['asin']: {
            "estimated_fees": float(row['estimated_fees'] or 0),
            "referral_fee": float(row['referral_fee'] or 0),
            "closing_fee": float(row['closing_fee'] or 0),
            "per_item_fee": float(row['per_item_fee'] or 0),
            "fba_fee": float(row['fba_fee'] or 0),
            "fba_pick_pack_fee": float(row['fba_pick_pack_fee'] or 0),
            "fba_weight_handling_fee": float(row['fba_weight_handling_fee'] or 0),
            "tax_amount": float(row['tax_amount'] or 0),
        }
        for row in estimated_fee_data
    }

    finances_qs = FinancialEvent.objects.filter(user=user)

    raw_map = (
        FinancialEvent.objects
        .filter(user=user)
        .exclude(raw_data=None)
        .values('amazon_order_id', 'raw_data')
    )

    raw_data_map = {}
    for r in raw_map:
        raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])

    if from_date:
        finances_qs = finances_qs.filter(posted_date__gte=from_date)
    if to_date:
        finances_qs = finances_qs.filter(posted_date__lte=to_date)

    finance_data = (
        finances_qs
        .values('amazon_order_id')
        .annotate(
            refund=Sum('total_amount', filter=Q(event_group="REFUND")),
            rto=Sum('total_amount', filter=Q(event_group="RTO")),
            commission=Sum('commission_fee'),
            fulfillment=Sum('fulfillment_fee'),
            other_fee=Sum('other_fee'),
            shipping_fee=Sum('shipping_fee'),
            gst=Sum('tax'),
            total_settled=Sum('total_amount'),
        )
    )

    finance_map = {f['amazon_order_id']: f for f in finance_data}

    asin_orders = (
        OrderItem.objects
        .filter(order_filter)
        .exclude(order__order_status__icontains='Cancel')
        .values('asin', 'parent_asin', 'seller_sku', 'order__amazon_order_id', 'quantity_ordered', 'item_price', 'new_item_price', 'item_tax', 'promotion_discount')
    )

    child_parent_map = {}
    asin_map = {}
    for row in asin_orders:
        p_asin = row['parent_asin'] or row['asin']
        child_parent_map[row['asin']] = p_asin
        asin_map.setdefault(p_asin, []).append(row)

    estimated_fee_map = {}
    for asin, fee_data in estimated_fee_by_asin.items():
        p_asin = child_parent_map.get(asin) or asin
        if p_asin not in estimated_fee_map:
            estimated_fee_map[p_asin] = {
                "estimated_fees": 0.0, "referral_fee": 0.0, "closing_fee": 0.0,
                "per_item_fee": 0.0, "fba_fee": 0.0, "fba_pick_pack_fee": 0.0,
                "fba_weight_handling_fee": 0.0, "tax_amount": 0.0
            }
        for k, v in fee_data.items():
            estimated_fee_map[p_asin][k] += v

    matching_order_ids = [row['order__amazon_order_id'] for row in asin_orders]
    tx_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        identifier_name="ORDER_ID",
        identifier_value__in=matching_order_ids
    ).values("transaction_id", "identifier_value")

    tx_to_order = {row["transaction_id"]: row["identifier_value"] for row in tx_identifiers}

    tx_shipping_map = {}

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
        tx_shipping_map[order_id] = tx_shipping_map.get(order_id, 0.0) + float(txn["total_amount"] or 0)

    afn_tx_ids = AmazonTransaction.objects.filter(
        id__in=tx_to_order.keys(),
        transaction_type="Shipment",
        transaction_status="DEFERRED",
    ).values_list("id", flat=True)

    afn_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=afn_tx_ids,
            breakdown_type__in=["FBAWeightBasedFee"],
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )

    for bd in afn_breakdowns:
        order_id = tx_to_order.get(bd["transaction_id"])
        if not order_id:
            continue
        tx_shipping_map[order_id] = tx_shipping_map.get(order_id, 0.0) + float(bd["total"] or 0)

    FULFILLMENT_FEE_REFUND_PATTERNS = ["FulfillmentFeeRefund"]

    refund_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='Refund',
        transaction_status__in=['DEFERRED', 'DEFERRED_RELEASED']
    )

    refund_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=refund_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values('transaction_id', 'identifier_value')

    refund_tx_to_order = {row['transaction_id']: row['identifier_value'] for row in refund_identifiers}

    refunded_sales_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=refund_tx_to_order.keys(),
            breakdown_type="Refunded Sales",
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )

    refunded_sales_by_order = {}
    for row in refunded_sales_breakdowns:
        order_id = refund_tx_to_order.get(row["transaction_id"])
        if not order_id:
            continue
        refunded_sales_by_order[order_id] = refunded_sales_by_order.get(order_id, 0.0) + float(row["total"] or 0)

    order_ids_with_refund = set(refund_tx_to_order.values())

    fee_refund_q = Q()
    for pattern in FULFILLMENT_FEE_REFUND_PATTERNS:
        fee_refund_q |= Q(description__icontains=pattern)

    fee_refund_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='ServiceFee',
        transaction_status__in=['DEFERRED', 'DEFERRED_RELEASED'],
    ).filter(fee_refund_q)

    fee_refund_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=fee_refund_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values_list('identifier_value', flat=True)

    order_ids_with_fee_refund = set(fee_refund_identifiers)

    fulfillment_fee_refund_breakdowns = (
        AmazonTransaction.objects.filter(
            id__in=tx_to_order.keys(),
            transaction_type="ServiceFee",
            transaction_status__in=["DEFERRED", "DEFERRED_RELEASED"],
            description__icontains="EasyshipFulfillmentFeeRefund",
        )
        .values("id", "total_amount")
    )

    amazon_fee_breakdowns = (
        AmazonTransactionBreakdown.objects.filter(
            transaction_id__in=refund_tx_to_order.keys(),
            breakdown_type="AmazonFees",
        )
        .values("transaction_id")
        .annotate(total=Sum("amount"))
    )

    amazon_fee_refund_by_order = {}
    for row in amazon_fee_breakdowns:
        order_id = refund_tx_to_order.get(row["transaction_id"])
        if not order_id:
            continue
        amazon_fee_refund_by_order[order_id] = amazon_fee_refund_by_order.get(order_id, 0.0) + float(row["total"] or 0)

    fulfillment_fee_refund_by_order = {}
    for txn in fulfillment_fee_refund_breakdowns:
        order_id = tx_to_order.get(txn["id"])
        if not order_id:
            continue
        fulfillment_fee_refund_by_order[order_id] = fulfillment_fee_refund_by_order.get(order_id, 0.0) + float(txn["total_amount"] or 0)

    refund_amount_by_order = {}
    refund_count_by_order = {}
    for txn in refund_txns.filter(id__in=refund_tx_to_order.keys()):
        oid = refund_tx_to_order.get(txn.id)
        if not oid:
            continue
        refund_amount_by_order[oid] = refund_amount_by_order.get(oid, 0.0) + float(txn.total_amount or 0)
        refund_count_by_order[oid] = refund_count_by_order.get(oid, 0) + 1

    claim_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='Adjustment',
        description__icontains='SERRACReimbursement',
    )

    claim_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=claim_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values('transaction_id', 'identifier_value')

    claim_tx_to_order = {row['transaction_id']: row['identifier_value'] for row in claim_identifiers}

    claim_amount_by_order = {}
    claim_count_by_order = {}
    for txn in claim_txns.filter(id__in=claim_tx_to_order.keys()):
        oid = claim_tx_to_order.get(txn.id)
        if not oid:
            continue
        claim_amount_by_order[oid] = claim_amount_by_order.get(oid, 0.0) + float(txn.total_amount or 0)
        claim_count_by_order[oid] = claim_count_by_order.get(oid, 0) + 1

    replacement_txns = AmazonTransaction.objects.filter(
        amazon_account__user=user,
        transaction_type='Shipment',
        description='Order Payment',
        total_amount=0,
    )

    replacement_identifiers = AmazonTransactionRelatedIdentifier.objects.filter(
        transaction__in=replacement_txns,
        identifier_name='ORDER_ID',
        identifier_value__in=matching_order_ids
    ).values('transaction_id', 'identifier_value')

    replacement_tx_to_order = {row['transaction_id']: row['identifier_value'] for row in replacement_identifiers}

    replacement_count_by_order = {}
    for txn in replacement_txns.filter(id__in=replacement_tx_to_order.keys()):
        oid = replacement_tx_to_order.get(txn.id)
        if not oid:
            continue
        replacement_count_by_order[oid] = replacement_count_by_order.get(oid, 0) + 1

    sku_asin_map = {
        normalize_sku(k): v
        for k, v in OrderItem.objects
            .filter(order_filter)
            .values_list('seller_sku', 'asin')
    }

    ads_metrics_qs = ProductAdMetric.objects.filter(
        product_ad__amazon_account__user=user,
        product_ad__amazon_account__is_primary=True,
    )
    if from_date_ist:
        ads_metrics_qs = ads_metrics_qs.filter(report_date__gte=from_date_ist.date())
    if to_date_ist:
        ads_metrics_qs = ads_metrics_qs.filter(report_date__lte=to_date_ist.date())

    ads_agg = ads_metrics_qs.values("product_ad__sku").annotate(
        total_ads_cost=Sum("cost"),
        total_ads_sales=Sum("sales"),
        total_ads_clicks=Sum("clicks"),
        total_ads_orders=Sum("orders"),
        total_ads_impressions=Sum("impressions"),
    )

    skus_with_ads = [x["product_ad__sku"] for x in ads_agg if x["product_ad__sku"]]

    pm_mappings = ProductMapping.objects.filter(account__user=user, seller_sku__in=skus_with_ads).values("seller_sku", "parent_asin", "asin", "product_name", "image_url")
    pm_dict = {m["seller_sku"]: m for m in pm_mappings}

    missing_skus = [sku for sku in skus_with_ads if sku not in pm_dict]
    if missing_skus:
        ali_mappings = AmazonListingItem.objects.filter(user=user, sku__in=missing_skus).values("sku", "asin", "item_name", "image_url")
        for ali in ali_mappings:
            if ali["sku"] not in pm_dict:
                pm_dict[ali["sku"]] = {
                    "seller_sku": ali["sku"],
                    "parent_asin": ali["asin"],
                    "asin": ali["asin"],
                    "product_name": ali["item_name"],
                    "image_url": ali["image_url"],
                }

    missing_skus = [sku for sku in skus_with_ads if sku not in pm_dict]
    if missing_skus:
        oi_mappings = OrderItem.objects.filter(order__user=user, seller_sku__in=missing_skus).values("seller_sku", "parent_asin", "asin", "title", "image_url")
        for oi in oi_mappings:
            if oi["seller_sku"] not in pm_dict:
                pm_dict[oi["seller_sku"]] = {
                    "seller_sku": oi["seller_sku"],
                    "parent_asin": oi["parent_asin"],
                    "asin": oi["asin"],
                    "product_name": oi["title"],
                    "image_url": oi["image_url"],
                }

    ads_by_parent = {}
    for agg in ads_agg:
        sku = agg["product_ad__sku"]
        if not sku:
            continue
        pm = pm_dict.get(sku, {})
        p_asin = pm.get("parent_asin") or pm.get("asin") or sku
        if p_asin not in ads_by_parent:
            ads_by_parent[p_asin] = {
                "title": pm.get("product_name") or p_asin,
                "image_url": pm.get("image_url") or "",
                "cost": 0, "sales": 0, "clicks": 0, "orders": 0, "impressions": 0
            }
        ads_by_parent[p_asin]["cost"] += float(agg["total_ads_cost"] or 0)
        ads_by_parent[p_asin]["sales"] += float(agg["total_ads_sales"] or 0)
        ads_by_parent[p_asin]["clicks"] += int(agg["total_ads_clicks"] or 0)
        ads_by_parent[p_asin]["orders"] += int(agg["total_ads_orders"] or 0)
        ads_by_parent[p_asin]["impressions"] += int(agg["total_ads_impressions"] or 0)

    results = []

    total_sales = total_profit = total_ads = 0
    total_mpfees = total_net_sales = total_qty = total_final_net_qty = 0
    total_final_net_sales = 0
    total_returns = total_shipping = 0
    total_stdcost = 0
    total_estimatefees = 0
    total_mp_gst = 0
    total_tcs = 0
    total_taxable_value = 0
    total_gst_payable = 0
    total_exp_settlement = 0
    total_promo_discount = 0

    # RECONCILIATION TOTALS
    total_actual_fees = 0.0
    total_fees_leaks = 0.0
    total_actual_shipping = 0.0
    total_shipping_leaks = 0.0
    total_actual_mp_gst = 0.0
    total_actual_tcs = 0.0
    total_tcs_leaks = 0.0
    total_settlement_paid = 0.0
    total_unsettled_not_paid = 0.0
    total_courier_return_count = 0
    total_customer_return_count = 0

    for row in items:
        if by_sku:
            seller_sku = row.get('seller_sku') or ''
            asin_val = row.get('asin') or row.get('parent_asin') or ''
            parent_asin = row.get('parent_asin') or asin_val
            orders = [o for o in asin_map.get(parent_asin, []) if o.get('seller_sku') == seller_sku] if seller_sku else asin_map.get(parent_asin, [])
        else:
            seller_sku = ''
            parent_asin = row.get('parent_asin') or ''
            asin_val = parent_asin
            orders = asin_map.get(parent_asin, [])

        fee_data = estimated_fee_map.get(parent_asin, {})
        estimated_fees = fee_data.get("estimated_fees", 0)

        referral_fee = fee_data.get("referral_fee", 0)
        closing_fee = fee_data.get("closing_fee", 0)
        per_item_fee = fee_data.get("per_item_fee", 0)
        fba_fee = fee_data.get("fba_fee", 0)
        fba_pick_pack_fee = fee_data.get("fba_pick_pack_fee", 0)
        fba_weight_handling_fee = fee_data.get("fba_weight_handling_fee", 0)
        tax_amount = fee_data.get("tax_amount", 0)

        gross_qty = int(row['grossqty'] or 0)
        gross_sales = float(str(row['grosssales'] or 0))
        item_tax = float(str(row.get('item_tax') or 0))
        promo_discount = float(str(row.get('promotion_discount') or 0))
        gst_rate = float(str(row.get("sku_gst_rate") or 0))
        tcs_rate = float(str(row.get("sku_tcs_rate") or 0))
        standard_cost = float(str(row.get("sku_standard_cost") or 0))

        tx_shipping_final = 0.0
        amazon_fee_refund_total = 0.0
        fulfillment_fee_refund_total = 0.0
        refunded_sales_total = 0.0

        for o in orders:
            oid = o['order__amazon_order_id']
            tx_shipping_final += float(tx_shipping_map.get(oid, 0.0))
            amazon_fee_refund_total += float(amazon_fee_refund_by_order.get(oid, 0.0))
            fulfillment_fee_refund_total += float(fulfillment_fee_refund_by_order.get(oid, 0.0))
            refunded_sales_total += float(refunded_sales_by_order.get(oid, 0.0))

        shipping_price = tx_shipping_final
        estimated_fees -= amazon_fee_refund_total

        parent_ad_data = ads_by_parent.get(parent_asin, {})
        ads = -abs(float(parent_ad_data.get("cost", 0)))

        refund = rto = mpfees = shipping_fee = 0.0
        return_units = 0.0
        t_new_charge = 0.0
        gst = 0.0

        final_net_sales = 0.0
        total_cost = 0.0

        # RECONCILIATION ACTUALS ACCUMULATOR FOR THIS ASIN ROW
        row_actual_fees = 0.0
        row_actual_shipping = 0.0
        row_actual_mp_gst = 0.0
        row_actual_tcs = 0.0
        row_settlement_paid = 0.0

        for o in orders:
            oid = o['order__amazon_order_id']
            qty = float(o['quantity_ordered'] or 0)
            o_item_price = float(str(o.get('item_price') or 0))
            o_new_item_price = float(str(o.get('new_item_price') or 0))
            o_item_tax = float(str(o.get('item_tax') or 0))

            f = finance_map.get(oid, {})

            refund += float(f.get('refund') or 0)
            rto += float(f.get('rto') or 0)

            mpfees += (
                float(f.get('commission') or 0) +
                float(f.get('fulfillment') or 0) +
                float(f.get('other_fee') or 0)
            )

            shipping_fee += float(f.get('shipping_fee') or 0)
            gst += float(f.get('gst') or 0)

            # RECONCILIATION ACTUALS PER ORDER
            o_act_fees = (
                abs(float(f.get('commission') or 0)) +
                abs(float(f.get('fulfillment') or 0)) +
                abs(float(f.get('other_fee') or 0))
            )
            o_act_ship = abs(float(f.get('shipping_fee') or 0))
            o_act_gst = abs(float(f.get('gst') or 0))
            o_act_settled = float(f.get('total_settled') or 0)

            row_actual_fees += o_act_fees
            row_actual_shipping += o_act_ship
            row_actual_mp_gst += o_act_gst
            row_settlement_paid += o_act_settled

            order_fee_map = extract_fees_and_tcs_per_asin(
                raw_data_map.get(oid, []),
                sku_asin_map=sku_asin_map
            )

            for child_asin, fee_data_inner in order_fee_map.items():
                parent_key = child_parent_map.get(child_asin)
                if parent_key == parent_asin:
                    t_new_charge += float(fee_data_inner["fee"])
                    row_actual_tcs += abs(float(fee_data_inner.get("tcs", 0)))

            r = float(f.get('refund') or 0)
            rto_amt = float(f.get('rto') or 0)

            if r < 0 or rto_amt < 0:
                return_units += qty

            o_item_price = o_new_item_price if o_item_price == 0 else o_item_price
            o_gross = o_item_price + o_item_tax
            o_cost = standard_cost * qty

            o_replacement_count = replacement_count_by_order.get(oid, 0)
            o_return_count = refund_count_by_order.get(oid, 0)
            o_has_return = oid in order_ids_with_refund

            if o_replacement_count or (o_has_return and qty == o_return_count):
                o_gross = 0.0
                o_cost = 0.0
                o_promo = float(str(o.get('promotion_discount') or 0))
                promo_discount -= o_promo

            final_net_sales += o_gross
            total_cost += o_cost

        row_order_ids = [o['order__amazon_order_id'] for o in orders]
        order_return_amount = sum(refund_amount_by_order.get(oid, 0.0) for oid in row_order_ids)
        order_return_count = sum(refund_count_by_order.get(oid, 0) for oid in row_order_ids)
        order_has_return = any(oid in order_ids_with_refund for oid in row_order_ids)
        order_is_courier_return = any(oid in order_ids_with_fee_refund for oid in row_order_ids)

        if order_has_return and order_is_courier_return:
            order_return_type = "COURIER_RETURN"
        elif order_has_return:
            order_return_type = "CUSTOMER_RETURN"
        else:
            order_return_type = None

        row_courier_return_count = sum(1 for oid in row_order_ids if oid in order_ids_with_fee_refund)
        row_customer_return_count = sum(1 for oid in row_order_ids if (oid in order_ids_with_refund and oid not in order_ids_with_fee_refund))

        row_courier_return_price = sum(refund_amount_by_order.get(oid, 0.0) for oid in row_order_ids if oid in order_ids_with_fee_refund)
        row_customer_return_price = sum(refund_amount_by_order.get(oid, 0.0) for oid in row_order_ids if (oid in order_ids_with_refund and oid not in order_ids_with_fee_refund))

        row_total_returns = row_courier_return_count + row_customer_return_count
        return_units = max(int(return_units), row_total_returns)

        order_claim_amount = sum(claim_amount_by_order.get(oid, 0.0) for oid in row_order_ids)
        order_claim_count = sum(claim_count_by_order.get(oid, 0) for oid in row_order_ids)
        order_replacement_count = sum(replacement_count_by_order.get(oid, 0) for oid in row_order_ids)

        net_sales = final_net_sales
        adjusted_gross_sales_val = gross_sales + item_tax

        mpfees = -abs(estimated_fees)

        if gst_rate > 0:
            taxable_value = final_net_sales / (1.0 + (gst_rate / 100.0))
            gst_to_pay_amount = final_net_sales - taxable_value
            gst_to_pay_perc = gst_rate
        else:
            taxable_value = final_net_sales
            gst_to_pay_amount = 0.0
            gst_to_pay_perc = 0.0

        tcs = taxable_value * ((tcs_rate or 1.0) / 100.0)
        mp_gst = (-abs(estimated_fees) + shipping_price) * 0.18

        cost = total_cost

        profit = (
            final_net_sales
            + shipping_price
            + ads
            + tcs
            - estimated_fees
            - mp_gst
            - promo_discount
            - order_claim_amount
            - cost
        )

        exp_settlement = (
            final_net_sales
            + shipping_price
            + ads
            + tcs
            - estimated_fees
            - mp_gst
            - promo_discount
            - order_claim_amount
        )

        profit_margin = (profit / net_sales * 100) if net_sales else 0.0
        tacos = (abs(ads) / gross_sales * 100) if gross_sales else 0.0

        return_units = order_return_count + order_replacement_count
        row_customer_return_count += order_replacement_count

        final_net_qty = max(gross_qty - return_units, 0)
        net_qty = gross_qty
        ret_percent = (return_units / gross_qty * 100) if gross_qty else 0.0

        # RECONCILIATION DERIVED VALUES FOR THIS ROW
        fees_leaks = round(abs(mpfees) - row_actual_fees, 2)
        shipping_leaks = round(abs(shipping_price) - row_actual_shipping, 2)
        tcs_leaks = round(abs(tcs) - row_actual_tcs, 2)
        unsettled_not_paid = round(exp_settlement - row_settlement_paid, 2)

        results.append({
            "asin": asin_val,
            "parent_asin": parent_asin,
            "seller_sku": seller_sku,
            "child_sku": seller_sku or parent_asin,
            "view": seller_sku or parent_asin,
            "name": row['title'],
            "image": row['image_url'],
            "image_url": row['image_url'],
            "channel": "Amazon-India",
            "channel1": "Amazon-India",
            "redirecturl": f"https://www.amazon.in/dp/{parent_asin}",

            "grossqty": gross_qty,
            "qty": gross_qty,
            "netqty": net_qty,
            "final_net_qty": final_net_qty,

            "grosssales": round(gross_sales, 2),
            "netsales": format_currency(net_sales),
            "final_net_sales": format_currency(final_net_sales),

            "returnqty": return_units,
            "retpercent": round(ret_percent, 2),
            "totalreturnper": f"{round(ret_percent, 2)}%",
            "courier_return_count": row_courier_return_count,
            "customer_return_count": row_customer_return_count,
            "courier_return_price": format_currency(row_courier_return_price),
            "customer_return_price": format_currency(row_customer_return_price),
            "return_type": order_return_type,

            "promo_discount": format_currency(promo_discount),
            "ads": format_currency(ads),
            "mpfees": round(mpfees, 2),
            "estimatefees": format_currency(mpfees),
            "referral_fee": format_currency(-abs(referral_fee)),
            "closing_fee": format_currency(-abs(closing_fee)),
            "per_item_fee": format_currency(-abs(per_item_fee)),
            "fba_fee": format_currency(-abs(fba_fee)),
            "fba_pick_pack_fee": format_currency(-abs(fba_pick_pack_fee)),
            "fba_weight_handling_fee": format_currency(-abs(fba_weight_handling_fee)),
            "tax_amount": format_currency(tax_amount),

            "shippingfees": format_currency(shipping_price),
            "shipping": round(shipping_price, 2),
            "mp_gst": format_currency(mp_gst),

            "taxable_value": format_currency(taxable_value),
            "gst_to_pay_amount": format_currency(gst_to_pay_amount),
            "gst_to_pay_perc": round(gst_to_pay_perc, 2),
            "tcs": format_currency(tcs),

            "claim_amount": format_currency(order_claim_amount),
            "claim_count": order_claim_count,
            "replacement_return_count": order_replacement_count,

            "exp_settlement": format_currency(exp_settlement),
            "expected_settlement": format_currency(exp_settlement),
            "stdcost": format_currency(cost),
            "profit": format_currency(profit),
            "grossprofitper": round(profit_margin, 2),
            "tacos": round(tacos, 2),

            # RECONCILIATION EXTRA COLUMNS (YELLOW COLUMNS)
            "actual_fees": format_currency(row_actual_fees),
            "fees_leaks": format_currency(fees_leaks),
            "actual_shipping_charges": format_currency(row_actual_shipping),
            "shipping_leaks": format_currency(shipping_leaks),
            "actual_mp_gst": format_currency(row_actual_mp_gst),
            "actual_tcs": format_currency(row_actual_tcs),
            "tcs_leaks": format_currency(tcs_leaks),
            "settlement_paid_in_bank": format_currency(row_settlement_paid),
            "unsettled_not_paid": format_currency(unsettled_not_paid),
        })

        total_sales += gross_sales
        total_final_net_sales += final_net_sales
        total_qty += gross_qty
        total_final_net_qty += final_net_qty
        total_returns += return_units
        total_shipping += shipping_price
        total_mpfees += mpfees
        total_estimatefees += mpfees
        total_mp_gst += mp_gst
        total_tcs += tcs
        total_taxable_value += taxable_value
        total_gst_payable += gst_to_pay_amount
        total_exp_settlement += exp_settlement
        total_promo_discount += promo_discount
        total_stdcost += cost
        total_profit += profit
        total_ads += ads

        total_actual_fees += row_actual_fees
        total_fees_leaks += fees_leaks
        total_actual_shipping += row_actual_shipping
        total_shipping_leaks += shipping_leaks
        total_actual_mp_gst += row_actual_mp_gst
        total_actual_tcs += row_actual_tcs
        total_tcs_leaks += tcs_leaks
        total_settlement_paid += row_settlement_paid
        total_unsettled_not_paid += unsettled_not_paid
        total_courier_return_count += row_courier_return_count
        total_customer_return_count += row_customer_return_count

    total_net_sales = total_final_net_sales
    return_perc = (total_returns / total_qty * 100) if total_qty else 0.0
    overall_profit_margin = (total_profit / total_net_sales * 100) if total_net_sales else 0.0

    totals = {
        "grosssales": format_currency(total_sales),
        "netsales": format_currency(total_net_sales),
        "final_net_sales": format_currency(total_final_net_sales),
        "total_final_net_sales": format_currency(total_final_net_sales),
        "grossqty": total_qty,
        "netqty": total_qty,
        "total_netquantity": total_qty,
        "final_net_qty": total_final_net_qty,
        "total_final_net_qty": total_final_net_qty,
        "returnqty": total_returns,
        "totalreturn": total_returns,
        "total_returns": total_returns,
        "retpercent": round(return_perc, 2),
        "totalreturnper": f"{round(return_perc, 2)}%",
        "courier_return_count": total_courier_return_count,
        "customer_return_count": total_customer_return_count,

        "promo_discount": format_currency(total_promo_discount),
        "total_promo_discount": format_currency(total_promo_discount),
        "adSpend": format_currency(total_ads),
        "ads": format_currency(total_ads),

        "mpfees": round(total_mpfees, 2),
        "estimatefees": format_currency(total_mpfees),
        "shipping": format_currency(total_shipping),
        "shippingfees": format_currency(total_shipping),
        "mp_gst": format_currency(total_mp_gst),
        "tcs": format_currency(total_tcs),

        "taxable_value": format_currency(total_taxable_value),
        "gst_to_pay_amount": format_currency(total_gst_payable),
        "exp_settlement": format_currency(total_exp_settlement),
        "expected_settlement": format_currency(total_exp_settlement),
        "stdcost": format_currency(total_stdcost),
        "cost": format_currency(total_stdcost),
        "profit": format_currency(total_profit),
        "totalprofitmargin": round(overall_profit_margin, 2),

        # RECONCILIATION TOTALS (YELLOW COLUMNS)
        "actual_fees": format_currency(total_actual_fees),
        "fees_leaks": format_currency(total_fees_leaks),
        "actual_shipping_charges": format_currency(total_actual_shipping),
        "shipping_leaks": format_currency(total_shipping_leaks),
        "actual_mp_gst": format_currency(total_actual_mp_gst),
        "actual_tcs": format_currency(total_actual_tcs),
        "tcs_leaks": format_currency(total_tcs_leaks),
        "settlement_paid_in_bank": format_currency(total_settlement_paid),
        "unsettled_not_paid": format_currency(total_unsettled_not_paid),
    }

    results.sort(key=lambda item: float(str(item.get("grosssales", 0)).replace('₹', '').replace(',', '') or 0), reverse=True)

    total_count = len(results)
    paginated_results = results[page_no * page_size : (page_no + 1) * page_size]

    return Response({
        "status": True,
        "message": "Success",
        "pagination": {
            "pageNo": page_no,
            "pageSize": page_size,
            "count": total_count,
        },
        "totals": totals,
        "response": paginated_results
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def combined_payment_reconcile_overview(request):
    """
    Multi-Channel Combined Payment Reconciliation Overview API.
    Calls base Amazon Payment Reconciliation API & combines Myntra data with DTO adapters.
    """
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
        return _payment_reconcile_details_transactions_shipping_logic(request, by_sku=False)

    amazon_rows = []
    myntra_rows = []
    amazon_totals = {}
    myntra_totals = {}

    if has_amazon:
        amazon_res = _call_view_for_all_results(_payment_reconcile_details_transactions_shipping_logic, request)
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
        except Exception:
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

    dto_rows.sort(key=lambda item: float(str(item.grosssales).replace('₹', '').replace(',', '') or 0), reverse=True)

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


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def payment_reconcile_details_transactions_shipping(request, by_sku=False):
    """
    Payment Reconciliation Overview API.
    """
    return _payment_reconcile_details_transactions_shipping_logic(request, by_sku=by_sku)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def payment_reconcile_parent_transactions_shipping(request):
    """
    Payment Reconciliation by Parent ASIN (Child SKU breakdown level).
    """
    return _payment_reconcile_details_transactions_shipping_logic(request, by_sku=True)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def combined_payment_reconcile_by_parent_asin(request):
    """
    Multi-Channel Combined Payment Reconciliation by Parent ASIN API.
    Calls base Amazon Payment Reconciliation Parent API & combines Myntra SKU data with DTO adapters.
    """
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
        return _payment_reconcile_details_transactions_shipping_logic(request, by_sku=True)

    amazon_rows = []
    myntra_rows = []
    amazon_totals = {}
    myntra_totals = {}

    if has_amazon:
        amazon_res = _call_view_for_all_results(lambda req: _payment_reconcile_details_transactions_shipping_logic(req, by_sku=True), request)
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
        except Exception:
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

    dto_rows.sort(key=lambda item: float(str(item.grosssales).replace('₹', '').replace(',', '') or 0), reverse=True)

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


def _payment_reconcile_order_level_logic(request):
    """
    Payment Reconciliation Order Level Logic.
    Calls base sku_profit_report_transactions_shipping and enriches each order row
    with Payment Reconciliation Actuals & Leaks:
    - actual_fees & fees_leaks
    - actual_shipping_charges & shipping_leaks
    - actual_mp_gst
    - actual_tcs & tcs_leaks
    - expected_settlement
    - settlement_paid_in_bank
    - unsettled_not_paid
    """
    undecorated = get_undecorated_view(sku_profit_report_transactions_shipping)
    res = undecorated(request)
    if res.status_code != 200 or not isinstance(res.data, dict):
        return res

    data = res.data
    rows = data.get("response", [])
    totals = data.get("totals", {})

    if not rows:
        return res

    order_ids = [r.get("order_id") for r in rows if r.get("order_id")]

    finance_data = (
        FinancialEvent.objects.filter(user=request.user, amazon_order_id__in=order_ids)
        .values('amazon_order_id')
        .annotate(
            commission=Sum('commission_fee'),
            fulfillment=Sum('fulfillment_fee'),
            other_fee=Sum('other_fee'),
            shipping_fee=Sum('shipping_fee'),
            gst=Sum('tax'),
            total_settled=Sum('total_amount'),
        )
    )
    finance_map = {f['amazon_order_id']: f for f in finance_data}

    raw_map = (
        FinancialEvent.objects.filter(user=request.user, amazon_order_id__in=order_ids)
        .exclude(raw_data=None)
        .values('amazon_order_id', 'raw_data')
    )
    raw_data_map = {}
    for r in raw_map:
        raw_data_map.setdefault(r['amazon_order_id'], []).append(r['raw_data'])

    tot_act_fees = 0.0
    tot_fee_leaks = 0.0
    tot_act_ship = 0.0
    tot_ship_leaks = 0.0
    tot_act_gst = 0.0
    tot_act_tcs = 0.0
    tot_tcs_leaks = 0.0
    tot_settled_paid = 0.0
    tot_unsettled = 0.0

    for r in rows:
        oid = r.get("order_id")
        f = finance_map.get(oid, {})

        row_actual_fees = abs(float(f.get('commission') or 0)) + abs(float(f.get('fulfillment') or 0)) + abs(float(f.get('other_fee') or 0))
        row_actual_shipping = abs(float(f.get('shipping_fee') or 0))
        row_actual_mp_gst = abs(float(f.get('gst') or 0))
        row_settlement_paid = float(f.get('total_settled') or 0)

        order_fee_map = extract_fees_and_tcs_per_asin(raw_data_map.get(oid, []))
        row_actual_tcs = sum(abs(float(fee_info.get("tcs", 0))) for fee_info in order_fee_map.values())

        mpfees_num = abs(float(parse_currency_to_decimal(r.get("mpfees") if r.get("mpfees") is not None else r.get("estimatefees")) or 0))
        shipping_num = abs(float(parse_currency_to_decimal(r.get("shippingfees") if r.get("shippingfees") is not None else r.get("shipping")) or 0))
        tcs_num = abs(float(parse_currency_to_decimal(r.get("tcs")) or 0))
        exp_settlement_num = float(parse_currency_to_decimal(r.get("exp_settlement") if r.get("exp_settlement") is not None else r.get("expected_settlement")) or 0)

        fees_leaks = round(mpfees_num - row_actual_fees, 2)
        shipping_leaks = round(shipping_num - row_actual_shipping, 2)
        tcs_leaks = round(tcs_num - row_actual_tcs, 2)
        unsettled_not_paid = round(exp_settlement_num - row_settlement_paid, 2)


        tot_act_fees += row_actual_fees
        tot_fee_leaks += fees_leaks
        tot_act_ship += row_actual_shipping
        tot_ship_leaks += shipping_leaks
        tot_act_gst += row_actual_mp_gst
        tot_act_tcs += row_actual_tcs
        tot_tcs_leaks += tcs_leaks
        tot_settled_paid += row_settlement_paid
        tot_unsettled += unsettled_not_paid

        r.update({
            "actual_fees": format_currency(row_actual_fees),
            "fees_leaks": format_currency(fees_leaks),
            "actual_shipping_charges": format_currency(row_actual_shipping),
            "shipping_leaks": format_currency(shipping_leaks),
            "actual_mp_gst": format_currency(row_actual_mp_gst),
            "actual_tcs": format_currency(row_actual_tcs),
            "tcs_leaks": format_currency(tcs_leaks),
            "expected_settlement": format_currency(exp_settlement_num),
            "settlement_paid_in_bank": format_currency(row_settlement_paid),
            "unsettled_not_paid": format_currency(unsettled_not_paid),
        })

    totals.update({
        "actual_fees": format_currency(tot_act_fees),
        "total_actual_fees": format_currency(tot_act_fees),
        "fees_leaks": format_currency(tot_fee_leaks),
        "total_fees_leaks": format_currency(tot_fee_leaks),
        "actual_shipping_charges": format_currency(tot_act_ship),
        "total_actual_shipping": format_currency(tot_act_ship),
        "shipping_leaks": format_currency(tot_ship_leaks),
        "total_shipping_leaks": format_currency(tot_ship_leaks),
        "actual_mp_gst": format_currency(tot_act_gst),
        "total_actual_mp_gst": format_currency(tot_act_gst),
        "actual_tcs": format_currency(tot_act_tcs),
        "total_actual_tcs": format_currency(tot_act_tcs),
        "tcs_leaks": format_currency(tot_tcs_leaks),
        "total_tcs_leaks": format_currency(tot_tcs_leaks),
        "settlement_paid_in_bank": format_currency(tot_settled_paid),
        "total_settlement_paid_in_bank": format_currency(tot_settled_paid),
        "unsettled_not_paid": format_currency(tot_unsettled),
        "total_unsettled_not_paid": format_currency(tot_unsettled),
    })

    return Response(data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def payment_reconcile_order_level_transactions_shipping(request):
    """
    Payment Reconciliation by Order Level (Child SKU & Order ID breakdown level).
    """
    return _payment_reconcile_order_level_logic(request)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def combined_payment_reconcile_by_parentproductid(request):
    """
    Multi-Channel Combined Payment Reconciliation by Order / Parent Product ID API.
    Calls base Amazon Payment Reconciliation Order API & combines Myntra Order data with DTO adapters.
    """
    user = request.user
    data = request.data or {}

    filters = data.get("filters", {})
    pagination = data.get("pagination", {})
    page_no = int(pagination.get("pageNo", 0))
    page_size = int(pagination.get("pageSize", 25))

    search_term = data.get("search") or filters.get("search") or filters.get("searchTerm") or filters.get("q") or filters.get("keyword")
    if isinstance(search_term, list) and search_term:
        search_term = search_term[0]
    if search_term:
        search_term = str(search_term).strip()

    from_date_str = filters.get('fromDate')
    to_date_str = filters.get('endDate') or filters.get('toDate')
    sku = data.get("sku") or filters.get("sku")
    parent_product_id = data.get("parentProductId") or filters.get("parentProductId") or filters.get("parent_product_id") or data.get("asin") or filters.get("asin") or filters.get("parent_asin")

    channels = filters.get("channel", {}).get("IN", []) if isinstance(filters.get("channel"), dict) else []

    has_myntra = "Myntra" in channels
    has_amazon = "Amazon-India" in channels or len(channels) == 0

    if has_amazon and not has_myntra:
        return _payment_reconcile_order_level_logic(request)

    amazon_rows = []
    myntra_rows = []
    amazon_totals = {}
    myntra_totals = {}

    if has_amazon:
        amazon_res = _call_view_for_all_results(_payment_reconcile_order_level_logic, request)
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
        except Exception:
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

    dto_rows.sort(key=lambda item: float(str(item.grosssales).replace('₹', '').replace(',', '') or 0), reverse=True)

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


