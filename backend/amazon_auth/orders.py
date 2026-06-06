# views.py

from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models.functions import Coalesce
from rest_framework import status
from .models import Order , OrderItem ,FinancialEvent
from django.db.models import (
    Sum,
    Count,
    Q,
    F,
    Value,
    DecimalField
)

class OrderProcessingDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    """
    Dashboard API for:
    - Orders Received
    - Orders Shipped
    - Orders Delivered
    - Pending Orders
    - Cancelled Orders
    - Return Initiated Orders
    - Timeline Graph
    - Pie Chart Data
    - Insights
    """

    def get(self, request):

        user = request.user

        # ---------------- FILTERS ----------------
        marketplace_id = request.GET.get("marketplace_id")
        channel = request.GET.get("channel")
        timeline = request.GET.get("timeline", "daily")  # daily / weekly / monthly

        queryset = Order.objects.filter(user=user)

        if marketplace_id:
            queryset = queryset.filter(marketplace_id=marketplace_id)

        if channel:
            queryset = queryset.filter(channel=channel)

        total_orders = queryset.count()

        # ---------------- STATUS COUNTS ----------------

        orders_received = total_orders

        shipped_orders = queryset.filter(
            order_status__iexact="Shipped"
        ).count()

        delivered_orders = queryset.filter(
            order_status__iexact="Delivered"
        ).count()

        pending_orders = queryset.filter(
            Q(order_status__iexact="Pending") |
            Q(order_status__iexact="Unshipped")
        ).count()

        cancelled_orders = queryset.filter(
            order_status__iexact="Canceled"
        ).count()

        return_initiated_orders = queryset.filter(
            Q(order_status__icontains="Return") |
            Q(order_status__icontains="Refund")
        ).count()

        # ---------------- PERCENTAGES ----------------

        def percentage(value):
            if total_orders == 0:
                return 0
            return round((value / total_orders) * 100, 2)

        # ---------------- TIMELINE GRAPH ----------------

        now = timezone.now()

        if timeline == "monthly":
            trunc_function = TruncMonth("purchase_date")
            start_date = now - timedelta(days=365)

        elif timeline == "weekly":
            trunc_function = TruncWeek("purchase_date")
            start_date = now - timedelta(days=90)

        else:
            trunc_function = TruncDay("purchase_date")
            start_date = now - timedelta(days=30)

        graph_queryset = queryset.filter(
            purchase_date__gte=start_date
        )

        graph_data = (
            graph_queryset
            .annotate(period=trunc_function)
            .values("period")
            .annotate(
                total_orders=Count("id"),

                shipped=Count(
                    "id",
                    filter=Q(order_status__iexact="Shipped")
                ),

                delivered=Count(
                    "id",
                    filter=Q(order_status__iexact="Delivered")
                ),

                pending=Count(
                    "id",
                    filter=Q(order_status__iexact="Pending")
                ),

                cancelled=Count(
                    "id",
                    filter=Q(order_status__iexact="Canceled")
                ),

                returns=Count(
                    "id",
                    filter=Q(order_status__icontains="Return")
                )
            )
            .order_by("period")
        )

        timeline_data = []

        for row in graph_data:
            timeline_data.append({
                "date": row["period"].strftime("%Y-%m-%d"),

                "orders_received": row["total_orders"],
                "orders_shipped": row["shipped"],
                "orders_delivered": row["delivered"],
                "pending": row["pending"],
                "cancelled": row["cancelled"],
                "return_initiated": row["returns"],
            })

        # ---------------- PIE CHART DATA ----------------

        pie_chart = [
            {
                "name": "Delivered",
                "value": delivered_orders
            },
            {
                "name": "Shipped",
                "value": shipped_orders
            },
            {
                "name": "Pending",
                "value": pending_orders
            },
            {
                "name": "Cancelled",
                "value": cancelled_orders
            },
            {
                "name": "Return Initiated",
                "value": return_initiated_orders
            }
        ]

        # ---------------- INSIGHTS ----------------

        insights = {
            "delivery_rate": percentage(delivered_orders),
            "pending_rate": percentage(pending_orders),
            "cancellation_rate": percentage(cancelled_orders),
            "return_rate": percentage(return_initiated_orders),
        }

        # ---------------- FINAL RESPONSE ----------------

        return Response({
            "status": True,
            "message": "Order processing dashboard fetched successfully",

            "filters": {
                "marketplace_id": marketplace_id,
                "channel": channel,
                "timeline": timeline
            },

            "cards": {
                "orders_received": {
                    "count": orders_received,
                    "percentage": percentage(orders_received)
                },

                "orders_shipped": {
                    "count": shipped_orders,
                    "percentage": percentage(shipped_orders)
                },

                "orders_delivered": {
                    "count": delivered_orders,
                    "percentage": percentage(delivered_orders)
                },

                "pending": {
                    "count": pending_orders,
                    "percentage": percentage(pending_orders)
                },

                "cancelled": {
                    "count": cancelled_orders,
                    "percentage": percentage(cancelled_orders)
                },

                "return_initiated": {
                    "count": return_initiated_orders,
                    "percentage": percentage(return_initiated_orders)
                }
            },

            "timeline_graph": timeline_data,

            "pie_chart": pie_chart,

            "insights": insights
        })
        

class OrderSettlementDashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        filters = data.get("filters", {})

        amazon_account_id = filters.get("amazon_account_id")
        order_status = filters.get("order_status")
        fulfillment_channel = filters.get("fulfillment_channel")
        search = filters.get("search")

        start_date = filters.get("start_date")
        end_date = filters.get("end_date")

        # =====================================================
        # BASE QUERYSETS
        # =====================================================

        orders_queryset = Order.objects.filter(
            user=request.user
        ).select_related(
            "amazon_account"
        )

        items_queryset = OrderItem.objects.select_related(
            "order",
            "order__amazon_account"
        ).filter(
            order__user=request.user
        )

        financial_queryset = FinancialEvent.objects.filter(
            user=request.user
        )

        # =====================================================
        # AMAZON ACCOUNT FILTER
        # =====================================================

        if amazon_account_id:

            orders_queryset = orders_queryset.filter(
                amazon_account_id=amazon_account_id
            )

            items_queryset = items_queryset.filter(
                order__amazon_account_id=amazon_account_id
            )

            financial_queryset = financial_queryset.filter(
                amazon_account_id=amazon_account_id
            )

        # =====================================================
        # DATE FILTER
        # =====================================================

        if start_date and end_date:

            orders_queryset = orders_queryset.filter(
                purchase_date__date__range=[start_date, end_date]
            )

            items_queryset = items_queryset.filter(
                order__purchase_date__date__range=[start_date, end_date]
            )

            financial_queryset = financial_queryset.filter(
                posted_date__date__range=[start_date, end_date]
            )

        # =====================================================
        # ORDER STATUS FILTER
        # =====================================================

        if order_status:

            orders_queryset = orders_queryset.filter(
                order_status__iexact=order_status
            )

        # =====================================================
        # FULFILLMENT CHANNEL FILTER
        # =====================================================

        if fulfillment_channel:

            orders_queryset = orders_queryset.filter(
                fulfillment_channel__iexact=fulfillment_channel
            )

        # =====================================================
        # GLOBAL SEARCH
        # =====================================================

        if search:

            orders_queryset = orders_queryset.filter(

                Q(amazon_order_id__icontains=search) |
                Q(buyer_name__icontains=search) |
                Q(city__icontains=search) |
                Q(state__icontains=search)

            )

        # =====================================================
        # SUMMARY
        # =====================================================

        total_orders = orders_queryset.count()

        total_gmv = items_queryset.aggregate(
            total=Coalesce(
                Sum("total_amount"),
                Value(0),
                output_field=DecimalField()
            )
        )["total"]

        total_settlements = financial_queryset.aggregate(
            total=Coalesce(
                Sum("total_amount"),
                Value(0),
                output_field=DecimalField()
            )
        )["total"]

        settled_amount = financial_queryset.filter(
            total_amount__gt=0
        ).aggregate(
            total=Coalesce(
                Sum("total_amount"),
                Value(0),
                output_field=DecimalField()
            )
        )["total"]

        pending_settlement = total_gmv - settled_amount

        settlement_success_rate = 0

        if total_gmv and total_gmv > 0:

            settlement_success_rate = round(
                (settled_amount / total_gmv) * 100,
                2
            )

        # =====================================================
        # ORDER STATUS BREAKDOWN
        # =====================================================

        order_status_breakdown = list(

            orders_queryset.values(
                "order_status"
            ).annotate(
                count=Count("id")
            ).order_by("-count")

        )

        # =====================================================
        # SETTLEMENT STATUS BREAKDOWN
        # =====================================================

        settled_orders = financial_queryset.filter(
            total_amount__gt=0
        ).values(
            "amazon_order_id"
        ).distinct().count()

        pending_orders = total_orders - settled_orders

        settlement_status_breakdown = [
            {
                "status": "Settled",
                "count": settled_orders
            },
            {
                "status": "Pending",
                "count": pending_orders
            }
        ]

        # =====================================================
        # ORDER TABLE
        # =====================================================

        orders = orders_queryset.annotate(

            sku_count=Count(
                "items",
                distinct=True
            ),

            units_sold=Coalesce(
                Sum("items__quantity_ordered"),
                Value(0)
            ),

            gmv=Coalesce(
                Sum("items__total_amount"),
                Value(0),
                output_field=DecimalField()
            ),

            settled_amount=Coalesce(

                Sum(
                    "items__payout_amount"
                ),

                Value(0),

                output_field=DecimalField()

            )

        ).order_by("-purchase_date")

        order_data = []

        for order in orders:

            pending_amount = order.gmv - order.settled_amount

            # ============================================
            # SETTLEMENT STATUS
            # ============================================

            if order.settled_amount >= order.gmv:

                settlement_status = "Settled"

            elif order.settled_amount > 0:

                settlement_status = "Partially Settled"

            else:

                settlement_status = "Pending"

            order_data.append({

                "marketplace": order.channel,

                "order_id": order.amazon_order_id,

                "order_date": order.purchase_date,

                "order_status": order.order_status,

                "fulfillment_type": order.fulfillment_channel,

                "sku_count": order.sku_count,

                "units_sold": order.units_sold,

                "gmv": order.gmv,

                "settlement_status": settlement_status,

                "expected_settlement": order.gmv,

                "settled_amount": order.settled_amount,

                "pending": pending_amount

            })

        # =====================================================
        # FINAL RESPONSE
        # =====================================================

        return Response({

            "status": True,

            "message": "Dashboard data fetched successfully",

            "data": {

                "summary": {

                    "total_orders": total_orders,

                    "total_gmv": total_gmv,

                    "total_settlements": total_settlements,

                    "pending_settlements": pending_settlement,

                    "settlement_success_rate": settlement_success_rate

                },

                "order_status_breakdown": order_status_breakdown,

                "settlement_status_breakdown": settlement_status_breakdown,

                "orders": order_data

            }

        }, status=status.HTTP_200_OK)
        
                