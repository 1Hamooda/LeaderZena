from .models import Certificate


def issue_certificate(user, event, issued_by=None):
    """
    Issue a certificate to a user for an event.
    Skips if one already exists (idempotent).
    Call this from attendance app after a successful check-in.

    Usage:
        from apps.certificates.services import issue_certificate
        issue_certificate(user, event, issued_by=admin_user)
    """
    certificate, created = Certificate.objects.get_or_create(
        user  = user,
        event = event,
        defaults={"issued_by": issued_by, "status": "issued"},
    )
    return certificate, created


def revoke_certificate(cert):
    """
    Revoke a certificate by cert object.
    """
    cert.status = "revoked"
    cert.save()
    return cert


def issue_certificates_for_event(event, issued_by=None):
    """
    Bulk-issue certificates to all checked-in volunteers for an event.
    Called by admin after event completion (FR-A8).

    Usage:
        from apps.certificates.services import issue_certificates_for_event
        issue_certificates_for_event(event, issued_by=request.user)
    """
    from apps.attendance.models import CheckIn
    from apps.notifications.services import notify_certificate_ready

    checkins = CheckIn.objects.filter(event=event).select_related("user")
    issued   = []

    for checkin in checkins:
        cert, created = issue_certificate(checkin.user, event, issued_by)
        if created:
            issued.append(cert)
            notify_certificate_ready(checkin.user, event.title)

    return issued