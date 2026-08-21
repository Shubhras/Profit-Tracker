from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from blinkit.services.excel_import.listing_importer import import_listing_report
from blinkit.services.excel_import.storage_importer import import_storage_report
from blinkit.services.excel_import.zip_importer import import_blinkit_zip

from .models import BlinkitAccount, BlinkitImportBatch
from .services.excel_import.detector import detect_blinkit_report
from .services.excel_import.order_importer import import_order_report


class BlinkitConnectAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get("name")
        blinkit_user_id = request.data.get("blinkit_user_id")

        if not name:
            return Response(
                {
                    "status": False,
                    "message": "Blinkit account name is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not blinkit_user_id:
            return Response(
                {
                    "status": False,
                    "message": "Blinkit user ID is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        account = BlinkitAccount.objects.create(
            user=request.user,
            name=name,
            blinkit_user_id=blinkit_user_id,
        )

        return Response(
            {
                "status": True,
                "message": "Blinkit account connected successfully.",
                "data": {
                    "id": account.id,
                    "name": account.name,
                    "blinkit_user_id": account.blinkit_user_id,
                    "is_active": account.is_active,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class BlinkitUploadReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        # -------------------------------------------------------------
        # Get uploaded file
        # -------------------------------------------------------------

        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {
                    "status": False,
                    "message": "File is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------------------
        # Get active Blinkit account
        # -------------------------------------------------------------

        account = BlinkitAccount.objects.filter(
            user=request.user,
            is_active=True,
        ).first()

        if not account:
            return Response(
                {
                    "status": False,
                    "message": ("Blinkit account is not connected."),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        file_name = uploaded_file.name.lower()

        # =============================================================
        # ZIP UPLOAD
        # =============================================================

        if file_name.endswith(".zip"):
            uploaded_file.seek(0)

            try:
                result = import_blinkit_zip(
                    file=uploaded_file,
                    account=account,
                )

            except Exception as exc:
                return Response(
                    {
                        "status": False,
                        "message": ("Blinkit ZIP import failed."),
                        "error": str(exc),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(
                {
                    "status": True,
                    "message": ("Blinkit ZIP imported successfully."),
                    "data": result,
                },
                status=status.HTTP_201_CREATED,
            )

        # =============================================================
        # EXCEL UPLOAD
        # =============================================================

        if not file_name.endswith((".xlsx", ".xlsm")):
            return Response(
                {
                    "status": False,
                    "message": ("Please upload a valid Excel or ZIP file."),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------------------
        # Detect report type
        # -------------------------------------------------------------

        uploaded_file.seek(0)

        try:
            report_type = detect_blinkit_report(uploaded_file)

        except Exception as exc:
            return Response(
                {
                    "status": False,
                    "message": ("Unable to read the Excel file."),
                    "error": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------------------
        # Unsupported report
        # -------------------------------------------------------------

        if not report_type:
            return Response(
                {
                    "status": False,
                    "message": ("Unsupported Blinkit report."),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------------------
        # Reset file pointer
        # -------------------------------------------------------------

        uploaded_file.seek(0)

        # -------------------------------------------------------------
        # Create ImportBatch
        # -------------------------------------------------------------

        import_batch = BlinkitImportBatch.objects.create(
            account=account,
            file_name=uploaded_file.name,
            report_type=report_type,
        )

        # -------------------------------------------------------------
        # Import report
        # -------------------------------------------------------------

        try:
            if report_type == "ORDER_FINANCIAL":
                result = import_order_report(
                    file=uploaded_file,
                    account=account,
                    import_batch=import_batch,
                )

            elif report_type == "LISTING":
                result = import_listing_report(
                    file=uploaded_file,
                    account=account,
                    import_batch=import_batch,
                )

            elif report_type == "STORAGE":
                result = import_storage_report(
                    file=uploaded_file,
                    account=account,
                    import_batch=import_batch,
                )

            else:
                return Response(
                    {
                        "status": False,
                        "message": (
                            f"Importer for report type "
                            f"'{report_type}' "
                            f"is not implemented yet."
                        ),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as exc:
            # Because the view is wrapped in
            # transaction.atomic(), the ImportBatch and
            # any database changes made by the importer
            # are rolled back.

            return Response(
                {
                    "status": False,
                    "message": ("Blinkit report import failed."),
                    "error": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------------------
        # Success response
        # -------------------------------------------------------------

        return Response(
            {
                "status": True,
                "message": ("Blinkit report imported successfully."),
                "data": {
                    "import_id": import_batch.id,
                    "file_name": import_batch.file_name,
                    "report_type": import_batch.report_type,
                    "payout_period_start": (import_batch.payout_period_start),
                    "payout_period_end": (import_batch.payout_period_end),
                    "result": result,
                },
            },
            status=status.HTTP_201_CREATED,
        )


from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services.profit.order_summary import BlinkitOrderSummary


class BlinkitProfitDebugAPIView(APIView):
    """
    Temporary debug endpoint.

    Returns the raw Blinkit OrderSummary output before
    any adapter / DTO transformation.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):

        filters = {
            "fromDate": request.query_params.get("start_date"),
            "toDate": request.query_params.get("end_date"),
        }

        try:
            summary = BlinkitOrderSummary(
                user=request.user,
                filters=filters,
            )

            result = summary.build()

            return Response(
                {
                    "status": True,
                    "message": ("Blinkit order profitability debug data."),
                    "data": result,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as exc:
            return Response(
                {
                    "status": False,
                    "message": ("Unable to calculate Blinkit order profitability."),
                    "error": str(exc),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
