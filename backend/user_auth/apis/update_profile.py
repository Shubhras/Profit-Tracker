from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from rest_framework_simplejwt.authentication import JWTAuthentication

from subscription.utils.custom_response import success_response, error_response
from user_auth.serializers import UserProfileUpdateSerializer
from user_auth.models import UserProfile


class UserUpdateProfileAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return error_response("User profile not found", 404)

        serializer = UserProfileUpdateSerializer(profile, data=request.data, partial=True)

        if not serializer.is_valid():
            errors = serializer.errors
            first_key = list(errors.keys())[0]
            msg = errors[first_key][0]
            return error_response(str(msg), 400)

        serializer.save()

        return success_response(
            message="Profile updated successfully",
            data=serializer.data
        )
    
