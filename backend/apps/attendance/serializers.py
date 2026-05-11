from rest_framework import serializers
from .models import AttendanceCode, CheckIn


class AttendanceCodeSerializer(serializers.ModelSerializer):
    event_title      = serializers.SerializerMethodField()
    created_by_name  = serializers.SerializerMethodField()

    class Meta:
        model  = AttendanceCode
        fields = [
            "id", "event", "event_title", "code",
            "is_active", "expires_at",
            "created_by_name", "created_at",
        ]

    def get_event_title(self, obj):
        return obj.event.title

    def get_created_by_name(self, obj):
        return obj.created_by.full_name if obj.created_by else None


class CheckInSerializer(serializers.ModelSerializer):
    user_name   = serializers.SerializerMethodField()
    user_email  = serializers.SerializerMethodField()
    event_title = serializers.SerializerMethodField()

    class Meta:
        model  = CheckIn
        fields = ["id", "event", "event_title", "user", "user_name", "user_email", "checked_in_at"]

    def get_user_name(self, obj):
        return obj.user.full_name

    def get_user_email(self, obj):
        return obj.user.email

    def get_event_title(self, obj):
        return obj.event.title