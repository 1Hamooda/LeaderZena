from rest_framework             import status
from rest_framework.decorators  import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response    import Response

from apps.users.models          import User
from apps.users.permissions     import IsAdmin
from .models                    import PointTransaction
from .serializers               import PointTransactionSerializer, AwardPointsSerializer
from .services                  import get_points_summary, award_points


# ── Member endpoints ───────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_points(request):
    """
    GET /api/points/
    Returns the logged-in member's points total, breakdown, and full history.
    FR-M2.
    """
    summary      = get_points_summary(request.user)
    transactions = PointTransaction.objects.filter(user=request.user)
    serializer   = PointTransactionSerializer(transactions, many=True)

    return Response({
        "total":    summary["total"],
        "breakdown": summary["breakdown"],
        "history":  serializer.data,
    })


# ── Admin endpoints ────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_user_points(request, user_id):
    """
    GET /api/points/admin/users/<user_id>/
    Admin views any user's points total and history.
    FR-A9.
    """
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
    """
    POST /api/points/admin/award/
    Admin manually awards or deducts points for a user.
    Body: { user_id, points, reason, note (optional) }
    """
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
    """
    GET /api/points/admin/leaderboard/
    Returns top members ranked by total points.
    Useful for analytics (FR-A9).
    Query params:
      ?limit=10  (default 10)
    """
    from django.db.models import Sum

    limit = int(request.query_params.get("limit", 10))

    leaderboard = (
        User.objects
        .filter(role="member", is_active=True)
        .annotate(total_points=Sum("point_transactions__points"))
        .order_by("-total_points")[:limit]
    )

    results = [
        {
            "rank":         i + 1,
            "user_id":      u.id,
            "name":         u.full_name,
            "email":        u.email,
            "total_points": u.total_points or 0,
        }
        for i, u in enumerate(leaderboard)
    ]

    return Response({"leaderboard": results})