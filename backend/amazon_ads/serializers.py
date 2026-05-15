from rest_framework import serializers
from .models import *
class CampaignMetricSerializer(serializers.ModelSerializer):

    class Meta:
        model = CampaignMetric
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
            "off_amazon_settings","tags","start_date","profile_id",
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
            "currency_code","raw_data",
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