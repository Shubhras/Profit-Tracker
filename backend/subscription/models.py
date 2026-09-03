from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()
from user_auth.models import SubscriptionPlan




# class UserSubscription(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     plan_name = models.CharField(max_length=50, null=True, blank=True)
#     is_paid = models.BooleanField(default=True)
#     status = models.CharField(max_length=20)

#     razorpay_plan_id = models.CharField(max_length=100)
#     razorpay_subscription_id = models.CharField(max_length=100, blank=True, null=True)

#     # ✅ NEW FIELDS (store payment details)
#     razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
#     razorpay_signature = models.CharField(max_length=200, blank=True, null=True)

#     status = models.CharField(max_length=30, default="created")

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)


class UserSubscription(models.Model):

    STATUS_CHOICES = (
        ("created", "Created"),
        ("active", "Active"),
        ("cancelled", "Cancelled"),
        ("expired", "Expired"),
        ("inactive", "Inactive"),
    )

    BILLING_CYCLE_CHOICES = (
        ("monthly", "Monthly"),
        ("annual", "Annual"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="subscriptions"
    )

    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name="user_subscriptions", null=True
    )

    next_plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.SET_NULL,
        related_name="pending_user_subscriptions",
        null=True,
        blank=True
    )

    billing_cycle = models.CharField(
        max_length=20,
        choices=BILLING_CYCLE_CHOICES,default="monthly"
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    is_paid = models.BooleanField(default=False)

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="created"
    )

    razorpay_plan_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    razorpay_subscription_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    razorpay_payment_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )
    
    razorpay_order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    razorpay_signature = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    start_date = models.DateTimeField(
        null=True,
        blank=True
    )

    end_date = models.DateTimeField(
        null=True,
        blank=True
    )

    next_billing_date = models.DateTimeField(
        null=True,
        blank=True
    )

    auto_renew = models.BooleanField(default=True)
    reminder_3day_sent = models.BooleanField(default=False)
    reminder_1day_sent = models.BooleanField(default=False)
    expired_email_sent = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        email = getattr(self.user, 'email', str(self.user)) if self.user else "No User"
        plan_name = self.plan.plan_name if self.plan else "No Plan"
        return f"{email} - {plan_name}"
