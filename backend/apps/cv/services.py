import io
from .models import CV


def extract_text_from_file(uploaded_file) -> str:
    """Extract plain text from a PDF or Word CV file."""
    content_type = getattr(uploaded_file, "content_type", "")
    file_bytes   = uploaded_file.read()
    uploaded_file.seek(0)

    if "pdf" in content_type:
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            pages  = [page.extract_text() or "" for page in reader.pages]
            return "\n".join(pages).strip()
        except Exception:
            return ""

    if "word" in content_type or "openxmlformats" in content_type:
        try:
            import docx
            doc   = docx.Document(io.BytesIO(file_bytes))
            lines = [p.text for p in doc.paragraphs if p.text.strip()]
            return "\n".join(lines).strip()
        except Exception:
            return ""

    return ""


def save_cv(user, uploaded_file):
    """
    Create or replace the CV for a user.
    Returns (cv_instance, created: bool).
    """
    text    = extract_text_from_file(uploaded_file)
    created = not CV.objects.filter(user=user).exists()

    cv, _ = CV.objects.update_or_create(
        user     = user,
        defaults = {
            "file":           uploaded_file,
            "extracted_text": text,
        },
    )

    return cv, created
