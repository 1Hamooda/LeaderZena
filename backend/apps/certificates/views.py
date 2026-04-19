from django.http                    import HttpResponse
from rest_framework                 import status
from rest_framework.decorators      import api_view, permission_classes
from rest_framework.permissions     import IsAuthenticated, AllowAny
from rest_framework.response        import Response

from apps.users.models              import User
from apps.users.permissions         import IsAdmin
from apps.events.models             import Event
from .models                        import Certificate
from .serializers                   import CertificateSerializer, AdminCertificateSerializer
from .services                      import issue_certificate, revoke_certificate, issue_certificates_for_event


# ── Volunteer / Member endpoints ───────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_certificates(request):
    """
    GET /api/certificates/
    Returns all certificates for the logged-in user.
    FR-VOL6.
    """
    certs = Certificate.objects.filter(user=request.user, status="issued")
    return Response(CertificateSerializer(certs, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def download_certificate(request, uuid):
    """
    GET /api/certificates/<uuid>/download/
    Returns a simple text certificate for download.
    In production this would generate a PDF — this is the placeholder.
    FR-VOL6.
    """
    try:
        cert = Certificate.objects.select_related("user", "event").get(uuid=uuid, status="issued")
    except Certificate.DoesNotExist:
        return Response({"error": "Certificate not found or revoked."}, status=status.HTTP_404_NOT_FOUND)

    # Simple text certificate — replace with PDF generation later
    content = f"""
MENA CLUB — PARTICIPATION CERTIFICATE

This is to certify that

    {cert.user.full_name}

has successfully participated in

    {cert.event.title}
    {cert.event.date}

Issued on: {cert.issued_at.strftime('%B %d, %Y')}
Certificate ID: {cert.uuid}

MENA Club Management System
    """.strip()

    response = HttpResponse(content, content_type="text/plain")
    response["Content-Disposition"] = f'attachment; filename="certificate_{cert.uuid}.txt"'
    return response


# ── Admin endpoints ────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_list_certificates(request):
    """
    GET /api/certificates/admin/
    Lists all certificates with optional filters.
    Query params:
      ?event_id=<id>
      ?user_id=<id>
      ?status=issued|revoked
    FR-A8.
    """
    qs = Certificate.objects.select_related("user", "event", "issued_by").all()

    event_id = request.query_params.get("event_id")
    user_id  = request.query_params.get("user_id")
    status   = request.query_params.get("status")

    if event_id:
        qs = qs.filter(event_id=event_id)
    if user_id:
        qs = qs.filter(user_id=user_id)
    if status:
        qs = qs.filter(status=status)

    return Response({
        "count":   qs.count(),
        "results": AdminCertificateSerializer(qs, many=True).data,
    })


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_issue_single(request):
    """
    POST /api/certificates/admin/issue/
    Issue a certificate to a single user for an event.
    Body: { user_id, event_id }
    FR-A8.
    """
    user_id  = request.data.get("user_id")
    event_id = request.data.get("event_id")

    if not user_id or not event_id:
        return Response({"error": "user_id and event_id are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user  = User.objects.get(id=user_id)
        event = Event.objects.get(id=event_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except Event.DoesNotExist:
        return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

    cert, created = issue_certificate(user, event, issued_by=request.user)

    if not created:
        return Response({
            "message":     "Certificate already exists.",
            "certificate": AdminCertificateSerializer(cert).data,
        })

    from apps.notifications.services import notify_certificate_ready
    notify_certificate_ready(user, event.title)

    return Response({
        "message":     f"Certificate issued to {user.full_name}.",
        "certificate": AdminCertificateSerializer(cert).data,
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_issue_bulk(request):
    """
    POST /api/certificates/admin/issue-bulk/
    Issues certificates to all checked-in volunteers for an event.
    Body: { event_id }
    FR-A8.
    """
    event_id = request.data.get("event_id")
    if not event_id:
        return Response({"error": "event_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return Response({"error": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

    issued = issue_certificates_for_event(event, issued_by=request.user)

    return Response({
        "message": f"{len(issued)} certificates issued for '{event.title}'.",
        "count":   len(issued),
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_revoke(request, certificate_id):
    """
    POST /api/certificates/admin/<id>/revoke/
    Revokes a certificate.
    """
    try:
        cert = Certificate.objects.get(id=certificate_id)
    except Certificate.DoesNotExist:
        return Response({"error": "Certificate not found."}, status=status.HTTP_404_NOT_FOUND)

    cert.status = "revoked"
    cert.save()

    return Response({
        "message":     f"Certificate revoked for {cert.user.full_name}.",
        "certificate": AdminCertificateSerializer(cert).data,
    })