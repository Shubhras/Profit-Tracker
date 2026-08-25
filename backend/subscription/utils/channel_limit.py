from subscription.models import UserSubscription
from amazon_auth.models import AmazonAccount


def check_user_channel_connection_limit(user):
    """
    Checks if the user has reached their maximum allowed channel connections
    based on their active subscription plan.

    Returns:
        tuple: (is_allowed: bool, max_allowed: int, current_count: int, error_message: str or None)
    """
    subscription = (
        UserSubscription.objects.filter(
            user=user,
            status="active",
            is_paid=True,
        )
        .select_related("plan")
        .first()
    )

    if subscription and subscription.plan:
        max_allowed = getattr(subscription.plan, "max_channel_connection", 1)
    else:
        max_allowed = 1

    # Count connected channels across platforms
    amazon_count = AmazonAccount.objects.filter(user=user).count()

    myntra_count = 0
    try:
        from myntra.models import MyntraAccount
        myntra_count = MyntraAccount.objects.filter(user=user).count()
    except Exception:
        pass

    blinkit_count = 0
    try:
        from blinkit.models import BlinkitAccount
        blinkit_count = BlinkitAccount.objects.filter(user=user).count()
    except Exception:
        pass

    total_connected = amazon_count + myntra_count + blinkit_count

    if max_allowed > 0 and total_connected >= max_allowed:
        msg = (
            f"Channel connection limit reached. Your active subscription plan "
            f"allows a maximum of {max_allowed} channel connection(s), and you currently have {total_connected} connected."
        )
        return False, max_allowed, total_connected, msg

    return True, max_allowed, total_connected, None
