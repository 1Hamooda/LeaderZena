from django.db import models
from django.conf import settings


class ReportSnapshot(models.Model):
    """
    Optional periodic snapshot of key metrics.
    Used by the admin analytics dashboard.
    Most analytics are computed live from other tables,
    but snapshots allow historical trend charts.
    """
    date              = models.DateField(unique=True)
    total_members     = models.PositiveIntegerField(default=0)
    total_volunteers  = models.PositiveIntegerField(default=0)
    total_events      = models.PositiveIntegerField(default=0)
    total_checkins    = models.PositiveIntegerField(default=0)
    total_certificates = models.PositiveIntegerField(default=0)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "analytics"
        db_table  = "report_snapshots"
        ordering  = ["-date"]

    def __str__(self):
        return f"Snapshot — {self.date}"