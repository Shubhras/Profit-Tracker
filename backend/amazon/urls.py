from django.urls import path
from .views import *

urlpatterns = [
    path("callback/", amazon_callback),
    path("test/", test_amazon_connection),
    path("orders/", fetch_orders),
    path("dashboard/", dashboard),
    path("finances/", fetch_finances),
    path("saved-orders/", get_saved_orders),
]