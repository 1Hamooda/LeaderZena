import uuid
from django.db import models
from django.conf import settings


class Certificate(models.Model):
    STATUS_CHOICES = [
        ("issued",  "Issued"),
        ("revoked", "Revoked"),
    ]

    # Unique public identifier used in download URLs
    uuid       = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="certificates",
    )
    event      = models.ForeignKey(
        "events.Event",
        on_delete=models.CASCADE,
        related_name="certificates",
    )
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default="issued")
    issued_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="issued_certificates",
    )
    issued_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label  = "certificates"
        db_table   = "certificates"
        ordering   = ["-issued_at"]
        # One certificate per user per event
        unique_together = [("user", "event")]

    def __str__(self):
        return f"Certificate — {self.user} | {self.event} ({self.status})"