"use client"

import { useState } from "react"
import { WhatIfInput } from "./WhatIfInput"
import { RippleGraph } from "@/components/graph/RippleGraph"
import { CrisisTimeline } from "@/components/dashboard/CrisisTimeline"
import { Badge } from "@/components/ui/Badge"
import { LoadingPulse } from "@/components/ui/LoadingPulse"
import { api } from "@/lib/api"
import { downloadBlob } from "@/lib/utils"
import type { AnalyzeResponse } from "@/types"

interface Props {
  mode?: "analyze" | "simulate"
  onAnalyze?: (q: string) => void
}

export function SimulatorPanel({ mode = "simulate", onAnalyze }: Props) {
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState("")
  const [downloading, setDownloading] = useState(false)

  const run = async (description: string) => {
    if (onAnalyze) onAnalyze(description)
    setLoading(true)
    setError(null)
    setResult(null)
    setLastQuery(description)
    try {
      const data = mode === "simulate" ? await api.simulate(description) : await api.analyze(description)
      setResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Simulation failed. Verify connection.")
    } finally {
      setLoading(false)
    }
  }

  const download = async () => {
    if (!result) return
    setDownloading(true)
    try {
      const blob = await api.report(lastQuery, result.ripple_chain, result.kairos_score)
      downloadBlob(blob, `Kairos_Intelligence_${result.kairos_score}.pdf`)
    } catch { /* silent */ }
    finally { setDownloading(false) }
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 32, display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 400, color: "var(--ink)", marginBottom: 8, fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
            {mode === "simulate" ? "Scenario Simulator" : "Event Analyzer"}
          </h2>
          <p style={{ fontSize: 13, color: "var(--ink-light)", fontFamily: "var(--font-sans)" }}>
            {mode === "simulate" ? "Model the cascading effects of a hypothetical global disruption." : "Map the supply chain impact of a confirmed event."}
          </p>
        </div>
        {result && (
          <button
            className="circle-btn"
            onClick={download}
            disabled={downloading}
            style={{
              padding: "10px 20px", border: "1px solid var(--border)", borderRadius: 40,
              fontSize: 12, fontFamily: "var(--font-sans)",
              backgroundColor: "var(--surface)", cursor: downloading ? "not-allowed" : "pointer",
            }}
          >
            {downloading ? "Compiling PDF..." : "Export Briefing"}
          </button>
        )}
      </div>

      <WhatIfInput onSubmit={run} isLoading={loading} mode={mode} />

      {error && (
        <div style={{
          padding: "16px 20px",
          backgroundColor: "#fff", border: "1px solid var(--border)",
          fontSize: 13, color: "var(--ink)", fontFamily: "var(--font-sans)",
          borderRadius: 2
        }}>
          Error: {error}
        </div>
      )}

      {loading && <LoadingPulse message="Modeling cascade trajectories..." />}

      {result && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 32, animation: "fadeIn 0.6s ease-out" }}>
          
          <div style={{
            padding: 32,
            backgroundColor: "var(--surface)", border: "1px solid var(--border)",
            display: "flex", gap: 32, alignItems: "flex-start",
            borderRadius: 2
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 300, color: "var(--ink)", fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1 }}>
                {result.kairos_score}
              </span>
              <span style={{ fontSize: 10, color: "var(--ink-lighter)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Index Score</span>
            </div>
            
            <div style={{ flex: 1, minWidth: 0, borderLeft: "1px solid var(--border)", paddingLeft: 32 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <Badge label={result.risk_status} />
                <span style={{ fontSize: 13, color: "var(--ink-light)", fontFamily: "var(--font-sans)" }}>
                  {result.parsed_event.origin_region} &mdash; {result.parsed_event.affected_commodity}
                </span>
              </div>
              <p style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.6, fontFamily: "var(--font-serif)" }}>{result.crisis_narrative}</p>
            </div>
          </div>

          {(result.recommended_actions ?? []).length > 0 && (
            <div style={{ padding: 32, backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 2 }}>
              <div style={{ fontSize: 12, color: "var(--ink-light)", marginBottom: 24, fontFamily: "var(--font-sans)", fontWeight: 500 }}>Strategic Recommendations</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(result.recommended_actions ?? []).map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontSize: 14, color: "var(--ink-lighter)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.6, fontFamily: "var(--font-sans)" }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(result.similar_historical_events ?? []).length > 0 && (
            <div style={{ padding: 32, backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 2 }}>
              <div style={{ fontSize: 12, color: "var(--ink-light)", marginBottom: 20, fontFamily: "var(--font-sans)", fontWeight: 500 }}>Historical Precedents</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(result.similar_historical_events ?? []).map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-serif)" }}>
                    <span style={{ color: "var(--ink-lighter)" }}>&mdash;</span>{e}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}