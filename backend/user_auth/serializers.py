from django.contrib.auth.models import User
from rest_framework import serializers
from user_auth.models import *
from subscription.models import UserSubscription


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

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    discount_percentage = serializers.SerializerMethodField()
    average_discount = serializers.SerializerMethodField()
    per_month = serializers.SerializerMethodField()

    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "subcription_id",
            "plan_name",
            "slug",
            "description",
            "monthly_price",
            "annual_price",
            "features",
            "terms_and_conditions",
            "status",
            "is_active",
            "is_deleted",
            "created_at",
            "updated_at",
            "discount_percentage",
            "average_discount",
            "per_month",
        ]

    def get_discount_percentage(self, obj):
        monthly_price = obj.monthly_price or 0
        annual_price = obj.annual_price or 0

        if monthly_price <= 0:
            return 0.0

        yearly_cost = monthly_price * 12

        discount = (
            (yearly_cost - annual_price)
            / yearly_cost
        ) * 100

        discount = round(float(discount), 2)

        # Prevent negative discounts
        return max(discount, 0.0)

    def get_average_discount(self, obj):
        return self.get_discount_percentage(obj)

    def get_per_month(self, obj):
        annual_price = obj.annual_price or 0

        if annual_price <= 0:
            return 0.0

        return round(float(annual_price / 12), 2)      


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
        

# class UserProfileSerializer(serializers.ModelSerializer):
#     # ✅ Include profile fields inside user response
#     name = serializers.CharField(source="profile.name", read_only=True)
#     business_name = serializers.CharField(source="profile.business_name", read_only=True)
#     mobile_number = serializers.CharField(source="profile.mobile_number", read_only=True)
#     #gst_number = serializers.CharField(source="profile.gst_number", read_only=True)

#     address = serializers.CharField(source="profile.address", read_only=True)
#     city = serializers.CharField(source="profile.city", read_only=True)
#     state = serializers.CharField(source="profile.state", read_only=True)
#     pin_code = serializers.CharField(source="profile.pin_code", read_only=True)

#     accepted_terms = serializers.BooleanField(source="profile.accepted_terms", read_only=True)

#     class Meta:
#         model = User
#         fields = [
#             "id",
#             "username",
#             "email",

#             "name",
#             "business_name",
#             "mobile_number",
#             #"gst_number",
#             "address",
#             "city",
#             "state",
#             "pin_code",
#             "accepted_terms",
#         ]
        

# class UserProfileSerializer(serializers.ModelSerializer):
#     # Profile fields
#     name = serializers.CharField(source="profile.name", read_only=True)
#     business_name = serializers.CharField(source="profile.business_name", read_only=True)
#     mobile_number = serializers.CharField(source="profile.mobile_number", read_only=True)

#     address = serializers.CharField(source="profile.address", read_only=True)
#     city = serializers.CharField(source="profile.city", read_only=True)
#     state = serializers.CharField(source="profile.state", read_only=True)
#     pin_code = serializers.CharField(source="profile.pin_code", read_only=True)

#     accepted_terms = serializers.BooleanField(
#         source="profile.accepted_terms",
#         read_only=True
#     )

#     subscription = serializers.SerializerMethodField()

#     class Meta:
#         model = User
#         fields = [
#             "id",
#             "username",
#             "email",

#             "name",
#             "business_name",
#             "mobile_number",

#             "address",
#             "city",
#             "state",
#             "pin_code",
#             "accepted_terms",

#             "subscription"
#         ]

#     def get_subscription(self, obj):

#         subscription = (
#             UserSubscription.objects
#             .filter(
#                 user=obj,
#                 status="active",
#                 is_paid=True
#             )
#             .select_related("plan")
#             .order_by("-created_at")
#             .first()
#         )

#         if not subscription:
#             return None

#         return {
#             "subscription_id": subscription.id,
#             "plan_id": subscription.plan.id if subscription.plan else None,
#             "plan_name": subscription.plan.plan_name if subscription.plan else None,
#             "billing_cycle": subscription.billing_cycle,
#             "amount": subscription.amount,
#             "status": subscription.status,
#             "is_paid": subscription.is_paid,
#             "start_date": subscription.start_date,
#             "end_date": subscription.end_date,
#         }


class UserProfileSerializer(serializers.ModelSerializer):
    # Profile fields
    name = serializers.CharField(source="profile.name", read_only=True)
    business_name = serializers.CharField(source="profile.business_name", read_only=True)
    mobile_number = serializers.CharField(source="profile.mobile_number", read_only=True)

    address = serializers.CharField(source="profile.address", read_only=True)
    city = serializers.CharField(source="profile.city", read_only=True)
    state = serializers.CharField(source="profile.state", read_only=True)
    pin_code = serializers.CharField(source="profile.pin_code", read_only=True)

    accepted_terms = serializers.BooleanField(
        source="profile.accepted_terms",
        read_only=True
    )

    subscription = serializers.SerializerMethodField()
    unread_notification_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",

            "name",
            "business_name",
            "mobile_number",

            "address",
            "city",
            "state",
            "pin_code",
            "accepted_terms",

            "subscription",
            "unread_notification_count",
        ]

    def get_unread_notification_count(self, obj):
        return UserNotification.objects.filter(
            user=obj,
            is_read=False
        ).count()

    def get_subscription(self, obj):

        subscription = (
            UserSubscription.objects
            .filter(
                user=obj,
                status="active",
                is_paid=True
            )
            .select_related("plan")
            .order_by("-created_at")
            .first()
        )

        if not subscription:
            return None

        return {
            "subscription_id": subscription.id,
            "plan_id": subscription.plan.id if subscription.plan else None,
            "plan_name": subscription.plan.plan_name if subscription.plan else None,
            "billing_cycle": subscription.billing_cycle,
            "amount": subscription.amount,
            "status": subscription.status,
            "is_paid": subscription.is_paid,
            "start_date": subscription.start_date,
            "end_date": subscription.end_date,
        }
          

# class ModuleSimpleSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Module
#         fields = [
#             "id",
#             "name",
#             "slug"
#         ]


# class SubModuleSimpleSerializer(serializers.ModelSerializer):

#     module = serializers.SerializerMethodField()

#     class Meta:
#         model = SubModule
#         fields = [
#             "id",
#             "name",
#             "slug",
#             "module"
#         ]

#     def get_module(self, obj):
#         return {
#             "id": obj.module.id,
#             "name": obj.module.name,
#             "slug": obj.module.slug,
#         }                        
class ModuleSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Module
        fields = [
            "id",
            "name",
            "slug"
        ]


class SubModuleSimpleSerializer(serializers.ModelSerializer):

    module = serializers.SerializerMethodField()

    class Meta:
        model = SubModule
        fields = [
            "id",
            "name",
            "slug",
            "module"
        ]

    def get_module(self, obj):
        return {
            "id": obj.module.id,
            "name": obj.module.name,
            "slug": obj.module.slug,
        }


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    discount_percentage = serializers.SerializerMethodField()
    average_discount = serializers.SerializerMethodField()
    per_month = serializers.SerializerMethodField()

    # For Create/Update (accept IDs)
    modules = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Module.objects.filter(is_active=True),
        required=False,
        write_only=True
    )

    submodules = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=SubModule.objects.filter(is_active=True),
        required=False,
        write_only=True
    )

    # For List/Details (return objects)
    module_details = ModuleSimpleSerializer(
        source="modules",
        many=True,
        read_only=True
    )

    submodule_details = SubModuleSimpleSerializer(
        source="submodules",
        many=True,
        read_only=True
    )

    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "subcription_id",
            "plan_name",
            "slug",
            "description",
            "monthly_price",
            "annual_price",
            "features",
            "terms_and_conditions",

            "modules",
            "submodules",

            "module_details",
            "submodule_details",

            "status",
            "is_active",
            "is_deleted",
            "created_at",
            "updated_at",
            "discount_percentage",
            "average_discount",
            "per_month",
        ]

    def get_discount_percentage(self, obj):
        monthly_price = float(obj.monthly_price or 0)
        annual_price = float(obj.annual_price or 0)

        if monthly_price <= 0:
            return 0.0

        yearly_cost = monthly_price * 12
        discount = ((yearly_cost - annual_price) / yearly_cost) * 100

        return round(max(discount, 0), 2)

    def get_average_discount(self, obj):
        return self.get_discount_percentage(obj)

    def get_per_month(self, obj):
        annual_price = float(obj.annual_price or 0)

        if annual_price <= 0:
            return 0.0
        
        
    def create(self, validated_data):
        modules = validated_data.pop("modules", [])
        submodules = validated_data.pop("submodules", [])

        plan = SubscriptionPlan.objects.create(**validated_data)

        if modules:
            plan.modules.set(modules)

        if submodules:
            plan.submodules.set(submodules)

        return plan

    def update(self, instance, validated_data):
        modules = validated_data.pop("modules", None)
        submodules = validated_data.pop("submodules", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if modules is not None:
            instance.modules.set(modules)

        if submodules is not None:
            instance.submodules.set(submodules)

        return instance    

        return round(annual_price / 12, 2)

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
    


class ModuleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Module
        fields = "__all__"
        

class ModuleDetailSerializer(serializers.ModelSerializer):
    submodules = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "is_active",
            "submodules",
        )

    def get_submodules(self, obj):
        queryset = obj.submodules.filter(is_active=True)
        return SubModuleSerializer(queryset, many=True).data

class SubModuleSerializer(serializers.ModelSerializer):

    module_name = serializers.CharField(
        source="module.name",
        read_only=True
    )

    class Meta:
        model = SubModule
        fields = "__all__"
        

class UserModulePermissionSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = UserModulePermission

        fields = "__all__"        
        
        



class SubModuleSerializer(serializers.ModelSerializer):
    module_name = serializers.CharField(source="module.name", read_only=True)

    class Meta:
        model = SubModule
        fields = [
            "id",
            "module",
            "module_name",
            "name",
            "slug",
            "description",
            "is_active",
        ]

class ModuleWithSubModulesSerializer(serializers.ModelSerializer):

    submodules = SubModuleSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Module
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "is_active",
            "submodules",
        )        
        
        
class NotificationSerializer(serializers.ModelSerializer):

    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "notification_type",
            "is_active",
            "created_at",
            "is_read"
        ]

    def get_is_read(self, obj):
        user = self.context["request"].user

        return UserNotification.objects.filter(
            user=user,
            notification=obj,
            is_read=True
        ).exists()


class SupportTicketSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.profile.name", read_only=True)
    document = serializers.FileField(required=False)

    class Meta:
        model = SupportTicket
        fields = [
            "id",
            "ticket_id",
            "user_email",
            "user_name",
            "title",
            "description",
            "document",
            "status",
            "priority",
            "admin_note",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["ticket_id", "created_at", "updated_at"]


class SubUserPermissionInputSerializer(serializers.Serializer):
    module = serializers.IntegerField(required=False, allow_null=True)
    submodule = serializers.IntegerField(required=False, allow_null=True)
    can_view = serializers.BooleanField(default=True)
    can_create = serializers.BooleanField(default=False)
    can_update = serializers.BooleanField(default=False)
    can_delete = serializers.BooleanField(default=False)


class SubUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = SubUser
        fields = [
            "id",
            "username",
            "email",
            "name",
            "mobile_number",
            "permissions",
            "created_at",
            "updated_at",
        ]

    def get_permissions(self, obj):
        permissions = UserModulePermission.objects.filter(user=obj.user)
        return UserModulePermissionSerializer(permissions, many=True).data