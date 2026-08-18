from datetime import timedelta

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

from myntra.constants import MyntraReports, ReportStatus


class MyntraConnection(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="myntra_connection",
    )

    merchant_id = models.CharField(max_length=200, blank=True, null=True)
    secret_key = models.TextField(blank=True, null=True)
    partner_type = models.CharField(max_length=50, blank=True, null=True)
    warehouse_code = models.CharField(max_length=50, blank=True, null=True)
    access_token = models.TextField(blank=True, null=True)
    # NEW
    refresh_token = models.TextField(blank=True, null=True)

    # NEW
    access_token_expires_at = models.DateTimeField(
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def access_token_is_valid(self):
        if not self.access_token:
            return False

        if not self.access_token_expires_at:
            return False

        # Treat it as expired 24 hours early.
        return timezone.now() < self.access_token_expires_at - timedelta(hours=24)

    def __str__(self):
        return f"MyntraConnection(user={self.user})"


# This model is in use
class MyntraOrder(models.Model):
    """
    Represents a single row from the Seller Orders Report.
    One row == One Order Line.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="myntra_orders",
        null=True,
        blank=True,
    )

    myntra_connection = models.ForeignKey(
        MyntraConnection,
        on_delete=models.CASCADE,
        related_name="order_reports",
    )

    # -------------------------
    # Identifiers
    # -------------------------
    seller_id = models.CharField(max_length=100, null=True, blank=True)
    warehouse_id = models.CharField(max_length=100, null=True, blank=True)
    po_type = models.CharField(max_length=100, null=True, blank=True)

    store_order_id = models.CharField(max_length=100, null=True, blank=True)
    order_release_id = models.CharField(max_length=100, null=True, blank=True)

    order_line_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
    )

    seller_order_id = models.CharField(
        max_length=100,
        db_index=True,
    )

    order_id_fk = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )

    # -------------------------
    # Product
    # -------------------------
    style_id = models.CharField(max_length=100, null=True, blank=True)
    seller_sku_code = models.CharField(max_length=255, db_index=True)
    sku_id = models.CharField(max_length=100, null=True, blank=True)
    myntra_sku_code = models.CharField(max_length=255, null=True, blank=True)

    size = models.CharField(max_length=50, null=True, blank=True)
    vendor_article_number = models.CharField(max_length=255, null=True, blank=True)

    brand = models.CharField(max_length=255, null=True, blank=True)
    style_name = models.CharField(max_length=255, null=True, blank=True)
    article_type = models.CharField(max_length=255, null=True, blank=True)

    # -------------------------
    # Status / Logistics
    # -------------------------
    order_status = models.CharField(max_length=100, null=True, blank=True)

    packet_id = models.CharField(max_length=100, null=True, blank=True)
    seller_packet_id = models.CharField(max_length=100, null=True, blank=True)

    courier_code = models.CharField(max_length=100, null=True, blank=True)
    order_tracking_number = models.CharField(max_length=255, null=True, blank=True)

    seller_warehouse_id = models.CharField(max_length=100, null=True, blank=True)

    cancellation_reason_id = models.CharField(max_length=100, null=True, blank=True)
    cancellation_reason = models.TextField(null=True, blank=True)

    # -------------------------
    # Dates
    # -------------------------
    created_on = models.DateTimeField(null=True, blank=True)

    packed_on = models.DateTimeField(null=True, blank=True)
    fmpu_date = models.DateTimeField(null=True, blank=True)
    inscanned_on = models.DateTimeField(null=True, blank=True)

    shipped_on = models.DateTimeField(null=True, blank=True)
    delivered_on = models.DateTimeField(null=True, blank=True)
    cancelled_on = models.DateTimeField(null=True, blank=True)

    rto_creation_date = models.DateTimeField(null=True, blank=True)
    lost_date = models.DateTimeField(null=True, blank=True)
    return_creation_date = models.DateTimeField(null=True, blank=True)

    # -------------------------
    # Financials
    # -------------------------
    final_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    total_mrp = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    coupon_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    shipping_charge = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    gift_charge = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    tax_recovery = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    seller_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # -------------------------
    # Customer
    # -------------------------
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    zipcode = models.CharField(max_length=20, null=True, blank=True)

    # -------------------------
    # Original CSV Row
    # -------------------------
    raw_data = models.JSONField(default=dict, blank=True)

    imported_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_on"]
        indexes = [
            models.Index(fields=["seller_order_id"]),
            models.Index(fields=["seller_sku_code"]),
            models.Index(fields=["order_status"]),
            models.Index(fields=["created_on"]),
        ]

    def __str__(self):
        return f"{self.seller_order_id} - {self.order_line_id}"









# This model is in use
class MyntraReturn(models.Model):
    myntra_connection = models.ForeignKey(
        MyntraConnection,
        on_delete=models.CASCADE,
        related_name="returns",
    )

    # Product Information
    seller_id = models.CharField(max_length=50, blank=True, null=True)
    warehouse_id = models.CharField(max_length=50, blank=True, null=True)
    model = models.CharField(max_length=50, blank=True, null=True)
    myntra_sku_code = models.CharField(max_length=100, blank=True, null=True)
    seller_sku_code = models.CharField(max_length=100, blank=True, null=True)
    style_id = models.CharField(max_length=50, blank=True, null=True)
    sku_id = models.CharField(max_length=50, blank=True, null=True)
    brand = models.CharField(max_length=255, blank=True, null=True)

    # Dates
    order_created_date = models.DateField(blank=True, null=True)
    inscanned_on = models.DateField(blank=True, null=True)
    fmpu_date = models.DateField(blank=True, null=True)
    order_delivered_date = models.DateField(blank=True, null=True)
    return_created_date = models.DateField(blank=True, null=True)
    refunded_date = models.DateField(blank=True, null=True)
    order_rto_date = models.DateField(blank=True, null=True)

    # Return Details
    is_refunded = models.BooleanField(default=False)
    exchange_id = models.CharField(max_length=100, blank=True, null=True)

    # Order Details
    order_id = models.CharField(max_length=100, blank=True, null=True)
    order_group_id = models.CharField(max_length=100, blank=True, null=True)

    # Unique identifier
    order_line_id = models.CharField(
        max_length=100,
        unique=True,
    )

    seller_order_id = models.CharField(max_length=100, blank=True, null=True)

    # Status
    type = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=100, blank=True, null=True)

    # Packet Information
    store_packet_id = models.CharField(max_length=100, blank=True, null=True)
    seller_packet_id_fk = models.CharField(max_length=100, blank=True, null=True)

    quantity = models.PositiveIntegerField(default=0)

    # Return Metadata
    return_id = models.CharField(max_length=100, blank=True, null=True)
    return_mode = models.CharField(max_length=100, blank=True, null=True)
    return_reason = models.TextField(blank=True, null=True)
    return_status = models.CharField(max_length=100, blank=True, null=True)

    # Tracking
    forward_tracking_number = models.CharField(max_length=100, blank=True, null=True)
    return_tracking_number = models.CharField(max_length=100, blank=True, null=True)

    # Logistics
    master_bag_id = models.CharField(max_length=100, blank=True, null=True)
    lmdo_status = models.CharField(max_length=100, blank=True, null=True)
    lmdo_last_modified_on = models.DateField(blank=True, null=True)

    gatepass_id = models.CharField(max_length=100, blank=True, null=True)
    gatepass_status = models.CharField(max_length=100, blank=True, null=True)
    gatepass_type = models.CharField(max_length=100, blank=True, null=True)
    gatepass_lastmodified = models.DateField(blank=True, null=True)

    # Raw row for debugging/auditing
    raw_data = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.order_line_id} ({self.type})"


# This model is in use
class MyntraListing(models.Model):
    myntra_connection = models.ForeignKey(
        MyntraConnection,
        on_delete=models.CASCADE,
        related_name="listings",
    )

    article_type = models.CharField(max_length=100, blank=True, null=True)
    brand = models.CharField(max_length=255, blank=True, null=True)

    style_status = models.CharField(max_length=20, blank=True, null=True)
    style_status_description = models.CharField(max_length=255, blank=True, null=True)

    style_id = models.CharField(max_length=50, blank=True, null=True)

    style_name = models.TextField(blank=True, null=True)

    size = models.CharField(max_length=50, blank=True, null=True)

    seller_sku_code = models.CharField(max_length=255, blank=True, null=True)

    sku_id = models.CharField(
        max_length=50,
        unique=True,
    )

    sku_code = models.CharField(max_length=255, blank=True, null=True)

    van = models.CharField(max_length=255, blank=True, null=True)

    mrp = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    is_active = models.BooleanField(default=False)

    listing_status = models.CharField(max_length=20, blank=True, null=True)

    listing_status_description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    seller_listing_comments = models.TextField(
        blank=True,
        null=True,
    )

    style_catalogued_date = models.DateField(blank=True, null=True)

    lot_uploaded_date = models.DateField(blank=True, null=True)

    style_onhold_date = models.DateField(blank=True, null=True)

    onhold_reason = models.TextField(blank=True, null=True)

    turn_around_time = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    raw_data = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["seller_sku_code"]

    def __str__(self):
        return f"{self.seller_sku_code} ({self.size})"


# This model is in use
class MyntraPaymentTransaction(models.Model):
    myntra_connection = models.ForeignKey(
        MyntraConnection,
        on_delete=models.CASCADE,
        related_name="payment_transactions",
    )

    transaction_key = models.CharField(
        max_length=64,
        db_index=True,
        blank=True,
        null=True,
    )

    neft_ref = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    payment_date = models.DateField(
        blank=True,
        null=True,
    )

    order_line_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    seller_order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    store_order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    return_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    order_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    customer_paid_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    settled_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    commission = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    shipping_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )
    payment_method = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )
    pick_and_pack_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    fixed_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    payment_gateway_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    logistics_commission = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    igst = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    cgst = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    sgst = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    igst_tcs = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    cgst_tcs = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    sgst_tcs = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    tds = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    seller_discount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    platform_discount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    total_discount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    comments = models.TextField(
        blank=True,
        null=True,
    )

    nod_comment = models.TextField(
        blank=True,
        null=True,
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

    class Meta:
        ordering = [
            "-payment_date",
            "order_line_id",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "myntra_connection",
                    "transaction_key",
                ],
                name="unique_myntra_payment_transaction_key",
            )
        ]

    def __str__(self):
        return f"{self.order_line_id} - {self.settled_amount}"


# This model is in use
class MyntraReportQueue(models.Model):
    myntra_connection = models.ForeignKey(
        MyntraConnection,
        on_delete=models.CASCADE,
        related_name="report_queue",
    )

    report_name = models.CharField(
        max_length=100,
        choices=MyntraReports.CHOICES,
    )

    partner_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    from_date = models.DateField()
    to_date = models.DateField()

    job_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
    )

    download_url = models.TextField(
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=ReportStatus.CHOICES,
        default=ReportStatus.PENDING,
    )

    error_message = models.TextField(
        blank=True,
        null=True,
    )

    scheduled_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    completed_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (
            "myntra_connection",
            "report_name",
            "from_date",
            "to_date",
        )

    def __str__(self):
        return (
            f"{self.report_name} | {self.from_date} -> {self.to_date} ({self.status})"
        )
