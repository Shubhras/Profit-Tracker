# amazon_auth/management/commands/sync_listing_items.py

from django.core.management.base import BaseCommand

from amazon_auth.models import AmazonAccount

from amazon_auth.listing_items import (
    sync_listing_items
)


class Command(BaseCommand):

    help = "Sync Amazon Listing Items"

    def handle(self, *args, **kwargs):

        accounts = AmazonAccount.objects.all()

        for account in accounts:

            try:

                total = sync_listing_items(
                    user=account.user,
                    account=account
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"{account.seller_central_id} -> {total} synced"
                    )
                )

            except Exception as e:

                self.stdout.write(
                    self.style.ERROR(
                        str(e)
                    )
                )