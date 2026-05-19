# serializers.py

from rest_framework import serializers
from amazon_auth.models import *


class AmazonCatalogDetailsSerializer(serializers.ModelSerializer):

    class Meta:
        model = AmazonCatalogDetails

        fields = [
            "id",

            "asin","parent_asin","marketplace_id",
            "brand","item_name","model_name","model_number",
            "image_url","manufacturer",
            "color","material","size","item_type_name",
            "bullet_points","product_description",
            "item_weight","item_weight_unit",
            "package_weight","package_weight_unit",
            "item_dimensions","package_dimensions",
            "number_of_items","batteries_required",
            "care_instructions","special_features",
            "recommended_uses","sales_rank","sales_rank_category","display_group_rank","display_group_rank_title",

            "created_at",
            "updated_at",
        ]


class AmazonListingItemSerializer(serializers.ModelSerializer):

    seller_central_id = serializers.CharField(
        source="amazon_account.seller_central_id",
        read_only=True
    )

    class Meta:

        model = AmazonListingItem

        fields = [
            "id",
            "seller_central_id",
            "sku",
            "asin",
            "marketplace_id",
            "product_type",
            "condition_type",
            "status",
            "fnsku",
            "item_name",
            "image_url",
            "created_date",
            "last_updated_date",
            "attributes",
            "issues",
            "offers",
            "fulfillment_availability",
            "relationships",
            "product_types",
            "created_at",
            "updated_at",
        ]        