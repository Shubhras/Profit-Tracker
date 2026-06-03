from django.db import models
from django.contrib.auth.models import User
from cryptography.fernet import Fernet
import os
from django.conf import settings
from django.db.models import UniqueConstraint

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

    amazon_refresh_token = models.TextField(blank=True, null=True)
    
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

    event_type = models.CharField(max_length=100)  # Event Category (e.g., ShipmentEvent, RefundEvent, GuaranteeClaimEvent, etc.)
    posted_date = models.DateTimeField() # When this event was posted by Amazon

    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency_code = models.CharField(max_length=10, blank=True, null=True)
    raw_data = models.JSONField(blank=True, null=True)  # Optional: Store the raw JSON response for full traceability
    unique_hash = models.CharField(max_length=64, unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    principal = models.DecimalField(max_digits=12, decimal_places=2, default=0) 
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_income = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fulfillment_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    event_group = models.CharField(max_length=50, null=True, blank=True) # SALE / REFUND / CLAIM / FEE / ADJUSTMENT
    quantity = models.IntegerField(default=0)

    promotion_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    


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
    parent_asin = models.CharField(max_length=50, null=True, blank=True)
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
    shipping_income = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_expense = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # ===== REPORT DATA (CRITICAL) =====
    mrp = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    promotion_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    net_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # ===== DERIVED =====
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    quantity_claimed = models.IntegerField(default=0)
    claim_type = models.CharField(max_length=50, null=True, blank=True)
    total_claimed_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    commission_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fulfillment_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payout_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        indexes = [
            models.Index(fields=['seller_sku']),
            models.Index(fields=['asin']),
        ]

    def __str__(self):
        return f"{self.seller_sku} in {self.order.amazon_order_id}"


# models.py

class AmazonEstimatedFee(models.Model):
    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.CASCADE,
        related_name="estimated_fees"
    )

    amazon_account = models.ForeignKey(
        AmazonAccount,
        on_delete=models.CASCADE,
        related_name="estimated_fees",
        null=True,
        blank=True
    )

    seller_sku = models.CharField(max_length=255, db_index=True)
    asin = models.CharField(max_length=50, null=True, blank=True)
    marketplace_id = models.CharField(max_length=50)

    currency = models.CharField(max_length=10, default="INR")

    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    total_fees = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    referral_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    closing_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    per_item_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    fba_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fba_pick_pack_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fba_weight_handling_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    raw_response = models.JSONField(default=dict)

    estimated_at = models.DateTimeField(null=True, blank=True)
    fulfillment_channel=models.CharField( max_length=10,null=True,blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["seller_sku"]),
            models.Index(fields=["asin"]),
        ]

    def __str__(self):
        return f"{self.seller_sku} - {self.total_fees}"
    
    
class ProductMapping(models.Model):
    parent_asin = models.CharField(max_length=50, null=True, blank=True)
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
    parent_asin = models.CharField(max_length=50, null=True, blank=True)
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


class ReportRequest(models.Model):
    amazon_account = models.ForeignKey("AmazonAccount", on_delete=models.CASCADE)

    report_type = models.CharField(max_length=100)
    report_id = models.CharField(max_length=100, null=True, blank=True)

    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    status = models.CharField(max_length=50, default="REQUESTED")  
    # REQUESTED | IN_PROGRESS | DONE | FAILED

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["amazon_account", "report_type"]),
        ]

        
class BusinessReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amazon_account = models.ForeignKey("AmazonAccount", on_delete=models.CASCADE)

    date = models.DateField()

    parent_asin = models.CharField(max_length=20,null=True,)
    child_asin = models.CharField(max_length=20, null=True, blank=True, default="")

    title = models.TextField(null=True, blank=True)

    # SALES
    ordered_product_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    ordered_product_sales_b2b = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # UNITS
    units_ordered = models.IntegerField(default=0)
    units_ordered_b2b = models.IntegerField(default=0)

    # ORDERS
    total_order_items = models.IntegerField(default=0)
    total_order_items_b2b = models.IntegerField(default=0)

    # TRAFFIC
    sessions_total = models.IntegerField(default=0)
    sessions_total_b2b = models.IntegerField(default=0)

    page_views_total = models.IntegerField(default=0)
    page_views_total_b2b = models.IntegerField(default=0)

    # DEVICE SPLIT
    sessions_mobile_app = models.IntegerField(default=0)
    sessions_browser = models.IntegerField(default=0)

    page_views_mobile_app = models.IntegerField(default=0)
    page_views_browser = models.IntegerField(default=0)

    # PERCENTAGES
    session_percentage_total = models.FloatField(default=0)
    page_views_percentage_total = models.FloatField(default=0)

    # CONVERSION
    unit_session_percentage = models.FloatField(default=0)
    unit_session_percentage_b2b = models.FloatField(default=0)

    # BUY BOX
    buy_box_percentage = models.FloatField(default=0)
    buy_box_percentage_b2b = models.FloatField(default=0)

    # REFUNDS
    units_refunded = models.IntegerField(default=0)
    refund_rate = models.FloatField(default=0)

    # SHIPPING
    units_shipped = models.IntegerField(default=0)
    orders_shipped = models.IntegerField(default=0)
    shipped_product_sales = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    report_datetime = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=["amazon_account", "date", "parent_asin", "child_asin"],
                name="unique_business_report"
            )
        ]



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
    

class ReturnItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amazon_account = models.ForeignKey(AmazonAccount, on_delete=models.CASCADE)

    return_id = models.CharField(max_length=255, unique=True)

    amazon_order_id = models.CharField(max_length=255, db_index=True)
    seller_sku = models.CharField(max_length=255, db_index=True)

    quantity = models.IntegerField(default=0)

    status = models.CharField(max_length=100)
    return_type = models.CharField(max_length=50)
    return_reason = models.CharField(max_length=255, null=True, blank=True)

    tracking_id = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    raw_data = models.JSONField(null=True, blank=True)

    created_db = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amazon_order_id} - {self.seller_sku}"
    



class ProductPricing(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    asin = models.CharField(max_length=255)
    sku = models.CharField(max_length=255)
    marketplace_id = models.CharField(max_length=100, default="A21TJRUUN4KGV")
    listing_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    landed_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    shipping_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    regular_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    currency = models.CharField(max_length=20, default="INR")

    fulfillment_channel = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    item_condition = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'asin', 'sku']    


# models.py

class AmazonCatalogDetails(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    asin = models.CharField(max_length=50, db_index=True)
    parent_asin = models.CharField(max_length=50, null=True, blank=True)

    marketplace_id = models.CharField(max_length=50)

    # BASIC DETAILS
    brand = models.CharField(max_length=255, null=True, blank=True)
    item_name = models.TextField(null=True, blank=True)
    model_name = models.CharField(max_length=255, null=True, blank=True)
    model_number = models.CharField(max_length=255, null=True, blank=True)

    image_url = models.URLField(null=True, blank=True)

    manufacturer = models.CharField(max_length=255, null=True, blank=True)

    color = models.CharField(max_length=255, null=True, blank=True)
    material = models.CharField(max_length=255, null=True, blank=True)
    size = models.CharField(max_length=255, null=True, blank=True)

    item_type_name = models.CharField(max_length=255, null=True, blank=True)

    # DESCRIPTION
    bullet_points = models.JSONField(default=list, blank=True)
    product_description = models.TextField(null=True, blank=True)

    # DIMENSIONS
    item_weight = models.FloatField(null=True, blank=True)
    item_weight_unit = models.CharField(max_length=50, null=True, blank=True)

    package_weight = models.FloatField(null=True, blank=True)
    package_weight_unit = models.CharField(max_length=50, null=True, blank=True)

    item_dimensions = models.JSONField(default=dict, blank=True)
    package_dimensions = models.JSONField(default=dict, blank=True)

    # EXTRA
    number_of_items = models.IntegerField(null=True, blank=True)

    batteries_required = models.BooleanField(null=True, blank=True)

    care_instructions = models.TextField(null=True, blank=True)

    special_features = models.JSONField(default=list, blank=True)

    recommended_uses = models.TextField(null=True, blank=True)

    # SALES RANK
    sales_rank = models.IntegerField(null=True, blank=True)
    sales_rank_category = models.CharField(max_length=255, null=True, blank=True)

    display_group_rank = models.IntegerField(
        null=True,
        blank=True
    )

    display_group_rank_title = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    # COMPLETE API RESPONSE
    raw_response = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "asin", "marketplace_id")

    def __str__(self):
        return self.asin        
    

# amazon_auth/models.py

class AmazonListingItem(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    amazon_account = models.ForeignKey(
        AmazonAccount,
        on_delete=models.CASCADE,
        related_name="listing_items"
    )
    sku = models.CharField(max_length=255, db_index=True)
    asin = models.CharField(max_length=50, null=True, blank=True)
    marketplace_id = models.CharField(max_length=50, null=True, blank=True)
    product_type = models.CharField(max_length=255, null=True, blank=True)
    condition_type = models.CharField(max_length=100, null=True, blank=True)
    status = models.JSONField(default=list, blank=True)
    fnsku = models.CharField(max_length=255, null=True, blank=True)
    item_name = models.TextField(null=True, blank=True)
    image_url = models.URLField(null=True, blank=True)
    created_date = models.DateTimeField(null=True, blank=True)
    last_updated_date = models.DateTimeField(null=True, blank=True)
    attributes = models.JSONField(default=dict, blank=True)
    issues = models.JSONField(default=list, blank=True)
    offers = models.JSONField(default=list, blank=True)
    fulfillment_availability = models.JSONField(default=list, blank=True)
    relationships = models.JSONField(default=list, blank=True)
    product_types = models.JSONField(default=list, blank=True)
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    standard_cost = models.FloatField(default=0)
    gst_rate = models.FloatField(default=0)
    tcs = models.FloatField(default=0)
    region = models.TextField(null=True, blank=True)
    shiping_estimate = models.FloatField(default=0)
    step_level = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ("amazon_account", "sku", "marketplace_id")

    def __str__(self):
        return f"{self.sku} - {self.asin}"



from django.db import models
from amazon_auth.models import AmazonAccount


class AmazonTransaction(models.Model):

    amazon_account = models.ForeignKey(
        AmazonAccount,
        on_delete=models.CASCADE,
        related_name="transactions"
    )

    transaction_id = models.CharField(
        max_length=255,
        unique=True
    )

    transaction_type = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    transaction_status = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    description = models.TextField(
        null=True,
        blank=True
    )

    posted_date = models.DateTimeField(
        null=True,
        blank=True
    )

    total_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        null=True,
        blank=True
    )

    currency_code = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )

    raw_payload = models.JSONField(
        default=dict,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.transaction_id
    

class AmazonTransactionRelatedIdentifier(models.Model):

    transaction = models.ForeignKey(
        AmazonTransaction,
        on_delete=models.CASCADE,
        related_name="related_identifiers"
    )

    identifier_name = models.CharField(
        max_length=255
    )

    identifier_value = models.CharField(
        max_length=255
    )    
    
    
class AmazonTransactionBreakdown(models.Model):

    transaction = models.ForeignKey(
        AmazonTransaction,
        on_delete=models.CASCADE,
        related_name="breakdowns"
    )

    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children"
    )

    breakdown_type = models.CharField(
        max_length=255
    )

    amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        null=True,
        blank=True
    )

    currency_code = models.CharField(
        max_length=20,
        null=True,
        blank=True
    )    
class AmazonTransactionContext(models.Model):

    transaction = models.ForeignKey(
        AmazonTransaction,
        on_delete=models.CASCADE,
        related_name="contexts"
    )

    context_type = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    asin = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    sku = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    quantity_shipped = models.IntegerField(
        null=True,
        blank=True
    )

    fulfillment_network = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    raw_context = models.JSONField(
        default=dict,
        blank=True
    )
            