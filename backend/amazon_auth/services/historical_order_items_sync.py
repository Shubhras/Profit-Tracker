import time
from datetime import timedelta

from django.utils import timezone

from amazon_auth.models import (
    MissingCatalogQueue,
    Order,
    OrderItem,
    ProductMapping,
)
from amazon_auth.spapi_manager import SPAPIManager
from amazon_auth.utils import safe_catalog_call

# =========================================================
# CONFIGURATION
# =========================================================

# Safety delay between OrderItems API requests.
#
# We intentionally keep the historical sync slower because
# one request is made for each Amazon order.
REQUEST_DELAY = 1.0


# =========================================================
# HISTORICAL ORDER ITEM SYNC
# =========================================================


def sync_historical_order_items(
    account,
    days=60,
):
    """
    Sync OrderItems for historical orders already stored
    in the database.

    IMPORTANT:
    The Amazon OrderItems API is NOT a date-range endpoint.

    Instead:

        Historical Orders in DB
                ↓
        Get AmazonOrderId
                ↓
        GET /orders/v0/orders/{order_id}/orderItems
                ↓
        Save/update OrderItems

    This means the `days` parameter determines which Orders
    we process, not which OrderItems Amazon returns.

    Existing OrderItems are updated.
    Missing OrderItems are created.

    Product information is enriched using:

        1. ProductMapping
        2. Amazon Catalog API fallback
        3. MissingCatalogQueue when no mapping exists
    """

    # =====================================================
    # VALIDATION
    # =====================================================

    if days <= 0:
        raise ValueError("days must be greater than 0")

    print("\n" + "=" * 80)

    print(f"STARTING HISTORICAL ORDER ITEM SYNC: {account.seller_central_id}")

    print("=" * 80)

    # =====================================================
    # DATE RANGE
    # =====================================================

    end_date = timezone.now()

    start_date = end_date - timedelta(days=days)

    print(f"REQUESTED DAYS : {days}")

    print(f"ORDER WINDOW   : {start_date.isoformat()} -> {end_date.isoformat()}")

    # =====================================================
    # GET ORDERS ALREADY SYNCED
    # =====================================================
    #
    # We deliberately use Orders already stored in the DB.
    #
    # The historical order sync is responsible for getting
    # the correct historical orders.
    #
    # This service only enriches those orders with their
    # OrderItems.
    # =====================================================

    orders = Order.objects.filter(
        amazon_account=account,
        purchase_date__gte=start_date,
        purchase_date__lte=end_date,
    ).order_by("purchase_date")

    total_orders = orders.count()

    print(f"ORDERS FOUND   : {total_orders}")

    # =====================================================
    # NOTHING TO PROCESS
    # =====================================================

    if total_orders == 0:
        print("NO ORDERS FOUND FOR HISTORICAL ORDER ITEM SYNC")

        return {
            "orders_processed": 0,
            "items_created": 0,
            "items_updated": 0,
            "items_skipped": 0,
            "failed": 0,
        }

    # =====================================================
    # SP-API MANAGER
    # =====================================================

    manager = SPAPIManager(account=account)

    # =====================================================
    # COUNTERS
    # =====================================================

    orders_processed = 0

    items_created = 0
    items_updated = 0
    items_skipped = 0

    failed = 0

    # =====================================================
    # PROCESS ORDERS
    # =====================================================

    for index, order in enumerate(
        orders,
        start=1,
    ):
        amazon_order_id = order.amazon_order_id

        print("\n" + "-" * 70)

        print(f"ORDER {index}/{total_orders}: {amazon_order_id}")

        # =================================================
        # FETCH ORDER ITEMS
        # =================================================
        #
        # get_order_items() already uses:
        #
        # GET /orders/v0/orders/{order_id}/orderItems
        #
        # and supports NextToken pagination.
        # =================================================

        try:
            next_token = None

            order_items = []

            while True:
                response = manager.get_order_items(
                    amazon_order_id,
                    next_token=next_token,
                )

                if not isinstance(
                    response,
                    dict,
                ):
                    raise Exception("Invalid OrderItems API response")

                # -------------------------------------------------
                # Extract payload
                # -------------------------------------------------

                payload = response.get("payload") or {}

                # -------------------------------------------------
                # Extract OrderItems
                # -------------------------------------------------
                #
                # Amazon normally returns OrderItems.
                #
                # We also support Items because your existing
                # sync_orders() supports both.
                # -------------------------------------------------

                items = payload.get("OrderItems") or payload.get("Items") or []

                if not isinstance(
                    items,
                    list,
                ):
                    items = []

                order_items.extend(items)

                # -------------------------------------------------
                # Pagination
                # -------------------------------------------------

                next_token = payload.get("NextToken") or response.get("NextToken")

                if not next_token:
                    break

                # -------------------------------------------------
                # Rate-limit safety
                # -------------------------------------------------

                time.sleep(REQUEST_DELAY)

        except Exception as e:
            failed += 1

            print(f"FAILED ORDER ITEMS: {amazon_order_id}")

            print(f"ERROR: {e}")

            continue

        orders_processed += 1

        print(f"ITEMS RECEIVED: {len(order_items)}")

        # =================================================
        # BULK LOAD PRODUCT MAPPINGS
        # =================================================
        #
        # Instead of querying ProductMapping once for every
        # OrderItem, collect all SKUs first and perform one
        # database query for the order.
        #
        # This is the same approach used by your existing
        # sync_orders() implementation.
        # =================================================

        skus = [
            item.get("SellerSKU")
            for item in order_items
            if isinstance(item, dict) and item.get("SellerSKU")
        ]

        mappings = {
            mapping.seller_sku: mapping
            for mapping in ProductMapping.objects.filter(seller_sku__in=skus)
        }

        # =================================================
        # PROCESS ORDER ITEMS
        # =================================================

        for item in order_items:
            try:
                # -------------------------------------------------
                # Safety check
                # -------------------------------------------------

                if not isinstance(
                    item,
                    dict,
                ):
                    items_skipped += 1

                    continue

                # -------------------------------------------------
                # Basic identifiers
                # -------------------------------------------------

                order_item_id = item.get("OrderItemId")

                sku = item.get("SellerSKU")

                asin = item.get("ASIN")

                marketplace_id = order.marketplace_id or account.marketplace_id

                # -------------------------------------------------
                # OrderItemId fallback
                # -------------------------------------------------

                if not order_item_id:
                    if not sku:
                        print("SKIPPING ITEM: missing OrderItemId and SKU")

                        items_skipped += 1

                        continue

                    order_item_id = f"{amazon_order_id}_{sku}"

                # =================================================
                # PRODUCT INFORMATION
                # =================================================

                image_url = None
                brand = None
                parent_asin = None

                mapping = mappings.get(sku)

                # =================================================
                # PRIORITY 1: PRODUCT MAPPING
                # =================================================

                if mapping:
                    image_url = getattr(
                        mapping,
                        "image_url",
                        None,
                    )

                    brand = getattr(
                        mapping,
                        "brand",
                        None,
                    )

                    parent_asin = getattr(
                        mapping,
                        "parent_asin",
                        None,
                    )

                    print(f"PRODUCT MAPPING FOUND: SKU={sku}")

                # =================================================
                # PRIORITY 2: CATALOG API FALLBACK
                # =================================================
                #
                # Only call Catalog if:
                #
                #   - image is missing
                #   - ASIN exists
                #   - marketplace exists
                #
                # This matches your existing sync_orders()
                # behavior.
                # =================================================

                if not image_url and asin and marketplace_id:
                    try:
                        print(f"CATALOG FALLBACK: SKU={sku}, ASIN={asin}")

                        catalog_response = safe_catalog_call(
                            manager,
                            asin,
                            marketplace_id,
                        )

                        if not isinstance(
                            catalog_response,
                            dict,
                        ):
                            catalog_response = {}

                        # -------------------------------------------------
                        # Catalog attributes
                        # -------------------------------------------------

                        attributes = catalog_response.get(
                            "attributes",
                            {},
                        )

                        # -------------------------------------------------
                        # Catalog images
                        # -------------------------------------------------

                        images_data = catalog_response.get(
                            "images",
                            [],
                        )

                        # -------------------------------------------------
                        # Catalog relationships
                        # -------------------------------------------------

                        relationships = catalog_response.get(
                            "relationships",
                            [],
                        )

                        # =================================================
                        # FIND PARENT ASIN
                        # =================================================

                        if isinstance(
                            relationships,
                            list,
                        ):
                            for rel_group in relationships:
                                if not isinstance(
                                    rel_group,
                                    dict,
                                ):
                                    continue

                                relationship_list = rel_group.get(
                                    "relationships",
                                    [],
                                )

                                if not isinstance(
                                    relationship_list,
                                    list,
                                ):
                                    continue

                                for rel in relationship_list:
                                    if not isinstance(
                                        rel,
                                        dict,
                                    ):
                                        continue

                                    if rel.get("type") == "VARIATION":
                                        parent_list = rel.get(
                                            "parentAsins",
                                            [],
                                        )

                                        if (
                                            isinstance(
                                                parent_list,
                                                list,
                                            )
                                            and parent_list
                                        ):
                                            parent_asin = parent_list[0]

                                            break

                                if parent_asin:
                                    break

                        # =================================================
                        # FIND BRAND
                        # =================================================

                        if (
                            isinstance(
                                attributes,
                                dict,
                            )
                            and "brand" in attributes
                            and not brand
                        ):
                            brand_data = attributes.get("brand") or []

                            if (
                                isinstance(
                                    brand_data,
                                    list,
                                )
                                and brand_data
                            ):
                                brand = brand_data[0].get("value")

                        # =================================================
                        # FIND IMAGE
                        # =================================================

                        if isinstance(
                            images_data,
                            list,
                        ):
                            for img_group in images_data:
                                if not isinstance(
                                    img_group,
                                    dict,
                                ):
                                    continue

                                if img_group.get("marketplaceId") != marketplace_id:
                                    continue

                                images_list = img_group.get(
                                    "images",
                                    [],
                                )

                                if (
                                    isinstance(
                                        images_list,
                                        list,
                                    )
                                    and images_list
                                ):
                                    image_url = images_list[0].get("link")

                                    if image_url:
                                        break

                    except Exception as e:
                        print(f"CATALOG API FAILED for ASIN={asin}: {e}")

                # =================================================
                # FINAL PARENT ASIN FALLBACK
                # =================================================
                #
                # If ProductMapping did not provide a parent ASIN
                # and Catalog API also did not provide one, use
                # the child ASIN itself.
                #
                # This matches the existing parent-ASIN backfill
                # command used elsewhere in the application.
                # =================================================

                if not parent_asin and asin:
                    parent_asin = asin
                # =================================================
                # MISSING CATALOG QUEUE
                # =================================================
                #
                # If there is no ProductMapping, preserve your
                # existing behavior and add the SKU to the
                # MissingCatalogQueue.
                # =================================================

                if not mapping and sku and asin and marketplace_id:
                    MissingCatalogQueue.objects.get_or_create(
                        seller_sku=sku,
                        account=account,
                        defaults={
                            "asin": asin,
                            "parent_asin": parent_asin,
                            "marketplace_id": marketplace_id,
                            "image_url": image_url,
                            "processed": False,
                        },
                    )

                # =================================================
                # ORDER ITEM DEFAULTS
                # =================================================
                #
                # These fields come directly from the OrderItems
                # API or from ProductMapping/Catalog.
                #
                # We intentionally DO NOT overwrite financial
                # fields such as:
                #
                #   commission_fee
                #   fulfillment_fee
                #   other_fee
                #   payout_amount
                #   refund_amount
                #   claims
                #
                # Those belong to other data-sync processes.
                # =================================================

                defaults = {
                    "seller_sku": sku or "",
                    "asin": asin,
                    "parent_asin": parent_asin,
                    "title": item.get("Title"),
                    "quantity_ordered": (
                        item.get(
                            "QuantityOrdered",
                            0,
                        )
                        or 0
                    ),
                    "quantity_shipped": (
                        item.get(
                            "QuantityShipped",
                            0,
                        )
                        or 0
                    ),
                    "item_price": (
                        item.get(
                            "ItemPrice",
                            {},
                        ).get(
                            "Amount",
                            0,
                        )
                        or 0
                    ),
                    "item_tax": (
                        item.get(
                            "ItemTax",
                            {},
                        ).get(
                            "Amount",
                            0,
                        )
                        or 0
                    ),
                    "shipping_price": (
                        item.get(
                            "ShippingPrice",
                            {},
                        ).get(
                            "Amount",
                            0,
                        )
                        or 0
                    ),
                    "parent_sku": (mapping.parent_sku if mapping else None),
                    "product_name": (
                        mapping.product_name if mapping else item.get("Title")
                    ),
                    "brand": (mapping.brand if mapping else brand),
                    "cost_price": (mapping.cost_price if mapping else 0),
                    "net_sales": (
                        item.get(
                            "ItemPrice",
                            {},
                        ).get(
                            "Amount",
                            0,
                        )
                        or 0
                    ),
                    "promotion_discount": (
                        item.get(
                            "PromotionDiscount",
                            {},
                        ).get(
                            "Amount",
                            0,
                        )
                        or 0
                    ),
                    "raw_data": item,
                }

                # =================================================
                # IMAGE
                # =================================================
                #
                # Do NOT overwrite an existing image with None.
                #
                # This is important because Catalog may fail or
                # Amazon may temporarily return no image.
                # =================================================

                if image_url:
                    defaults["image_url"] = image_url

                # =================================================
                # CREATE / UPDATE ORDER ITEM
                # =================================================

                order_item, created = OrderItem.objects.update_or_create(
                    order=order,
                    order_item_id=order_item_id,
                    defaults=defaults,
                )

                if created:
                    items_created += 1

                    print(f"CREATED ITEM: SKU={sku}, ASIN={asin}, IMAGE={image_url}")

                else:
                    items_updated += 1

                    print(f"UPDATED ITEM: SKU={sku}, ASIN={asin}, IMAGE={image_url}")

            except Exception as e:
                failed += 1

                print(f"FAILED ORDER ITEM {item.get('OrderItemId')}: {e}")

                continue

        # =====================================================
        # RATE LIMIT SAFETY
        # =====================================================

        time.sleep(REQUEST_DELAY)

    # =========================================================
    # FINAL SUMMARY
    # =========================================================

    print("\n" + "=" * 80)

    print("HISTORICAL ORDER ITEM SYNC COMPLETED")

    print("=" * 80)

    print(f"ORDERS PROCESSED : {orders_processed}")

    print(f"ITEMS CREATED    : {items_created}")

    print(f"ITEMS UPDATED    : {items_updated}")

    print(f"ITEMS SKIPPED    : {items_skipped}")

    print(f"FAILED           : {failed}")

    print("=" * 80)

    return {
        "orders_processed": orders_processed,
        "items_created": items_created,
        "items_updated": items_updated,
        "items_skipped": items_skipped,
        "failed": failed,
    }
