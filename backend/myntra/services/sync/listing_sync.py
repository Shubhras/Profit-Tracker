import logging
from decimal import Decimal

from django.db import transaction
from django.db.models import Q

from myntra.constants import MyntraReports
from myntra.models import MyntraListing
from myntra.parsers.listing_parser import ListingParser
from myntra.services.sync.base_sync import BaseSyncService

logger = logging.getLogger(__name__)


def extract_myntra_image_url(data):
    """
    Extract high quality secure HTTPS image URL from Myntra API payload or imageCollection dictionary.
    """
    if not isinstance(data, dict):
        return None

    if data.get("image_url"):
        return data["image_url"]

    image_collection = data.get("imageCollection", {})
    image_map = (
        image_collection.get("imageEntryMap", {})
        if isinstance(image_collection, dict)
        else {}
    )

    default_entry = image_map.get("default") or image_map.get("front")
    if not default_entry and image_map:
        default_entry = next(iter(image_map.values()), {})

    if isinstance(default_entry, dict):
        secured_domain = default_entry.get("securedDomain")
        relative_path = default_entry.get("relativePath")
        if secured_domain and relative_path:
            return f"{secured_domain.rstrip('/')}/{relative_path.lstrip('/')}"
        if default_entry.get("path"):
            return default_entry["path"]

    # Fallback to direct images array if present in catalog response
    images = data.get("images") or data.get("styleImages")
    if isinstance(images, list) and images:
        first = images[0]
        if isinstance(first, dict):
            src = first.get("src") or first.get("secureSrc") or first.get("imageURL")
            if src:
                return src
        elif isinstance(first, str):
            return first

    return None


class ListingSyncService(BaseSyncService):
    REPORT_NAME = MyntraReports.LISTINGS

    def __init__(self, connection):
        super().__init__(connection)
        self.parser = ListingParser()

    def process_report(self, download_url):
        """
        Processes listing report and automatically triggers catalog image resolution via Myntra API.
        """
        result = super().process_report(download_url)

        try:
            images_updated = self.sync_listing_images_via_api()
            result["images_updated"] = images_updated
            logger.info(f"Updated {images_updated} listing image(s) via Myntra API during sync.")
        except Exception as exc:
            logger.error(f"Failed auto sync of catalog images: {exc}")

        return result

    def _build(self, row):
        img_url = extract_myntra_image_url(row) or row.get("image_url")

        return MyntraListing(
            myntra_connection=self.connection,
            article_type=row.get("article_type"),
            brand=row.get("brand"),
            style_status=row.get("style_status"),
            style_status_description=row.get("style_status_description"),
            style_id=str(row.get("style_id")).strip() if row.get("style_id") else None,
            style_name=row.get("style_name"),
            size=row.get("size"),
            seller_sku_code=row.get("seller_sku_code"),
            sku_id=str(row.get("sku_id")).strip() if row.get("sku_id") else None,
            sku_code=row.get("sku_code"),
            van=row.get("van"),
            mrp=Decimal(row["mrp"]) if row.get("mrp") else None,
            image_url=img_url,
            is_active=row.get("is_active"),
            listing_status=row.get("listing_status"),
            listing_status_description=row.get("listing_status_description"),
            seller_listing_comments=row.get("seller_listing_comments"),
            style_catalogued_date=self._date(row.get("style_catalogued_date")),
            lot_uploaded_date=self._date(row.get("lot_uploaded_date")),
            style_onhold_date=self._date(row.get("style_onhold_date")),
            onhold_reason=row.get("onhold_reason"),
            turn_around_time=row.get("turn_around_time"),
            raw_data=row,
        )

    @transaction.atomic
    def _save(self, listings):
        if not listings:
            return 0, 0

        incoming_ids = [l.sku_id for l in listings if l.sku_id]

        existing = {
            l.sku_id: l for l in MyntraListing.objects.filter(sku_id__in=incoming_ids)
        }

        create_list = []
        update_list = []

        for listing in listings:
            obj = existing.get(listing.sku_id)

            if obj:
                listing.pk = obj.pk
                # Preserve existing image_url if incoming report row does not specify one
                if not listing.image_url and obj.image_url:
                    listing.image_url = obj.image_url
                update_list.append(listing)
            else:
                create_list.append(listing)

        if create_list:
            MyntraListing.objects.bulk_create(create_list)

        if update_list:
            MyntraListing.objects.bulk_update(
                update_list,
                fields=[
                    "article_type",
                    "brand",
                    "style_status",
                    "style_status_description",
                    "style_id",
                    "style_name",
                    "size",
                    "seller_sku_code",
                    "sku_code",
                    "van",
                    "mrp",
                    "image_url",
                    "is_active",
                    "listing_status",
                    "listing_status_description",
                    "seller_listing_comments",
                    "style_catalogued_date",
                    "lot_uploaded_date",
                    "style_onhold_date",
                    "onhold_reason",
                    "turn_around_time",
                    "raw_data",
                ],
            )

        return len(create_list), len(update_list)

    def update_listing_images_from_catalog(self, catalog_products):
        """
        Updates MyntraListing.image_url for products matching by style_id, sku_id, seller_sku_code, or van.
        catalog_products: List of product dicts from /partner/catalog/v2/product/search/nofilter
        """
        if not catalog_products:
            return 0

        updated_pks = set()
        update_list = []

        for prod in catalog_products:
            if not isinstance(prod, dict):
                continue

            img_url = extract_myntra_image_url(prod)
            if not img_url:
                continue

            style_id = str(prod.get("productId") or prod.get("styleId") or "").strip()
            sku_id = str(prod.get("skuId") or prod.get("sku_id") or "").strip()
            seller_sku = str(prod.get("sellerSkuCode") or prod.get("seller_sku_code") or "").strip()
            van = str(prod.get("vendorArticleNumber") or prod.get("van") or "").strip()

            query = Q()
            if style_id:
                query |= Q(style_id=style_id)
            if sku_id:
                query |= Q(sku_id=sku_id)
            if seller_sku:
                query |= Q(seller_sku_code=seller_sku)
            if van:
                query |= Q(van=van)

            if not query:
                continue

            matching_listings = MyntraListing.objects.filter(
                myntra_connection=self.connection
            ).filter(query)

            for listing in matching_listings:
                if listing.pk not in updated_pks and listing.image_url != img_url:
                    listing.image_url = img_url
                    update_list.append(listing)
                    updated_pks.add(listing.pk)

        if update_list:
            MyntraListing.objects.bulk_update(update_list, fields=["image_url"])

        return len(update_list)

    def sync_listing_images_via_api(self):
        """
        Fetches product catalog details from official Myntra API and updates image URLs for all listings.
        Does not use web scraping.
        """
        from myntra.services.myntra_client import MyntraClient

        if not self.connection:
            return 0

        try:
            client = MyntraClient(connection=self.connection)
            cursor_mark = "*"
            page = 1
            total_updated = 0

            while page <= 20:
                res = client.search_catalog_products(
                    start=0,
                    cursor_mark=cursor_mark,
                )

                if not isinstance(res, dict) or res.get("error"):
                    break

                products = res.get("data", [])
                if not products:
                    break

                updated = self.update_listing_images_from_catalog(products)
                total_updated += updated

                next_cursor = res.get("nextCursorMark")
                if not next_cursor or next_cursor == cursor_mark:
                    break

                cursor_mark = next_cursor
                page += 1

            return total_updated
        except Exception as exc:
            logger.error(f"Error syncing catalog images via Myntra API: {exc}")
            return 0

    def sync_all_listing_images(self):
        """
        Alias for sync_listing_images_via_api for backward compatibility with management commands.
        """
        return self.sync_listing_images_via_api()



