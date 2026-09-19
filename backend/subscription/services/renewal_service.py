import logging
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from subscription.models import UserSubscription
from user_auth.models import SubscriptionPlan
from subscription.services.email_notifications import (
    send_subscription_expired_notice,
    send_auto_renewal_success_notice,
)
from subscription.utils.razorpay_client import client

logger = logging.getLogger(__name__)


def check_razorpay_payment_completed(razorpay_subscription_id, min_paid_count=1):
    """
    Queries Razorpay to verify if the subscription is active and has completed the required paid cycle.
    """
    if not razorpay_subscription_id:
        return False, None
    try:
        rzp_sub = client.subscription.fetch(razorpay_subscription_id)
        rzp_status = rzp_sub.get("status")
        paid_count = rzp_sub.get("paid_count", 0)

        if rzp_status in ["active", "completed"] and paid_count >= min_paid_count:
            return True, rzp_sub
        return False, rzp_sub
    except Exception as e:
        logger.error(f"Error checking Razorpay subscription {razorpay_subscription_id}: {str(e)}")
        return False, None


def handle_subscription_expiry_and_renewal(sub, check_razorpay=True, payment_confirmed=False):
    """
    Handles expiration and auto-renewal logic for a UserSubscription.
    
    Returns:
        tuple: (active_or_expired_sub, renewed_boolean)
        - If renewed via auto-pay: returns (new_subscription, True)
        - If expired without payment: returns (expired_subscription, False)
        - If not yet expired: returns (sub, False)
    """
    if not sub or not sub.end_date:
        return sub, False

    now = timezone.now()
    if sub.end_date > now:
        # Not expired yet
        return sub, False

    is_starter_or_trial = (
        (sub.plan and "starter" in (sub.plan.plan_name or "").lower())
        or sub.amount == 0
        or getattr(sub, "status", None) == "trial"
        or sub.is_trial
    )

    user = sub.user
    user_email = getattr(user, "email", getattr(user, "username", "User"))

    # Determine payment completion status if auto_renew is enabled
    is_paid_successfully = False
    rzp_data = None

    if sub.auto_renew and sub.razorpay_subscription_id:
        if payment_confirmed:
            is_paid_successfully = True
        elif check_razorpay:
            # For a starter trial transitioning to Growth, at least 1 paid cycle is needed
            # For a regular plan, at least 1 paid cycle is needed
            is_paid_successfully, rzp_data = check_razorpay_payment_completed(
                sub.razorpay_subscription_id,
                min_paid_count=1
            )

    # =========================================================================
    # CASE 1: STARTER / TRIAL PLAN EXPIRED
    # =========================================================================
    if is_starter_or_trial:
        # Mark previous starter plan as expired
        sub.status = "expired"
        sub.expired_email_sent = True
        sub.save(update_fields=["status", "expired_email_sent"])

        if is_paid_successfully:
            # Auto-pay succeeded for Growth plan upgrade!
            growth_plan = sub.next_plan
            if not growth_plan:
                growth_plan = SubscriptionPlan.objects.filter(
                    plan_name__icontains="Growth", is_active=True
                ).first()

            if not growth_plan:
                growth_plan = sub.plan

            cycle = sub.billing_cycle or "monthly"
            growth_amount = (
                growth_plan.monthly_price if cycle == "monthly" else growth_plan.annual_price
            )
            new_end_date = (
                now + relativedelta(months=1) if cycle == "monthly" else now + relativedelta(years=1)
            )

            new_sub = UserSubscription.objects.create(
                user=user,
                plan=growth_plan,
                next_plan=None,
                billing_cycle=cycle,
                amount=growth_amount,
                is_paid=True,
                status="active",
                start_date=now,
                end_date=new_end_date,
                auto_renew=True,
                razorpay_subscription_id=sub.razorpay_subscription_id,
                razorpay_plan_id=sub.razorpay_plan_id,
            )

            if hasattr(user, "profile") and user.profile:
                user.profile.subscriptiontype = growth_plan
                user.profile.subscription_active = True
                user.profile.subscription_status = "active"
                user.profile.save()

            send_auto_renewal_success_notice(new_sub)
            logger.info(f"Auto-renewed Starter to Growth plan for {user_email} (New Sub ID: {new_sub.id})")
            return new_sub, True

        else:
            # Payment NOT completed or auto_renew is False -> Keep Growth inactive and Starter expired
            if hasattr(user, "profile") and user.profile:
                user.profile.subscription_active = False
                user.profile.subscription_status = "expired"
                user.profile.save(update_fields=["subscription_active", "subscription_status"])

            send_subscription_expired_notice(sub)
            logger.info(f"Marked Starter trial as expired for {user_email}. No Growth plan granted without payment.")
            return sub, False

    # =========================================================================
    # CASE 2: REGULAR / NON-STARTER PLAN EXPIRED
    # =========================================================================
    else:
        # Mark current subscription as expired
        sub.status = "expired"
        sub.expired_email_sent = True
        sub.save(update_fields=["status", "expired_email_sent"])

        if is_paid_successfully:
            # Auto-pay succeeded for renewal of the same plan!
            cycle = sub.billing_cycle or "monthly"
            new_end_date = (
                now + relativedelta(months=1) if cycle == "monthly" else now + relativedelta(years=1)
            )

            new_sub = UserSubscription.objects.create(
                user=user,
                plan=sub.plan,
                next_plan=None,
                billing_cycle=cycle,
                amount=sub.amount,
                is_paid=True,
                status="active",
                start_date=now,
                end_date=new_end_date,
                auto_renew=True,
                razorpay_subscription_id=sub.razorpay_subscription_id,
                razorpay_plan_id=sub.razorpay_plan_id,
            )

            if hasattr(user, "profile") and user.profile:
                user.profile.subscriptiontype = sub.plan
                user.profile.subscription_active = True
                user.profile.subscription_status = "active"
                user.profile.save()

            send_auto_renewal_success_notice(new_sub)
            logger.info(f"Auto-renewed regular plan ({sub.plan}) for {user_email} (New Sub ID: {new_sub.id})")
            return new_sub, True

        else:
            # Payment NOT completed or auto_renew is False -> Keep expired
            if hasattr(user, "profile") and user.profile:
                user.profile.subscription_active = False
                user.profile.subscription_status = "expired"
                user.profile.save(update_fields=["subscription_active", "subscription_status"])

            send_subscription_expired_notice(sub)
            logger.info(f"Marked subscription as expired for {user_email}. Auto-renew not completed.")
            return sub, False
