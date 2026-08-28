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
    setResult(null)
    setLastQuery(description)
    try {
      const data = mode === "simulate" ? await api.simulate(description) : await api.analyze(description)
      setResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "REQUEST FAILED. CHECK SYSTEM UPLINK.")
    } finally {
      setLoading(false)
    }
  }

  const download = async () => {
    if (!result) return
    setDownloading(true)
    try {
      const blob = await api.report(lastQuery, result.ripple_chain, result.kairos_score)
      downloadBlob(blob, `KAIROS_ARCHIVE_${result.kairos_score}.pdf`)
    } catch { /* silent */ }
    finally { setDownloading(false) }
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 20, backgroundColor: "rgba(0,0,0,0.4)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text1)", marginBottom: 4, fontFamily: "var(--font-mono-data)", letterSpacing: "0.1em" }}>
            {mode === "simulate" ? "// WHAT-IF SIMULATOR" : "// EVENT ANALYZER"}
          </h2>
          <p style={{ fontSize: 12, color: "var(--text2)", fontFamily: "var(--font-mono-data)" }}>
            {mode === "simulate" ? "INJECT HYPOTHETICAL DISRUPTION AND TRACE GLOBAL CASCADE" : "ANALYZE REAL EVENT AND MAP SUPPLY CHAIN IMPACT"}
          </p>
        </div>
        {result && (
          <button
            className="panel-tactical-btn"
            onClick={download}
            disabled={downloading}
            style={{
              padding: "8px 16px", border: "1px solid var(--border)",
              fontSize: 11, fontFamily: "var(--font-mono-data)", color: downloading ? "var(--text3)" : "var(--cyan)",
              backgroundColor: "rgba(0, 229, 255, 0.05)", cursor: downloading ? "not-allowed" : "pointer",
            }}
          >
            {downloading ? "GENERATING..." : "EXPORT ARCHIVE [PDF]"}
          </button>
        )}
      </div>

      <WhatIfInput onSubmit={run} isLoading={loading} mode={mode} />

      {error && (
        <div style={{
          padding: "12px 16px",
          backgroundColor: "rgba(255, 51, 51, 0.1)", border: "1px solid var(--red)",
          fontSize: 12, color: "var(--red)", fontFamily: "var(--font-mono-data)",
          clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)"
        }}>
          [!] {error}
        </div>
      )}

      {loading && <LoadingPulse message="COMPUTING CASCADE TRAJECTORY..." />}

      {result && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fade-up 0.4s ease-out" }}>
          
          <div style={{
            padding: 20,
            backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
            display: "flex", gap: 20, alignItems: "flex-start",
            clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)"
          }}>
            <ScoreRing score={result.kairos_score} size={80} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                <Badge label={result.risk_status} type="status" value={result.risk_status} />
                <span style={{ fontSize: 11, color: "var(--cyan)", fontFamily: "var(--font-mono-data)", fontWeight: 700 }}>
                  {result.parsed_event.origin_region} / {result.parsed_event.affected_commodity}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text1)", lineHeight: 1.6, fontFamily: "var(--font-body)" }}>{result.crisis_narrative}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, height: 400 }}>
            <div style={{ border: "1px solid var(--border)", position: "relative" }}>
               <RippleGraph ripple={result.ripple_chain} isAnimating={true} />
            </div>
            <div style={{ border: "1px solid var(--border)", position: "relative" }}>
               <CrisisTimeline ripple={result.ripple_chain} event={lastQuery} />
            </div>
          </div>

          {(result.recommended_actions ?? []).length > 0 && (
            <div style={{ padding: 20, backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text2)", letterSpacing: "0.15em", marginBottom: 16, fontFamily: "var(--font-mono-data)", fontWeight: 700 }}>RECOMMENDED ACTIONS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {(result.recommended_actions ?? []).map((a, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, padding: "12px 16px",
                    backgroundColor: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)", fontFamily: "var(--font-mono-data)", flexShrink: 0 }}>
                      [0{i + 1}]
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text1)", lineHeight: 1.5 }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(result.similar_historical_events ?? []).length > 0 && (
            <div style={{ padding: 20, backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text2)", letterSpacing: "0.15em", marginBottom: 12, fontFamily: "var(--font-mono-data)", fontWeight: 700 }}>HISTORICAL PARALLELS</div>
              {(result.similar_historical_events ?? []).map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "6px 0", fontSize: 12, color: "var(--text1)", fontFamily: "var(--font-mono-data)" }}>
                  <span style={{ color: "var(--cyan)" }}>{">"}</span>{e}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}