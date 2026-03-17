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
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden",
    }}>
      {/* header */}
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid #1a1a1a",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#666", letterSpacing: "0.15em" }}>
          RISK CLUSTERS
        </span>
        <span style={{ fontSize: 9, color: "#333", fontFamily: "monospace" }}>
          {clusters.length} active
        </span>
      </div>

      {/* index summary */}
      {kairosIndex && (
        <div style={{
          padding: "12px 14px", borderBottom: "1px solid #1a1a1a",
          display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
        }}>
          <ScoreRing score={kairosIndex.index_value} size={68} />
          <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 0 }}>
            {[
              { label: "Region", value: kairosIndex.highest_risk_region },
              { label: "Commodity", value: kairosIndex.highest_risk_commodity },
              { label: "Clusters", value: String(kairosIndex.active_clusters) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "#444" }}>{label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#ccc", textAlign: "right", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* clusters list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {top5.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", fontSize: 11, color: "#333" }}>
            No active clusters
          </div>
        ) : (
          top5.map((c, i) => {
            const color = scoreColor(c.kairos_score)
            return (
              <div key={c.cluster_id} style={{
                padding: "10px 14px",
                borderBottom: "1px solid #111",
                borderLeft: `2px solid ${color}`,
                cursor: "default",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#ddd", lineHeight: 1.3, flex: 1 }}>
                    {c.theme}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 900, color, fontFamily: "monospace", flexShrink: 0 }}>
                    {c.kairos_score}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <Badge label={c.risk_status} type="status" value={c.risk_status} size="sm" />
                  {c.primary_regions[0] && (
                    <span style={{ fontSize: 9, color: "#444", fontFamily: "monospace" }}>
                      {c.primary_regions[0]}
                    </span>
                  )}
                  {c.velocity > 0.5 && (
                    <span style={{ fontSize: 9, color: "#ef4444", fontFamily: "monospace" }}>↑ accel</span>
                  )}
                </div>
                {c.possible_outcome && (
                  <p style={{ fontSize: 10, color: "#444", marginTop: 4, lineHeight: 1.4,
                    overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>
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