import logging
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
    Provides calculated counts and metrics for:
    1. Increase Ad Spend (Positive Profit SKUs count & amount)
    2. Decrease Ad Spend (Negative Profit SKUs count & amount)
    3. Payment Leaks (Total difference to recover)
    4. Return Impact (Total return count)
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

            # Pass the underlying HTTP request object to combined view functions
            req_to_pass = getattr(request, '_request', request)

            pos_profit_count = 0
            pos_profit_amount = 0.0
            neg_profit_count = 0
            neg_profit_amount = 0.0
            total_return_count = 0

            # ---------------------------------------------------------
            # 1 & 2: Profit SKU Metrics & Return Impact
            # ---------------------------------------------------------
            try:
                from amazon_auth.profit import combined_profitability_details_transactions_shipping
                prof_res = combined_profitability_details_transactions_shipping(req_to_pass)
                if prof_res.status_code == 200 and isinstance(prof_res.data, dict):
                    rows = prof_res.data.get("response", [])
                    for r in rows:
                        profit = _parse_num_safe(r.get("profit"))
                        if profit > 0:
                            pos_profit_count += 1
                            pos_profit_amount += profit
                        elif profit < 0:
                            neg_profit_count += 1
                            neg_profit_amount += profit

                        ret_qty = _parse_num_safe(r.get("returnqty"))
                        if ret_qty > 0:
                            total_return_count += int(ret_qty)
            except Exception as e:
                logger.error(f"Error calculating profitability details in GrowthOpportunitiesAPIView: {str(e)}")

            # Fallback from combined_get_full_dashboard if counts are 0
            try:
                from amazon_auth.profit import combined_get_full_dashboard
                dash_res = combined_get_full_dashboard(req_to_pass)
                if hasattr(dash_res, 'content'):
                    import json
                    dash_data = json.loads(dash_res.content.decode('utf-8'))
                    header = dash_data.get("header_metrics", {})
                    if total_return_count == 0:
                        total_return_count = header.get("total_return_count", 0)

                    top_orders = dash_data.get("top_orders", {})
                    if pos_profit_count == 0 and top_orders.get("profitable", {}).get("total_count"):
                        pos_profit_count = top_orders["profitable"]["total_count"]
                        pos_profit_amount = _parse_num_safe(top_orders["profitable"].get("total_amount"))
                    if neg_profit_count == 0 and top_orders.get("losing", {}).get("total_count"):
                        neg_profit_count = top_orders["losing"]["total_count"]
                        neg_profit_amount = _parse_num_safe(top_orders["losing"].get("total_amount"))
            except Exception as e:
                logger.error(f"Error fetching dashboard stats fallback: {str(e)}")

            # ---------------------------------------------------------
            # 3: Payment Leaks Total Difference
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
            # 4, 5, 6: High ROI, Low ROI & No Sales with Ad Spend
            # ---------------------------------------------------------
            high_roi_count = 0
            low_roi_count = 0
            no_sales_ad_spend_count = 0

            try:
                from amazon_ads.models import AdsAdGroup
                from django.db.models import Sum

                ad_groups = AdsAdGroup.objects.filter(
                    amazon_account__user=user
                ).annotate(
                    total_cost=Sum("campaign__campaignmetric__cost"),
                    total_sales=Sum("campaign__campaignmetric__sales")
                )

                for ag in ad_groups:
                    c = ag.total_cost or 0.0
                    s = ag.total_sales or 0.0

                    if c > 0 and s == 0:
                        no_sales_ad_spend_count += 1
                    elif c > 0:
                        roas = s / c
                        if roas >= 2.0:
                            high_roi_count += 1
                        else:
                            low_roi_count += 1
                    elif s > 0:
                        high_roi_count += 1

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
                        "description": "Total number of return MP fees.",
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
