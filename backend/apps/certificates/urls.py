from django.urls import path
from . import views

urlpatterns = [
    # User
    path("",                                views.my_certificates,          name="certificates-list"),
    path("<uuid:uuid>/download/",           views.download_certificate,     name="certificates-download"),

    # Admin
    path("admin/",                          views.admin_list_certificates,  name="certificates-admin-list"),
    path("admin/issue/",                    views.admin_issue_certificate,  name="certificates-admin-issue"),
    path("admin/issue-bulk/",               views.admin_issue_bulk,         name="certificates-admin-issue-bulk"),
    path("admin/<int:cert_id>/revoke/",     views.admin_revoke_certificate, name="certificates-admin-revoke"),
    path("<uuid:uuid>/view/", views.view_certificate, name="certificates-view"),
]