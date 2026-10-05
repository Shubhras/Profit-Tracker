from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication

from subscription.utils.custom_response import success_response, error_response
from user_auth.serializers import UserProfileUpdateSerializer, UserProfileSerializer
from user_auth.models import UserProfile


class UserUpdateProfileAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def patch(self, request):
        profile = UserProfile.objects.filter(user=request.user).first()
        if not profile:
            profile = UserProfile.objects.create(
                user=request.user,
                name=request.data.get("name") or request.user.first_name or request.user.username or "",
                business_name=request.data.get("business_name") or "",
                mobile_number=request.data.get("mobile_number") or "",
                address=request.data.get("address") or "",
                city=request.data.get("city") or "",
                state=request.data.get("state") or "",
                pin_code=request.data.get("pin_code") or ""
            )

        serializer = UserProfileUpdateSerializer(profile, data=request.data, partial=True)

        if not serializer.is_valid():
            errors = serializer.errors
            first_key = list(errors.keys())[0]
            msg = errors[first_key][0]
            return error_response(f"{first_key}: {msg}" if first_key != "non_field_errors" else str(msg), 400)

        serializer.save()

        name = request.data.get("name")
        if name and name != request.user.first_name:
            request.user.first_name = name
            request.user.save(update_fields=['first_name'])

        # Return full updated user profile data
        full_serializer = UserProfileSerializer(request.user, context={'request': request})

        return success_response(
            message="Profile updated successfully",
            data=full_serializer.data
        )
