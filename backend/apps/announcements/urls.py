from django.urls import path
from . import views

urlpatterns = [
    # ── Public ────────────────────────────────────────
    path("",          views.list_announcements, name="announcements-list"),
    path("<int:pk>/", views.get_announcement,   name="announcements-detail"),

    # ── Admin ─────────────────────────────────────────
    path("admin/",          views.admin_list_announcements,   name="announcements-admin-list"),
    path("admin/create/",   views.admin_create_announcement,  name="announcements-admin-create"),
    path("admin/<int:pk>/", views.admin_update_announcement,  name="announcements-admin-update"),
    path("admin/<int:pk>/delete/", views.admin_delete_announcement, name="announcements-admin-delete"),
]
