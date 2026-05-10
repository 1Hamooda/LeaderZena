from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/",              admin.site.urls),
    path("api/auth/",           include("apps.users.urls")),
    path("api/notifications/",  include("apps.notifications.urls")),
    path("api/points/",         include("apps.points.urls")),
    path("api/certificates/",   include("apps.certificates.urls")),
    path("api/events/",         include("apps.events.urls")),
    path("api/attendance/",     include("apps.attendance.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)