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


class MyntraOrderNew(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="myntra_orders_new"
    )
    myntra_connection = models.ForeignKey(
        MyntraConnection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders"
    )
    seller_order_id = models.CharField(max_length=100, unique=True, db_index=True)
    uidx = models.CharField(max_length=255, null=True, blank=True)
    receiver_name = models.CharField(max_length=255, null=True, blank=True)
    receiver_email = models.CharField(max_length=255, null=True, blank=True)
    mobile = models.CharField(max_length=50, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    zipcode = models.CharField(max_length=20, null=True, blank=True)
    country = models.CharField(max_length=50, null=True, blank=True)
    warehouse = models.CharField(max_length=100, null=True, blank=True)
    courier_code = models.CharField(max_length=100, null=True, blank=True)
    on_hold = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.seller_order_id


class MyntraOrderItemNew(models.Model):
    order = models.ForeignKey(
        MyntraOrderNew,
        on_delete=models.CASCADE,
        related_name="items"
    )
    order_line_id = models.CharField(max_length=100, unique=True, db_index=True)
    sku = models.CharField(max_length=100, db_index=True)
    mrp = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    line_final_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status_code = models.CharField(max_length=50, null=True, blank=True)
    pack_by_time = models.DateTimeField(null=True, blank=True)
    accept_by_time = models.DateTimeField(null=True, blank=True)
    customer_promise_time = models.DateTimeField(null=True, blank=True)
    ship_by_time = models.DateTimeField(null=True, blank=True)
    unit_other_charges_without_tax = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.sku} in {self.order.seller_order_id}"


class MyntraReturnItemNew(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    myntra_connection = models.ForeignKey(
        MyntraConnection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    return_id = models.CharField(max_length=100, unique=True, db_index=True)
    order_id = models.CharField(max_length=100, db_index=True)
    order_line_id = models.CharField(max_length=100, db_index=True)
    sku = models.CharField(max_length=100, db_index=True)
    quantity = models.IntegerField(default=0)
    status = models.CharField(max_length=100)
    return_type = models.CharField(max_length=50)
    tracking_number = models.CharField(max_length=100, null=True, blank=True)
    return_warehouse_code = models.CharField(max_length=50, null=True, blank=True)
    created_on = models.DateTimeField(null=True, blank=True)
    delivered_time = models.DateTimeField(null=True, blank=True)
    confirmed_time = models.DateTimeField(null=True, blank=True)
    ready_for_pickup_time = models.DateTimeField(null=True, blank=True)
    reason = models.CharField(max_length=255, null=True, blank=True)
    reason_id = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.return_id} - {self.sku}"


class MyntraPaymentNew(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    myntra_connection = models.ForeignKey(
        MyntraConnection,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    utr_number = models.CharField(max_length=100, db_index=True)
    payment_method = models.CharField(max_length=50)
    payment_date = models.DateField()
    year_month = models.IntegerField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    utr_details_link = models.TextField(null=True, blank=True)
    advice_id = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.utr_number} ({self.amount})"
