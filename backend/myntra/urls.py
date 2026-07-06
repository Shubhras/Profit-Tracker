from django.urls import path
from .views import *
from .views_v4 import SyncMyntraDetailsView

urlpatterns = [
    # path("sync-orders/", SyncMyntraOrders.as_view()),
    # path("fetch-report/<int:job_id>/", FetchMyntraReport.as_view()),
    path("sync-orders/", SyncMyntraOrders.as_view()),
    path("upload-orders/", UploadMyntraOrders.as_view()),
    path("connection/", MyntraConnectionView.as_view()),
    path("orders/", MyntraOrdersList.as_view()),
    path("dashboard/", MyntraDashboard.as_view()),
    path("sync-details/", SyncMyntraDetailsView.as_view(), name="myntra-sync-details"),
]
