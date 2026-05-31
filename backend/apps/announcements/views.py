from rest_framework              import status
from rest_framework.decorators   import api_view, permission_classes
from rest_framework.permissions  import AllowAny
from rest_framework.response     import Response

from apps.users.permissions      import IsAdmin
from .models                     import Announcement
from .serializers                import AnnouncementSerializer, AnnouncementCreateSerializer


# ── Public endpoints ───────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def list_announcements(request):
    """GET /api/announcements/ — returns all published announcements."""
    queryset = Announcement.objects.filter(status="published").order_by("-is_pinned", "-created_at")

    category = request.query_params.get("category")
    if category and category != "All":
        queryset = queryset.filter(category__iexact=category)

    return Response({
        "count":   queryset.count(),
        "results": AnnouncementSerializer(queryset, many=True).data,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def get_announcement(request, pk):
    """GET /api/announcements/<id>/ — returns a single published announcement."""
    try:
        announcement = Announcement.objects.get(pk=pk, status="published")
    except Announcement.DoesNotExist:
        return Response({"error": "Announcement not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(AnnouncementSerializer(announcement).data)


# ── Admin endpoints ────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_list_announcements(request):
    """GET /api/announcements/admin/ — returns all announcements including drafts."""
    queryset = Announcement.objects.all().order_by("-is_pinned", "-created_at")
    return Response({
        "count":   queryset.count(),
        "results": AnnouncementSerializer(queryset, many=True).data,
    })


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_create_announcement(request):
    """POST /api/announcements/admin/ — creates a new announcement."""
    serializer = AnnouncementCreateSerializer(data=request.data)
    if serializer.is_valid():
        announcement = serializer.save(created_by=request.user)
        return Response(AnnouncementSerializer(announcement).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAdmin])
def admin_update_announcement(request, pk):
    """PATCH /api/announcements/admin/<id>/ — updates an announcement."""
    try:
        announcement = Announcement.objects.get(pk=pk)
    except Announcement.DoesNotExist:
        return Response({"error": "Announcement not found."}, status=status.HTTP_404_NOT_FOUND)
    serializer = AnnouncementCreateSerializer(announcement, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(AnnouncementSerializer(announcement).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAdmin])
def admin_delete_announcement(request, pk):
    """DELETE /api/announcements/admin/<id>/ — deletes an announcement."""
    try:
        announcement = Announcement.objects.get(pk=pk)
    except Announcement.DoesNotExist:
        return Response({"error": "Announcement not found."}, status=status.HTTP_404_NOT_FOUND)
    announcement.delete()
    return Response({"message": "Announcement deleted."}, status=status.HTTP_204_NO_CONTENT)
