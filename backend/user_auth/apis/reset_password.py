from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework.views import APIView
from rest_framework import status

from subscription.utils.custom_response import success_response, error_response
from user_auth.models import PasswordResetRequest

from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken, TokenError


class UserResetPasswordAPI(APIView):
    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not token or not new_password:
            return error_response("token and new_password are required", 400)

        try:
            reset_obj = PasswordResetRequest.objects.get(token=token, is_used=False)
        except PasswordResetRequest.DoesNotExist:
            return error_response("Invalid token", 400)

        # ✅ Check expiry (15 minutes)
        if reset_obj.is_expired():
            return error_response("Token expired", 400)

        user = reset_obj.user

        # ✅ Double check with Django token validation
        if not PasswordResetTokenGenerator().check_token(user, token):
            return error_response("Invalid or expired token", 400)

        # ✅ Set new password
        user.set_password(new_password)
        user.save()

        # ✅ Mark token used
        reset_obj.is_used = True
        reset_obj.save()

        return success_response(
        message="Password reset successfully",
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
