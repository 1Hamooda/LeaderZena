from django.urls import path
from . import views

urlpatterns = [
    path("analyze/",       views.analyze_cv,        name="ai-jobs-analyze"),
    path("last-analysis/", views.get_last_analysis, name="ai-jobs-last-analysis"),
]
