from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('connect/', views.amazon_connect, name='amazon_connect'),
    # path('auth/login/', views.amazon_auth_login, name='amazon_auth_login'),
    path('callback/', views.amazon_callback, name='amazon_callback'),
    

]
