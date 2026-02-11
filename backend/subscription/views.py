import hmac
import hashlib
from django.conf import settings
from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from subscription.models import UserSubscription
from subscription.utils.razorpay_client import client
from django.conf import settings
import hmac
import hashlib
from rest_framework.permissions import IsAuthenticated
from subscription.utils.custom_response import success_response, error_response
from subscription.utils.razorpay_client import client
from rest_framework.permissions import AllowAny
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class CreateSubscriptionAPIView(APIView): 
    permission_classes = [IsAuthenticated]
    @swagger_auto_schema(tags=["Subscription"])
    def post(self, request):
        user = request.user
        plan_id = request.data.get("plan_id")

        if not plan_id:
            return error_response("plan_id is required", 400)

        # ==========================
        # ✅ FREE PLAN (NO RAZORPAY)
        # ==========================
        if plan_id == "FREE":
            # deactivate previous subscriptions
            UserSubscription.objects.filter(user=user).update(status="inactive")

            UserSubscription.objects.create(
                user=user,
                plan_name="Free",
                is_paid=False,
                status="active"
            )

            return success_response(
                message="Free plan activated successfully",
                data={
                    "plan_id": "FREE",
                    "plan_name": "Free",
                    "active": True,
                    "payment_required": False
                },
                statusCode=200
            )

        # ==========================
        # ✅ PAID PLAN (RAZORPAY)
        # ==========================
        try:
            # deactivate previous subscriptions
            UserSubscription.objects.filter(user=user).update(status="inactive")

            sub_data = {
                "plan_id": plan_id,
                "customer_notify": 1,
                "total_count": 12
            }

            subscription = client.subscription.create(sub_data)

            UserSubscription.objects.create(
                user=user,
                razorpay_plan_id=plan_id,
                razorpay_subscription_id=subscription["id"],
                status=subscription["status"],
                is_paid=True
            )

            return success_response(
                message="Subscription created successfully",
                data={
                    "subscription_id": subscription["id"],
                    "subscription_status": subscription["status"],
                    "razorpay_key": settings.RAZORPAY_KEY_ID
                },
                statusCode=201
            )

        except Exception as e:
            return error_response(str(e), 500)

class SubscriptionPlansAPIView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(tags=["Subscription"])
    def get(self, request):
        plans = [

            
            {
                "plan_id": "FREE",
                "name": "Free",
                "price": 0,
                "billing_cycle": "lifetime",
                "sync_frequency": "Weekly",
                "order_volume": 100,
                "integrations": 1,
                "features": [
                    "Basic Dashboard",
                    "Weekly Sync",
                    "Limited Analytics"
                ],
                "is_paid": False
            },
            {
                "plan_id": "plan_SCovUd5sTXe1jt",  
                "name": "Basic Plan",
                "price": 1099,
                "billing_cycle": "yearly",
                "sync_frequency": "Weekly",
                "order_volume": 5000,
                "integrations": 3,
                "features": [
                    "Profit Analytics",
                    "Payments Tracking",
                    "Weekly Sync"
                ],
                "is_paid": True
            },

            {
                "plan_id": "plan_SCou9G4wA7cheq",  # Razorpay plan id
                "name": "Business Plan",
                "price": 2099,
                "billing_cycle": "yearly",
                "sync_frequency": "Weekly",
                "order_volume": 15000,
                "integrations": 5,
                "features": [
                    "Advanced Profit Analytics",
                    "Payments & Settlements",
                    "Inventory Insights"
                ],
                "is_paid": True
            },

            {
                "plan_id": "plan_SCp5cV6I8ovNfw",  # Razorpay plan id
                "name": "Enterprise Plan",
                "price": 5999,
                "billing_cycle": "custom",
                "sync_frequency": "Daily",
                "order_volume": "Unlimited",
                "integrations": "All",
                "features": [
                    "All Features",
                    "Daily Sync",
                    "Dedicated Support",
                    "Custom Integrations"
                ],
                "is_paid": False,
                "contact_sales": True
            }
        ]

        return success_response(
            message="Subscription plans fetched successfully",
            data={"plans": plans},
            statusCode=200
        )

class MySubscriptionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(tags=["Subscription"])
    def get(self, request):
        sub = UserSubscription.objects.filter(user=request.user).order_by("-created_at").first()

        if not sub:
            return success_response(
                message="No subscription found",
                data={
                    "active": False,
                    "status": "no_subscription",
                    "plan_name": None,
                    "price": 0,
                    "history": []
                }
            )
        if not sub.is_paid:
            return success_response(
                message="Subscription fetched successfully",
                data={
                    "active": True,
                    "status": sub.status,
                    "plan_name": "Free",
                    "price": 0,
                    "plan_id": "FREE",
                    "subscription_id": None,
                    "created_at": sub.created_at,
                    "history": []
                },
                statusCode=200
            )
        # ✅ Plan mapping (add your real plan ids here)
        PLAN_DETAILS = {
            "plan_SCovUd5sTXe1jt": {"plan_name": "Basic Plan", "price": 1099},
            "plan_SCou9G4wA7cheq": {"plan_name": "Business Plan", "price": 2099},
            "plan_SCp5cV6I8ovNfw": {"plan_name": "Enterprise", "price": None},
        }

        # ✅ If plan_id not matched
        plan_info = PLAN_DETAILS.get(sub.razorpay_plan_id, {"plan_name": "Unknown", "price": 0})

        try:
            # ✅ Fetch subscription invoices/history from Razorpay
            invoices = client.invoice.all({
                "subscription_id": sub.razorpay_subscription_id
            })
            history = []
            for inv in invoices.get("items", []):
                history.append({
                    "invoice_id": inv.get("id"),
                    "status": inv.get("status"),
                    "amount": inv.get("amount", 0) // 100,
                    "created_at": inv.get("created_at")
                })

            return success_response(
                message="Subscription fetched successfully",
                data={
                    "active": sub.status == "active",
                    "status": sub.status,
                    "plan_name": plan_info["plan_name"],
                    "price": plan_info["price"],
                    "plan_id": sub.razorpay_plan_id,
                    "subscription_id": sub.razorpay_subscription_id,
                    "created_at": sub.created_at,
                    "history": invoices.get("items", [])
                }
            )

        except Exception as e:
            return error_response(str(e), 500)
    
class CancelSubscriptionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @swagger_auto_schema(tags=["Subscription"])
    def post(self, request):
        sub = UserSubscription.objects.filter(user=request.user).order_by("-created_at").first()

        if not sub:
            return error_response("No subscription found", 404)

        try:
            client.subscription.cancel(sub.razorpay_subscription_id)

            sub.status = "cancelled"
            sub.save()

            return success_response(
                message="Subscription cancelled successfully",
                data={"status": sub.status},
                statusCode=200
            )

        except Exception as e:
            return error_response(str(e), 500)


'''
class RazorpayWebhookAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        payload = request.body
        received_signature = request.headers.get("X-Razorpay-Signature")

        if not received_signature:
            return error_response("X-Razorpay-Signature header missing", 400)

        expected_signature = hmac.new(
            bytes(settings.RAZORPAY_WEBHOOK_SECRET, "utf-8"),
            msg=payload,
            digestmod=hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(received_signature, expected_signature):
            return error_response("Invalid signature", 400)

        event = request.data.get("event")

        if event == "subscription.activated":
            sub_id = request.data["payload"]["subscription"]["entity"]["id"]
            UserSubscription.objects.filter(razorpay_subscription_id=sub_id).update(status="active")

        elif event == "subscription.cancelled":
            sub_id = request.data["payload"]["subscription"]["entity"]["id"]
            UserSubscription.objects.filter(razorpay_subscription_id=sub_id).update(status="cancelled")

        return success_response(
            message="Webhook received",
            data={"event": event},
            statusCode=200
        )
        '''
class VerifyPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        tags=["Subscription"],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["razorpay_payment_id", "razorpay_subscription_id", "razorpay_signature"],
            properties={
                "razorpay_payment_id": openapi.Schema(type=openapi.TYPE_STRING),
                "razorpay_subscription_id": openapi.Schema(type=openapi.TYPE_STRING),
                "razorpay_signature": openapi.Schema(type=openapi.TYPE_STRING),
            }
        )
    )
    def post(self, request):
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_subscription_id = request.data.get("razorpay_subscription_id")
        razorpay_signature = request.data.get("razorpay_signature")

        if not razorpay_payment_id or not razorpay_subscription_id or not razorpay_signature:
            return error_response("razorpay_payment_id, razorpay_subscription_id, razorpay_signature are required", 400)

        # ✅ Signature verification string
        payload = f"{razorpay_payment_id}|{razorpay_subscription_id}"

        expected_signature = hmac.new(
            bytes(settings.RAZORPAY_KEY_SECRET, "utf-8"),
            bytes(payload, "utf-8"),
            hashlib.sha256
        ).hexdigest()

        if expected_signature != razorpay_signature:
            return error_response("Invalid signature", 400)

        # ✅ Update DB status
        UserSubscription.objects.filter(
            user=request.user,
            razorpay_subscription_id=razorpay_subscription_id
        ).update(status="active")

        return success_response(
            message="Payment verified successfully",
            data={
                "subscription_id": razorpay_subscription_id,
                "payment_id": razorpay_payment_id,
                "status": "active"
            }
        )