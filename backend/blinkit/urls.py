from django.urls import path

from .views import BlinkitConnectAPIView, BlinkitProfitDebugAPIView, BlinkitUploadReportAPIView

urlpatterns = [
    path("connect/",BlinkitConnectAPIView.as_view(),name="blinkit-connect",), #for new connection
    path("upload/",BlinkitUploadReportAPIView.as_view(),name="blinkit-upload-report",), #use in finace to uoload this mannually
    path("profitability/debug/orders/",BlinkitProfitDebugAPIView.as_view(),name="blinkit-profit-debug-orders",),
]
