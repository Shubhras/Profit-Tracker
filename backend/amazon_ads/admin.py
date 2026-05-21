from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import *


@admin.register(AmazonAdsAccount)
class AmazonAdsAccountAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "profile_id",
        "country_code",
        "currency_code",
        "region",
        "created_at",
    )
    search_fields = (
        "profile_id",
        "country_code",
        "currency_code",
        "user__email",
        "user__username",
    )
    list_filter = ("region", "country_code", "currency_code", "created_at")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


@admin.register(AdsCampaign)
class AdsCampaignAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "campaign_id",
        "name",
        "amazon_account",
        "state",
        "campaign_type",
        "targeting_type",
        "daily_budget",
        "start_date",
        "created_at",
    )
    search_fields = (
        "campaign_id",
        "name",
        "amazon_account__profile_id",
    )
    list_filter = (
        "state",
        "campaign_type",
        "targeting_type",
        "created_at",
    )
    ordering = ("-created_at",)


@admin.register(CampaignMetric)
class CampaignMetricAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "campaign",
        "report_date",
        "impressions",
        "clicks",
        "cost",
        "sales",
        "orders",
        "units",
        "acos",
        "roas",
        "created_at",
    )
    search_fields = (
        "campaign__name",
        "campaign__campaign_id",
    )
    list_filter = ("report_date", "created_at")
    ordering = ("-report_date",)


@admin.register(AdsReportLog)
class AdsReportLogAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "report_id",
        "report_type",
        "status",
        "start_date",
        "end_date",
        "amazon_account",
        "created_at",
    )
    search_fields = ("report_id", "report_type")
    list_filter = ("status", "report_type", "start_date", "end_date")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(AdsAdGroup)
class AdsAdGroupAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "ad_group_id",
        "name",
        "campaign",
        "amazon_account",
        "state",
        "default_bid",
        "created_at",
    )
    search_fields = ("name", "ad_group_id")
    list_filter = ("state", "created_at")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(AdsKeyword)
class AdsKeywordAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "keyword_id",
        "keyword_text",
        "match_type",
        "campaign",
        "ad_group",
        "bid",
        "state",
        "created_at",
    )
    search_fields = ("keyword_text", "keyword_id")
    list_filter = ("match_type", "state", "created_at")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(AdsTarget)
class AdsTargetAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "target_id",
        "campaign",
        "ad_group",
        "expression_type",
        "bid",
        "state",
        "created_at",
    )
    search_fields = ("target_id", "expression_type")
    list_filter = ("state", "expression_type", "created_at")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)


@admin.register(AdsProductAd)
class AdsProductAdAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "ad_id",
        "asin",
        "sku",
        "campaign",
        "ad_group",
        "state",
        "created_at",
    )
    search_fields = ("asin", "sku", "ad_id","campaign")
    list_filter = ("state", "created_at","campaign")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)    



@admin.register(KeywordMetric)
class KeywordMetricAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "keyword",
        "report_date",
        "impressions",
        "clicks",
        "cost",
        "sales",
        "orders",
        "acos",
        "roas",
    )
    search_fields = (
        "keyword__keyword_text",
        "keyword__keyword_id",
    )
    list_filter = ("report_date",)
    ordering = ("-report_date",)


@admin.register(SearchTermMetric)
class SearchTermMetricAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "campaign",
        "search_term",
        "report_date",
        "impressions",
        "clicks",
        "cost",
        "sales",
        "orders",
        "acos",
        "roas",
    )
    search_fields = (
        "search_term",
        "campaign__name",
        "campaign__campaign_id",
    )
    list_filter = ("report_date",)
    ordering = ("-report_date",)


@admin.register(ProductAdMetric)
class ProductAdMetricAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product_ad",
        "report_date",
        "impressions",
        "clicks",
        "cost",
        "sales",
        "orders",
    )
    search_fields = (
        "product_ad__ad_id",
        "product_ad__sku",
        "product_ad__asin",
    )
    list_filter = ("report_date",)
    ordering = ("-report_date",)


@admin.register(TargetMetric)
class TargetMetricAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "target",
        "report_date",
        "impressions",
        "clicks",
        "cost",
        "sales",
        "orders",
    )
    search_fields = (
        "target__target_id",
        "target__expression",
    )
    list_filter = ("report_date",)
    ordering = ("-report_date",)    


# admin.py

from django.contrib import admin
from .models import AdsBudgetRule


@admin.register(AdsBudgetRule)
class AdsBudgetRuleAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "budget_rule_id",
        "name",
        "rule_type",
        "rule_state",
        "profile_id",
        "amazon_account",
        "created_at",
    )

    list_filter = (
        "rule_type",
        "rule_state",
        "created_at",
    )

    search_fields = (
        "budget_rule_id",
        "name",
        "profile_id",
        "amazon_account__profile_id",
        "amazon_account__user__email",
        "amazon_account__user__username",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "created_date",
        "last_updated_date",
    )

    ordering = ("-created_at",)

    list_per_page = 20

    fieldsets = (
        ("Basic Information", {
            "fields": (
                "amazon_account",
                "profile_id",
                "budget_rule_id",
                "name",
                "rule_type",
                "rule_state",
            )
        }),

        ("Dates", {
            "fields": (
                "created_date",
                "last_updated_date",
                "created_at",
                "updated_at",
            )
        }),

        ("JSON Data", {
            "fields": (
                "rule_details",
                "raw_data",
            )
        }),
    )    