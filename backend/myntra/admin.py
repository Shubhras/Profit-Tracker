from django.contrib import admin

from .models import (
    MyntraConnection,
    MyntraListing,
    MyntraOrder,
    MyntraPaymentTransaction,
    MyntraReportQueue,
    MyntraReturn,
)

admin.site.register(MyntraConnection)


@admin.register(MyntraOrder)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_line_id",
        "style_id",
        "seller_sku_code",
        "myntra_sku_code",
        "order_status",
        "final_amount",
        "created_on",
    )
    list_filter = (
        "user",
        "order_status",
        "created_on",
    )
    search_fields = (
        "style_id",
        "order_id_fk",
        "order_line_id",
        "seller_order_id",
        "seller_sku_code",
    )


@admin.register(MyntraReturn)
class ReturnAdmin(admin.ModelAdmin):
    list_display = (
        "order_line_id",
        "seller_sku_code",
        "myntra_sku_code",
        "status",
        "type",
        "return_status",
        "is_refunded",
        "order_created_date",
    )
    list_filter = (
        "status",
        "return_status",
        "type",
        "is_refunded",
        "order_created_date",
    )
    search_fields = (
        "order_line_id",
        "order_id",
        "style_id",
        "seller_order_id",
        "seller_sku_code",
        "return_id",
    )

    @admin.register(MyntraListing)
    class ListingAdmin(admin.ModelAdmin):
        list_display = (
            "seller_sku_code",
            "sku_id",
            "brand",
            "size",
            "mrp",
            "listing_status",
            "is_active",
        )

        list_filter = (
            "brand",
            "listing_status",
            "style_status",
            "is_active",
        )

        search_fields = (
            "seller_sku_code",
            "sku_id",
            "style_id",
            "style_name",
        )

@admin.register(MyntraPaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "payment_date",
        "neft_ref",
        "order_line_id",
        "seller_order_id",
        "order_type",
        "settled_amount",
        "customer_paid_amount",
        "commission",
    )

    list_filter = (
        "payment_date",
        "order_type",
        "payment_method",
    )

    search_fields = (
        "order_line_id",
        "seller_order_id",
        "store_order_id",
        "return_id",
        "neft_ref",
    )

    ordering = (
        "-payment_date",
        "-id",
    )

@admin.register(MyntraReportQueue)
class ReportQueueAdmin(admin.ModelAdmin):
    list_display = (
        "report_name",
        "partner_type",
        "job_id",
        "status",
        "scheduled_at",
        "completed_at",
    )
    list_filter = (
        "report_name",
        "status",
        "partner_type",
    )
    search_fields = (
        "report_name",
        "job_id",
    )
