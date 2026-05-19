# services/catalog_sync.py

from django.db import transaction
from amazon_auth.models import AmazonCatalogDetails
from .models import OrderItem

from .spapi_manager import SPAPIManager
from amazon_auth.utils import safe_catalog_call

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from amazon_auth.serializers import (
    AmazonCatalogDetailsSerializer
)


def get_first_value(data, key):
    try:
        return data.get(key, [{}])[0].get("value")
    except Exception:
        return None


def sync_catalog_details_for_asin(user, account, asin, marketplace_id):
    """
    Sync single ASIN catalog details
    Avoid duplicate entries using update_or_create
    """

    try:

        manager = SPAPIManager(user=user, account=account)

        catalog_response = safe_catalog_call(
            manager,
            asin,
            marketplace_id
        )

        if not catalog_response:
            return False

        attributes = catalog_response.get("attributes", {})
        images_data = catalog_response.get("images", [])
        relationships = catalog_response.get("relationships", [])

        # -----------------------------------
        # BASIC VALUES
        # -----------------------------------

        brand = None
        image_url = None
        parent_asin = None

        # -----------------------------------
        # PARENT ASIN
        # -----------------------------------

        for rel_group in relationships:
            for rel in rel_group.get("relationships", []):

                if rel.get("type") == "VARIATION":

                    parent_list = rel.get("parentAsins", [])

                    if parent_list:
                        parent_asin = parent_list[0]
                        break

            if parent_asin:
                break

        # -----------------------------------
        # BRAND
        # -----------------------------------

        if "brand" in attributes:
            brand = attributes["brand"][0].get("value")

        # -----------------------------------
        # IMAGE
        # -----------------------------------

        for img_group in images_data:

            if img_group.get("marketplaceId") == marketplace_id:

                imgs = img_group.get("images", [])

                if imgs:
                    image_url = imgs[0].get("link")
                    break

        # -----------------------------------
        # OTHER FIELDS
        # -----------------------------------

        item_name = get_first_value(attributes, "item_name")
        model_name = get_first_value(attributes, "model_name")
        model_number = get_first_value(attributes, "model_number")

        manufacturer = get_first_value(attributes, "manufacturer")

        color = get_first_value(attributes, "color")
        material = get_first_value(attributes, "material")
        size = get_first_value(attributes, "size")

        item_type_name = get_first_value(attributes, "item_type_name")

        care_instructions = get_first_value(
            attributes,
            "care_instructions"
        )

        recommended_uses = get_first_value(
            attributes,
            "recommended_uses_for_product"
        )

        product_description = get_first_value(
            attributes,
            "product_description"
        )

        number_of_items = get_first_value(
            attributes,
            "number_of_items"
        )

        batteries_required = get_first_value(
            attributes,
            "batteries_required"
        )

        # -----------------------------------
        # BULLET POINTS
        # -----------------------------------

        bullet_points = [
            x.get("value")
            for x in attributes.get("bullet_point", [])
        ]

        # -----------------------------------
        # SPECIAL FEATURES
        # -----------------------------------

        special_features = [
            x.get("value")
            for x in attributes.get("special_feature", [])
        ]

        # -----------------------------------
        # WEIGHT
        # -----------------------------------

        item_weight = None
        item_weight_unit = None

        if attributes.get("item_weight"):

            item_weight = attributes["item_weight"][0].get("value")

            item_weight_unit = attributes["item_weight"][0].get("unit")

        package_weight = None
        package_weight_unit = None

        if attributes.get("item_package_weight"):

            package_weight = attributes["item_package_weight"][0].get(
                "value"
            )

            package_weight_unit = attributes[
                "item_package_weight"
            ][0].get("unit")

        # -----------------------------------
        # DIMENSIONS
        # -----------------------------------

        item_dimensions = attributes.get(
            "item_dimensions",
            []
        )

        package_dimensions = attributes.get(
            "item_package_dimensions",
            []
        )

        # -----------------------------------
        # SALES RANK
        # -----------------------------------

        sales_rank = None
        sales_rank_category = None

        display_group_rank = None
        display_group_rank_title = None

        sales_ranks = catalog_response.get("salesRanks", [])

        if sales_ranks:

            rank_data = sales_ranks[0]

            # CATEGORY RANK
            classification_ranks = rank_data.get(
                "classificationRanks",
                []
            )

            if classification_ranks:

                sales_rank = classification_ranks[0].get("rank")

                sales_rank_category = classification_ranks[0].get(
                    "title"
                )

            # MAIN AMAZON RANK
            display_group_ranks = rank_data.get(
                "displayGroupRanks",
                []
            )

            if display_group_ranks:

                display_group_rank = display_group_ranks[0].get(
                    "rank"
                )

                display_group_rank_title = display_group_ranks[0].get(
                    "title"
                )

        # -----------------------------------
        # SAVE DATA
        # -----------------------------------

        with transaction.atomic():

            AmazonCatalogDetails.objects.update_or_create(
                user=user,
                asin=asin,
                marketplace_id=marketplace_id,
                defaults={

                    "parent_asin": parent_asin,

                    "brand": brand,

                    "item_name": item_name,
                    "model_name": model_name,
                    "model_number": model_number,

                    "image_url": image_url,

                    "manufacturer": manufacturer,

                    "color": color,
                    "material": material,
                    "size": size,

                    "item_type_name": item_type_name,

                    "bullet_points": bullet_points,

                    "product_description": product_description,

                    "item_weight": item_weight,
                    "item_weight_unit": item_weight_unit,

                    "package_weight": package_weight,
                    "package_weight_unit": package_weight_unit,

                    "item_dimensions": item_dimensions,
                    "package_dimensions": package_dimensions,

                    "number_of_items": number_of_items,

                    "batteries_required": batteries_required,

                    "care_instructions": care_instructions,

                    "special_features": special_features,

                    "recommended_uses": recommended_uses,

                    "sales_rank": sales_rank,
                    "sales_rank_category": sales_rank_category,

                    "raw_response": catalog_response,
                    "display_group_rank": display_group_rank,

                    "display_group_rank_title": display_group_rank_title,

                   
                }
            )

        return True

    except Exception as e:
        print(f"Catalog sync error for ASIN {asin}: {str(e)}")
        return False
    

class AmazonCatalogDetailsAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        asin = request.GET.get("asin")
        parent_asin = request.GET.get("parent_asin")
        brand = request.GET.get("brand")
        marketplace_id = request.GET.get("marketplace_id")
        search = request.GET.get("search")

        queryset = (
            AmazonCatalogDetails.objects
            .filter(user=user)
            .order_by("-created_at")
        )

        # FILTERS

        if asin:
            queryset = queryset.filter(asin=asin)

        if parent_asin:
            queryset = queryset.filter(
                parent_asin=parent_asin
            )

        if brand:
            queryset = queryset.filter(
                brand__icontains=brand
            )

        if marketplace_id:
            queryset = queryset.filter(
                marketplace_id=marketplace_id
            )

        # SEARCH

        if search:
            queryset = queryset.filter(
                item_name__icontains=search
            )

        serializer = AmazonCatalogDetailsSerializer(
            queryset,
            many=True
        )

        return Response(
            {
                "status": "success",
                "count": queryset.count(),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )    