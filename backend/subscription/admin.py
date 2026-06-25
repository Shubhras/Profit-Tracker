from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import UserSubscription


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "plan",
        "billing_cycle",
        "amount",
        "is_paid",
        "status",
        "start_date",
        "end_date",
        "created_at",
    )

    list_filter = (
        "billing_cycle",
        "is_paid",
        "status",
        "created_at",
    )

    search_fields = (
        "user__email",
        "user__username",
        "plan__plan_name",
        "razorpay_plan_id",
        "razorpay_subscription_id",
        "razorpay_payment_id",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "razorpay_payment_id",
        "razorpay_signature",
        "razorpay_subscription_id",
    )

    ordering = ("-created_at",)

    list_per_page = 25

    fieldsets = (
        (
            "Subscription Information",
            {
                "fields": (
                    "user",
                    "plan",
                    "billing_cycle",
                    "amount",
                    "is_paid",
                    "status",
                )
            },
        ),
        (
            "Razorpay Details",
            {
                "fields": (
                    "razorpay_plan_id",
                    "razorpay_subscription_id",
                    "razorpay_payment_id",
                    "razorpay_signature",
                )
            },
        ),
        (
            "Subscription Duration",
            {
                "fields": (
                    "start_date",
                    "end_date",
                )
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )
    