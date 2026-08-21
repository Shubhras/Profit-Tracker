from django.contrib import admin

from .models import (
    BlinkitAccount,
    BlinkitImportBatch,
    BlinkitOrder,
    BlinkitOrderItem,
    BlinkitPayout,
    BlinkitProduct,
    BlinkitStorageCharge,
)

# =========================================================
# BLINKIT ACCOUNT
# =========================================================


@admin.register(BlinkitAccount)
class BlinkitAccountAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "name",
        "blinkit_user_id",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
        "blinkit_user_id",
        "user__email",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Account Information",
            {
                "fields": (
                    "user",
                    "name",
                    "blinkit_user_id",
                    "is_active",
                ),
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )


# =========================================================
# BLINKIT IMPORT BATCH
# =========================================================


@admin.register(BlinkitImportBatch)
class BlinkitImportBatchAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "account",
        "file_name",
        "report_type",
        "payout_period_start",
        "payout_period_end",
        "uploaded_at",
    )

    list_filter = (
        "report_type",
        "uploaded_at",
        "account",
    )

    search_fields = (
        "file_name",
        "account__name",
    )

    readonly_fields = ("uploaded_at",)

    fieldsets = (
        (
            "Import Information",
            {
                "fields": (
                    "account",
                    "file_name",
                    "report_type",
                ),
            },
        ),
        (
            "Payout Period",
            {
                "fields": (
                    "payout_period_start",
                    "payout_period_end",
                ),
            },
        ),
        (
            "Upload Information",
            {
                "fields": ("uploaded_at",),
            },
        ),
    )


# =========================================================
# BLINKIT PRODUCT
# =========================================================


@admin.register(BlinkitProduct)
class BlinkitProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "account",
        "item_id",
        "product_id",
        "product_name",
        "brand_name",
        "mrp",
        "selling_price",
        "platform_commission_percent",
        "platform_commission_value",
        "fulfillment_fee",
    )

    list_filter = (
        "account",
        "brand_name",
        "business_category",
    )

    search_fields = (
        "item_id",
        "product_id",
        "product_name",
        "brand_name",
        "upc_ean",
        "hsn",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Account",
            {
                "fields": ("account",),
            },
        ),
        (
            "Product Identifiers",
            {
                "fields": (
                    "product_id",
                    "item_id",
                    "upc_ean",
                ),
            },
        ),
        (
            "Product Information",
            {
                "fields": (
                    "product_name",
                    "brand_name",
                    "manufacturer",
                    "business_category",
                    "hsn",
                    "expansion_level",
                    "uom",
                ),
            },
        ),
        (
            "Pricing",
            {
                "fields": (
                    "mrp",
                    "selling_price",
                ),
            },
        ),
        (
            "Marketplace Fees",
            {
                "fields": (
                    "platform_commission_percent",
                    "platform_commission_value",
                    "fulfillment_fee",
                    "inwarding_fee",
                ),
            },
        ),
        (
            "Import Information",
            {
                "fields": (
                    "source_import",
                    "updated_at",
                ),
            },
        ),
        (
            "Raw Data",
            {
                "fields": ("raw_data",),
            },
        ),
    )


# =========================================================
# BLINKIT PAYOUT
# =========================================================


@admin.register(BlinkitPayout)
class BlinkitPayoutAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "account",
        "payout_period_start",
        "payout_period_end",
        "bank_utr",
        "settlement_date",
        "settlement_status",
    )

    list_filter = (
        "account",
        "settlement_status",
        "settlement_date",
    )

    search_fields = (
        "bank_utr",
        "account__name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Account",
            {
                "fields": ("account",),
            },
        ),
        (
            "Payout Period",
            {
                "fields": (
                    "payout_period_start",
                    "payout_period_end",
                ),
            },
        ),
        (
            "Settlement Information",
            {
                "fields": (
                    "bank_utr",
                    "settlement_date",
                    "settlement_status",
                ),
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )


# =========================================================
# BLINKIT ORDER ITEM INLINE
# =========================================================


class BlinkitOrderItemInline(admin.TabularInline):
    model = BlinkitOrderItem

    extra = 0

    show_change_link = True

    fields = (
        "item_id",
        "product",
        "product_name",
        "quantity",
        "selling_price",
        "total_gross_bill_amount",
        "commission_charge",
        "commission_gst",
        "shipping_charge",
        "shipping_gst",
        "tcs_amount",
        "tds_194o_amount",
        "tds_194q_amount",
        "net_deductions",
        "net_additions",
        "item_level_payout",
        "unsettled_amount",
    )

    readonly_fields = fields


# =========================================================
# BLINKIT ORDER
# =========================================================


@admin.register(BlinkitOrder)
class BlinkitOrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_id",
        "order_kind",
        "order_type",
        "order_status",
        "order_date",
        "account",
        "payout",
    )

    list_filter = (
        "order_kind",
        "order_status",
        "order_type",
        "account",
    )

    search_fields = (
        "order_id",
        "invoice_id",
        "customer_name",
        "customer_gst_number",
    )

    inlines = (BlinkitOrderItemInline,)

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Account & Import",
            {
                "fields": (
                    "account",
                    "source_import",
                    "payout",
                ),
            },
        ),
        (
            "Order Information",
            {
                "fields": (
                    "order_id",
                    "invoice_id",
                    "order_kind",
                    "order_type",
                    "order_status",
                ),
            },
        ),
        (
            "Dates",
            {
                "fields": (
                    "order_date",
                    "return_order_date",
                ),
            },
        ),
        (
            "Return / Cancellation",
            {
                "fields": (
                    "forward_invoice_id",
                    "return_invoice_id",
                ),
            },
        ),
        (
            "Customer Information",
            {
                "fields": (
                    "customer_name",
                    "customer_gst_name",
                    "customer_gst_number",
                    "supply_state",
                    "customer_city",
                    "customer_state",
                ),
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )


# =========================================================
# BLINKIT ORDER ITEM
# =========================================================


@admin.register(BlinkitOrderItem)
class BlinkitOrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "item_id",
        "order",
        "product",
        "quantity",
        "selling_price",
        "item_level_payout",
    )

    list_filter = ("item_id",)

    search_fields = (
        "item_id",
        "product_name",
        "order__order_id",
        "product__product_name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Relationships",
            {
                "fields": (
                    "order",
                    "product",
                    "source_import",
                ),
            },
        ),
        (
            "Product / Item",
            {
                "fields": (
                    "item_id",
                    "product_name",
                    "variant_description",
                ),
            },
        ),
        (
            "Quantity & Pricing",
            {
                "fields": (
                    "quantity",
                    "mrp",
                    "selling_price",
                    "total_gross_bill_amount",
                ),
            },
        ),
        (
            "Tax Rates",
            {
                "fields": (
                    "igst_percent",
                    "cgst_percent",
                    "sgst_percent",
                    "cess_percent",
                ),
            },
        ),
        (
            "Tax Amounts",
            {
                "fields": (
                    "igst_amount",
                    "cgst_amount",
                    "sgst_amount",
                    "cess_amount",
                    "total_tax",
                ),
            },
        ),
        (
            "Marketplace Fees",
            {
                "fields": (
                    "commission_percent",
                    "commission_charge",
                    "commission_gst",
                    "shipping_charge",
                    "shipping_gst",
                ),
            },
        ),
        (
            "Tax Withholding",
            {
                "fields": (
                    "tcs_amount",
                    "tds_194o_amount",
                    "tds_194q_amount",
                ),
            },
        ),
        (
            "Blinkit Reported Settlement",
            {
                "fields": (
                    "net_deductions",
                    "net_additions",
                    "item_level_payout",
                    "unsettled_amount",
                ),
            },
        ),
        (
            "Raw Data",
            {
                "fields": ("raw_data",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )


# =========================================================
# BLINKIT STORAGE CHARGE
# =========================================================


@admin.register(BlinkitStorageCharge)
class BlinkitStorageChargeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "item_id",
        "item_name",
        "charge_type",
        "total_charge",
        "quantity",
        "unit_charge",
        "regime",
        "ageing_slab",
        "account",
        "product",
        "source_import",
        "created_at",
    )

    list_filter = (
        "charge_type",
        "regime",
        "ageing_slab",
        "account",
        "source_import",
    )

    search_fields = (
        "item_id",
        "item_name",
        "product__item_id",
        "product__product_name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    autocomplete_fields = (
        "account",
        "product",
        "source_import",
    )

    ordering = ("-created_at",)

    fieldsets = (
        (
            "Identification",
            {
                "fields": (
                    "account",
                    "product",
                    "item_id",
                    "item_name",
                    "charge_type",
                    "source_import",
                ),
            },
        ),
        (
            "Storage Details",
            {
                "fields": (
                    "state",
                    "regime",
                    "ageing_slab",
                    "quantity",
                    "per_day_charge",
                    "total_inventory_unit_days",
                    "unit_charge",
                    "total_charge",
                ),
            },
        ),
        (
            "Raw Data",
            {
                "fields": ("raw_data",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )
