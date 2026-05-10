from rest_framework import status
from rest_framework.decorators  import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response    import Response

from apps.users.permissions import IsAdmin
from .models      import AttendanceCode, CheckIn
from .serializers import AttendanceCodeSerializer, CheckInSerializer
from .services    import create_attendance_code, checkin_with_code


# ──────────────────────────────────────────────────────────────────
# VOLUNTEER — check in with code
# ──────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkin(request):
    """
    POST /api/attendance/checkin/
    Body: { code }
    Volunteer submits a code → get marked as attended. FR-VOL5.
    """
    raw_code = request.data.get("code", "").strip()
    if not raw_code:
        return Response({"error": "Code is required."}, status=status.HTTP_400_BAD_REQUEST)

    checkin_obj, error = checkin_with_code(user=request.user, raw_code=raw_code)
    if error:
        return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        "message":    f"Successfully checked in to \"{checkin_obj.event.title}\"! 🎉",
        "event":      checkin_obj.event.title,
        "checked_in_at": checkin_obj.checked_in_at,
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_checkins(request):
    """
    GET /api/attendance/my-checkins/
    Returns all events the logged-in user has checked in to. FR-VOL4.
    """
    checkins = CheckIn.objects.filter(user=request.user).select_related("event")
    return Response(CheckInSerializer(checkins, many=True).data)


# ──────────────────────────────────────────────────────────────────
# ADMIN — manage codes and view attendance
# ──────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_generate_code(request):
    """
    POST /api/attendance/admin/generate-code/
    Body: { event_id, expires_at (optional) }
    Generates (or regenerates) an attendance code for an event. FR-A7.
    """
    event_id   = request.data.get("event_id")
    expires_at = request.data.get("expires_at")  # ISO string or null

    if not event_id:
        return Response({"error": "event_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    from apps.events.models import Event
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

    from django.utils.dateparse import parse_datetime
    parsed_expires = None
    if expires_at:
        parsed_expires = parse_datetime(expires_at)

    code_obj = create_attendance_code(
        event      = event,
        created_by = request.user,
        expires_at = parsed_expires,
    )

    return Response({
        "message": f"Attendance code generated for \"{event.title}\".",
        "code":    AttendanceCodeSerializer(code_obj).data,
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_list_codes(request):
    """
    GET /api/attendance/admin/codes/
    Lists all attendance codes.
    """
    qs = AttendanceCode.objects.select_related("event", "created_by").order_by("-created_at")
    return Response(AttendanceCodeSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_deactivate_code(request, code_id):
    """
    POST /api/attendance/admin/codes/<id>/deactivate/
    Deactivates an attendance code so it can no longer be used.
    """
    try:
        code_obj = AttendanceCode.objects.get(id=code_id)
    except AttendanceCode.DoesNotExist:
        return Response({"error": "Code not found."}, status=status.HTTP_404_NOT_FOUND)

    code_obj.is_active = False
    code_obj.save()
    return Response({"message": f"Code \"{code_obj.code}\" deactivated."})


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_list_checkins(request):
    """
    GET /api/attendance/admin/checkins/
    Lists all check-ins.
    Query params: ?event_id=<id>
    """
    qs = CheckIn.objects.select_related("event", "user").order_by("-checked_in_at")

    event_id = request.query_params.get("event_id")
    if event_id:
        qs = qs.filter(event_id=event_id)

    return Response({
        "count":   qs.count(),
        "results": CheckInSerializer(qs, many=True).data,
    })


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_manual_checkin(request):
    """
    POST /api/attendance/admin/manual-checkin/
    Body: { user_id, event_id }
    Admin manually marks a volunteer as checked in.
    """
    user_id  = request.data.get("user_id")
    event_id = request.data.get("event_id")

    if not user_id or not event_id:
        return Response({"error": "user_id and event_id are required."}, status=status.HTTP_400_BAD_REQUEST)

    from django.contrib.auth import get_user_model
    from apps.events.models  import Event
    User = get_user_model()

    try:
        user  = User.objects.get(id=user_id)
        event = Event.objects.get(id=event_id)
    except (User.DoesNotExist, Event.DoesNotExist):
        return Response({"error": "User or event not found."}, status=status.HTTP_404_NOT_FOUND)

    if CheckIn.objects.filter(event=event, user=user).exists():
        return Response({"error": f"{user.full_name} is already checked in."}, status=status.HTTP_400_BAD_REQUEST)

    checkin_obj = CheckIn.objects.create(event=event, user=user)
    return Response({
        "message": f"{user.full_name} manually checked in to \"{event.title}\".",
        "checkin": CheckInSerializer(checkin_obj).data,
    }, status=status.HTTP_201_CREATED)