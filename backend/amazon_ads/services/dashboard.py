from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum, Q
from django.db.models.functions import TruncDate
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from amazon_ads.models import CampaignMetric, AmazonAdsAccount
from amazon_auth.models import Order


def get_campaign_type(name):
    if not name:
        return "Sponsored Products"
    name_upper = name.upper()
    if any(token in name_upper for token in ["SD-", "SD_", " SD", "-SD"]):
        return "Sponsored Display"
    elif any(token in name_upper for token in ["SB-", "SB_", " SB", "-SB"]):
        return "Sponsored Brands"
    return "Sponsored Products"


class AdsDashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # ---------------------------------------------------------------------
        # 1. PARSE DATE RANGE
        # ---------------------------------------------------------------------
        start_date_str = request.GET.get("start_date")
        end_date_str = request.GET.get("end_date")

        try:
            if end_date_str:
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
            else:
                end_date = timezone.now().date()

            if start_date_str:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            else:
                start_date = end_date - timedelta(days=30)
        except ValueError:
            return Response({
                "status": False,
                "message": "Invalid date format. Use YYYY-MM-DD."
            }, status=400)

        if start_date > end_date:
            return Response({
                "status": False,
                "message": "start_date cannot be greater than end_date."
            }, status=400)

        # ---------------------------------------------------------------------
        # 2. COMPARISON PERIOD
        # ---------------------------------------------------------------------
        num_days = (end_date - start_date).days + 1
        prev_end_date = start_date - timedelta(days=1)
        prev_start_date = prev_end_date - timedelta(days=num_days - 1)

        # ---------------------------------------------------------------------
        # 3. QUERY ACTIVE ADS ACCOUNT
        # ---------------------------------------------------------------------
        ad_account_id = request.GET.get("ad_account_id")
        account_filter = Q(campaign__amazon_account__user=user)
        
        if ad_account_id:
            account_filter &= Q(campaign__amazon_account__profile_id=ad_account_id)
        else:
            account_filter &= Q(campaign__amazon_account__is_primary=True)

        # ---------------------------------------------------------------------
        # 4. CURRENT PERIOD STATS
        # ---------------------------------------------------------------------
        curr_metrics = CampaignMetric.objects.filter(
            account_filter,
            report_date__range=[start_date, end_date]
        ).aggregate(
            spend=Sum("cost"),
            sales=Sum("sales")
        )

        curr_spend = float(curr_metrics["spend"] or 0.0)
        curr_sales = float(curr_metrics["sales"] or 0.0)

        curr_acos = (curr_spend / curr_sales * 100.0) if curr_sales > 0 else 0.0
        curr_roas = (curr_sales / curr_spend) if curr_spend > 0 else 0.0

        curr_orders_sales = Order.objects.filter(
            user=user,
            purchase_date__date__range=[start_date, end_date]
        ).aggregate(total=Sum("total_amount"))["total"] or 0.0
        curr_store_sales = float(curr_orders_sales)

        curr_tacos = (curr_spend / curr_store_sales * 100.0) if curr_store_sales > 0 else 0.0

        # ---------------------------------------------------------------------
        # 5. PREVIOUS PERIOD STATS (for comparison)
        # ---------------------------------------------------------------------
        prev_metrics = CampaignMetric.objects.filter(
            account_filter,
            report_date__range=[prev_start_date, prev_end_date]
        ).aggregate(
            spend=Sum("cost"),
            sales=Sum("sales")
        )

        prev_spend = float(prev_metrics["spend"] or 0.0)
        prev_sales = float(prev_metrics["sales"] or 0.0)

        prev_acos = (prev_spend / prev_sales * 100.0) if prev_sales > 0 else 0.0
        prev_roas = (prev_sales / prev_spend) if prev_spend > 0 else 0.0

        prev_orders_sales = Order.objects.filter(
            user=user,
            purchase_date__date__range=[prev_start_date, prev_end_date]
        ).aggregate(total=Sum("total_amount"))["total"] or 0.0
        prev_store_sales = float(prev_orders_sales)

        prev_tacos = (prev_spend / prev_store_sales * 100.0) if prev_store_sales > 0 else 0.0

        # Helper to format change
        def calculate_change(curr_val, prev_val):
            if prev_val == 0.0:
                change = 0.0
            else:
                change = ((curr_val - prev_val) / prev_val) * 100.0
            sign = "+" if change >= 0 else ""
            return {
                "pct": round(change, 2),
                "formatted": f"{sign}{round(change, 2)}%"
            }

        # ---------------------------------------------------------------------
        # 6. DAILY TRENDS (for Performance Trend Chart)
        # ---------------------------------------------------------------------
        daily_metrics = {
            m["report_date"]: m
            for m in CampaignMetric.objects.filter(
                account_filter,
                report_date__range=[start_date, end_date]
            ).values("report_date").annotate(
                spend=Sum("cost"),
                sales=Sum("sales")
            )
        }

        daily_orders = {
            o["day"]: o
            for o in Order.objects.filter(
                user=user,
                purchase_date__date__range=[start_date, end_date]
            ).annotate(day=TruncDate("purchase_date")).values("day").annotate(
                total_sales=Sum("total_amount")
            )
        }

        performance_trend = []
        curr_day = start_date
        while curr_day <= end_date:
            m = daily_metrics.get(curr_day, {"spend": 0.0, "sales": 0.0})
            o = daily_orders.get(curr_day, {"total_sales": 0.0})

            day_spend = float(m["spend"] or 0.0)
            day_sales = float(m["sales"] or 0.0)
            day_store_sales = float(o["total_sales"] or 0.0)

            day_acos = (day_spend / day_sales * 100.0) if day_sales > 0 else 0.0
            day_tacos = (day_spend / day_store_sales * 100.0) if day_store_sales > 0 else 0.0
            day_roas = (day_sales / day_spend) if day_spend > 0 else 0.0

            performance_trend.append({
                "date": curr_day.strftime("%b %d"),
                "acos": round(day_acos, 2),
                "tacos": round(day_tacos, 2),
                "roas": round(day_roas, 2),
                "spend": round(day_spend, 2),
                "sales": round(day_sales, 2)
            })
            curr_day += timedelta(days=1)

        # ---------------------------------------------------------------------
        # 7. PERFORMANCE BY CAMPAIGN TYPE (Donut / Table)
        # ---------------------------------------------------------------------
        campaign_metrics = CampaignMetric.objects.filter(
            account_filter,
            report_date__range=[start_date, end_date]
        ).values(
            "campaign_id",
            "campaign__name"
        ).annotate(
            spend=Sum("cost"),
            sales=Sum("sales")
        )

        breakdown = {
            "Sponsored Products": {"spend": 0.0, "sales": 0.0},
            "Sponsored Brands": {"spend": 0.0, "sales": 0.0},
            "Sponsored Display": {"spend": 0.0, "sales": 0.0}
        }

        for row in campaign_metrics:
            name = row["campaign__name"] or ""
            camp_type = get_campaign_type(name)
            breakdown[camp_type]["spend"] += float(row["spend"] or 0.0)
            breakdown[camp_type]["sales"] += float(row["sales"] or 0.0)

        # Donut Breakdown
        total_spend_all = sum(b["spend"] for b in breakdown.values())
        performance_breakdown = []
        for k, v in breakdown.items():
            pct = (v["spend"] / total_spend_all * 100.0) if total_spend_all > 0 else 0.0
            performance_breakdown.append({
                "campaign_type": k,
                "spend": round(v["spend"], 2),
                "percentage": round(pct, 2)
            })

        # Performance by Campaign Type Table
        performance_by_type = []
        for k, v in breakdown.items():
            type_acos = (v["spend"] / v["sales"] * 100.0) if v["sales"] > 0 else 0.0
            performance_by_type.append({
                "campaign_type": k,
                "spend": round(v["spend"], 2),
                "sales": round(v["sales"], 2),
                "acos": round(type_acos, 2)
            })

        # ---------------------------------------------------------------------
        # 8. TOP CAMPAIGNS
        # ---------------------------------------------------------------------
        sorted_campaigns = sorted(campaign_metrics, key=lambda x: (x["sales"] or 0.0), reverse=True)[:5]
        top_campaigns = []
        
        for row in sorted_campaigns:
            c_spend = float(row["spend"] or 0.0)
            c_sales = float(row["sales"] or 0.0)
            c_acos = (c_spend / c_sales * 100.0) if c_sales > 0 else 0.0
            c_roas = (c_sales / c_spend) if c_spend > 0 else 0.0

            if c_acos == 0:
                status = "Good"
            elif c_acos <= 20.0:
                status = "Excellent"
            elif c_acos <= 35.0:
                status = "Good"
            elif c_acos <= 50.0:
                status = "Moderate"
            else:
                status = "Poor"

            top_campaigns.append({
                "campaign_id": row["campaign_id"],
                "name": row["campaign__name"],
                "spend": round(c_spend, 2),
                "sales": round(c_sales, 2),
                "acos": round(c_acos, 2),
                "roas": round(c_roas, 2),
                "status": status
            })

        # ---------------------------------------------------------------------
        # 9. CONSTRUCT RESPONSE
        # ---------------------------------------------------------------------
        response_data = {
            "summary_cards": {
                "acos": {
                    "value": round(curr_acos, 2),
                    "change": calculate_change(curr_acos, prev_acos)
                },
                "tacos": {
                    "value": round(curr_tacos, 2),
                    "change": calculate_change(curr_tacos, prev_tacos)
                },
                "roas": {
                    "value": round(curr_roas, 2),
                    "change": calculate_change(curr_roas, prev_roas)
                },
                "ad_spend": {
                    "value": round(curr_spend, 2),
                    "change": calculate_change(curr_spend, prev_spend)
                },
                "sales_from_ads": {
                    "value": round(curr_sales, 2),
                    "change": calculate_change(curr_sales, prev_sales)
                }
            },
            "performance_trend": performance_trend,
            "performance_breakdown": performance_breakdown,
            "performance_by_type": performance_by_type,
            "top_campaigns": top_campaigns
        }

        return Response({
            "status": True,
            "message": "Dashboard statistics fetched successfully",
            "data": response_data
        })
