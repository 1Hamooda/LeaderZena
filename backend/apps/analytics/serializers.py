from rest_framework import serializers
from .models        import ReportSnapshot


class ReportSnapshotSerializer(serializers.ModelSerializer):

    class Meta:
        model        = ReportSnapshot
        fields       = ["id", "date", "total_members", "total_volunteers", "total_events", "total_checkins", "total_certificates", "created_at"]
        read_only_fields = fields
