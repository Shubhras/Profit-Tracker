from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ApiCallLog(models.Model):
    SERVICE_CHOICES = (
        ('SP-API', 'Amazon SP-API'),
        ('Amazon-Ads', 'Amazon Ads API'),
        ('Myntra', 'Myntra API'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_call_logs', null=True, blank=True)
    service_type = models.CharField(max_length=50, choices=SERVICE_CHOICES, default='SP-API')
    account_id = models.CharField(max_length=255, null=True, blank=True)
    account_name = models.CharField(max_length=255, null=True, blank=True)
    api_endpoint = models.CharField(max_length=255)
    call_count = models.IntegerField(default=1)
    status = models.CharField(max_length=50, default='SUCCESS')
    orders_processed = models.IntegerField(default=0)
    response_time_ms = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.service_type} - {self.api_endpoint} ({self.account_name or self.account_id or 'Global'})"

def log_api_call(user=None, service_type='SP-API', account_id=None, account_name=None, api_endpoint='', call_count=1, status='SUCCESS', orders_processed=0, response_time_ms=0):
    try:
        return ApiCallLog.objects.create(
            user=user,
            service_type=service_type,
            account_id=str(account_id or ''),
            account_name=str(account_name or ''),
            api_endpoint=str(api_endpoint),
            call_count=int(call_count),
            status=str(status),
            orders_processed=int(orders_processed),
            response_time_ms=int(response_time_ms)
        )
    except Exception as e:
        print(f"Failed to log API call: {e}")
        return None

