from django.urls import path
from . import views

urlpatterns = [
    # Volunteer
    path("checkin/",      views.checkin,     name="attendance-checkin"),
    path("my-checkins/",  views.my_checkins, name="attendance-my-checkins"),

    # Admin
    path("admin/generate-code/",                    views.admin_generate_code,    name="attendance-admin-generate-code"),
    path("admin/codes/",                            views.admin_list_codes,       name="attendance-admin-codes"),
    path("admin/codes/<int:code_id>/deactivate/",   views.admin_deactivate_code,  name="attendance-admin-deactivate"),
    path("admin/checkins/",                         views.admin_list_checkins,    name="attendance-admin-checkins"),
    path("admin/manual-checkin/",                   views.admin_manual_checkin,   name="attendance-admin-manual-checkin"),
]