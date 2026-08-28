"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WorldMap } from "@/components/graph/WorldMap"
import { useSignals } from "@/hooks/useSignals"
import { useKairosScore } from "@/hooks/useKairosScore"
import { useRipple } from "@/hooks/useRipple"

type View = "core" | "simulate" | "signals"

export default function Home() {
  const [view, setView] = useState<View>("core")
  const { data: signals } = useSignals()
  const kairosIndex = useKairosScore(signals)
  const { data: ripple, loading: rippleLoading, analyze } = useRipple()
  
  const [query, setQuery] = useState("")

  // Handle global key press to return to core
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setView("core")
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [])

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#0a0a0a", color: "#fff", fontFamily: "var(--font-sans)" }}>
      {/* Deep Background */}
      <WorldMap ripple={ripple?.ripple_chain ?? null} clusters={signals?.clusters ?? []} />

      {/* The Central Singularity */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 1, height: 1, zIndex: 10
      }}>
        
        {/* Core View: The Kairos Score */}
        <AnimatePresence>
          {view === "core" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              style={{
                position: "absolute", top: -150, left: -150,
                width: 300, height: 300, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 0 100px rgba(255,255,255,0.02) inset"
              }}
              onClick={() => setView("simulate")}
            >
              <span style={{ fontSize: 12, letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Global Stability</span>
              <span style={{ fontSize: 96, fontWeight: 300, fontFamily: "var(--font-serif)", lineHeight: 1, margin: "10px 0" }}>
                {kairosIndex?.index_value ?? "--"}
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Click to simulate disruption</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simulate View: The Command Ring */}
        <AnimatePresence>
          {view === "simulate" && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              style={{
                position: "absolute", top: -200, left: -200,
                width: 400, height: 400, borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(30px)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: 40, textAlign: "center"
              }}
            >
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && query) {
                    analyze(query)
                    setView("signals")
                  }
                }}
                placeholder="Type disruption event..."
                style={{
                  background: "transparent", border: "none", outline: "none",
                  color: "#fff", fontSize: 24, fontFamily: "var(--font-serif)",
                  textAlign: "center", width: "100%", borderBottom: "1px solid rgba(255,255,255,0.2)",
                  paddingBottom: 10
                }}
              />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 20, letterSpacing: "0.1em" }}>Press Enter to shatter reality. Esc to cancel.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Signals View: The Cascade Output */}
        <AnimatePresence>
          {view === "signals" && ripple && (
             <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               style={{
                 position: "absolute", top: -300, left: -300,
                 width: 600, height: 600, borderRadius: "50%",
                 border: "1px solid rgba(255,255,255,0.05)",
                 display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                 pointerEvents: "none"
               }}
             >
                {/* Orbiting data points */}
                {ripple.hops.slice(0, 8).map((hop, i) => {
                  const angle = (i / Math.min(ripple.hops.length, 8)) * Math.PI * 2
                  const r = 280
                  const x = Math.cos(angle) * r
                  const y = Math.sin(angle) * r
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        position: "absolute", left: 300 + x, top: 300 + y,
                        transform: "translate(-50%, -50%)",
                        background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)",
                        padding: "10px 16px", borderRadius: 30, fontSize: 12,
                        backdropFilter: "blur(10px)", whiteSpace: "nowrap"
                      }}
                    >
                      {hop.node_label}
                    </motion.div>
                  )
                })}

                <div style={{ textAlign: "center", maxWidth: 400, padding: 40, background: "rgba(0,0,0,0.6)", borderRadius: "50%", backdropFilter: "blur(20px)", pointerEvents: "auto" }}>
                   <h2 style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 10, letterSpacing: "0.1em" }}>Impact Narrative</h2>
                   <p style={{ fontSize: 16, fontFamily: "var(--font-serif)", lineHeight: 1.6 }}>{ripple.crisis_narrative}</p>
                   <button onClick={() => setView("core")} style={{ marginTop: 30, background: "none", border: "1px solid #fff", color: "#fff", padding: "8px 24px", borderRadius: 40, cursor: "pointer", fontSize: 12 }}>Reset</button>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global minimal text */}
      <div style={{ position: "absolute", bottom: 40, left: 40, fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}>
        KAIROS INTELLIGENCE
      </div>
    </div>
  )
}