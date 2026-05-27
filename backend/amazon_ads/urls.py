from django.urls import path
from .views import sync_campaigns_api
from django.urls import path

from .views import *
from .budget_rules import *
from amazon_ads.services.reports import *
from .adgroup import *
from amazon_ads.services.campaigns import *
urlpatterns = [

    path("account/connect/",AmazonAdsConnectView.as_view()),

    path("account/callback/advertise",AmazonAdsCallbackView.as_view()),
    path("syncCampaigns/details/",SyncCampaignsView.as_view()),
    path("syncCampaignMetricsView/details/",SyncCampaignMetricsView.as_view()),
    path("campaigns/list/",CampaignListView.as_view()),
    path("ad-groups/list/",AdsAdGroupListView.as_view()),
    path("keywords/list/",AdsKeywordListView.as_view()),
    # path("product-ads/list/",AdsProductAdListView.as_view()),

    path("product-ads/list/",ProductSKUReportView.as_view()),

    path("camping-by-sku/list/",CampaignBySKUView.as_view()),

    path("adgroup-by-camping/",AdGroupByCampaignView.as_view()),
    path("adgroup-update/",UpdateSPAdGroupView.as_view()),

    path("get-query-ads/",QueryAdsView.as_view()),
    path("sync-campaigns/",sync_campaigns_api),

    path("search-term-metrics/",SearchTermMetricListView.as_view(),name="search-term-metrics"),

    path("budget-rule-list/",AdsBudgetRuleListAPIView.as_view(),name="budget-rule-list"),

    path("product-ad-metric-list/",ProductAdMetricListAPIView.as_view(),name="product-ad-metric-list"),

    path("create-daily-ads-reports/",CreateDailyAdsReportsAPIView.as_view(),name="create-missing-ads-reports"),

    path("get-ads-targeting/",AdsTargetListAPIView.as_view(),name="get_ads_targeting"),
    

    # SyncBudgetRulesAPIs

    path("campaigns-id/list/",CampaignIdNameListView.as_view()),

    path("campaigns-update/",UpdateSPCampaignView.as_view()),
    
    path("sync-budget-rules/",SyncBudgetRulesAPIView.as_view(),name="sync-budget-rules"),

    path(
        "budget-rules/create/",
        CreateBudgetRuleAPIView.as_view()
    ),

    path(
        "budget-rules/update/",
        UpdateBudgetRuleAPIView.as_view()
    ),

    path(
        "budget-rules/<str:budget_rule_id>/delete/",
        DeleteBudgetRuleAPIView.as_view()
    ),
]