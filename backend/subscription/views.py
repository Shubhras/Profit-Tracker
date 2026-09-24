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
from django.utils import timezone 
from django.utils.timezone import timedelta
from django.db.models import Q
from user_auth.models import SubscriptionPlan
from dateutil.relativedelta import relativedelta


# new
class CreateSubscriptionAPIView(APIView):
    permission_classes = [IsAuthenticated]


    @swagger_auto_schema(tags=["Subscription"])
    def post(self, request):

        user = request.user

        plan_id = request.data.get("plan_id")
        billing_cycle = request.data.get("billing_cycle")

        if not plan_id:
            return error_response(
                "plan_id is required",
                400
            )

        if billing_cycle not in ["monthly", "annual"]:
            return error_response(
                "billing_cycle must be monthly or annual",
                400
            )

        try:
            plan = SubscriptionPlan.objects.get(
                id=plan_id,
                is_active=True,
                is_deleted=False
            )

        except SubscriptionPlan.DoesNotExist:
            return error_response(
                "Subscription plan not found",
                404
            )

        amount = (
            plan.monthly_price
            if billing_cycle == "monthly"
            else plan.annual_price
        )

        # ==========================
        # FREE PLAN / STARTER TRIAL
        # ==========================
        is_starter_trial = "starter" in (plan.plan_name or "").lower() or (getattr(plan, "slug", None) and "starter" in plan.slug.lower())
        growth_plan = SubscriptionPlan.objects.filter(plan_name__icontains="Growth", is_active=True).first()

        if is_starter_trial:
            start_date = timezone.now()
            end_date = start_date + timedelta(days=7)
            start_at_ts = int((start_date + timedelta(days=7)).timestamp())

            UserSubscription.objects.filter(user=user, status__in=["active", "trial"]).update(status="inactive")

            rzp_sub_id = None
            if getattr(settings, 'RAZORPAY_KEY_ID', None) and getattr(settings, 'RAZORPAY_KEY_SECRET', None):
                try:
                    growth_base_price = float(growth_plan.monthly_price) if (growth_plan and growth_plan.monthly_price) else 9999.0
                    coupon_code = request.data.get("coupon_code") or request.data.get("promocode")
                    discount_amount = 0.0
                    promo_obj = None

                    if coupon_code:
                        code_clean = str(coupon_code).strip()
                        from user_auth.models import Promocode
                        promo = Promocode.objects.filter(
                            promocode=code_clean,
                            is_active=True,
                            is_deleted=False
                        ).first()
                        if promo and promo.promocode == code_clean:
                            now = timezone.now()
                            if (not promo.startDateTime or promo.startDateTime <= now) and (not promo.endDateTime or promo.endDateTime >= now):
                                promo_obj = promo
                                if promo.promoType == "discount" and promo.percentage:
                                    discount_amount = round(growth_base_price * (float(promo.percentage) / 100.0), 2)
                                elif promo.promoType == "fix":
                                    if float(promo.percentage or 0) == 100:
                                        discount_amount = growth_base_price
                                    elif promo.specificAmount:
                                        discount_amount = min(growth_base_price, float(promo.specificAmount))

                    taxable_growth = max(0.0, growth_base_price - discount_amount)
                    gst_growth = round(taxable_growth * 0.18, 2)
                    final_growth_price = round(taxable_growth + gst_growth, 2)
                    growth_amount_paise = int(round(final_growth_price * 100))

                    plan_item_name = f"TrackMyProfit Growth Plan ({promo_obj.promocode})" if promo_obj else "TrackMyProfit Growth Plan"

                    rzp_plan = client.plan.create({
                        "period": "monthly",
                        "interval": 1,
                        "item": {
                            "name": plan_item_name,
                            "amount": growth_amount_paise,
                            "currency": "INR",
                            "description": f"Monthly subscription for Growth Plan after 7-day trial (₹{final_growth_price}/mo)"
                        }
                    })

                    rzp_sub = client.subscription.create({
                        "plan_id": rzp_plan["id"],
                        "total_count": 12,
                        "quantity": 1,
                        "customer_notify": 1,
                        "start_at": start_at_ts
                    })
                    rzp_sub_id = rzp_sub.get("id")
                except Exception as ex:
                    import logging
                    logging.getLogger(__name__).warning(f"Razorpay subscription mandate creation fallback: {str(ex)}")

            if rzp_sub_id:
                # Razorpay Mandate Authorization is required from the user
                # The subscription is NOT paid yet until user authorizes on Razorpay!
                subscription = UserSubscription.objects.create(
                    user=user,
                    plan=plan,
                    next_plan=growth_plan,
                    billing_cycle=billing_cycle,
                    amount=0,
                    is_paid=False,
                    status="created",
                    start_date=start_date,
                    end_date=end_date,
                    razorpay_subscription_id=rzp_sub_id
                )
                # User profile stays inactive until payment / mandate is verified!
                return success_response(
                    message="Starter 7-Day Free Trial initiated with Auto-Pay Mandate.",
                    data={
                        "subscription_id": subscription.id,
                        "razorpay_subscription_id": rzp_sub_id,
                        "razorpay_key": settings.RAZORPAY_KEY_ID,
                        "plan_id": plan.id,
                        "plan_name": plan.plan_name,
                        "next_plan_id": growth_plan.id if growth_plan else None,
                        "next_plan_name": growth_plan.plan_name if growth_plan else "Growth Plan",
                        "billing_cycle": billing_cycle,
                        "amount": 0,
                        "payment_required": True,
                        "isFreePlan": False,
                        "isTrial": True,
                        "is_trial": True,
                        "is_paid": False,
                        "status": "created",
                        "subscription_status": "inactive",
                        "start_date": start_date,
                        "end_date": end_date
                    },
                    statusCode=200
                )

            # Fallback when no payment/mandate is required (true free plan)
            subscription = UserSubscription.objects.create(
                user=user,
                plan=plan,
                next_plan=growth_plan,
                billing_cycle=billing_cycle,
                amount=0,
                is_paid=True,
                status="active",
                start_date=start_date,
                end_date=end_date
            )

            if hasattr(user, "profile") and user.profile:
                user.profile.subscriptiontype = plan
                user.profile.subscription_active = True
                user.profile.subscription_status = "active"
                user.profile.trial_start_date = start_date
                user.profile.trial_end_date = end_date
                user.profile.save()

            return success_response(
                message="Starter 7-Day Free Trial activated successfully. Your subscription moves to Growth plan after 7 days.",
                data={
                    "subscription_id": subscription.id,
                    "plan_id": plan.id,
                    "plan_name": plan.plan_name,
                    "next_plan_id": growth_plan.id if growth_plan else None,
                    "next_plan_name": growth_plan.plan_name if growth_plan else "Growth Plan",
                    "billing_cycle": billing_cycle,
                    "amount": 0,
                    "payment_required": False,
                    "isFreePlan": True,
                    "isTrial": True,
                    "is_trial": True,
                    "is_paid": True,
                    "status": "active",
                    "subscription_status": "active",
                    "start_date": start_date,
                    "end_date": end_date
                },
                statusCode=200
            )

        # ==========================
        # PAID PLAN
        # ==========================
        try:
            base_amount = float(amount)
            coupon_code = request.data.get("coupon_code") or request.data.get("promocode")
            discount_amount = 0.0

            if coupon_code:
                code_clean = str(coupon_code).strip()
                from user_auth.models import Promocode
                promo = Promocode.objects.filter(
                    promocode=code_clean,
                    is_active=True,
                    is_deleted=False
                ).first()
                if promo and promo.promocode == code_clean:
                    now = timezone.now()
                    if (not promo.startDateTime or promo.startDateTime <= now) and (not promo.endDateTime or promo.endDateTime >= now):
                        if promo.promoType == "discount" and promo.percentage:
                            discount_amount = round(base_amount * (float(promo.percentage) / 100.0), 2)
                        elif promo.promoType == "fix":
                            if float(promo.percentage or 0) == 100:
                                discount_amount = base_amount
                            elif promo.specificAmount:
                                discount_amount = min(base_amount, float(promo.specificAmount))

            taxable_amount = max(0.0, base_amount - discount_amount)
            gst_amount = round(taxable_amount * 0.18, 2)
            total_amount = round(taxable_amount + gst_amount, 2)
            amount_paise = int(round(total_amount * 100))

            razorpay_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "payment_capture": 1
            })

            subscription = UserSubscription.objects.create(
                user=user,
                plan=plan,
                billing_cycle=billing_cycle,
                amount=total_amount,
                status="created",
                razorpay_order_id=razorpay_order["id"]
            )

            return success_response(
                message="Payment initiated successfully",
                data={
                    "subscription_id": subscription.id,
                    "order_id": razorpay_order["id"],
                    "plan_id": plan.id,
                    "plan_name": plan.plan_name,
                    "billing_cycle": billing_cycle,
                    "base_amount": base_amount,
                    "discount_amount": discount_amount,
                    "taxable_amount": taxable_amount,
                    "gst_amount": gst_amount,
                    "amount": total_amount,
                    "amount_paise": amount_paise,
                    "currency": "INR",
                    "razorpay_key": settings.RAZORPAY_KEY_ID,
                    "payment_required": True
                },
                statusCode=201
            )

        except Exception as e:
            return error_response(
                str(e),
                500
            )



        
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
                "billing_cycle": "monthly",
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
                "plan_id": "plan_SCou9G4wA7cheq",  
                "name": "Business Plan",
                "price": 2099,
                "billing_cycle": "monthly",
                "sync_frequency": "Daily",
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

def get_current_user_subscription(user):
    """
    Returns the user's current effective subscription, prioritizing:
    1. Active & paid subscription whose end_date has not passed (or null).
    2. Cancelled & paid subscription within grace period (end_date > now).
    3. Most recently expired paid subscription (so user sees their expired plan rather than an uncompleted checkout attempt).
    4. Fallback to latest subscription record (e.g. pending/created initial orders).
    """
    now = timezone.now()

    # 1. Active & paid subscription (not expired)
    sub = (
        UserSubscription.objects
        .select_related("plan")
        .filter(
            Q(end_date__gt=now) | Q(end_date__isnull=True),
            user=user,
            status="active",
            is_paid=True
        )
        .order_by("-created_at")
        .first()
    )
    if sub:
        return sub

    # 2. Cancelled & paid subscription within grace period (end_date > now)
    sub = (
        UserSubscription.objects
        .select_related("plan")
        .filter(
            user=user,
            status="cancelled",
            is_paid=True,
            end_date__gt=now
        )
        .order_by("-created_at")
        .first()
    )
    if sub:
        return sub

    # 3. Most recently expired paid subscription
    sub = (
        UserSubscription.objects
        .select_related("plan")
        .filter(
            user=user,
            is_paid=True
        )
        .order_by("-created_at")
        .first()
    )
    if sub:
        return sub

    # 4. Fallback to latest record (e.g. created/unpaid initial attempt)
    return (
        UserSubscription.objects
        .select_related("plan")
        .filter(user=user)
        .order_by("-created_at")
        .first()
    )


class MySubscriptionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(tags=["Subscription"])
    
    def get(self, request):

        sub = get_current_user_subscription(request.user)

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

        from subscription.services.renewal_service import handle_subscription_expiry_and_renewal

        # Evaluate expiration and auto-renewal (creates new record if paid, or marks expired if unpaid)
        sub, _ = handle_subscription_expiry_and_renewal(sub, check_razorpay=True)

        all_subscriptions = UserSubscription.objects.filter(
            user=request.user
        ).select_related("plan").order_by("-created_at")

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
            
        subscription_history = []

        for item in all_subscriptions:
            subscription_history.append({
                "subscription_id": item.id,
                "plan_id": item.plan.subcription_id if item.plan else None,
                "plan_name": item.plan.plan_name if item.plan else None,
                "billing_cycle": item.billing_cycle,
                "amount": item.amount,
                "status": item.status,
                "is_paid": item.is_paid,
                "start_date": item.start_date,
                "end_date": item.end_date,
                "created_at": item.created_at,
                "razorpay_payment_id": item.razorpay_payment_id,
                "razorpay_subscription_id": item.razorpay_subscription_id,
            })    

        try:
            history = []

            if sub.razorpay_subscription_id:
                invoices = client.invoice.all({
                    "subscription_id": sub.razorpay_subscription_id
                })

                history = [
                    {
                        "invoice_id": invoice.get("id"),
                        "status": invoice.get("status"),
                        "amount": invoice.get("amount", 0) / 100,
                        "created_at": invoice.get("created_at")
                    }
                    for invoice in invoices.get("items", [])
                ]

            is_sub_trial = (
                (sub.plan and "starter" in (sub.plan.plan_name or "").lower())
                or sub.amount == 0
                or getattr(sub, "status", None) == "trial"
                or bool(hasattr(request.user, "profile") and request.user.profile and request.user.profile.trial_end_date and request.user.profile.trial_end_date > timezone.now())
            )
            now = timezone.now()
            is_cancelled_active = bool(
                sub.status == "cancelled"
                and sub.is_paid
                and sub.end_date
                and sub.end_date > now
            )
            is_active_valid = bool(
                sub.status == "active"
                and (not sub.end_date or sub.end_date > now)
            )
            has_access = bool(is_active_valid or is_cancelled_active)
            is_expired = bool(
                sub.status == "expired"
                or (sub.end_date and sub.end_date <= now)
            )

            return success_response(
                message="Subscription fetched successfully",
                data={
                    "active": has_access,
                    "has_subscription": has_access,
                    "is_cancelled_active": is_cancelled_active,
                    "status": sub.status,
                    "subscription_status": "active" if has_access else sub.status,
                    "isTrial": is_sub_trial,
                    "is_trial": is_sub_trial,
                    "is_expired": is_expired,

                    "subscription_id": sub.id,

                    "plan": {
                        "plan_id": sub.plan.subcription_id if sub.plan else None,
                        "plan_name": sub.plan.plan_name if sub.plan else None,
                        "description": sub.plan.description if sub.plan else None,
                        "monthly_price": sub.plan.monthly_price if sub.plan else 0,
                        "annual_price": sub.plan.annual_price if sub.plan else 0,
                        "features": sub.plan.features if sub.plan else [],
                        "terms_and_conditions": (
                            sub.plan.terms_and_conditions
                            if sub.plan else []
                        ),
                    },

                    "billing_cycle": sub.billing_cycle,
                    "amount": sub.amount,
                    "is_paid": sub.is_paid,

                    "razorpay_subscription_id": sub.razorpay_subscription_id,
                    "razorpay_payment_id": sub.razorpay_payment_id,

                    "start_date": sub.start_date,
                    "end_date": sub.end_date,
                    "created_at": sub.created_at,

                    "history": history,
                    "history": subscription_history
                }
            )

        except Exception as e:
            return error_response(str(e), 500)
        
        
class CancelSubscriptionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @swagger_auto_schema(tags=["Subscription"])
    def post(self, request):
        sub = get_current_user_subscription(request.user)

        if not sub:
            return error_response("No subscription found", 404)

        try:
            if sub.razorpay_subscription_id:
                try:
                    client.subscription.cancel(sub.razorpay_subscription_id)
                except Exception as rzp_ex:
                    import logging
                    logging.getLogger(__name__).warning(f"Razorpay cancel error: {str(rzp_ex)}")

            sub.status = "cancelled"
            sub.auto_renew = False
            sub.save()

            now = timezone.now()
            has_access_until_end = bool(sub.is_paid and sub.end_date and sub.end_date > now)

            if hasattr(request.user, "profile") and request.user.profile:
                request.user.profile.subscription_active = has_access_until_end
                request.user.profile.subscription_status = "cancelled" if has_access_until_end else "inactive"
                request.user.profile.save()

            formatted_end_date = sub.end_date.strftime("%B %d, %Y") if sub.end_date else "the end of your billing cycle"
            msg = (
                f"Subscription cancelled successfully. You will continue to have access to all features until {formatted_end_date}."
                if has_access_until_end
                else "Subscription cancelled successfully."
            )

            return success_response(
                message=msg,
                data={
                    "status": sub.status,
                    "has_subscription": has_access_until_end,
                    "is_cancelled_active": has_access_until_end,
                    "end_date": sub.end_date,
                },
                statusCode=200
            )

        except Exception as e:
            return error_response(str(e), 500)


class RazorpayWebhookAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        payload = request.body
        received_signature = request.headers.get("X-Razorpay-Signature")

        webhook_secret = getattr(settings, 'RAZORPAY_WEBHOOK_SECRET', '')
        if webhook_secret and received_signature:
            expected_signature = hmac.new(
                bytes(webhook_secret, "utf-8"),
                msg=payload,
                digestmod=hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(received_signature, expected_signature):
                return error_response("Invalid signature", 400)

        event = request.data.get("event")
        payload_data = request.data.get("payload", {})

        if event in ["subscription.charged", "invoice.paid"]:
            sub_id = (
                payload_data.get("subscription", {}).get("entity", {}).get("id")
                or payload_data.get("invoice", {}).get("entity", {}).get("subscription_id")
            )
            payment_id = (
                payload_data.get("payment", {}).get("entity", {}).get("id")
                or payload_data.get("invoice", {}).get("entity", {}).get("payment_id")
            )
            if sub_id:
                from subscription.services.renewal_service import handle_subscription_expiry_and_renewal
                latest_sub = UserSubscription.objects.filter(razorpay_subscription_id=sub_id).order_by("-created_at").first()
                if latest_sub:
                    handle_subscription_expiry_and_renewal(
                        latest_sub,
                        check_razorpay=False,
                        payment_confirmed=True,
                        payment_id=payment_id
                    )

        elif event == "subscription.activated":
            sub_id = (
                payload_data.get("subscription", {}).get("entity", {}).get("id")
                or payload_data.get("invoice", {}).get("entity", {}).get("subscription_id")
            )
            if sub_id:
                subscriptions = UserSubscription.objects.filter(razorpay_subscription_id=sub_id, status="created")
                for sub in subscriptions:
                    sub.status = "active"
                    sub.save(update_fields=["status"])
                    if hasattr(sub.user, "profile") and sub.user.profile:
                        sub.user.profile.subscriptiontype = sub.plan
                        sub.user.profile.subscription_active = True
                        sub.user.profile.subscription_status = "active"
                        sub.user.profile.save()

        elif event in ["subscription.cancelled", "subscription.halted"]:
            sub_id = (
                payload_data.get("subscription", {}).get("entity", {}).get("id")
                or payload_data.get("invoice", {}).get("entity", {}).get("subscription_id")
            )
            if sub_id:
                from subscription.services.email_notifications import send_subscription_expired_notice
                subscriptions = UserSubscription.objects.filter(razorpay_subscription_id=sub_id)
                for sub in subscriptions:
                    sub.status = "expired" if event == "subscription.halted" else "cancelled"
                    sub.auto_renew = False
                    sub.save()
                    if hasattr(sub.user, "profile") and sub.user.profile:
                        sub.user.profile.subscription_active = False
                        sub.user.profile.subscription_status = "inactive"
                        sub.user.profile.save()
                    send_subscription_expired_notice(sub)

        return success_response(
            message="Webhook received",
            data={"event": event},
            statusCode=200
        )


class ToggleAutoRenewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        auto_renew = request.data.get("auto_renew")
        if auto_renew is None:
            return error_response("auto_renew field (boolean) is required.", 400)

        sub = get_current_user_subscription(user)
        if not sub:
            return error_response("No subscription found.", 404)

        sub.auto_renew = bool(auto_renew)
        sub.save(update_fields=["auto_renew"])

        return success_response(
            message=f"Auto-renewal has been {'enabled' if sub.auto_renew else 'disabled'}.",
            data={"auto_renew": sub.auto_renew}
        )


import hmac
import hashlib

class VerifyPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        required_fields = [
            "subscription_id",
            "razorpay_payment_id",
            "razorpay_signature"
        ]

        for field in required_fields:
            if not request.data.get(field):
                return error_response(
                    f"{field} is required",
                    400
                )

        subscription_id = request.data.get("subscription_id")
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_subscription_id = request.data.get("razorpay_subscription_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        try:
            subscription = UserSubscription.objects.get(
                id=subscription_id,
                user=request.user
            )
        except UserSubscription.DoesNotExist:
            return error_response(
                "Subscription not found",
                404
            )

        # Verify signature against order payload OR subscription payload
        possible_payloads = []
        if razorpay_subscription_id:
            possible_payloads.append(f"{razorpay_payment_id}|{razorpay_subscription_id}")
        if razorpay_order_id:
            possible_payloads.append(f"{razorpay_order_id}|{razorpay_payment_id}")

        valid_signature = False
        secret_bytes = bytes(getattr(settings, "RAZORPAY_KEY_SECRET", ""), "utf-8")

        for payload in possible_payloads:
            gen_sig = hmac.new(secret_bytes, bytes(payload, "utf-8"), hashlib.sha256).hexdigest()
            if hmac.compare_digest(gen_sig, razorpay_signature):
                valid_signature = True
                break

        if not valid_signature and possible_payloads:
            return error_response("Invalid payment signature", 400)

        UserSubscription.objects.filter(
            user=request.user,
            status__in=["active", "trial", "cancelled"]
        ).exclude(
            id=subscription.id
        ).update(
            status="inactive"
        )

        subscription.razorpay_payment_id = razorpay_payment_id
        if razorpay_subscription_id:
            subscription.razorpay_subscription_id = razorpay_subscription_id
        if razorpay_order_id:
            subscription.razorpay_order_id = razorpay_order_id
        subscription.razorpay_signature = razorpay_signature
        subscription.is_paid = True

        is_starter_sub = (subscription.plan and "starter" in (subscription.plan.plan_name or "").lower()) or subscription.amount == 0
        subscription.status = "active"

        if not is_starter_sub:
            subscription.start_date = timezone.now()
            from dateutil.relativedelta import relativedelta
            if subscription.billing_cycle == "monthly":
                subscription.end_date = timezone.now() + relativedelta(months=1)
            else:
                subscription.end_date = timezone.now() + relativedelta(years=1)

        subscription.reminder_3day_sent = False
        subscription.reminder_1day_sent = False
        subscription.expired_email_sent = False

        subscription.save()

        if hasattr(request.user, "profile") and request.user.profile:
            request.user.profile.subscriptiontype = subscription.plan
            request.user.profile.subscription_active = True
            request.user.profile.subscription_status = "active"
            request.user.profile.save()

        return success_response(
            message="Payment verified successfully",
            data={
                "subscription_id": subscription.id,
                "plan_name": subscription.plan.plan_name if subscription.plan else None,
                "billing_cycle": subscription.billing_cycle,
                "start_date": subscription.start_date,
                "end_date": subscription.end_date,
                "status": subscription.status,
                "subscription_status": subscription.status,
                "isTrial": is_starter_sub,
                "is_trial": is_starter_sub
            }
        )



            
                    