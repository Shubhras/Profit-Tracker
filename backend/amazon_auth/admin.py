from django.contrib import admin
from .models import *

class OrderItemInline(admin.TabularInline):  # or StackedInline
    model = OrderItem
    extra = 0
    fields = (
        'order_item_id',
        'seller_sku',
        'title',
        'quantity_ordered',
        'quantity_shipped',
        'item_price',
        'item_tax',
        'shipping_price',
        'created_at'
    )
    readonly_fields = ('created_at',)
    show_change_link = True

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
    inlines = [OrderItemInline]  

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



@admin.register(ProductMapping)
class ProductMappingAdmin(admin.ModelAdmin):
    list_display = ('seller_sku', 'parent_sku', 'product_name', 'brand', 'cost_price')
    search_fields = ('seller_sku', 'parent_sku', 'product_name', 'brand')
    list_filter = ('brand',)
    ordering = ('seller_sku',)


@admin.register(AdReport)
class AdReportAdmin(admin.ModelAdmin):
    list_display = ('sku', 'date', 'impressions', 'clicks', 'spend', 'ad_sales', 'ad_orders')
    search_fields = ('sku',)
    list_filter = ('date',)
    ordering = ('-date',)
    date_hierarchy = 'date'


@admin.register(MissingCatalogQueue)
class MissingCatalogQueueAdmin(admin.ModelAdmin):
    list_display = ('seller_sku',  'asin','processed')
    search_fields = ('seller_sku', 'asin', 'marketplace_id')
    list_filter = ('processed',)
    ordering = ('seller_sku',)    