from django.core.management.base import BaseCommand
from amazon_auth.models import MissingCatalogQueue, ProductMapping
from amazon_auth.utils import safe_catalog_call, SPAPIManager
import logging

logger = logging.getLogger(__name__)

# class Command(BaseCommand):
#     help = "Process missing catalog data"

#     def handle(self, *args, **kwargs):
#         items = MissingCatalogQueue.objects.filter(processed=False)[:20]
#         logger.info("CRON STARTED for catelog")

#         for i in items:
#             try:
#                 manager = SPAPIManager(account=None, user=None)  # adjust if needed

#                 data = safe_catalog_call(manager, i.asin, i.marketplace_id)

#                 attributes = data.get("attributes", {})
#                 images = data.get("images", [])

#                 brand = None
#                 image_url = None

#                 if "brand" in attributes:
#                     brand = attributes["brand"][0].get("value")

#                 for img_group in images:
#                     if img_group.get("marketplaceId") == i.marketplace_id:
#                         imgs = img_group.get("images", [])
#                         if imgs:
#                             image_url = imgs[0].get("link")
#                             break

#                 ProductMapping.objects.update_or_create(
#                     seller_sku=i.seller_sku,
#                     defaults={
#                         "asin": i.asin,
#                         "brand": brand,
#                         "image_url": image_url
#                     }
#                 )

#                 i.processed = True
#                 i.save()

#             except Exception as e:
#                 print(f"Failed for {i.seller_sku}: {e}")

class Command(BaseCommand):
    help = "Process missing catalog data"

    def handle(self, *args, **kwargs):
        # items = MissingCatalogQueue.objects.filter(processed=False)[:20]
        while True:
            items = MissingCatalogQueue.objects.filter(processed=False)[:20]
            if not items:
                break
        logger.info("CRON STARTED for catalog")

        manager = SPAPIManager(account=None, user=None)

        for i in items:
            try:
                data = safe_catalog_call(manager, i.asin, i.marketplace_id)

                attributes = data.get("attributes", {})
                images = data.get("images", [])

                brand = None
                image_url = None
                product_name = None
                parent_sku = None
                cost_price = 0

                # ✅ BRAND
                if "brand" in attributes:
                    brand = attributes["brand"][0].get("value")

                # ✅ PRODUCT NAME
                if "item_name" in attributes:
                    product_name = attributes["item_name"][0].get("value")

                # ✅ PARENT SKU (variation parent)
                if "parent_sku" in attributes:
                    parent_sku = attributes["parent_sku"][0].get("value")
                else:
                    parent_sku = i.seller_sku  # fallback

                # ✅ IMAGE
                for img_group in images:
                    if img_group.get("marketplaceId") == i.marketplace_id:
                        imgs = img_group.get("images", [])
                        if imgs:
                            image_url = imgs[0].get("link")
                            break

                # ✅ COST PRICE (you may calculate later)
                # For now keep default or add logic
                cost_price = 0

                ProductMapping.objects.update_or_create(
                    seller_sku=i.seller_sku,
                    defaults={
                        "asin": i.asin,
                        "brand": brand,
                        "image_url": image_url,
                        "product_name": product_name,
                        "parent_sku": parent_sku,
                        "cost_price": cost_price
                    }
                )

                i.processed = True
                i.save()

                logger.info(f"Processed SKU: {i.seller_sku}")

            except Exception as e:
                logger.error(f"Failed for {i.seller_sku}: {e}")
