from django.db import models
from django.contrib.auth.models import User
from cryptography.fernet import Fernet
import os
from django.conf import settings

# In a real SaaS, you'd store this in environment variables
# For demonstration, we'll generate one if not present
ENCRYPTION_KEY = os.getenv('AMAZON_ENCRYPTION_KEY', Fernet.generate_key().decode())

def encrypt_token(token: str) -> str:
    f = Fernet(ENCRYPTION_KEY.encode())
    return f.encrypt(token.encode()).decode()

def decrypt_token(encrypted_token: str) -> str:
    f = Fernet(ENCRYPTION_KEY.encode())
    return f.decrypt(encrypted_token.encode()).decode()

class AmazonAccount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='amazon_accounts')

    # Credentials for the App (Usually these are global, but stored here for flexibility)
    app_client_id = models.CharField(max_length=255)
    app_client_secret = models.CharField(max_length=255)
    
    # Seller specific tokens
    seller_central_id = models.CharField(max_length=255, blank=True, null=True)
    refresh_token_encrypted = models.TextField()
    
    # Regional Info
    region = models.CharField(max_length=10, default='NA') # NA, EU, FE
    marketplace_id = models.CharField(max_length=50, default='ATVPDKIKX0DER') # Default US
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    ads_cookie = models.TextField(null=True, blank=True)
    csrf_token = models.CharField(max_length=500, null=True, blank=True)
    csrf_data = models.TextField(null=True, blank=True) 

    def set_refresh_token(self, token):
        self.refresh_token_encrypted = encrypt_token(token)

    def get_refresh_token(self):
        return decrypt_token(self.refresh_token_encrypted)

    def __str__(self):
        return f"{self.user.username} - {self.seller_central_id} ({self.region})"


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amazon_account = models.ForeignKey(AmazonAccount, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)

    amazon_order_id = models.CharField(max_length=50)
    purchase_date = models.DateTimeField()
    last_update_date = models.DateTimeField()

    order_status = models.CharField(max_length=50)
    fulfillment_channel = models.CharField(max_length=20)

    items_shipped = models.IntegerField()
    items_unshipped = models.IntegerField()

    payment_method = models.CharField(max_length=50, null=True, blank=True)

    marketplace_id = models.CharField(max_length=50)
    channel = models.CharField(max_length=50, default="Amazon-India", db_index=True)

    # Financial Info
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency_code = models.CharField(max_length=10, null=True, blank=True)

    # Shipping Address
    buyer_name = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=10, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('amazon_account', 'amazon_order_id')

    def __str__(self):
        return f"{self.amazon_order_id} ({self.amazon_account.seller_central_id if self.amazon_account else 'No Account'})"


class SettlementOrderSummary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amazon_account = models.ForeignKey(
        AmazonAccount,
        on_delete=models.CASCADE,
        related_name='settlement_summaries'
    )

    amazon_order_id = models.CharField(max_length=50, db_index=True)

    # 🔹 Settlement period (VERY IMPORTANT)
    data_start_time = models.DateTimeField()
    data_end_time = models.DateTimeField()

    # 🔹 Financial Breakdown
    sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fees = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    refunds = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    net = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    currency_code = models.CharField(max_length=10, default="INR")

    # 🔹 Tracking
    report_id = models.CharField(max_length=100, null=True, blank=True)
    report_document_id = models.CharField(max_length=200, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            'amazon_account',
            'amazon_order_id',
            'data_start_time',
            'data_end_time'
        )
        indexes = [
            models.Index(fields=['amazon_order_id']),
            models.Index(fields=['data_start_time', 'data_end_time']),
        ]

    def __str__(self):
        return f"{self.amazon_order_id} | {self.net}"
    

class FinancialEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amazon_account = models.ForeignKey(AmazonAccount, on_delete=models.CASCADE, related_name='financial_events', null=True, blank=True)
    amazon_order_id = models.CharField(max_length=50, blank=True, null=True)
    
    # Event Category (e.g., ShipmentEvent, RefundEvent, GuaranteeClaimEvent, etc.)
    event_type = models.CharField(max_length=100)
    
    # When this event was posted by Amazon
    posted_date = models.DateTimeField()
    
    # Financial details
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency_code = models.CharField(max_length=10, blank=True, null=True)
    
    # Optional: Store the raw JSON response for full traceability
    raw_data = models.JSONField(blank=True, null=True)
    
    unique_hash = models.CharField(max_length=64, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    #  CORE BREAKDOWN FIELDS
    principal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fulfillment_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # class Meta:
    #     ordering = ['-posted_date']
    #     unique_together = ('amazon_account', 'unique_hash')

    class Meta:
        ordering = ['-posted_date']
        unique_together = ('amazon_account', 'unique_hash')
        indexes = [
            models.Index(fields=['amazon_account']),
            models.Index(fields=['posted_date']),
            models.Index(fields=['amazon_order_id']),
        ]

    def __str__(self):
        return f"{self.event_type} | {self.amazon_order_id or 'Non-Order Event'} | {self.total_amount} {self.currency_code}"


class Report(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amazon_account = models.ForeignKey(AmazonAccount, on_delete=models.CASCADE, related_name='reports', null=True, blank=True)
    amazon_report_id = models.CharField(max_length=50)
    report_type = models.CharField(max_length=100)
    processing_status = models.CharField(max_length=50)
    
    created_time = models.DateTimeField()
    data_start_time = models.DateTimeField(null=True, blank=True)
    data_end_time = models.DateTimeField(null=True, blank=True)
    
    report_document_id = models.CharField(max_length=100, null=True, blank=True)
    
    raw_data = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_time']
        unique_together = ('amazon_account', 'amazon_report_id')

    def __str__(self):
        return f"{self.report_type} | {self.amazon_report_id} | {self.processing_status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')

    order_item_id = models.CharField(max_length=50)
    seller_sku = models.CharField(max_length=100, db_index=True)
    asin = models.CharField(max_length=20, null=True, blank=True)
    title = models.CharField(max_length=500, null=True, blank=True)

    quantity_ordered = models.IntegerField()
    quantity_shipped = models.IntegerField(null=True, blank=True)

    quantity_returned = models.IntegerField(default=0)
    quantity_replaced = models.IntegerField(default=0)

    image_url = models.URLField(null=True, blank=True)

    parent_sku = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    product_name = models.TextField(null=True, blank=True)
    brand = models.CharField(max_length=100, null=True, blank=True)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # ===== ORDER API DATA =====
    item_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    item_tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # ===== REPORT DATA (CRITICAL) =====
    mrp = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    promotion_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    net_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # ===== DERIVED =====
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['seller_sku']),
            models.Index(fields=['asin']),
        ]

    def __str__(self):
        return f"{self.seller_sku} in {self.order.amazon_order_id}"
    

class ProductMapping(models.Model):
    asin = models.CharField(max_length=50,null=True,)
    seller_sku = models.CharField(max_length=100)
    parent_sku = models.CharField(max_length=100)
    product_name = models.TextField(null=True, blank=True)
    brand = models.CharField(max_length=100, null=True, blank=True)
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)  
    image_url = models.URLField(null=True, blank=True)
    account = models.ForeignKey(AmazonAccount, on_delete=models.CASCADE,null=True,  blank=True)

    class Meta:
        unique_together = ("seller_sku", "account")  
    

class AdReport(models.Model):
    sku = models.CharField(max_length=100, db_index=True)
    date = models.DateField(db_index=True)

    impressions = models.IntegerField(default=0)
    clicks = models.IntegerField(default=0)

    spend = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    ad_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    ad_orders = models.IntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['date']),
        ]



class MissingCatalogQueue(models.Model):
    seller_sku = models.CharField(max_length=255)
    asin = models.CharField(max_length=50)
    marketplace_id = models.CharField(max_length=50)
    account = models.ForeignKey(
        AmazonAccount,
        on_delete=models.CASCADE,
        related_name="catalog_queue",null=True,  blank=True)
    processed = models.BooleanField(default=False)
    image_url = models.URLField(null=True, blank=True)

    class Meta:
        unique_together = ("seller_sku", "account")


class AdCampaign(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amazon_account = models.ForeignKey(AmazonAccount, on_delete=models.CASCADE, related_name="campaigns")

    campaign_id = models.CharField(max_length=100, db_index=True)
    campaign_name = models.CharField(max_length=255)

    program_type = models.CharField(max_length=50, null=True, blank=True)  # SP, SB, etc.
    campaign_type = models.CharField(max_length=50, null=True, blank=True)
    targeting_type = models.CharField(max_length=50, null=True, blank=True)

    state = models.CharField(max_length=50, null=True, blank=True)
    status_name = models.CharField(max_length=100, null=True, blank=True)

    portfolio_name = models.CharField(max_length=255, null=True, blank=True)

    budget_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    budget_type = models.CharField(max_length=50, null=True, blank=True)

    start_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("amazon_account", "campaign_id")



class AdCampaignMetrics(models.Model):
    campaign = models.ForeignKey(AdCampaign, on_delete=models.CASCADE, related_name="metrics")

    date = models.DateField(db_index=True)

    spend = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    orders = models.IntegerField(default=0)

    cpc = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    acos = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    roas = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)

    impressions_share = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("campaign", "date")




class BusinessReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amazon_account = models.ForeignKey("AmazonAccount", on_delete=models.CASCADE)

    date = models.DateField()

    # Sales
    ordered_product_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    ordered_product_sales_b2b = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Units
    units_ordered = models.IntegerField(default=0)
    units_ordered_b2b = models.IntegerField(default=0)

    # Orders
    total_order_items = models.IntegerField(default=0)

    # Traffic
    sessions_total = models.IntegerField(default=0)

    # Conversion
    order_item_session_percentage = models.FloatField(default=0)

    # Refunds
    units_refunded = models.IntegerField(default=0)
    refund_rate = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["amazon_account", "date"]



class AmazonReport(models.Model):

    class Status(models.TextChoices):
        REQUESTED = "REQUESTED"
        IN_QUEUE = "IN_QUEUE"
        IN_PROGRESS = "IN_PROGRESS"
        DONE = "DONE"
        FAILED = "FAILED"
        CANCELLED = "CANCELLED"

    class DownloadStatus(models.TextChoices):
        PENDING = "PENDING"
        DOWNLOADED = "DOWNLOADED"
        PARSED = "PARSED"
        ERROR = "ERROR"

    account = models.ForeignKey(AmazonAccount, on_delete=models.CASCADE, related_name="amazon_reports")

    # Amazon identifiers
    report_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    report_document_id = models.CharField(max_length=100, null=True, blank=True)

    # Report meta
    report_type = models.CharField(max_length=100)
    marketplace_id = models.CharField(max_length=50)

    # Filters used to generate report
    data_start_time = models.DateTimeField(null=True, blank=True)
    data_end_time = models.DateTimeField(null=True, blank=True)

    # Status tracking
    processing_status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.REQUESTED
    )

    download_status = models.CharField(
        max_length=20,
        choices=DownloadStatus.choices,
        default=DownloadStatus.PENDING
    )

    # Amazon timestamps
    created_time = models.DateTimeField(null=True, blank=True)
    processing_start_time = models.DateTimeField(null=True, blank=True)
    processing_end_time = models.DateTimeField(null=True, blank=True)

    # Error handling
    error_message = models.TextField(null=True, blank=True)
    retry_count = models.IntegerField(default=0)

    # Local system tracking
    is_active = models.BooleanField(default=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.report_type} - {self.report_id or 'pending'}"