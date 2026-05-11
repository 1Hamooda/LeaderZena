from django.utils import timezone


def approve_application(application, reviewed_by, assigned_role=""):
    """
    Approves an event application, sets the assigned role,
    and notifies the user.
    """
    from apps.notifications.services import notify_event_accepted

    application.status        = "approved"
    application.assigned_role = assigned_role or application.preferred_role
    application.reviewed_by   = reviewed_by
    application.reviewed_at   = timezone.now()
    application.save()

    notify_event_accepted(application.user, application.event.title)
    return application


def reject_application(application, reviewed_by):
    """
    Rejects an event application and notifies the user.
    """
    from apps.notifications.services import notify_event_rejected

    application.status      = "rejected"
    application.reviewed_by = reviewed_by
    application.reviewed_at = timezone.now()
    application.save()

    notify_event_rejected(application.user, application.event.title)
    return application