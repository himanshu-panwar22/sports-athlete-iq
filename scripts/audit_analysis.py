import os
import re
from pathlib import Path

root = Path(".")

print("=== 1. SCOUT DASHBOARD AUDIT ===")
scout_html = (root / "scout-dashboard/public/index.html").read_text(encoding="utf-8")
scout_js = (root / "scout-dashboard/public/app.js").read_text(encoding="utf-8")

onclicks = set(re.findall(r'onclick="([a-zA-Z0-9_]+)\(', scout_html))
missing_scout = [fn for fn in onclicks if f"function {fn}" not in scout_js and f"{fn} =" not in scout_js]
print("Scout Onclicks Found:", len(onclicks), sorted(list(onclicks)))
print("Missing Scout Functions:", missing_scout)

print("\n=== 2. MOBILE APP AUDIT ===")
mobile_html = (root / "mobile-app/public/index.html").read_text(encoding="utf-8")
mobile_js = (root / "mobile-app/public/app.js").read_text(encoding="utf-8")

m_onclicks = set(re.findall(r'onclick="([a-zA-Z0-9_]+)\(', mobile_html))
missing_mobile = [fn for fn in m_onclicks if f"function {fn}" not in mobile_js and f"{fn} =" not in mobile_js]
print("Mobile Onclicks Found:", len(m_onclicks), sorted(list(m_onclicks)))
print("Missing Mobile Functions:", missing_mobile)

print("\n=== 3. BACKEND TO AI MICROSERVICE BRIDGING AUDIT ===")
backend_assess = (root / "backend/src/routes/assessments.js").read_text(encoding="utf-8")
has_ai_forward = "8000" in backend_assess or "AI_SERVICE_URL" in backend_assess
has_hash_check = "duplicate" in backend_assess.lower() or "already exists" in backend_assess.lower()
print("Backend -> AI Microservice HTTP forwarding implemented:", has_ai_forward)
print("Backend SHA-256 duplicate video detection implemented:", has_hash_check)

print("\n=== 4. DATABASE INTEGRITY AUDIT ===")
db_js = (root / "backend/src/db/index.js").read_text(encoding="utf-8")
print("Does db have createShortlist method?", "createShortlist" in db_js)
print("Does db have getAssessmentVideosBySha256 method?", "getAssessmentVideoBySha256" in db_js or "videoSha256" in db_js)

print("\n=== 5. AI COMPUTER VISION PIPELINE AUDIT ===")
ai_routes = (root / "ai-service/app/api/routes.py").read_text(encoding="utf-8")
print("Does AI service handle video open error gracefully?", "cap.isOpened" in ai_routes)
print("Does AI service have synthetic response fallback?", "_generate_synthetic_assessment_response" in ai_routes)
