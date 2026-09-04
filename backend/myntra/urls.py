from django.urls import path

from myntra.amazon_adapter import MyntraAmazonOrderSummaryAPIView, MyntraAmazonSKUSummaryAPIView, MyntraAmazonStyleSummaryAPIView
from myntra.profit import (
    MyntraOrderSummaryAPIView,
    MyntraSKUSummaryAPIView,
    MyntraStyleSummaryAPIView,
)
from myntra.services.profit.style_summary import StyleSummary

from .views import *
from .views_v4 import (
    DownloadReportAPIView,
    FetchReportAPIView,
    MyntraPaymentCSVAPIView,
    MyntraPaymentHistoryAPIView,
    MyntraProfitExportAPIView,
    MyntraProfitValidationExportAPIView,
    ListUploadedReportsAPIView,
    ScheduleReportAPIView,
    SyncMyntraCatalogImagesAPIView,
    SyncMyntraDetailsView,
    UploadMyntraOrderReportAPIView,
    UploadMyntraPaymentReportAPIView,
    UploadMyntraReturnReportAPIView,
)

urlpatterns = [
    # path("sync-orders/", SyncMyntraOrders.as_view()),
    # path("fetch-report/<int:job_id>/", FetchMyntraReport.as_view()),
    path("sync-orders/", SyncMyntraOrders.as_view()),
    path("sync-catalog-images/", SyncMyntraCatalogImagesAPIView.as_view(), name="myntra-sync-catalog-images"),

    path("upload-orders/", UploadMyntraOrders.as_view()),
    path("connection/", MyntraConnectionView.as_view()),
    path("orders/", MyntraOrdersList.as_view()),
    path("dashboard/", MyntraDashboard.as_view()),
    path("sync-details/", SyncMyntraDetailsView.as_view(), name="myntra-sync-details"),
    path(
        "profit/style/",
        MyntraStyleSummaryAPIView.as_view(),
        name="myntra-style-summary",
    ),
    path(
        "profit/sku/<str:style_id>/",
        MyntraSKUSummaryAPIView.as_view(),
        name="myntra-sku-summary",
    ),
    path(
        "profit/order/<str:seller_sku>/",
        MyntraOrderSummaryAPIView.as_view(),
        name="myntra-order-summary",
    ),
    path("payments/history/", MyntraPaymentHistoryAPIView.as_view()),
    path(
        "payments/download/",
        MyntraPaymentCSVAPIView.as_view(),  # Temporary Url
    ),
    path("schedule/report/", ScheduleReportAPIView.as_view()),
    path(
        "report/fetch/",
        FetchReportAPIView.as_view(),
        name="myntra_fetch_report",
    ),
    path(
        "report/download/",
        DownloadReportAPIView.as_view(),
        name="myntra_download_report",
    ),
    path(
        "profit/export/",
        MyntraProfitExportAPIView.as_view(),
        name="myntra-profit-export",
    ),
    path(
        "profit/validation/export/",
        MyntraProfitValidationExportAPIView.as_view(),
        name="myntra-profit-validation-export",
    ),
    path("reports/orders/upload/",UploadMyntraOrderReportAPIView.as_view(),name="myntra-orders-report-upload",), #use in finace to uoload this mannually
    path("reports/returns/upload/",UploadMyntraReturnReportAPIView.as_view(),name="myntra-returns-report-upload",), #use in finace to uoload this mannually
    path("reports/payments/upload/",UploadMyntraPaymentReportAPIView.as_view(),name="myntra-payments-report-upload",), #use in finace to uoload this mannually
    path("reports/list/", ListUploadedReportsAPIView.as_view(), name="myntra-reports-list"),
    path(
        "profit/amazon-compatible/style/",
        MyntraAmazonStyleSummaryAPIView.as_view(),
        name="myntra-amazon-style-summary",
    ),
    path(
        "profit/amazon-compatible/sku/<str:style_id>/",
        MyntraAmazonSKUSummaryAPIView.as_view(),
        name="myntra-amazon-sku-summary",
    ),
    path(
        "profit/amazon-compatible/order/<str:seller_sku>/",
        MyntraAmazonOrderSummaryAPIView.as_view(),
        name="myntra-amazon-order-summary",
    ),
]
