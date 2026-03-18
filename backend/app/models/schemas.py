"""
schemas.py
Request/response models for the entire API.
Keeping everything typed strictly — learned this the hard way on a previous project.
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# -- Enums --

class ImpactLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RiskStatus(str, Enum):
    MONITORING = "monitoring"
    ELEVATED = "elevated"
    CRITICAL = "critical"
    CATASTROPHIC = "catastrophic"

class NodeType(str, Enum):
    COUNTRY = "country"
    INDUSTRY = "industry"
    COMMODITY = "commodity"
    PORT = "port"
    TRADE_ROUTE = "trade_route"
    COMPANY = "company"


# -- Requests --

class AnalyzeEventRequest(BaseModel):
    description: str = Field(
        ...,
        min_length=3,
        max_length=500,
        examples=["Taiwan semiconductor production drops 30% due to earthquake"]
    )

class SimulateRequest(BaseModel):
    description: str = Field(
        ...,
        min_length=3,
        max_length=500,
    )
    is_hypothetical: bool = True

class ReportRequest(BaseModel):
    event_description: str
    ripple_data: dict
    kairos_score: int


# -- Core Models --

class ParsedEvent(BaseModel):
    event_summary: str
    origin_region: str
    affected_commodity: str
    severity: float = Field(..., ge=0.0, le=1.0)
    kairos_score: int = Field(..., ge=0, le=100)
    # production_shock / geopolitical / natural_disaster / financial etc
    event_type: str
    # must map to a real node id in knowledge_graph.json
    primary_node_id: str


class RippleHop(BaseModel):
    hop: int
    node_id: str
    node_label: str
    node_type: str
    sector: str
    region: str
    impact: ImpactLevel
    severity_score: float = Field(..., ge=0.0, le=1.0)
    time_to_impact: str       # human readable e.g. "2 weeks"
    time_to_impact_days: int
    explanation: str
    affected_companies: list[str] = []


class RippleChain(BaseModel):
    origin_event: str
    origin_node: str
    total_hops: int
    total_affected_nodes: int
    max_severity: float
    hops: list[RippleHop]
    # which sectors get hit and how hard
    sector_blast_radius: dict[str, str]
    multi_crisis_detected: bool = False
    compound_risk_factor: float = 1.0


class Signal(BaseModel):
    id: str
    headline: str
    source: str
    url: str
    published_at: str
    region: str
    category: str
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    signal_strength: float = Field(..., ge=0.0, le=1.0)


class SignalCluster(BaseModel):
    cluster_id: str
    theme: str
    signal_count: int
    signals: list[Signal]
    kairos_score: int = Field(..., ge=0, le=100)
    risk_status: RiskStatus
    # signals per hour — if this spikes, something is brewing
    velocity: float
    primary_regions: list[str]
    primary_commodities: list[str]
    first_detected: str
    last_updated: str
    possible_outcome: str


class KairosIndexSnapshot(BaseModel):
    """Single number representing global supply chain stability right now."""
    index_value: int = Field(..., ge=0, le=100)
    status: RiskStatus
    active_clusters: int
    active_ripples: int
    highest_risk_region: str
    highest_risk_commodity: str
    timestamp: str
    delta_1h: int
    delta_24h: int


class HistoricalEvent(BaseModel):
    id: str
    name: str
    date: str
    description: str
    what_kairos_would_have_seen: str
    kairos_score_at_detection: int
    # this is the key stat for the demo
    days_before_mainstream_news: int
    actual_impact: str
    nodes_affected: list[str]
    ripple_chain: Optional[RippleChain] = None


# -- Responses --

class AnalyzeEventResponse(BaseModel):
    parsed_event: ParsedEvent
    ripple_chain: RippleChain
    crisis_narrative: str
    kairos_score: int
    risk_status: RiskStatus
    recommended_actions: list[str]
    similar_historical_events: list[str]


class SignalsResponse(BaseModel):
    clusters: list[SignalCluster]
    kairos_index: KairosIndexSnapshot
    total_signals_processed: int
    last_updated: str


class HistoricalResponse(BaseModel):
    events: list[HistoricalEvent]


class SimulateResponse(BaseModel):
    parsed_event: ParsedEvent
    ripple_chain: RippleChain
    crisis_narrative: str
    kairos_score: int
    risk_status: RiskStatus
    is_hypothetical: bool = True
    confidence_note: str


class HealthResponse(BaseModel):
    status: str
    version: str
    kairos_index: Optional[int] = None