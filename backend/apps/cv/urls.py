from django.urls import path
from . import views

urlpatterns = [
    # ── Member ────────────────────────────────────────
    path("",          views.my_cv,     name="cv-my"),
    path("upload/",   views.upload_cv, name="cv-upload"),
    path("delete/",   views.delete_cv, name="cv-delete"),

    # ── Admin ─────────────────────────────────────────
    path("admin/",                     views.admin_list_cvs,    name="cv-admin-list"),
    path("admin/users/<int:user_id>/", views.admin_get_user_cv, name="cv-admin-user"),
]