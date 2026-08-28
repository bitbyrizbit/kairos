"use client"

import { useState } from "react"
import { WorldMap } from "@/components/graph/WorldMap"
import { Ticker } from "@/components/ui/Ticker"
import { KairosScorePanel } from "@/components/dashboard/KairosScorePanel"
import { SignalFeed } from "@/components/dashboard/SignalFeed"
import { CrisisTimeline } from "@/components/dashboard/CrisisTimeline"
import { RippleGraph } from "@/components/graph/RippleGraph"
import { SimulatorPanel } from "@/components/simulator/SimulatorPanel"
import { LoadingPulse } from "@/components/ui/LoadingPulse"
import { useSignals } from "@/hooks/useSignals"
import { useKairosScore } from "@/hooks/useKairosScore"
import { useRipple } from "@/hooks/useRipple"

type View = "dashboard" | "simulator" | "historical" | "signals" | "report"

export default function Home() {
  const [view, setView] = useState<View>("dashboard")
  const { data: signals, loading: signalsLoading } = useSignals()
  const kairosIndex = useKairosScore(signals)
  const { data: ripple, loading: rippleLoading, analyze } = useRipple()

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "var(--bg)" }}>
      {/* Layer 0: World Map Background */}
      <WorldMap ripple={ripple?.ripple_chain ?? null} clusters={signals?.clusters ?? []} />
      
      {/* Scanline overlay for tactical feel */}
      <div className="scanline-overlay" />

      {/* Layer 1: Top HUD (Replaces standard Navbar) */}
      <div style={{
        position: "absolute", top: 20, left: 20, right: 20, zIndex: 10,
        display: "flex", justifyContent: "space-between", pointerEvents: "none"
      }}>
        {/* Left Side: Identity */}
        <div className="panel-tactical" style={{ padding: "12px 24px", pointerEvents: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div className="pulse-dot" style={{ width: 12, height: 12, backgroundColor: "var(--red)" }} />
          <h1 style={{ fontFamily: "var(--font-header)", fontWeight: 700, fontSize: 24, letterSpacing: "0.1em", margin: 0, color: "var(--text1)" }}>
            KAIROS
          </h1>
          <span style={{ fontFamily: "var(--font-mono-data)", color: "var(--cyan)", fontSize: 12, letterSpacing: "0.15em" }}>
            NEXUS TERMINAL
          </span>
        </div>

        {/* Center: Command Input */}
        <div className="panel-tactical" style={{ pointerEvents: "auto", display: "flex", alignItems: "center", padding: "4px 16px", minWidth: 400 }}>
          <CommandInput onAnalyze={analyze} isLoading={rippleLoading} />
        </div>

        {/* Right Side: Foresight Index */}
        <div className="panel-tactical" style={{ padding: "12px 24px", pointerEvents: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontFamily: "var(--font-mono-data)", fontSize: 10, color: "var(--text2)", letterSpacing: "0.1em" }}>FORESIGHT INDEX™</span>
            <span style={{ fontFamily: "var(--font-mono-data)", fontSize: 28, fontWeight: 700, color: "var(--amber)", lineHeight: 1 }}>
              {kairosIndex?.index_value ?? "--"}
            </span>
          </div>
        </div>
      </div>

      {/* Layer 2: Main Tactical View */}
      <div style={{ position: "absolute", inset: "100px 20px 100px 20px", zIndex: 5, display: "flex", gap: 20, pointerEvents: "none" }}>
        
        {/* Left HUD Panel */}
        <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 20, pointerEvents: "auto" }}>
          {(view === "dashboard" || view === "simulator" || view === "report") && (
            <div className="panel-tactical fade-up" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <KairosScorePanel clusters={signals?.clusters ?? []} kairosIndex={kairosIndex} />
            </div>
          )}
        </div>

        {/* Center Canvas for Ripple/Simulator/Historical/Signals */}
        <div style={{ flex: 1, position: "relative", pointerEvents: "auto", display: "flex", justifyContent: "center", alignItems: "center" }}>
          {view === "dashboard" && (ripple || rippleLoading) && (
            <div className="panel-tactical fade-up" style={{ width: "100%", height: "100%", position: "relative" }}>
              {rippleLoading ? (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
                  <LoadingPulse message="Running Cascade Simulation..." />
                </div>
              ) : (
                <RippleGraph ripple={ripple?.ripple_chain ?? null} isAnimating={!!ripple} />
              )}
            </div>
          )}
          {view === "simulator" && (
            <div className="panel-tactical fade-up" style={{ width: "100%", height: "100%", overflow: "hidden" }}>
              <SimulatorPanel mode="simulate" />
            </div>
          )}
          {view === "historical" && (
            <div className="panel-tactical fade-up" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: "var(--font-mono-data)", color: "var(--text3)", fontSize: 14 }}>ACCESSING ARCHIVES... (IMPLEMENTING)</div>
            </div>
          )}
          {view === "signals" && (
            <div className="panel-tactical fade-up" style={{ width: "100%", height: "100%", overflow: "hidden" }}>
               <SignalFeed clusters={signals?.clusters ?? []} lastUpdated={signals?.last_updated ?? ""} />
            </div>
          )}
        </div>

        {/* Right HUD Panel */}
        <div style={{ width: 360, display: "flex", flexDirection: "column", gap: 20, pointerEvents: "auto" }}>
          {view === "dashboard" && ripple && (
            <div className="panel-tactical fade-up" style={{ height: "45%", overflow: "hidden" }}>
              <CrisisTimeline ripple={ripple?.ripple_chain ?? null} event={ripple?.parsed_event?.event_summary ?? ""} />
            </div>
          )}
          {view === "dashboard" && !ripple && (
            <div className="panel-tactical fade-up" style={{ height: "45%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--font-mono-data)" }}>AWAITING TIMELINE</span>
            </div>
          )}
          {view === "dashboard" && (
            <div className="panel-tactical fade-up" style={{ flex: 1, overflow: "hidden" }}>
              <SignalFeed clusters={signals?.clusters ?? []} lastUpdated={signals?.last_updated ?? ""} />
            </div>
          )}
        </div>

      </div>

      {/* Layer 3: Bottom Ticker and Orbital Nav */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, display: "flex", pointerEvents: "none", alignItems: "flex-end", padding: 20 }}>
        <div style={{ flex: 1, pointerEvents: "auto", marginRight: 20 }}>
          <div className="panel-tactical-bottom" style={{ overflow: "hidden" }}>
            <Ticker clusters={signals?.clusters ?? []} />
          </div>
        </div>
        
        {/* Orbital Navigation Module */}
        <div className="panel-tactical-bottom" style={{ pointerEvents: "auto", padding: "10px 20px", display: "flex", gap: 16 }}>
          <NavButton active={view === "dashboard"} onClick={() => setView("dashboard")} label="DASHBOARD" />
          <NavButton active={view === "simulator"} onClick={() => setView("simulator")} label="SIMULATOR" />
          <NavButton active={view === "historical"} onClick={() => setView("historical")} label="HISTORICAL" />
          <NavButton active={view === "signals"} onClick={() => setView("signals")} label="SIGNALS" />
        </div>
      </div>
    </div>
  )
}

function CommandInput({ onAnalyze, isLoading }: { onAnalyze: (t: string) => void, isLoading: boolean }) {
  const [query, setQuery] = useState("")
  
  return (
    <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
      <span style={{ color: "var(--cyan)", fontFamily: "var(--font-mono-data)", fontSize: 14, marginRight: 12 }}>{">"}</span>
      <input 
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && query.trim() && !isLoading && onAnalyze(query)}
        placeholder="INPUT SCENARIO PARAMETERS..."
        style={{
          flex: 1, background: "transparent", border: "none", outline: "none",
          color: "var(--text1)", fontFamily: "var(--font-mono-data)", fontSize: 13, letterSpacing: "0.05em"
        }}
      />
      <button 
        className="panel-tactical-btn"
        onClick={() => query.trim() && !isLoading && onAnalyze(query)}
        style={{
          background: isLoading ? "var(--bg3)" : "var(--red)", border: "none", color: isLoading ? "var(--text2)" : "#000",
          padding: "6px 16px", fontFamily: "var(--font-mono-data)", fontWeight: 700, fontSize: 11,
          cursor: isLoading ? "not-allowed" : "pointer", transition: "all 0.2s"
        }}
      >
        {isLoading ? "PROCESSING" : "EXECUTE"}
      </button>
    </div>
  )
}

function NavButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      style={{
        background: "transparent", border: "none", color: active ? "var(--cyan)" : "var(--text2)",
        fontFamily: "var(--font-mono-data)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
        cursor: "pointer", position: "relative", padding: "8px 4px"
      }}
    >
      {label}
      {active && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "var(--cyan)", boxShadow: "0 0 8px var(--cyan)" }} />
      )}
    </button>
  )
}