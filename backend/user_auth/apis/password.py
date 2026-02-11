from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.authentication import JWTAuthentication


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

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Password changed successfully"
        }, status=status.HTTP_200_OK)
