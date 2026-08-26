from django.urls import path

from .views import *
from .budget_rules import *
from amazon_ads.services.reports import *
from .adgroup import *
from amazon_ads.services.campaigns import *
from .keywords import *
from .optimization_rules import *
from amazon_ads.services.product_ads import *
from amazon_ads.services.targets import *
from amazon_ads.services.negative_keywords import *
from amazon_ads.services.negative_targets import *
from amazon_ads.services.portfolio import *
from amazon_ads.services.dashboard import AdsDashboardStatsAPIView

from amazon_auth.exports import export_amazon_ads_campaigns, export_amazon_ads_ad_groups, export_amazon_ads_search_terms, export_amazon_ads_ad_products, export_amazon_ads_keywords, export_amazon_ads_campaign_by_sku, export_amazon_ads_adgroup_by_campaign, export_amazon_ads_negative_keywords

urlpatterns = [

    path("ads/dashboard-stats/", AdsDashboardStatsAPIView.as_view(), name="ads-dashboard-stats"),

    path("account/connect/",AmazonAdsConnectView.as_view()),

    path("account/callback/advertise",AmazonAdsCallbackView.as_view()),
    path("syncCampaigns/details/",SyncCampaignsView.as_view()),
    path("syncCampaignMetricsView/details/",SyncCampaignMetricsView.as_view()),
    path("campaigns/list/",CampaignListView.as_view()),
    path("campaigns/export/", export_amazon_ads_campaigns, name="export_amazon_ads_campaigns"),
    path("campaigns/list/export/", export_amazon_ads_campaigns, name="export_amazon_ads_campaigns_alias"),
    path("ad-groups/list/",AdsAdGroupListView.as_view()),
    path("ad-groups/export/", export_amazon_ads_ad_groups, name="export_amazon_ads_ad_groups"),
    path("ad-groups/list/export/", export_amazon_ads_ad_groups, name="export_amazon_ads_ad_groups_alias"),

    path("keywords/list/",AdsKeywordListView.as_view()),
    path("keywords/export/", export_amazon_ads_keywords, name="export_amazon_ads_keywords"),
    path("keywords/list/export/", export_amazon_ads_keywords, name="export_amazon_ads_keywords_alias"),
    path("keywords-update/",UpdateSPKeywordView.as_view()),
    # path("product-ads/list/",AdsProductAdListView.as_view()),

    path("product-ads/list/",ProductSKUReportView.as_view()),              
    path("product-ads/export/", export_amazon_ads_ad_products, name="export_amazon_ads_ad_products"),
    path("product-ads/list/export/", export_amazon_ads_ad_products, name="export_amazon_ads_ad_products_alias"),

    path("camping-by-sku/list/",CampaignBySKUView.as_view()),
    path("camping-by-sku/export/", export_amazon_ads_campaign_by_sku, name="export_amazon_ads_campaign_by_sku"),
    path("camping-by-sku/list/export/", export_amazon_ads_campaign_by_sku, name="export_amazon_ads_campaign_by_sku_alias"),

    path("adgroup-by-camping/",AdGroupByCampaignView.as_view()),
    path("adgroup-by-camping/export/", export_amazon_ads_adgroup_by_campaign, name="export_amazon_ads_adgroup_by_campaign"),
    path("adgroup-by-camping/list/export/", export_amazon_ads_adgroup_by_campaign, name="export_amazon_ads_adgroup_by_campaign_alias"),
    path("adgroup-update/",UpdateSPAdGroupView.as_view()),

    path("get-query-ads/",QueryAdsView.as_view()),

    path("search-term-metrics/",SearchTermMetricListView.as_view(),name="search-term-metrics"),
    path("search-term-metrics/export/", export_amazon_ads_search_terms, name="export_amazon_ads_search_terms"),
    path("search-term-metrics/list/export/", export_amazon_ads_search_terms, name="export_amazon_ads_search_terms_alias"),

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

    path(
        "campaign-negative-targets/list/",
        CampaignNegativeTargetListView.as_view(),
        name="campaign-negative-target-list"
    ),

    path("negative-keywords/list/",NegativeKeywordListAPIView.as_view(),name="negative-keywords-list"),
    path("negative-keywords/export/", export_amazon_ads_negative_keywords, name="export_amazon_ads_negative_keywords"),
    path("negative-keywords/list/export/", export_amazon_ads_negative_keywords, name="export_amazon_ads_negative_keywords_alias"),


    path(
        "optimization-rules/create/",
        CreateOptimizationRuleAPIView.as_view()
    ),

    path(
        "optimization-rules/update/",
        UpdateOptimizationRuleAPIView.as_view()
    ),

    path(
        "optimization-rules/delete/",
        DeleteOptimizationRuleAPIView.as_view()
    ),

    path(
        "optimization-rules/search/",
        SearchOptimizationRuleAPIView.as_view()
    ),

    path(
        "optimization-rules/associate/",
        AssociateOptimizationRuleAPIView.as_view()
    ),


    path(
        "optimization-rules/sync/",
        SyncOptimizationRuleAPIView.as_view()
    ),

    path(
        "optimization-rules/list/",
        ListOptimizationRuleAPIView.as_view()
    ),

    # CampaignCreationWorkflow
    
    path(
        "campaigns/create/",
        CreateSPCampaignView.as_view()
    ),

    path(
        "adgroups/create/",
        CreateSPAdGroupView.as_view()
    ),

    path(
        "product-ads/create/",
        CreateSPProductAdView.as_view()
    ),

    path(
        "keywords/create/",
        CreateSPKeywordView.as_view()
    ),

    path(
        "targets/create/",
        CreateSPTargetView.as_view()
    ),

    path(
        "negative-keywords/create/",
        CreateSPNegativeKeywordView.as_view()
    ),

    path(
        "campaign-negative-keywords/create/",
        CreateSPCampaignNegativeKeywordView.as_view()
    ),

    path(
        "negative-targets/create/",
        CreateSPNegativeTargetView.as_view()
    ),

    path(
        "campaign-negative-targets/create/",
        CreateSPCampaignNegativeTargetView.as_view()
    ),

path(
    "campaign-products/list/",
    CampaignProductListAPIView.as_view(),
),
    # PortfolioWorkflow
    
    path("portfolios/list/", PortfolioListAPIView.as_view()),

    path("portfolios/create/", CreatePortfolioView.as_view()),

    # Keyword and Product Recommendation
    path("keywords/recommendations/", KeywordRecommendationAPIView.as_view()),

   path("targets/product-recommendations/", ProductTargetRecommendationAPIView.as_view()),

   path("targets/category-recommendations/", CategoryRecommendationAPIView.as_view())
]