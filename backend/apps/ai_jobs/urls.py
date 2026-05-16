from django.urls import path
from . import views

urlpatterns = [
    path("analyze/", views.analyze_cv, name="ai-jobs-analyze"),
]
