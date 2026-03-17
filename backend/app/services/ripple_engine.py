"""
ripple_engine.py
BFS traversal through the supply chain graph starting from a disruption node.
Severity decays each hop — otherwise everything ends up "critical" which is useless.
"""

import json
import networkx as nx
from pathlib import Path
from app.config import get_settings

settings = get_settings()

# -- graph loading --

_GRAPH_PATH = Path(__file__).parent.parent / "data" / "knowledge_graph.json"
_graph_cache = None


def _load_graph() -> nx.DiGraph:
    global _graph_cache
    if _graph_cache is not None:
        return _graph_cache

    with open(_GRAPH_PATH) as f:
        data = json.load(f)

    G = nx.DiGraph()

    for node in data["nodes"]:
        G.add_node(
            node["id"],
            label=node["label"],
            type=node["type"],
            region=node.get("region", "Global"),
            risk_weight=node.get("risk_weight", 0.5),
        )

    for edge in data["edges"]:
        G.add_edge(
            edge["source"],
            edge["target"],
            weight=edge["weight"],
            edge_type=edge["type"],
            label=edge.get("label", ""),
        )

    _graph_cache = G
    return G


def _get_ripple_rules() -> dict:
    with open(_GRAPH_PATH) as f:
        data = json.load(f)
    return data.get("ripple_rules", {})


# -- impact scoring --

def _severity_to_impact(score: float) -> str:
    if score >= 0.75:
        return "critical"
    elif score >= 0.50:
        return "high"
    elif score >= 0.25:
        return "medium"
    else:
        return "low"


def _days_to_readable(days: int) -> str:
    if days < 7:
        return f"{days} days"
    elif days < 30:
        weeks = days // 7
        return f"{weeks} week{'s' if weeks > 1 else ''}"
    else:
        months = days // 30
        return f"{months} month{'s' if months > 1 else ''}"


def _get_affected_companies(G: nx.DiGraph, node_id: str) -> list[str]:
    # look for company nodes that have an edge to/from this node
    companies = []
    for neighbor in list(G.predecessors(node_id)) + list(G.successors(node_id)):
        if G.nodes[neighbor].get("type") == "company":
            companies.append(G.nodes[neighbor]["label"])
    return companies[:4]  # cap at 4, more than that clutters the UI


# -- sector blast radius --

def _compute_blast_radius(hops: list[dict]) -> dict[str, str]:
    sector_hits: dict[str, float] = {}
    for hop in hops:
        sector = hop.get("sector", hop.get("node_label", "Unknown"))
        current = sector_hits.get(sector, 0.0)
        # take the worst score we saw for this sector
        sector_hits[sector] = max(current, hop["severity_score"])

    return {
        sector: _severity_to_impact(score)
        for sector, score in sorted(sector_hits.items(), key=lambda x: x[1], reverse=True)
    }


# -- multi crisis detection --

def check_multi_crisis(active_node_ids: list[str]) -> tuple[bool, float]:
    """
    If two separate origin nodes both have active ripples and their affected
    sets overlap significantly, we flag it as a compound crisis.
    Compound factor from config amplifies the severity across shared nodes.
    """
    if len(active_node_ids) < 2:
        return False, 1.0

    G = _load_graph()
    affected_sets = []
    for origin in active_node_ids:
        if origin not in G:
            continue
        reachable = set(nx.descendants(G, origin))
        affected_sets.append(reachable)

    if len(affected_sets) < 2:
        return False, 1.0

    overlap = affected_sets[0].intersection(affected_sets[1])
    overlap_ratio = len(overlap) / max(len(affected_sets[0]), 1)

    if overlap_ratio > 0.3:
        return True, settings.compound_crisis_factor

    return False, 1.0


# -- main ripple function --

def run_ripple(origin_node_id: str, initial_severity: float, event_description: str) -> dict:
    G = _load_graph()
    rules = _get_ripple_rules()

    decay = rules.get("severity_decay_per_hop", settings.severity_decay)
    min_thresh = rules.get("min_severity_threshold", settings.min_severity_threshold)
    max_hops = rules.get("max_hops", settings.max_ripple_hops)
    time_mult = rules.get("time_multiplier_per_hop_days", 14)

    if origin_node_id not in G:
        # fallback — if LLM picked a node that somehow isn't in the graph
        origin_node_id = "SEMI"

    visited = set()
    hops = []
    queue = [(origin_node_id, initial_severity, 0)]

    while queue:
        node_id, severity, depth = queue.pop(0)

        if depth > max_hops or severity < min_thresh or node_id in visited:
            continue

        visited.add(node_id)

        if depth == 0:
            # skip the origin itself, it's already shown in the event summary
            for neighbor in G.successors(node_id):
                edge_data = G.edges[node_id, neighbor]
                edge_weight = edge_data.get("weight", 0.5)
                next_severity = severity * (1 - decay) * edge_weight
                queue.append((neighbor, next_severity, depth + 1))
            continue

        node_data = G.nodes[node_id]
        node_risk = node_data.get("risk_weight", 0.5)

        # nodes with higher risk weight amplify incoming severity slightly
        adjusted_severity = min(severity * (1 + (node_risk - 0.5) * 0.2), 1.0)
        time_days = depth * time_mult

        hop = {
            "hop": depth,
            "node_id": node_id,
            "node_label": node_data.get("label", node_id),
            "node_type": node_data.get("type", "unknown"),
            "sector": node_data.get("label", node_id),
            "region": node_data.get("region", "Global"),
            "impact": _severity_to_impact(adjusted_severity),
            "severity_score": round(adjusted_severity, 3),
            "time_to_impact": _days_to_readable(time_days),
            "time_to_impact_days": time_days,
            "explanation": f"{node_data.get('label', node_id)} affected via supply chain cascade from origin event",
            "affected_companies": _get_affected_companies(G, node_id),
        }
        hops.append(hop)

        for neighbor in G.successors(node_id):
            if neighbor not in visited:
                edge_data = G.edges[node_id, neighbor]
                edge_weight = edge_data.get("weight", 0.5)
                next_severity = adjusted_severity * (1 - decay) * edge_weight
                queue.append((neighbor, next_severity, depth + 1))

    # sort by severity so the worst hits appear first
    hops.sort(key=lambda h: h["severity_score"], reverse=True)

    return {
        "origin_event": event_description,
        "origin_node": origin_node_id,
        "total_hops": len(hops),
        "total_affected_nodes": len(visited) - 1,
        "max_severity": round(max((h["severity_score"] for h in hops), default=0.0), 3),
        "hops": hops,
        "sector_blast_radius": _compute_blast_radius(hops),
        "multi_crisis_detected": False,
        "compound_risk_factor": 1.0,
    }