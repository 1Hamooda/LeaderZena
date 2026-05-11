from rest_framework              import status
from rest_framework.decorators   import api_view, permission_classes
from rest_framework.permissions  import IsAuthenticated
from rest_framework.response     import Response

from apps.users.models      import User
from apps.users.permissions import IsAdmin
from .models                import CV
from .serializers           import CVSerializer, CVUploadSerializer
from .services              import save_cv


# ── Member endpoints ───────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_cv(request):
    try:
        cv = request.user.cv
    except CV.DoesNotExist:
        return Response({"error": "No CV uploaded yet."}, status=status.HTTP_404_NOT_FOUND)
    return Response(CVSerializer(cv, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_cv(request):
    serializer = CVUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    cv, created = save_cv(request.user, serializer.validated_data["file"])
    message = "CV uploaded successfully." if created else "CV updated successfully."
    return Response(
        {"message": message, "cv": CVSerializer(cv, context={"request": request}).data},
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_cv(request):
    try:
        cv = request.user.cv
        cv.file.delete(save=False)
        cv.delete()
        return Response({"message": "CV deleted."}, status=status.HTTP_204_NO_CONTENT)
    except CV.DoesNotExist:
        return Response({"error": "No CV to delete."}, status=status.HTTP_404_NOT_FOUND)


# ── Admin endpoints ────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_list_cvs(request):
    cvs  = CV.objects.select_related("user").all().order_by("-uploaded_at")
    data = [
        {
            "user_id":     cv.user.id,
            "name":        cv.user.full_name,
            "email":       cv.user.email,
            "has_text":    bool(cv.extracted_text),
            "uploaded_at": cv.uploaded_at,
        }
        for cv in cvs
    ]
    return Response({"count": len(data), "results": data})


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_get_user_cv(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        cv   = user.cv
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except CV.DoesNotExist:
        return Response({"error": f"{user.full_name} has not uploaded a CV yet."}, status=status.HTTP_404_NOT_FOUND)
    return Response(CVSerializer(cv, context={"request": request}).data)