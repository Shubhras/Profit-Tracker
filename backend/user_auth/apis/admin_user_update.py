from django.contrib.auth.models import User
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status

from subscription.utils.custom_response import success_response, error_response
from user_auth.models import UserProfile, UserModulePermission, Module, SubModule
from user_auth.serializers import (
    UserProfileUpdateSerializer,
    SubUserPermissionInputSerializer,
    UserModulePermissionSerializer
)

class AdminUserDetailUpdateAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return error_response("User not found", 404)

        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            profile = None

        permissions = UserModulePermission.objects.filter(user=user).select_related("module", "submodule")
        permissions_serializer = UserModulePermissionSerializer(permissions, many=True)

        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "name": profile.name if profile else "",
            "business_name": profile.business_name if profile else "",
            "mobile_number": profile.mobile_number if profile else "",
            "address": profile.address if profile else "",
            "city": profile.city if profile else "",
            "state": profile.state if profile else "",
            "pin_code": profile.pin_code if profile else "",
            "permissions": permissions_serializer.data
        }

        return success_response(
            message="User details retrieved successfully",
            data=user_data
        )

    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return error_response("User not found", 404)

        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user)

        email = request.data.get("email")
        is_active = request.data.get("is_active")
        permissions_data = request.data.get("permissions")

        # Validate email if provided
        if email and email != user.email:
            if User.objects.filter(email=email).exclude(pk=pk).exists():
                return error_response("A user with this email already exists.", 400)

        # Validate permissions if provided
        validated_perms = None
        if permissions_data is not None:
            perm_serializer = SubUserPermissionInputSerializer(data=permissions_data, many=True)
            if not perm_serializer.is_valid():
                first_key = list(perm_serializer.errors[0].keys())[0] if perm_serializer.errors else "error"
                msg = perm_serializer.errors[0][first_key][0] if perm_serializer.errors else "Invalid permissions format."
                return error_response(f"Permissions validation error: {msg}", 400)
            
            validated_perms = perm_serializer.validated_data
            
            # Uniqueness check for permissions payload
            seen_pairs = set()
            for perm in validated_perms:
                m_id = perm.get("module")
                s_id = perm.get("submodule")
                pair = (m_id, s_id)
                if pair in seen_pairs:
                    return error_response(f"Duplicate permission entry for module {m_id} and submodule {s_id}.", 400)
                seen_pairs.add(pair)

                # Validate module/submodule exist
                if m_id:
                    if not Module.objects.filter(id=m_id).exists():
                        return error_response(f"Module with ID {m_id} does not exist.", 400)
                if s_id:
                    try:
                        submodule_obj = SubModule.objects.get(id=s_id)
                        if m_id and submodule_obj.module_id != m_id:
                            return error_response(f"SubModule {s_id} does not belong to Module {m_id}.", 400)
                    except SubModule.DoesNotExist:
                        return error_response(f"SubModule with ID {s_id} does not exist.", 400)

        # Profile serializer validation
        profile_serializer = UserProfileUpdateSerializer(profile, data=request.data, partial=True)
        if not profile_serializer.is_valid():
            errors = profile_serializer.errors
            first_key = list(errors.keys())[0]
            msg = errors[first_key][0]
            return error_response(str(msg), 400)

        try:
            with transaction.atomic():
                # Update User fields
                if email:
                    user.email = email
                    user.username = email
                if is_active is not None:
                    user.is_active = is_active
                user.save()

                # Update Profile
                profile_serializer.save()

                # Update permissions
                if validated_perms is not None:
                    UserModulePermission.objects.filter(user=user).delete()
                    for perm in validated_perms:
                        UserModulePermission.objects.create(
                            user=user,
                            module_id=perm.get("module"),
                            submodule_id=perm.get("submodule"),
                            can_view=perm.get("can_view", True),
                            can_create=perm.get("can_create", False),
                            can_update=perm.get("can_update", False),
                            can_delete=perm.get("can_delete", False)
                        )

            # Retrieve updated user data
            updated_permissions = UserModulePermission.objects.filter(user=user).select_related("module", "submodule")
            updated_permissions_serializer = UserModulePermissionSerializer(updated_permissions, many=True)

            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_active": user.is_active,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "name": profile.name,
                "business_name": profile.business_name,
                "mobile_number": profile.mobile_number,
                "address": profile.address,
                "city": profile.city,
                "state": profile.state,
                "pin_code": profile.pin_code,
                "permissions": updated_permissions_serializer.data
            }

            return success_response(
                message="User info and permissions updated successfully.",
                data=user_data
            )

        except Exception as e:
            return error_response(f"Failed to update user details: {str(e)}", 500)
