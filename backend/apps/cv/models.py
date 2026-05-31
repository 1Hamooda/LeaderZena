from django.db import models
from django.conf import settings


class CV(models.Model):

    user           = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cv",
    )
    file           = models.FileField(upload_to="cvs/")
    extracted_text = models.TextField(blank=True)
    uploaded_at    = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "cv"
        db_table  = "cvs"

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.user.email})"