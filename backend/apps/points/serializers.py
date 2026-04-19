from rest_framework import serializers
from .models import PointTransaction


class PointTransactionSerializer(serializers.ModelSerializer):
    event_title = serializers.SerializerMethodField()

    class Meta:
        model  = PointTransaction
        fields = ["id", "points", "reason", "note", "event_title", "created_at"]

    def get_event_title(self, obj):
        return obj.event.title if obj.event else None


class AwardPointsSerializer(serializers.Serializer):
    """Used by admin to manually award or deduct points."""
    user_id = serializers.IntegerField()
    points  = serializers.IntegerField()  # negative = deduction
    reason  = serializers.ChoiceField(choices=PointTransaction.REASON_CHOICES)
    note    = serializers.CharField(max_length=255, required=False, allow_blank=True)