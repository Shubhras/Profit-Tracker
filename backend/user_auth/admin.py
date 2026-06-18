from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import SubscriptionPlan, LegalDocument, Promocode


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = (
        'subcription_id',
        'subscription_type',
        'price',
        'status',
        'is_active',
        'created_at'
    )
    list_filter = ('subscription_type', 'status', 'is_active')
    search_fields = ('subcription_id',)


@admin.register(LegalDocument)
class LegalDocumentAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'slug',
        'language',
        'version',
        'is_active',
        'created_at'
    )
    list_filter = ('title', 'language', 'is_active')
    search_fields = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(Promocode)
class PromocodeAdmin(admin.ModelAdmin):
    list_display = (
        'promocode',
        'title',
        'promoType',
        'specificAmount',
        'percentage',
        'startDateTime',
        'endDateTime',
        'is_active'
    )
    list_filter = ('promoType', 'is_active')
    search_fields = ('promocode', 'title')
    