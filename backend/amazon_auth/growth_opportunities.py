import logging
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from user_auth.models import get_effective_user

logger = logging.getLogger(__name__)


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


class GrowthOpportunitiesAPIView(APIView):
    """
    Backend API for Growth Opportunities / Growth Insights Dashboard.
    Provides cross-platform (Amazon & Myntra) calculated counts and metrics for:
    1. Increase Ad Spend (Positive Profit SKUs count & amount)
    2. Decrease Ad Spend (Negative Profit SKUs count & amount)
    3. Payment Leaks (Total difference to recover)
    4. Return Impact (Total number of returns)
    5. High ROI Products (SKUs / Ad groups with high ROI)
    6. Low ROI Products (SKUs / Ad groups with low ROI)
    7. No Sales with Ad Spend (SKUs with ad spend but 0 sales)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return self.post(request)

    def post(self, request):
        try:
            user = get_effective_user(request.user)

            data = request.data or {}
            filters = data.get("filters", {})
            if not isinstance(filters, dict):
                filters = {}

            # Extract channel filters
            channels = []
            if isinstance(filters.get("channel"), dict):
                channels = filters.get("channel").get("IN", [])
            if not channels:
                raw_ch = filters.get("channel") or filters.get("channels") or data.get("channels") or data.get("channel")
                if isinstance(raw_ch, list):
                    channels = raw_ch
                elif isinstance(raw_ch, str):
                    channels = [raw_ch]

            pos_profit_count = 0
            pos_profit_amount = 0.0
            neg_profit_count = 0
            neg_profit_amount = 0.0
            total_return_count = 0

            data_bytes = json.dumps(data).encode('utf-8')
            req_to_pass = getattr(request, '_request', request)
            req_to_pass._body = data_bytes
            req_to_pass.data = data
            if hasattr(request, '_request') and request._request != req_to_pass:
                request._request._body = data_bytes
                request._request.data = data

            # ---------------------------------------------------------
            # Step A: Fetch metrics directly from combined_get_full_dashboard
            # ---------------------------------------------------------
            try:
                from amazon_auth.profit import combined_get_full_dashboard
                dash_res = combined_get_full_dashboard(req_to_pass)
                dash_data = {}
                if hasattr(dash_res, 'content'):
                    dash_data = json.loads(dash_res.content.decode('utf-8'))
                elif hasattr(dash_res, 'data') and isinstance(dash_res.data, dict):
                    dash_data = dash_res.data

                header = dash_data.get("header_metrics", {})
                total_return_count = int(_parse_num_safe(header.get("total_return_count", 0)))

                top_orders = dash_data.get("top_orders", {})
                if top_orders.get("profitable"):
                    pos_profit_count = int(_parse_num_safe(top_orders["profitable"].get("total_count", 0)))
                    pos_profit_amount = _parse_num_safe(top_orders["profitable"].get("total_amount", 0))

                if top_orders.get("losing"):
                    neg_profit_count = int(_parse_num_safe(top_orders["losing"].get("total_count", 0)))
                    neg_profit_amount = _parse_num_safe(top_orders["losing"].get("total_amount", 0))
            except Exception as e:
                logger.error(f"Error fetching combined dashboard stats in GrowthOpportunitiesAPIView: {str(e)}")

            # ---------------------------------------------------------
            # Step B: Also calculate from combined SKU profitability list if larger
            # ---------------------------------------------------------
            try:
                from amazon_auth.profit import combined_sku_profitability_list_filtered
                sku_res = combined_sku_profitability_list_filtered(req_to_pass)
                if sku_res.status_code == 200 and isinstance(sku_res.data, dict):
                    rows = sku_res.data.get("response", [])
                    sku_pos_count = 0
                    sku_pos_amount = 0.0
                    sku_neg_count = 0
                    sku_neg_amount = 0.0
                    sku_returns = 0

                    for r in rows:
                        profit = _parse_num_safe(r.get("profit"))
                        if profit > 0:
                            sku_pos_count += 1
                            sku_pos_amount += profit
                        elif profit < 0:
                            sku_neg_count += 1
                            sku_neg_amount += profit

                        ret_qty = _parse_num_safe(r.get("returnqty"))
                        if ret_qty > 0:
                            sku_returns += int(ret_qty)

                    if pos_profit_count == 0 and sku_pos_count > 0:
                        pos_profit_count = sku_pos_count
                        pos_profit_amount = sku_pos_amount

                    if neg_profit_count == 0 and sku_neg_count > 0:
                        neg_profit_count = sku_neg_count
                        neg_profit_amount = sku_neg_amount

                    if total_return_count == 0 and sku_returns > 0:
                        total_return_count = sku_returns
            except Exception as e:
                logger.error(f"Error calculating SKU profitability in GrowthOpportunitiesAPIView: {str(e)}")

            # ---------------------------------------------------------
            # Step C: Payment Leaks Total Difference
            # ---------------------------------------------------------
            payment_leaks_amount = 0.0
            try:
                from amazon_auth.payment_reconcyle import _payment_reconcile_details_transactions_shipping_logic
                recon_res = _payment_reconcile_details_transactions_shipping_logic(req_to_pass, by_sku=False)
                if recon_res.status_code == 200 and isinstance(recon_res.data, dict):
                    totals = recon_res.data.get("totals", {})
                    fees_leaks = _parse_num_safe(totals.get("fees_leaks"))
                    shipping_leaks = _parse_num_safe(totals.get("shipping_leaks"))
                    tcs_leaks = _parse_num_safe(totals.get("tcs_leaks"))
                    unsettled_not_paid = _parse_num_safe(totals.get("unsettled_not_paid"))

                    payment_leaks_amount = fees_leaks + shipping_leaks + tcs_leaks + unsettled_not_paid
            except Exception as e:
                logger.error(f"Error fetching payment reconcile details in GrowthOpportunitiesAPIView: {str(e)}")

            # ---------------------------------------------------------
            # Step D: High ROI, Low ROI & No Sales with Ad Spend (SKU Level)
            # ---------------------------------------------------------
            high_roi_count = 0
            low_roi_count = 0
            no_sales_ad_spend_count = 0

            try:
                from amazon_ads.models import AdsProductAd
                from django.db.models import Sum, Q, FloatField, F
                from django.db.models.functions import Coalesce, Cast

                sku_ads_qs = AdsProductAd.objects.filter(
                    amazon_account__user=user,
                    amazon_account__is_primary=True
                ).values("sku", "asin", "state").annotate(
                    cost=Coalesce(Cast(Sum("productadmetric__cost"), FloatField()), 0.0),
                    sales=Coalesce(Cast(Sum("productadmetric__sales"), FloatField()), 0.0)
                )

                high_roi_count = sku_ads_qs.filter(
                    Q(cost__gt=0, sales__gte=F("cost") * 2.0) | Q(cost=0, sales__gt=0) | Q(cost__isnull=True, sales__gt=0)
                ).count()

                low_roi_count = sku_ads_qs.filter(
                    cost__gt=0, sales__lt=F("cost") * 2.0
                ).count()

                no_sales_ad_spend_count = sku_ads_qs.filter(
                    cost__gt=0, sales=0
                ).count()

            except Exception as e:
                logger.error(f"Error fetching Amazon Ads metrics in GrowthOpportunitiesAPIView: {str(e)}")

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Growth opportunities data fetched successfully.",
                "data": {
                    "increase_ad_spend": {
                        "title": "Increase Ad Spend",
                        "description": "Total number of parent SKUs with positive profit.",
                        "count": pos_profit_count,
                        "amount": round(pos_profit_amount, 2),
                        "formatted_amount": f"₹{round(pos_profit_amount, 2):,}"
                    },
                    "decrease_ad_spend": {
                        "title": "Decrease Ad Spend",
                        "description": "Total number of parent SKUs with negative profit.",
                        "count": neg_profit_count,
                        "amount": round(neg_profit_amount, 2),
                        "formatted_amount": f"₹{round(neg_profit_amount, 2):,}"
                    },
                    "payment_leaks": {
                        "title": "Payment Leaks",
                        "description": "Total amount to recover for payments not matching with estimated.",
                        "amount": round(payment_leaks_amount, 2),
                        "formatted_amount": f"₹{round(payment_leaks_amount, 2):,}"
                    },
                    "return_impact": {
                        "title": "Return Impact",
                        "description": "Total number of returns.",
                        "count": total_return_count
                    },
                    "high_roi_products": {
                        "title": "High ROI Products",
                        "description": "Total number of SKUs with high ROI.",
                        "count": high_roi_count
                    },
                    "low_roi_products": {
                        "title": "Low ROI Products",
                        "description": "Total number of products with low ROI.",
                        "count": low_roi_count
                    },
                    "no_sales_ad_spend": {
                        "title": "No Sales with Ad Spend",
                        "description": "Total number of SKUs with ad spend but 0 sales.",
                        "count": no_sales_ad_spend_count
                    }
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in GrowthOpportunitiesAPIView: {str(e)}")
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
