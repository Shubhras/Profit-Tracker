# from django.db import models
# from django.utils import timezone

# class MyntraOrder(models.Model):

#     order_id = models.CharField(max_length=100)
#     sku = models.CharField(max_length=100)
#     selling_price = models.FloatField()
#     #commission = models.FloatField()
#     commission = models.FloatField(default=0)
#     logistics_fee = models.FloatField(default=0)
#     profit = models.FloatField(default=0)
    

#     created_at = models.DateTimeField(default=timezone.now)


# class MyntraSettlement(models.Model):
#     order = models.OneToOneField(MyntraOrder, on_delete=models.CASCADE)
#     commission = models.FloatField(default=0)
#     shipping_fee = models.FloatField(default=0)
#     tax = models.FloatField(default=0)
#     payout = models.FloatField(default=0)

#     def profit(self):
#         return self.payout - (
#             self.commission + self.shipping_fee + self.tax
#         )


from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class MyntraOrder(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="myntra_orders",
    )
    order_id = models.CharField(max_length=100, unique=True)
    sku = models.CharField(max_length=100)
    selling_price = models.FloatField(default=0)
    commission = models.FloatField(default=0)
    logistics_fee = models.FloatField(default=0)
    profit = models.FloatField(default=0)

    created_at = models.DateTimeField(default=timezone.now)


class MyntraConnection(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="myntra_connection",
    )

    merchant_id = models.CharField(max_length=200, blank=True, null=True)
    secret_key = models.TextField(blank=True, null=True)
    partner_type = models.CharField(max_length=50, blank=True, null=True)
    warehouse_code = models.CharField(max_length=50, blank=True, null=True)
    access_token = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"MyntraConnection(user={self.user_id})"


class MyntraSettlement(models.Model):

    order = models.OneToOneField(MyntraOrder, on_delete=models.CASCADE)
    commission = models.FloatField(default=0)
    shipping_fee = models.FloatField(default=0)
    tax = models.FloatField(default=0)
    payout = models.FloatField(default=0)

    def profit(self):
        return self.payout - (
            self.commission + self.shipping_fee + self.tax
        )
