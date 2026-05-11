# bulk command

from django.core.management.base import BaseCommand

from amazon_auth.models import OrderItem
from amazon_auth.spapi_manager import SPAPIManager

from amazon_auth.feesestimate import save_fee_estimate

class Command(BaseCommand):

    help = "Fetch Amazon estimated fees"

    def handle(self, *args, **kwargs):

        items = (
        OrderItem.objects
        .exclude(seller_sku__isnull=True)
        .exclude(seller_sku="")
        .exclude(estimated_fees__isnull=False)

        .exclude(
            order__amazon_account__user__email="nayan@gmail.com"
        )

        .select_related(
            "order",
            "order__amazon_account",
            "order__amazon_account__user"
        )
    )

        total = items.count()

        for item in items:
            print(
                item.seller_sku,
                item.order.amazon_account.user.email,
                item.order.amazon_account.seller_central_id
            )

        self.stdout.write(f"TOTAL ITEMS => {total}")

        for index, item in enumerate(items, start=1):

            try:

                save_fee_estimate(
                    order_item=item,
                    user=item.order.user
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"{index}/{total} DONE => {item.seller_sku}"
                    )
                )

            except Exception as e:

                self.stdout.write(
                    self.style.ERROR(
                        f"{item.seller_sku} => {str(e)}"
                    )
                )