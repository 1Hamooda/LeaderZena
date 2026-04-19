from .models import PointTransaction


def award_points(user, points, reason, note="", event=None):
    """
    Award or deduct points for a user.
    Call this from any other app — events, attendance, certificates, etc.

    Usage:
        from apps.points.services import award_points
        award_points(user, 50, "event_attendance", event=event_instance)
        award_points(user, -10, "deduction", note="Late cancellation")
        award_points(user, 20, "cv_uploaded")
    """
    return PointTransaction.objects.create(
        user   = user,
        points = points,
        reason = reason,
        note   = note,
        event  = event,
    )


def get_total_points(user):
    """
    Returns the total points balance for a user.
    Sums all transactions including negative deductions.
    """
    from django.db.models import Sum
    result = PointTransaction.objects.filter(user=user).aggregate(total=Sum("points"))
    return result["total"] or 0


def get_points_summary(user):
    """
    Returns total points + a breakdown by reason.
    Used for the member dashboard summary card.
    """
    from django.db.models import Sum
    transactions = PointTransaction.objects.filter(user=user)
    total = transactions.aggregate(total=Sum("points"))["total"] or 0

    breakdown = {}
    for reason, label in PointTransaction.REASON_CHOICES:
        subtotal = transactions.filter(reason=reason).aggregate(s=Sum("points"))["s"] or 0
        if subtotal != 0:
            breakdown[label] = subtotal

    return {"total": total, "breakdown": breakdown}