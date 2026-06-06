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

    order_item_id = serializers.CharField(
        source="order_item.order_item_id",
        read_only=True
    )

    order_id = serializers.SerializerMethodField()

    image_url = serializers.CharField(
        source="order_item.image_url",
        read_only=True
    )

    class Meta:
        model = AmazonEstimatedFee

        fields = [
            "id",

            "order_id",
            "order_item_id",

            "image_url",

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
        

class AmazonSettlementSummarySerializer(serializers.Serializer):

    statement_period = serializers.CharField()
    beginning_balance = serializers.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    sales = serializers.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    refunds = serializers.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    expenses = serializers.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    others = serializers.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    payout_amount = serializers.DecimalField(
        max_digits=18,
        decimal_places=2
    )

    start_date = serializers.DateField()
    end_date = serializers.DateField()

    total_transactions = serializers.IntegerField()
    
    
# serializers.py

from rest_framework import serializers

from amazon_auth.models import (
    AmazonTransaction,
    AmazonTransactionRelatedIdentifier,
    AmazonTransactionBreakdown,
    AmazonTransactionContext
)


class AmazonTransactionRelatedIdentifierSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = AmazonTransactionRelatedIdentifier

        fields = [
            "id",
            "identifier_name",
            "identifier_value"
        ]


class AmazonTransactionBreakdownSerializer(
    serializers.ModelSerializer
):

    children = serializers.SerializerMethodField()

    class Meta:

        model = AmazonTransactionBreakdown

        fields = [
            "id",
            "breakdown_type",
            "amount",
            "currency_code",
            "children"
        ]

    def get_children(self, obj):

        children = obj.children.all()

        return AmazonTransactionBreakdownSerializer(
            children,
            many=True
        ).data


class AmazonTransactionContextSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = AmazonTransactionContext

        fields = [
            "id",
            "context_type",
            "asin",
            "sku",
            "quantity_shipped",
            "fulfillment_network",
            "deferral_reason",
            "maturity_date",
            "store_name",
            "order_type",
            "channel",
            "raw_context"
        ]


class AmazonTransactionListSerializer(
    serializers.ModelSerializer
):

    order_id = serializers.SerializerMethodField()

    related_identifiers = (
        AmazonTransactionRelatedIdentifierSerializer(
            many=True
        )
    )

    breakdowns = serializers.SerializerMethodField()

    contexts = AmazonTransactionContextSerializer(
        many=True
    )

    class Meta:

        model = AmazonTransaction

        fields = [
            "id",
            "transaction_id",

            "order_id",

            "transaction_type",
            "transaction_status",
            "description",
            "posted_date",
            "total_amount",
            "currency_code",

            "related_identifiers",

            "breakdowns",
            "contexts",
            "created_at"
        ]

    # =====================================
    # Get Order ID
    # =====================================

    def get_order_id(self, obj):

        identifier = (
            obj.related_identifiers
            .filter(
                identifier_name__icontains="order"
            )
            .first()
        )

        if identifier:

            return identifier.identifier_value

        return None

    # =====================================
    # Get Breakdowns
    # =====================================

    def get_breakdowns(self, obj):

        breakdowns = obj.breakdowns.filter(
            parent__isnull=True
        )

        return AmazonTransactionBreakdownSerializer(
            breakdowns,
            many=True
        ).data            
    
            