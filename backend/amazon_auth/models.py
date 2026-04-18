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

    class Meta:
        ordering = ['-posted_date']
        unique_together = ('amazon_account', 'unique_hash')

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
    
    order_item_id = models.CharField(max_length=50) # Amazon's unique ID for the item entry
    seller_sku = models.CharField(max_length=100)
    title = models.CharField(max_length=500, null=True, blank=True)
    asin = models.CharField(max_length=20, null=True, blank=True) 
    
    quantity_ordered = models.IntegerField()
    quantity_shipped = models.IntegerField(null=True, blank=True)
    image_url = models.URLField(null=True, blank=True)
    # Financials per item
    item_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    item_tax = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    shipping_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.seller_sku} in {self.order.amazon_order_id}"
    
    