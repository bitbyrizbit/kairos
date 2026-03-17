"use client"

import { useState } from "react"
import { WhatIfInput } from "./WhatIfInput"
import { RippleGraph } from "@/components/graph/RippleGraph"
import { CrisisTimeline } from "@/components/dashboard/CrisisTimeline"
import { ScoreRing } from "@/components/ui/ScoreRing"
import { Badge } from "@/components/ui/Badge"
import { LoadingPulse } from "@/components/ui/LoadingPulse"
import { api } from "@/lib/api"
import { downloadBlob } from "@/lib/utils"
import type { AnalyzeResponse } from "@/types"

interface Props {
  mode?: "analyze" | "simulate"
}

export function SimulatorPanel({ mode = "simulate" }: Props) {
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState("")
  const [downloading, setDownloading] = useState(false)

  const run = async (description: string) => {
    setLoading(true)
    setError(null)
    setResult(null) // clear previous result — fixes same graph issue
    setLastQuery(description)
    try {
      const data = mode === "simulate" ? await api.simulate(description) : await api.analyze(description)
      setResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Request failed. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  const download = async () => {
    if (!result) return
    setDownloading(true)
    try {
      const blob = await api.report(lastQuery, result.ripple_chain, result.kairos_score)
      downloadBlob(blob, `kairos-${result.kairos_score}.pdf`)
    } catch { /* silent */ }
    finally { setDownloading(false) }
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#e0e0e0", marginBottom: 4 }}>
            {mode === "simulate" ? "What-If Simulator" : "Event Analyzer"}
          </h2>
          <p style={{ fontSize: 11, color: "#444" }}>
            {mode === "simulate" ? "Inject any hypothetical disruption and trace its global cascade" : "Analyze a real event and map its supply chain impact"}
          </p>
        </div>
        {result && (
          <button
            onClick={download}
            disabled={downloading}
            style={{
              padding: "6px 12px", borderRadius: 4, border: "1px solid #222",
              fontSize: 10, fontFamily: "monospace", color: downloading ? "#333" : "#777",
              backgroundColor: "#0d0d0d", cursor: downloading ? "not-allowed" : "pointer",
            }}
          >
            {downloading ? "Generating..." : "Export PDF"}
          </button>
        )}
      </div>

      <WhatIfInput onSubmit={run} isLoading={loading} mode={mode} />

      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: 4,
          backgroundColor: "#1a0808", border: "1px solid #3a1010",
          fontSize: 11, color: "#ef4444", fontFamily: "monospace",
        }}>
          ⚠ {error}
        </div>
      )}

      {loading && <LoadingPulse message="Running cascade simulation..." />}

      {result && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fade-up 0.3s ease-out" }}>
          {/* score card */}
          <div style={{
            padding: 16, borderRadius: 6,
            backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a",
            display: "flex", gap: 16, alignItems: "flex-start",
          }}>
            <ScoreRing score={result.kairos_score} size={76} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <Badge label={result.risk_status} type="status" value={result.risk_status} />
                <span style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>
                  {result.parsed_event.origin_region} · {result.parsed_event.affected_commodity}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#999", lineHeight: 1.6 }}>{result.crisis_narrative}</p>
            </div>
          </div>

          {/* graph + timeline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, height: 340 }}>
            <RippleGraph ripple={result.ripple_chain} isAnimating={true} />
            <CrisisTimeline ripple={result.ripple_chain} event={lastQuery} />
          </div>

          {/* actions */}
          {(result.recommended_actions ?? []).length > 0 && (
            <div style={{ padding: 16, borderRadius: 6, backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.15em", marginBottom: 10 }}>RECOMMENDED ACTIONS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {(result.recommended_actions ?? []).map((a, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, padding: "8px 12px", borderRadius: 4,
                    backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a",
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: "#f59e0b", fontFamily: "monospace", flexShrink: 0 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* historical parallels */}
          {(result.similar_historical_events ?? []).length > 0 && (
            <div style={{ padding: 16, borderRadius: 6, backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.15em", marginBottom: 8 }}>HISTORICAL PARALLELS</div>
              {(result.similar_historical_events ?? []).map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "4px 0", fontSize: 11, color: "#555" }}>
                  <span style={{ color: "#2a2a2a" }}>—</span>{e}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}