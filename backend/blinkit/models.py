from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class BlinkitAccount(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blinkit_accounts",
    )

    name = models.CharField(max_length=255)

    # Blinkit Seller Hub credentials
    blinkit_user_id = models.CharField(
        max_length=255,
    )

    blinkit_password = models.CharField(
        max_length=255,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.user_id}"


class BlinkitImportBatch(models.Model):
    REPORT_TYPE_CHOICES = [
        ("ORDER_FINANCIAL", "Order Financial"),
        ("LISTING", "Listing"),
        ("STORAGE", "Storage"),
    ]

    account = models.ForeignKey(
        BlinkitAccount,
        on_delete=models.CASCADE,
        related_name="import_batches",
    )

    file_name = models.CharField(max_length=255)

    report_type = models.CharField(
        max_length=50,
        choices=REPORT_TYPE_CHOICES,
    )

    payout_period_start = models.DateField(
        blank=True,
        null=True,
    )

    payout_period_end = models.DateField(
        blank=True,
        null=True,
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} - {self.account}"


class BlinkitProduct(models.Model):
    account = models.ForeignKey(
        BlinkitAccount,
        on_delete=models.CASCADE,
        related_name="products",
    )

    product_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    item_id = models.CharField(
        max_length=100,
    )

    product_name = models.CharField(
        max_length=500,
        blank=True,
        null=True,
    )

    brand_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    upc_ean = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    mrp = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    selling_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    hsn = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    business_category = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    platform_commission_percent = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        null=True,
        blank=True,
    )

    platform_commission_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    fulfillment_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    inwarding_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    uom = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    expansion_level = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    manufacturer = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    raw_data = models.JSONField(
        default=dict,
        blank=True,
    )

    source_import = models.ForeignKey(
        BlinkitImportBatch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["product_name"]

        constraints = [
            models.UniqueConstraint(
                fields=["account", "item_id"],
                name="unique_blinkit_product_item",
            ),
        ]

        indexes = [
            models.Index(
                fields=["account", "item_id"],
            ),
            models.Index(
                fields=["account", "product_id"],
            ),
        ]

    def __str__(self):
        return f"{self.item_id} - {self.product_name}"


class BlinkitPayout(models.Model):
    account = models.ForeignKey(
        BlinkitAccount,
        on_delete=models.CASCADE,
        related_name="payouts",
    )

    payout_period_start = models.DateField()

    payout_period_end = models.DateField()

    bank_utr = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    settlement_date = models.DateField(
        blank=True,
        null=True,
    )

    settlement_status = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-payout_period_end"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "account",
                    "payout_period_start",
                    "payout_period_end",
                ],
                name="unique_blinkit_payout_period",
            ),
        ]

    def __str__(self):
        return (
            f"{self.account.name}: "
            f"{self.payout_period_start} - {self.payout_period_end}"
        )


class BlinkitOrder(models.Model):
    """
    Represents the logical Blinkit order/header.

    One BlinkitOrder can contain multiple BlinkitOrderItems.

    The Order Financial report is line-level, so financial/raw
    report data belongs to BlinkitOrderItem.
    """

    ORDER_KIND_CHOICES = [
        ("FORWARD", "Forward"),
        ("RETURN", "Return"),
        ("CANCELLED", "Cancelled"),
    ]

    # -------------------------
    # Account
    # -------------------------

    account = models.ForeignKey(
        BlinkitAccount,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    # -------------------------
    # Order Identifiers
    # -------------------------

    order_id = models.CharField(
        max_length=255,
        db_index=True,
    )

    invoice_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    # -------------------------
    # Classification
    # -------------------------

    # Our internal classification.
    #
    # FORWARD
    # RETURN
    # CANCELLED
    order_kind = models.CharField(
        max_length=20,
        choices=ORDER_KIND_CHOICES,
        default="FORWARD",
        db_index=True,
    )

    # Blinkit's original Order Type value.
    order_type = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    order_status = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
    )

    # -------------------------
    # Dates
    # -------------------------

    order_date = models.DateTimeField(
        blank=True,
        null=True,
        db_index=True,
    )

    # -------------------------
    # Return / Cancellation
    # -------------------------

    forward_invoice_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    return_invoice_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    return_order_date = models.DateTimeField(
        blank=True,
        null=True,
    )

    # -------------------------
    # Customer Information
    # -------------------------

    customer_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    customer_gst_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    customer_gst_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    supply_state = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    customer_city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    customer_state = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    # -------------------------
    # Payout
    # -------------------------

    payout = models.ForeignKey(
        BlinkitPayout,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    # -------------------------
    # Import
    # -------------------------

    source_import = models.ForeignKey(
        BlinkitImportBatch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-order_date"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "account",
                    "order_id",
                    "order_kind",
                ],
                name="unique_blinkit_order",
            ),
        ]

        indexes = [
            models.Index(
                fields=[
                    "account",
                    "order_id",
                ],
            ),
            models.Index(
                fields=[
                    "account",
                    "invoice_id",
                ],
            ),
            models.Index(
                fields=[
                    "account",
                    "order_date",
                ],
            ),
            models.Index(
                fields=[
                    "account",
                    "order_kind",
                ],
            ),
        ]

    def __str__(self):
        return f"{self.order_id} - {self.order_kind}"


class BlinkitOrderItem(models.Model):
    """
    Represents one row from Blinkit's Order Financial report.

    One Excel row == One order item / financial line.

    This model contains:
        - product relationship
        - quantity
        - sales values
        - taxes
        - marketplace fees
        - TCS/TDS
        - Blinkit's reported payout values
        - complete original Excel row
    """

    # -------------------------
    # Relationships
    # -------------------------

    order = models.ForeignKey(
        BlinkitOrder,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product = models.ForeignKey(
        BlinkitProduct,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items",
    )

    source_import = models.ForeignKey(
        BlinkitImportBatch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items",
    )

    # -------------------------
    # Product / Line Identifier
    # -------------------------

    item_id = models.CharField(
        max_length=100,
        db_index=True,
    )

    product_name = models.CharField(
        max_length=500,
        blank=True,
        null=True,
    )

    variant_description = models.CharField(
        max_length=500,
        blank=True,
        null=True,
    )

    # -------------------------
    # Quantity / Pricing
    # -------------------------

    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=3,
        default=0,
    )

    mrp = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    selling_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    total_gross_bill_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    # -------------------------
    # Tax Rates
    # -------------------------

    igst_percent = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        null=True,
        blank=True,
    )

    cgst_percent = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        null=True,
        blank=True,
    )

    sgst_percent = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        null=True,
        blank=True,
    )

    cess_percent = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        null=True,
        blank=True,
    )

    # -------------------------
    # Tax Amounts
    # -------------------------

    igst_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    cgst_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    sgst_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    cess_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    total_tax = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    # -------------------------
    # Blinkit Marketplace Fees
    # -------------------------

    commission_percent = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        null=True,
        blank=True,
    )

    commission_charge = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    commission_gst = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    shipping_charge = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    shipping_gst = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    # -------------------------
    # Tax Withholding
    # -------------------------

    tcs_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    tds_194o_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    tds_194q_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    # -------------------------
    # Blinkit Reported Values
    # -------------------------

    net_deductions = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    net_additions = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    item_level_payout = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    unsettled_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    # -------------------------
    # Original Excel Row
    # -------------------------

    raw_data = models.JSONField(
        default=dict,
        blank=True,
    )

    # -------------------------
    # Timestamps
    # -------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "order",
                    "item_id",
                ],
                name="unique_blinkit_order_item",
            ),
        ]

        indexes = [
            models.Index(
                fields=[
                    "item_id",
                ],
            ),
            models.Index(
                fields=[
                    "order",
                    "item_id",
                ],
            ),
            models.Index(
                fields=[
                    "product",
                ],
            ),
        ]

    def __str__(self):
        return f"{self.order.order_id} - {self.item_id}"


class BlinkitStorageCharge(models.Model):
    account = models.ForeignKey(
        BlinkitAccount,
        on_delete=models.CASCADE,
        related_name="storage_charges",
    )

    product = models.ForeignKey(
        BlinkitProduct,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="storage_charges",
    )

    source_import = models.ForeignKey(
        BlinkitImportBatch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="storage_charges",
    )

    item_id = models.CharField(
        max_length=100,
        db_index=True,
    )

    item_name = models.CharField(
        max_length=500,
        blank=True,
        null=True,
    )

    state = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    charge_type = models.CharField(
        max_length=50,
    )

    per_day_charge = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
    )

    total_inventory_unit_days = models.DecimalField(
        max_digits=18,
        decimal_places=4,
        null=True,
        blank=True,
    )

    unit_charge = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
    )

    regime = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    ageing_slab = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    quantity = models.DecimalField(
        max_digits=14,
        decimal_places=3,
        null=True,
        blank=True,
    )

    total_charge = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=0,
    )

    raw_data = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )
