"use client"

import { ScoreRing } from "@/components/ui/ScoreRing"
import { Badge } from "@/components/ui/Badge"
import { scoreColor } from "@/lib/utils"
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
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cyan)", letterSpacing: "0.15em", fontFamily: "var(--font-mono-data)" }}>
          RISK CLUSTERS
        </span>
        <span style={{ fontSize: 10, color: "var(--text2)", fontFamily: "var(--font-mono-data)" }}>
          {clusters.length} ACTIVE
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {top5.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "var(--text3)", fontFamily: "var(--font-mono-data)" }}>
            AWAITING SIGNAL DATA...
          </div>
        ) : (
          top5.map((c) => {
            const color = scoreColor(c.kairos_score)
            return (
              <div key={c.cluster_id} style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
                borderLeft: `3px solid ${color}`,
                backgroundColor: "rgba(0,0,0,0.2)",
                transition: "background 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.2)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text1)", lineHeight: 1.4, flex: 1 }}>
                    {c.theme}
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 700, color, fontFamily: "var(--font-mono-data)", flexShrink: 0 }}>
                    {c.kairos_score}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  <Badge label={c.risk_status} type="status" value={c.risk_status} size="sm" />
                  {c.primary_regions[0] && (
                    <span style={{ fontSize: 10, color: "var(--text2)", fontFamily: "var(--font-mono-data)" }}>
                      {c.primary_regions[0]}
                    </span>
                  )}
                  {c.velocity > 0.5 && (
                    <span style={{ fontSize: 10, color: "var(--red)", fontFamily: "var(--font-mono-data)", fontWeight: 700 }}>
                      [ACCELERATING]
                    </span>
                  )}
                </div>
                {c.possible_outcome && (
                  <p style={{
                    fontSize: 11, color: "var(--text2)", lineHeight: 1.5,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
                  }}>
                    {c.possible_outcome}
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}