"use client"

import { useState } from "react"
import { Download, AlertTriangle } from "lucide-react"
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
  const [downloading, setDownloading] = useState(false)
  const [lastQuery, setLastQuery] = useState("")

  const handleSubmit = async (description: string) => {
    setLoading(true)
    setError(null)
    setLastQuery(description)

    try {
      const data = mode === "simulate"
        ? await api.simulate(description)
        : await api.analyze(description)
      setResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Analysis failed. Check backend connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!result) return
    setDownloading(true)
    try {
      const blob = await api.report(
        lastQuery,
        result.ripple_chain,
        result.kairos_score
      )
      downloadBlob(blob, `kairos-brief-${result.kairos_score}.pdf`)
    } catch {
      // silent fail on report download
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col h-full gap-4 p-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
            {mode === "simulate" ? "What-If Simulator" : "Event Analyzer"}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
            {mode === "simulate"
              ? "Inject any hypothetical disruption and trace its global cascade"
              : "Analyze a real event and map its supply chain impact"}
          </p>
        </div>
        {result && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors"
            style={{
              border: "1px solid #1e3a5f",
              color: downloading ? "#334155" : "#94a3b8",
              backgroundColor: "#0a1628",
            }}
          >
            <Download size={11} />
            {downloading ? "Generating..." : "Export PDF"}
          </button>
        )}
      </div>

      <WhatIfInput onSubmit={handleSubmit} isLoading={loading} mode={mode} />

      {error && (
        <div
          className="flex items-start gap-2 px-3 py-2 rounded text-xs font-mono"
          style={{ backgroundColor: "#1a0a0a", border: "1px solid #ef444433", color: "#ef4444" }}
        >
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading && (
        <LoadingPulse message="Running cascade simulation..." />
      )}

      {result && !loading && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* score + narrative */}
          <div
            className="card p-4 flex gap-4"
          >
            <ScoreRing score={result.kairos_score} size={72} />
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  label={result.risk_status}
                  type="status"
                  value={result.risk_status}
                />
                <span className="text-xs font-mono" style={{ color: "#475569" }}>
                  {result.parsed_event.origin_region} · {result.parsed_event.affected_commodity}
                </span>
                {result.ripple_chain.multi_crisis_detected && (
                  <Badge label="COMPOUND RISK" size="sm" />
                )}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                {result.crisis_narrative}
              </p>
            </div>
          </div>

          {/* graph + timeline side by side */}
          <div className="grid grid-cols-2 gap-4" style={{ minHeight: 320 }}>
            <RippleGraph ripple={result.ripple_chain} isAnimating={true} />
            <CrisisTimeline ripple={result.ripple_chain} event={lastQuery} />
          </div>

          {/* recommended actions */}
          {result.recommended_actions.length > 0 && (
            <div className="card p-4">
              <p
                className="text-[10px] font-mono uppercase tracking-wider mb-3"
                style={{ color: "#475569" }}
              >
                Recommended Actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {result.recommended_actions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 px-3 py-2 rounded text-xs"
                    style={{ backgroundColor: "#0a1628", border: "1px solid #0f1f35" }}
                  >
                    <span
                      className="font-mono font-bold flex-shrink-0"
                      style={{ color: "#f59e0b" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ color: "#94a3b8" }}>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* historical parallels */}
          {result.similar_historical_events.length > 0 && (
            <div className="card p-4">
              <p
                className="text-[10px] font-mono uppercase tracking-wider mb-2"
                style={{ color: "#475569" }}
              >
                Historical Parallels
              </p>
              <div className="flex flex-col gap-1">
                {result.similar_historical_events.map((evt, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span style={{ color: "#334155" }}>—</span>
                    <span style={{ color: "#64748b" }}>{evt}</span>
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