"use client"

import { formatTime, scoreColor } from "@/lib/utils"
import type { SignalCluster } from "@/types"

interface Props {
  clusters: SignalCluster[]
  lastUpdated: string
}

export function SignalFeed({ clusters, lastUpdated }: Props) {
  const seen = new Set<string>()
  const signals: { headline: string; source: string; url: string; score: number; theme: string }[] = []

  for (const c of clusters) {
    for (const s of c.signals) {
      if (!seen.has(s.headline)) {
        seen.add(s.headline)
        signals.push({ headline: s.headline, source: s.source, url: s.url, score: c.kairos_score, theme: c.theme })
      }
    }
  }

  signals.sort((a, b) => b.score - a.score)
  const top = signals.slice(0, 18)

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid #1a1a1a",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: "#888", letterSpacing: "0.15em" }}>SIGNAL FEED</span>
        </div>
        <span style={{ fontSize: 9, color: "#555", fontFamily: "monospace", fontWeight: 600 }}>
          {lastUpdated ? formatTime(lastUpdated) : "—"}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {top.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", fontSize: 11, color: "#333" }}>
            Scanning feeds...
          </div>
        ) : (
          top.map((s, i) => (
            <a
              key={i} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
              style={{
                display: "block", padding: "9px 14px",
                borderBottom: "1px solid #0f0f0f",
                textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#111")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                <p style={{
                  fontSize: 11, fontWeight: 600, color: "#ccc", lineHeight: 1.45, flex: 1,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                }}>
                  {s.headline}
                </p>
                <span style={{ fontSize: 13, fontWeight: 900, color: scoreColor(s.score), fontFamily: "monospace", flexShrink: 0 }}>
                  {s.score}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                <span style={{ fontSize: 9, color: "#4a7ab5", fontFamily: "monospace", fontWeight: 700 }}>{s.source}</span>
                <span style={{ fontSize: 9, color: "#2a2a2a" }}>·</span>
                <span style={{
                  fontSize: 9, fontWeight: 600,
                  color: scoreColor(s.score), opacity: 0.75,
                  fontFamily: "monospace",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130,
                }}>
                  {s.theme}
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}