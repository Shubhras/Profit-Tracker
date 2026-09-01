import logging
from django.conf import settings
from core.email_utils import get_email_logo_header_html, send_email_with_logo

logger = logging.getLogger(__name__)


def get_from_email():
    return getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@trackmyprofit.in')


def send_3day_expiry_reminder(subscription):
    """
    Sends email notification 3 days before subscription expiration.
    """
    user = subscription.user
    user_email = getattr(user, 'email', None)
    if not user_email:
        return False

    plan_name = subscription.plan.plan_name if subscription.plan else "Pro Plan"
    end_date_str = subscription.end_date.strftime('%B %d, %Y') if subscription.end_date else 'soon'

    subject = f"TrackMyProfit - Your Subscription Expires in 3 Days ({plan_name})"

    auto_renew_text = (
        "Automatic renewal is enabled for your account. Your subscription will renew automatically on "
        f"{end_date_str}."
        if subscription.auto_renew
        else "Automatic renewal is disabled. Please renew your plan before expiration to avoid interruption."
    )

    plain_message = f"""
Hello {user.first_name or user.username},

Your TrackMyProfit subscription ({plan_name}) is set to expire in 3 days on {end_date_str}.

{auto_renew_text}

Log in to your account dashboard to view subscription details or manage payment settings:
https://trackmyprofit.in/admin/settings/user-setting/user-management

Best regards,
TrackMyProfit Team
"""

    logo_header = get_email_logo_header_html("TrackMyProfit")

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }}
        .container {{ max-width: 560px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .header {{ text-align: center; padding-bottom: 20px; border-bottom: 2px solid #eef2f5; }}
        .content {{ padding: 20px 0; color: #334155; line-height: 1.6; }}
        .alert-box {{ background-color: #e0f2fe; border-left: 4px solid #0284c7; border-radius: 6px; padding: 16px; margin: 20px 0; color: #0369a1; }}
        .btn {{ display: inline-block; background-color: #0284c7; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }}
        .footer {{ text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        {logo_header}
        <div class="content">
            <p>Hello <strong>{user.first_name or user.username}</strong>,</p>
            <p>Your <strong>{plan_name}</strong> subscription will expire in <strong>3 days</strong> on <strong>{end_date_str}</strong>.</p>
            
            <div class="alert-box">
                {auto_renew_text}
            </div>

            <p style="text-align: center;">
                <a href="https://trackmyprofit.in/admin/settings/user-setting/user-management" class="btn" style="color: #ffffff;">Manage Subscription</a>
            </p>
        </div>
        <div class="footer">
            <p>This is an automated notification from TrackMyProfit.</p>
        </div>
    </div>
</body>
</html>
"""

    try:
        send_email_with_logo(
            subject=subject,
            plain_message=plain_message,
            from_email=get_from_email(),
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"3-day expiry reminder email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send 3-day expiry reminder email to {user_email}: {str(e)}")
        return False


def send_1day_expiry_reminder(subscription):
    """
    Sends email notification 1 day before subscription expiration.
    """
    user = subscription.user
    user_email = getattr(user, 'email', None)
    if not user_email:
        return False

    plan_name = subscription.plan.plan_name if subscription.plan else "Pro Plan"
    end_date_str = subscription.end_date.strftime('%B %d, %Y') if subscription.end_date else 'tomorrow'

    subject = f"⚡ Urgent: Your TrackMyProfit Subscription Expires Tomorrow! ({plan_name})"

    auto_renew_text = (
        f"Automatic renewal will run tomorrow on {end_date_str}. Please ensure your payment method has sufficient balance."
        if subscription.auto_renew
        else "Auto-renewal is turned off. Please renew today to prevent service interruption."
    )

    plain_message = f"""
Hello {user.first_name or user.username},

Your TrackMyProfit subscription ({plan_name}) expires tomorrow ({end_date_str}).

{auto_renew_text}

Log in now to manage your subscription:
https://trackmyprofit.in/admin/settings/user-setting/user-management

Best regards,
TrackMyProfit Team
"""

    logo_header = get_email_logo_header_html("TrackMyProfit")

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }}
        .container {{ max-width: 560px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .header {{ text-align: center; padding-bottom: 20px; border-bottom: 2px solid #eef2f5; }}
        .content {{ padding: 20px 0; color: #334155; line-height: 1.6; }}
        .alert-box {{ background-color: #fffbe6; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 20px 0; color: #b45309; }}
        .btn {{ display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }}
        .footer {{ text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        {logo_header}
        <div class="content">
            <p>Hello <strong>{user.first_name or user.username}</strong>,</p>
            <p>Your <strong>{plan_name}</strong> subscription will expire <strong>tomorrow ({end_date_str})</strong>.</p>
            
            <div class="alert-box">
                {auto_renew_text}
            </div>

            <p style="text-align: center;">
                <a href="https://trackmyprofit.in/admin/settings/user-setting/user-management" class="btn" style="color: #ffffff;">Renew / Manage Plan</a>
            </p>
        </div>
        <div class="footer">
            <p>This is an automated notification from TrackMyProfit.</p>
        </div>
    </div>
</body>
</html>
"""

    try:
        send_email_with_logo(
            subject=subject,
            plain_message=plain_message,
            from_email=get_from_email(),
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"1-day expiry reminder email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send 1-day expiry reminder email to {user_email}: {str(e)}")
        return False


def send_subscription_expired_notice(subscription):
    """
    Sends email notification when subscription expires.
    """
    user = subscription.user
    user_email = getattr(user, 'email', None)
    if not user_email:
        return False

    plan_name = subscription.plan.plan_name if subscription.plan else "Pro Plan"

    subject = f"Your TrackMyProfit Subscription Has Expired ({plan_name})"

    plain_message = f"""
Hello {user.first_name or user.username},

Your TrackMyProfit subscription ({plan_name}) has expired.

To continue enjoying automated financial reporting, payment reconciliation, and analytics, please renew your subscription:
https://trackmyprofit.in/admin/settings/user-setting/user-management

Best regards,
TrackMyProfit Team
"""

    logo_header = get_email_logo_header_html("TrackMyProfit")

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }}
        .container {{ max-width: 560px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .header {{ text-align: center; padding-bottom: 20px; border-bottom: 2px solid #eef2f5; }}
        .content {{ padding: 20px 0; color: #334155; line-height: 1.6; }}
        .alert-box {{ background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; padding: 16px; margin: 20px 0; color: #991b1b; }}
        .btn {{ display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }}
        .footer {{ text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        {logo_header}
        <div class="content">
            <p>Hello <strong>{user.first_name or user.username}</strong>,</p>
            <p>Your <strong>{plan_name}</strong> subscription has officially expired.</p>
            
            <div class="alert-box">
                Please renew your plan now to regain access to analytics, channel metrics, and payment reconciliation.
            </div>

            <p style="text-align: center;">
                <a href="https://trackmyprofit.in/admin/settings/user-setting/user-management" class="btn" style="color: #ffffff;">Renew Subscription Now</a>
            </p>
        </div>
        <div class="footer">
            <p>This is an automated notification from TrackMyProfit.</p>
        </div>
    </div>
</body>
</html>
"""

    try:
        send_email_with_logo(
            subject=subject,
            plain_message=plain_message,
            from_email=get_from_email(),
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Subscription expired notice email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send subscription expired notice email to {user_email}: {str(e)}")
        return False


def send_auto_renewal_success_notice(subscription):
    """
    Sends email confirmation after successful auto-renewal.
    """
    user = subscription.user
    user_email = getattr(user, 'email', None)
    if not user_email:
        return False

    plan_name = subscription.plan.plan_name if subscription.plan else "Pro Plan"
    end_date_str = subscription.end_date.strftime('%B %d, %Y') if subscription.end_date else 'Next Period'
    amount_str = f"₹{subscription.amount}" if subscription.amount else "₹0.00"

    subject = f"Receipt: TrackMyProfit Subscription Auto-Renewed ({plan_name})"

    plain_message = f"""
Hello {user.first_name or user.username},

Great news! Your TrackMyProfit subscription ({plan_name}) has been automatically renewed for {amount_str}.

Your next billing date is: {end_date_str}

Thank you for choosing TrackMyProfit!

Best regards,
TrackMyProfit Team
"""

    logo_header = get_email_logo_header_html("TrackMyProfit")

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }}
        .container {{ max-width: 560px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .header {{ text-align: center; padding-bottom: 20px; border-bottom: 2px solid #eef2f5; }}
        .content {{ padding: 20px 0; color: #334155; line-height: 1.6; }}
        .alert-box {{ background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 6px; padding: 16px; margin: 20px 0; color: #15803d; }}
        .footer {{ text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        {logo_header}
        <div class="content">
            <p>Hello <strong>{user.first_name or user.username}</strong>,</p>
            <p>Your <strong>{plan_name}</strong> subscription has been successfully auto-renewed!</p>
            
            <div class="alert-box">
                <strong>Amount Paid:</strong> {amount_str}<br/>
                <strong>Next Billing Date:</strong> {end_date_str}
            </div>
        </div>
        <div class="footer">
            <p>This is an automated notification from TrackMyProfit.</p>
        </div>
    </div>
</body>
</html>
"""

    try:
        send_email_with_logo(
            subject=subject,
            plain_message=plain_message,
            from_email=get_from_email(),
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Auto-renewal success notice email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send auto-renewal success notice email to {user_email}: {str(e)}")
        return False
