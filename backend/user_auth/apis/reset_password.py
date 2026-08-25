import re
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from subscription.utils.custom_response import success_response, error_response
from user_auth.models import EmailOTP, PasswordResetRequest


class UserResetPasswordAPI(APIView):
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp") or request.data.get("token")
        new_password = request.data.get("new_password")

        if not email or not otp or not new_password:
            return error_response("Email, OTP code, and new password are required.", 400)

        email = email.strip().lower()
        otp = str(otp).strip()

        # Validate password policy
        pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$'
        if not re.match(pattern, new_password):
            return error_response(
                "Password must be at least 12 characters and include uppercase, lowercase, number, and special character.",
                400
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return error_response("User account not found.", 404)

        # Verify OTP
        otp_record = EmailOTP.objects.filter(email=email).order_by("-created_at").first()

        # Fallback compatibility if reset_obj token is passed
        if not otp_record:
            reset_obj = PasswordResetRequest.objects.filter(token=otp, is_used=False).first()
            if reset_obj and not reset_obj.is_expired():
                user.set_password(new_password)
                user.save()
                reset_obj.is_used = True
                reset_obj.save()
                return success_response(message="Password reset successfully.", data={})
            return error_response("No OTP request found for this email. Please request a new OTP.", 400)

        if otp_record.is_expired():
            return error_response("The OTP code has expired. Please request a new OTP.", 400)

        if otp_record.otp != otp:
            return error_response("Invalid OTP code. Please check and try again.", 400)

        # Set new password
        user.set_password(new_password)
        user.save()

        # Clean up OTP record
        EmailOTP.objects.filter(email=email).delete()

        # Send confirmation email
        from user_auth.apis.password import send_password_changed_email
        send_password_changed_email(user)

        return success_response(
            message="Password reset successfully.",
            data={}
        )


class RefreshTokenAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "Refresh token is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Access token refreshed successfully",
                "data": {
                    "access": str(refresh.access_token)
                }
            }, status=status.HTTP_200_OK)

        except TokenError:
            return Response({
                "statusCode": 401,
                "status": False,
                "error": "Invalid or expired refresh token"
            }, status=status.HTTP_401_UNAUTHORIZED)
