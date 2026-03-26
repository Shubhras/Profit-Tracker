from django.db import models
from django.contrib.auth.models import User

class AmazonConnection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    seller_id = models.CharField(max_length=200)
    refresh_token = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.seller_id
    
class AmazonOrder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_id = models.CharField(max_length=200, unique=True)
    purchase_date = models.DateTimeField()
    status = models.CharField(max_length=100)
    amount = models.FloatField()
    currency = models.CharField(max_length=10)
    amazon_fee = models.FloatField(default=0)
    product_cost = models.FloatField(default=0)
    profit = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.order_id