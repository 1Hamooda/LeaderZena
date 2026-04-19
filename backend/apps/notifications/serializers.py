from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ["id", "type", "title", "message", "is_read", "created_at"]
        read_only_fields = ["id", "type", "title", "message", "created_at"]


class CreateNotificationSerializer(serializers.ModelSerializer):
    """Used internally by services — not exposed to end users directly."""
    class Meta:
        model  = Notification
        fields = ["user", "type", "title", "message"]