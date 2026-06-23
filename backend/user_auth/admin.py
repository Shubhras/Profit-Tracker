from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import SubscriptionPlan, LegalDocument, Promocode


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = (
        'subcription_id',
        'plan_name',
        'monthly_price',
        'annual_price',
        'discount_percentage',
        'status',
        'is_active',
    )

    def discount_percentage(self, obj):
        if obj.monthly_price:
            yearly_cost = obj.monthly_price * 12
            discount = ((yearly_cost - obj.annual_price) / yearly_cost) * 100
            return round(discount, 2)
        return 0

    discount_percentage.short_description = "Discount %"

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
    