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


def fetch_razorpay_latest_payment_info(razorpay_subscription_id):
    """
    Fetches the latest paid invoice/payment details from Razorpay for a subscription.
    Returns: (actual_amount, payment_id)
    """
    if not razorpay_subscription_id:
        return None, None
    try:
        invoices = client.invoice.all({"subscription_id": razorpay_subscription_id})
        items = invoices.get("items", [])
        for item in items:
            if item.get("status") == "paid":
                amount_paise = item.get("amount") or item.get("amount_paid")
                payment_id = item.get("payment_id")
                actual_amount = round(float(amount_paise) / 100.0, 2) if amount_paise else None
                return actual_amount, payment_id
    except Exception as e:
        logger.warning(f"Error fetching invoices for subscription {razorpay_subscription_id}: {str(e)}")
    return None, None


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


def handle_subscription_expiry_and_renewal(sub, check_razorpay=True, payment_confirmed=False, payment_id=None):
    """
    Handles expiration and auto-renewal logic for a UserSubscription.
    
    Returns:
        tuple: (active_or_expired_sub, renewed_boolean)
        - If renewed via auto-pay: returns (new_subscription, True)
        - If expired without payment: returns (expired_subscription, False)
        - If not yet expired or within grace period: returns (sub, False)
    """
    if not sub or not sub.end_date:
        return sub, False

    now = timezone.now()
    if sub.end_date > now:
        # Not expired yet
        return sub, False

    user = sub.user
    user_email = getattr(user, "email", getattr(user, "username", "User"))

    # If the user already has an active, paid renewal subscription that covers now, do not duplicate
    existing_active = UserSubscription.objects.filter(
        user=user,
        status="active",
        is_paid=True,
        end_date__gt=now
    ).exclude(id=sub.id).first()
    if existing_active:
        return existing_active, False

    is_starter_or_trial = (
        (sub.plan and "starter" in (sub.plan.plan_name or "").lower())
        or sub.amount == 0
        or getattr(sub, "status", None) == "trial"
        or sub.is_trial
    )

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

    # Grace Period Window: Razorpay mandates execute in batch cycles throughout the renewal date.
    # Allow 24 hours past end_date before concluding that payment failed.
    grace_period_hours = 24
    is_within_grace = (now - sub.end_date) <= timedelta(hours=grace_period_hours)

    if not is_paid_successfully and is_within_grace and sub.auto_renew and sub.razorpay_subscription_id:
        logger.info(
            f"Subscription {sub.id} for {user_email} (ended {sub.end_date}) is within {grace_period_hours}h "
            f"grace period. Awaiting Razorpay auto-pay mandate debit."
        )
        return sub, False

    # Fetch actual charged amount and payment_id from Razorpay if available
    actual_amount = None
    rzp_payment_id = payment_id
    if is_paid_successfully and sub.razorpay_subscription_id:
        fetched_amount, fetched_pay_id = fetch_razorpay_latest_payment_info(sub.razorpay_subscription_id)
        if fetched_amount is not None:
            actual_amount = fetched_amount
        if not rzp_payment_id and fetched_pay_id:
            rzp_payment_id = fetched_pay_id

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
            fallback_price = (
                growth_plan.monthly_price if cycle == "monthly" else growth_plan.annual_price
            )
            final_amount = actual_amount if actual_amount is not None else fallback_price
            new_end_date = (
                now + relativedelta(months=1) if cycle == "monthly" else now + relativedelta(years=1)
            )

            new_sub = UserSubscription.objects.create(
                user=user,
                plan=growth_plan,
                next_plan=None,
                billing_cycle=cycle,
                amount=final_amount,
                is_paid=True,
                status="active",
                start_date=now,
                end_date=new_end_date,
                auto_renew=True,
                razorpay_subscription_id=sub.razorpay_subscription_id,
                razorpay_plan_id=sub.razorpay_plan_id,
                razorpay_payment_id=rzp_payment_id,
            )

            if hasattr(user, "profile") and user.profile:
                user.profile.subscriptiontype = growth_plan
                user.profile.subscription_active = True
                user.profile.subscription_status = "active"
                user.profile.save()

            send_auto_renewal_success_notice(new_sub)
            logger.info(f"Auto-renewed Starter to Growth plan for {user_email} (New Sub ID: {new_sub.id}, Amount: {final_amount}, Payment ID: {rzp_payment_id})")
            return new_sub, True

        else:
            # Payment NOT completed after grace period -> Keep Growth inactive and Starter expired
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
            final_amount = actual_amount if actual_amount is not None else sub.amount

            new_sub = UserSubscription.objects.create(
                user=user,
                plan=sub.plan,
                next_plan=None,
                billing_cycle=cycle,
                amount=final_amount,
                is_paid=True,
                status="active",
                start_date=now,
                end_date=new_end_date,
                auto_renew=True,
                razorpay_subscription_id=sub.razorpay_subscription_id,
                razorpay_plan_id=sub.razorpay_plan_id,
                razorpay_payment_id=rzp_payment_id,
            )

            if hasattr(user, "profile") and user.profile:
                user.profile.subscriptiontype = sub.plan
                user.profile.subscription_active = True
                user.profile.subscription_status = "active"
                user.profile.save()

            send_auto_renewal_success_notice(new_sub)
            logger.info(f"Auto-renewed regular plan ({sub.plan}) for {user_email} (New Sub ID: {new_sub.id}, Amount: {final_amount}, Payment ID: {rzp_payment_id})")
            return new_sub, True

        else:
            # Payment NOT completed after grace period -> Keep expired
            if hasattr(user, "profile") and user.profile:
                user.profile.subscription_active = False
                user.profile.subscription_status = "expired"
                user.profile.save(update_fields=["subscription_active", "subscription_status"])

            send_subscription_expired_notice(sub)
            logger.info(f"Marked subscription as expired for {user_email}. Auto-renew not completed.")
            return sub, False


def update_razorpay_mandate_amount(sub, new_total_amount_rupees, plan_display_name="TrackMyProfit Plan"):
    """
    Updates an active Razorpay subscription mandate to a new recurring charge amount.
    
    Args:
        sub (UserSubscription): The user's active subscription record.
        new_total_amount_rupees (float): Total amount in INR to be debited (e.g. 99.00 or 116.82).
        plan_display_name (str): The name shown on Razorpay invoice/notification.
    
    Returns:
        dict: The updated Razorpay subscription object.
    """
    if not sub or not sub.razorpay_subscription_id:
        raise ValueError("Subscription does not have a valid razorpay_subscription_id.")

    amount_in_paise = int(round(float(new_total_amount_rupees) * 100))
    period = "monthly" if getattr(sub, "billing_cycle", "monthly") == "monthly" else "yearly"

    # 1. Create the new Razorpay Plan with the new amount
    new_rzp_plan = client.plan.create({
        "period": period,
        "interval": 1,
        "item": {
            "name": plan_display_name,
            "amount": amount_in_paise,
            "currency": "INR",
            "description": f"Updated subscription ({new_total_amount_rupees}/{period})"
        }
    })

    # 2. Update the existing Razorpay Subscription to use the new plan
    updated_rzp_sub = client.subscription.update(sub.razorpay_subscription_id, {
        "plan_id": new_rzp_plan["id"],
        "schedule_change_at": "now",  # Applies to the upcoming cycle
        "customer_notify": 1          # Notifies customer of the updated plan
    })

    # 3. Update the local database record
    sub.razorpay_plan_id = new_rzp_plan["id"]
    sub.amount = new_total_amount_rupees
    sub.save(update_fields=["razorpay_plan_id", "amount"])

    user_repr = getattr(sub.user, "email", str(sub.user))
    logger.info(f"Updated Razorpay mandate for {user_repr} ({sub.razorpay_subscription_id}) to ₹{new_total_amount_rupees}/{period}.")
    return updated_rzp_sub
