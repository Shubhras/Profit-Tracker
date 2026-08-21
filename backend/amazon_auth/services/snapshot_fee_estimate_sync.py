from amazon_auth.feesestimate_snapshot import save_fee_estimate_snapshot
from amazon_auth.models import (
    AmazonAccount,
    AmazonListingItem,
    OrderItem,
)


def sync_fee_estimate_snapshot(account):
    """
    Populate Amazon fee estimates for the current listing snapshot
    of one Amazon account.

    The existing save_fee_estimate() function is intentionally reused
    so that the initial sync and the normal fee-estimate cron use the
    same fee calculation and Amazon API logic.

    Flow:

        AmazonListingItem
              |
              v
        Get unique SKU
              |
              v
        Find ALL OrderItems for that SKU
              |
              +---- Existing estimate -> save_fee_estimate()
              |
              +---- Missing estimate -> save_fee_estimate()
              |
              v
        AmazonEstimatedFee

    Important:
    - We process ALL OrderItems for a SKU, not just .first().
    - save_fee_estimate() itself prevents duplicate estimates.
    - Listings with no OrderItem are still skipped.
    """

    print("\n" + "=" * 80)
    print("STARTING AMAZON FEE ESTIMATE SNAPSHOT")
    print("=" * 80)

    print(f"ACCOUNT     : {account.seller_central_id}")
    print(f"MARKETPLACE : {account.marketplace_id}")

    print("=" * 80)

    # -------------------------------------------------
    # CURRENT LISTINGS
    # -------------------------------------------------

    listings = (
        AmazonListingItem.objects.filter(
            amazon_account=account,
            marketplace_id=account.marketplace_id,
        )
        .exclude(sku__isnull=True)
        .exclude(sku="")
    )

    # -------------------------------------------------
    # UNIQUE SKUs
    # -------------------------------------------------

    sku_set = set()

    for listing in listings:
        if listing.sku:
            sku_set.add(listing.sku)

    skus = sorted(sku_set)

    total_skus = len(skus)

    print(f"UNIQUE LISTING SKUS : {total_skus}")

    # -------------------------------------------------
    # COUNTERS
    # -------------------------------------------------

    processed = 0
    skipped = 0
    failed = 0

    # -------------------------------------------------
    # PROCESS EACH SKU
    # -------------------------------------------------

    for index, sku in enumerate(skus, start=1):
        print("\n" + "-" * 80)

        print(f"FEE ESTIMATE {index}/{total_skus}")

        print(f"SKU : {sku}")

        # -------------------------------------------------
        # FIND ALL ORDER ITEMS FOR THIS SKU
        # -------------------------------------------------
        #
        # IMPORTANT:
        #
        # Do NOT use .first() here.
        #
        # A SKU can exist in many different orders.
        #
        # Example:
        #
        # SKU ABC
        #   ├── Order 1 -> OrderItem 1
        #   ├── Order 2 -> OrderItem 2
        #   ├── Order 3 -> OrderItem 3
        #   └── Order 4 -> OrderItem 4
        #
        # Each OrderItem can have its own
        # AmazonEstimatedFee record.
        # -------------------------------------------------

        order_items = (
            OrderItem.objects.filter(
                order__amazon_account=account,
                seller_sku=sku,
            )
            .select_related(
                "order",
                "order__amazon_account",
                "order__user",
            )
            .order_by("-created_at")
        )

        order_item_count = order_items.count()

        if order_item_count == 0:
            print(f"SKIPPED => No OrderItem found for {sku}")

            skipped += 1

            continue

        print(f"ORDER ITEMS FOUND => {order_item_count} for {sku}")

        # -------------------------------------------------
        # PROCESS EVERY ORDER ITEM
        # -------------------------------------------------

        for order_item in order_items:
            print(
                f"PROCESSING ORDER ITEM => "
                f"ORDER={order_item.order.amazon_order_id} | "
                f"ORDER_ITEM={order_item.order_item_id}"
            )

            try:
                # -------------------------------------------------
                # REUSE THE EXISTING FEE ESTIMATE FUNCTION
                # -------------------------------------------------
                #
                # This means we keep exactly the same:
                #
                # - selling price calculation
                # - fulfillment detection
                # - Amazon API request
                # - retry handling
                # - fee parsing
                # - database storage
                #
                # used by the normal cron.
                # -------------------------------------------------

                fee_obj = save_fee_estimate_snapshot(
                    order_item=order_item,
                    user=account.user,
                )

                if fee_obj:
                    processed += 1

                    print(
                        f"FEE ESTIMATE PROCESSED => "
                        f"ORDER={order_item.order.amazon_order_id} | "
                        f"SKU={sku} | "
                        f"TOTAL={fee_obj.total_fees}"
                    )

                else:
                    failed += 1

                    print(
                        f"FEE ESTIMATE FAILED => "
                        f"ORDER={order_item.order.amazon_order_id} | "
                        f"SKU={sku}"
                    )

            except Exception as e:
                failed += 1

                print(
                    f"FEE ESTIMATE ERROR => "
                    f"ORDER={order_item.order.amazon_order_id} | "
                    f"SKU={sku} | "
                    f"ERROR={e}"
                )

    # -------------------------------------------------
    # FINAL SUMMARY
    # -------------------------------------------------

    print("\n" + "=" * 80)
    print("AMAZON FEE ESTIMATE SNAPSHOT COMPLETED")
    print("=" * 80)

    print(f"ACCOUNT  : {account.seller_central_id}")
    print(f"SKUS     : {total_skus}")
    print(f"PROCESSED: {processed}")
    print(f"SKIPPED  : {skipped}")
    print(f"FAILED   : {failed}")

    print("=" * 80)

    return {
        "success": failed == 0,
        "account": account.seller_central_id,
        "total_skus": total_skus,
        "processed": processed,
        "skipped": skipped,
        "failed": failed,
    }
