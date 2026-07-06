from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import *


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
   
   
   
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):

    list_display = ("id",
        "title",
        "notification_type",
        "is_active",
        "created_at"
    )

    list_filter = (
        "notification_type",
        "is_active"
    )

    search_fields = (
        "title",
        "message"
    )


@admin.register(UserNotification)
class UserNotificationAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "notification",
        "is_read",
        "created_at"
    )

    list_filter = (
        "is_read",
    )

    search_fields = (
        "user__email",
        "notification__title"
    )


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = (
        'ticket_id',
        'user',
        'title',
        'status',
        'priority',
        'created_at',
    )
    list_filter = ('status', 'priority', 'created_at')
    search_fields = ('ticket_id', 'title', 'user__email')
    readonly_fields = ('ticket_id', 'created_at', 'updated_at')


@admin.register(SubUser)
class SubUserAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'user',
        'parent',
        'mobile_number',
        'created_at',
    )
    list_filter = ('created_at',)
    search_fields = ('name', 'user__email', 'parent__email', 'mobile_number')
    

class SubModuleInline(admin.TabularInline):
    model = SubModule
    extra = 1
    fields = (
        "name",
        "slug",
        "is_active",
    )
    prepopulated_fields = {
        "slug": ("name",)
    }


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "slug",
        "is_active",
        "created_at",
        "updated_at",
    )
    list_filter = (
        "is_active",
        "created_at",
    )
    search_fields = (
        "name",
        "slug",
    )
    ordering = ("name",)
    prepopulated_fields = {
        "slug": ("name",)
    }
    readonly_fields = (
        "created_at",
        "updated_at",
    )
    inlines = [SubModuleInline]


@admin.register(SubModule)
class SubModuleAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "module",
        "name",
        "slug",
        "is_active",
        "created_at",
    )
    list_filter = (
        "module",
        "is_active",
    )
    search_fields = (
        "name",
        "slug",
        "module__name",
    )
    autocomplete_fields = (
        "module",
    )
    prepopulated_fields = {
        "slug": ("name",)
    }
    readonly_fields = (
        "created_at",
        "updated_at",
    )
    ordering = (
        "module__name",
        "name",
    )


@admin.register(UserModulePermission)
class UserModulePermissionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "module",
        "submodule",
        "can_view",
        "can_create",
        "can_update",
        "can_delete",
        "created_at",
    )
    list_filter = (
        "module",
        "submodule",
        "can_view",
        "can_create",
        "can_update",
        "can_delete",
    )
    search_fields = (
        "user__email",
        "user__username",
        "module__name",
        "submodule__name",
    )
    autocomplete_fields = (
        "user",
        "module",
        "submodule",
    )
    readonly_fields = (
        "created_at",
    )    