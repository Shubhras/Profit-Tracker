from myntra.constants import MyntraReports
from myntra.services.sync.base_sync import BaseSyncService


class WPRSyncService(BaseSyncService):

    REPORT_NAME = MyntraReports.WPR