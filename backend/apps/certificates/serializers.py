from rest_framework import serializers
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    event_title  = serializers.SerializerMethodField()
    event_date   = serializers.SerializerMethodField()
    user_name    = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model  = Certificate
        fields = [
            "id", "uuid", "event_title", "event_date",
            "user_name", "status", "issued_at", "download_url",
        ]

    def get_event_title(self, obj):
        return obj.event.title

    def get_event_date(self, obj):
        return obj.event.date

    def get_user_name(self, obj):
        return obj.user.full_name

    def get_download_url(self, obj):
        return f"/api/certificates/{obj.uuid}/download/"


class AdminCertificateSerializer(serializers.ModelSerializer):
    """Full detail for admin views."""
    event_title = serializers.SerializerMethodField()
    user_name   = serializers.SerializerMethodField()
    user_email  = serializers.SerializerMethodField()
    issued_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = Certificate
        fields = [
            "id", "uuid", "user_name", "user_email",
            "event_title", "status", "issued_by_name", "issued_at",
        ]

    def get_event_title(self, obj):
        return obj.event.title

    def get_user_name(self, obj):
        return obj.user.full_name

    def get_user_email(self, obj):
        return obj.user.email

    def get_issued_by_name(self, obj):
        return obj.issued_by.full_name if obj.issued_by else "System"