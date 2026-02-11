from django.urls import path
from user_auth.apis.register import UserRegisterAPI
from user_auth.apis.login import UserLoginAPI
from user_auth.apis.profile import UserProfileAPI
from user_auth.apis.password import UserChangePasswordAPI
from user_auth.apis.forgot_password import UserForgotPasswordAPI
from user_auth.apis.reset_password import UserResetPasswordAPI
from user_auth.apis.update_profile import UserUpdateProfileAPI


urlpatterns = [
    path('register/', UserRegisterAPI.as_view()),
    path('login/', UserLoginAPI.as_view()),
    path('profile/', UserProfileAPI.as_view()),
    path("update-profile/", UserUpdateProfileAPI.as_view()),
    path('change-password/', UserChangePasswordAPI.as_view()),
    path('forgot-password/', UserForgotPasswordAPI.as_view()),
    path('reset-password/', UserResetPasswordAPI.as_view()),
]