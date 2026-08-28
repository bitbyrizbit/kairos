"use client"

import { scoreColor } from "@/lib/utils"
import type { SignalCluster } from "@/types"

interface Props {
  clusters: SignalCluster[]
}

export function Ticker({ clusters }: Props) {
  const seen = new Set<string>()
  const items: { text: string; score: number; source: string }[] = []

  for (const c of clusters) {
    for (const s of c.signals.slice(0, 2)) {
      if (!seen.has(s.headline)) {
        seen.add(s.headline)
        items.push({ text: s.headline, score: c.kairos_score, source: s.source })
      }
    }
  }

  if (!items.length) {
    return (
      <div style={{ height: 32, display: "flex", alignItems: "center", padding: "0 16px", fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono-data)" }}>
        SCANNING GLOBAL SIGNALS...
      </div>
    )
  }

  const doubled = [...items, ...items]

  return (
    <div style={{ height: 32, display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
        padding: "0 16px", borderRight: "1px solid var(--border)", height: "100%", backgroundColor: "rgba(255,0,0,0.05)"
      }}>
        <span style={{ width: 6, height: 6, backgroundColor: "var(--red)", display: "inline-block" }} className="pulse-dot" />
        <span style={{ fontSize: 10, fontWeight: 800, color: "var(--red)", letterSpacing: "0.2em", fontFamily: "var(--font-mono-data)" }}>LIVE FEED</span>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 32, whiteSpace: "nowrap",
          animation: `ticker-move ${items.length * 5}s linear infinite`,
        }}>
          {doubled.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontFamily: "var(--font-mono-data)" }}>
              <span style={{ fontWeight: 800, color: scoreColor(item.score) }}>
                [{item.score}]
              </span>
              <span style={{ color: "var(--text1)", fontWeight: 600 }}>{item.text}</span>
              <span style={{ color: "var(--text2)" }}>// {item.source.slice(0, 20)}</span>
              <span style={{ color: "var(--border)", margin: "0 8px" }}>|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}