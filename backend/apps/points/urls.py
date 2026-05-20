from django.urls import path
from . import views

urlpatterns = [
    # ── Any authenticated user ─────────────────────────
    path("",                           views.my_points,               name="points-my"),
    path("leaderboard/",               views.leaderboard,             name="points-leaderboard"),
    path("my-rank/",                   views.my_rank,                 name="points-my-rank"),

    # ── Admin ──────────────────────────────────────────
    path("admin/award/",               views.admin_award_points,      name="points-admin-award"),
    path("admin/leaderboard/",         views.admin_points_leaderboard,name="points-admin-leaderboard"),
    path("admin/users/<int:user_id>/", views.admin_user_points,       name="points-admin-user"),
]