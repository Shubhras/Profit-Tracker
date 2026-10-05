from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.authentication import JWTAuthentication
from user_auth.serializers import UserProfileSerializer
from user_auth.models import UserProfile


class UserProfileAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not UserProfile.objects.filter(user=request.user).exists():
            UserProfile.objects.create(
                user=request.user,
                name=request.user.first_name or request.user.username or "",
                business_name="",
                mobile_number="",
                address="",
                city="",
                state="",
                pin_code=""
            )

        serializer = UserProfileSerializer(request.user, context={'request': request})

        return Response({
            "statusCode": 200,
            "status": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)
