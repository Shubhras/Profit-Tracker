import uuid
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.utils.text import slugify
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

    STATUS_CHOICES = [
        ('inactive', 'Inactive'),
        ('active', 'Active'),
    ]

    subcription_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True
    )

    # Any name admin wants
    
    plan_name = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    slug = models.SlugField(
        unique=True,
        null=True,
        blank=True
    )
    # plan_name = models.CharField(
    #     max_length=100,
    #     unique=True
    # )
    # slug = models.SlugField(
    #     max_length=150,
    #     unique=True,
    #     blank=True,
    #     null=True
    # )

    description = models.TextField(
        blank=True,
        null=True
    )

    monthly_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )

    annual_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )

    features = models.JSONField(default=list)

    terms_and_conditions = models.JSONField(
        default=list,
        blank=True
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='inactive'
    )

    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def save(self, *args, **kwargs):

        if not self.subcription_id:
            self.subcription_id = f"SUB-{uuid.uuid4().hex[:6].upper()}"

        if not self.slug:
            base_slug = slugify(self.plan_name)
            slug = base_slug
            counter = 1

            while SubscriptionPlan.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.plan_name or f"Subscription Plan {self.pk}"

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
        ("return_policy", "Return Policy"),
        ("contact_us", "Contact Us"),
    ]

    title = models.CharField(max_length=50, choices=TITLE_CHOICES)
    slug = models.SlugField(unique=True)
    content = models.TextField(help_text="HTML Content")
    language = models.CharField(max_length=10, default='en')
    version = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return dict(self.TITLE_CHOICES).get(self.title, self.title)
    

class Notification(models.Model):

    NOTIFICATION_TYPE_CHOICES = (
        ("general", "General"),
        ("update", "Website Update"),
        ("maintenance", "Maintenance"),
        ("promotion", "Promotion"),
        ("subscription", "Subscription"),
    )

    title = models.CharField(max_length=255)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPE_CHOICES,
        default="general"
    )

    send_to_all = models.BooleanField(default=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_notifications"
    )

    def __str__(self):
        return self.title
    
    
class UserNotification(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name="user_notifications"
    )

    is_read = models.BooleanField(default=False)

    read_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = ("user", "notification")

    def __str__(self):
        return f"{self.user.email} - {self.notification.title}"
        
    
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


class Module(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    slug = models.SlugField(
        unique=True,
        blank=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    

class SubModule(models.Model):

    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="submodules"
    )

    name = models.CharField(max_length=100)

    slug = models.SlugField(
        blank=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (
            "module",
            "name"
        )

    def save(self, *args, **kwargs):

        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.module.name} - {self.name}"
    


class UserModulePermission(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="module_permissions"
    )

    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    submodule = models.ForeignKey(
        SubModule,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    can_view = models.BooleanField(default=True)

    can_create = models.BooleanField(default=False)

    can_update = models.BooleanField(default=False)

    can_delete = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            "user",
            "module",
            "submodule"
        )

    def __str__(self):
        return f"{self.user.email}"
        
        

class SupportTicket(models.Model):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="support_tickets"
    )
    ticket_id = models.CharField(
        max_length=50,
        unique=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    document = models.FileField(
        upload_to="support_tickets/",
        null=True,
        blank=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="open"
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default="medium"
    )
    admin_note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.ticket_id:
            self.ticket_id = f"TKT-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_id} - {self.title}"


class SubUser(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="subuser_profile"
    )
    parent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sub_users"
    )
    name = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=15)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (Sub-user of {self.parent.email})"