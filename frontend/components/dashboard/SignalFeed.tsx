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
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, backgroundColor: "var(--red)", display: "inline-block" }} className="pulse-dot" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text1)", letterSpacing: "0.15em", fontFamily: "var(--font-mono-data)" }}>
            RAW SIGNAL STREAM
          </span>
        </div>
        <span style={{ fontSize: 10, color: "var(--text2)", fontFamily: "var(--font-mono-data)" }}>
          {lastUpdated ? formatTime(lastUpdated) : "—"}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {top.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono-data)" }}>
            SCANNING FEEDS...
          </div>
        ) : (
          top.map((s, i) => (
            <a
              key={i} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
              style={{
                display: "block", padding: "10px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <p style={{
                  fontSize: 12, fontWeight: 600, color: "var(--text1)", lineHeight: 1.45, flex: 1,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                }}>
                  {s.headline}
                </p>
                <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor(s.score), fontFamily: "var(--font-mono-data)", flexShrink: 0 }}>
                  {s.score}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "var(--cyan)", fontFamily: "var(--font-mono-data)", fontWeight: 600 }}>
                  {s.source}
                </span>
                <span style={{ fontSize: 10, color: "var(--border)" }}>/</span>
                <span style={{
                  fontSize: 10, fontWeight: 500,
                  color: "var(--text2)", fontFamily: "var(--font-mono-data)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160,
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