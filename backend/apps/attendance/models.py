from django.db import models
from django.conf import settings


class AttendanceCode(models.Model):
    """Admin-generated check-in code for an event."""
    event      = models.OneToOneField("events.Event", on_delete=models.CASCADE, related_name="attendance_code")
    code       = models.CharField(max_length=10, unique=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active  = models.BooleanField(default=True)

    class Meta:
        app_label = "attendance"
        db_table  = "attendance_codes"

    def __str__(self):
        return f"{self.code} — {self.event}"


class CheckIn(models.Model):
    """A volunteer checking in to an event using the code."""
    event         = models.ForeignKey("events.Event", on_delete=models.CASCADE, related_name="checkins")
    user          = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="checkins")
    checked_in_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label    = "attendance"
        db_table     = "checkins"
        unique_together = ("event", "user")

    def __str__(self):
        return f"{self.user} @ {self.event}"