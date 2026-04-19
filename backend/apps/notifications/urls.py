from django.urls import path
from . import views

urlpatterns = [
    # ── User ──────────────────────────────────────────
    path("",                              views.my_notifications,     name="notifications-list"),
    path("unread-count/",                 views.unread_count,         name="notifications-unread-count"),
    path("read-all/",                     views.mark_all_read,        name="notifications-read-all"),
    path("<int:notification_id>/read/",   views.mark_read,            name="notifications-mark-read"),
    path("<int:notification_id>/",        views.delete_notification,  name="notifications-delete"),

    # ── Admin ──────────────────────────────────────────
    path("admin/send/",                   views.admin_send_notification, name="notifications-admin-send"),
]