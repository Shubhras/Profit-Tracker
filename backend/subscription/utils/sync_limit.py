from datetime import timedelta
from django.utils import timezone
from subscription.models import UserSubscription


def get_user_sync_cutoff_date(user):
    """
    Returns a tuple of (cutoff_date, sync_days, reg_date):
    - cutoff_date: datetime.date representing the earliest allowed data date
                   calculated as: registration_date - initial_sync_duration days.
    - sync_days: int number of allowed historical sync days based on user's subscription plan.
    - reg_date: datetime.date of user registration.
    """
    if not user:
        today = timezone.now().date()
        return today - timedelta(days=30), 30, today

    try:
        from user_auth.sub_user import get_effective_user
        user = get_effective_user(user)
    except Exception:
        pass

    reg_datetime = getattr(user, "date_joined", None) or getattr(user, "created_at", None) or timezone.now()
    reg_date = reg_datetime.date() if hasattr(reg_datetime, "date") else reg_datetime

    subscription = (
        UserSubscription.objects.filter(
            user=user,
            status__in=["active", "trial"],
        )
        .select_related("plan")
        .order_by("-created_at")
        .first()
    )

    if not subscription or not subscription.plan:
        subscription = (
            UserSubscription.objects.filter(user=user)
            .select_related("plan")
            .order_by("-created_at")
            .first()
        )

    sync_days = 30
    if subscription and subscription.plan and subscription.plan.initial_sync_duration is not None:
        sync_days = subscription.plan.initial_sync_duration

    cutoff_date = reg_date - timedelta(days=sync_days)
    return cutoff_date, sync_days, reg_date
