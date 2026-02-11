from django.urls import path
from admin_auth.apis.login import AdminLoginAPI
from admin_auth.apis.profile import AdminProfileAPI
from admin_auth.apis.password import (
    ChangePasswordAPI,
    ForgotPasswordAPI,
    ResetPasswordAPI
)

urlpatterns = [
    path('login/', AdminLoginAPI.as_view()),
    path('profile/', AdminProfileAPI.as_view()),
    path('change-password/', ChangePasswordAPI.as_view()),
    path('forgot-password/', ForgotPasswordAPI.as_view()),
    path('reset-password/', ResetPasswordAPI.as_view()),
]
