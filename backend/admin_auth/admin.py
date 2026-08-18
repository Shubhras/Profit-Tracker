from django.contrib import admin
from .models import ApiCallLog


@admin.register(ApiCallLog)
class ApiCallLogAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'service_type',
        'account_name',
        'account_id',
        'api_endpoint',
        'call_count',
        'status',
        'orders_processed',
        'response_time_ms',
        'user',
        'created_at',
    )

    list_filter = (
        'service_type',
        'status',
        'created_at',
    )

    search_fields = (
        'account_name',
        'account_id',
        'api_endpoint',
        'user__email',
    )

    readonly_fields = (
        'created_at',
    )

    ordering = ('-created_at',)