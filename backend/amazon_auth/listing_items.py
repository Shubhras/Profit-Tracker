# amazon_auth/listing_sync.py

from django.db import transaction

from amazon_auth.models import AmazonListingItem
from amazon_auth.spapi_manager import SPAPIManager


from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from amazon_auth.serializers import AmazonListingItemSerializer


def sync_listing_items(user, account):

    manager = SPAPIManager(user=user, account=account)

    seller_id = account.seller_central_id
    marketplace_id = account.marketplace_id

    next_token = None
    total_synced = 0

    while True:

        response = manager.search_listing_items(
            seller_id=seller_id,
            marketplace_id=marketplace_id,
            page_token=next_token
        )

        items = response.get("items", [])

        for item in items:

            try:

                sku = item.get("sku")

                summary = item.get("summaries", [{}])[0]

                asin = summary.get("asin")

                marketplace_id = summary.get("marketplaceId")

                product_type = summary.get("productType")

                condition_type = summary.get("conditionType")

                status = summary.get("status", [])

                fnsku = summary.get("fnSku")

                item_name = summary.get("itemName")

                created_date = summary.get("createdDate")

                last_updated_date = summary.get("lastUpdatedDate")

                main_image = summary.get("mainImage", {})

                image_url = main_image.get("link") if main_image else None

                with transaction.atomic():

                    AmazonListingItem.objects.update_or_create(

                        amazon_account=account,
                        sku=sku,
                        marketplace_id=marketplace_id,

                        defaults={

                            "user": user,

                            "asin": asin,

                            "product_type": product_type,

                            "condition_type": condition_type,

                            "status": status,

                            "fnsku": fnsku,

                            "item_name": item_name,

                            "image_url": image_url,

                            "created_date": created_date,

                            "last_updated_date": last_updated_date,

                            "attributes": item.get("attributes", {}),

                            "issues": item.get("issues", []),

                            "offers": item.get("offers", []),

                            "fulfillment_availability": item.get(
                                "fulfillmentAvailability",
                                []
                            ),

                            "relationships": item.get(
                                "relationships",
                                []
                            ),

                            "product_types": item.get(
                                "productTypes",
                                []
                            ),

                            "raw_response": item
                        }
                    )

                total_synced += 1

                print(f"Synced SKU: {sku}")

            except Exception as e:

                print(f"Error syncing SKU {item.get('sku')}: {str(e)}")

        pagination = response.get("pagination", {})

        next_token = pagination.get("nextToken")

        if not next_token:
            break

    return total_synced


class AmazonListingItemsView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            user = request.user

            data = request.data

            search = data.get("search", "")
            marketplace_id = data.get("marketplace_id")
            product_type = data.get("product_type")
            condition_type = data.get("condition_type")
            asin = data.get("asin")
            sku = data.get("sku")

            pagination = data.get("pagination", {})

            page_no = int(pagination.get("pageNo", 1))
            page_size = int(pagination.get("pageSize", 10))

            queryset = (
                AmazonListingItem.objects
                .filter(user=user)
                .select_related("amazon_account")
                .order_by("-last_updated_date")
            )

            # SEARCH
            if search:

                queryset = queryset.filter(
                    Q(sku__icontains=search) |
                    Q(asin__icontains=search) |
                    Q(item_name__icontains=search) |
                    Q(product_type__icontains=search) |
                    Q(fnsku__icontains=search)
                )

            # FILTERS
            if marketplace_id:

                queryset = queryset.filter(
                    marketplace_id=marketplace_id
                )

            if product_type:

                queryset = queryset.filter(
                    product_type__icontains=product_type
                )

            if condition_type:

                queryset = queryset.filter(
                    condition_type=condition_type
                )

            if asin:

                queryset = queryset.filter(
                    asin=asin
                )

            if sku:

                queryset = queryset.filter(
                    sku=sku
                )

            total_count = queryset.count()

            start = (page_no - 1) * page_size
            end = start + page_size

            queryset = queryset[start:end]

            serializer = AmazonListingItemSerializer(
                queryset,
                many=True
            )

            return Response({

                "status": True,

                "message": "Amazon listing items fetched successfully",

                "totalCount": total_count,

                "pageNo": page_no,

                "pageSize": page_size,

                "totalPages": (
                    total_count + page_size - 1
                ) // page_size,

                "data": serializer.data

            }, status=status.HTTP_200_OK)

        except Exception as e:

            return Response({

                "status": False,

                "message": str(e)

            }, status=status.HTTP_400_BAD_REQUEST)
        


        
        
