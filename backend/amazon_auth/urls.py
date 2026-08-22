from django.urls import path
from . import views 
from .views import *
from .ads_campins import *
from .bussiness_report import *
from .finance_report import *
from .return_items import *
from .retundata import *
from amazon_ads.views import AmazonAdsCallbackView
from .product_pricing import  *
from .catelog_details import *
from .listing_items import *
from .orders import *  
from .feesestimate import *
from .transations import *
from .reconcile import *
from . import exports
from . import profit
from . import payment_reconcyle
from .growth_opportunities import GrowthOpportunitiesAPIView

urlpatterns = [
    path('dashboard-stats-old/', views.get_full_dashboard, name='dashboard-stats-old'),
    path('dashboard-stats/', profit.combined_get_full_dashboard, name='dashboard-stats'),
    path('growth-opportunities/', GrowthOpportunitiesAPIView.as_view(), name='growth-opportunities'),
    path('pivot-stats/', views.get_pivot_dashboard, name='pivot-stats'),
    path('', views.home, name='home'),
    path('connect/', views.amazon_connect, name='amazon_connect'),
    path('callback/', views.amazon_callback, name='amazon_callback'),
    path("callback/advertise",AmazonAdsCallbackView.as_view()),

    path('sync-orders/', views.sync_orders, name='sync_orders'),
    path('list-db-orders/', views.list_db_orders, name='list_db_orders'),
    
    # # orders
    path('orders/', views.get_orders, name='get_orders'),
    path('orders/<str:order_id>/', views.get_order_details, name='get_order_details'),
    
    path('search-orders/', views.search_orders, name='search_orders'),   #live api test
    path('search-orders-update/', views.new_search_orders_update, name='search_orders_update'),  #live api check and update pending orders
    
    # path('orders/<str:order_id>/buyerInfo/', views.get_order_buyer_info, name='get_order_buyer_info'),
    path('orders/<str:order_id>/address/', views.get_order_address, name='get_order_address'),
    path('orders/<str:order_id>/orderItems/live/', views.get_order_items, name='get_order_items_live'),
     path('orders/new/<str:order_id>/orderItems/live/', views.by_token_get_order_items, name='get_order_items_live'),
    path('orders/<str:order_id>/orderItems/', views.by_token_list_db_order_items, name='list_db_order_items'),
    
    path('order-processing-dashboard/',OrderProcessingDashboardAPIView.as_view(),name='order-processing-dashboard'),
    #finance
    path('sync-finances/', views.sync_finances, name='sync_finances'),
    path('orders/<str:order_id>/finances/', views.get_order_finances, name='get_order_finances'),
    path('finances/', views.list_financial_events, name='list_financial_events'),


    #reports
    path('reports/', views.get_reports, name='get_reports'),
    path('sync-reports/', views.sync_reports, name='sync_reports'),
    path('create-report/', views.create_report, name='create_report'),
    path('report/<str:report_id>/', views.get_report, name='get_report'),
    path('report-document/<str:document_id>/', views.get_report_document, name='get_report_document'),

    # Analytics
    path('product-analytics/', views.get_product_analytics, name='get_product_analytics'),
    path('dashboard-profitability/', profit.combined_dashboard_profitability, name='get_amazon_data_profi_tability'),
    path('dashboard-profitability-old/', views.get_amazon_data_profi_tability, name='get_amazon_data_profi_tability_old'),
    
    # 1page asin level sale
    path('profitability/details/export/', exports.export_profitability_details, name='export_profitability_details'),
    path('profitability/details-old/', views.amazon_profitability_details_transactions_shipping, name='get_amazon_data_profi_tability_details_old'),    #new api to get shiping from transactions 
    path('profitability/details/', profit.combined_profitability_details_transactions_shipping, name='get_amazon_data_profi_tability_details'),    #new api to get shiping from transactions 
    path('profitability/details/combined/', profit.combined_profitability_details_transactions_shipping, name='combined_profitability_details'),

    #2 page sku level sale
    path('profitability/details/by-parent-asin-old/', views.amazon_profitability_parent_transactions_shipping, name='profi_tability_details_by_parent_asin_old'),
    path('profitability/details/by-parent-asin/', profit.combined_profitability_parent_transactions_shipping, name='profi_tability_details_by_parent_asin'),
    path('profitability/details/combined/by-parent-asin/', profit.combined_profitability_parent_transactions_shipping, name='combined_profitability_details_by_parent_asin'),
    
    #3page order level sale
    path('profitability/details/by-parentproductid-old/', views.sku_profit_report_transactions_shipping, name='profi_tability_details_by_parentproductid_old'),
    path('profitability/details/by-parentproductid/', profit.combined_sku_profit_report_transactions_shipping, name='profi_tability_details_by_parentproductid'),
    path('profitability/details/combined/by-parentproductid/', profit.combined_sku_profit_report_transactions_shipping, name='combined_sku_profit_report_transactions_shipping'),
    
    
    path('profitability/ads-spend/by-parent-asin/', views.get_parent_asin_ad_spend, name='get_parent_asin_ad_spend'),
    
    # filter by profit and loss 
    path('profitability/list/by-sku/filtered/', views.sku_profitability_list_filtered, name='sku_profitability_list_filtered'),
    # path('profitability/details/by-parentproductid/', views.sku_profit_report, name='profi_tability_details_by_parentproductid'),
    
   
    path('profitability-monthwise/', profit.combined_profitability_monthwise, name='get_profitability_monthwise'),
    path('profitability-monthwise-old/', views.get_profitability_monthwise, name='get_profitability_monthwise_old'),

    # Payment Reconciliation Overview
    path('payment-reconcile/overview/', payment_reconcyle.combined_payment_reconcile_overview, name='payment_reconcile_overview'),
    path('payment-reconcile/details/', payment_reconcyle.combined_payment_reconcile_overview, name='payment_reconcile_details'),
    path('payment-reconcile/details/export/', exports.export_payment_reconcile_overview, name='export_payment_reconcile_overview'),
    path('payment-reconcile/overview/export/', exports.export_payment_reconcile_overview, name='export_payment_reconcile_overview_alias'),
    path('payment-reconcile/details/by-parent-asin/', payment_reconcyle.combined_payment_reconcile_by_parent_asin, name='payment_reconcile_details_by_parent_asin'),
    path('payment-reconcile/details/by-parent-asin/export/', exports.export_payment_reconcile_by_parent_asin, name='export_payment_reconcile_by_parent_asin'),
    path('payment-reconcile/details/by-parentproductid/', payment_reconcyle.combined_payment_reconcile_by_parentproductid, name='payment_reconcile_details_by_parentproductid'),
    path('payment-reconcile/details/by-parentproductid/export/', exports.export_payment_reconcile_by_parentproductid, name='export_payment_reconcile_by_parentproductid'),
    path('payment-reconcile/details-old/', payment_reconcyle.payment_reconcile_details_transactions_shipping, name='payment_reconcile_details_old'),



    path('reconcile-paymentsummary/', views.get_amazon_data_reconcile_paymentsummary, name='get_amazon_data_reconcile_paymentsummary'),
    path('bank/ransfer-summary/', views.get_bank_transfer_workflow, name='bank/ransfer-summary/'),
    path('outstanding-payments/', views.get_outstanding_payments, name='get_outstanding_payments'),


    #ads_campins
    path('ads-campins/sync/', sync_ads_manual, name='ads_campins_sync'),

    #bussiness report 
    path('business-report/sync/', sync_daily_business_report, name='sync_daily_business_report'),
    path('amazon-new/report-sync/', manual_sync_amazon_reports, name='manual_sync_amazon_reports'),
    #export bussiness report 
    path('business-report/export/', export_business_report_excel, name='export_business_report_excel'),

    path("orders/<str:order_id>/financial-events/", OrderFinancialEventsView.as_view()),

    # path("orders-new/<str:order_id>/financial-events/", SettlementReportView.as_view()),
    path("orders-new/financial-events/", SettlementReportView.as_view()),

    #get retunitems
    path("get-retunslist/", sync_returns , name ='get-retunslist'),
    path("get-retuns-details/", courier_vs_customer_returns , name ='get-retunsdetails'),
    path("get-financial-details/", financial_event_group_transactions , name ='get-rfinancialdetails'),

    #catelog details
    path('get-catlog/details/', get_catalog_details, name='get_catelog_details'),

    path("amazon-returns/", amazon_returns_list, name="amazon_returns_list"),

    path('sync-product-pricing/',SyncProductPricingAPIView.as_view()),

    path("catalog-list-details/",AmazonCatalogDetailsAPIView.as_view(),name="catalog-details"),

    path("amazon-listing-items/",AmazonListingItemsView.as_view(),name="amazon-listing-items"),

    path("export-amazon-listing-excel/",export_amazon_listing_excel,name="export_amazon_listing_excel"),

    path("upload-amazon-listing-excel/",upload_amazon_listing_excel,name="upload_amazon_listing_excel",),

    path("channel-product-config-items/", ChannelProductConfigItemsView.as_view(), name="channel-product-config-items"),

    path("export-channel-product-config-excel/", export_channel_product_config_excel, name="export_channel_product_config_excel"),

    path("upload-channel-product-config-excel/", upload_channel_product_config_excel, name="upload_channel_product_config_excel"),
    
    path(
        "estimated-fees/list/",
        AmazonEstimatedFeeListView.as_view(),
        name="estimated-fees-list"
    ),
    
    path(
        "amazon/transactions/-sync/",
        AmazonTransactionsListView.as_view(),
        name="amazon-transactions"
    ),
    
    path(
        "amazon-transactions-details/",
        AmazonTransactionListView.as_view(),
        name="amazon-transactions"
    ),
    
    path(
        "order-settlement-dashboard/",
        AmazonOrderRelatedTransactionsAPIView.as_view(),
        name="order-settlement-dashboard"
    ),
    
    
    # reconcilation page 
    path(
        "settlement-summary/",
        AmazonSettlementSummaryAPIView.as_view(),
        name="amazon-settlement-summary"
    ),
    
    path(
        "grouped-transactions/",
        AmazonTransactionsGroupedAPIView.as_view(),
        name="amazon-grouped-transactions"
    ),
    
    path(
        "refund-transactions/",
        AmazonRefundTransactionsAPIView.as_view(),
        name="amazon-refund-transactions"
    ),
    
    # EXPORT ENDPOINTS
    path('profitability/details/export/', exports.export_profitability_details),
    path('profitability/details/by-parent-asin/export/', exports.export_profitability_details_by_parent_asin),
    path('profitability/details/by-parentproductid/export/', exports.export_sku_profit_report),
    path('profitability/list/by-sku/filtered/export/', exports.export_sku_profitability_list_filtered),
    path('profitability-monthwise/export/', exports.export_profitability_monthwise),
    path('reconcile-paymentsummary/export/', exports.export_paymentsummary),
    path('bank/ransfer-summary/export/', exports.export_bank_transfer_workflow),
    path('grouped-transactions/export/', exports.export_grouped_transactions),
    path('order-settlement-dashboard/export/', exports.export_order_settlement_dashboard),
    path('refund-transactions/export/', exports.export_refund_transactions),
    path('exports/history/', exports.list_export_history),
    path('exports/history/<int:export_id>/download/', exports.download_export_file),
 
]


