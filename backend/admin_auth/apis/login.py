from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from admin_auth.serializers import AdminLoginSerializer


class AdminLoginAPI(APIView):
    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )

        if not user or not user.is_staff:
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "Invalid admin credentials"
            }, status=400)

        token = RefreshToken.for_user(user)

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Login successful",
            "data": {
                "refresh": str(token),
                "access": str(token.access_token)
            }
        })
