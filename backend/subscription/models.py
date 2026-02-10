from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plan_name = models.CharField(max_length=50, null=True, blank=True)
    is_paid = models.BooleanField(default=True)
    status = models.CharField(max_length=20)

    razorpay_plan_id = models.CharField(max_length=100)
    razorpay_subscription_id = models.CharField(max_length=100, blank=True, null=True)

    # ✅ NEW FIELDS (store payment details)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=200, blank=True, null=True)

    status = models.CharField(max_length=30, default="created")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)