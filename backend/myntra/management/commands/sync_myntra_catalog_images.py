from django.core.management.base import BaseCommand
from myntra.models import MyntraConnection
from myntra.services.myntra_client import MyntraClient
from myntra.services.sync.listing_sync import ListingSyncService


class Command(BaseCommand):
    help = "Fetch product images from Myntra Catalog Search API and update MyntraListing records"

    def add_arguments(self, parser):
        parser.add_argument(
            "--merchant_id",
            type=str,
            help="Optional merchant ID to sync for a specific connection",
        )
        parser.add_argument(
            "--query",
            type=str,
            default=None,
            help="Optional query string for catalog search",
        )

    def handle(self, *args, **options):
        merchant_id = options.get("merchant_id")
        query = options.get("query")

        connections = MyntraConnection.objects.all()
        if merchant_id:
            connections = connections.filter(merchant_id=merchant_id)

        if not connections.exists():
            self.stdout.write(self.style.WARNING("No active Myntra connections found."))
            return

        self.stdout.write(f"Starting catalog image sync for {connections.count()} Myntra connection(s)...\n")

        total_updated = 0

        for connection in connections:
            self.stdout.write(f"Processing connection for Merchant ID: {connection.merchant_id or connection.id}...")

            try:
                client = MyntraClient(connection=connection)
                sync_service = ListingSyncService(connection)

                cursor_mark = "*"
                page = 1
                conn_updated = 0

                while True:
                    self.stdout.write(f"  Fetching catalog page {page} (cursorMark={cursor_mark})...")
                    res = client.search_catalog_products(
                        query=query,
                        start=0,
                        cursor_mark=cursor_mark,
                    )

                    if isinstance(res, dict) and res.get("error"):
                        self.stderr.write(self.style.ERROR(f"  API Error: {res.get('error')}"))
                        break

                    products = res.get("data", [])
                    if not products:
                        self.stdout.write("  No further products returned.")
                        break

                    updated = sync_service.update_listing_images_from_catalog(products)
                    conn_updated += updated
                    self.stdout.write(self.style.SUCCESS(f"  Page {page}: Updated {updated} listing image(s)."))

                    next_cursor = res.get("nextCursorMark")
                    if not next_cursor or next_cursor == cursor_mark:
                        break

                    cursor_mark = next_cursor
                    page += 1

                # Fallback / Resolution for listings missing images
                self.stdout.write("  Resolving image URLs for listings with missing images...")
                fallback_updated = sync_service.sync_all_listing_images()
                if fallback_updated > 0:
                    self.stdout.write(self.style.SUCCESS(f"  Resolved {fallback_updated} missing image(s) via style image lookup."))
                    conn_updated += fallback_updated

                total_updated += conn_updated
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Finished merchant {connection.merchant_id or connection.id}: {conn_updated} listing image(s) updated.\n"
                    )
                )

            except Exception as exc:
                self.stderr.write(self.style.ERROR(f"Error syncing catalog images for connection #{connection.id}: {exc}\n"))

        self.stdout.write(self.style.SUCCESS(f"Catalog image sync completed! Total updated: {total_updated}"))

