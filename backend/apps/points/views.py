from rest_framework             import status
from rest_framework.decorators  import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response    import Response

from apps.users.models          import User
from apps.users.permissions     import IsAdmin
from .models                    import PointTransaction
from .serializers               import PointTransactionSerializer, AwardPointsSerializer
from .services                  import get_points_summary, award_points


# ── Helpers ────────────────────────────────────────────────────────

LEVEL_THRESHOLDS = [
    (3000, "Diamond"),
    (2000, "Platinum"),
    (1000, "Gold"),
    (500,  "Silver"),
    (0,    "Bronze"),
]

def get_level(points: int) -> str:
    for threshold, label in LEVEL_THRESHOLDS:
        if points >= threshold:
            return label
    return "Bronze"

def get_next_milestone(points: int) -> int:
    thresholds_asc = sorted(t for t, _ in LEVEL_THRESHOLDS)
    for t in thresholds_asc:
        if points < t:
            return t
    return thresholds_asc[-1]

def build_leaderboard(limit: int = 50):
    from django.db.models import Sum, Count

    users = (
        User.objects
        .filter(is_active=True)
        .exclude(role="admin")
        .annotate(
            total_points    = Sum("point_transactions__points"),
            events_attended = Count("checkins", distinct=True),
        )
        .order_by("-total_points")[:limit]
    )

    results = []
    for i, u in enumerate(users):
        pts = u.total_points or 0
        results.append({
            "rank":            i + 1,
            "user_id":         u.id,
            "name":            u.full_name,
            "email":           u.email,
            "total_points":    pts,
            "level":           get_level(pts),
            "events_attended": u.events_attended or 0,
        })
    return results


# ── Member / Volunteer endpoints ───────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_points(request):
    """GET /api/points/ — logged-in user's points summary + history."""
    summary      = get_points_summary(request.user)
    transactions = PointTransaction.objects.filter(user=request.user)
    serializer   = PointTransactionSerializer(transactions, many=True)
    return Response({
        "total":     summary["total"],
        "breakdown": summary["breakdown"],
        "history":   serializer.data,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    """
    GET /api/points/leaderboard/
    Accessible to any authenticated user.
    Returns top users ranked by total points with level + events_attended.
    """
    limit   = min(int(request.query_params.get("limit", 50)), 100)
    results = build_leaderboard(limit=limit)
    return Response({"leaderboard": results})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_rank(request):
    """
    GET /api/points/my-rank/
    Returns the logged-in user's rank, level, points, and progress to next milestone.
    """
    full       = build_leaderboard(limit=1000)
    user_entry = next((e for e in full if e["user_id"] == request.user.id), None)

    pts  = user_entry["total_points"] if user_entry else 0
    rank = user_entry["rank"]         if user_entry else len(full) + 1

    return Response({
        "rank":            rank,
        "total_points":    pts,
        "level":           get_level(pts),
        "next_milestone":  get_next_milestone(pts),
        "points_to_next":  max(get_next_milestone(pts) - pts, 0),
        "events_attended": request.user.checkins.count(),
        "total_users":     len(full),
    })


# ── Admin endpoints ────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_user_points(request, user_id):
    """GET /api/points/admin/users/<user_id>/ — admin views any user's history."""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    summary      = get_points_summary(user)
    transactions = PointTransaction.objects.filter(user=user)
    serializer   = PointTransactionSerializer(transactions, many=True)

    return Response({
        "user":      f"{user.full_name} ({user.email})",
        "total":     summary["total"],
        "breakdown": summary["breakdown"],
        "history":   serializer.data,
    })


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_award_points(request):
    """POST /api/points/admin/award/ — admin awards or deducts points."""
    serializer = AwardPointsSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=serializer.validated_data["user_id"])
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    transaction = award_points(
        user   = user,
        points = serializer.validated_data["points"],
        reason = serializer.validated_data["reason"],
        note   = serializer.validated_data.get("note", ""),
    )

    action = "awarded" if transaction.points >= 0 else "deducted"
    return Response({
        "message":     f"{abs(transaction.points)} points {action} for {user.full_name}.",
        "transaction": PointTransactionSerializer(transaction).data,
        "new_total":   get_points_summary(user)["total"],
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_points_leaderboard(request):
    """GET /api/points/admin/leaderboard/ — kept for admin dashboard compatibility."""
    limit   = min(int(request.query_params.get("limit", 10)), 100)
    results = build_leaderboard(limit=limit)
    return Response({"leaderboard": results})