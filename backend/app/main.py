"""
main.py
FastAPI app entry point. Wires everything together.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routes import analyze, signals, simulate, historical, report

settings = get_settings()

app = FastAPI(
    title="KAIROS",
    description="Global Crisis Intelligence Platform",
    version=settings.app_version,
    docs_url="/docs" if not settings.is_production() else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api/v1")
app.include_router(signals.router, prefix="/api/v1")
app.include_router(simulate.router, prefix="/api/v1")
app.include_router(historical.router, prefix="/api/v1")
app.include_router(report.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "name": "KAIROS",
        "version": settings.app_version,
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.app_version}