from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


def get_tokens_for_user(user: User) -> dict:
    """Generate JWT access + refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access":  str(refresh.access_token),
    }


def authenticate_user(email: str, password: str):
    """
    Authenticate by email + password.
    Returns the User instance or None.

    We fetch the user manually instead of using Django's authenticate()
    because authenticate() returns None for inactive users, which prevents
    us from showing a "pending approval" message to inactive members.
    """
    try:
        user = User.objects.get(email=email.lower())
    except User.DoesNotExist:
        return None

    if not user.check_password(password):
        return None

    return user


def get_user_by_id(user_id: int):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None