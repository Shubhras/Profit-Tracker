# views.py

from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Sum, Q
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Order


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
        
        