from .models import Notification


def create_notification(user, title, message, type="general"):
    """
    Create a single notification for one user.
    Call this from any other app (events, certificates, etc.)

    Usage:
        from apps.notifications.services import create_notification
        create_notification(user, "Approved!", "Your account has been approved.", type="application")
    """
    return Notification.objects.create(
        user    = user,
        type    = type,
        title   = title,
        message = message,
    )


def create_bulk_notifications(users, title, message, type="general"):
    """
    Create the same notification for multiple users at once.
    Uses bulk_create for efficiency.

    Usage:
        from apps.notifications.services import create_bulk_notifications
        create_bulk_notifications(User.objects.filter(role="member"), "New Event!", "...")
    """
    notifications = [
        Notification(user=user, type=type, title=title, message=message)
        for user in users
    ]
    Notification.objects.bulk_create(notifications)


def notify_member_approved(user):
    create_notification(
        user    = user,
        title   = "Account Approved",
        message = "Your MENA Club membership has been approved. Welcome!",
        type    = "application",
    )


def notify_member_rejected(user):
    create_notification(
        user    = user,
        title   = "Account Not Approved",
        message = "Unfortunately your membership application was not approved at this time.",
        type    = "application",
    )


def notify_event_accepted(user, event_title):
    create_notification(
        user    = user,
        title   = "Application Accepted",
        message = f"Your application for '{event_title}' has been accepted.",
        type    = "event",
    )


def notify_event_rejected(user, event_title):
    create_notification(
        user    = user,
        title   = "Application Not Accepted",
        message = f"Your application for '{event_title}' was not accepted this time.",
        type    = "event",
    )


def notify_certificate_ready(user, event_title):
    create_notification(
        user    = user,
        title   = "Certificate Ready",
        message = f"Your participation certificate for '{event_title}' is ready to download.",
        type    = "certificate",
    )


def notify_new_announcement(users, announcement_title):
    create_bulk_notifications(
        users   = users,
        title   = "New Announcement",
        message = f"A new announcement has been posted: '{announcement_title}'.",
        type    = "announcement",
    )