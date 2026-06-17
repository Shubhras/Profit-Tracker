import uuid
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

# ✅ OPTIONAL / LEGACY (You can keep or remove later)
# This token system is not needed if you use JWT (Access + Refresh).
class UserAuthToken(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="legacy_token"
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.token)


# ✅ User Profile (Your actual user details)
class UserProfile(models.Model):
    SUBSCRIPTION_STATUS_CHOICES = [
        ('inactive', 'Inactive - No plan chosen'),
        ('trial', 'Free Trial Active'),
        ('paid', 'Paid Subscription Active'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    name = models.CharField(max_length=100)
    business_name = models.CharField(max_length=150)
    mobile_number = models.CharField(max_length=15)
    #gst_number = models.CharField(max_length=20, blank=True, null=True)

    address = models.TextField()
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    pin_code = models.CharField(max_length=10)

    accepted_terms = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    
    subscriptiontype=models.ForeignKey("SubscriptionPlan", on_delete=models.SET_NULL, null=True, blank=True,)
    subscription_active = models.BooleanField(default=False,null=True, blank=True,)
    trial_start_date = models.DateTimeField(null=True, blank=True)  
    trial_end_date = models.DateTimeField(null=True, blank=True)# Free trial start date
    is_paid_subscription_active=models.BooleanField(default=False,null=True, blank=True,)
    subscription_status=models.CharField(max_length=50,choices=SUBSCRIPTION_STATUS_CHOICES,default='inactive')

    def __str__(self):
        return self.name
    

class PasswordResetRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > (self.created_at + timedelta(minutes=60))
    


class SubscriptionPlan(models.Model):
    SUBSCRIPTION_TYPE_CHOICES = [
        ('monthly', 'Monthly'),
        ('annual', 'Annual'),
    ]
    STATUS_CHOICES = [
        ('inactive', 'Inactive'),
        ('active', 'Active'),
    ]
    subscription_type = models.CharField(max_length=10, choices=SUBSCRIPTION_TYPE_CHOICES)
    subcription_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='inactive')
    monthlyPlan = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    annualPlan = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    features = models.JSONField(default=list)  
    is_active = models.BooleanField(default=True, null=True, blank=True)
    is_deleted = models.BooleanField(default=False, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return f"{self.subscription_type} Plan"
    
    def save(self, *args, **kwargs):
        if not self.subcription_id:
            prefix = 'SUB'
            uid = uuid.uuid4().hex[:6].upper()
            self.subcription_id = f"{prefix}-{uid}"
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Subscription Plan"
        verbose_name_plural = "Subscription Plans"


class LegalDocument(models.Model):
    TITLE_CHOICES = [
        ("terms", "Terms and Conditions"),
        ("privacy_policy", "Privacy Policy"),
        ("about_us", "About Us"),
        ("third_party_policy", "Third Party Policy"),
        ("plateform_policy", "Platform Policy"),
    ]

    title = models.CharField(max_length=50, choices=TITLE_CHOICES)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    language = models.CharField(max_length=10, default='en')
    version = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return dict(self.TITLE_CHOICES).get(self.title, self.title) 
    



# class AdminNotification(models.Model):
#     """
#     Stores system notifications sent to Admin(s)
#     for user/professional actions, payments, reports, etc.
#     """

#     NOTIFICATION_TYPES = [
#         ('user_login', 'User Login'),
#         ('user_registration', 'User Registration'),
#         ('ticket_raise', 'Ticket Raise'),
#         ('payment_succesfull', 'Payment Succesfull'),
#         ('custom', 'Custom Message'),

#     ]

#     STATUS_CHOICES = [
#         ('pending', 'Pending'),
#         ('sent', 'Sent'),
#         ('failed', 'Failed'),
#     ]

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

#     receiver = models.ForeignKey('UserProfile', on_delete=models.SET_NULL, null=True,
#         blank=True,related_name='admin_notifications',help_text="Admin receiving this notification")

#     title = models.CharField(max_length=150, blank=True, null=True)
#     message = models.TextField()
#     notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    
#     # Generic sender (could be User, Professional, etc.)
#     sender_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
#     sender_object_id = models.PositiveIntegerField()
#     sender = GenericForeignKey('sender_content_type', 'sender_object_id')


#     # Status tracking
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     is_read = models.BooleanField(default=False)
#     is_deleted = models.BooleanField(default=False)
#     sent_at = models.DateTimeField(blank=True, null=True)
#     read_at = models.DateTimeField(blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     error_message = models.TextField(blank=True, null=True)

#     class Meta:
#         ordering = ['-created_at']
#         verbose_name = "Admin Notification"
#         verbose_name_plural = "Admin Notifications"

#     def __str__(self):
#         return f"[{self.get_notification_type_display()}] {self.title or self.message[:30]}"

#     # Helper methods
#     def mark_as_read(self):
#         """Mark notification as read"""
#         self.is_read = True
#         self.read_at = timezone.now()
#         self.save(update_fields=['is_read', 'read_at'])

#     def mark_as_sent(self, success=True, error=None):
#         """Mark notification as sent or failed"""
#         self.status = 'sent' if success else 'failed'
#         self.sent_at = timezone.now()
#         self.error_message = error
#         self.save(update_fields=['status', 'sent_at', 'error_message'])





class Promocode(models.Model):
    PROMO_TYPE_CHOICES = [
        ('fix', 'Fixed Amount'),
        ('discount', 'Discount Percentage'),
    ]

    promocode = models.CharField(max_length=255, unique=True, null=True, blank=True)
    title = models.CharField(max_length=255, null=True, blank=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    image = models.ImageField(upload_to='Promocode_images', null=True, blank=True)
    promoType = models.CharField(max_length=20, choices=PROMO_TYPE_CHOICES, default='fix')
    specificAmount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # for discount
    startDateTime = models.DateTimeField(null=True, blank=True)
    endDateTime = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.promocode or "No Promo"


        


    