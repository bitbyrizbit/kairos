"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { WorldMap } from "@/components/graph/WorldMap"

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
      
      {/* Simulator Overlay: Pure floating text input, no boxes */}
      {view === "simulator" && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, pointerEvents: "none" }}>
           <input 
             autoFocus
             placeholder="Type disruption scenario..."
             onKeyDown={e => {
               if (e.key === "Enter" && e.currentTarget.value.trim() && !rippleLoading) {
                 analyze(e.currentTarget.value)
                 setView("dashboard")
               }
             }}
             style={{
               background: "transparent", border: "none", outline: "none",
               borderBottom: "1px solid var(--ink)", color: "var(--ink)",
               fontFamily: "var(--font-serif)", fontSize: 32, fontStyle: "italic",
               width: 600, textAlign: "center", paddingBottom: 16, pointerEvents: "auto"
             }}
             disabled={rippleLoading}
           />
           {rippleLoading && (
             <div style={{ marginTop: 24, fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--ink-light)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
               Synthesizing Cascade...
             </div>
           )}
        </div>
      )}

      {/* Narrative Overlay: When a ripple finishes, show the text raw on the map */}
      {view === "dashboard" && ripple && !rippleLoading && (
        <div style={{ position: "absolute", right: 80, top: 120, width: 400, zIndex: 10, pointerEvents: "none" }}>
          <h2 style={{ fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--ink)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            Crisis Narrative
          </h2>
          <p style={{ fontSize: 18, fontFamily: "var(--font-serif)", color: "var(--ink)", lineHeight: 1.6 }}>
            {ripple.crisis_narrative}
          </p>
        </div>
      )}

      {/* Historical / Signals empty state */}
      {(view === "historical" || view === "signals") && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, pointerEvents: "none" }}>
           <span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--ink-light)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
             {view === "historical" ? "Archival data unavailable" : "Map tracking active signals"}
           </span>
        </div>
      )}

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
        position: "absolute", top: 40, left: 40, zIndex: 99999,
        display: "flex", alignItems: "center", 
        fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 32, 
        fontWeight: 300, letterSpacing: "0.2em", color: "var(--ink)",
        pointerEvents: "auto", userSelect: "none"
      }}
    >
      <span style={{ marginRight: 6 }}>KAIR</span>
      
      {/* The O which acts as the nav trigger */}
      <div 
        onClick={() => setIsHovered(!isHovered)}
        style={{ 
          position: "relative", width: 36, height: 36, 
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", 
        }}
      >
        {/* The visual O */}
        <motion.div 
          animate={{ scale: isHovered ? 1.0 : 1 }}
          style={{ 
            width: 28, height: 28, borderRadius: "50%", 
            border: "1px solid var(--ink)",
            backgroundColor: isHovered ? "var(--ink)" : "transparent",
            transition: "background-color 0.3s"
          }} 
        />
        
        {/* Expanding arc of navigation options */}
        {isHovered && (
          <div style={{ position: "absolute", top: 18, left: 18 }}>
            {views.map((v, i) => {
              // Arc calculation
              const angle = (i / (views.length - 1)) * 90
              const rad = angle * (Math.PI / 180)
              const radius = 130 // Distance from O
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
                    fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 11, fontWeight: 500,
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
      
      {/* FIXED: Removed the negative margin that was causing the overlap! */}
      <span style={{ marginLeft: 8 }}>S</span>
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