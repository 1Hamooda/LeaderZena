from django.db import models
from django.conf import settings


class Event(models.Model):
    STATUS_CHOICES = [
        ("upcoming", "Upcoming"),
        ("open",     "Open"),
        ("closed",   "Closed"),
        ("archived", "Archived"),
    ]

    CATEGORY_CHOICES = [
        ("community",  "Community"),
        ("social",     "Social"),
        ("workshop",   "Workshop"),
        ("conference", "Conference"),
        ("leadership", "Leadership"),
        ("other",      "Other"),
    ]

    title            = models.CharField(max_length=255)
    description      = models.TextField()
    category         = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="other")
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default="upcoming")
    emoji            = models.CharField(max_length=10, default="📅")
    location         = models.CharField(max_length=255)
    date             = models.DateField()
    time_start       = models.TimeField(null=True, blank=True)
    time_end         = models.TimeField(null=True, blank=True)
    max_participants = models.PositiveIntegerField(default=50)
    roles_available  = models.JSONField(default=list)
    highlights       = models.JSONField(default=list)
    created_by       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_events",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "events"
        db_table  = "events"
        ordering  = ["-date"]

    def __str__(self):
        return self.title

    @property
    def spots_remaining(self):
        approved = self.applications.filter(status="approved").count()
        return max(self.max_participants - approved, 0)