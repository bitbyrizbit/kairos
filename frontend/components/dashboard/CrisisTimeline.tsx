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
    "72H": [], "01W": [], "01M": [], "03M+": [],
  }
  for (const h of hops) {
    const d = h.time_to_impact_days
    if (d <= 3) buckets["72H"].push(h)
    else if (d <= 7) buckets["01W"].push(h)
    else if (d <= 30) buckets["01M"].push(h)
    else buckets["03M+"].push(h)
  }
  return buckets
}

export function CrisisTimeline({ ripple, event }: Props) {
  if (!ripple) {
    return (
      <div style={{
        height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--font-mono-data)" }}>
          AWAITING ANALYSIS...
        </span>
      </div>
    )
  }

  const buckets = bucketHops(ripple.hops)

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", letterSpacing: "0.15em", fontFamily: "var(--font-mono-data)" }}>
          CRISIS TIMELINE
        </span>
        <span style={{ fontSize: 10, color: "var(--text2)", fontFamily: "var(--font-mono-data)" }}>
          {ripple.total_affected_nodes} NODES AFFECTED
        </span>
      </div>

      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0, backgroundColor: "rgba(255,0,0,0.03)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{
            width: 8, height: 8, backgroundColor: "var(--red)", marginTop: 4, flexShrink: 0,
            animation: "pulse-dot 1.5s ease-in-out infinite",
          }} />
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: "var(--red)", letterSpacing: "0.15em", marginBottom: 4, fontFamily: "var(--font-mono-data)" }}>ORIGIN EVENT</div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text1)", lineHeight: 1.4 }}>{event}</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
        {Object.entries(buckets).map(([bucket, hops]) => {
          if (!hops.length) return null
          return (
            <div key={bucket} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 16px", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--cyan)", letterSpacing: "0.15em", fontFamily: "var(--font-mono-data)" }}>
                  T+{bucket}
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
              </div>
              
              {hops.slice(0, 3).map((hop, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 16px", transition: "background 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div style={{ width: 6, height: 6, backgroundColor: impactColor(hop.impact), flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text1)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {hop.node_label}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text2)", fontFamily: "var(--font-mono-data)", flexShrink: 0 }}>{hop.region}</span>
                  <Badge label={hop.impact} type="impact" value={hop.impact} size="sm" />
                </div>
              ))}
              {hops.length > 3 && (
                <div style={{ padding: "4px 16px" }}>
                  <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono-data)" }}>
                    +{hops.length - 3} MORE NODES
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {Object.keys(ripple.sector_blast_radius).length > 0 && (
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text2)", letterSpacing: "0.15em", marginBottom: 8, fontFamily: "var(--font-mono-data)" }}>
            SECTOR BLAST RADIUS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(ripple.sector_blast_radius).slice(0, 8).map(([sector, impact]) => (
              <Badge key={sector} label={sector} type="impact" value={impact} size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}