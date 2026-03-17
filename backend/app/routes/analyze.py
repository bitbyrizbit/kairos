"""
analyze.py
Main event analysis endpoint — takes a disruption event, runs it through
the ripple engine, gets a narrative from the LLM, returns the full picture.
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeEventRequest, AnalyzeEventResponse, RiskStatus
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


@router.post("/analyze", response_model=AnalyzeEventResponse)
async def analyze_event(req: AnalyzeEventRequest):
    # step 1 — parse the event into structured data
    try:
        parsed = claude_service.parse_event(req.description)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse event: {str(e)}")

    severity = parsed.get("severity", 0.5)
    origin_node = parsed.get("primary_node_id", "SEMI")

    # step 2 — run the ripple engine
    try:
        ripple = ripple_engine.run_ripple(origin_node, severity, req.description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ripple engine failed: {str(e)}")

    # step 3 — generate narrative + recommendations
    try:
        narrative_data = claude_service.narrate_ripple(
            req.description,
            ripple["hops"],
            parsed["kairos_score"]
        )
    except Exception as e:
        # narrative failure shouldn't kill the whole response
        narrative_data = {
            "crisis_narrative": "Analysis complete. Review cascade data for details.",
            "recommended_actions": ["Monitor situation closely"],
            "similar_historical_events": []
        }

    return AnalyzeEventResponse(
        parsed_event=parsed,
        ripple_chain=ripple,
        crisis_narrative=narrative_data.get("crisis_narrative", ""),
        kairos_score=parsed["kairos_score"],
        risk_status=_score_to_status(parsed["kairos_score"]),
        recommended_actions=narrative_data.get("recommended_actions", []),
        similar_historical_events=narrative_data.get("similar_historical_events", []),
    )