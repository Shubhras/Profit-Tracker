from django.contrib.auth.models import User
from rest_framework import serializers
from user_auth.models import *


class UserRegisterSerializer(serializers.Serializer):
    name = serializers.CharField()
    business_name = serializers.CharField()
    email = serializers.EmailField()
    mobile_number = serializers.CharField()

    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    #gst_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField()
    city = serializers.CharField()
    state = serializers.CharField()
    pin_code = serializers.CharField()

    accepted_terms = serializers.BooleanField()

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match")

        if not data["accepted_terms"]:
            raise serializers.ValidationError("You must accept Terms & Conditions")

        if User.objects.filter(email=data["email"]).exists():
            raise serializers.ValidationError("Email already registered")

        return data

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["email"],  
            email=validated_data["email"],
            password=password
        )

        UserProfile.objects.create(
            user=user,
            name=validated_data["name"],
            business_name=validated_data["business_name"],
            mobile_number=validated_data["mobile_number"],
            #gst_number=validated_data.get("gst_number"),
            address=validated_data["address"],
            city=validated_data["city"],
            state=validated_data["state"],
            pin_code=validated_data["pin_code"],
            accepted_terms=validated_data["accepted_terms"]
        )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    # ✅ Include profile fields inside user response
    name = serializers.CharField(source="profile.name", read_only=True)
    business_name = serializers.CharField(source="profile.business_name", read_only=True)
    mobile_number = serializers.CharField(source="profile.mobile_number", read_only=True)
    #gst_number = serializers.CharField(source="profile.gst_number", read_only=True)

    address = serializers.CharField(source="profile.address", read_only=True)
    city = serializers.CharField(source="profile.city", read_only=True)
    state = serializers.CharField(source="profile.state", read_only=True)
    pin_code = serializers.CharField(source="profile.pin_code", read_only=True)

    accepted_terms = serializers.BooleanField(source="profile.accepted_terms", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",

            "name",
            "business_name",
            "mobile_number",
            #"gst_number",
            "address",
            "city",
            "state",
            "pin_code",
            "accepted_terms",
        ]
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "name",
            "business_name",
            "mobile_number",
            #"gst_number",
            "address",
            "city",
            "state",
            "pin_code",
            "accepted_terms"
        ]
        
        
        

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    discount_percentage = serializers.SerializerMethodField()
    average_discount = serializers.SerializerMethodField()
    per_month = serializers.SerializerMethodField()

    class Meta:
        model = SubscriptionPlan
        fields = [
            "id", "subscription_type", "price", "status",
            "monthlyPlan", "annualPlan", "features",
            "is_active", "is_deleted", "created_at", "updated_at",
            "discount_percentage", "average_discount", "per_month"
        ]

    def get_discount_percentage(self, obj):
        """
        Calculates the discount for the annual plan compared to 12×monthly plan.
        Cleans up -0.0 values.
        """
        monthly_plan = SubscriptionPlan.objects.filter(subscription_type="Monthly", is_active=True, is_deleted=False).first()
        annual_plan = SubscriptionPlan.objects.filter(subscription_type="Annual", is_active=True, is_deleted=False).first()

        if monthly_plan and annual_plan:
            monthly_price = float(monthly_plan.price)
            annual_price = float(annual_plan.price)
            if monthly_price > 0:
                discount = ((12 * monthly_price - annual_price) / (12 * monthly_price)) * 100
                discount = round(discount, 2)
                # 🔹 Convert -0.0 to 0.0
                return 0.0 if discount == -0.0 else discount
        return 0.0

    def get_average_discount(self, obj):
        """
        Returns average discount across all plans, cleaned up for -0.0.
        """
        monthly_plan = SubscriptionPlan.objects.filter(subscription_type="Monthly", is_active=True, is_deleted=False).first()
        annual_plan = SubscriptionPlan.objects.filter(subscription_type="Annual", is_active=True, is_deleted=False).first()

        if monthly_plan and annual_plan:
            monthly_price = float(monthly_plan.price)
            annual_price = float(annual_plan.price)
            avg_discount = ((12 * monthly_price - annual_price) / (12 * monthly_price)) * 100
            avg_discount = round(avg_discount, 2)
            # 🔹 Convert -0.0 to 0.0
            return 0.0 if avg_discount == -0.0 else avg_discount
        return 0.0

    def get_per_month(self, obj):
        """
        Calculates per-month cost for annual or monthly plans.
        """
        if obj.subscription_type.lower() == "annual" and obj.price:
            return round(float(obj.price) / 12, 2)
        return round(float(obj.price), 2) if obj.price else 0.0
 
 
class PromocodeSerializer(serializers.ModelSerializer):
    startDateTime = serializers.DateTimeField(
        input_formats=[
            '%Y-%m-%dT%H:%M:%S%z',      # 2025-11-07T10:00:00+0530 (no colon)
            '%Y-%m-%dT%H:%M:%S%Z',      # 2025-11-07T10:00:00+05:30 (with colon)
            '%Y-%m-%dT%H:%M:%S',        # 2025-11-07T10:00:00
            '%Y-%m-%d %H:%M:%S',        # 2025-11-07 10:00:00
            '%Y-%m-%d'                  # 2025-11-07
        ],
        required=False,
        allow_null=True
    )

    endDateTime = serializers.DateTimeField(
        input_formats=[
            '%Y-%m-%dT%H:%M:%S%z',
            '%Y-%m-%dT%H:%M:%S%Z',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d'
        ],
        required=False,
        allow_null=True
    )

    class Meta:
        model = Promocode
        fields = '__all__'

    def validate(self, data):
        """
        Validate promo type and corresponding value fields.
        - If promoType == 'fix' → require specificAmount
        - If promoType == 'discount' → require percentage
        """
        promo_type = data.get('promoType', getattr(self.instance, 'promoType', None))
        specific_amount = data.get('specificAmount', getattr(self.instance, 'specificAmount', None))
        percentage = data.get('percentage', getattr(self.instance, 'percentage', None))

        if promo_type == 'fix':
            if not specific_amount:
                raise serializers.ValidationError({
                    "specificAmount": "Specific amount is required when promoType is 'fix'."
                })
            data['percentage'] = None  # Clear percentage if switching to fixed
        elif promo_type == 'discount':
            if not percentage:
                raise serializers.ValidationError({
                    "percentage": "Percentage value is required when promoType is 'discount'."
                })
            data['specificAmount'] = None  # Clear specificAmount if switching to discount

        return data


   
    

class LegalDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalDocument
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'is_deleted']
    

        