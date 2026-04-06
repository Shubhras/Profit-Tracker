import time
import csv
from io import StringIO
import os
from datetime import date, timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum

from .services.myntra_client import MyntraClient
from .services.csv_parser import safe_float
from .models import MyntraOrder, MyntraConnection


# ✅ 1️⃣ FULL AUTO SYNC (MAIN API)
class SyncMyntraOrders(APIView):

    def get(self, request):
        return self._sync(request)

    def post(self, request):
        return self._sync(request)

    def _get_param(self, request, *names):
        for name in names:
            value = request.query_params.get(name)
            if value not in (None, ""):
                return value
            data = getattr(request, "data", None)
            if data is not None and hasattr(data, "get"):
                value = data.get(name)
                if value not in (None, ""):
                    return value
        return None

    def _get_report_date_range(self, request):
        from_str = self._get_param(request, "fromDate", "from_date")
        to_str = self._get_param(request, "toDate", "to_date")

        today = date.today()
        default_from = (today - timedelta(days=30)).isoformat()
        default_to = today.isoformat()

        from_str = from_str or default_from
        to_str = to_str or default_to

        try:
            from_date = date.fromisoformat(from_str)
            to_date = date.fromisoformat(to_str)
        except ValueError:
            return None, None, Response(
                {"status": "failed", "error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if from_date > to_date:
            return None, None, Response(
                {"status": "failed", "error": "`fromDate` must be <= `toDate`."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return from_date.isoformat(), to_date.isoformat(), None

    def _sync(self, request):

        connection = None
        if getattr(request, "user", None) is not None and request.user.is_authenticated:
            connection = MyntraConnection.objects.filter(user=request.user).first()

        basic_token = None
        access_token = None
        if connection:
            if connection.merchant_id and connection.secret_key:
                basic_token = MyntraClient.build_basic_token(connection.merchant_id, connection.secret_key)
            access_token = connection.access_token or None

        client = MyntraClient(basic_token=basic_token, access_token=access_token)

        from_date, to_date, error_response = self._get_report_date_range(request)
        if error_response is not None:
            return error_response

        partner_type = self._get_param(request, "partnerType", "partner_type") or (
            connection.partner_type if connection and connection.partner_type else None
        )
        user = request.user if getattr(request, "user", None) is not None and request.user.is_authenticated else None

        # ✅ STEP 1 — Schedule report
        schedule = client.schedule_orders_report(
            from_date=from_date,
            to_date=to_date,
            partner_type=partner_type,
        )

        print("Schedule Response:", schedule)

        # ✅ FIX: validate response properly
        if schedule.get("statusType") != "SUCCESS":
            return Response({
                "status": "failed",
                "error": schedule
            })

        job_id = schedule.get("jobId")

        if not job_id:
            return Response({
                "status": "failed",
                "error": "No jobId received"
            })

        # ✅ STEP 2 — Poll for report completion
        for attempt in range(10):

            print(f"Polling attempt {attempt+1}...")

            report = client.fetch_report(job_id)

            print("Report Response:", report)

            if not report:
                return Response({
                    "status": "failed",
                    "error": "No response from Myntra"
                })

            # ✅ If report ready
            if report.get("status") == "COMPLETED":

                csv_url = report.get("successFile")

                if not csv_url:
                    return Response({
                        "status": "failed",
                        "error": "CSV URL not found"
                    })

                # ✅ STEP 3 — Download CSV
                csv_content = client.download_csv(csv_url)

                if not csv_content:
                    return Response({
                        "status": "failed",
                        "error": "CSV download failed"
                    })

                # ✅ Save CSV locally
                folder = "reports"
                os.makedirs(folder, exist_ok=True)

                file_name = f"{folder}/report_{job_id}.csv"

                with open(file_name, "wb") as f:
                    f.write(csv_content)

                print("CSV saved at:", file_name)

                # ✅ STEP 4 — Parse CSV
                decoded_csv = csv_content.decode("utf-8-sig", errors="replace")
                reader = csv.DictReader(StringIO(decoded_csv))

                orders_saved = 0

                for row in reader:
                    try:
                        order_id = row.get("order line id")
                        sku = row.get("seller sku code")

                        selling_price = safe_float(row.get("final amount"))
                        seller_price = safe_float(row.get("seller price"))
                        logistics_fee = safe_float(row.get("gt charges"))

                        profit = seller_price - logistics_fee

                        MyntraOrder.objects.update_or_create(
                            order_id=order_id,
                            defaults={
                                "user": user,
                                "sku": sku,
                                "selling_price": selling_price,
                                "commission": 0,
                                "logistics_fee": logistics_fee,
                                "profit": profit
                            }
                        )

                        orders_saved += 1

                    except Exception as e:
                        print("Row error:", e)

                return Response({
                    "status": "SUCCESS",
                    "job_id": job_id,
                    "fromDate": from_date,
                    "toDate": to_date,
                    "orders_saved": orders_saved
                })

            # ❌ If report failed
            if report.get("status") == "FAILED":
                return Response({
                    "status": "failed",
                    "error": report
                })

            # ⏳ Wait before next poll
            time.sleep(5)

        # ⏳ Still processing
        return Response({
            "status": "processing",
            "job_id": job_id,
            "fromDate": from_date,
            "toDate": to_date,
        })


# ✅ 2️⃣ UPLOAD CSV API (USER PROVIDED DATA)
class UploadMyntraOrders(APIView):

    def post(self, request):

        uploaded_file = request.FILES.get("file") or request.FILES.get("csv")
        if not uploaded_file:
            return Response(
                {"status": "failed", "error": "CSV file is required (field name: `file`)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            csv_bytes = uploaded_file.read()
        except Exception as e:
            return Response(
                {"status": "failed", "error": f"Failed to read uploaded file: {e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not csv_bytes:
            return Response(
                {"status": "failed", "error": "Uploaded file is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        decoded_csv = csv_bytes.decode("utf-8-sig", errors="replace")
        reader = csv.DictReader(StringIO(decoded_csv))

        if not reader.fieldnames:
            return Response(
                {"status": "failed", "error": "CSV header row not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user if getattr(request, "user", None) is not None and request.user.is_authenticated else None
        orders_saved = 0
        rows_skipped = 0
        errors = []

        for row_index, row in enumerate(reader, start=2):  # 1 = header
            try:
                order_id = (row.get("order line id") or row.get("order_id") or "").strip()
                if not order_id:
                    rows_skipped += 1
                    continue

                sku = (row.get("seller sku code") or row.get("sku") or "").strip()

                selling_price = safe_float(row.get("final amount") or row.get("selling_price"))
                seller_price = safe_float(row.get("seller price") or row.get("seller_price"))
                logistics_fee = safe_float(row.get("gt charges") or row.get("logistics_fee"))

                profit = seller_price - logistics_fee

                MyntraOrder.objects.update_or_create(
                    order_id=order_id,
                    defaults={
                        "user": user,
                        "sku": sku,
                        "selling_price": selling_price,
                        "commission": 0,
                        "logistics_fee": logistics_fee,
                        "profit": profit,
                    },
                )

                orders_saved += 1

            except Exception as e:
                rows_skipped += 1
                if len(errors) < 20:
                    errors.append({"row": row_index, "error": str(e)})

        return Response(
            {
                "status": "SUCCESS",
                "orders_saved": orders_saved,
                "rows_skipped": rows_skipped,
                "errors": errors,
            }
        )


# ✅ 3️⃣ CONNECTION API (USER SETTINGS)
class MyntraConnectionView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        connection = MyntraConnection.objects.filter(user=request.user).first()
        if not connection:
            return Response({"connected": False})

        return Response(
            {
                "connected": True,
                "merchant_id": connection.merchant_id,
                "partner_type": connection.partner_type,
                "warehouse_code": connection.warehouse_code,
                "has_secret_key": bool(connection.secret_key),
                "has_access_token": bool(connection.access_token),
                "updated_at": connection.updated_at,
            }
        )

    def post(self, request):
        return self._upsert(request)

    def put(self, request):
        return self._upsert(request)

    def delete(self, request):
        MyntraConnection.objects.filter(user=request.user).delete()
        return Response({"status": "SUCCESS", "connected": False})

    def _upsert(self, request):
        allowed_fields = {
            "merchant_id",
            "secret_key",
            "partner_type",
            "warehouse_code",
            "access_token",
        }

        updates = {}
        for field in allowed_fields:
            if field in request.data:
                value = request.data.get(field)
                updates[field] = value if value not in ("", None) else None

        if not updates:
            return Response(
                {"status": "failed", "error": "No fields provided to update."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        connection, created = MyntraConnection.objects.update_or_create(
            user=request.user,
            defaults=updates,
        )

        return Response({"status": "SUCCESS", "created": created})


# ✅ 4️⃣ ORDERS LIST API
class MyntraOrdersList(APIView):

    def get(self, request):

        qs = MyntraOrder.objects.all()
        if getattr(request, "user", None) is not None and request.user.is_authenticated:
            qs = qs.filter(user=request.user)

        orders = qs.values()

        return Response({
            "count": qs.count(),
            "data": list(orders)
        })


# ✅ 5️⃣ DASHBOARD API
class MyntraDashboard(APIView):

    def get(self, request):

        qs = MyntraOrder.objects.all()
        if getattr(request, "user", None) is not None and request.user.is_authenticated:
            qs = qs.filter(user=request.user)

        total_orders = qs.count()

        total_revenue = qs.aggregate(
            Sum("selling_price")
        )["selling_price__sum"] or 0

        total_profit = qs.aggregate(
            Sum("profit")
        )["profit__sum"] or 0

        return Response({
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "total_profit": total_profit
        })
