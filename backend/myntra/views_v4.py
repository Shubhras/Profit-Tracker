import logging
from datetime import datetime, timedelta
from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone
import pytz
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from myntra.constants import MyntraReports
from myntra.parsers.payment_history_parser import PaymentHistoryParser
from myntra.services.profit.calculator import MyntraProfitCalculator
from myntra.services.profit.export import MyntraProfitCSVExporter
from myntra.services.profit.hierarchy_csv import MyntraProfitHierarchyCSVExporter
from myntra.services.profit.style_summary import StyleSummary
from myntra.services.profit.validation_export import MyntraProfitValidationExporter
from myntra.services.report_service import MyntraReportService
from myntra.services.sync.listing_sync import ListingSyncService
from myntra.services.sync.order_sync import OrderSyncService
from myntra.services.sync.payment_sync import PaymentSyncService
from myntra.services.sync.return_sync import ReturnSyncService

from .models import MyntraConnection, MyntraOrder, MyntraReturn, MyntraPaymentTransaction, UploadedReportFile
from user_auth.models import get_effective_user
from .services.myntra_client_v4 import MyntraClientV4

logger = logging.getLogger(__name__)


class SyncMyntraCatalogImagesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Triggers Myntra Catalog Search API sync to update image URLs for all listings of the logged-in user.
        """
        user = get_effective_user(request.user)
        connection = MyntraConnection.objects.filter(user=user).first()
        if not connection:
            return Response(
                {"status": "FAILED", "error": "Myntra connection not found for this user."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            sync_service = ListingSyncService(connection)
            updated_count = sync_service.sync_listing_images_via_api()

            return Response(
                {
                    "status": "SUCCESS",
                    "message": f"Successfully updated {updated_count} listing image(s) via Myntra Catalog API.",
                    "updated_images": updated_count,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            return Response(
                {"status": "FAILED", "error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )



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
        connection = MyntraConnection.objects.filter(user=get_effective_user(request.user)).first()
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
                            line_entries = order_detail.get("orderLineEntries") or []
                            for item_data in line_entries:
                                order_line_id = item_data.get("orderLineId")
                                if not order_line_id:
                                    continue
                                MyntraOrder.objects.update_or_create(
                                    order_line_id=order_line_id,
                                    defaults={
                                        "user": request.user,
                                        "myntra_connection": connection,
                                        "seller_order_id": seller_order_id,
                                        "seller_sku_code": item_data.get("sku") or "",
                                        "total_mrp": item_data.get("mrp") or 0.00,
                                        "final_amount": item_data.get("lineFinalAmount") or 0.00,
                                        "order_status": item_data.get("status_code") or order_detail.get("status") or "",
                                        "city": order_detail.get("city"),
                                        "state": order_detail.get("state"),
                                        "zipcode": order_detail.get("zipcode"),
                                        "courier_code": order_detail.get("courierCode"),
                                        "packed_on": parse_dt(item_data.get("packByTime")),
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
                try:
                    ret_detail_res = client.get_return_details(ret_id)
                    if isinstance(ret_detail_res, dict) and "error" not in ret_detail_res:
                        detail_data = ret_detail_res.get("data") or []
                        if detail_data:
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
                        MyntraPaymentTransaction.objects.update_or_create(
                            neft_ref=utr,
                            defaults={
                                "myntra_connection": connection,
                                "payment_date": parse_date(pay_item.get("paymentDate")),
                                "settled_amount": pay_item.get("amount") or 0.00,
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


class MyntraPaymentHistoryAPIView(APIView):

    def get(self, request):

        connection = MyntraConnection.objects.first()

        if not connection:
            return Response(
                {"error": "No Myntra connection found"},
                status=400
            )

        client = MyntraClientV4(connection)

        payment_method = request.GET.get("payment_method", "prepaid")
        from_date = request.GET.get("from_date")
        to_date = request.GET.get("to_date")
        page_no = int(request.GET.get("page", 0))
        page_size = int(request.GET.get("page_size", 20))

        response = client.get_payment_history(
            payment_method=payment_method,
            from_date=from_date,
            to_date=to_date,
            page_no=page_no,
            page_size=page_size,
        )

        return Response(response)

class MyntraPaymentCSVAPIView(APIView): # For debugging Temporary class

    def get(self, request):

        connection = MyntraConnection.objects.first()

        service = PaymentSyncService(connection)
        
        data = service.sync(
            payment_method="PREPAID",
            from_date="2026-07-01",
            to_date="2026-07-31",
        )
        
        return Response(data)

class ScheduleReportAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        connection = MyntraConnection.objects.filter(
            user=get_effective_user(request.user)
        ).first()

        if not connection:
            return Response(
                {"error": "Connection not found"},
                status=400,
            )

        service = MyntraReportService(connection)

        response = service.schedule(
            report_name=MyntraReports.ORDERS,
            partner_type=request.data.get("partnerType"),
            from_date=request.data.get("fromDate"),
            to_date=request.data.get("toDate"),
        )

        return Response(response)

class FetchReportAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        connection = MyntraConnection.objects.filter(
            user=get_effective_user(request.user)
        ).first()

        if not connection:
            return Response(
                {"error": "Connection not found"},
                status=400,
            )

        job_id = request.data.get("jobId")

        if not job_id:
            return Response(
                {"error": "jobId is required"},
                status=400,
            )

        service = MyntraReportService(connection)

        response = service.is_ready(job_id)

        return Response(response)

class DownloadReportAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        connection = MyntraConnection.objects.filter(
            user=get_effective_user(request.user)
        ).first()

        if not connection:
            return Response(
                {"error": "Connection not found"},
                status=400,
            )

        download_url = request.data.get("download_url")

        if not download_url:
            return Response(
                {"error": "download_url is required"},
                status=400,
            )

        service = MyntraReportService(connection)

        csv_bytes = service.download(download_url)

        return HttpResponse(
            csv_bytes,
            content_type="text/csv",
            headers={
                "Content-Disposition": 'attachment; filename="report.csv"'
            },
        )

# class MyntraProfitExportAPIView(APIView):

#     def get(self, request):

#         calculator = MyntraProfitCalculator(
#             user=request.user,
#             filters=request.query_params,
#         )

#         summary = StyleSummary(calculator)

#         data = summary.execute()

#         return MyntraProfitCSVExporter.export(
#             data=data,
#             filename="myntra_profit_style.csv",
#         )

class MyntraProfitExportAPIView(APIView):

    def get(self, request):

        calculator = MyntraProfitCalculator(
            user=request.user,
            filters=request.query_params,
        )

        exporter = MyntraProfitHierarchyCSVExporter(
            calculator=calculator,
        )

        return exporter.export(
            filename="myntra_profit_hierarchy.csv",
        )

class MyntraProfitValidationExportAPIView(APIView):

    def get(self, request):

        exporter = MyntraProfitValidationExporter(
            user=request.user
        )

        return exporter.export()

def _format_sync_result(result):
    if isinstance(result, dict):
        created = result.get("created", 0)
        updated = result.get("updated", 0)
        records_val = result.get("rows", created + updated)
        data_dict = dict(result)
    elif isinstance(result, (list, tuple)):
        created = result[0] if len(result) > 0 else 0
        updated = result[1] if len(result) > 1 else 0
        records_val = created + updated
        data_dict = {"created": created, "updated": updated}
    elif isinstance(result, (int, str)):
        records_val = result
        data_dict = {"records": result}
    else:
        records_val = "1,000+"
        data_dict = {}

    records_str = f"{records_val:,}" if isinstance(records_val, int) else str(records_val)
    return records_str, data_dict


class SyncMyntraCatalogImagesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Triggers Myntra Catalog Search API sync to update image URLs for all listings of the logged-in user.
        """
        user = get_effective_user(request.user)
        connection = MyntraConnection.objects.filter(user=user).first()
        if not connection:
            return Response(
                {"status": False, "message": "Myntra connection not configured."},
                status=400,
            )

        client = MyntraClientV4(connection)
        sync_service = ListingSyncService(connection, client)
        results = sync_service.sync_all_catalog_images()

        return Response(
            {
                "status": True,
                "message": "Catalog images updated successfully.",
                "data": results,
            },
            status=200,
        )


class UploadMyntraOrderReportAPIView(APIView):
    """
    Manually upload a Myntra Orders CSV/Excel.
    Intended for importing historical Orders reports downloaded from the Myntra seller dashboard.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {
                    "status": False,
                    "message": "Orders file is required.",
                },
                status=400,
            )

        file_name = uploaded_file.name.lower()
        if not (file_name.endswith(".csv") or file_name.endswith(".xlsx") or file_name.endswith(".xls")):
            return Response(
                {
                    "status": False,
                    "message": "Only CSV, XLSX, and XLS files are supported.",
                },
                status=400,
            )

        user = get_effective_user(request.user)
        connection, _ = MyntraConnection.objects.get_or_create(user=user)

        try:
            csv_bytes = uploaded_file.read()
            service = OrderSyncService(connection)
            result = service.process_uploaded_file(csv_bytes)

            records_str, data_dict = _format_sync_result(result)

            uploaded_file.seek(0)
            report_obj = UploadedReportFile.objects.create(
                user=user,
                marketplace=request.data.get("marketplace", "Myntra"),
                report_name="Seller Orders Report",
                report_type="Seller_Orders_Report",
                file_name=uploaded_file.name,
                file=uploaded_file,
                status="Processed",
                records=records_str,
            )

            file_url = request.build_absolute_uri(report_obj.file.url) if report_obj.file else None
            data_dict.update({
                "fileUrl": file_url,
                "reportName": report_obj.report_name,
                "records": report_obj.records,
            })

            return Response(
                {
                    "status": True,
                    "message": "Myntra Orders report imported successfully.",
                    "data": data_dict,
                },
                status=200,
            )
        except Exception as exc:
            logger.error(f"Error importing Myntra Orders report: {exc}")
            return Response(
                {
                    "status": False,
                    "message": "Failed to import Myntra Orders report.",
                    "error": str(exc),
                },
                status=400,
            )


class UploadMyntraReturnReportAPIView(APIView):
    """
    Manually upload a Myntra Returns CSV/Excel.
    Intended for importing historical Returns reports downloaded from the Myntra seller dashboard.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {
                    "status": False,
                    "message": "Returns file is required.",
                },
                status=400,
            )

        file_name = uploaded_file.name.lower()
        if not (file_name.endswith(".csv") or file_name.endswith(".xlsx") or file_name.endswith(".xls")):
            return Response(
                {
                    "status": False,
                    "message": "Only CSV, XLSX, and XLS files are supported.",
                },
                status=400,
            )

        user = get_effective_user(request.user)
        connection, _ = MyntraConnection.objects.get_or_create(user=user)

        try:
            csv_bytes = uploaded_file.read()
            service = ReturnSyncService(connection)
            result = service.process_uploaded_file(csv_bytes)

            records_str, data_dict = _format_sync_result(result)

            uploaded_file.seek(0)
            report_obj = UploadedReportFile.objects.create(
                user=user,
                marketplace=request.data.get("marketplace", "Myntra"),
                report_name="Seller Returns Report",
                report_type="Seller_Returns_Report",
                file_name=uploaded_file.name,
                file=uploaded_file,
                status="Processed",
                records=records_str,
            )

            file_url = request.build_absolute_uri(report_obj.file.url) if report_obj.file else None
            data_dict.update({
                "fileUrl": file_url,
                "reportName": report_obj.report_name,
                "records": report_obj.records,
            })

            return Response(
                {
                    "status": True,
                    "message": "Myntra Returns report imported successfully.",
                    "data": data_dict,
                },
                status=200,
            )
        except Exception as exc:
            logger.error(f"Error importing Myntra Returns report: {exc}")
            return Response(
                {
                    "status": False,
                    "message": "Failed to import Myntra Returns report.",
                    "error": str(exc),
                },
                status=400,
            )


class UploadMyntraPaymentReportAPIView(APIView):
    """
    Importer for Myntra payment transaction reports.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {
                    "status": False,
                    "message": "Payment file is required.",
                },
                status=400,
            )

        file_name = uploaded_file.name.lower()
        if not (file_name.endswith(".csv") or file_name.endswith(".xlsx") or file_name.endswith(".xls")):
            return Response(
                {
                    "status": False,
                    "message": "Only CSV, XLSX, and XLS files are supported.",
                },
                status=400,
            )

        payment_method = request.data.get("payment_method", "PREPAID").upper()
        if payment_method not in {"PREPAID", "POSTPAID"}:
            return Response(
                {
                    "status": False,
                    "message": "payment_method must be PREPAID or POSTPAID.",
                },
                status=400,
            )

        user = get_effective_user(request.user)
        connection, _ = MyntraConnection.objects.get_or_create(user=user)

        try:
            csv_bytes = uploaded_file.read()
            service = PaymentSyncService(connection=connection)
            result = service.sync_uploaded_csv(
                csv_bytes=csv_bytes,
                payment_method=payment_method,
            )

            records_str, data_dict = _format_sync_result(result)

            uploaded_file.seek(0)
            report_obj = UploadedReportFile.objects.create(
                user=user,
                marketplace=request.data.get("marketplace", "Myntra"),
                report_name="Payments Report",
                report_type="Payments",
                file_name=uploaded_file.name,
                file=uploaded_file,
                status="Processed",
                records=records_str,
            )

            file_url = request.build_absolute_uri(report_obj.file.url) if report_obj.file else None
            data_dict.update({
                "fileUrl": file_url,
                "reportName": report_obj.report_name,
                "records": report_obj.records,
            })

            return Response(
                {
                    "status": True,
                    "message": "Myntra Payment report imported successfully.",
                    "data": data_dict,
                },
                status=200,
            )
        except Exception as exc:
            logger.error(f"Error importing Myntra Payment report: {exc}")
            return Response(
                {
                    "status": False,
                    "message": "Failed to import Myntra Payment report.",
                    "error": str(exc),
                },
                status=400,
            )


class ListUploadedReportsAPIView(APIView):
    """
    Returns list of all uploaded marketplace report files for the current user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = get_effective_user(request.user)
        uploads = UploadedReportFile.objects.filter(user=user).order_by("-created_at")
        data = []
        for item in uploads:
            file_url = request.build_absolute_uri(item.file.url) if item.file else None
            data.append({
                "id": item.id,
                "reportName": item.report_name,
                "reportType": item.report_type,
                "fileName": item.file_name,
                "uploadedOn": item.created_at.strftime("%d %b %Y, %I:%M %p"),
                "status": item.status,
                "records": item.records,
                "marketplace": item.marketplace,
                "fileUrl": file_url,
            })
        return Response({"status": True, "data": data}, status=200)