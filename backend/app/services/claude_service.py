"""
claude_service.py
All LLM calls go through here. Switched to Groq — same interface, faster, free.
"""

import json
from groq import Groq
from app.config import get_settings

settings = get_settings()
_client = Groq(api_key=settings.groq_api_key)

# llama-3.3-70b hits the sweet spot — smart enough for structured outputs, fast
_MODEL = "llama-3.3-70b-versatile"


def _chat(system: str, user: str, max_tokens: int = 1024) -> str:
    resp = _client.chat.completions.create(
        model=_MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]
    )
    return resp.choices[0].message.content


def _to_json(text: str) -> dict:
    # model sometimes wraps output in ```json ... ``` even when told not to
    s = text.strip()
    if s.startswith("```"):
        s = s.split("\n", 1)[1].rsplit("```", 1)[0]
    return json.loads(s.strip())


def parse_event(description: str) -> dict:
    # maps raw user input to structured event
    # primary_node_id must match knowledge_graph.json or ripple engine breaks
    valid_nodes = (
        "TWN,CHN,USA,DEU,JPN,KOR,IND,RUS,UKR,SAU,IRN,ARE,MYS,VNM,THA,"
        "IDN,BRA,MEX,CAN,AUS,ZAF,EGY,NLD,GBR,FRA,SEMI,AUTO,PHARMA,ENERGY,"
        "FOOD,STEEL,CHEM,TEXTILE,ELEC,AERO,SHIP,RETAIL,FINANCE,TELECOM,"
        "CONSTRUCT,OIL,GAS,WHEAT,CORN,SILICON,LITHI,COPPER,RARE,ALUM,"
        "SOYA,COTTON,TR_SUEZ,TR_MALACCA,TR_HORMUZ,TR_PANAMA,TR_BOSPHORUS,TR_SOUTHCHINA"
    )

    system = (
        "You are a supply chain risk analyst. "
        "Return ONLY valid JSON, no markdown, no explanation."
    )

    user = f"""Event: "{description}"

Return this exact JSON shape:
{{
  "event_summary": "one sentence",
  "origin_region": "country or region",
  "affected_commodity": "primary commodity or sector",
  "severity": <0.0 to 1.0>,
  "kairos_score": <0 to 100>,
  "event_type": "<production_shock|geopolitical|natural_disaster|financial|pandemic|infrastructure|trade_policy>",
  "primary_node_id": "<pick the single best match from: {valid_nodes}>"
}}

Scoring: 0-30 minor, 31-50 moderate, 51-70 serious, 71-85 critical, 86-100 catastrophic."""

    return _to_json(_chat(system, user, max_tokens=400))


def narrate_ripple(event: str, hops: list[dict], score: int) -> dict:
    # called after ripple engine runs — we have the data, just need the brief
    hop_lines = "\n".join(
        f"  hop {h['hop']}: {h['node_label']} / {h['region']} — {h['impact']} in {h['time_to_impact']}"
        for h in hops[:6]
    )

    system = (
        "You are a geopolitical risk analyst. "
        "Be direct and specific. No filler sentences. "
        "Return ONLY valid JSON."
    )

    user = f"""Event: "{event}"
Score: {score}/100

Cascade:
{hop_lines}

Return:
{{
  "crisis_narrative": "3-4 sentences, boardroom level, lead with the worst outcome first",
  "recommended_actions": ["action 1", "action 2", "action 3", "action 4"],
  "similar_historical_events": ["past event 1", "past event 2"]
}}"""

    return _to_json(_chat(system, user, max_tokens=600))


def cluster_news(articles: list[dict]) -> dict:
    # groups headlines into risk themes
    # velocity = signals/hour, tells us if something is accelerating
    lines = "\n".join(
        f"- [{a.get('source', {}).get('name', '?')}] {a.get('title', '')} | {a.get('publishedAt', '')}"
        for a in articles[:40]
    )

    system = (
        "You are a global risk analyst scanning for emerging crisis patterns. "
        "Find weak signals that individually look minor but together suggest systemic risk. "
        "Return ONLY valid JSON."
    )

    user = f"""Headlines:
{lines}

Group into risk clusters. Return:
{{
  "clusters": [
    {{
      "cluster_id": "snake_case_id",
      "theme": "short risk theme",
      "kairos_score": <0-100>,
      "risk_status": "<monitoring|elevated|critical|catastrophic>",
      "primary_regions": ["region"],
      "primary_commodities": ["commodity"],
      "possible_outcome": "one sentence worst case",
      "signal_indices": [<indices of matching headlines, 0-based>]
    }}
  ],
  "kairos_index": <0-100 overall global risk score right now>,
  "index_reasoning": "one sentence explaining the score"
}}

Only create a cluster if 2+ headlines point to the same underlying risk."""

    return _to_json(_chat(system, user, max_tokens=1200))


def generate_report(event: str, ripple: dict, score: int) -> str:
    # returns markdown — reportlab converts it to PDF downstream
    system = (
        "You are a senior risk analyst writing an executive crisis brief. "
        "Write in clear professional prose. Use markdown formatting."
    )

    blast = ripple.get("sector_blast_radius", {})
    blast_lines = "\n".join(f"- {k}: {v}" for k, v in blast.items())

    user = f"""Write a crisis intelligence brief for:

Event: {event}
Kairos Score: {score}/100
Sectors affected:
{blast_lines}

Structure:
# KAIROS Crisis Brief
## Executive Summary
## What Happened
## Cascade Analysis
## Sector Impact
## Recommended Actions
## Risk Outlook

Keep it under 600 words. Be specific, not generic."""

    return _chat(system, user, max_tokens=1500)