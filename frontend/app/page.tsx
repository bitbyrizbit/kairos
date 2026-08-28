"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { WorldMap } from "@/components/graph/WorldMap"

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
      
      {/* Main Content Areas */}
      <div style={{ position: "absolute", inset: "40px 40px 40px 320px", display: "flex", gap: 40, zIndex: 5, pointerEvents: "none" }}>
        
        {/* Left Side: Dynamic Module based on View */}
        <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 40, pointerEvents: "auto" }}>
          {view === "dashboard" && (
            <div style={{ flex: 1, pointerEvents: "none" }}>
              {/* WorldMap is the hero now. We removed the old KairosScorePanel side panel. */}
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

      {/* Novel Interface: Interactive Logo Navbar */}
      <InteractiveLogo currentView={view} onChange={setView} />
      
      {/* Global Index Display */}
      <div style={{ position: "absolute", bottom: 40, left: 40, zIndex: 20, display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", color: "var(--ink-light)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
          Global Stability Index
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 48, fontFamily: "var(--font-serif)", fontWeight: 300, color: "var(--ink)", lineHeight: 1 }}>
            {kairosIndex?.index_value ?? "--"}
          </span>
          {kairosIndex && (
             <span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--ink-light)" }}>
               {kairosIndex.status.charAt(0).toUpperCase() + kairosIndex.status.slice(1)}
             </span>
          )}
        </div>
      </div>
      
      {/* Minimal Analyze Input floating bottom right */}
      {view === "dashboard" && (
         <div style={{ position: "absolute", bottom: 40, right: 40, zIndex: 20, width: 400 }}>
           <MinimalInput onAnalyze={analyze} isLoading={rippleLoading} />
         </div>
      )}
    </div>
  )
}

function InteractiveLogo({ currentView, onChange }: { currentView: View, onChange: (v: View) => void }) {
  const [isHovered, setIsHovered] = useState(false)

  const views: { id: View, label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "simulator", label: "Simulator" },
    { id: "signals", label: "Signals" },
    { id: "historical", label: "Historical" },
  ]

  return (
    <div 
      style={{ 
        position: "absolute", top: 40, left: 40, zIndex: 50,
        display: "flex", alignItems: "center", 
        fontFamily: "var(--font-serif)", fontSize: 32, 
        fontWeight: 400, letterSpacing: "0.25em", color: "var(--ink)",
        pointerEvents: "auto", userSelect: "none"
      }}
    >
      <span style={{ marginRight: -4 }}>KAIR</span>
      
      {/* The O which acts as the nav trigger */}
      <div 
        onClick={() => setIsHovered(!isHovered)}
        style={{ 
          position: "relative", width: 42, height: 42, 
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 6px", cursor: "pointer", 
        }}
      >
        {/* The visual O */}
        <motion.div 
          animate={{ scale: isHovered ? 1.0 : 1 }}
          style={{ 
            width: 22, height: 22, borderRadius: "50%", 
            border: "2px solid var(--ink)",
            backgroundColor: isHovered ? "var(--ink)" : "transparent",
            transition: "background-color 0.3s"
          }} 
        />
        
        {/* Expanding arc of navigation options */}
        {isHovered && (
          <div style={{ position: "absolute", top: 21, left: 21 }}>
            {views.map((v, i) => {
              // Arc calculation
              const angle = (i / (views.length - 1)) * 90
              const rad = angle * (Math.PI / 180)
              const radius = 100 // Distance from O
              const x = Math.cos(rad) * radius
              const y = Math.sin(rad) * radius

              return (
                <motion.button
                  key={v.id}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{ opacity: 1, x, y }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onChange(v.id)
                    setIsHovered(false)
                  }}
                  style={{
                    position: "absolute",
                    transform: "translate(-50%, -50%)",
                    background: currentView === v.id ? "var(--ink)" : "var(--surface)", 
                    border: "1px solid var(--border)",
                    color: currentView === v.id ? "var(--surface)" : "var(--ink-light)",
                    padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 500,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    whiteSpace: "nowrap", letterSpacing: "0.05em"
                  }}
                >
                  {v.label}
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
      
      <span style={{ marginLeft: -30 }}>S</span>
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