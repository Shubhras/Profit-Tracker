from .models import *
from .spapi_manager import *
import requests
from decimal import Decimal
from rest_framework.response import Response
# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
def sync_product_pricing(user):

    asins = (
        OrderItem.objects
        .filter(order__user=user)
        .exclude(asin__isnull=True)
        .exclude(asin="")
        .values_list("asin", flat=True)
        .distinct()
    )

    if not asins:
        return {
            "status": False,
            "message": "No ASINs found"
        }

    # access_token = get_access_token(user)
    manager = SPAPIManager(user=user)
    access_token = manager.get_access_token()

    url = (
        "https://sellingpartnerapi-eu.amazon.com"
        "/products/pricing/v0/price"
    )

    def chunked(lst, size):
        for i in range(0, len(lst), size):
            yield lst[i:i + size]

    saved_items = []

    for asin_batch in chunked(list(asins), 20):

        params = {
            "MarketplaceId": "A21TJRUUN4KGV",
            "ItemType": "Asin",
            "Asins": ",".join(asin_batch)
        }

        headers = {
            "x-amz-access-token": access_token,
            "Content-Type": "application/json"
        }

        response = requests.get(
            url,
            headers=headers,
            params=params
        )

        if response.status_code != 200:
            print(response.text)
            continue

        data = response.json()

        for product in data.get("payload", []):

            asin = product.get("ASIN")

            offers = (
                product
                .get("Product", {})
                .get("Offers", [])
            )

            seen_skus = set()

            for offer in offers:

                sku = offer.get("SellerSKU")

                if not sku:
                    continue

                if sku in seen_skus:
                    continue

                seen_skus.add(sku)

                buying_price = offer.get("BuyingPrice", {})

                listing_price = Decimal(
                    str(
                        buying_price
                        .get("ListingPrice", {})
                        .get("Amount", 0)
                    )
                )

                landed_price = Decimal(
                    str(
                        buying_price
                        .get("LandedPrice", {})
                        .get("Amount", 0)
                    )
                )

                shipping_price = Decimal(
                    str(
                        buying_price
                        .get("Shipping", {})
                        .get("Amount", 0)
                    )
                )

                regular_price = Decimal(
                    str(
                        offer
                        .get("RegularPrice", {})
                        .get("Amount", 0)
                    )
                )

                currency = (
                    buying_price
                    .get("ListingPrice", {})
                    .get("CurrencyCode", "INR")
                )

                ProductPricing.objects.update_or_create(
                    user=user,
                    asin=asin,
                    sku=sku,
                    defaults={
                        "marketplace_id": "A21TJRUUN4KGV",
                        "listing_price": listing_price,
                        "landed_price": landed_price,
                        "shipping_price": shipping_price,
                        "regular_price": regular_price,
                        "currency": currency,
                        "fulfillment_channel": offer.get("FulfillmentChannel"),
                        "item_condition": offer.get("ItemCondition")
                    }
                )

                saved_items.append({
                    "asin": asin,
                    "sku": sku,
                    "listing_price": float(listing_price)
                })

    return {
        "status": True,
        "count": len(saved_items),
        "data": saved_items
    }


class SyncProductPricingAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        result = sync_product_pricing(
            request.user
        )

        return Response(result)