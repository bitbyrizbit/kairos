"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { WorldMap } from "@/components/graph/WorldMap"
import { KairosScorePanel } from "@/components/dashboard/KairosScorePanel"
import { SignalFeed } from "@/components/dashboard/SignalFeed"
import { CrisisTimeline } from "@/components/dashboard/CrisisTimeline"
import { RippleGraph } from "@/components/graph/RippleGraph"
import { SimulatorPanel } from "@/components/simulator/SimulatorPanel"
import { LoadingPulse } from "@/components/ui/LoadingPulse"
import { useSignals } from "@/hooks/useSignals"
import { useKairosScore } from "@/hooks/useKairosScore"
import { useRipple } from "@/hooks/useRipple"

type View = "dashboard" | "simulator" | "signals" | "historical"

export default function Home() {
  const [view, setView] = useState<View>("dashboard")
  const { data: signals, loading: signalsLoading } = useSignals()
  const kairosIndex = useKairosScore(signals)
  const { data: ripple, loading: rippleLoading, analyze } = useRipple()
  
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "var(--bg)" }}>
      {/* Background Layer: Map */}
      <WorldMap ripple={ripple?.ripple_chain ?? null} clusters={signals?.clusters ?? []} />
      
      {/* Top Left: Minimal Logo */}
      <div style={{ position: "absolute", top: 40, left: 40, zIndex: 10 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontStyle: "italic", fontWeight: 400, color: "var(--ink)", letterSpacing: "-0.02em", margin: 0 }}>
          Kairos
        </h1>
        <div style={{ fontSize: 11, fontFamily: "var(--font-sans)", color: "var(--ink-light)", letterSpacing: "0.05em", marginTop: 4 }}>
          Global intelligence
        </div>
      </div>

      {/* Main Content Areas */}
      <div style={{ position: "absolute", inset: "40px 40px 40px 320px", display: "flex", gap: 40, zIndex: 5, pointerEvents: "none" }}>
        
        {/* Left Side: Dynamic Module based on View */}
        <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 40, pointerEvents: "auto" }}>
          {view === "dashboard" && (
            <div className="editorial-panel fade-in" style={{ flex: 1, overflow: "hidden" }}>
              <KairosScorePanel clusters={signals?.clusters ?? []} kairosIndex={kairosIndex} />
            </div>
          )}
          {view === "signals" && (
            <div className="editorial-panel fade-in" style={{ flex: 1, overflow: "hidden" }}>
               <SignalFeed clusters={signals?.clusters ?? []} lastUpdated={signals?.last_updated ?? ""} />
            </div>
          )}
          {view === "simulator" && (
            <div className="editorial-panel fade-in" style={{ flex: 1, overflow: "hidden" }}>
               <SimulatorPanel mode="simulate" onAnalyze={analyze} />
            </div>
          )}
          {view === "historical" && (
            <div className="editorial-panel fade-in" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
               <span style={{ fontFamily: "var(--font-sans)", color: "var(--ink-light)", fontSize: 13 }}>Archival data unavailable.</span>
            </div>
          )}
        </div>

        {/* Center/Right Canvas: Ripple Graph & Timeline (only shows when there's data) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 40, pointerEvents: "auto" }}>
          {view === "dashboard" && (ripple || rippleLoading) && (
            <div className="editorial-panel fade-in" style={{ flex: 1, position: "relative" }}>
              {rippleLoading ? (
                <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
                  <LoadingPulse message="Synthesizing cascade..." />
                </div>
              ) : (
                <RippleGraph ripple={ripple?.ripple_chain ?? null} isAnimating={!!ripple} />
              )}
            </div>
          )}
          
          {view === "dashboard" && ripple && !rippleLoading && (
            <div className="editorial-panel fade-in" style={{ height: 280, overflow: "hidden" }}>
              <CrisisTimeline ripple={ripple?.ripple_chain ?? null} event={ripple?.parsed_event?.event_summary ?? ""} />
            </div>
          )}
        </div>
      </div>

      {/* Novel Interface: Bottom-Left Circular Navigation Orbit */}
      <OrbitalNav currentView={view} onChange={setView} />
      
      {/* Minimal Analyze Input floating bottom right */}
      {view === "dashboard" && (
         <div style={{ position: "absolute", bottom: 40, right: 40, zIndex: 20, width: 400 }}>
           <MinimalInput onAnalyze={analyze} isLoading={rippleLoading} />
         </div>
      )}
    </div>
  )
}

function OrbitalNav({ currentView, onChange }: { currentView: View, onChange: (v: View) => void }) {
  const views: { id: View, label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "simulator", label: "Simulator" },
    { id: "signals", label: "Signals" },
    { id: "historical", label: "Historical" },
  ]

  return (
    <div style={{ position: "absolute", bottom: 60, left: 60, zIndex: 20, width: 160, height: 160 }}>
      {/* Center circle purely decorative or status */}
      <div style={{
        position: "absolute", inset: 40, borderRadius: "50%",
        border: "1px solid var(--border)", backgroundColor: "var(--surface)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div className="gentle-pulse" style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "var(--ink)" }} />
      </div>

      {/* Orbiting text elements */}
      {views.map((v, i) => {
        const angle = (i * (360 / views.length)) - 90
        const rad = angle * (Math.PI / 180)
        const radius = 80
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius

        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            style={{
              position: "absolute",
              left: 80 + x, top: 80 + y,
              transform: "translate(-50%, -50%)",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--font-sans)", fontSize: 11,
              color: currentView === v.id ? "var(--ink)" : "var(--ink-lighter)",
              fontWeight: currentView === v.id ? 500 : 400,
              padding: 10, transition: "color 0.3s"
            }}
          >
            {v.label}
          </button>
        )
      })}
    </div>
  )
}

function MinimalInput({ onAnalyze, isLoading }: { onAnalyze: (t: string) => void, isLoading: boolean }) {
  const [query, setQuery] = useState("")
  
  return (
    <div style={{ 
      display: "flex", alignItems: "center", gap: 12,
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 40, padding: "8px 8px 8px 24px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
    }}>
      <input 
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => e.key === "Enter" && query.trim() && !isLoading && onAnalyze(query)}
        placeholder="Input disruption scenario..."
        style={{
          flex: 1, background: "transparent", border: "none", outline: "none",
          color: "var(--ink)", fontFamily: "var(--font-sans)", fontSize: 13,
        }}
        disabled={isLoading}
      />
      <button 
        className="circle-btn"
        style={{ width: 32, height: 32, opacity: (!query.trim() || isLoading) ? 0.3 : 1 }}
        onClick={() => query.trim() && !isLoading && onAnalyze(query)}
        disabled={!query.trim() || isLoading}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>
  )
}