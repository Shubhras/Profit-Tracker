from decimal import Decimal

from django.db import transaction

from myntra.constants import MyntraReports
from myntra.models import MyntraListing
from myntra.parsers.listing_parser import ListingParser
from myntra.services.sync.base_sync import BaseSyncService


class ListingSyncService(BaseSyncService):
    REPORT_NAME = MyntraReports.LISTINGS

    def __init__(self, connection):
        super().__init__(connection)
        self.parser = ListingParser()

    def _build(self, row):
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
