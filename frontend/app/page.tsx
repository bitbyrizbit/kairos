"use client"

import { useState } from "react"
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
import { formatDate, scoreColor } from "@/lib/utils"
import { api } from "@/lib/api"
import type { HistoricalEvent } from "@/types"

type View = "dashboard" | "simulator" | "historical" | "signals" | "report"

export default function Home() {
  const [view, setView] = useState<View>("dashboard")
  const { data: signals, loading: signalsLoading } = useSignals()
  const kairosIndex = useKairosScore(signals)
  const { data: ripple, loading: rippleLoading, analyze } = useRipple()

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: "#050b18" }}>
      <Navbar kairosIndex={kairosIndex} />
      <Ticker clusters={signals?.clusters ?? []} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={view} onChange={setView} />

        <main className="flex-1 overflow-hidden">
          {view === "dashboard" && (
            <DashboardView
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
        </main>
      </div>
    </div>
  )
}


// -- Dashboard --

function DashboardView({ signals, signalsLoading, kairosIndex, ripple, rippleLoading, onAnalyze }: any) {
  const [query, setQuery] = useState("")

  const handleAnalyze = () => {
    if (!query.trim()) return
    onAnalyze(query.trim())
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* top — analyze bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid #0f1f35" }}
      >
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAnalyze()}
          placeholder="Enter a disruption event to analyze..."
          className="flex-1 bg-transparent text-sm font-mono outline-none"
          style={{ color: "#e2e8f0" }}
        />
        <button
          onClick={handleAnalyze}
          disabled={!query.trim() || rippleLoading}
          className="px-4 py-1.5 rounded text-xs font-mono font-semibold transition-all flex-shrink-0"
          style={{
            backgroundColor: !query.trim() || rippleLoading ? "#0f1f35" : "#f59e0b",
            color: !query.trim() || rippleLoading ? "#334155" : "#050b18",
          }}
        >
          {rippleLoading ? "Analyzing..." : "Analyze →"}
        </button>
      </div>

      {/* main grid */}
      <div className="flex-1 grid overflow-hidden p-3 gap-3" style={{
        gridTemplateColumns: "260px 1fr 260px",
        gridTemplateRows: "1fr 1fr",
      }}>
        {/* left col */}
        <div className="row-span-2 overflow-hidden">
          {signalsLoading
            ? <div className="card h-full"><CardSkeleton rows={8} /></div>
            : <KairosScorePanel clusters={signals?.clusters ?? []} kairosIndex={kairosIndex} />
          }
        </div>

        {/* center top — ripple graph */}
        <div className="overflow-hidden">
          {rippleLoading
            ? <div className="card h-full flex items-center justify-center"><LoadingPulse message="Tracing cascade..." /></div>
            : <RippleGraph ripple={ripple?.ripple_chain ?? null} isAnimating={!!ripple} />
          }
        </div>

        {/* right col top — crisis timeline */}
        <div className="overflow-hidden">
          <CrisisTimeline
            ripple={ripple?.ripple_chain ?? null}
            event={ripple?.parsed_event.event_summary ?? ""}
          />
        </div>

        {/* center bottom — world map */}
        <div className="overflow-hidden">
          <WorldMap
            ripple={ripple?.ripple_chain ?? null}
            clusters={signals?.clusters ?? []}
          />
        </div>

        {/* right col bottom — signal feed */}
        <div className="overflow-hidden">
          {signalsLoading
            ? <div className="card h-full"><CardSkeleton rows={6} /></div>
            : <SignalFeed
                clusters={signals?.clusters ?? []}
                lastUpdated={signals?.last_updated ?? ""}
              />
          }
        </div>
      </div>
    </div>
  )
}


// -- Historical --

function HistoricalView() {
  const [events, setEvents] = useState<HistoricalEvent[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<HistoricalEvent | null>(null)
  const [loaded, setLoaded] = useState(false)

  const load = async () => {
    if (loaded) return
    setLoading(true)
    try {
      const res = await api.historical()
      setEvents(res.events)
      setLoaded(true)
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  // load on mount
  useState(() => { load() })

  return (
    <div className="flex h-full overflow-hidden">
      {/* event list */}
      <div
        className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
        style={{ borderRight: "1px solid #0f1f35" }}
      >
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid #0f1f35" }}
        >
          <p className="text-xs font-mono font-semibold tracking-wider uppercase" style={{ color: "#94a3b8" }}>
            Historical Validation
          </p>
          <p className="text-[10px] font-mono mt-1" style={{ color: "#334155" }}>
            Events KAIROS would have predicted
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && <CardSkeleton rows={6} />}
          {events?.map(event => (
            <button
              key={event.id}
              onClick={() => setSelected(event)}
              className="w-full text-left px-4 py-3 card-hover"
              style={{
                borderBottom: "1px solid #0a1628",
                backgroundColor: selected?.id === event.id ? "#0a1628" : "transparent",
                borderLeft: selected?.id === event.id ? "2px solid #f59e0b" : "2px solid transparent",
              }}
            >
              <p className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>
                {event.name}
              </p>
              <p className="text-[10px] font-mono mt-1" style={{ color: "#475569" }}>
                {formatDate(event.date)}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <ScoreRing score={event.kairos_score_at_detection} size={28} showLabel={false} />
                <span
                  className="text-[10px] font-mono"
                  style={{ color: "#22c55e" }}
                >
                  {event.days_before_mainstream_news}d before news
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* event detail */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selected ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs font-mono" style={{ color: "#334155" }}>
              Select an event to see what KAIROS detected
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-fade-in max-w-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold" style={{ color: "#e2e8f0" }}>
                  {selected.name}
                </h2>
                <p className="text-xs font-mono mt-0.5" style={{ color: "#475569" }}>
                  {formatDate(selected.date)}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <ScoreRing score={selected.kairos_score_at_detection} size={56} />
                <div>
                  <p className="text-[10px] font-mono" style={{ color: "#475569" }}>
                    Kairos would have flagged this
                  </p>
                  <p
                    className="text-sm font-bold font-mono"
                    style={{ color: "#22c55e" }}
                  >
                    {selected.days_before_mainstream_news} days early
                  </p>
                </div>
              </div>
            </div>

            {/* what kairos saw */}
            <div
              className="card p-4"
              style={{ borderColor: "#22c55e33" }}
            >
              <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "#22c55e" }}>
                What KAIROS detected
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                {selected.what_kairos_would_have_seen}
              </p>
            </div>

            {/* actual impact */}
            <div className="card p-4">
              <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "#475569" }}>
                Actual Impact
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                {selected.actual_impact}
              </p>
            </div>

            {/* ripple graph if available */}
            {selected.ripple_chain && (
              <div style={{ height: 280 }}>
                <RippleGraph ripple={selected.ripple_chain} isAnimating={false} />
              </div>
            )}

            {/* affected nodes */}
            <div className="card p-4">
              <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "#475569" }}>
                Nodes Affected
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selected.nodes_affected.map(node => (
                  <span
                    key={node}
                    className="px-2 py-0.5 rounded text-[10px] font-mono"
                    style={{
                      backgroundColor: "#0a1628",
                      border: "1px solid #1e3a5f",
                      color: "#64748b",
                    }}
                  >
                    {node}
                  </span>
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
  if (loading) return <div className="p-4"><LoadingPulse message="Fetching signals..." /></div>
  if (!signals) return null

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>Global Signal Feed</h2>
          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
            {signals.total_signals_processed} signals processed · {signals.clusters.length} clusters detected
          </p>
        </div>
        <ScoreRing score={signals.kairos_index.index_value} size={52} />
      </div>

      <div className="flex-1 overflow-y-auto grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", alignContent: "start" }}
      >
        {signals.clusters.map((cluster: any) => (
          <div key={cluster.cluster_id} className="card p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>
                {cluster.theme}
              </p>
              <span
                className="text-sm font-black font-mono flex-shrink-0"
                style={{ color: scoreColor(cluster.kairos_score) }}
              >
                {cluster.kairos_score}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge label={cluster.risk_status} type="status" value={cluster.risk_status} size="sm" />
              {cluster.velocity > 0.5 && (
                <span className="text-[10px] font-mono text-red-400">↑ accelerating</span>
              )}
              <span className="text-[10px] font-mono" style={{ color: "#334155" }}>
                {cluster.signal_count} signals
              </span>
            </div>

            <p className="text-[10px] font-mono" style={{ color: "#475569" }}>
              {cluster.possible_outcome}
            </p>

            <div className="flex flex-wrap gap-1 mt-1">
              {cluster.primary_regions.map((r: string) => (
                <span key={r} className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "#0a1628", color: "#475569", border: "1px solid #0f1f35" }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}