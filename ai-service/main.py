from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as cv_router
from app.core.config import settings

app = FastAPI(
    title="AI-Assisted Sports Talent Discovery - Computer Vision Engine",
    description="FastAPI service for MediaPipe pose estimation, ArUco scale calibration, and biomechanical kinematics extraction.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cv_router, prefix="/api/v1/cv")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=False)
