import logging
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)


from core.email_utils import get_email_logo_header_html, send_email_with_logo

def send_password_changed_email(user):
    """
    Sends a security notification email to the user when their password is changed.
    """
    user_name = getattr(user, 'first_name', '') or user.username or "Valued User"
    user_email = user.email

    if not user_email:
        logger.warning(f"No email address found for user ID {user.id}")
        return False

    change_time = timezone.now().strftime("%B %d, %Y at %I:%M %p UTC")

    subject = "TrackMyProfit - Security Alert: Password Changed Successfully"
    
    plain_message = f"""
Hello {user_name},

Your TrackMyProfit account password was successfully changed on {change_time}.

If you initiated this change, no further action is required.

SECURITY NOTICE: If you did NOT change your password, please contact our support team immediately to secure your account.

Best regards,
TrackMyProfit Security Team
"""

    logo_header = get_email_logo_header_html("TrackMyProfit")

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }}
        .container {{ max-width: 520px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .header {{ text-align: center; padding-bottom: 20px; border-bottom: 2px solid #eef2f5; }}
        .content {{ padding: 20px 0; color: #334155; line-height: 1.6; }}
        .alert-box {{ background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 14px 16px; margin: 20px 0; border-radius: 6px; }}
        .warning-box {{ background-color: #fff1f2; border-left: 4px solid #f43f5e; padding: 14px 16px; margin: 20px 0; border-radius: 6px; font-size: 13px; color: #9f1239; }}
        .footer {{ text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        {logo_header}
        <div class="content">
            <p>Hello <strong>{user_name}</strong>,</p>
            <div class="alert-box">
                🔒 Your account password was <strong>successfully changed</strong> on {change_time}.
            </div>
            <p>If you made this change, you can safely ignore this email notification.</p>
            <div class="warning-box">
                ⚠️ <strong>Didn't make this change?</strong><br/>
                If you did not change your password, please reset your password immediately or contact our support team to secure your account.
            </div>
        </div>
        <div class="footer">
            <p>This is an automated security notification from TrackMyProfit.</p>
        </div>
    </div>
</body>
</html>
"""

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@trackmyprofit.com')
        send_email_with_logo(
            subject=subject,
            plain_message=plain_message,
            html_message=html_message,
            recipient_list=[user_email],
            from_email=from_email,
            fail_silently=False
        )
        logger.info(f"Password change confirmation email sent to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password change email to {user_email}: {str(e)}")
        return False


class UserChangePasswordAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "old_password and new_password are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "Old password incorrect"
            }, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        # Send security notification email
        send_password_changed_email(user)

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Password changed successfully. A confirmation email has been sent to your email."
        }, status=status.HTTP_200_OK)
