import random
import string
from django.utils import timezone
from .models import AttendanceCode, CheckIn


def generate_code(length=7):
    """Generate a random uppercase alphanumeric code."""
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=length))


def create_attendance_code(event, created_by, expires_at=None):
    """
    Create or regenerate an attendance code for an event.
    If one already exists, deactivate it and create a fresh one.
    """
    # Deactivate any existing code for this event
    AttendanceCode.objects.filter(event=event).update(is_active=False)

    code = generate_code()
    # Ensure uniqueness
    while AttendanceCode.objects.filter(code=code, is_active=True).exists():
        code = generate_code()

    return AttendanceCode.objects.create(
        event      = event,
        code       = code,
        created_by = created_by,
        expires_at = expires_at,
        is_active  = True,
    )


def checkin_with_code(user, raw_code):
    """
    Attempt to check in a user with a raw code string.
    Returns (checkin, error_message).
    """
    try:
        attendance_code = AttendanceCode.objects.select_related("event").get(
            code      = raw_code.strip().upper(),
            is_active = True,
        )
    except AttendanceCode.DoesNotExist:
        return None, "Invalid or inactive code. Please check and try again."

    # Check expiry
    if attendance_code.expires_at and attendance_code.expires_at < timezone.now():
        return None, "This code has expired."

    event = attendance_code.event

    # Already checked in?
    if CheckIn.objects.filter(event=event, user=user).exists():
        return None, f"You have already checked in to \"{event.title}\"."

    checkin = CheckIn.objects.create(event=event, user=user)
    return checkin, None