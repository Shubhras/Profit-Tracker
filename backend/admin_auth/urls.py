from django.urls import path
from admin_auth.apis.login import AdminLoginAPI
from admin_auth.apis.logout import AdminLogoutAPI
from admin_auth.apis.subuser_login import AdminSubUserLoginAPI
from admin_auth.apis.profile import AdminProfileAPI
from admin_auth.apis.password import (
    ChangePasswordAPI,
    ForgotPasswordAPI,
    ResetPasswordAPI
)

from admin_auth.apis.api_logs import AdminApiLogsAPI

urlpatterns = [
    path('login/', AdminLoginAPI.as_view()),
    path('logout/', AdminLogoutAPI.as_view(), name='admin-logout'),
    path('subuser-login/', AdminSubUserLoginAPI.as_view(), name='admin-subuser-login'),
    path('profile/', AdminProfileAPI.as_view()),
    path('change-password/', ChangePasswordAPI.as_view()),
    path('forgot-password/', ForgotPasswordAPI.as_view()),
    path('reset-password/', ResetPasswordAPI.as_view()),
    path('api-logs/', AdminApiLogsAPI.as_view(), name='admin-api-logs'),
]
