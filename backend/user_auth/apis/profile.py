from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.authentication import JWTAuthentication
from user_auth.serializers import UserProfileSerializer


class UserProfileAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)

        return Response({
            "statusCode": 200,
            "status": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)
