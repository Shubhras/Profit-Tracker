import re
import logging
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.db import models, transaction
from django.core.mail import send_mail
from django.conf import settings

from user_auth.models import SubUser, AdminSubUser, UserProfile, UserModulePermission, Module, SubModule
from user_auth.serializers import SubUserSerializer, AdminSubUserSerializer, SubUserPermissionInputSerializer
from user_auth.subscription import CustomPagination
from rest_framework_simplejwt.tokens import RefreshToken
from subscription.models import UserSubscription

logger = logging.getLogger(__name__)

PASSWORD_REGEX = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$')


def validate_password_strength(password):
    if not PASSWORD_REGEX.match(password):
        return False, "Password must be at least 12 characters and include uppercase, lowercase, number, and special character."
    return True, None


from core.email_utils import get_email_logo_header_html, send_email_with_logo

def send_subuser_credentials_email(user_email, user_name, password, parent_name="", business_name="", is_update=False):
    """
    Sends credentials email to sub-user upon creation or password update.
    """
    sender_info = business_name or parent_name or "TrackMyProfit Team"
    
    if is_update:
        subject = "TrackMyProfit - Your Password Has Been Updated"
        action_text = "Your account password has been updated by your primary administrator."
    else:
        subject = "Welcome to TrackMyProfit - Your Account Credentials"
        action_text = f"You have been added as a team user under <strong>{sender_info}</strong>."

    plain_message = f"""
Hello {user_name},

{action_text.replace('<strong>', '').replace('</strong>', '')}

Here are your account credentials to log in:
- Email: {user_email}
- Password: {password}

Login Link: https://trackmyprofit.com/auth/login

Best regards,
{sender_info}
"""

    logo_header = get_email_logo_header_html("TrackMyProfit")

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }}
        .container {{ max-width: 560px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .header {{ text-align: center; padding-bottom: 20px; border-bottom: 2px solid #eef2f5; }}
        .content {{ padding: 20px 0; color: #334155; line-height: 1.6; }}
        .cred-box {{ background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }}
        .cred-item {{ margin: 8px 0; font-size: 15px; }}
        .cred-label {{ font-weight: 600; color: #475569; }}
        .btn {{ display: inline-block; background-color: #0d9488; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px; text-align: center; }}
        .footer {{ text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        {logo_header}
        <div class="content">
            <p>Hello <strong>{user_name}</strong>,</p>
            <p>{action_text}</p>
            <p>You can access your account using the credentials below:</p>
            
            <div class="cred-box">
                <div class="cred-item"><span class="cred-label">Email:</span> {user_email}</div>
                <div class="cred-item"><span class="cred-label">Password:</span> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">{password}</code></div>
            </div>
            
            <div style="text-align: center;">
                <a href="https://trackmyprofit.com/auth/login" class="btn">Log In to TrackMyProfit</a>
            </div>
        </div>
        <div class="footer">
            <p>This is an automated notification from TrackMyProfit.</p>
        </div>
    </div>
</body>
</html>
"""

    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@trackmyprofit.com')
        send_email_with_logo(
            subject=subject,
            plain_message=plain_message,
            html_message=html_message,
            recipient_list=[user_email],
            from_email=from_email,
            fail_silently=False
        )
        logger.info(f"Sub-user credentials email sent successfully to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send sub-user credentials email to {user_email}: {str(e)}")
        return False


class IsParentUser(BasePermission):
    """
    Allows access only to parent users (not registered in SubUser or AdminSubUser models).
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            not SubUser.objects.filter(user=request.user).exists() and
            not AdminSubUser.objects.filter(user=request.user).exists()
        )


class SubUserCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsParentUser]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        name = request.data.get("name")
        mobile_number = request.data.get("mobile_number")
        permissions_data = request.data.get("permissions", [])

        role = request.data.get("role") or "Staff"

        if not email or not password or not name or not mobile_number:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": "Email, password, name, and mobile_number are required fields."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Password strength validation
        is_valid_pw, pw_error = validate_password_strength(password)
        if not is_valid_pw:
            return Response({
                "statusCode": 400,
                "status": False,
                "message": pw_error
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
            parent_profile = getattr(request.user, "profile", None)
            parent_name = parent_profile.name if parent_profile else request.user.username
            business_name = parent_profile.business_name if parent_profile else ""
            address = parent_profile.address if parent_profile else ""
            city = parent_profile.city if parent_profile else ""
            state = parent_profile.state if parent_profile else ""
            pin_code = parent_profile.pin_code if parent_profile else ""

            with transaction.atomic():
                # Create Django auth User
                new_user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password
                )

                if request.user.is_staff or request.user.is_superuser or role in ["Admin", "Staff"]:
                    new_user.is_staff = True
                    new_user.save()

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

                # Create SubUser or AdminSubUser model instance based on role/privilege
                is_admin_creation = request.user.is_staff or request.user.is_superuser or role in ["Admin"]
                if is_admin_creation:
                    sub_user_obj = AdminSubUser.objects.create(
                        user=new_user,
                        parent=request.user,
                        name=name,
                        mobile_number=mobile_number,
                        role=role
                    )
                else:
                    sub_user_obj = SubUser.objects.create(
                        user=new_user,
                        parent=request.user,
                        name=name,
                        mobile_number=mobile_number,
                        role=role
                    )

                # Assign permissions
                for perm in perm_serializer.validated_data:
                    module_id = perm.get("module")
                    submodule_id = perm.get("submodule")

                    module_obj = None
                    if module_id:
                        try:
                            module_obj = Module.objects.get(id=module_id)
                        except Module.DoesNotExist:
                            pass

                    submodule_obj = None
                    if submodule_id and module_obj:
                        try:
                            submodule_obj = SubModule.objects.get(id=submodule_id, module=module_obj)
                        except SubModule.DoesNotExist:
                            pass

                    if module_obj:
                        UserModulePermission.objects.create(
                            user=new_user,
                            module=module_obj,
                            submodule=submodule_obj,
                            can_view=perm.get("can_view", True),
                            can_create=perm.get("can_create", False),
                            can_update=perm.get("can_update", False),
                            can_delete=perm.get("can_delete", False),
                        )

            # Send email with credentials
            email_sent = send_subuser_credentials_email(
                user_email=email,
                user_name=name,
                password=password,
                parent_name=parent_name,
                business_name=business_name,
                is_update=False
            )

            serializer = AdminSubUserSerializer(sub_user_obj) if isinstance(sub_user_obj, AdminSubUser) else SubUserSerializer(sub_user_obj)
            res_data = serializer.data
            res_data["email_sent"] = email_sent

            return Response({
                "statusCode": 201,
                "status": True,
                "message": "Sub-user created successfully and credentials email dispatched.",
                "data": res_data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Failed to create sub-user: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubUserListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsParentUser]

    def get(self, request):
        try:
            search_query = request.query_params.get("search") or request.query_params.get("q")
            if request.user.is_staff or request.user.is_superuser:
                base_queryset = AdminSubUser.objects.filter(
                    models.Q(parent=request.user) | models.Q(user__is_staff=True)
                ).distinct()
                use_admin_serializer = True
            else:
                base_queryset = SubUser.objects.filter(parent=request.user)
                use_admin_serializer = False

            total_users = base_queryset.count()
            active_users = base_queryset.filter(user__is_active=True).count()
            pending_users = base_queryset.filter(user__is_active=False).count()
            owner_users = 1

            queryset = base_queryset
            if search_query:
                queryset = queryset.filter(
                    models.Q(name__icontains=search_query) | 
                    models.Q(user__email__icontains=search_query) |
                    models.Q(mobile_number__icontains=search_query)
                )

            queryset = queryset.order_by("-created_at")
            serializer = AdminSubUserSerializer(queryset, many=True) if use_admin_serializer else SubUserSerializer(queryset, many=True)

            summary = {
                "total_users": total_users,
                "active_users": active_users,
                "pending_users": pending_users,
                "owner_users": owner_users,
            }

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Sub-users fetched successfully.",
                "summary": summary,
                "total_users": total_users,
                "active_users": active_users,
                "pending_users": pending_users,
                "owner_users": owner_users,
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_subuser_instance(pk, parent_user):
    """
    Utility to fetch subuser instance from AdminSubUser or SubUser models.
    Returns (instance, is_admin_subuser).
    """
    admin_sub = AdminSubUser.objects.filter(pk=pk).first()
    if admin_sub and (admin_sub.parent == parent_user or parent_user.is_staff or parent_user.is_superuser):
        return admin_sub, True

    sub = SubUser.objects.filter(pk=pk).first()
    if sub and (sub.parent == parent_user or parent_user.is_staff or parent_user.is_superuser):
        return sub, False

    return None, False


class SubUserDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsParentUser]

    def get(self, request, pk):
        try:
            subuser, is_admin = get_subuser_instance(pk, request.user)
            if not subuser:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Sub-user not found."
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = AdminSubUserSerializer(subuser) if is_admin else SubUserSerializer(subuser)
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Sub-user details fetched successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubUserUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsParentUser]

    def put(self, request, pk):
        subuser, is_admin = get_subuser_instance(pk, request.user)
        if not subuser:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Sub-user not found."
            }, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get("name")
        mobile_number = request.data.get("mobile_number")
        password = request.data.get("password")
        role = request.data.get("role")
        permissions_data = request.data.get("permissions")

        # Validate password if provided
        if password:
            is_valid_pw, pw_error = validate_password_strength(password)
            if not is_valid_pw:
                return Response({
                    "statusCode": 400,
                    "status": False,
                    "message": pw_error
                }, status=status.HTTP_400_BAD_REQUEST)

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
            email_sent = False
            with transaction.atomic():
                if name:
                    subuser.name = name
                    try:
                        profile = subuser.user.profile
                        profile.name = name
                        profile.save()
                    except UserProfile.DoesNotExist:
                        pass

                if role:
                    subuser.role = role

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
                        module_id = perm.get("module")
                        submodule_id = perm.get("submodule")
                        if module_id:
                            UserModulePermission.objects.create(
                                user=subuser.user,
                                module_id=module_id,
                                submodule_id=submodule_id,
                                can_view=perm.get("can_view", True),
                                can_create=perm.get("can_create", False),
                                can_update=perm.get("can_update", False),
                                can_delete=perm.get("can_delete", False)
                            )

            if password:
                parent_profile = getattr(request.user, "profile", None)
                parent_name = parent_profile.name if parent_profile else request.user.username
                business_name = parent_profile.business_name if parent_profile else ""
                email_sent = send_subuser_credentials_email(
                    user_email=subuser.user.email,
                    user_name=subuser.name,
                    password=password,
                    parent_name=parent_name,
                    business_name=business_name,
                    is_update=True
                )

            serializer = AdminSubUserSerializer(subuser) if is_admin else SubUserSerializer(subuser)
            res_data = serializer.data
            if password:
                res_data["email_sent"] = email_sent

            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Sub-user updated successfully.",
                "data": res_data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Failed to update sub-user: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, pk):
        return self.put(request, pk)

    def post(self, request, pk):
        return self.put(request, pk)


class SubUserDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated, IsParentUser]

    def delete(self, request, pk):
        try:
            subuser, _ = get_subuser_instance(pk, request.user)
            if not subuser:
                return Response({
                    "statusCode": 404,
                    "status": False,
                    "message": "Sub-user not found."
                }, status=status.HTTP_404_NOT_FOUND)

            # Cascade delete user (also deletes profile and SubUser/AdminSubUser instance)
            subuser.user.delete()
            return Response({
                "statusCode": 200,
                "status": True,
                "message": "Sub-user deleted successfully."
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "statusCode": 500,
                "status": False,
                "message": f"Internal server error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, pk):
        return self.delete(request, pk)


# Legacy multi-verb views kept for backward compatibility
class SubUserListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, IsParentUser]

    def get(self, request):
        return SubUserListAPIView().get(request)

    def post(self, request):
        return SubUserCreateAPIView().post(request)


class SubUserDetailUpdateDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated, IsParentUser]

    def get(self, request, pk):
        return SubUserDetailAPIView().get(request, pk)

    def put(self, request, pk):
        return SubUserUpdateAPIView().put(request, pk)

    def patch(self, request, pk):
        return SubUserUpdateAPIView().patch(request, pk)

    def delete(self, request, pk):
        return SubUserDeleteAPIView().delete(request, pk)


class SubUserLoginAPIView(APIView):
    """
    API for Parent Client User to directly log in as one of their sub-users.
    Returns JWT tokens and filtered subscription modules/submodules matching the sub-user's permissions.
    """
    permission_classes = [IsAuthenticated, IsParentUser]

    def post(self, request, pk):
        subuser, _ = get_subuser_instance(pk, request.user)
        if not subuser:
            return Response({
                "statusCode": 404,
                "status": False,
                "message": "Sub-user not found or does not belong to your account."
            }, status=status.HTTP_404_NOT_FOUND)

        target_user = subuser.user
        refresh = RefreshToken.for_user(target_user)

        # Get parent's active subscription
        sub = (
            UserSubscription.objects
            .select_related("plan")
            .prefetch_related("plan__modules", "plan__submodules__module")
            .filter(user=request.user, status="active", is_paid=True)
            .order_by("-created_at")
            .first()
        )

        # Filter modules and submodules according to sub-user's permissions
        user_perms = UserModulePermission.objects.filter(user=target_user, can_view=True)
        allowed_mod_ids = set(user_perms.values_list("module_id", flat=True))
        allowed_submod_ids = set(user_perms.filter(submodule__isnull=False).values_list("submodule_id", flat=True))
        module_level_mod_ids = set(user_perms.filter(submodule__isnull=True).values_list("module_id", flat=True))

        has_subscription = sub is not None and sub.status == "active"
        subscription_data = None

        if sub and sub.plan:
            modules_data = []
            for module in sub.plan.modules.all():
                if module.id in allowed_mod_ids:
                    modules_data.append({
                        "module_id": module.id,
                        "module_name": module.name,
                        "slug": getattr(module, "slug", None),
                    })

            submodules_data = []
            for submodule in sub.plan.submodules.all():
                mod_id = submodule.module.id if submodule.module else None
                if submodule.id in allowed_submod_ids or (mod_id and mod_id in module_level_mod_ids):
                    submodules_data.append({
                        "submodule_id": submodule.id,
                        "submodule_name": submodule.name,
                        "slug": getattr(submodule, "slug", None),
                        "module_id": mod_id,
                        "module_name": submodule.module.name if submodule.module else None,
                    })

            subscription_data = {
                "subscription_id": sub.id,
                "plan_id": sub.plan.id,
                "plan_name": sub.plan.plan_name,
                "slug": sub.plan.slug,
                "billing_cycle": sub.billing_cycle,
                "status": sub.status,
                "start_date": sub.start_date,
                "end_date": sub.end_date,
                "amount": sub.amount,
                "modules": modules_data,
                "submodules": submodules_data
            }

        return Response({
            "statusCode": 200,
            "status": True,
            "message": f"Successfully logged in as sub-user {subuser.name}",
            "data": {
                "user_id": target_user.id,
                "email": target_user.email,
                "name": subuser.name,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_staff": target_user.is_staff,
                "is_superuser": target_user.is_superuser,
                "is_active": target_user.is_active,
                "is_client_user": False,
                "is_sub_user": True,
                "role": subuser.role or "Staff",
                "has_subscription": has_subscription,
                "subscription_status": sub.status if sub else "no_subscription",
                "subscription": subscription_data
            }
        }, status=status.HTTP_200_OK)

