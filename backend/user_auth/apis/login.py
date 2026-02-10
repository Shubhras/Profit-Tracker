from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework_simplejwt.tokens import RefreshToken


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate

from rest_framework_simplejwt.tokens import RefreshToken

from subscription.models import UserSubscription   # ✅ change if your model is in Subscription.models


class UserLoginAPI(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "email and password are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        # ✅ username=email in your register logic
        user = authenticate(username=email, password=password)

        if user is None:
            return Response({
                "statusCode": 401,
                "status": False,
                "error": "Invalid email or password"
            }, status=status.HTTP_401_UNAUTHORIZED)

        # ✅ JWT tokens
        refresh = RefreshToken.for_user(user)

        # ✅ subscription check
        sub = UserSubscription.objects.filter(user=user).order_by("-created_at").first()
        has_subscription = sub is not None and sub.status == "active"

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Login successful",
            "data": {
                "user_id": user.id,
                "email": user.email,
                "access": str(refresh.access_token),
                "refresh": str(refresh),

                # ✅ new field
                "has_subscription": has_subscription,
                "subscription_status": sub.status if sub else "no_subscription"
            }
        }, status=status.HTTP_200_OK)
