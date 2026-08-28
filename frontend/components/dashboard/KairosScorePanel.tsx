"use client"

import { ScoreRing } from "@/components/ui/ScoreRing"
import { Badge } from "@/components/ui/Badge"
import type { SignalCluster, KairosIndex } from "@/types"

interface Props {
  clusters: SignalCluster[]
  kairosIndex: KairosIndex | null
}

export function KairosScorePanel({ clusters, kairosIndex }: Props) {
  const top5 = [...clusters].sort((a, b) => b.kairos_score - a.kairos_score).slice(0, 5)

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <h2 style={{ fontSize: 16, fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--ink)", margin: 0 }}>
          Intelligence synthesis
        </h2>
        <span style={{ fontSize: 12, color: "var(--ink-light)", fontFamily: "var(--font-sans)" }}>
          {clusters.length} active themes
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
        {top5.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", fontSize: 13, color: "var(--ink-lighter)", fontFamily: "var(--font-sans)" }}>
            Collecting global signals...
          </div>
        ) : (
          top5.map((c) => (
            <div key={c.cluster_id} style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--border)",
              transition: "background 0.3s"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--surface-hover)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)", lineHeight: 1.4, flex: 1, margin: 0 }}>
                  {c.theme}
                </h3>
                <span style={{ fontSize: 18, fontWeight: 300, color: "var(--ink)", fontFamily: "var(--font-serif)", fontStyle: "italic", flexShrink: 0 }}>
                  {c.kairos_score}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <Badge label={c.risk_status} />
                {c.primary_regions[0] && (
                  <span style={{ fontSize: 11, color: "var(--ink-light)", fontFamily: "var(--font-sans)" }}>
                    {c.primary_regions[0]}
                  </span>
                )}
              </div>
              {c.possible_outcome && (
                <p style={{
                  fontSize: 13, color: "var(--ink-light)", lineHeight: 1.6, fontFamily: "var(--font-sans)",
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as any,
                }}>
                  {c.possible_outcome}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}