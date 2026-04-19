from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = [
        ("application",  "Application Update"),
        ("event",        "Event"),
        ("certificate",  "Certificate"),
        ("announcement", "Announcement"),
        ("general",      "General"),
    ]

    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    type       = models.CharField(max_length=30, choices=TYPE_CHOICES, default="general")
    title      = models.CharField(max_length=255)
    message    = models.TextField()
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "notifications"
        db_table  = "notifications"
        ordering  = ["-created_at"]

    def __str__(self):
        return f"[{self.type}] {self.title} → {self.user}"