import random
import logging
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from user_auth.models import EmailOTP
from subscription.utils.custom_response import success_response, error_response

logger = logging.getLogger(__name__)


def send_otp_email(user_email, otp_code):
    """
    Sends 6-digit signup OTP verification code to the specified email address.
    """
    subject = "TrackMyProfit - Email Verification OTP"
    plain_message = f"""
Hello,

Your verification code for TrackMyProfit account registration is: {otp_code}

This code is valid for 10 minutes. Please do not share this OTP with anyone.

Best regards,
TrackMyProfit Team
"""

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }}
        .container {{ max-width: 520px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .header {{ text-align: center; padding-bottom: 20px; border-bottom: 2px solid #eef2f5; }}
        .header h2 {{ color: #0d9488; margin: 0; }}
        .content {{ padding: 20px 0; color: #334155; line-height: 1.6; text-align: center; }}
        .otp-box {{ background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 10px; padding: 18px; margin: 24px 0; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #15803d; }}
        .footer {{ text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>TrackMyProfit</h2>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Thank you for creating an account with <strong>TrackMyProfit</strong>. Use the verification OTP below to complete your registration:</p>
            
            <div class="otp-box">{otp_code}</div>
            
            <p style="font-size: 13px; color: #64748b;">This OTP code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </div>
        <div class="footer">
            <p>This is an automated notification from TrackMyProfit.</p>
        </div>
    </div>
</body>
</html>
"""

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@trackmyprofit.com')
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=from_email,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False
        )
        logger.info(f"Signup OTP email sent successfully to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send signup OTP email to {user_email}: {str(e)}")
        return False


class SendSignupOTPAPIView(APIView):
    """
    API to send a 6-digit verification OTP to user's email before registration.
    """
    def post(self, request):
        email = request.data.get("email")

        if not email:
            return error_response("Email address is required.", 400)

        email = email.strip().lower()

        # Check if email is already registered
        if User.objects.filter(email=email).exists():
            return error_response("A user with this email address already exists.", 400)

        # Generate 6-digit OTP
        otp_code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=10)

        # Store or update OTP for this email
        EmailOTP.objects.filter(email=email).delete()
        EmailOTP.objects.create(
            email=email,
            otp=otp_code,
            expires_at=expires_at
        )

        # Dispatch email
        email_sent = send_otp_email(user_email=email, otp_code=otp_code)

        if not email_sent:
            return error_response("Failed to send OTP email. Please try again.", 500)

        return success_response(
            message=f"Verification OTP sent successfully to {email}.",
            data={"email": email}
        )
