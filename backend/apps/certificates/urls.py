from django.urls import path
from . import views

urlpatterns = [
    # ── Volunteer / Member ─────────────────────────────
    path("",                                views.my_certificates,      name="certificates-my"),
    path("<uuid:uuid>/download/",           views.download_certificate, name="certificates-download"),

    # ── Admin ──────────────────────────────────────────
    path("admin/",                          views.admin_list_certificates, name="certificates-admin-list"),
    path("admin/issue/",                    views.admin_issue_single,      name="certificates-admin-issue"),
    path("admin/issue-bulk/",               views.admin_issue_bulk,        name="certificates-admin-issue-bulk"),
    path("admin/<int:certificate_id>/revoke/", views.admin_revoke,         name="certificates-admin-revoke"),
]