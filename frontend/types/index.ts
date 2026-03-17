// all shared types across the frontend
// keeping them here so components don't import from each other

export type ImpactLevel = "low" | "medium" | "high" | "critical"
export type RiskStatus = "monitoring" | "elevated" | "critical" | "catastrophic"

export interface ParsedEvent {
  event_summary: string
  origin_region: string
  affected_commodity: string
  severity: number
  kairos_score: number
  event_type: string
  primary_node_id: string
}

export interface RippleHop {
  hop: number
  node_id: string
  node_label: string
  node_type: string
  sector: string
  region: string
  impact: ImpactLevel
  severity_score: number
  time_to_impact: string
  time_to_impact_days: number
  explanation: string
  affected_companies: string[]
}

export interface RippleChain {
  origin_event: string
  origin_node: string
  total_hops: number
  total_affected_nodes: number
  max_severity: number
  hops: RippleHop[]
  sector_blast_radius: Record<string, string>
  multi_crisis_detected: boolean
  compound_risk_factor: number
}

export interface AnalyzeResponse {
  parsed_event: ParsedEvent
  ripple_chain: RippleChain
  crisis_narrative: string
  kairos_score: number
  risk_status: RiskStatus
  recommended_actions: string[]
  similar_historical_events: string[]
}

export interface Signal {
  id: string
  headline: string
  source: string
  url: string
  published_at: string
  region: string
  category: string
  relevance_score: number
  signal_strength: number
}

export interface SignalCluster {
  cluster_id: string
  theme: string
  signal_count: number
  signals: Signal[]
  kairos_score: number
  risk_status: RiskStatus
  velocity: number
  primary_regions: string[]
  primary_commodities: string[]
  first_detected: string
  last_updated: string
  possible_outcome: string
}

export interface KairosIndex {
  index_value: number
  status: RiskStatus
  active_clusters: number
  active_ripples: number
  highest_risk_region: string
  highest_risk_commodity: string
  timestamp: string
  delta_1h: number
  delta_24h: number
}

export interface SignalsResponse {
  clusters: SignalCluster[]
  kairos_index: KairosIndex
  total_signals_processed: number
  last_updated: string
}

export interface HistoricalEvent {
  id: string
  name: string
  date: string
  description: string
  what_kairos_would_have_seen: string
  kairos_score_at_detection: number
  days_before_mainstream_news: number
  actual_impact: string
  nodes_affected: string[]
  ripple_chain: RippleChain | null
}