from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.db import transaction
from user_auth.models import SubUser, UserProfile, UserModulePermission,Module,SubModule
from user_auth.serializers import SubUserSerializer, SubUserPermissionInputSerializer
from user_auth.subscription import CustomPagination
class IsParentUser(BasePermission):
    """
    Allows access only to parent users (not registered in the SubUser model).
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            not SubUser.objects.filter(user=request.user).exists()
        )


class SubUserListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsParentUser]

    def get(self, request):
        try:
            queryset = SubUser.objects.filter(parent=request.user).order_by("-created_at")
            paginator = CustomPagination()
            paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)
            serializer = SubUserSerializer(paginated_queryset, many=True)
            return paginator.get_paginated_response({
                "statusCode": 200,
                "status": True,
                "message": "Sub-users fetched successfully.",
                "data": serializer.data
            })
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        name = request.data.get("name")
        mobile_number = request.data.get("mobile_number")
        permissions_data = request.data.get("permissions", [])

        if not email or not password or not name or not mobile_number:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Email, password, name, and mobile_number are required fields."
            }, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "A user with this email already exists."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate permissions format
        perm_serializer = SubUserPermissionInputSerializer(data=permissions_data, many=True)
        if not perm_serializer.is_valid():
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Invalid permissions format.",
                "errors": perm_serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Create Django auth User
                new_user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password
                )

                # Inherit business details from Parent's Profile
                try:
                    parent_profile = request.user.profile
                    business_name = parent_profile.business_name
                    address = parent_profile.address
                    city = parent_profile.city
                    state = parent_profile.state
                    pin_code = parent_profile.pin_code
                except UserProfile.DoesNotExist:
                    business_name = ""
                    address = ""
                    city = ""
                    state = ""
                    pin_code = ""

                # Create UserProfile
                UserProfile.objects.create(
                    user=new_user,
                    name=name,
                    mobile_number=mobile_number,
                    business_name=business_name,
                    address=address,
                    city=city,
                    state=state,
                    pin_code=pin_code,
                    accepted_terms=True
                )

                # Create SubUser model instance
                sub_user_obj = SubUser.objects.create(
                    user=new_user,
                    parent=request.user,
                    name=name,
                    mobile_number=mobile_number
                )

                # Assign permissions
                from rest_framework.exceptions import ValidationError

                for perm in perm_serializer.validated_data:

                    try:
                        module = Module.objects.get(id=perm["module"])
                    except Module.DoesNotExist:
                        raise ValidationError(
                            {"module": f"Module {perm['module']} does not exist."}
                        )

                    submodule = None

                    if perm.get("submodule"):

                        try:
                            submodule = SubModule.objects.get(
                                id=perm["submodule"],
                                module=module
                            )
                        except SubModule.DoesNotExist:
                            raise ValidationError(
                                {
                                    "submodule": f"SubModule {perm['submodule']} does not belong to Module {module.id}."
                                }
                            )

                    UserModulePermission.objects.create(
                        user=new_user,
                        module=module,
                        submodule=submodule,
                        can_view=perm.get("can_view", True),
                        can_create=perm.get("can_create", False),
                        can_update=perm.get("can_update", False),
                        can_delete=perm.get("can_delete", False),
                    )

                serializer = SubUserSerializer(sub_user_obj)
                return Response({
                    "statusCode": 201,
                    "status": True,
                    "message": "Sub-user created successfully.",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Failed to create sub-user: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubUserDetailUpdateDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated, IsParentUser]

    def get(self, request, pk):
        try:
            subuser = SubUser.objects.get(pk=pk, parent=request.user)
            serializer = SubUserSerializer(subuser)
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Sub-user details fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except SubUser.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Sub-user not found."
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, pk):
        try:
            subuser = SubUser.objects.get(pk=pk, parent=request.user)
        except SubUser.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Sub-user not found."
            }, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get("name")
        mobile_number = request.data.get("mobile_number")
        password = request.data.get("password")
        permissions_data = request.data.get("permissions")

        # Validate permissions if provided
        validated_perms = None
        if permissions_data is not None:
            perm_serializer = SubUserPermissionInputSerializer(data=permissions_data, many=True)
            if not perm_serializer.is_valid():
                return Response({
                    "statusCode": 400,
                    "status": False,
                    "message": "Invalid permissions format.",
                    "errors": perm_serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            validated_perms = perm_serializer.validated_data

        try:
            with transaction.atomic():
                if name:
                    subuser.name = name
                    try:
                        profile = subuser.user.profile
                        profile.name = name
                        profile.save()
                    except UserProfile.DoesNotExist:
                        pass

                if mobile_number:
                    subuser.mobile_number = mobile_number
                    try:
                        profile = subuser.user.profile
                        profile.mobile_number = mobile_number
                        profile.save()
                    except UserProfile.DoesNotExist:
                        pass

                subuser.save()

                if password:
                    subuser.user.set_password(password)
                    subuser.user.save()

                if validated_perms is not None:
                    # Clear and recreate permissions
                    UserModulePermission.objects.filter(user=subuser.user).delete()
                    for perm in validated_perms:
                        UserModulePermission.objects.create(
                            user=subuser.user,
                            module_id=perm.get("module"),
                            submodule_id=perm.get("submodule"),
                            can_view=perm.get("can_view", True),
                            can_create=perm.get("can_create", False),
                            can_update=perm.get("can_update", False),
                            can_delete=perm.get("can_delete", False)
                        )

                serializer = SubUserSerializer(subuser)
                return Response({
                    "statusCode": 200,
                    "status": True,
                    "message": "Sub-user updated successfully.",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Failed to update sub-user: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            subuser = SubUser.objects.get(pk=pk, parent=request.user)
            # Cascade delete user (also deletes profile and SubUser instance)
            subuser.user.delete()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Sub-user deleted successfully."
            }, status=status.HTTP_200_OK)
        except SubUser.DoesNotExist:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Sub-user not found."
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
