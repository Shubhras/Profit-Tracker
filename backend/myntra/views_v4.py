import logging
from datetime import datetime, timedelta
from django.db import transaction
from django.utils import timezone
import pytz

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import MyntraConnection, MyntraOrderNew, MyntraOrderItemNew, MyntraReturnItemNew, MyntraPaymentNew
from .services.myntra_client_v4 import MyntraClientV4

logger = logging.getLogger(__name__)


def parse_dt(dt_str):
    if not dt_str:
        return None
    # Strip whitespace/quotes
    dt_str = str(dt_str).strip().strip('"').strip("'")
    for fmt in ("%d-%m-%Y %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(dt_str, fmt)
            return timezone.make_aware(dt, pytz.UTC)
        except Exception:
            pass
    return None


def parse_date(date_str):
    if not date_str:
        return None
    date_str = str(date_str).strip().strip('"').strip("'")
    for fmt in ("%Y-%m-%d", "%d-%m-%Y"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except Exception:
            pass
    return None


class SyncMyntraDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 1. Retrieve the connection
        connection = MyntraConnection.objects.filter(user=request.user).first()
        if not connection:
            return Response(
                {"status": "ERROR", "message": "Myntra connection not configured for this user."},
                status=400
            )

        # 2. Get date range from request (default last 30 days)
        from_date_str = request.data.get("fromDate")
        to_date_str = request.data.get("toDate")

        today = datetime.now()
        thirty_days_ago = today - timedelta(days=30)

        # We need YYYY-MM-DD for order search and payment history
        if from_date_str:
            # Let's ensure format is YYYY-MM-DD
            from_date = parse_date(from_date_str)
        else:
            from_date = thirty_days_ago.date()

        if to_date_str:
            to_date = parse_date(to_date_str)
        else:
            to_date = today.date()

        # Format dates for different APIs
        from_str_ymd = from_date.strftime("%Y-%m-%d")
        to_str_ymd = to_date.strftime("%Y-%m-%d")

        # Returns API returnRecon uses DD-MM-YYYY format
        from_str_dmy = from_date.strftime("%d-%m-%Y")
        to_str_dmy = to_date.strftime("%d-%m-%Y")

        # Initialize the client
        # Use access_token if present, else basic token.
        basic_token = None
        if connection.merchant_id and connection.secret_key:
            basic_token = MyntraClientV4.build_basic_token(connection.merchant_id, connection.secret_key)

        client = MyntraClientV4(
            basic_token=basic_token,
            access_token=connection.access_token
        )

        orders_synced = 0
        returns_synced = 0
        payments_synced = 0

        # ==========================================
        # 1. Sync Orders
        # ==========================================
        order_list_res = client.get_order_list(start_date=from_str_ymd, end_date=to_str_ymd)
        if isinstance(order_list_res, dict) and "error" not in order_list_res:
            # Extract orders list
            orders_data = []
            if "data" in order_list_res:
                orders_data = order_list_res["data"]
            elif "orders" in order_list_res:
                orders_data = order_list_res["orders"]
            elif isinstance(order_list_res, list):
                orders_data = order_list_res

            # In case getOrderList itself returns order details or just a list of summaries
            for order_summary in orders_data:
                seller_order_id = None
                if isinstance(order_summary, dict):
                    seller_order_id = order_summary.get("sellerOrderId") or order_summary.get("id")
                elif isinstance(order_summary, str):
                    seller_order_id = order_summary

                if not seller_order_id:
                    continue

                # Fetch detailed order by ID
                order_detail = client.get_order_by_id(seller_order_id)
                if isinstance(order_detail, dict) and "error" not in order_detail:
                    # Save to db
                    try:
                        with transaction.atomic():
                            myntra_order, created = MyntraOrderNew.objects.update_or_create(
                                seller_order_id=seller_order_id,
                                defaults={
                                    "user": request.user,
                                    "myntra_connection": connection,
                                    "uidx": order_detail.get("uidx"),
                                    "receiver_name": order_detail.get("receiverName"),
                                    "receiver_email": order_detail.get("receiverEmail"),
                                    "mobile": order_detail.get("mobile"),
                                    "address": order_detail.get("address"),
                                    "city": order_detail.get("city"),
                                    "state": order_detail.get("state"),
                                    "zipcode": order_detail.get("zipcode"),
                                    "country": order_detail.get("country"),
                                    "warehouse": order_detail.get("warehouse"),
                                    "courier_code": order_detail.get("courierCode"),
                                    "on_hold": bool(order_detail.get("onHold", False)),
                                }
                            )

                            # Save items
                            line_entries = order_detail.get("orderLineEntries") or []
                            for item_data in line_entries:
                                order_line_id = item_data.get("orderLineId")
                                if not order_line_id:
                                    continue
                                MyntraOrderItemNew.objects.update_or_create(
                                    order=myntra_order,
                                    order_line_id=order_line_id,
                                    defaults={
                                        "sku": item_data.get("sku"),
                                        "mrp": item_data.get("mrp") or 0.00,
                                        "line_final_amount": item_data.get("lineFinalAmount") or 0.00,
                                        "status_code": item_data.get("status_code"),
                                        "pack_by_time": parse_dt(item_data.get("packByTime")),
                                        "accept_by_time": parse_dt(item_data.get("acceptByTime")),
                                        "customer_promise_time": parse_dt(item_data.get("customerPromiseTime")),
                                        "ship_by_time": parse_dt(item_data.get("shipByTime")),
                                        "unit_other_charges_without_tax": item_data.get("unitOtherChargesWithoutTax") or 0.00,
                                    }
                                )
                            orders_synced += 1
                    except Exception as e:
                        logger.error(f"Failed to save Myntra order {seller_order_id}: {e}")

        # ==========================================
        # 2. Sync Returns
        # ==========================================
        # Dest warehouse ids can be config or passed, default to connection warehouse code if present
        warehouse_ids = [connection.warehouse_code] if connection.warehouse_code else None
        returns_res = client.get_returns_list(
            start_date=from_str_dmy,
            end_date=to_str_dmy,
            destination_warehouse_ids=warehouse_ids
        )
        if isinstance(returns_res, dict) and "error" not in returns_res:
            returns_data = []
            if "data" in returns_res:
                returns_data = returns_res["data"]
            elif isinstance(returns_res, list):
                returns_data = returns_res

            for ret_summary in returns_data:
                ret_id = None
                if isinstance(ret_summary, dict):
                    ret_id = ret_summary.get("id")
                elif isinstance(ret_summary, str):
                    ret_id = ret_summary

                if not ret_id:
                    continue

                # Fetch return details
                # The search endpoint can be called with a single ID in body to get details
                try:
                    ret_detail_res = client.get_return_details(ret_id)
                    if isinstance(ret_detail_res, dict) and "error" not in ret_detail_res:
                        detail_data = ret_detail_res.get("data") or []
                        if detail_data:
                            item_data = detail_data[0]
                            MyntraReturnItemNew.objects.update_or_create(
                                return_id=ret_id,
                                defaults={
                                    "user": request.user,
                                    "myntra_connection": connection,
                                    "order_id": item_data.get("orderId"),
                                    "order_line_id": item_data.get("orderLineId"),
                                    "sku": item_data.get("sku") or ret_summary.get("sku") or "",
                                    "quantity": item_data.get("quantity") or 1,
                                    "status": item_data.get("status") or ret_summary.get("status"),
                                    "return_type": item_data.get("type") or ret_summary.get("type"),
                                    "tracking_number": item_data.get("trackingNumber"),
                                    "return_warehouse_code": item_data.get("returnWarehouseCode"),
                                    "created_on": parse_dt(item_data.get("createdOn") or ret_summary.get("createdOn")),
                                    "delivered_time": parse_dt(item_data.get("deliveredTime")),
                                    "confirmed_time": parse_dt(item_data.get("confirmedTime")),
                                    "ready_for_pickup_time": parse_dt(item_data.get("readyForPickupTime")),
                                    "reason": item_data.get("reason"),
                                    "reason_id": item_data.get("reasonId"),
                                }
                            )
                            returns_synced += 1
                except Exception as e:
                    logger.error(f"Failed to fetch detail or save Myntra return {ret_id}: {e}")


        # ==========================================
        # 3. Sync Payments / Settlements
        # ==========================================
        for method in ("prepaid", "postpaid"):
            payments_res = client.get_payment_history(
                payment_method=method,
                from_date=from_str_ymd,
                to_date=to_str_ymd
            )
            if isinstance(payments_res, dict) and "error" not in payments_res:
                pay_data = []
                data_val = payments_res.get("data")
                if isinstance(data_val, dict):
                    pay_data = data_val.get("payments") or []
                elif isinstance(data_val, list):
                    pay_data = data_val
                elif isinstance(payments_res, list):
                    pay_data = payments_res

                for pay_item in pay_data:
                    utr = pay_item.get("utrNumber")
                    if not utr:
                        continue
                    try:
                        MyntraPaymentNew.objects.update_or_create(
                            utr_number=utr,
                            defaults={
                                "user": request.user,
                                "myntra_connection": connection,
                                "payment_method": pay_item.get("paymentMethod") or method,
                                "payment_date": parse_date(pay_item.get("paymentDate")),
                                "year_month": int(pay_item.get("yearMonth") or 0),
                                "amount": pay_item.get("amount") or 0.00,
                                "utr_details_link": pay_item.get("utrDetailsLink"),
                                "advice_id": pay_item.get("adviceId"),
                            }
                        )
                        payments_synced += 1
                    except Exception as e:
                        logger.error(f"Failed to save Myntra payment {utr}: {e}")

        return Response({
            "status": "SUCCESS",
            "message": "Sync completed successfully.",
            "details": {
                "orders_synced": orders_synced,
                "returns_synced": returns_synced,
                "payments_synced": payments_synced
            }
        })
