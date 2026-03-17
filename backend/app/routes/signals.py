"""
signals.py
Live signal feed endpoint — returns clustered news + kairos index.
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import SignalsResponse
from app.services import signal_harvester

router = APIRouter()


@router.get("/signals", response_model=SignalsResponse)
async def get_signals():
    try:
        data = await signal_harvester.get_signals()
        return SignalsResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))