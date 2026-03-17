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
  const top5 = [...clusters]
    .sort((a, b) => b.kairos_score - a.kairos_score)
    .slice(0, 5)

  return (
    <div className="card flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #0f1f35" }}
      >
        <span className="text-xs font-mono font-semibold tracking-wider uppercase" style={{ color: "#94a3b8" }}>
          Active Risk Clusters
        </span>
        <span className="text-[10px] font-mono" style={{ color: "#334155" }}>
          {clusters.length} detected
        </span>
      </div>

      {/* global index summary */}
      {kairosIndex && (
        <div
          className="flex items-center gap-4 px-4 py-3"
          style={{ borderBottom: "1px solid #0f1f35" }}
        >
          <ScoreRing score={kairosIndex.index_value} size={64} />
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: "#64748b" }}>
                Highest risk region
              </span>
              <span className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>
                {kairosIndex.highest_risk_region}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: "#64748b" }}>
                Top commodity
              </span>
              <span className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>
                {kairosIndex.highest_risk_commodity}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono" style={{ color: "#64748b" }}>
                Active clusters
              </span>
              <span className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>
                {kairosIndex.active_clusters}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* top 5 clusters */}
      <div className="flex-1 overflow-y-auto">
        {top5.length === 0 ? (
          <div className="flex items-center justify-center h-24">
            <span className="text-xs font-mono" style={{ color: "#334155" }}>
              No active clusters
            </span>
          </div>
        ) : (
          top5.map((cluster, i) => (
            <div
              key={cluster.cluster_id}
              className="flex items-start gap-3 px-4 py-3 card-hover cursor-default"
              style={{ borderBottom: "1px solid #0a1628" }}
            >
              {/* rank */}
              <span
                className="text-xs font-mono font-bold mt-0.5 w-4 flex-shrink-0"
                style={{ color: "#334155" }}
              >
                {i + 1}
              </span>

              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-semibold truncate"
                    style={{ color: "#e2e8f0" }}
                  >
                    {cluster.theme}
                  </span>
                  <span
                    className="text-sm font-black font-mono flex-shrink-0"
                    style={{ color: scoreColor(cluster.kairos_score) }}
                  >
                    {cluster.kairos_score}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    label={cluster.risk_status}
                    type="status"
                    value={cluster.risk_status}
                    size="sm"
                  />
                  {cluster.primary_regions[0] && (
                    <span className="text-[10px] font-mono" style={{ color: "#475569" }}>
                      {cluster.primary_regions[0]}
                    </span>
                  )}
                  {/* velocity indicator */}
                  {cluster.velocity > 0.5 && (
                    <span className="text-[10px] font-mono text-red-400">
                      ↑ accelerating
                    </span>
                  )}
                </div>

                <p className="text-[10px] font-mono line-clamp-2" style={{ color: "#475569" }}>
                  {cluster.possible_outcome}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}