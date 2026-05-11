from rest_framework import serializers
from .models        import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = Announcement
        fields = [
            "id", "title", "content", "category", "status",
            "emoji", "is_pinned", "created_by_name", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_by_name", "created_at", "updated_at"]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.full_name
        return None


class AnnouncementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Announcement
        fields = ["title", "content", "category", "status", "emoji", "is_pinned"]
