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
from django.utils import timezone


class MyntraOrder(models.Model):

    order_id = models.CharField(max_length=100, unique=True)
    sku = models.CharField(max_length=100)
    selling_price = models.FloatField(default=0)
    commission = models.FloatField(default=0)
    logistics_fee = models.FloatField(default=0)
    profit = models.FloatField(default=0)

    created_at = models.DateTimeField(default=timezone.now)


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