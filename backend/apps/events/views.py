from django.utils                import timezone
from rest_framework             import status
from rest_framework.decorators  import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response    import Response

from apps.users.permissions     import IsAdmin
from .models                    import Event, Application
from .serializers               import (
    EventListSerializer, EventDetailSerializer, EventCreateUpdateSerializer,
    ApplicationSerializer, CreateApplicationSerializer, AdminApplicationSerializer,
)
from .services                  import approve_application, reject_application


# ──────────────────────────────────────────────────────────────────
# PUBLIC EVENTS — visitors and authenticated users
# ──────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([AllowAny])
def list_events(request):
    """
    GET /api/events/
    Public list of upcoming/open events. FR-V1.
    Query params:
      ?category=community|workshop|...
      ?status=upcoming|open|closed
      ?search=<text>
    """
    qs = Event.objects.exclude(status="archived")

    category = request.query_params.get("category")
    s_filter = request.query_params.get("status")
    search   = request.query_params.get("search")

    if category: qs = qs.filter(category=category)
    if s_filter: qs = qs.filter(status=s_filter)
    if search:
        qs = qs.filter(title__icontains=search) | qs.filter(description__icontains=search)

    return Response({
    "count":   qs.count(),
    "results": EventListSerializer(qs, many=True, context={"request": request}).data,
})


@api_view(["GET"])
@permission_classes([AllowAny])
def event_detail(request, event_id):
    """
    GET /api/events/<id>/
    Full event detail page. FR-V2.
    """
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

    return Response(EventDetailSerializer(event, context={"request": request}).data)


# ──────────────────────────────────────────────────────────────────
# USER APPLICATIONS — members and volunteers
# ──────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def apply_to_event(request, event_id):
    """
    POST /api/events/<id>/apply/
    Body: { preferred_role, motivation }
    Members and volunteers can apply. FR-M3, FR-M4, FR-VOL2.
    """
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

    if event.status in ("closed", "archived"):
        return Response({"error": "This event is no longer accepting applications."}, status=status.HTTP_400_BAD_REQUEST)

    # Check if already applied
    if Application.objects.filter(event=event, user=request.user).exists():
        return Response({"error": "You have already applied to this event."}, status=status.HTTP_400_BAD_REQUEST)

    data = {
        "event":          event.id,
        "preferred_role": request.data.get("preferred_role", ""),
        "motivation":     request.data.get("motivation", ""),
    }
    serializer = CreateApplicationSerializer(data=data)
    if serializer.is_valid():
        application = serializer.save(user=request.user)
        return Response({
            "message":     "Application submitted successfully.",
            "application": ApplicationSerializer(application).data,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_applications(request):
    """
    GET /api/events/my-applications/
    Returns all applications for the logged-in user. FR-M2.
    """
    qs = Application.objects.filter(user=request.user).select_related("event")
    return Response(ApplicationSerializer(qs, many=True).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def cancel_application(request, application_id):
    """
    DELETE /api/events/applications/<id>/
    User cancels their own pending application.
    """
    try:
        app = Application.objects.get(id=application_id, user=request.user)
    except Application.DoesNotExist:
        return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

    if app.status != "pending":
        return Response({"error": "Cannot cancel an already-reviewed application."}, status=status.HTTP_400_BAD_REQUEST)

    app.delete()
    return Response({"message": "Application cancelled."}, status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────────────────────────
# ADMIN — event management (FR-A3)
# ──────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_list_events(request):
    """
    GET /api/events/admin/
    Lists all events (including archived).
    """
    qs = Event.objects.all()

    category = request.query_params.get("category")
    s_filter = request.query_params.get("status")
    search   = request.query_params.get("search")

    if category: qs = qs.filter(category=category)
    if s_filter: qs = qs.filter(status=s_filter)
    if search:
        qs = qs.filter(title__icontains=search) | qs.filter(description__icontains=search)

    return Response({
        "count":   qs.count(),
        "results": EventListSerializer(qs, many=True, context={"request": request}).data,
    })


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_create_event(request):
    """
    POST /api/events/admin/
    Body: { title, description, category, ... }
    FR-A3.
    """
    serializer = EventCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        event = serializer.save(created_by=request.user)
        return Response({
            "message": "Event created.",
            "event":   EventDetailSerializer(event).data,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAdmin])
def admin_update_event(request, event_id):
    """
    PATCH /api/events/admin/<id>/
    Edit event fields. FR-A3.
    """
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = EventCreateUpdateSerializer(event, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "Event updated.",
            "event":   EventDetailSerializer(event).data,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAdmin])
def admin_delete_event(request, event_id):
    """
    DELETE /api/events/admin/<id>/
    Hard-delete an event.
    """
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

    event.delete()
    return Response({"message": "Event deleted."}, status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_archive_event(request, event_id):
    """
    POST /api/events/admin/<id>/archive/
    Soft-archive an event. FR-A3, FR-G4.
    """
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

    event.status = "archived"
    event.save()
    return Response({
        "message": f"'{event.title}' has been archived.",
        "event":   EventListSerializer(event).data,
    })


# ──────────────────────────────────────────────────────────────────
# ADMIN — application review (FR-A4)
# ──────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_list_applications(request):
    """
    GET /api/events/admin/applications/
    Lists all applications across events.
    Query params:
      ?event_id=<id>
      ?status=pending|approved|rejected
    """
    qs = Application.objects.select_related("event", "user", "reviewed_by").all()

    event_id = request.query_params.get("event_id")
    s_filter = request.query_params.get("status")

    if event_id: qs = qs.filter(event_id=event_id)
    if s_filter: qs = qs.filter(status=s_filter)

    return Response({
        "count":   qs.count(),
        "results": AdminApplicationSerializer(qs, many=True).data,
    })


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_approve_application(request, application_id):
    """
    POST /api/events/admin/applications/<id>/approve/
    Body: { assigned_role (optional) }
    FR-A4. Notifies the user.
    """
    try:
        app = Application.objects.select_related("event", "user").get(id=application_id)
    except Application.DoesNotExist:
        return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

    assigned_role = request.data.get("assigned_role", "")
    application = approve_application(app, reviewed_by=request.user, assigned_role=assigned_role)

    return Response({
        "message":     f"Application approved. {app.user.full_name} has been notified.",
        "application": AdminApplicationSerializer(application).data,
    })


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_reject_application(request, application_id):
    """
    POST /api/events/admin/applications/<id>/reject/
    FR-A4. Notifies the user.
    """
    try:
        app = Application.objects.select_related("event", "user").get(id=application_id)
    except Application.DoesNotExist:
        return Response({"error": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

    application = reject_application(app, reviewed_by=request.user)

    return Response({
        "message":     f"Application rejected. {app.user.full_name} has been notified.",
        "application": AdminApplicationSerializer(application).data,
    })