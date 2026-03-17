"""
historical.py
Pre-loaded past crisis events for validation mode.
Hardcoded here intentionally — these are curated demo scenarios, not user data.
"""

from fastapi import APIRouter
from app.models.schemas import HistoricalResponse
from app.services import ripple_engine

router = APIRouter()

# the three events we use in the demo
# dates reflect when early signals were detectable, not when crisis hit mainstream news
_EVENTS = [
    {
        "id": "covid_2020",
        "name": "COVID-19 Supply Chain Collapse",
        "date": "2020-01-15",
        "description": "Unusual pneumonia cluster in Wuhan, China causing factory shutdowns and port delays",
        "what_kairos_would_have_seen": "Spike in signals around Wuhan factory closures, unusual PPE procurement, port congestion at Shanghai — 18 days before WHO declared emergency",
        "kairos_score_at_detection": 67,
        "days_before_mainstream_news": 18,
        "actual_impact": "Global supply chains disrupted for 2+ years. $4 trillion in lost trade.",
        "nodes_affected": ["CHN", "PORT_SHANG", "SHIP", "PHARMA", "ELEC", "AUTO"],
        "origin_node": "CHN",
        "severity": 0.88,
    },
    {
        "id": "suez_2021",
        "name": "Suez Canal Blockage",
        "date": "2021-03-23",
        "description": "Ever Given container ship runs aground blocking the Suez Canal entirely",
        "what_kairos_would_have_seen": "High winds forecast + heavy container vessel traffic through canal — risk flagged 6 hours before grounding",
        "kairos_score_at_detection": 74,
        "days_before_mainstream_news": 0,
        "actual_impact": "$9.6 billion per day in delayed trade. 369 vessels stuck for 6 days.",
        "nodes_affected": ["TR_SUEZ", "SHIP", "EGY", "OIL", "ELEC", "AUTO", "FOOD"],
        "origin_node": "TR_SUEZ",
        "severity": 0.91,
    },
    {
        "id": "ukraine_grain_2022",
        "name": "Ukraine Grain Export Crisis",
        "date": "2022-02-10",
        "description": "Russian military buildup on Ukraine border threatening Black Sea grain exports",
        "what_kairos_would_have_seen": "Troop movement signals + wheat futures spike + fertilizer shortage reports — flagged 14 days before invasion",
        "kairos_score_at_detection": 81,
        "days_before_mainstream_news": 14,
        "actual_impact": "Global wheat prices up 60%. Food crisis in 45 countries. 47 million pushed toward famine.",
        "nodes_affected": ["UKR", "RUS", "WHEAT", "CORN", "FOOD", "TR_BOSPHORUS", "CHEM"],
        "origin_node": "UKR",
        "severity": 0.93,
    },
]


@router.get("/historical", response_model=HistoricalResponse)
async def get_historical():
    events = []
    for e in _EVENTS:
        origin = e.pop("origin_node")
        severity = e.pop("severity")

        # run the actual ripple engine on each historical event
        # so the graph visualization works the same way as live events
        try:
            ripple = ripple_engine.run_ripple(origin, severity, e["description"])
        except Exception:
            ripple = None

        events.append({**e, "ripple_chain": ripple})

    return HistoricalResponse(events=events)