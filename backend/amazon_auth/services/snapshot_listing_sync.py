from amazon_auth.listing_items import sync_listing_items
from amazon_auth.models import AmazonAccount


def sync_listing_snapshot(account):
    """
    Sync the current Amazon listing snapshot for one account.

    This is intended for initial Amazon account onboarding.

    Unlike Orders / OrderItems / Transactions, listings are
    not historical data. We simply fetch the seller's current
    listing state from Amazon.

    The existing sync_listing_items() function handles:

        - SP-API Listing Items API
        - Pagination
        - SKU / ASIN
        - Product type
        - Condition
        - Status
        - FNSKU
        - Images
        - Attributes
        - Issues
        - Offers
        - Fulfillment availability
        - Relationships
        - Product types
        - Raw response

    Existing listings are updated using the model's
    unique constraint:

        amazon_account + sku + marketplace_id

    so running this snapshot again will not create duplicates.
    """

    print("\n" + "=" * 80)
    print("STARTING AMAZON LISTING SNAPSHOT")
    print("=" * 80)

    print(f"ACCOUNT       : {account.seller_central_id}")

    print(f"MARKETPLACE   : {account.marketplace_id}")

    print("=" * 80)

    try:
        # -------------------------------------------------
        # Existing listing sync
        # -------------------------------------------------
        #
        # We deliberately reuse the existing implementation
        # rather than duplicating the SP-API request logic.
        #
        # The existing function already handles pagination
        # and update_or_create().
        # -------------------------------------------------

        total_synced = sync_listing_items(
            user=account.user,
            account=account,
        )

        print("\n" + "=" * 80)
        print("AMAZON LISTING SNAPSHOT COMPLETED")
        print("=" * 80)

        print(f"ACCOUNT       : {account.seller_central_id}")

        print(f"LISTINGS SYNCED: {total_synced}")

        print("=" * 80)

        return {
            "success": True,
            "account": account.seller_central_id,
            "listings_synced": total_synced,
        }

    except Exception as e:
        print("\n" + "=" * 80)
        print("AMAZON LISTING SNAPSHOT FAILED")
        print("=" * 80)

        print(f"ACCOUNT : {account.seller_central_id}")

        print(f"ERROR   : {e}")

        print("=" * 80)

        return {
            "success": False,
            "account": account.seller_central_id,
            "listings_synced": 0,
            "error": str(e),
        }
