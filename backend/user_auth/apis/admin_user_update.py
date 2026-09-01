import logging
from django.contrib.auth.models import User
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status

from subscription.utils.custom_response import success_response, error_response
from subscription.models import UserSubscription
from user_auth.models import UserProfile, UserModulePermission, Module, SubModule, SubUser
from user_auth.serializers import (
    UserProfileUpdateSerializer,
    SubUserPermissionInputSerializer,
    UserModulePermissionSerializer,
    SubUserSerializer
)

logger = logging.getLogger(__name__)


from core.email_utils import get_email_logo_header_html, send_email_with_logo

def send_user_deactivation_email(user_email, user_name=""):
    """
    Sends an email notification to the user when their account is deactivated/soft-deleted by admin.
    """
    subject = "TrackMyProfit - Account Status Deactivated"
    display_name = user_name or user_email

    plain_message = f"""
Hello {display_name},

This is to inform you that your TrackMyProfit account ({user_email}) has been deactivated by the system administrator.

If you believe this is an error or require further assistance, please contact our support team at support@trackmyprofit.com.

Best regards,
TrackMyProfit Team
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
        .notice-box {{ background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0; color: #991b1b; }}
        .footer {{ text-align: center; margin-top: 25px; color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        {logo_header}
        <div class="content">
            <p>Hello <strong>{display_name}</strong>,</p>
            <p>This is to inform you that your TrackMyProfit user account (<strong>{user_email}</strong>) has been deactivated by an administrator.</p>
            
            <div class="notice-box">
                <strong>Account Deactivated:</strong> Access to your dashboard and integrated marketplace services has been temporarily disabled.
            </div>
            
            <p>If you have any questions or believe this was done in error, please reach out to our support team.</p>
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
            fail_silently=True
        )
        logger.info(f"Deactivation email sent successfully to {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send deactivation email to {user_email}: {str(e)}")
        return False


def get_user_subscription_data(user):
    active_subscription = (
        UserSubscription.objects
        .filter(
            user=user,
            status="active",
            is_paid=True
        )
        .select_related("plan")
        .order_by("-created_at")
        .first()
    )

    if not active_subscription:
        active_subscription = (
            UserSubscription.objects
            .filter(user=user)
            .select_related("plan")
            .order_by("-created_at")
            .first()
        )

    if not active_subscription:
        return None

    return {
        "subscription_id": active_subscription.id,
        "plan_id": active_subscription.plan.id if active_subscription.plan else None,
        "plan_name": active_subscription.plan.plan_name if active_subscription.plan else None,
        "billing_cycle": active_subscription.billing_cycle,
        "amount": active_subscription.amount,
        "status": active_subscription.status,
        "is_paid": active_subscription.is_paid,
        "start_date": active_subscription.start_date,
        "end_date": active_subscription.end_date,
        "razorpay_subscription_id": active_subscription.razorpay_subscription_id,
        "razorpay_payment_id": active_subscription.razorpay_payment_id,
    }


def get_user_sub_users_data(user):
    sub_users = SubUser.objects.filter(parent=user).order_by("-created_at")
    return SubUserSerializer(sub_users, many=True).data


def get_user_connected_channels(user):
    channels = []

    try:
        from amazon_auth.models import AmazonAccount
        amz_accounts = AmazonAccount.objects.filter(user=user)
        for acc in amz_accounts:
            channels.append({
                "channel": "Amazon",
                "identifier": acc.seller_central_id or acc.store_name or f"Seller #{acc.id}",
                "status": "Connected" if (acc.refresh_token_encrypted or acc.amazon_refresh_token) else "Disconnected",
                "connected_at": acc.created_at
            })
    except (ImportError, Exception):
        pass

    try:
        from amazon_ads.models import AmazonAdsAccount
        ads_accounts = AmazonAdsAccount.objects.filter(user=user,is_primary=True)
        for acc in ads_accounts:
            channels.append({
                "channel": "Amazon Ads",
                "identifier": str(acc.profile_id or f"Profile #{acc.id}"),
                "status": "Connected" if (acc.access_token or acc.refresh_token) else "Disconnected",
                "connected_at": acc.created_at
            })
    except (ImportError, Exception):
        pass

    try:
        from myntra.models import MyntraConnection
        myntra_connections = MyntraConnection.objects.filter(user=user)
        for conn in myntra_connections:
            channels.append({
                "channel": "Myntra",
                "identifier": conn.merchant_id or f"Merchant #{conn.id}",
                "status": "Connected" if (conn.access_token or conn.secret_key) else "Disconnected",
                "connected_at": conn.created_at
            })
    except (ImportError, Exception):
        pass

    try:
        from blinkit.models import BlinkitAccount
        blinkit_accounts = BlinkitAccount.objects.filter(user=user)
        for acc in blinkit_accounts:
            channels.append({
                "channel": "Blinkit",
                "identifier": getattr(acc, "store_name", None) or f"Account #{acc.id}",
                "status": "Connected",
                "connected_at": getattr(acc, "created_at", None)
            })
    except (ImportError, Exception):
        pass

    return channels


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
            "subscription": get_user_subscription_data(user),
            "sub_users": get_user_sub_users_data(user),
            "connected_channels": get_user_connected_channels(user),
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
                "subscription": get_user_subscription_data(user),
                "sub_users": get_user_sub_users_data(user),
                "connected_channels": get_user_connected_channels(user),
                "permissions": updated_permissions_serializer.data
            }

            return success_response(
                message="User info and permissions updated successfully.",
                data=user_data
            )

        except Exception as e:
            return error_response(f"Failed to update user details: {str(e)}", 500)

    def delete(self, request, pk):
        return AdminUserSoftDeleteAPIView().delete(request, pk)


class AdminUserSoftDeleteAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return error_response("User not found", 404)

        if user.is_superuser:
            return error_response("Superuser accounts cannot be deactivated or soft deleted.", 400)

        try:
            with transaction.atomic():
                user.is_active = False
                user.save()

                if hasattr(user, 'profile') and user.profile:
                    user.profile.subscription_active = False
                    user.profile.is_paid_subscription_active = False
                    user.profile.subscription_status = 'inactive'
                    user.profile.save()

                # Deactivate sub-users linked to this parent account
                subuser_user_ids = SubUser.objects.filter(parent=user).values_list('user_id', flat=True)
                User.objects.filter(id__in=subuser_user_ids).update(is_active=False)

            user_name = user.profile.name if hasattr(user, 'profile') and user.profile else user.username
            email_sent = send_user_deactivation_email(user_email=user.email, user_name=user_name)

            return success_response(
                message="User deleted successfully.",
                data={
                    "user_id": user.id,
                    "email": user.email,
                    "is_active": user.is_active,
                    "email_sent": email_sent
                }
            )
        except Exception as e:
            return error_response(f"Failed to delete user: {str(e)}", 500)

    def post(self, request, pk):
        return self.delete(request, pk)


