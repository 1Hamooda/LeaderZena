from rest_framework                 import status
from rest_framework.decorators      import api_view, permission_classes
from rest_framework.permissions     import IsAuthenticated
from rest_framework.response        import Response

from apps.cv.models                 import CV
from .services                      import analyze_cv_with_gemini


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def analyze_cv(request):
    """
    POST /api/ai-jobs/analyze/
    يحلل الـ CV الخاص بالمستخدم ويقارنه بالوظائف المتاحة.
    """
    try:
        cv = request.user.cv
    except CV.DoesNotExist:
        return Response(
            {"error": "لم تقم برفع سيرتك الذاتية بعد."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not cv.extracted_text or not cv.extracted_text.strip():
        return Response(
            {"error": "لم يتم استخراج نص من سيرتك الذاتية."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        matches = analyze_cv_with_gemini(cv.extracted_text, user=request.user)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({"matches": matches})
