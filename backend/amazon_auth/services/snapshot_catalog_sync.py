from amazon_auth.catelog_details import (
    sync_catalog_details_for_asin,
)
from amazon_auth.models import AmazonAccount, AmazonListingItem


def sync_catalog_snapshot(account):
    """
    Sync the current Catalog snapshot for one Amazon account.

    Catalog data is not historical data. We take the current
    listing ASINs and fetch their current Catalog information.

    Flow:

        AmazonListingItem
                ↓
        unique ASINs
                ↓
        Amazon Catalog API
                ↓
        AmazonCatalogDetails

    The actual Catalog API logic is handled by the existing:

        sync_catalog_details_for_asin()

    This service only determines which ASINs need to be synced.
    """

    print("\n" + "=" * 80)
    print("STARTING AMAZON CATALOG SNAPSHOT")
    print("=" * 80)

    print(f"ACCOUNT     : {account.seller_central_id}")

    print(f"MARKETPLACE : {account.marketplace_id}")

    print("=" * 80)

    # -------------------------------------------------
    # Get current listings for this account
    # -------------------------------------------------

    listings = (
        AmazonListingItem.objects.filter(
            amazon_account=account,
            marketplace_id=account.marketplace_id,
        )
        .exclude(asin__isnull=True)
        .exclude(asin="")
    )

    # -------------------------------------------------
    # Deduplicate ASINs
    #
    # Multiple SKUs can point to the same ASIN.
    # We only need one Catalog API request per ASIN.
    # -------------------------------------------------

    asins = set()

    for listing in listings:
        if listing.asin:
            asins.add(listing.asin)

    asins = sorted(asins)

    total_asins = len(asins)

    print(f"UNIQUE ASINS : {total_asins}")

    # -------------------------------------------------
    # Counters
    # -------------------------------------------------

    synced = 0
    failed = 0

    # -------------------------------------------------
    # Sync each ASIN
    # -------------------------------------------------

    for index, asin in enumerate(asins, start=1):
        print("\n" + "-" * 80)

        print(f"CATALOG {index}/{total_asins}")

        print(f"ASIN : {asin}")

        try:
            success = sync_catalog_details_for_asin(
                user=account.user,
                account=account,
                asin=asin,
                marketplace_id=account.marketplace_id,
            )

            if success:
                synced += 1

                print(f"CATALOG SYNCED => {asin}")

            else:
                failed += 1

                print(f"CATALOG FAILED => {asin}")

        except Exception as e:
            failed += 1

            print(f"CATALOG ERROR => {asin} => {e}")

    # -------------------------------------------------
    # Final Summary
    # -------------------------------------------------

    print("\n" + "=" * 80)
    print("AMAZON CATALOG SNAPSHOT COMPLETED")
    print("=" * 80)

    print(f"ACCOUNT : {account.seller_central_id}")

    print(f"ASINS   : {total_asins}")

    print(f"SYNCED  : {synced}")

    print(f"FAILED  : {failed}")

    print("=" * 80)

    return {
        "success": failed == 0,
        "account": account.seller_central_id,
        "total_asins": total_asins,
        "synced": synced,
        "failed": failed,
    }
