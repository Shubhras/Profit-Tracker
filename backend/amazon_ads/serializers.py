from rest_framework import serializers
from django.db.models import Sum
from .models import *


class CampaignMetricSerializer(serializers.ModelSerializer):

    class Meta:
        model = CampaignMetric
        fields = "__all__"

class AdsPortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdsPortfolio
        fields = "__all__"

class AdsCampaignSerializer(serializers.ModelSerializer):

    metrics = serializers.SerializerMethodField()

    profile_id = serializers.SerializerMethodField()

    country_code = serializers.SerializerMethodField()

    currency_code = serializers.SerializerMethodField()

    class Meta:

        model = AdsCampaign

        fields = [

            "id","campaign_id", "name",
            "state","campaign_type",
            "targeting_type","daily_budget",
            "budget_type", "bidding_strategy",
            "placement_bidding","marketplace_budget_allocation",
            "off_amazon_settings","tags","start_date","end_date","profile_id",
            "country_code","currency_code","metrics","raw_data","created_at"
        ]

    def get_profile_id(self, obj):

        return obj.amazon_account.profile_id

    def get_country_code(self, obj):

        return obj.amazon_account.country_code

    def get_currency_code(self, obj):

        return obj.amazon_account.currency_code

    def get_metrics(self, obj):

        latest_metric = CampaignMetric.objects.filter(
            campaign=obj
        ).order_by("-report_date").first()

        if latest_metric:
            return CampaignMetricSerializer(
                latest_metric
            ).data

        return None
    

# serializers.py

class AdsAdGroupSerializer(serializers.ModelSerializer):

    campaign_name = serializers.SerializerMethodField()
    campaign_id_value = serializers.SerializerMethodField()
    profile_id = serializers.SerializerMethodField()
    country_code = serializers.SerializerMethodField()
    currency_code = serializers.SerializerMethodField()

    class Meta:

        model = AdsAdGroup

        fields = [

            "id",
            "ad_group_id","name","state",
            "default_bid","campaign","campaign_name",
            "campaign_id_value","profile_id",
            "country_code", "currency_code","raw_data", "created_at"
        ]

    def get_campaign_name(self, obj):

        if obj.campaign:
            return obj.campaign.name

        return None

    def get_campaign_id_value(self, obj):

        if obj.campaign:
            return obj.campaign.campaign_id

        return None

    def get_profile_id(self, obj):

        return obj.amazon_account.profile_id

    def get_country_code(self, obj):

        return obj.amazon_account.country_code

    def get_currency_code(self, obj):

        return obj.amazon_account.currency_code    
    


class AdsKeywordSerializer(serializers.ModelSerializer):

    campaign_name = serializers.SerializerMethodField()
    campaign_id_value = serializers.SerializerMethodField()
    ad_group_name = serializers.SerializerMethodField()
    ad_group_id_value = serializers.SerializerMethodField()
    profile_id = serializers.SerializerMethodField()
    country_code = serializers.SerializerMethodField()
    currency_code = serializers.SerializerMethodField()
    metrics = serializers.SerializerMethodField()

    class Meta:

        model = AdsKeyword

        fields = [

            "id",
            "keyword_id",
            "keyword_text",
            "match_type","bid","state","campaign",
            "campaign_name","campaign_id_value",
            "ad_group","ad_group_name",
            "ad_group_id_value",
            "profile_id","country_code",
            "currency_code","metrics","raw_data",
            "created_at"
        ]

    def get_campaign_name(self, obj):
        if obj.campaign:
            return obj.campaign.name
        return None

    def get_campaign_id_value(self, obj):
        if obj.campaign:
            return obj.campaign.campaign_id
        return None

    def get_ad_group_name(self, obj):
        if obj.ad_group:
            return obj.ad_group.name
        return None

    def get_ad_group_id_value(self, obj):
        if obj.ad_group:
            return obj.ad_group.ad_group_id
        return None

    def get_profile_id(self, obj):
        return obj.amazon_account.profile_id

    def get_country_code(self, obj):
        return obj.amazon_account.country_code

    def get_currency_code(self, obj):
        return obj.amazon_account.currency_code

    def get_metrics(self, obj):
        from_date = self.context.get("from_date")
        to_date = self.context.get("to_date")

        metrics_qs = KeywordMetric.objects.filter(keyword=obj)
        if from_date:
            metrics_qs = metrics_qs.filter(report_date__gte=from_date)
        if to_date:
            metrics_qs = metrics_qs.filter(report_date__lte=to_date)

        if from_date or to_date:
            agg = metrics_qs.aggregate(
                total_impressions=Sum("impressions"),
                total_clicks=Sum("clicks"),
                total_cost=Sum("cost"),
                total_sales=Sum("sales"),
                total_orders=Sum("orders"),
            )
            impressions = agg["total_impressions"] or 0
            clicks = agg["total_clicks"] or 0
            cost = float(agg["total_cost"] or 0)
            sales = float(agg["total_sales"] or 0)
            orders = agg["total_orders"] or 0
            acos = float(round((cost / sales * 100), 2)) if sales > 0 else 0.0
            roas = float(round((sales / cost), 2)) if cost > 0 else 0.0

            return {
                "impressions": impressions,
                "clicks": clicks,
                "cost": round(cost, 2),
                "sales": round(sales, 2),
                "orders": orders,
                "units": orders,
                "acos": acos,
                "roas": roas,
            }

        latest_metric = metrics_qs.order_by("-report_date").first()
        if latest_metric:
            impressions = latest_metric.impressions or 0
            clicks = latest_metric.clicks or 0
            cost = float(latest_metric.cost or 0)
            sales = float(latest_metric.sales or 0)
            orders = latest_metric.orders or 0
            acos = float(latest_metric.acos or 0)
            roas = float(latest_metric.roas or 0)

            return {
                "impressions": impressions,
                "clicks": clicks,
                "cost": round(cost, 2),
                "sales": round(sales, 2),
                "orders": orders,
                "units": orders,
                "acos": acos,
                "roas": roas,
            }

        return None    



class ProductAdMetricSerializer(serializers.ModelSerializer):

    class Meta:

        model = ProductAdMetric
        fields = [

            "id",
            "report_date",
            "impressions",
            "clicks",
            "cost",
            "sales",
            "orders",
            "raw_data"
        ]


class AdsProductAdSerializer(serializers.ModelSerializer):

    campaign_name = serializers.SerializerMethodField()
    campaign_id_value = serializers.SerializerMethodField()
    ad_group_name = serializers.SerializerMethodField()
    ad_group_id_value = serializers.SerializerMethodField()
    profile_id = serializers.SerializerMethodField()
    country_code = serializers.SerializerMethodField()
    currency_code = serializers.SerializerMethodField()
    metrics = serializers.SerializerMethodField()

    class Meta:

        model = AdsProductAd

        fields = [

            "id","ad_id","asin",
            "sku","state","campaign", "campaign_name",
            "campaign_id_value","ad_group",
            "ad_group_name","ad_group_id_value",
            "profile_id","country_code",
            "currency_code","metrics","raw_data","created_at"
        ]

    def get_campaign_name(self, obj):

        if obj.campaign:
            return obj.campaign.name
        return None

    def get_campaign_id_value(self, obj):
        if obj.campaign:
            return obj.campaign.campaign_id
        return None

    def get_ad_group_name(self, obj):
        if obj.ad_group:
            return obj.ad_group.name
        return None

    def get_ad_group_id_value(self, obj):
        if obj.ad_group:
            return obj.ad_group.ad_group_id
        return None

    def get_profile_id(self, obj):
        return obj.amazon_account.profile_id

    def get_country_code(self, obj):
        return obj.amazon_account.country_code

    def get_currency_code(self, obj):
        return obj.amazon_account.currency_code

    def get_metrics(self, obj):
        latest_metric = ProductAdMetric.objects.filter(
            product_ad=obj
        ).order_by("-report_date").first()
        if latest_metric:

            return ProductAdMetricSerializer(
                latest_metric
            ).data
        return None
    


class AdsBudgetRuleSerializer(serializers.ModelSerializer):

    amazon_account_id = serializers.IntegerField(
        source="amazon_account.id",
        read_only=True
    )

    associated_campaigns = serializers.SerializerMethodField()

    class Meta:
        model = AdsBudgetRule

        fields = [
            "id",
            "amazon_account_id",
            "profile_id",
            "budget_rule_id",
            "rule_type",
            "name",
            "rule_state",
            "rule_status",
            "created_date",
            "last_updated_date",
            "rule_details",

            # NEW
            "associated_campaigns",

            "created_at",
            "updated_at",
        ]

    def get_associated_campaigns(self, obj):

        campaign_ids = obj.campaign_ids or []

        campaigns = AdsCampaign.objects.filter(
            campaign_id__in=campaign_ids
        )

        return [
            {
                "id": campaign.id,
                "campaign_id": campaign.campaign_id,
                "name": campaign.name,
                "state": campaign.state,
                "budget": campaign.daily_budget,
            }
            for campaign in campaigns
        ]
    


class ProductAdMetricSerializer(serializers.ModelSerializer):

    campaign_id = serializers.IntegerField(
        source="product_ad.campaign.id",
        read_only=True
    )

    campaign_name = serializers.CharField(
        source="product_ad.campaign.name",
        read_only=True
    )

    ad_group_id = serializers.IntegerField(
        source="product_ad.ad_group.id",
        read_only=True
    )

    ad_group_name = serializers.CharField(
        source="product_ad.ad_group.name",
        read_only=True
    )

    sku = serializers.CharField(
        source="product_ad.sku",
        read_only=True
    )

    asin = serializers.CharField(
        source="product_ad.asin",
        read_only=True
    )

    class Meta:

        model = ProductAdMetric

        fields = [
            "id",

            "campaign_id",
            "campaign_name",

            "ad_group_id",
            "ad_group_name",

            "sku",
            "asin",

            "report_date",

            "impressions",
            "clicks",
            "cost",
            "sales",
            "orders",

            "raw_data",
        ]   


class AdsNegativeTargetSerializer(
    serializers.ModelSerializer
):

    campaign_id = serializers.SerializerMethodField()

    campaign_name = serializers.SerializerMethodField()

    profile_id = serializers.SerializerMethodField()

    class Meta:

        model = AdsNegativeTarget

        fields = [

            "id",

            "profile_id",

            "campaign_id",

            "campaign_name",

            "negative_target_id",

            "expression_type",

            "expression",

            "resolved_expression",

            "state",

            "serving_status",

            "creation_date_time",

            "last_update_date_time",

            "created_at",

            "updated_at",

            "raw_data"
        ]

    def get_campaign_id(self, obj):

        if obj.campaign:
            return obj.campaign.campaign_id

        return None

    def get_campaign_name(self, obj):

        if obj.campaign:
            return obj.campaign.name

        return None

    def get_profile_id(self, obj):

        if obj.amazon_account:
            return obj.amazon_account.profile_id

        return None



class AdsNegativeKeywordSerializer(serializers.ModelSerializer):

    campaign_name = serializers.CharField(
        source="campaign.name",
        read_only=True
    )
    campaign_id = serializers.CharField(
        source="campaign.campaign_id",
        read_only=True
    )

    ad_group_name = serializers.CharField(
        source="ad_group.name",
        read_only=True
    )
    ad_group_id = serializers.CharField(
        source="ad_group.ad_group_id",
        read_only=True
    )

    class Meta:

        model = AdsNegativeKeyword

        fields = [

            "id",

            "negative_keyword_id",

            "keyword_text",

            "match_type",

            "state",

            "serving_status",

            "creation_date_time",

            "last_update_date_time",

            "campaign",
            "campaign_id",

            "campaign_name",

            "ad_group",
            "ad_group_id",

            "ad_group_name",

            "created_at",

            "updated_at",
        ]