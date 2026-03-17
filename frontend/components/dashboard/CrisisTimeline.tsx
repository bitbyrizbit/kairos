"use client"

import { impactColor } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import type { RippleChain } from "@/types"

interface Props {
  ripple: RippleChain | null
  event: string
}

// group hops into time buckets for the timeline view
function bucketHops(hops: RippleChain["hops"]) {
  const buckets: Record<string, typeof hops> = {
    "72 hours": [],
    "1 week": [],
    "1 month": [],
    "3+ months": [],
  }

  for (const hop of hops) {
    const d = hop.time_to_impact_days
    if (d <= 3) buckets["72 hours"].push(hop)
    else if (d <= 7) buckets["1 week"].push(hop)
    else if (d <= 30) buckets["1 month"].push(hop)
    else buckets["3+ months"].push(hop)
  }

  return buckets
}

export function CrisisTimeline({ ripple, event }: Props) {
  if (!ripple) {
    return (
      <div className="card flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-xs font-mono" style={{ color: "#334155" }}>
            Run an analysis to see the crisis timeline
          </p>
        </div>
      </div>
    )
  }

  const buckets = bucketHops(ripple.hops)
  const bucketKeys = Object.keys(buckets)

  return (
    <div className="card flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #0f1f35" }}
      >
        <span className="text-xs font-mono font-semibold tracking-wider uppercase" style={{ color: "#94a3b8" }}>
          Crisis Timeline
        </span>
        <span className="text-[10px] font-mono" style={{ color: "#334155" }}>
          {ripple.total_affected_nodes} nodes affected
        </span>
      </div>

      {/* origin event */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid #0f1f35" }}>
        <div className="flex items-start gap-2">
          <div
            className="w-2 h-2 rounded-full mt-1 flex-shrink-0 animate-pulse-red"
            style={{ backgroundColor: "#ef4444" }}
          />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "#ef4444" }}>
              Origin Event
            </span>
            <p className="text-xs mt-0.5" style={{ color: "#e2e8f0" }}>
              {event}
            </p>
          </div>
        </div>
      </div>

      {/* timeline buckets */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {bucketKeys.map((bucket) => {
          const hops = buckets[bucket]
          if (!hops.length) return null

          return (
            <div key={bucket}>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="h-px flex-1"
                  style={{ backgroundColor: "#0f1f35" }}
                />
                <span
                  className="text-[10px] font-mono font-semibold tracking-wider uppercase px-2"
                  style={{ color: "#475569" }}
                >
                  T + {bucket}
                </span>
                <div
                  className="h-px flex-1"
                  style={{ backgroundColor: "#0f1f35" }}
                />
              </div>

              <div className="space-y-1.5">
                {hops.slice(0, 4).map((hop, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1.5 rounded"
                    style={{ backgroundColor: "#0a1628" }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: impactColor(hop.impact) }}
                    />
                    <span className="text-xs flex-1 truncate" style={{ color: "#cbd5e1" }}>
                      {hop.node_label}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: "#475569" }}>
                      {hop.region}
                    </span>
                    <Badge label={hop.impact} type="impact" value={hop.impact} size="sm" />
                  </div>
                ))}
                {hops.length > 4 && (
                  <p className="text-[10px] font-mono px-2" style={{ color: "#334155" }}>
                    +{hops.length - 4} more nodes
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* blast radius summary */}
      {Object.keys(ripple.sector_blast_radius).length > 0 && (
        <div
          className="px-4 py-3"
          style={{ borderTop: "1px solid #0f1f35" }}
        >
          <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "#475569" }}>
            Sector Blast Radius
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(ripple.sector_blast_radius)
              .slice(0, 8)
              .map(([sector, impact]) => (
                <Badge
                  key={sector}
                  label={sector}
                  type="impact"
                  value={impact as any}
                  size="sm"
                />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}