from django.db import models

# Create your models here.
from django.db import models
from user_auth.models import User
from amazon_auth.models import AmazonAccount


class AmazonAdsAccount(models.Model):

    REGION_CHOICES = (
        ("NA", "North America"),
        ("EU", "Europe"),
        ("FE", "Far East"),
    )

    user = models.ForeignKey(User,on_delete=models.CASCADE)
    amazon_account = models.ForeignKey(AmazonAccount,on_delete=models.CASCADE,null=True,blank=True)
    profile_id = models.BigIntegerField(unique=True)

    country_code = models.CharField(max_length=10,null=True,blank=True)

    currency_code = models.CharField(max_length=10,null=True,blank=True)

    region = models.CharField(max_length=10,choices=REGION_CHOICES,default="EU")

    access_token = models.TextField(null=True,blank=True)
    refresh_token = models.TextField()
    client_id = models.TextField()
    client_secret = models.TextField()
    account_info = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    is_primary = models.BooleanField(default=False)
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.profile_id)

class AdsCampaign(models.Model):
    amazon_account = models.ForeignKey(AmazonAdsAccount,on_delete=models.CASCADE)

    campaign_id = models.BigIntegerField(unique=True)
    name = models.CharField(max_length=255)
    state = models.CharField(max_length=50, null=True, blank=True)
    campaign_type = models.CharField(max_length=50, null=True, blank=True)
    targeting_type = models.CharField(max_length=50, null=True, blank=True)
    daily_budget = models.FloatField(default=0)
    start_date = models.DateField(null=True, blank=True)
    raw_data = models.JSONField(default=dict)

    budget_type = models.CharField( max_length=50,null=True,blank=True)
    bidding_strategy = models.CharField( max_length=100,null=True,blank=True)
    placement_bidding = models.JSONField( default=list, blank=True)

    marketplace_budget_allocation = models.CharField(max_length=100,null=True,blank=True)

    off_amazon_settings = models.JSONField(default=dict,blank=True)

    tags = models.JSONField(default=dict,blank=True)


    created_at = models.DateTimeField(auto_now_add=True)


class CampaignMetric(models.Model):
    campaign = models.ForeignKey( AdsCampaign, on_delete=models.CASCADE)

    report_date = models.DateField()
    impressions = models.IntegerField(default=0)
    clicks = models.IntegerField(default=0)
    cost = models.FloatField(default=0)
    sales = models.FloatField(default=0)
    orders = models.IntegerField(default=0)
    units = models.IntegerField(default=0)
    acos = models.FloatField(default=0)
    roas = models.FloatField(default=0)
    raw_data = models.JSONField(default=dict)
    ctr = models.FloatField(default=0)
    cpc = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("campaign", "report_date")     



class AdsReportLog(models.Model):

    REPORT_STATUS = (
        ("PENDING", "PENDING"),
        ("PROCESSING", "PROCESSING"),
        ("COMPLETED", "COMPLETED"),
        ("FAILED", "FAILED"),
    )

    amazon_account = models.ForeignKey(AmazonAdsAccount,on_delete=models.CASCADE)

    report_id = models.CharField(max_length=255,unique=True)

    report_type = models.CharField( max_length=100)

    start_date = models.DateField()

    end_date = models.DateField()

    status = models.CharField(max_length=50,choices=REPORT_STATUS,default="PENDING")

    download_url = models.TextField(null=True,blank=True)

    raw_response = models.JSONField(default=dict)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

class AdsAdGroup(models.Model):

    amazon_account = models.ForeignKey(AmazonAdsAccount,on_delete=models.CASCADE)

    campaign = models.ForeignKey(AdsCampaign,on_delete=models.CASCADE)

    ad_group_id = models.BigIntegerField(unique=True)

    name = models.CharField(max_length=255)

    state = models.CharField(max_length=50,null=True,blank=True)

    default_bid = models.FloatField(default=0)

    raw_data = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)


class AdsKeyword(models.Model):

    MATCH_TYPES = (
        ("BROAD", "BROAD"),
        ("PHRASE", "PHRASE"),
        ("EXACT", "EXACT"),
    )
    amazon_account = models.ForeignKey(AmazonAdsAccount,on_delete=models.CASCADE)
    campaign = models.ForeignKey(AdsCampaign,on_delete=models.CASCADE)
    ad_group = models.ForeignKey(AdsAdGroup,on_delete=models.CASCADE)
    # keyword_id = models.BigIntegerField(unique=True)
    keyword_id = models.CharField(max_length=100,unique=True)
    keyword_text = models.TextField()
    match_type = models.CharField(max_length=20,choices=MATCH_TYPES)
    bid = models.FloatField(default=0)
    state = models.CharField(max_length=50,null=True,blank=True)
    raw_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)


class AdsTarget(models.Model):

    amazon_account = models.ForeignKey(AmazonAdsAccount,on_delete=models.CASCADE)

    campaign = models.ForeignKey(AdsCampaign,on_delete=models.CASCADE)

    ad_group = models.ForeignKey(AdsAdGroup,on_delete=models.CASCADE)

    # target_id = models.BigIntegerField(unique=True)
    target_id = models.CharField(max_length=100,unique=True)

    expression_type = models.CharField(max_length=100,null=True,blank=True)

    expression = models.JSONField(default=list)

    bid = models.FloatField(default=0)

    state = models.CharField(max_length=50,null=True,blank=True)

    raw_data = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)


class AdsProductAd(models.Model):

    amazon_account = models.ForeignKey(AmazonAdsAccount,on_delete=models.CASCADE)

    campaign = models.ForeignKey(AdsCampaign,on_delete=models.CASCADE)

    ad_group = models.ForeignKey(AdsAdGroup,on_delete=models.CASCADE)

    ad_id = models.BigIntegerField(unique=True)

    asin = models.CharField(max_length=20)

    sku = models.CharField(max_length=255,null=True,blank=True)

    state = models.CharField(max_length=50,null=True,blank=True)

    raw_data = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)


class KeywordMetric(models.Model):

    keyword = models.ForeignKey(
        AdsKeyword,
        on_delete=models.CASCADE
    )

    report_date = models.DateField()

    impressions = models.IntegerField(default=0)

    clicks = models.IntegerField(default=0)

    cost = models.FloatField(default=0)

    sales = models.FloatField(default=0)

    orders = models.IntegerField(default=0)

    acos = models.FloatField(default=0)

    roas = models.FloatField(default=0)

    raw_data = models.JSONField(default=dict)

    class Meta:
        unique_together = (
            "keyword",
            "report_date"
        )


class SearchTermMetric(models.Model):

    campaign = models.ForeignKey(
        AdsCampaign,
        on_delete=models.CASCADE
    )

    search_term = models.TextField()

    report_date = models.DateField()

    impressions = models.IntegerField(default=0)

    clicks = models.IntegerField(default=0)

    cost = models.FloatField(default=0)

    sales = models.FloatField(default=0)

    orders = models.IntegerField(default=0)

    acos = models.FloatField(default=0)

    roas = models.FloatField(default=0)

    raw_data = models.JSONField(default=dict)


class ProductAdMetric(models.Model):

    product_ad = models.ForeignKey(
        AdsProductAd,
        on_delete=models.CASCADE
    )

    report_date = models.DateField()

    impressions = models.IntegerField(default=0)

    clicks = models.IntegerField(default=0)

    cost = models.FloatField(default=0)

    sales = models.FloatField(default=0)

    orders = models.IntegerField(default=0)

    raw_data = models.JSONField(default=dict)     

class TargetMetric(models.Model):

    target = models.ForeignKey(
        AdsTarget,
        on_delete=models.CASCADE
    )

    report_date = models.DateField()

    impressions = models.IntegerField(default=0)

    clicks = models.IntegerField(default=0)

    cost = models.FloatField(default=0)

    sales = models.FloatField(default=0)

    orders = models.IntegerField(default=0)

    raw_data = models.JSONField(default=dict)       




class AdsBudgetRule(models.Model):

    RULE_TYPE_CHOICES = (
        ("sp", "Sponsored Products"),
        ("sd", "Sponsored Display"),
        ("sb", "Sponsored Brands"),
    )

    amazon_account = models.ForeignKey(
        AmazonAdsAccount,
        on_delete=models.CASCADE
    )

    profile_id = models.CharField(max_length=100,null=True, blank=True)

    budget_rule_id = models.CharField(max_length=255,null=True, blank=True)

    rule_type = models.CharField(
        max_length=10,
        choices=RULE_TYPE_CHOICES,default ="sp"
    )

    name = models.CharField(max_length=500, null=True, blank=True)

    rule_state = models.CharField(max_length=50, null=True, blank=True)

    rule_status = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )


    created_date = models.BigIntegerField(null=True, blank=True)

    last_updated_date = models.BigIntegerField(null=True, blank=True)

    rule_details = models.JSONField(default=dict)

    raw_data = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    campaign_ids = models.JSONField(default=list, blank=True)

    is_deleted = models.BooleanField(default=False)

    error_details = models.JSONField(default=dict, blank=True)

    class Meta:
        unique_together = ("amazon_account", "budget_rule_id", "rule_type")

    def __str__(self):
        return f"{self.rule_type} - {self.budget_rule_id}"
    


#Negative targeting by campin
class AdsCampaignNegativeTarget(models.Model):

    amazon_account = models.ForeignKey(
        AmazonAdsAccount,
        on_delete=models.CASCADE
    )

    campaign = models.ForeignKey(
        AdsCampaign,
        on_delete=models.CASCADE,
        related_name="negative_targets"
    )

    negative_target_id = models.BigIntegerField(unique=True)

    expression_type = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    expression = models.JSONField(
        default=list,
        blank=True
    )

    resolved_expression = models.JSONField(
        default=list,
        blank=True
    )

    state = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    serving_status = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    bid = models.FloatField(
        default=0
    )

    raw_data = models.JSONField(
        default=dict,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        unique_together = (
            "amazon_account",
            "negative_target_id"
        )

    def __str__(self):
        return str(self.negative_target_id)


#Negative keyword by

class AdsNegativeKeyword(models.Model):

    MATCH_TYPES = (
        ("NEGATIVE_EXACT", "NEGATIVE_EXACT"),
        ("NEGATIVE_PHRASE", "NEGATIVE_PHRASE"),
        ("NEGATIVE_BROAD", "NEGATIVE_BROAD"),
    )

    amazon_account = models.ForeignKey(
        AmazonAdsAccount,
        on_delete=models.CASCADE
    )

    campaign = models.ForeignKey(
        AdsCampaign,
        on_delete=models.CASCADE,
        related_name="negative_keywords"
    )

    ad_group = models.ForeignKey(
        AdsAdGroup,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="negative_keywords"
    )

    negative_keyword_id = models.BigIntegerField(
        unique=True
    )

    keyword_text = models.TextField()

    match_type = models.CharField(
        max_length=50,
        choices=MATCH_TYPES,
        null=True,
        blank=True
    )

    state = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    serving_status = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    creation_date_time = models.DateTimeField(
        null=True,
        blank=True
    )

    last_update_date_time = models.DateTimeField(
        null=True,
        blank=True
    )
    

    native_language_keyword = models.BooleanField(
        default=False
    )

    raw_data = models.JSONField(
        default=dict,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        unique_together = (
            "amazon_account",
            "negative_keyword_id"
        )

    def __str__(self):it





        return self.keyword_text
    


class AdsOptimizationRule(models.Model):

    amazon_account = models.ForeignKey(AmazonAdsAccount,on_delete=models.CASCADE )

    profile_id = models.CharField(max_length=100,null=True,blank=True)

    optimization_rule_id = models.CharField(max_length=255,unique=True)

    rule_name = models.CharField(max_length=500,null=True,blank=True)

    rule_category = models.CharField(max_length=100,null=True,blank=True)

    rule_sub_category = models.CharField(max_length=100,null=True,blank=True)

    status = models.CharField(max_length=100,null=True,blank=True)

    recurrence = models.JSONField(default=dict, blank=True)

    conditions = models.JSONField(default=dict,blank=True)

    action = models.JSONField(default=dict,blank=True)

    raw_data = models.JSONField(default=dict,blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):

        return str(self.optimization_rule_id)
    

