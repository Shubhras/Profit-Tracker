from django.core.management.base import BaseCommand
from django.db.models import Q
from amazon_auth.models import ProductMapping, OrderItem


class Command(BaseCommand):
    help = "Backfill parent ASIN into OrderItems"

    def handle(self, *args, **kwargs):
        mappings = ProductMapping.objects.exclude(parent_asin__isnull=True)

        total_updated = 0

        for mapping in mappings:
            updated = OrderItem.objects.filter(
                Q(seller_sku=mapping.seller_sku) | Q(asin=mapping.asin),
                parent_asin__isnull=True
            ).update(parent_asin=mapping.parent_asin)

            total_updated += updated

        print(f"Total updated OrderItems: {total_updated}")