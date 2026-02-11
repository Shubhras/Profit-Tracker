from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from user_auth.models import UserAuthToken


class UserTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.headers.get('Authorization')

        if not token:
            return None

        try:
            token_obj = UserAuthToken.objects.get(
                token=token,
                is_active=True
            )
        except UserAuthToken.DoesNotExist:
            raise AuthenticationFailed("Invalid or expired token")

        return (token_obj.user, token_obj)
