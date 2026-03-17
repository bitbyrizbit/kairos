"""
simulate.py
What-If simulator — same pipeline as /analyze but flagged as hypothetical.
Kept separate so we can tune it differently later if needed.
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import SimulateRequest, SimulateResponse, RiskStatus
from app.services import claude_service, ripple_engine

router = APIRouter()


def _score_to_status(score: int) -> str:
    if score >= 80:
        return RiskStatus.CATASTROPHIC
    elif score >= 65:
        return RiskStatus.CRITICAL
    elif score >= 45:
        return RiskStatus.ELEVATED
    return RiskStatus.MONITORING


@router.post("/simulate", response_model=SimulateResponse)
async def simulate_event(req: SimulateRequest):
    try:
        parsed = claude_service.parse_event(req.description)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse event: {str(e)}")

    origin_node = parsed.get("primary_node_id", "SEMI")
    severity = parsed.get("severity", 0.5)

    try:
        ripple = ripple_engine.run_ripple(origin_node, severity, req.description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ripple engine failed: {str(e)}")

    try:
        narrative_data = claude_service.narrate_ripple(
            req.description,
            ripple["hops"],
            parsed["kairos_score"]
        )
    except Exception:
        narrative_data = {
            "crisis_narrative": "Simulation complete. Review cascade data below.",
            "recommended_actions": [],
            "similar_historical_events": []
        }

    return SimulateResponse(
        parsed_event=parsed,
        ripple_chain=ripple,
        crisis_narrative=narrative_data.get("crisis_narrative", ""),
        kairos_score=parsed["kairos_score"],
        risk_status=_score_to_status(parsed["kairos_score"]),
        is_hypothetical=True,
        confidence_note="Based on historical supply chain dependency patterns.",
    )