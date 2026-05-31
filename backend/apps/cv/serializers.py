from rest_framework import serializers
from .models        import CV


class CVSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model  = CV
        fields = ["id", "file_url", "extracted_text", "uploaded_at", "updated_at"]
        read_only_fields = ["id", "extracted_text", "uploaded_at", "updated_at"]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


class CVUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        allowed = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]
        content_type = getattr(value, "content_type", "") or ""
        if content_type and content_type not in allowed:
            raise serializers.ValidationError("Only PDF or Word documents are accepted.")
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size must not exceed 5 MB.")
        return value
