from django.urls import path
from .views import *

urlpatterns = [
    # path("sync-orders/", SyncMyntraOrders.as_view()),
    # path("fetch-report/<int:job_id>/", FetchMyntraReport.as_view()),
    path("sync-orders/", SyncMyntraOrders.as_view()),
    path("orders/", MyntraOrdersList.as_view()),
    path("dashboard/", MyntraDashboard.as_view()),
]