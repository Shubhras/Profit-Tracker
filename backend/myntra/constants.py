class MyntraReports:
    ORDERS = "Seller_Orders_Report"
    RETURNS = "Seller_Returns_Report"
    INVENTORY = "Seller_Inventory_Report"
    LISTINGS = "Seller_Listings_Report"
    PAYMENTS = "Seller_Payment_Report"
    WPR = "Seller_WPR_Report"

    CHOICES = [
        (ORDERS, "Seller Orders Report"),
        (RETURNS, "Seller Returns Report"),
        (INVENTORY, "Seller Inventory Report"),
        (LISTINGS, "Seller Listing Report"),
        (PAYMENTS, "Seller Payment Report"),
        (WPR, "Seller WPR Report"),
    ]

class ReportStatus:
    PENDING = "PENDING"
    SCHEDULED = "SCHEDULED"
    READY = "READY"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

    CHOICES = [
        (PENDING, "Pending"),
        (SCHEDULED, "Scheduled"),
        (READY, "Ready"),
        (PROCESSING, "Processing"),
        (COMPLETED, "Completed"),
        (FAILED, "Failed"),
    ]