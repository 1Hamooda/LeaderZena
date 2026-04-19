from django.urls import path
from . import views

urlpatterns = [
    # ── Member ────────────────────────────────────────
    path("",                        views.my_points,              name="points-my"),

    # ── Admin ─────────────────────────────────────────
    path("admin/award/",            views.admin_award_points,     name="points-admin-award"),
    path("admin/leaderboard/",      views.admin_points_leaderboard, name="points-admin-leaderboard"),
    path("admin/users/<int:user_id>/", views.admin_user_points,  name="points-admin-user"),
]