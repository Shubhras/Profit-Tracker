from django.contrib.auth.models import User
from rest_framework import serializers
from user_auth.models import UserProfile


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