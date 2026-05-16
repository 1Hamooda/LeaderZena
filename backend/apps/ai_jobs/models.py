from django.db import models
from django.conf import settings


class JobOpportunity(models.Model):
    zoho_id   = models.CharField(max_length=100, unique=True)
    title     = models.CharField(max_length=255)
    job_type  = models.CharField(max_length=100, blank=True)
    industry  = models.CharField(max_length=100, blank=True)
    city      = models.CharField(max_length=100, blank=True)
    country   = models.CharField(max_length=100, blank=True)
    is_remote = models.BooleanField(default=False)
    url       = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "ai_jobs"
        db_table  = "job_opportunities"

    def __str__(self):
        return self.title


class JobAnalysis(models.Model):
    user          = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="job_analyses",
    )
    analysis_text = models.TextField()
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = "ai_jobs"
        db_table  = "job_analyses"
        ordering  = ["-created_at"]

    def __str__(self):
        return f"Analysis for {self.user.email}"
