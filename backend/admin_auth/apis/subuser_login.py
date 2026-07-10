from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from admin_auth.serializers import AdminLoginSerializer
from user_auth.models import SubUser

class AdminSubUserLoginAPI(APIView):
    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )

        if not user:
            return Response({
                "statusCode": 401,
                "status": False,
                "error": "Invalid credentials"
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Check if user is a subuser
        subuser = SubUser.objects.filter(user=user).select_related("parent").first()
        if not subuser:
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "Access denied: Not an admin subuser"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if parent is admin
        parent = subuser.parent
        if not (parent.is_staff or parent.is_superuser):
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "Access denied: Parent account is not an administrator"
            }, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active:
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "User account is inactive"
            }, status=status.HTTP_400_BAD_REQUEST)

        token = RefreshToken.for_user(user)

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Login successful",
            "data": {
                "refresh": str(token),
                "access": str(token.access_token),
                "user_id": user.id,
                "email": user.email,
                "name": subuser.name,
                "parent_id": parent.id,
                "parent_email": parent.email
            }
        }, status=status.HTTP_200_OK)
