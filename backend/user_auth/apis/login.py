from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

from subscription.models import UserSubscription
from user_auth.models import SubUser, AdminSubUser, UserModulePermission

try:
    from amazon_auth.models import AmazonAccount
except ImportError:
    AmazonAccount = None

try:
    from myntra.models import MyntraConnection
except ImportError:
    MyntraConnection = None


class UserLoginAPI(APIView):
    def get_connected_channels(self, obj):
        subuser = SubUser.objects.filter(user=obj).first()
        target_user = subuser.parent if subuser else obj
        channels = []
        if AmazonAccount and AmazonAccount.objects.filter(user=target_user).exists():
            channels.append("Amazon-India")
        if MyntraConnection and MyntraConnection.objects.filter(user=target_user).exists():
            channels.append("Myntra")
        return channels

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({
                "statusCode": 400,
                "status": False,
                "error": "email and password are required"
            }, status=status.HTTP_400_BAD_REQUEST)

        user_obj = User.objects.filter(email=email).first()

        if not user_obj:
            return Response({
                "statusCode": 401,
                "status": False,
                "error": "Invalid email or password"
            }, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(
            username=user_obj.username,
            password=password
        )

        if user is None:
            return Response({
                "statusCode": 401,
                "status": False,
                "error": "Invalid email or password"
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Check sub-user vs admin sub-user vs client user hierarchy
        subuser_obj = SubUser.objects.filter(user=user).first()
        admin_subuser_obj = AdminSubUser.objects.filter(user=user).first()

        is_admin_user = user.is_superuser or user.is_staff or (admin_subuser_obj is not None)
        is_sub_user = (subuser_obj is not None) or (admin_subuser_obj is not None)
        is_client_user = not is_admin_user and (subuser_obj is None)

        if admin_subuser_obj:
            user_role = admin_subuser_obj.role or "Admin"
        elif subuser_obj:
            user_role = subuser_obj.role or "Staff"
        elif user.is_superuser or user.is_staff:
            user_role = "Superadmin"
        else:
            user_role = "Client"

        # JWT tokens
        refresh = RefreshToken.for_user(user)

        # Subscription check (Admin users don't require client subscription)
        if is_admin_user:
            has_subscription = True
            subscription_status = "active"
            subscription_data = None
        else:
            subscription_user = subuser_obj.parent if (subuser_obj and subuser_obj.parent) else user
            sub = (
                UserSubscription.objects
                .select_related("plan")
                .prefetch_related("plan__modules", "plan__submodules__module")
                .filter(user=subscription_user)
                .order_by("-created_at")
                .first()
            )

            has_subscription = sub is not None and sub.status == "active"
            subscription_status = sub.status if sub else "no_subscription"
            subscription_data = None

            if sub and sub.plan:
                if subuser_obj:
                    # Filter modules and submodules according to sub-user's permissions
                    user_perms = UserModulePermission.objects.filter(user=user, can_view=True)
                    allowed_mod_ids = set(user_perms.values_list("module_id", flat=True))
                    allowed_submod_ids = set(user_perms.filter(submodule__isnull=False).values_list("submodule_id", flat=True))
                    module_level_mod_ids = set(user_perms.filter(submodule__isnull=True).values_list("module_id", flat=True))

                    modules_data = [
                        {
                            "module_id": module.id,
                            "module_name": module.name,
                            "slug": getattr(module, "slug", None),
                        }
                        for module in sub.plan.modules.all()
                        if module.id in allowed_mod_ids
                    ]

                    submodules_data = []
                    for submodule in sub.plan.submodules.select_related("module"):
                        mod_id = submodule.module.id if submodule.module else None
                        if submodule.id in allowed_submod_ids or (mod_id and mod_id in module_level_mod_ids):
                            submodules_data.append({
                                "submodule_id": submodule.id,
                                "submodule_name": submodule.name,
                                "slug": getattr(submodule, "slug", None),
                                "module_id": mod_id,
                                "module_name": submodule.module.name if submodule.module else None,
                            })
                else:
                    modules_data = [
                        {
                            "module_id": module.id,
                            "module_name": module.name,
                            "slug": getattr(module, "slug", None),
                        }
                        for module in sub.plan.modules.all()
                    ]
                    submodules_data = [
                        {
                            "submodule_id": submodule.id,
                            "submodule_name": submodule.name,
                            "slug": getattr(submodule, "slug", None),
                            "module_id": submodule.module.id if getattr(submodule, "module", None) else None,
                            "module_name": submodule.module.name if getattr(submodule, "module", None) else None,
                        }
                        for submodule in sub.plan.submodules.select_related("module")
                    ]

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

        profile_pic = None
        if hasattr(user, 'profile') and user.profile.profile_picture:
            url = user.profile.profile_picture.url
            profile_pic = request.build_absolute_uri(url) if request else url

        return Response({
            "statusCode": 200,
            "status": True,
            "message": "Login successful",
            "data": {
                "user_id": user.id,
                "email": user.email,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "profile_picture": profile_pic,
                "image": profile_pic,
                
                # User role and classification flags
                "is_staff": user.is_staff or is_admin_user,
                "is_superuser": user.is_superuser,
                "is_active": user.is_active,
                "is_client_user": is_client_user,
                "is_sub_user": is_sub_user,
                "role": user_role,

                # Connected channels
                "connected_channels": self.get_connected_channels(user),

                # Subscription details
                "has_subscription": has_subscription,
                "subscription_status": subscription_status,
                "subscription": subscription_data
            }
        }, status=status.HTTP_200_OK)
