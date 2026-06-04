from django.core.management.base import BaseCommand
from datetime import datetime, timedelta

from amazon_auth.models import AmazonAccount
from amazon_auth.services.transaction_sync import sync_transactions_for_account


class Command(BaseCommand):

    help = "Sync Amazon Transactions"

    def handle(self, *args, **kwargs):

        accounts = AmazonAccount.objects.all()

        posted_after = (
            datetime.utcnow() - timedelta(days=7)
        ).isoformat() + "Z"

        for account in accounts:

            try:
                sync_transactions_for_account(
                    account,
                    posted_after
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Synced account {account.id}"
                    )
                )

            except Exception as e:

                self.stdout.write(
                    self.style.ERROR(
                        f"Error account {account.id}: {str(e)}"
                    )
                )
                
                