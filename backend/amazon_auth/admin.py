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
    list_display = ('id','seller_sku', 'asin', 'order','shipping_price','shipping_income','shipping_expense', 'quantity_ordered', 'item_price', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('seller_sku','asin', 'title', 'order__amazon_order_id')

@admin.register(AmazonAccount)
class AmazonAccountAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'seller_central_id', 'region', 'marketplace_id', 'created_at')
    search_fields = ('user__username', 'seller_central_id')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id','amazon_order_id', 'amazon_account', 'purchase_date', 'order_status', 'total_amount', 'currency_code', 'user')
    list_filter = ('amazon_account', 'order_status', 'fulfillment_channel', 'purchase_date')
    search_fields = ('amazon_order_id', 'buyer_name', 'city')
    date_hierarchy = 'purchase_date'
    inlines = [OrderItemInline]  

@admin.register(FinancialEvent)
class FinancialEventAdmin(admin.ModelAdmin):
    list_display = ('id','event_type', 'amazon_account','shipping_fee','shipping_income', 'amazon_order_id', 'posted_date', 'total_amount', 'currency_code')
    list_filter = ('amazon_account', 'event_type', 'posted_date')
    search_fields = ('amazon_order_id', 'event_type')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('id','amazon_report_id', 'amazon_account', 'report_type', 'processing_status', 'created_time')
    list_filter = ('amazon_account', 'report_type', 'processing_status')
    search_fields = ('amazon_report_id', 'report_type')



@admin.register(ProductMapping)
class ProductMappingAdmin(admin.ModelAdmin):
    list_display = ('id','seller_sku','account', 'parent_sku', 'product_name', 'brand', 'cost_price')
    search_fields = ('seller_sku', 'parent_sku', 'product_name', 'brand')
    list_filter = ('brand',)
    ordering = ('seller_sku',)


@admin.register(AdReport)
class AdReportAdmin(admin.ModelAdmin):
    list_display = ('id','sku', 'date', 'impressions', 'clicks', 'spend', 'ad_sales', 'ad_orders')
    search_fields = ('sku',)
    list_filter = ('date',)
    ordering = ('-date',)
    date_hierarchy = 'date'


@admin.register(MissingCatalogQueue)
class MissingCatalogQueueAdmin(admin.ModelAdmin):
    list_display = ('id','seller_sku', 'account',  'asin','processed')
    search_fields = ('seller_sku', 'asin', 'marketplace_id')
    list_filter = ('processed',)
    ordering = ('seller_sku',)    


# 🔹 Inline for Metrics (shows inside campaign page)
class AdCampaignMetricsInline(admin.TabularInline):
    model = AdCampaignMetrics
    extra = 0
    fields = (
        "date", "spend", "sales", "orders",
        "cpc", "acos", "roas", "impressions_share"
    )
    readonly_fields = ("created_at",)
    show_change_link = True


# 🔹 Campaign Admin
@admin.register(AdCampaign)
class AdCampaignAdmin(admin.ModelAdmin):
    list_display = ('id',
        "campaign_id",
        "campaign_name",
        "user",
        "amazon_account",
        "program_type",
        "campaign_type",
        "targeting_type",
        "state",
        "budget_amount",
        "start_date",
        "created_at",
    )
    search_fields = ("campaign_id","campaign_name", "portfolio_name",)

    list_filter = (
        "program_type","campaign_type","targeting_type","state","amazon_account","start_date",
    )
    readonly_fields = ("created_at", "updated_at")
    inlines = [AdCampaignMetricsInline]
    ordering = ("-created_at",)


# 🔹 Metrics Admin
@admin.register(AdCampaignMetrics)
class AdCampaignMetricsAdmin(admin.ModelAdmin):
    list_display = (
        "campaign",
        "date",
        "spend",
        "sales",
        "orders",
        "acos",
        "roas",
    )
    search_fields = (
        "campaign__campaign_id",
        "campaign__campaign_name",
    )
    list_filter = (
        "date",
        "campaign__program_type",
    )
    readonly_fields = ("created_at",)
    ordering = ("-date",)

@admin.register(BusinessReport)
class BusinessReportAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "user",
        "amazon_account",
        "parent_asin",
        "child_asin",
        "ordered_product_sales",
        "units_ordered",
        "total_order_items",
        "sessions_total",
        "unit_session_percentage",  
        "buy_box_percentage",      
        "refund_rate",
        "created_at",
    )

    search_fields = (
        "amazon_account__seller_central_id",
        "user__email",
        "parent_asin",
        "child_asin",
        "title",
    )

    list_filter = (
        "date",
        "amazon_account",
    )

    readonly_fields = ("created_at",)
    ordering = ("-date",)
    list_per_page = 50



@admin.register(ReportRequest)
class ReportRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "amazon_account", "report_type", "report_id", "status", "start_date", "end_date", "created_at")
    list_filter = ("status", "report_type", "amazon_account", "created_at")
    search_fields = ("report_id", "amazon_account__seller_central_id")
    ordering = ("-created_at",)
    readonly_fields = ("report_id", "created_at")
    list_per_page = 50

@admin.register(AmazonReport)
class AmazonReportAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "account",
        "report_id",
        "report_type",
        "marketplace_id",
        "processing_status",
        "download_status",
        "retry_count",
        "is_active",
        "created_at",
        "updated_at",
    )
    list_filter = (
        "processing_status",
        "download_status",
        "report_type",
        "marketplace_id",
        "is_active",
        "created_at",
    )
    search_fields = (
        "report_id",
        "report_document_id",
        "report_type",
        "marketplace_id",
        "account__id",
        "account__email",  # if exists
    )
    readonly_fields = (
        "created_at",
        "updated_at",
        "created_time",
        "processing_start_time",
        "processing_end_time",
    )
    ordering = ("-created_at",)
    list_per_page = 50
    fieldsets = (
        ("Account Info", {
            "fields": ("account",)
        }),
        ("Report Details", {
            "fields": (
                "report_id",
                "report_document_id",
                "report_type",
                "marketplace_id",
            )
        }),
        ("Time Range", {
            "fields": (
                "data_start_time",
                "data_end_time",
                "created_time",
                "processing_start_time",
                "processing_end_time",
            )
        }),
        ("Status", {
            "fields": (
                "processing_status",
                "download_status",
                "retry_count",
                "is_active",
                "last_synced_at",
            )
        }),
        ("Errors", {
            "fields": ("error_message",),
            "classes": ("collapse",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
        }),
    )   

@admin.register(SettlementOrderSummary)
class SettlementOrderSummaryAdmin(admin.ModelAdmin):

    # 🔹 List display (what you see in table)
    list_display = (
        "amazon_order_id",
        "amazon_account",
        "sales",
        "fees",
        "tax",
        "net",
        "data_start_time",
        "data_end_time",
        "created_at",
    )

    # 🔹 Filters (right sidebar)
    list_filter = (
        "amazon_account",
        "currency_code",
        "data_start_time",
        "data_end_time",
        "created_at",
    )

    # 🔹 Search
    search_fields = (
        "amazon_order_id","report_id","report_document_id",
    )

    # 🔹 Readonly fields (important for financial data)
    readonly_fields = (
        "created_at",
    )

    # 🔹 Pagination (important if large data)
    list_per_page = 50

    # 🔹 Ordering
    ordering = ("-data_start_time", "-created_at")

    # 🔹 Field grouping (clean UI)
    fieldsets = (
        ("Basic Info", {
            "fields": ("user", "amazon_account", "amazon_order_id")
        }),
        ("Settlement Period", {
            "fields": ("data_start_time", "data_end_time")
        }),
        ("Financial Breakdown", {
            "fields": ("sales", "fees", "refunds", "tax", "shipping", "net", "currency_code")
        }),
        ("Report Tracking", {
            "fields": ("report_id", "report_document_id")
        }),
        ("Meta", {
            "fields": ("created_at",)
        }),
    )     