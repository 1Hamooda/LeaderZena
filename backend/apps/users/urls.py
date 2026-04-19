from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # ── Auth ──────────────────────────────────────────
    path("register/",        views.register,        name="auth-register"),
    path("login/",           views.login,           name="auth-login"),
    path("logout/",          views.logout,          name="auth-logout"),
    path("me/",              views.me,              name="auth-me"),
    path("me/update/",       views.update_profile,  name="auth-update-profile"),
    path("change-password/", views.change_password, name="auth-change-password"),
    path("token/refresh/",   TokenRefreshView.as_view(), name="token-refresh"),

    # ── Admin — user management (FR-A1, FR-A2) ────────
    path("admin/users/",                        views.admin_list_users,   name="admin-list-users"),
    path("admin/users/<int:user_id>/",          views.admin_get_user,     name="admin-get-user"),
    path("admin/users/<int:user_id>/approve/",  views.admin_approve_user, name="admin-approve-user"),
    path("admin/users/<int:user_id>/reject/",   views.admin_reject_user,  name="admin-reject-user"),
    path("admin/users/<int:user_id>/role/",     views.admin_change_role,  name="admin-change-role"),
]