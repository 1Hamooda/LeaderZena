from rest_framework                  import status
from rest_framework.decorators       import api_view, permission_classes
from rest_framework.permissions      import AllowAny, IsAuthenticated
from rest_framework.response         import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models       import User
from .serializers  import (
    RegisterSerializer, UserSerializer, UpdateProfileSerializer,
    ChangePasswordSerializer, AdminUserSerializer, ChangeRoleSerializer,
)
from .services     import get_tokens_for_user, authenticate_user
from .permissions  import IsAdmin


# Auth endpoints

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        role = user.role
        if role == "member":
            return Response({
                "message": "Registration submitted. Your account is pending admin approval.",
                "user":    UserSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
        tokens = get_tokens_for_user(user)
        return Response({
            "message": "Account created successfully.",
            "user":    UserSerializer(user).data,
            "tokens":  tokens,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email    = request.data.get("email",    "").strip().lower()
    password = request.data.get("password", "")
    if not email or not password:
        return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate_user(email, password)
    if not user:
        return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        if user.role == "member":
            return Response({"error": "Your account is pending admin approval."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"error": "Account is disabled."}, status=status.HTTP_403_FORBIDDEN)
    tokens = get_tokens_for_user(user)
    return Response({"message": "Login successful.", "user": UserSerializer(user).data, "tokens": tokens}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        token = RefreshToken(request.data.get("refresh"))
        token.blacklist()
        return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)
    except Exception:
        return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Profile updated.", "user": UserSerializer(request.user).data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Password changed successfully."})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Admin endpoints

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_list_users(request):
    queryset = User.objects.all().order_by("-date_joined")
    role   = request.query_params.get("role")
    active = request.query_params.get("status")
    search = request.query_params.get("search")
    if role:
        queryset = queryset.filter(role=role)
    if active == "pending":
        queryset = queryset.filter(is_active=False)
    elif active == "active":
        queryset = queryset.filter(is_active=True)
    if search:
        queryset = queryset.filter(email__icontains=search) | queryset.filter(first_name__icontains=search) | queryset.filter(last_name__icontains=search)
    serializer = AdminUserSerializer(queryset, many=True)
    return Response({"count": queryset.count(), "results": serializer.data})


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_get_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(AdminUserSerializer(user).data)


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_approve_user(request, user_id):
    try:
        user = User.objects.get(id=user_id, role="member")
    except User.DoesNotExist:
        return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)
    if user.is_active:
        return Response({"message": "User is already active."})
    user.is_active = True
    user.save()
    from apps.notifications.services import notify_member_approved
    notify_member_approved(user)
    return Response({"message": f"{user.full_name} has been approved.", "user": AdminUserSerializer(user).data})


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_reject_user(request, user_id):
    try:
        user = User.objects.get(id=user_id, role="member")
    except User.DoesNotExist:
        return Response({"error": "Member not found."}, status=status.HTTP_404_NOT_FOUND)
    user.is_active = False
    user.save()
    from apps.notifications.services import notify_member_rejected
    notify_member_rejected(user)
    return Response({"message": f"{user.full_name} has been rejected/deactivated.", "user": AdminUserSerializer(user).data})


@api_view(["POST"])
@permission_classes([IsAdmin])
def admin_change_role(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    serializer = ChangeRoleSerializer(data=request.data)
    if serializer.is_valid():
        user.role = serializer.validated_data["role"]
        user.save()
        return Response({"message": f"{user.full_name}'s role changed to {user.role}.", "user": AdminUserSerializer(user).data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)