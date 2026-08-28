"use client"

import { formatTime } from "@/lib/utils"
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
        padding: "16px 24px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <h2 style={{ fontSize: 16, fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--ink)", margin: 0 }}>
          Global discourse
        </h2>
        <span style={{ fontSize: 11, color: "var(--ink-light)", fontFamily: "var(--font-sans)" }}>
          {lastUpdated ? formatTime(lastUpdated) : "—"}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
        {top.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", fontSize: 13, color: "var(--ink-lighter)", fontFamily: "var(--font-sans)" }}>
            Aggregating sources...
          </div>
        ) : (
          top.map((s, i) => (
            <a
              key={i} href={s.url || "#"} target="_blank" rel="noopener noreferrer"
              style={{
                display: "block", padding: "14px 24px",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none",
                transition: "background 0.3s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <p style={{
                  fontSize: 14, fontWeight: 400, color: "var(--ink)", lineHeight: 1.5, flex: 1,
                  fontFamily: "var(--font-sans)",
                }}>
                  {s.headline}
                </p>
                <span style={{ fontSize: 14, fontWeight: 300, color: "var(--ink)", fontFamily: "var(--font-serif)", fontStyle: "italic", flexShrink: 0 }}>
                  {s.score}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--ink-light)", fontFamily: "var(--font-sans)", fontWeight: 500 }}>
                  {s.source}
                </span>
                <span style={{ fontSize: 11, color: "var(--border)" }}>/</span>
                <span style={{
                  fontSize: 11, fontWeight: 400,
                  color: "var(--ink-lighter)", fontFamily: "var(--font-sans)",
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