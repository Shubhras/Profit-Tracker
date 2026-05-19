# amazon_auth/management/commands/sync_catalog_details.py

from django.core.management.base import BaseCommand

from amazon_auth.models import OrderItem
from amazon_auth.models import (
    AmazonAccount,
    AmazonCatalogDetails
)

from amazon_auth.catelog_details import (
    sync_catalog_details_for_asin
)


class Command(BaseCommand):

    help = "Sync Amazon catalog details from order items"

    def handle(self, *args, **kwargs):

        self.stdout.write(
            self.style.SUCCESS(
                "CRON STARTED: Sync Catalog Details"
            )
        )

        accounts = AmazonAccount.objects.all()

        total_synced = 0
        total_skipped = 0
        total_failed = 0

        for account in accounts:

            try:

                user = account.user

                self.stdout.write(
                    f"\nProcessing Seller: {account.seller_central_id}"
                )

                # DISTINCT ASINS
                order_items = (
                    OrderItem.objects
                    .filter(order__user=user)
                    .exclude(asin__isnull=True)
                    .exclude(asin="")
                    .values(
                        "asin",
                        "order__marketplace_id"
                    )
                    .distinct()
                )

                for item in order_items:

                    asin = item.get("asin")
                    marketplace_id = item.get("order__marketplace_id")

                    if not marketplace_id:
                        continue

                    try:

                        # CHECK EXISTING ENTRY
                        exists = (
                            AmazonCatalogDetails.objects
                            .filter(
                                user=user,
                                asin=asin,
                                marketplace_id=marketplace_id
                            )
                            .exists()
                        )

                        # SKIP DUPLICATES
                        if exists:

                            total_skipped += 1

                            self.stdout.write(
                                f"Skipped: {asin}"
                            )

                            continue

                        synced = sync_catalog_details_for_asin(
                            user=user,
                            account=account,
                            asin=asin,
                            marketplace_id=marketplace_id
                        )

                        if synced:

                            total_synced += 1

                            self.stdout.write(
                                self.style.SUCCESS(
                                    f"Synced: {asin}"
                                )
                            )

                        else:

                            total_failed += 1

                            self.stdout.write(
                                self.style.ERROR(
                                    f"Failed: {asin}"
                                )
                            )

                    except Exception as e:

                        total_failed += 1

                        self.stdout.write(
                            self.style.ERROR(
                                f"Error ASIN {asin}: {str(e)}"
                            )
                        )

            except Exception as e:

                self.stdout.write(
                    self.style.ERROR(
                        f"Seller Failed: {account.seller_central_id} - {str(e)}"
                    )
                )

        self.stdout.write("\n==============================")

        self.stdout.write(
            self.style.SUCCESS(
                f"TOTAL SYNCED: {total_synced}"
            )
        )

        self.stdout.write(
            self.style.WARNING(
                f"TOTAL SKIPPED: {total_skipped}"
            )
        )

        self.stdout.write(
            self.style.ERROR(
                f"TOTAL FAILED: {total_failed}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                "CRON FINISHED"
            )
        )