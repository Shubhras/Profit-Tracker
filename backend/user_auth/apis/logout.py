from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken, TokenError


class LogoutAPIView(APIView):
    """
    Universal Logout API
    Handles logout for all user roles: Main User, SubUser, Admin, Admin SubUser.
    Accepts 'refresh', 'refresh_token', or 'refreshToken' payload to blacklist the JWT session token.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = (
            request.data.get("refresh")
            or request.data.get("refresh_token")
            or request.data.get("refreshToken")
        )

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                if hasattr(token, "blacklist"):
                    token.blacklist()
            except TokenError:
                # Token is invalid, expired, or already blacklisted
                pass
            except Exception as e:
                print("Logout token blacklist warning:", e)

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Logged out successfully",
            "data": {}
        }, status=status.HTTP_200_OK)


# Aliases for explicit imports or compatibility across apps
UserLogoutAPI = LogoutAPIView
AdminLogoutAPI = LogoutAPIView
