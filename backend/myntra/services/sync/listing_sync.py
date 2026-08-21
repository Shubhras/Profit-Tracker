from decimal import Decimal

from django.db import transaction

from myntra.constants import MyntraReports
from myntra.models import MyntraListing
from myntra.parsers.listing_parser import ListingParser
from myntra.services.sync.base_sync import BaseSyncService


def extract_myntra_image_url(data):
    """
    Extract high quality secure HTTPS image URL from Myntra payload or imageCollection dictionary.
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

    return None


import json
import re
import requests


def resolve_myntra_style_image_url(style_id):
    """
    Resolves high resolution secure HTTPS product image URL from Myntra for a given style_id.
    """
    if not style_id:
        return None

    url = f"https://www.myntra.com/{style_id}"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
    }

    try:
        r = requests.get(url, headers=headers, timeout=8)
        if r.status_code != 200:
            return None

        match = re.search(r"window\.__myx\s*=\s*(\{.*?\});?</script>", r.text)
        if match:
            myx_data = json.loads(match.group(1))
            pdp_data = myx_data.get("pdpData", {})
            media = pdp_data.get("media", {})
            albums = media.get("albums", [])
            for album in albums:
                for img in album.get("images", []):
                    src = img.get("src") or img.get("secureSrc")
                    if src:
                        src = src.replace("http://", "https://")
                        src = re.sub(
                            r"h_\(\$height\),q_\(\$qualityPercentage\),w_\(\$width\)/?",
                            "h_480,q_80,w_360/",
                            src,
                        )
                        return src

        imgs = re.findall(
            r"https?://assets\.myntassets\.com/[^\"]+?\.(?:jpg|jpeg|png|webp)",
            r.text,
        )
        if imgs:
            src = imgs[0].replace("http://", "https://")
            src = re.sub(
                r"h_\(\$height\),q_\(\$qualityPercentage\),w_\(\$width\)/?",
                "h_480,q_80,w_360/",
                src,
            )
            return src
    except Exception:
        pass

    return None


class ListingSyncService(BaseSyncService):
    REPORT_NAME = MyntraReports.LISTINGS

    def __init__(self, connection):
        super().__init__(connection)
        self.parser = ListingParser()

    def _build(self, row):
        img_url = extract_myntra_image_url(row) or row.get("image_url")

        return MyntraListing(
            myntra_connection=self.connection,
            article_type=row.get("article_type"),
            brand=row.get("brand"),
            style_status=row.get("style_status"),
            style_status_description=row.get("style_status_description"),
            style_id=row.get("style_id"),
            style_name=row.get("style_name"),
            size=row.get("size"),
            seller_sku_code=row.get("seller_sku_code"),
            sku_id=row.get("sku_id"),
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
                # Preserve existing image_url if incoming does not specify one
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
        Updates MyntraListing.image_url for products matching by style_id or sku_id/seller_sku_code.
        catalog_products: List of product dicts from /partner/catalog/v2/product/search/nofilter
        """
        if not catalog_products:
            return 0

        updated_count = 0
        update_list = []

        for prod in catalog_products:
            if not isinstance(prod, dict):
                continue

            img_url = extract_myntra_image_url(prod)
            if not img_url:
                continue

            style_id = str(prod.get("productId") or prod.get("styleId") or "")
            if not style_id:
                continue

            matching_listings = MyntraListing.objects.filter(
                myntra_connection=self.connection,
                style_id=style_id,
            )

            for listing in matching_listings:
                if listing.image_url != img_url:
                    listing.image_url = img_url
                    update_list.append(listing)

        if update_list:
            MyntraListing.objects.bulk_update(update_list, fields=["image_url"])
            updated_count = len(update_list)

        return updated_count

    def sync_all_listing_images(self):
        """
        Resolves and updates missing product image URLs for all listings of this connection.
        """
        listings_without_img = MyntraListing.objects.filter(
            myntra_connection=self.connection,
            image_url__isnull=True,
        )

        unique_style_ids = set(
            listings_without_img.values_list("style_id", flat=True)
        )
        unique_style_ids = [s for s in unique_style_ids if s]

        if not unique_style_ids:
            return 0

        style_map = {}
        for style_id in unique_style_ids:
            img = resolve_myntra_style_image_url(style_id)
            if img:
                style_map[style_id] = img

        update_list = []
        for listing in listings_without_img:
            if listing.style_id in style_map:
                listing.image_url = style_map[listing.style_id]
                update_list.append(listing)

        if update_list:
            MyntraListing.objects.bulk_update(update_list, fields=["image_url"])

        return len(update_list)


