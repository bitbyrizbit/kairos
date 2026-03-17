"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Sidebar } from "@/components/layout/Sidebar"
import { Ticker } from "@/components/ui/Ticker"
import { KairosScorePanel } from "@/components/dashboard/KairosScorePanel"
import { SignalFeed } from "@/components/dashboard/SignalFeed"
import { CrisisTimeline } from "@/components/dashboard/CrisisTimeline"
import { RippleGraph } from "@/components/graph/RippleGraph"
import { WorldMap } from "@/components/graph/WorldMap"
import { SimulatorPanel } from "@/components/simulator/SimulatorPanel"
import { LoadingPulse, CardSkeleton } from "@/components/ui/LoadingPulse"
import { ScoreRing } from "@/components/ui/ScoreRing"
import { Badge } from "@/components/ui/Badge"
import { useSignals } from "@/hooks/useSignals"
import { useKairosScore } from "@/hooks/useKairosScore"
import { useRipple } from "@/hooks/useRipple"
import { api } from "@/lib/api"
import { scoreColor, formatDate } from "@/lib/utils"
import type { HistoricalEvent } from "@/types"

type View = "dashboard" | "simulator" | "historical" | "signals" | "report"

export default function Home() {
  const [view, setView] = useState<View>("dashboard")
  const { data: signals, loading: signalsLoading } = useSignals()
  const kairosIndex = useKairosScore(signals)
  const { data: ripple, loading: rippleLoading, analyze } = useRipple()

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", backgroundColor: "#080808" }}>
      <Navbar kairosIndex={kairosIndex} />
      <Ticker clusters={signals?.clusters ?? []} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar active={view} onChange={setView} />

        <div style={{ flex: 1, overflow: "hidden" }}>
          {view === "dashboard" && (
            <Dashboard
              signals={signals}
              signalsLoading={signalsLoading}
              kairosIndex={kairosIndex}
              ripple={ripple}
              rippleLoading={rippleLoading}
              onAnalyze={analyze}
            />
          )}
          {view === "simulator" && <SimulatorPanel mode="simulate" />}
          {view === "historical" && <HistoricalView />}
          {view === "signals" && <SignalsView signals={signals} loading={signalsLoading} />}
          {view === "report" && <SimulatorPanel mode="analyze" />}
        </div>
      </div>
    </div>
  )
}


// -- Dashboard view --

function Dashboard({ signals, signalsLoading, kairosIndex, ripple, rippleLoading, onAnalyze }: any) {
  const [query, setQuery] = useState("")

  const run = () => {
    const t = query.trim()
    if (!t || rippleLoading) return
    onAnalyze(t)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* analyze bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 16px", borderBottom: "1px solid #141414",
        backgroundColor: "#080808", flexShrink: 0,
      }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e",
          borderRadius: 5, padding: "0 12px", height: 34,
        }}>
          <span style={{ fontSize: 10, color: "#333", fontFamily: "monospace", marginRight: 8, flexShrink: 0 }}>EVENT:</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && run()}
            placeholder="Enter disruption event — e.g. Taiwan earthquake halts semiconductor production"
            style={{
              flex: 1, backgroundColor: "transparent", border: "none", outline: "none",
              fontSize: 12, color: "#ccc", fontFamily: "monospace",
            }}
          />
        </div>
        <button
          onClick={run}
          disabled={!query.trim() || rippleLoading}
          style={{
            padding: "0 16px", height: 34, borderRadius: 5, border: "none",
            fontSize: 11, fontWeight: 700, fontFamily: "monospace",
            cursor: !query.trim() || rippleLoading ? "not-allowed" : "pointer",
            backgroundColor: !query.trim() || rippleLoading ? "#141414" : "#f59e0b",
            color: !query.trim() || rippleLoading ? "#333" : "#000",
            transition: "all 0.15s", flexShrink: 0,
          }}
        >
          {rippleLoading ? "ANALYZING..." : "ANALYZE →"}
        </button>
      </div>

      {/* main content — fixed height grid */}
      <div style={{
        flex: 1, overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "240px 1fr 260px",
        gridTemplateRows: "1fr 1fr",
        gap: 8, padding: 8,
      }}>
        {/* col 1 — risk clusters (spans both rows) */}
        <div style={{ gridRow: "1 / 3", overflow: "hidden" }}>
          {signalsLoading
            ? <div style={{ height: "100%", backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8 }}><CardSkeleton rows={10} /></div>
            : <KairosScorePanel clusters={signals?.clusters ?? []} kairosIndex={kairosIndex} />
          }
        </div>

        {/* col 2 row 1 — ripple graph */}
        <div style={{ overflow: "hidden" }}>
          {rippleLoading
            ? <div style={{ height: "100%", backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LoadingPulse message="Tracing cascade..." />
              </div>
            : <RippleGraph ripple={ripple?.ripple_chain ?? null} isAnimating={!!ripple} />
          }
        </div>

        {/* col 3 row 1 — crisis timeline */}
        <div style={{ overflow: "hidden" }}>
          <CrisisTimeline
            ripple={ripple?.ripple_chain ?? null}
            event={ripple?.parsed_event?.event_summary ?? ""}
          />
        </div>

        {/* col 2 row 2 — world map */}
        <div style={{ overflow: "hidden" }}>
          <WorldMap ripple={ripple?.ripple_chain ?? null} clusters={signals?.clusters ?? []} />
        </div>

        {/* col 3 row 2 — signal feed */}
        <div style={{ overflow: "hidden" }}>
          {signalsLoading
            ? <div style={{ height: "100%", backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8 }}><CardSkeleton rows={8} /></div>
            : <SignalFeed clusters={signals?.clusters ?? []} lastUpdated={signals?.last_updated ?? ""} />
          }
        </div>
      </div>
    </div>
  )
}


// -- Historical view --

function HistoricalView() {
  const [events, setEvents] = useState<HistoricalEvent[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<HistoricalEvent | null>(null)

  useEffect(() => {
    api.historical().then(r => {
      setEvents(r.events)
      if (r.events.length) setSelected(r.events[0])
    }).catch(() => setEvents([])).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* list */}
      <div style={{ width: 260, flexShrink: 0, borderRight: "1px solid #141414", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #141414", flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#555", letterSpacing: "0.15em" }}>HISTORICAL VALIDATION</div>
          <div style={{ fontSize: 10, color: "#333", marginTop: 3 }}>Events KAIROS would have predicted</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && <CardSkeleton rows={6} />}
          {events?.map(e => (
            <button
              key={e.id}
              onClick={() => setSelected(e)}
              style={{
                width: "100%", textAlign: "left", padding: "12px 16px",
                backgroundColor: selected?.id === e.id ? "#0d0d0d" : "transparent",
                borderLeft: selected?.id === e.id ? "2px solid #f59e0b" : "2px solid transparent",
                borderBottom: "1px solid #0f0f0f", border: "none", cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#ccc", marginBottom: 4 }}>{e.name}</div>
              <div style={{ fontSize: 9, color: "#444", fontFamily: "monospace", marginBottom: 6 }}>{formatDate(e.date)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ScoreRing score={e.kairos_score_at_detection} size={28} showLabel={false} />
                <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "monospace" }}>
                  {e.days_before_mainstream_news}d early
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* detail */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {!selected ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 12, color: "#333" }}>Select an event</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 720, animation: "fade-up 0.3s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e0e0e0", marginBottom: 4 }}>{selected.name}</h2>
                <p style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>{formatDate(selected.date)}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <ScoreRing score={selected.kairos_score_at_detection} size={60} />
                <div>
                  <div style={{ fontSize: 10, color: "#444", marginBottom: 3 }}>Flagged</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#22c55e", fontFamily: "monospace" }}>
                    {selected.days_before_mainstream_news}d
                  </div>
                  <div style={{ fontSize: 9, color: "#444" }}>before news</div>
                </div>
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 6, backgroundColor: "#0a1a0a", border: "1px solid #22c55e22" }}>
              <div style={{ fontSize: 9, color: "#22c55e", letterSpacing: "0.15em", marginBottom: 8 }}>WHAT KAIROS DETECTED</div>
              <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>{selected.what_kairos_would_have_seen}</p>
            </div>

            <div style={{ padding: 14, borderRadius: 6, backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.15em", marginBottom: 8 }}>ACTUAL IMPACT</div>
              <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>{selected.actual_impact}</p>
            </div>

            {selected.ripple_chain && (
              <div style={{ height: 300 }}>
                <RippleGraph ripple={selected.ripple_chain} isAnimating={false} />
              </div>
            )}

            <div style={{ padding: 14, borderRadius: 6, backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.15em", marginBottom: 8 }}>NODES AFFECTED</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {selected.nodes_affected.map(n => (
                  <span key={n} style={{
                    padding: "3px 8px", borderRadius: 3, fontSize: 10,
                    fontFamily: "monospace", backgroundColor: "#141414",
                    border: "1px solid #1e1e1e", color: "#666",
                  }}>{n}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


// -- Signals view --

function SignalsView({ signals, loading }: any) {
  if (loading) return <div style={{ padding: 20 }}><LoadingPulse message="Fetching signals..." /></div>
  if (!signals) return null

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#e0e0e0", marginBottom: 4 }}>Global Signal Feed</h2>
          <p style={{ fontSize: 11, color: "#444" }}>
            {signals.total_signals_processed} signals processed · {signals.clusters.length} clusters
          </p>
        </div>
        <ScoreRing score={signals.kairos_index.index_value} size={54} />
      </div>

      <div style={{
        display: "grid", gap: 10,
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      }}>
        {signals.clusters.map((c: any) => {
          const color = scoreColor(c.kairos_score)
          return (
            <div key={c.cluster_id} style={{
              padding: 14, borderRadius: 6,
              backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a",
              borderLeft: `2px solid ${color}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#ddd", lineHeight: 1.3 }}>{c.theme}</p>
                <span style={{ fontSize: 18, fontWeight: 900, color, fontFamily: "monospace", flexShrink: 0 }}>{c.kairos_score}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                <Badge label={c.risk_status} type="status" value={c.risk_status} size="sm" />
                {c.velocity > 0.5 && <span style={{ fontSize: 9, color: "#ef4444", fontFamily: "monospace" }}>↑ accelerating</span>}
                <span style={{ fontSize: 9, color: "#333", fontFamily: "monospace" }}>{c.signal_count} signals</span>
              </div>
              <p style={{ fontSize: 10, color: "#444", lineHeight: 1.4 }}>{c.possible_outcome}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {c.primary_regions.map((r: string) => (
                  <span key={r} style={{
                    fontSize: 9, padding: "2px 6px", borderRadius: 3,
                    backgroundColor: "#141414", border: "1px solid #1e1e1e", color: "#555",
                    fontFamily: "monospace",
                  }}>{r}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}