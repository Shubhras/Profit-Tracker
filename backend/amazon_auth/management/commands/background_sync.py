from django.core.management.base import BaseCommand
from amazon_auth.models import AmazonAccount
from amazon_auth.views import sync_orders, sync_finances
from django.test import RequestFactory
from django.contrib.auth.models import User

import logging

logger = logging.getLogger(__name__)



class Command(BaseCommand):
    help = 'Automatically syncs Amazon data for all connected accounts in the background'

    def handle(self, *args, **kwargs):
        logger.info("CRON STARTED")
        print("CRON STARTED")  # temp debug
        accounts = AmazonAccount.objects.all()
        self.stdout.write(f"Starting background sync for {accounts.count()} accounts...")

        factory = RequestFactory()
        
        for account in accounts:
            try:
                self.stdout.write(f"Syncing account: {account.seller_central_id} (User: {account.user.email})")
                
                # Create a mock request for the existing sync views
                # request = factory.get('/fake-path/')
                request = factory.get('/fake-path/?sync_items=true')
                request.user = account.user
                
                # 1. Sync Orders (Summary data)
                order_response = sync_orders(request)
                self.stdout.write(f"  - Orders: {order_response.content.decode()}")

                # 2. Sync Finances (Transaction level)
                finance_response = sync_finances(request)
                self.stdout.write(f"  - Finances: {finance_response.content.decode()}")

                # 3. Sync Reports (Bulk Historical & Settlements)
                from amazon_auth.views import sync_reports
                report_response = sync_reports(request)
                self.stdout.write(f"  - Reports: {report_response.content.decode()}")

                self.stdout.write(self.style.SUCCESS(f"Successfully synced {account.seller_central_id}"))
            
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to sync {account.seller_central_id}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS("Background sync completed!"))
