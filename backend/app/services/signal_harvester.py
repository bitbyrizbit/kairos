"""
signal_harvester.py
Pulls news from NewsAPI, scores relevance, feeds into claude_service for clustering.
Keeping a simple in-memory cache so we're not hammering the API on every request.
"""

import uuid
import httpx
from datetime import datetime, timezone
from app.config import get_settings
from app.services import claude_service

settings = get_settings()

# -- in-memory cache --
_cache: dict = {
    "articles": [],
    "clusters": [],
    "kairos_index": 32,
    "last_fetched": None,
}

_RELEVANCE_KEYWORDS = [
    "supply chain", "shortage", "sanctions", "conflict", "trade",
    "port", "shipping", "semiconductor", "oil", "gas", "wheat",
    "inflation", "factory", "manufacturing", "embargo", "tariff",
    "earthquake", "hurricane", "drought", "pandemic", "blockade",
    "export ban", "production cut", "strike", "logistics", "commodity"
]

_CATEGORIES = ["business", "general", "science", "technology"]


def _score_relevance(title: str, description: str) -> float:
    text = f"{title} {description}".lower()
    hits = sum(1 for kw in _RELEVANCE_KEYWORDS if kw in text)
    return min(hits / 5.0, 1.0)


def _is_stale() -> bool:
    if _cache["last_fetched"] is None:
        return True
    delta = (datetime.now(timezone.utc) - _cache["last_fetched"]).total_seconds()
    return delta > settings.news_fetch_interval_seconds


async def fetch_articles() -> list[dict]:
    if not _is_stale():
        return _cache["articles"]

    articles = []

    async with httpx.AsyncClient(timeout=10.0) as client:
        for category in _CATEGORIES:
            try:
                resp = await client.get(
                    "https://newsapi.org/v2/top-headlines",
                    params={
                        "apiKey": settings.news_api_key,
                        "category": category,
                        "language": "en",
                        "pageSize": 20,
                    }
                )
                if resp.status_code == 200:
                    articles.extend(resp.json().get("articles", []))
            except Exception:
                continue

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://newsapi.org/v2/everything",
                params={
                    "apiKey": settings.news_api_key,
                    "q": "supply chain OR semiconductor OR oil prices OR trade war OR shipping",
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": 30,
                }
            )
            if resp.status_code == 200:
                articles.extend(resp.json().get("articles", []))
    except Exception:
        pass

    # dedupe raw articles by title
    seen = set()
    unique = []
    for a in articles:
        title = (a.get("title") or "").strip().lower()
        if title and title not in seen:
            seen.add(title)
            unique.append(a)

    _cache["articles"] = unique[:settings.max_articles_per_fetch]
    _cache["last_fetched"] = datetime.now(timezone.utc)

    return _cache["articles"]


def _build_signal(article: dict, relevance: float) -> dict:
    return {
        "id": str(uuid.uuid4())[:8],
        "headline": article.get("title", ""),
        "source": article.get("source", {}).get("name", "Unknown"),
        "url": article.get("url", ""),
        "published_at": article.get("publishedAt", ""),
        "region": "Global",
        "category": "news",
        "relevance_score": round(relevance, 2),
        "signal_strength": round(relevance * 0.8, 2),
    }


async def get_signals() -> dict:
    articles = await fetch_articles()

    relevant = [
        a for a in articles
        if _score_relevance(
            a.get("title", ""),
            a.get("description", "")
        ) > 0.1
    ]

    if not relevant:
        return _build_empty_response()

    try:
        cluster_result = claude_service.cluster_news(relevant)
    except Exception:
        return _build_empty_response()

    raw_clusters = cluster_result.get("clusters", [])
    new_kairos = cluster_result.get("kairos_index", _cache["kairos_index"])

    old_index = _cache["kairos_index"]
    _cache["kairos_index"] = new_kairos

    built_clusters = []

    for rc in raw_clusters:
        indices = rc.get("signal_indices", [])
        cluster_articles = [relevant[i] for i in indices if i < len(relevant)]

        signals = [
            _build_signal(a, _score_relevance(a.get("title", ""), a.get("description", "")))
            for a in cluster_articles
        ]

        # 🔥 deduplicate signals by normalized headline
        seen_headlines = set()
        unique_signals = []

        for s in signals:
            headline = (s.get("headline") or "").strip().lower()
            if headline and headline not in seen_headlines:
                seen_headlines.add(headline)
                unique_signals.append(s)

        signals = unique_signals

        signal_count = len(signals)
        velocity = round(signal_count / max(1, 6), 2)

        built_clusters.append({
            "cluster_id": rc.get("cluster_id", str(uuid.uuid4())[:8]),
            "theme": rc.get("theme", "Unknown Risk"),
            "signal_count": signal_count,
            "signals": signals,
            "kairos_score": rc.get("kairos_score", 30),
            "risk_status": rc.get("risk_status", "monitoring"),
            "velocity": velocity,
            "primary_regions": rc.get("primary_regions", ["Global"]),
            "primary_commodities": rc.get("primary_commodities", []),
            "first_detected": datetime.now(timezone.utc).isoformat(),
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "possible_outcome": rc.get("possible_outcome", ""),
        })

    _cache["clusters"] = built_clusters

    return {
        "clusters": built_clusters,
        "kairos_index": {
            "index_value": new_kairos,
            "status": _index_to_status(new_kairos),
            "active_clusters": len(built_clusters),
            "active_ripples": 0,
            "highest_risk_region": _top_region(built_clusters),
            "highest_risk_commodity": _top_commodity(built_clusters),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "delta_1h": new_kairos - old_index,
            "delta_24h": 0,
        },
        "total_signals_processed": len(relevant),
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


def _index_to_status(val: int) -> str:
    if val >= settings.catastrophic_threshold:
        return "catastrophic"
    elif val >= settings.critical_threshold:
        return "critical"
    elif val >= settings.elevated_threshold:
        return "elevated"
    return "monitoring"


def _top_region(clusters: list[dict]) -> str:
    counts: dict[str, int] = {}
    for c in clusters:
        for r in c.get("primary_regions", []):
            counts[r] = counts.get(r, 0) + 1
    return max(counts, key=counts.get) if counts else "Global"


def _top_commodity(clusters: list[dict]) -> str:
    counts: dict[str, int] = {}
    for c in clusters:
        for cm in c.get("primary_commodities", []):
            counts[cm] = counts.get(cm, 0) + 1
    return max(counts, key=counts.get) if counts else "Mixed"


def _build_empty_response() -> dict:
    return {
        "clusters": [],
        "kairos_index": {
            "index_value": _cache["kairos_index"],
            "status": _index_to_status(_cache["kairos_index"]),
            "active_clusters": 0,
            "active_ripples": 0,
            "highest_risk_region": "Global",
            "highest_risk_commodity": "Mixed",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "delta_1h": 0,
            "delta_24h": 0,
        },
        "total_signals_processed": 0,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }