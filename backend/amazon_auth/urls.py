from django.urls import path
from . import views

urlpatterns = [
    path('dashboard-stats/', views.get_full_dashboard, name='dashboard-stats'),
    path('pivot-stats/', views.get_pivot_dashboard, name='pivot-stats'),
    path('', views.home, name='home'),
    path('connect/', views.amazon_connect, name='amazon_connect'),
    path('callback/', views.amazon_callback, name='amazon_callback'),

    path('sync-orders/', views.sync_orders, name='sync_orders'),
    
    path('list-db-orders/', views.list_db_orders, name='list_db_orders'),
    
    # # orders
    path('orders/', views.get_orders, name='get_orders'),
    path('orders/<str:order_id>/', views.get_order_details, name='get_order_details'),
    # path('orders/<str:order_id>/buyerInfo/', views.get_order_buyer_info, name='get_order_buyer_info'),
    path('orders/<str:order_id>/address/', views.get_order_address, name='get_order_address'),
    path('orders/<str:order_id>/orderItems/live/', views.get_order_items, name='get_order_items_live'),
    path('orders/<str:order_id>/orderItems/', views.list_db_order_items, name='list_db_order_items'),


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
    path('dashboard-profitability/', views.get_amazon_data_profi_tability, name='get_amazon_data_profi_tability'),
    path('profitability-monthwise/', views.get_profitability_monthwise, name='get_profitability_monthwise'),
    path('reconcile-paymentsummary/', views.get_amazon_data_reconcile_paymentsummary, name='get_amazon_data_reconcile_paymentsummary'),
    path('bank/ransfer-summary/', views.get_bank_transfer_workflow, name='bank/ransfer-summary/'),
    path('outstanding-payments/', views.get_outstanding_payments, name='get_outstanding_payments'),
 
]
