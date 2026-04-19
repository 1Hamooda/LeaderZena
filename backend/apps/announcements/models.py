from django.db import models
from django.conf import settings


class Announcement(models.Model):
    CATEGORY_CHOICES = [
        ("events",   "Events"),
        ("workshop", "Workshop"),
        ("general",  "General"),
    ]

    STATUS_CHOICES = [
        ("draft",     "Draft"),
        ("published", "Published"),
    ]

    title      = models.CharField(max_length=255)
    content    = models.TextField()
    category   = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="general")
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    emoji      = models.CharField(max_length=10, default="📢")
    is_pinned  = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="announcements",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "announcements"
        db_table  = "announcements"
        ordering  = ["-is_pinned", "-created_at"]

    def __str__(self):
        return self.title