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
            "standard_cost",
            "gst_rate",
            "tcs",
            "region",
            "shiping_estimate",
            "step_level",
            "issues",
            "offers",
            "fulfillment_availability",
            "relationships",
            "product_types",
            "created_at",
            "updated_at",
        ] 
        

class AmazonEstimatedFeeSerializer(serializers.ModelSerializer):

    order_item_id = serializers.IntegerField(source="order_item.order_item_id", read_only=True)
    order_id = serializers.SerializerMethodField()

    class Meta:
        model = AmazonEstimatedFee
        fields = [
            "id",
            "order_id",
            "order_item_id",

            "seller_sku",
            "asin",
            "marketplace_id",

            "currency",

            "selling_price",

            "total_fees",

            "referral_fee",
            "closing_fee",
            "per_item_fee",

            "fba_fee",
            "fba_pick_pack_fee",
            "fba_weight_handling_fee",

            "tax_amount",

            "fulfillment_channel",

            "estimated_at",
            "created_at",
        ]               
        
    def get_order_id(self, obj):

        try:
            return obj.order_item.order.amazon_order_id
        except:
            return None    