from django.urls import path
from user_auth.apis.register import UserRegisterAPI
from user_auth.apis.signup_otp import SendSignupOTPAPIView
from user_auth.apis.login import UserLoginAPI
from user_auth.apis.logout import UserLogoutAPI
from user_auth.apis.profile import UserProfileAPI
from user_auth.apis.password import UserChangePasswordAPI
from user_auth.apis.forgot_password import UserForgotPasswordAPI
from user_auth.apis.reset_password import UserResetPasswordAPI, RefreshTokenAPI, VerifyResetOTPAPI
from user_auth.apis.update_profile import UserUpdateProfileAPI
from user_auth.apis.admin_user_update import AdminUserDetailUpdateAPIView, AdminUserSoftDeleteAPIView
from user_auth.apis.admin_marketplace_integrations import AdminMarketplaceIntegrationsAPIView
from user_auth.apis.admin_payment_transactions import AdminPaymentTransactionsAPIView
from .views import *
from .subscription import *
from .privacy_policy import *
from .promocode  import *
from .module_submodule import *
from .notification import *
from .support_ticket import *
from .sub_user import *
from amazon_auth.growth_opportunities import GrowthOpportunitiesAPIView


from admin_auth.apis.api_logs import AdminApiLogsAPI
from admin_auth.apis.logout import AdminLogoutAPI

from user_auth.apis.contact_us import (
    PublicContactMessageAPIView,
    AdminContactMessageListAPIView,
    AdminContactMessageDetailAPIView
)

urlpatterns = [
    path('send-signup-otp/', SendSignupOTPAPIView.as_view(), name='send-signup-otp'),
    path('register/', UserRegisterAPI.as_view()),
    path('login/', UserLoginAPI.as_view()),
    path('logout/', UserLogoutAPI.as_view(), name='logout'),
    path('profile/', UserProfileAPI.as_view()),
    path('contact-us/', PublicContactMessageAPIView.as_view(), name='contact-us'),
    # path('growth-opportunities/', GrowthOpportunitiesAPIView.as_view(), name='user-growth-opportunities'),
    path("update-profile/", UserUpdateProfileAPI.as_view()),
    path('change-password/', UserChangePasswordAPI.as_view()),
    path('forgot-password/', UserForgotPasswordAPI.as_view()),
    path('verify-reset-otp/', VerifyResetOTPAPI.as_view(), name='verify-reset-otp'),
    path('reset-password/', UserResetPasswordAPI.as_view()),
    path('refresh-token/', RefreshTokenAPI.as_view(), name='refresh-token'),
    path('connected-accounts/', ConnectedMarketplacesView.as_view(), name='connected-accounts'),
    
    path('admin/logout/', AdminLogoutAPI.as_view(), name='admin-logout'),
    path('admin/dashboard/', AdminDashboardAPI.as_view(), name='admin-dashboard'),
    path('admin/api-logs/', AdminApiLogsAPI.as_view(), name='admin-api-logs'),
    path('admin/marketplace-integrations/', AdminMarketplaceIntegrationsAPIView.as_view(), name='admin-marketplace-integrations'),
    path('admin/payment-transactions/', AdminPaymentTransactionsAPIView.as_view(), name='admin-payment-transactions'),
    path('admin/contact-messages/', AdminContactMessageListAPIView.as_view(), name='admin-contact-messages'),
    path('admin/contact-messages/<int:pk>/', AdminContactMessageDetailAPIView.as_view(), name='admin-contact-message-detail'),
    
    path(
        "admin/user-list/",
        UserListAPIView.as_view(),
        name="user-list"
    ),
    path(
        "admin/main-users/<int:pk>/get-update/",
        AdminUserDetailUpdateAPIView.as_view(),
        name="admin-user-detail-update"
    ),
    path(
        "admin/main-users/<int:pk>/delete/",
        AdminUserSoftDeleteAPIView.as_view(),
        name="admin-user-delete"
    ),
    path(
        "admin/main-users/<int:pk>/soft-delete/",
        AdminUserSoftDeleteAPIView.as_view(),
        name="admin-user-soft-delete"
    ),
    
    
    #subscription plans
    path("subscription-plan/create/", SubscriptionPlanCreateView.as_view(), name="create-subscription-plan"),
    path("subscription-plan/list/", SubscriptionPlanListView.as_view(), name="create-subscription-plan-list"),
    path('subscription-plan/update/<int:pk>/', UpdateSubscriptionPlanAPI.as_view(), name='update-subscription-plan'),
    path('subscription-plan/delete/<int:pk>/', DeleteSubscriptionPlanAPI.as_view(), name='delete-subscription-plan'),
    
    
    path('privacy-policy-create/', LegalDocumentCreateView.as_view(), name='conditions-create'),
    path("privacy-policy/get-list/", LegalDocumentListView.as_view(), name="legal-doc-list"),
    path('privacy-policy/<int:id>/update/', LegalDocumentUpdateView.as_view(), name='legal-document-update'),
    path('privacy-policy/<int:id>/delete/', LegalDocumentDeleteView.as_view(), name='legal-document-delete'),
    path('legal-documents/title-choices/', LegalDocumentTitleChoicesView.as_view(), name='legal-document-title-choices'),
    
    
    path("promocodes/list/", PromocodeListAPIView.as_view(), name="promocode-list"),
    path("promocodes/validate/", ValidatePromocodeAPIView.as_view(), name="promocode-validate"),
    path("promocodes/create/", PromocodeCreateAPIView.as_view(), name="promocode-create"),
    path("promocodes/get/<int:pk>/", PromocodeDetailAPIView.as_view(), name="promocode-detail"),
    path("promocodes/update/<int:pk>/", PromocodeUpdateAPIView.as_view(), name="promocode-update"),
    path("promocodes/delete/<int:pk>/", PromocodeDeleteAPIView.as_view(), name="promocode-delete"),
    
    # path('notification-list/', AdminNotificationListAPIView.as_view(), name='notification-list/'),
    # path('notification-count/', AdminNotificationUnreadCountAPIView.as_view(), name='notification-count/'),
    
    path(
        "notifications/create/",
        CreateNotificationAPIView.as_view(),
        name="create-notification"
    ),

    # admin Notification List 
    path(
        "notifications/",
        AdminNotificationListAPIView.as_view(),
        name="notification-list"
    ),
    
    path(
        "admin/notifications/delete/<int:pk>/",
        DeleteNotificationAPIView.as_view(),
        name="delete-notification"
    ),
    
    # User Notification List 
    path(
        "user-notifications/",
        UserNotificationListAPIView.as_view(),
        name="notification-list"
    ),
    
    

    # Mark Notification Read
    path(
        "notifications/read/<int:pk>/",
        MarkNotificationReadAPIView.as_view(),
        name="mark-notification-read"
    ),
    
    path("modules/create/", CreateModuleAPIView.as_view()),
    path("modules/list/", ModuleListAPIView.as_view()),
    path("modules/<int:pk>/", ModuleDetailAPIView.as_view()),
    path("modules/<int:pk>/update/", UpdateModuleAPIView.as_view()),
    path("modules/<int:pk>/delete/", DeleteModuleAPIView.as_view()),
    path("modules-with-submodules/", ModuleWithSubModulesAPIView.as_view()),

    # SubModules
    path("submodules/create/", CreateSubModuleAPIView.as_view()),
    path("submodules/list/", SubModuleListAPIView.as_view()),
    path("submodules/<int:pk>/update/", UpdateSubModuleAPIView.as_view()),
    path("submodules/<int:pk>/delete/", DeleteSubModuleAPIView.as_view()),

    # Permissions
    path("permissions/assign/", AssignPermissionAPIView.as_view()),
    path("permissions/list/", PermissionListAPIView.as_view()),
    path("permissions/<int:pk>/update/", UpdatePermissionAPIView.as_view()),
    path("permissions/<int:pk>/delete/", DeletePermissionAPIView.as_view()),
    # Logged-in User
    path("my-modules/", MyModulesAPIView.as_view()),

    # Support Tickets (User)
    path("user-tickets/create/", UserSupportTicketCreateAPIView.as_view(), name="user-ticket-list-create"),
    path("user-tickets/list/", UserSupportTicketListAPIView.as_view(), name="user-ticket-list"),
    path("user-tickets/<int:pk>/", UserSupportTicketDetailAPIView.as_view(), name="user-ticket-detail"),

    # Support Tickets (Admin)
    path("admin/support-tickets/", AdminSupportTicketListAPIView.as_view(), name="admin-ticket-list"),
    path("admin/tickets/<int:pk>/update/", AdminSupportTicketUpdateAPIView.as_view(), name="admin-ticket-update"),

    # Sub-users
    path("sub-users/create/", SubUserCreateAPIView.as_view(), name="sub-user-create"),
    path("sub-users/list/", SubUserListAPIView.as_view(), name="sub-user-list"),
    path("sub-users/get/<int:pk>/", SubUserDetailAPIView.as_view(), name="sub-user-get"),
    path("sub-users/update/<int:pk>/", SubUserUpdateAPIView.as_view(), name="sub-user-update"),
    path("sub-users/delete/<int:pk>/", SubUserDeleteAPIView.as_view(), name="sub-user-delete"),
    path("sub-users/<int:pk>/login/", SubUserLoginAPIView.as_view(), name="sub-user-login"),
    path("sub-users/", SubUserListCreateAPIView.as_view(), name="sub-user-list-create"),
    path("sub-users/<int:pk>/", SubUserDetailUpdateDeleteAPIView.as_view(), name="sub-user-detail"),
]