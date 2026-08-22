import logging
from celery import shared_task
from amazon_ads.models import AmazonAdsAccount
from amazon_ads.services.sync.initial_ads_sync import run_initial_ads_sync

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def task_run_initial_ads_sync(self, account_id, days=60):
    """
    Celery task to run initial Amazon Ads sync asynchronously.
    """
    try:
        account = AmazonAdsAccount.objects.get(id=account_id)
        logger.info(f"Starting Celery initial Amazon Ads sync for account ID: {account_id} (days={days})")
        res = run_initial_ads_sync(account=account, days=days)
        logger.info(f"Finished Celery initial Amazon Ads sync for account ID: {account_id}, result: {res}")
        return res
    except AmazonAdsAccount.DoesNotExist:
        logger.error(f"AmazonAdsAccount with ID {account_id} does not exist.")
        return {"error": f"AmazonAdsAccount {account_id} not found", "success": False}
    except Exception as exc:
        logger.exception(f"Error executing Celery initial Ads sync for account ID {account_id}: {exc}")
        raise self.retry(exc=exc)
