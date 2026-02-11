from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from user_auth.models import PasswordResetRequest
from subscription.utils.custom_response import success_response, error_response

class UserForgotPasswordAPI(APIView):
    def post(self, request):
        email = request.data.get("email")

        if not email:
            return error_response("Email is required", 400)

        try:
            user = User.objects.get(email=email, is_staff=False)
        except User.DoesNotExist:
            return error_response("User not found", 404)

        token = PasswordResetTokenGenerator().make_token(user)

        PasswordResetRequest.objects.create(
            user=user,
            token=token
        )

        return success_response(
        message="Reset token generated",
        data={"token": token}
        )