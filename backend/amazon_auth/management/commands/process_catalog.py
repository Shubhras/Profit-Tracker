from django.core.management.base import BaseCommand
from amazon_auth.models import MissingCatalogQueue, ProductMapping,OrderItem
from amazon_auth.utils import safe_catalog_call
from amazon_auth.spapi_manager import SPAPIManager
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Process missing catalog data"

    def handle(self, *args, **kwargs):
        # items = MissingCatalogQueue.objects.filter(processed=False)[:20]
        logger.info(f"Product mapping cron started")
        # while True:
        items = MissingCatalogQueue.objects.filter(processed=False)[:20]

        if not items.exists():
            logger.info("No items to process")
            return
        logger.info("CRON STARTED for catalog")

        # manager = SPAPIManager(account=None, user=None)
        

        for i in items:
            try:
                manager = SPAPIManager(account=i.account, user=i.account.user)
                # data = safe_catalog_call(manager, i.asin, i.marketplace_id)
                data = safe_catalog_call(manager, i.asin, i.marketplace_id)

                if not data:
                    logger.error(f"Catalog API failed for {i.seller_sku}")
                    continue

                attributes = data.get("attributes", {})
                images = data.get("images", [])

                brand = None
                image_url = None
                product_name = None
                parent_sku = None
                seller_sku = None
                cost_price = 0

                # BRAND
                if "brand" in attributes:
                    brand = attributes["brand"][0].get("value")

                #  PRODUCT NAME
                if "item_name" in attributes:
                    product_name = attributes["item_name"][0].get("value")

                #  PARENT SKU (variation parent)
                if "parent_sku" in attributes:
                    parent_sku = attributes["parent_sku"][0].get("value")
                else:
                    parent_sku = i.seller_sku  # fallback

                relationships = data.get("relationships", [])

                parent_asin = None

                for rel_group in relationships:
                    for rel in rel_group.get("relationships", []):
                        if rel.get("type") == "VARIATION":
                            parent_list = rel.get("parentAsins", [])
                            if parent_list:
                                parent_asin = parent_list[0]
                                break
                    if parent_asin:
                        break  

                # # seller_sku
                # if "seller_sku" in attributes:
                #     seller_sku = attributes["seller_sku"][0].get("value")
                
                #  IMAGE
                for img_group in images:
                    if img_group.get("marketplaceId") == i.marketplace_id:
                        imgs = img_group.get("images", [])
                        if imgs:
                            image_url = imgs[0].get("link")
                            break

                #  COST PRICE (you may calculate later)
                # For now keep default or add logic
                cost_price = 0

                # ✅ SAVE PRODUCT MAPPING
                mapping, _ = ProductMapping.objects.update_or_create(
                    seller_sku=i.seller_sku,
                    account=i.account,
                    defaults={
                        "asin": i.asin,
                        "parent_asin": parent_asin, 
                        "brand": brand,
                        "image_url": image_url if image_url else None,
                        "product_name": product_name,
                        "parent_sku": parent_sku,
                        "cost_price": cost_price,
                    }
                )

                # ✅ UPDATE ORDER ITEMS (SAFE + BULK)
                order_items = OrderItem.objects.filter(
                    Q(seller_sku=mapping.seller_sku) & Q(asin=mapping.asin)   # ✅ FIXED (OR)
                )

                to_update = []

                for item in order_items:
                    updated = False

                    if not item.image_url and mapping.image_url:
                        item.image_url = mapping.image_url
                        updated = True

                    if not item.brand and mapping.brand:
                        item.brand = mapping.brand
                        updated = True

                    if not item.parent_sku and mapping.parent_sku:
                        item.parent_sku = mapping.parent_sku
                        updated = True

                    if not item.parent_asin and parent_asin:
                        item.parent_asin = parent_asin
                        updated = True    

                    if updated:
                        to_update.append(item)

                if to_update:
                    OrderItem.objects.bulk_update(
                        to_update,
                        ["image_url", "brand", "parent_sku","parent_asin"]
                    )
                    logger.info(f"Updated {len(to_update)} order items for SKU {mapping.seller_sku}")

                #  MARK QUEUE ITEM PROCESSED
                MissingCatalogQueue.objects.filter(id=i.id).update(processed=True)

                logger.info(f"Processed SKU: {i.seller_sku}")

            except Exception as e:
                logger.error(f"Failed for {i.seller_sku}: {e}")