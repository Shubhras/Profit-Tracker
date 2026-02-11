from django.contrib.auth.models import User
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from admin_auth.serializers import ChangePasswordSerializer


class ChangePasswordAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "Old password is incorrect"
            }, status=400)

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Password changed successfully"
        })

class ForgotPasswordAPI(APIView):
    def post(self, request):
        email = request.data.get('email')

        try:
            user = User.objects.get(email=email, is_staff=True)
        except User.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "error": "Admin not found"
            }, status=404)

        token = PasswordResetTokenGenerator().make_token(user)

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Reset token generated",
            "data": {
                "user_id": user.id,
                "token": token
            }
        })


class ResetPasswordAPI(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "Invalid user"
            }, status=400)

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "Invalid or expired token"
            }, status=400)

        user.set_password(new_password)
        user.save()

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Password reset successfully"
        })
