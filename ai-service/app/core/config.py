import os

class Settings:
    PORT: int = int(os.getenv("PORT", 8000))
    STORAGE_DIR: str = os.path.abspath(os.getenv("STORAGE_DIR", "../backend/uploads"))
    BACKEND_WEBHOOK_URL: str = os.getenv("BACKEND_WEBHOOK_URL", "http://localhost:4000/api/v1/assessments/webhook/ai-completed")
    MIN_CONFIDENCE_THRESHOLD: float = float(os.getenv("MIN_CONFIDENCE_THRESHOLD", 0.70))

settings = Settings()
