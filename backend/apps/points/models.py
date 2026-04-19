from django.db import models
from django.conf import settings


class PointTransaction(models.Model):
    """
    Tracks points earned by members.
    Points are awarded for attending events, completing tasks,
    uploading a CV, etc.
    """
    REASON_CHOICES = [
        ("event_attendance", "Event Attendance"),
        ("task_completed",   "Task Completed"),
        ("cv_uploaded",      "CV Uploaded"),
        ("referral",         "Referral"),
        ("bonus",            "Bonus"),
        ("deduction",        "Deduction"),
    ]

    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="point_transactions")
    points     = models.IntegerField()                   # can be negative for deductions
    reason     = models.CharField(max_length=30, choices=REASON_CHOICES)
    note       = models.CharField(max_length=255, blank=True)
    event      = models.ForeignKey("events.Event", on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "points"
        db_table  = "point_transactions"
        ordering  = ["-created_at"]

    def __str__(self):
        return f"{self.user} {'+' if self.points >= 0 else ''}{self.points} ({self.reason})"