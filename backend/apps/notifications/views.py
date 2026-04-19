from rest_framework                import status
from rest_framework.decorators     import api_view, permission_classes
from rest_framework.permissions    import IsAuthenticated
from rest_framework.response       import Response

from apps.users.models             import User
from apps.users.permissions        import IsAdmin
from .models                       import Notification
from .serializers                  import NotificationSerializer
from .services                     import create_bulk_notifications, create_notification


# ── User endpoints ─────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    """
    GET /api/notifications/
    Returns all notifications for the logged-in user.
    Query params:
      ?unread=true   → only unread
    """
    qs = Notification.objects.filter(user=request.user)

    if request.query_params.get("unread") == "true":
        qs = qs.filter(is_read=False)

    serializer = NotificationSerializer(qs, many=True)
    return Response({
        "count":   qs.count(),
        "results": serializer.data,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """
    GET /api/notifications/unread-count/
    Returns the number of unread notifications — used for the badge in the sidebar.
    """
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({"unread_count": count})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_read(request, notification_id):
    """
    POST /api/notifications/<id>/read/
    Marks a single notification as read.
    """
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
    except Notification.DoesNotExist:
        return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

    notification.is_read = True
    notification.save()
    return Response({"message": "Marked as read."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """
    POST /api/notifications/read-all/
    Marks all notifications for the logged-in user as read.
    """
    updated = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({"message": f"{updated} notifications marked as read."})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """
    DELETE /api/notifications/<id>/
    Deletes a single notification (only the owner can delete).
    """
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
    except Notification.DoesNotExist:
        return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

    notification.delete()
    return Response({"message": "Notification deleted."}, status=status.HTTP_204_NO_CONTENT)


# ── Admin endpoints ────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_send_notification(request):
    """
    POST /api/notifications/admin/send/
    Sends a notification to a specific user or a group.
    Body:
      { title, message, type, target: "all" | "members" | "volunteers" | user_id }
    FR-A6.
    """
    title   = request.data.get("title",   "").strip()
    message = request.data.get("message", "").strip()
    type    = request.data.get("type",    "general")
    target  = request.data.get("target",  "all")

    if not title or not message:
        return Response(
            {"error": "title and message are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Target a single user by ID
    if isinstance(target, int) or (isinstance(target, str) and target.isdigit()):
        try:
            user = User.objects.get(id=int(target))
            create_notification(user, title, message, type)
            return Response({"message": f"Notification sent to {user.full_name}."})
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # Target a role group or everyone
    if target == "members":
        users = User.objects.filter(role="member", is_active=True)
    elif target == "volunteers":
        users = User.objects.filter(role="volunteer", is_active=True)
    else:
        users = User.objects.filter(is_active=True).exclude(role="admin")

    create_bulk_notifications(users, title, message, type)
    return Response({"message": f"Notification sent to {users.count()} users."})