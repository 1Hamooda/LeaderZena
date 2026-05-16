import json
import logging
from django.conf import settings
from openai import OpenAI
from .models import JobOpportunity, JobAnalysis

logger = logging.getLogger(__name__)

MAX_JOBS = 50


def get_jobs_from_db():
    jobs = JobOpportunity.objects.filter(is_active=True).values(
        "title", "job_type", "industry", "country", "city", "is_remote", "url"
    )[:MAX_JOBS]
    return list(jobs)


def build_prompt(cv_text: str, jobs: list) -> str:
    jobs_text = "\n".join([
        f"- {j['title']} | {j['industry']} | {j['job_type']} | {j['city']}, {j['country']} | {'Remote' if j['is_remote'] else 'On-site'} | {j['url']}"
        for j in jobs
    ])

    return f"""أنت مستشار مهني محترف. حلل السيرة الذاتية التالية وقارنها مع الوظائف المتاحة.

السيرة الذاتية:
{cv_text}

الوظائف المتاحة:
{jobs_text}

أرجع JSON فقط بهذا الشكل بدون أي نص إضافي:
{{
  "matches": [
    {{
      "title": "اسم الوظيفة",
      "match": 90,
      "reason": "سبب التطابق",
      "url": "رابط الوظيفة",
      "job_type": "نوع الوظيفة",
      "location": "المدينة، الدولة"
    }}
  ]
}}

رتب الوظائف من الأعلى تطابقاً للأقل. أرجع أفضل 5 وظائف فقط.
"""


def call_openai_api(prompt: str) -> str:
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        timeout=30,
    )

    return response.choices[0].message.content


def analyze_cv_with_gemini(cv_text: str, user=None) -> list:
    if not cv_text.strip():
        raise Exception("السيرة الذاتية فارغة.")

    jobs = get_jobs_from_db()

    if not jobs:
        raise Exception("لا توجد وظائف متاحة حالياً.")

    prompt = build_prompt(cv_text, jobs)
    raw = call_openai_api(prompt)

    try:
        clean = raw.strip().replace("```json", "").replace("```", "")
        result = json.loads(clean)
        matches = result.get("matches", [])
    except json.JSONDecodeError:
        raise Exception("فشل في قراءة استجابة الـ AI.")

    if user:
        JobAnalysis.objects.create(user=user, analysis_text=raw)

    return matches
