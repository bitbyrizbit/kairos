"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WorldMap } from "@/components/graph/WorldMap"

import { useSignals } from "@/hooks/useSignals"
import { useKairosScore } from "@/hooks/useKairosScore"
import { useRipple } from "@/hooks/useRipple"

type View = "dashboard" | "simulator" | "signals" | "historical"

// We removed InteractiveLogo and replaced it with classic luxury editorial navigation.

export default function Home() {
  const [view, setView] = useState<View>("dashboard")
  const { data: signals, loading: signalsLoading } = useSignals()
  const kairosIndex = useKairosScore(signals)
  const { data: ripple, loading: rippleLoading, analyze } = useRipple()
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowLoader(false), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "var(--bg)" }}>
      
      <AnimatePresence>
        {showLoader && (
          <motion.div 
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "100vw", height: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "absolute", zIndex: 999 }}
          >
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 56, fontWeight: 400, color: "var(--ink)", letterSpacing: "0.1em", margin: 0 }}>KAIROS</h1>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}>
              <div style={{ fontFamily: "var(--font-script)", fontSize: 32, color: "var(--ink-light)", marginTop: "-15px", marginLeft: "20px" }}>Intelligence</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 1.2, duration: 1 }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--ink-lighter)", marginTop: 60 }}>
                Calibrating Global Node Index...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Layer: Map */}
      <WorldMap ripple={ripple?.ripple_chain ?? null} clusters={signals?.clusters ?? []} />
      
      {/* Top Left: Luxury Stamp Logo (Like Image 1) */}
      <div style={{ position: "absolute", top: 40, left: 40, zIndex: 10, display: "flex", flexDirection: "column" }}>
        <h1 style={{ 
          fontFamily: "var(--font-serif)", fontSize: 48, fontWeight: 400, 
          color: "var(--ink)", letterSpacing: "0.1em", margin: 0, lineHeight: 1 
        }}>
          KAIROS
        </h1>
        <div style={{ 
          fontFamily: "var(--font-script)", fontSize: 32, color: "var(--ink-light)", 
          marginTop: "-10px", marginLeft: "10px" 
        }}>
          Intelligence
        </div>
      </div>

      {/* Top Right: Luxury Editorial Navigation (Like Image 1) */}
      <div style={{ position: "absolute", top: 40, right: 60, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
        <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, letterSpacing: "0.15em", color: view === "dashboard" ? "var(--ink)" : "var(--ink-lighter)", textTransform: "uppercase" }}>Dashboard</button>
        <button onClick={() => setView("simulator")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, letterSpacing: "0.15em", color: view === "simulator" ? "var(--ink)" : "var(--ink-lighter)", textTransform: "uppercase" }}>Simulator</button>
        <button onClick={() => setView("signals")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, letterSpacing: "0.15em", color: view === "signals" ? "var(--ink)" : "var(--ink-lighter)", textTransform: "uppercase" }}>Active Signals</button>
      </div>

      {/* Simulator Overlay: Pure floating text input, no boxes */}
      <AnimatePresence>
        {view === "simulator" && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.8 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, background: "rgba(249, 249, 247, 0.85)" }}
          >
             <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} style={{ fontFamily: "var(--font-serif)", fontSize: 56, fontWeight: 400, color: "var(--ink)", marginBottom: 40 }}>Simulate Scenario</motion.h2>
             <motion.input 
               initial={{ width: 400, opacity: 0 }} animate={{ width: 600, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
               autoFocus
               placeholder="Input disruption event..."
               onKeyDown={e => {
                 if (e.key === "Enter" && e.currentTarget.value.trim() && !rippleLoading) {
                   analyze(e.currentTarget.value)
                   setView("dashboard")
                 }
               }}
               style={{
                 background: "transparent", border: "none", outline: "none",
                 borderBottom: "1px solid var(--border)", color: "var(--ink)",
                 fontFamily: "var(--font-serif)", fontSize: 28, fontStyle: "italic",
                 textAlign: "center", paddingBottom: 16
               }}
               disabled={rippleLoading}
             />
             {rippleLoading && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 40, fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--ink-light)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                 Synthesizing Cascade...
               </motion.div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Narrative Overlay: When a ripple finishes, show the text raw on the map */}
      <AnimatePresence>
        {view === "dashboard" && ripple && !rippleLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="luxury-card luxury-card-chamfer" 
            style={{ position: "absolute", left: 40, bottom: 40, width: 440, zIndex: 10, padding: "40px 32px" }}
          >
            <h2 style={{ fontSize: 24, fontFamily: "var(--font-serif)", color: "var(--ink)", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 24px 0" }}>
              Crisis Narrative
            </h2>
            <p style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--ink-light)", lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
              {ripple.crisis_narrative}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historical / Signals empty state */}
      <AnimatePresence>
        {(view === "historical" || view === "signals") && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, pointerEvents: "none" }}
          >
             <span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--ink-light)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
               {view === "historical" ? "Archival data unavailable" : "Map tracking active signals"}
             </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Index Display */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 1 }}
        style={{ position: "absolute", bottom: 40, right: 60, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "flex-end" }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          {kairosIndex && (
             <span style={{ fontSize: 14, fontFamily: "var(--font-sans)", color: "var(--ink-light)", fontStyle: "italic" }}>
               {kairosIndex.status.charAt(0).toUpperCase() + kairosIndex.status.slice(1)}
             </span>
          )}
          <motion.span 
            key={kairosIndex?.index_value ?? "--"}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
            style={{ fontSize: 48, fontFamily: "var(--font-serif)", fontWeight: 300, color: "var(--ink)", lineHeight: 1 }}
          >
            {kairosIndex?.index_value ?? "--"}
          </motion.span>
        </div>
      </motion.div>
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