from django.urls import path
from . import views

urlpatterns = [
    # ── Public ────────────────────────────────────────
    path("",                              views.list_events,    name="events-list"),
    path("<int:event_id>/",               views.event_detail,   name="events-detail"),

    # ── User applications ─────────────────────────────
    path("my-applications/",              views.my_applications,    name="events-my-applications"),
    path("<int:event_id>/apply/",         views.apply_to_event,     name="events-apply"),
    path("applications/<int:application_id>/", views.cancel_application, name="events-cancel-application"),

    # ── Admin — events ────────────────────────────────
    path("admin/",                                views.admin_list_events,   name="events-admin-list"),
    path("admin/create/",                         views.admin_create_event,  name="events-admin-create"),
    path("admin/<int:event_id>/",                 views.admin_update_event,  name="events-admin-update"),
    path("admin/<int:event_id>/delete/",          views.admin_delete_event,  name="events-admin-delete"),
    path("admin/<int:event_id>/archive/",         views.admin_archive_event, name="events-admin-archive"),

    # ── Admin — applications ──────────────────────────
    path("admin/applications/",                                    views.admin_list_applications,    name="events-admin-applications"),
    path("admin/applications/<int:application_id>/approve/",       views.admin_approve_application,  name="events-admin-approve-application"),
    path("admin/applications/<int:application_id>/reject/",        views.admin_reject_application,   name="events-admin-reject-application"),
]