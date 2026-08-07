from myntra.constants import MyntraReports
from myntra.services.sync.base_sync import BaseSyncService


class InventorySyncService(BaseSyncService):

    REPORT_NAME = MyntraReports.INVENTORY