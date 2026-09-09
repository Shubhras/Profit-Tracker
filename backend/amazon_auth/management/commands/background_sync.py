from django.core.management.base import BaseCommand
from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Q
from amazon_auth.models import AmazonAccount
from amazon_auth.views import *
from django.test import RequestFactory
from django.contrib.auth.models import User
from amazon_auth.utils import *
from subscription.models import UserSubscription
# from amazon_auth.views import sync_reports
import logging
from rest_framework.test import force_authenticate
logger = logging.getLogger(__name__)

def print_response(resp):
    try:
        if hasattr(resp, "render"):
            resp.render()
        return resp.content.decode()
    except Exception:
        return str(resp)

class Command(BaseCommand):
    help = 'Automatically syncs Amazon data for all connected accounts in the background'

    def handle(self, *args, **kwargs):
        logger.info("CRON STARTED")
        print("CRON STARTED")  # temp debug
        accounts = AmazonAccount.objects.all()

        # now = timezone.now()
        # # 1. Fetch only users with an active, paid, non-expired subscription
        # active_user_ids = (
        #     UserSubscription.objects.filter(
        #         status="active",
        #         is_paid=True,
        #     )
        #     .filter(Q(end_date__gt=now) | Q(end_date__isnull=True))
        #     .values_list("user_id", flat=True)
        #     .distinct()
        # )
        # accounts = AmazonAccount.objects.filter(
        #     user_id__in=active_user_ids
        # ).select_related("user")

        # if not accounts.exists():
        #     self.stdout.write(self.style.WARNING("No Amazon accounts found with an active, paid subscription."))
        #     return
        self.stdout.write(f"Starting background sync for {accounts.count()} accounts...")

        factory = RequestFactory()
        
        for account in accounts:
            try:
                self.stdout.write(f"Syncing account: {account.seller_central_id} (User: {account.user.email})")
                

                request = factory.get('/fake-path/?sync_items=true')
                force_authenticate(request, user=account.user)
                
                # 1. Sync Orders (Summary data)
                # order_response = sync_orders(request)
                # self.stdout.write(f"  - Orders: {order_response.content.decode()}")
                order_response = sync_orders(request)
                self.stdout.write(f"  - Orders: {print_response(order_response)}")

                # 2. Sync Finances (Transaction level)
                finance_response = sync_finances(request)
                self.stdout.write(f"  - Finances: {print_response(finance_response)}")

                # 3. Sync Reports (Bulk Historical & Settlements) 
                
                create_business_reports()
                self.stdout.write("  - create_Reports: done")

                sync_new_business_reports()
                self.stdout.write("  - Reports: synced")

                # 4. Sync Ads (Excel or API)   /home/lenovo/Desktop/profit /Profit-Tracker/backend/amazon_auth/services/ads_report.xlsx
                try:
                    file_path = "/home/lenovo/Desktop/profit /Profit-Tracker/backend/amazon_auth/services/ads_report.xlsx"   #  change this
                    import_ads_from_excel(file_path)
                    self.stdout.write("  - Ads: Imported successfully")
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  - Ads failed: {str(e)}"))

                self.stdout.write(self.style.SUCCESS(f"Successfully synced {account.seller_central_id}"))
            
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to sync {account.seller_central_id}: {str(e)}"))

        self.stdout.write(self.style.SUCCESS("Background sync completed!"))
