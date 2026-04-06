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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='amazon_account')
    
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
        return f"Amazon Account: {self.user.username}"
