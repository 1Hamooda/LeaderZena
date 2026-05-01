from django.urls import path
from . import views

urlpatterns = [
    # ── Admin ─────────────────────────────────────────
    path("",             views.dashboard_stats, name="analytics-stats"),
    path("leaderboard/", views.leaderboard,     name="analytics-leaderboard"),
]
