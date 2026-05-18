from django.urls import path
from .views import sync_campaigns_api

# urlpatterns = [
#     path(
#         "sync-campaigns/",
#         sync_campaigns_api
#     ),
# ]

from django.urls import path

from .views import *
urlpatterns = [

    path("account/connect/",AmazonAdsConnectView.as_view()),

    path("account/callback/advertise",AmazonAdsCallbackView.as_view()),
    path("syncCampaigns/details/",SyncCampaignsView.as_view()),
    path("syncCampaignMetricsView/details/",SyncCampaignMetricsView.as_view()),
    path("campaigns/list/",CampaignListView.as_view()),
    path("ad-groups/list/",AdsAdGroupListView.as_view()),
    path("keywords/list/",AdsKeywordListView.as_view()),
    path("product-ads/list/",AdsProductAdListView.as_view()),

    path("product-ads/list/",AdsProductAdListView.as_view()),
    path("get-query-ads/",QueryAdsView.as_view()),
    path("sync-campaigns/",sync_campaigns_api),
]