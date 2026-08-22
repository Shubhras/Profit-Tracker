import logging
from celery import shared_task
from amazon_auth.models import AmazonAccount
from amazon_auth.services.initial_amazon_sync import run_initial_amazon_sync

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def task_run_initial_amazon_sync(self, account_id, days=60):
    """
    Celery task to run initial Amazon SP-API data sync asynchronously.
    """
    try:
        account = AmazonAccount.objects.get(id=account_id)
        logger.info(f"Starting Celery initial Amazon sync for account ID: {account_id} (days={days})")
        res = run_initial_amazon_sync(account, days)
        logger.info(f"Finished Celery initial Amazon sync for account ID: {account_id}, result: {res}")
        return res
    except AmazonAccount.DoesNotExist:
        logger.error(f"AmazonAccount with ID {account_id} does not exist.")
        return {"error": f"AmazonAccount {account_id} not found", "success": False}
    except Exception as exc:
        logger.exception(f"Error executing Celery initial Amazon sync for account ID {account_id}: {exc}")
        raise self.retry(exc=exc)
