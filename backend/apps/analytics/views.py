from rest_framework              import status
from rest_framework.decorators   import api_view, permission_classes
from rest_framework.response     import Response

from apps.users.permissions      import IsAdmin
from apps.users.models           import User
from apps.certificates.models    import Certificate
from apps.points.models          import PointTransaction


# ── Admin endpoints ────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdmin])
def dashboard_stats(request):
    total_members      = User.objects.filter(role="member",    is_active=True).count()
    total_volunteers   = User.objects.filter(role="volunteer", is_active=True).count()
    total_certificates = Certificate.objects.filter(status="issued").count()

    try:
        from apps.events.models import Event
        total_events = Event.objects.count()
    except Exception:
        total_events = 0

    try:
        from apps.attendance.models import CheckIn
        total_checkins = CheckIn.objects.count()
    except Exception:
        total_checkins = 0

    return Response({
        "total_members":      total_members,
        "total_volunteers":   total_volunteers,
        "total_users":        total_members + total_volunteers,
        "total_events":       total_events,
        "total_checkins":     total_checkins,
        "total_certificates": total_certificates,
    })


@api_view(["GET"])
@permission_classes([IsAdmin])
def leaderboard(request):
    from django.db.models import Sum

    limit = int(request.query_params.get("limit", 5))

    top = (
        User.objects
        .filter(role__in=["member", "volunteer"], is_active=True)
        .annotate(total_points=Sum("point_transactions__points"))
        .order_by("-total_points")[:limit]
    )

    results = [
        {
            "rank":         i + 1,
            "name":         u.full_name,
            "email":        u.email,
            "total_points": u.total_points or 0,
        }
        for i, u in enumerate(top)
    ]

    return Response({"leaderboard": results})
