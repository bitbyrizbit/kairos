"use client"

import { impactColor } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import type { RippleChain } from "@/types"

interface Props {
  ripple: RippleChain | null
  event: string
}

function bucketHops(hops: RippleChain["hops"]) {
  const buckets: Record<string, typeof hops> = {
    "72h": [], "1 week": [], "1 month": [], "3m+": [],
  }
  for (const h of hops) {
    const d = h.time_to_impact_days
    if (d <= 3) buckets["72h"].push(h)
    else if (d <= 7) buckets["1 week"].push(h)
    else if (d <= 30) buckets["1 month"].push(h)
    else buckets["3m+"].push(h)
  }
  return buckets
}

export function CrisisTimeline({ ripple, event }: Props) {
  if (!ripple) {
    return (
      <div style={{
        height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8,
      }}>
        <span style={{ fontSize: 11, color: "#333", fontFamily: "monospace" }}>
          Run analysis to see timeline
        </span>
      </div>
    )
  }

  const buckets = bucketHops(ripple.hops)

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid #1a1a1a",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#666", letterSpacing: "0.15em" }}>CRISIS TIMELINE</span>
        <span style={{ fontSize: 9, color: "#333", fontFamily: "monospace" }}>{ripple.total_affected_nodes} nodes</span>
      </div>

      {/* origin */}
      <div style={{ padding: "8px 14px", borderBottom: "1px solid #111", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#ef4444", marginTop: 3, flexShrink: 0, animation: "pulse-dot 1.5s ease-in-out infinite" }} />
          <div>
            <div style={{ fontSize: 8, fontWeight: 700, color: "#ef4444", letterSpacing: "0.15em", marginBottom: 2 }}>ORIGIN EVENT</div>
            <p style={{ fontSize: 10, color: "#aaa", lineHeight: 1.4 }}>{event}</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {Object.entries(buckets).map(([bucket, hops]) => {
          if (!hops.length) return null
          return (
            <div key={bucket} style={{ marginBottom: 12 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "4px 14px", marginBottom: 4,
              }}>
                <div style={{ flex: 1, height: 1, backgroundColor: "#1a1a1a" }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: "#444", letterSpacing: "0.15em", whiteSpace: "nowrap" }}>
                  T+{bucket}
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: "#1a1a1a" }} />
              </div>
              {hops.slice(0, 3).map((hop, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "5px 14px",
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: impactColor(hop.impact), flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#bbb", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {hop.node_label}
                  </span>
                  <span style={{ fontSize: 9, color: "#444", fontFamily: "monospace", flexShrink: 0 }}>{hop.region}</span>
                  <Badge label={hop.impact} type="impact" value={hop.impact} size="sm" />
                </div>
              ))}
              {hops.length > 3 && (
                <div style={{ padding: "2px 14px" }}>
                  <span style={{ fontSize: 9, color: "#333", fontFamily: "monospace" }}>+{hops.length - 3} more</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* blast radius */}
      {Object.keys(ripple.sector_blast_radius).length > 0 && (
        <div style={{ padding: "8px 14px", borderTop: "1px solid #1a1a1a", flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.15em", marginBottom: 6 }}>SECTOR BLAST RADIUS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {Object.entries(ripple.sector_blast_radius).slice(0, 8).map(([sector, impact]) => (
              <Badge key={sector} label={sector} type="impact" value={impact} size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}