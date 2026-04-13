from django.contrib import admin
from .models import AmazonAccount, Order, FinancialEvent, Report, OrderItem

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('seller_sku', 'order', 'quantity_ordered', 'item_price', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('seller_sku', 'title', 'order__amazon_order_id')

@admin.register(AmazonAccount)
class AmazonAccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'seller_central_id', 'region', 'marketplace_id', 'created_at')
    search_fields = ('user__username', 'seller_central_id')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('amazon_order_id', 'amazon_account', 'purchase_date', 'order_status', 'total_amount', 'currency_code', 'user')
    list_filter = ('amazon_account', 'order_status', 'fulfillment_channel', 'purchase_date')
    search_fields = ('amazon_order_id', 'buyer_name', 'city')
    date_hierarchy = 'purchase_date'

@admin.register(FinancialEvent)
class FinancialEventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'amazon_account', 'amazon_order_id', 'posted_date', 'total_amount', 'currency_code')
    list_filter = ('amazon_account', 'event_type', 'posted_date')
    search_fields = ('amazon_order_id', 'event_type')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('amazon_report_id', 'amazon_account', 'report_type', 'processing_status', 'created_time')
    list_filter = ('amazon_account', 'report_type', 'processing_status')
    search_fields = ('amazon_report_id', 'report_type')
