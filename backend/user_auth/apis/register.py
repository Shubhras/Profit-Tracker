import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.utils import timezone

from user_auth.serializers import UserRegisterSerializer
from user_auth.models import UserProfile
from subscription.utils.custom_response import success_response, error_response
from core.email_utils import get_email_logo_header_html, send_email_with_logo

logger = logging.getLogger(__name__)


def send_user_welcome_email(user, profile=None):
    """
    Sends a welcome & registration confirmation email to the newly registered user.
    """
    user_email = user.email
    if not user_email:
        return False

    user_name = (getattr(profile, 'name', '') or user.first_name or user.username).strip()
    business_name = (getattr(profile, 'business_name', '') or '').strip()
    mobile_number = (getattr(profile, 'mobile_number', '') or '').strip()

    subject = "Welcome to TrackMyProfit - Registration Successful!"

    plain_message = f"""
Hello {user_name},

Welcome to TrackMyProfit! Your account has been created successfully.

Your Account Details:
- Email: {user_email}
- Business Name: {business_name or 'N/A'}
- Mobile: {mobile_number or 'N/A'}

Log in to your dashboard to connect your Amazon seller accounts, track profits, and monitor sales analytics:
https://trackmyprofit.com/auth/login

If you need any assistance getting started, please reach out to us at letstalk@trackmyprofit.com.

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
        .info-box {{ background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0; }}
        .btn {{ display: inline-block; background-color: #0d9488; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px; }}
        .footer {{ text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        {logo_header}
        <div class="content">
            <p>Hello <strong>{user_name}</strong>,</p>
            <p>Welcome to <strong>TrackMyProfit</strong>! Your account has been registered successfully.</p>
            
            <div class="info-box">
                <p style="margin: 4px 0;"><strong>Registered Email:</strong> {user_email}</p>
                <p style="margin: 4px 0;"><strong>Business Name:</strong> {business_name or 'N/A'}</p>
                <p style="margin: 4px 0;"><strong>Mobile:</strong> {mobile_number or 'N/A'}</p>
            </div>

            <p>You can now log in to your dashboard to connect your Amazon seller accounts, track real-time profits, and monitor sales analytics.</p>

            <div style="text-align: center; margin: 25px 0;">
                <a href="https://trackmyprofit.com/auth/login" class="btn" style="color: #ffffff;">Log In to Dashboard</a>
            </div>

            <p style="font-size: 13px; color: #64748b;">If you need any assistance getting started, feel free to contact us at <a href="mailto:letstalk@trackmyprofit.com">letstalk@trackmyprofit.com</a>.</p>
        </div>
        <div class="footer">
            <p>This is an automated notification from TrackMyProfit.</p>
        </div>
    </div>
</body>
</html>
"""

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'letstalk@trackmyprofit.com')
        send_email_with_logo(
            subject=subject,
            plain_message=plain_message,
            html_message=html_message,
            recipient_list=[user_email],
            from_email=from_email,
            fail_silently=True
        )
        logger.info(f"Welcome email sent successfully to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user_email}: {str(e)}")
        return False


def send_admin_registration_notification(user, profile=None):
    """
    Sends an email notification to the site administrator when a new user registers.
    """
    admin_email = getattr(settings, 'ADMIN_NOTIFICATION_EMAIL', 'letstalk@trackmyprofit.com')
    if not admin_email:
        return False

    user_email = user.email
    user_name = (getattr(profile, 'name', '') or user.first_name or user.username).strip()
    business_name = (getattr(profile, 'business_name', '') or '').strip()
    mobile_number = (getattr(profile, 'mobile_number', '') or '').strip()

    loc_parts = []
    if profile:
        for val in [getattr(profile, 'city', ''), getattr(profile, 'state', ''), getattr(profile, 'pin_code', '')]:
            if val and val.strip():
                loc_parts.append(val.strip())
    location_str = ", ".join(loc_parts) if loc_parts else "N/A"

    registered_at_str = timezone.now().strftime('%B %d, %Y, %I:%M %p')

    subject = f"TrackMyProfit - New User Registered: {user_name} ({business_name or user_email})"

    plain_message = f"""
A new user has registered on TrackMyProfit:

- Name: {user_name}
- Email: {user_email}
- Business Name: {business_name or 'N/A'}
- Mobile: {mobile_number or 'N/A'}
- Location: {location_str}
- Registered At: {registered_at_str}

Best regards,
TrackMyProfit System
"""

    logo_header = get_email_logo_header_html("TrackMyProfit")

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }}
        .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .header {{ text-align: center; padding-bottom: 20px; border-bottom: 2px solid #eef2f5; }}
        .content {{ padding: 20px 0; color: #334155; line-height: 1.6; }}
        .badge {{ display: inline-block; background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 12px; }}
        .info-box {{ background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; margin: 16px 0; }}
        .footer {{ text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        {logo_header}
        <div class="content">
            <span class="badge">New User Registration</span>
            <p>A new user has just registered on <strong>TrackMyProfit</strong>:</p>

            <div class="info-box">
                <p style="margin: 6px 0;"><strong>Name:</strong> {user_name}</p>
                <p style="margin: 6px 0;"><strong>Email:</strong> <a href="mailto:{user_email}">{user_email}</a></p>
                <p style="margin: 6px 0;"><strong>Business Name:</strong> {business_name or 'N/A'}</p>
                <p style="margin: 6px 0;"><strong>Mobile:</strong> {mobile_number or 'N/A'}</p>
                <p style="margin: 6px 0;"><strong>Location:</strong> {location_str}</p>
                <p style="margin: 6px 0;"><strong>Registered At:</strong> {registered_at_str}</p>
            </div>
        </div>
        <div class="footer">
            <p>This is an automated notification from TrackMyProfit User Management.</p>
        </div>
    </div>
</body>
</html>
"""

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'letstalk@trackmyprofit.com')
        send_email_with_logo(
            subject=subject,
            plain_message=plain_message,
            html_message=html_message,
            recipient_list=[admin_email],
            from_email=from_email,
            fail_silently=True
        )
        logger.info(f"Admin registration notification sent to {admin_email} for user {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send admin registration notification: {str(e)}")
        return False


class UserRegisterAPI(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)

        if not serializer.is_valid():
            # ✅ Get proper error message
            errors = serializer.errors

            if "non_field_errors" in errors:
                msg = errors["non_field_errors"][0]
            else:
                # pick first field error message
                first_key = list(errors.keys())[0]
                msg = errors[first_key][0]

            return error_response(str(msg), 400)

        user = serializer.save()

        # Send welcome email to user & registration alert to admin
        try:
            profile = getattr(user, 'profile', None)
            if not profile:
                profile = UserProfile.objects.filter(user=user).first()
            send_user_welcome_email(user, profile)
            send_admin_registration_notification(user, profile)
        except Exception as e:
            logger.error(f"Error in post-registration email triggers for user {getattr(user, 'email', '')}: {str(e)}")

        return success_response(
            message="User registered successfully",
            data={},
            statusCode=201
        )