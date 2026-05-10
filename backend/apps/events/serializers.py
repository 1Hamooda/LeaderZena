from rest_framework import serializers
from .models import Event, Application


# ── Event serializers ──────────────────────────────────────────────

class EventListSerializer(serializers.ModelSerializer):
    """Compact serializer for event list views (public + dashboard)."""
    spots_remaining = serializers.IntegerField(read_only=True)
    image_url       = serializers.SerializerMethodField()

    class Meta:
        model  = Event
        fields = [
            "id", "title", "category", "status", "emoji", "image_url",
            "location", "date", "time_start", "time_end",
            "max_participants", "spots_remaining",
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class EventDetailSerializer(serializers.ModelSerializer):
    """Full event details for the event detail page (FR-V2)."""
    spots_remaining = serializers.IntegerField(read_only=True)
    created_by_name = serializers.SerializerMethodField()
    image_url       = serializers.SerializerMethodField()

    class Meta:
        model  = Event
        fields = [
            "id", "title", "description", "category", "status", "emoji", "image_url",
            "location", "date", "time_start", "time_end",
            "max_participants", "spots_remaining",
            "roles_available", "highlights",
            "created_by_name", "created_at", "updated_at",
        ]

    def get_created_by_name(self, obj):
        return obj.created_by.full_name if obj.created_by else "MENA Club"

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    """For admin create/edit (FR-A3)."""
    class Meta:
        model  = Event
        fields = [
            "title", "description", "category", "status", "emoji", "image",
            "location", "date", "time_start", "time_end",
            "max_participants", "roles_available", "highlights",
        ]


# ── Application serializers ────────────────────────────────────────

class ApplicationSerializer(serializers.ModelSerializer):
    """User-facing serializer (own applications)."""
    event_title = serializers.SerializerMethodField()
    event_date  = serializers.SerializerMethodField()

    class Meta:
        model  = Application
        fields = [
            "id", "event", "event_title", "event_date",
            "preferred_role", "assigned_role", "motivation",
            "status", "created_at",
        ]
        read_only_fields = ["id", "assigned_role", "status", "created_at"]

    def get_event_title(self, obj):
        return obj.event.title

    def get_event_date(self, obj):
        return obj.event.date


class CreateApplicationSerializer(serializers.ModelSerializer):
    """For users submitting applications."""
    class Meta:
        model  = Application
        fields = ["event", "preferred_role", "motivation"]


class AdminApplicationSerializer(serializers.ModelSerializer):
    """Full application details for admin review (FR-A4)."""
    event_title      = serializers.SerializerMethodField()
    user_name        = serializers.SerializerMethodField()
    user_email       = serializers.SerializerMethodField()
    user_role        = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = Application
        fields = [
            "id", "event", "event_title",
            "user", "user_name", "user_email", "user_role",
            "preferred_role", "assigned_role", "motivation",
            "status", "reviewed_by_name", "reviewed_at",
            "created_at",
        ]

    def get_event_title(self, obj):
        return obj.event.title

    def get_user_name(self, obj):
        return obj.user.full_name

    def get_user_email(self, obj):
        return obj.user.email

    def get_user_role(self, obj):
        return obj.user.role

    def get_reviewed_by_name(self, obj):
        return obj.reviewed_by.full_name if obj.reviewed_by else None