# from django.core.management.base import BaseCommand
# from django.db.models import Q
# from amazon_auth.models import ProductMapping, OrderItem


# class Command(BaseCommand):
#     help = "Backfill parent ASIN into OrderItems"

#     def handle(self, *args, **kwargs):
#         mappings = ProductMapping.objects.exclude(parent_asin__isnull=True)

#         total_updated = 0

#         for mapping in mappings:
#             updated = OrderItem.objects.filter(
#                 Q(seller_sku=mapping.seller_sku) | Q(asin=mapping.asin),
#                 parent_asin__isnull=True
#             ).update(parent_asin=mapping.parent_asin)

#             total_updated += updated

#         print(f"Total updated OrderItems: {total_updated}")


#   this is need when some asin have donot have there parent asin so update same asin  in parent 
from django.core.management.base import BaseCommand
from django.db.models import Q, F
from amazon_auth.models import ProductMapping, OrderItem


class Command(BaseCommand):
    help = "Backfill parent ASIN into OrderItems"

    def handle(self, *args, **kwargs):

        total_updated = 0

        # ---------------------------------------------------
        # 1. UPDATE FROM PRODUCT MAPPING
        # ---------------------------------------------------
        mappings = ProductMapping.objects.exclude(
            parent_asin__isnull=True
        ).exclude(
            parent_asin=""
        )

        for mapping in mappings:

            updated = OrderItem.objects.filter(
                Q(seller_sku=mapping.seller_sku) |
                Q(asin=mapping.asin),
                Q(parent_asin__isnull=True) |
                Q(parent_asin="")
            ).update(parent_asin=mapping.parent_asin)

            total_updated += updated

        # ---------------------------------------------------
        # 2. FALLBACK:
        #    IF STILL NULL -> USE OWN CHILD ASIN
        # ---------------------------------------------------
        fallback_updated = OrderItem.objects.filter(
            Q(parent_asin__isnull=True) |
            Q(parent_asin="")
        ).exclude(
            asin__isnull=True
        ).exclude(
            asin=""
        ).update(
            parent_asin=F('asin')
        )

        total_updated += fallback_updated

        print(f"Fallback updated: {fallback_updated}")
        print(f"Total updated OrderItems: {total_updated}")