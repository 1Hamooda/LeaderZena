from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ["email", "first_name", "last_name", "role", "password", "password2"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        if attrs.get("role") == "admin":
            raise serializers.ValidationError({"role": "Cannot self-register as admin."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        role = validated_data.get("role", "member")

        # FR-A1: members require admin approval — start inactive
        # FR-VOL1: volunteers get immediate access — start active
        validated_data["is_active"] = role == "volunteer"

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model  = User
        fields = [
            "id", "email", "first_name", "last_name", "full_name",
            "role", "phone", "city", "country", "bio",
            "education", "experience", "skills", "avatar",
            "is_active", "date_joined",
        ]
        read_only_fields = ["id", "email", "role", "is_active", "date_joined"]


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = [
            "first_name", "last_name", "phone", "city", "country",
            "bio", "education", "experience", "skills", "avatar",
        ]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()


class AdminUserSerializer(serializers.ModelSerializer):
    """
    Used by admin endpoints — exposes is_active and role as writable.
    """
    full_name = serializers.ReadOnlyField()

    class Meta:
        model  = User
        fields = [
            "id", "email", "first_name", "last_name", "full_name",
            "role", "phone", "city", "country", "bio",
            "education", "experience", "skills", "avatar",
            "is_active", "is_staff", "date_joined",
        ]
        read_only_fields = ["id", "email", "date_joined"]


class ChangeRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=["member", "volunteer", "admin"])