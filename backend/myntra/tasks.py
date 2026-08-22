import logging
from celery import shared_task
from myntra.models import MyntraConnection
from myntra.services.initial_sync_service import MyntraInitialSyncService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def task_run_initial_myntra_sync(self, connection_id, days=None):
    """
    Celery task to run initial Myntra sync asynchronously.
    """
    try:
        connection = MyntraConnection.objects.get(id=connection_id)
        logger.info(f"Starting Celery initial Myntra sync for connection ID: {connection_id}")
        service = MyntraInitialSyncService(connection, days=days)
        res = service.run()
        logger.info(f"Finished Celery initial Myntra sync for connection ID: {connection_id}, result: {res}")
        return res
    except MyntraConnection.DoesNotExist:
        logger.error(f"MyntraConnection with ID {connection_id} does not exist.")
        return {"error": f"MyntraConnection {connection_id} not found", "success": False}
    except Exception as exc:
        logger.exception(f"Error executing Celery initial Myntra sync for connection ID {connection_id}: {exc}")
        raise self.retry(exc=exc)
