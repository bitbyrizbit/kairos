"use client"

import { scoreColor } from "@/lib/utils"
import type { SignalCluster } from "@/types"

interface Props {
  clusters: SignalCluster[]
}

export function Ticker({ clusters }: Props) {
  // deduplicate headlines
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
      <div style={{
        height: 28, backgroundColor: "#080808",
        borderBottom: "1px solid #1a1a1a",
        display: "flex", alignItems: "center", padding: "0 16px",
        fontSize: 10, color: "#333", fontFamily: "monospace",
      }}>
        Scanning global signals...
      </div>
    )
  }

  // duplicate for seamless loop
  const doubled = [...items, ...items]

  return (
    <div style={{
      height: 28, backgroundColor: "#080808",
      borderBottom: "1px solid #1a1a1a",
      display: "flex", alignItems: "center",
      overflow: "hidden", flexShrink: 0,
    }}>
      {/* LIVE badge */}
      <div style={{
        flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
        padding: "0 12px", borderRight: "1px solid #1a1a1a", height: "100%",
      }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
        <span style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", letterSpacing: "0.2em" }}>LIVE</span>
      </div>

      {/* scrolling */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 32, whiteSpace: "nowrap",
          animation: `ticker-move ${items.length * 6}s linear infinite`,
        }}>
          {doubled.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <span style={{ fontFamily: "monospace", fontWeight: 700, color: scoreColor(item.score) }}>
                [{item.score}]
              </span>
              <span style={{ color: "#aaa" }}>{item.text}</span>
              <span style={{ color: "#333" }}>· {item.source.slice(0, 20)}</span>
              <span style={{ color: "#222", margin: "0 8px" }}>—</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}