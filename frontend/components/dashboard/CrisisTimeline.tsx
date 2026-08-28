"use client"

import { Badge } from "@/components/ui/Badge"
import type { RippleChain } from "@/types"

interface Props {
  ripple: RippleChain | null
  event: string
}

function bucketHops(hops: RippleChain["hops"]) {
  const buckets: Record<string, typeof hops> = {
    "72 Hours": [], "1 Week": [], "1 Month": [], "3+ Months": [],
  }
  for (const h of hops) {
    const d = h.time_to_impact_days
    if (d <= 3) buckets["72 Hours"].push(h)
    else if (d <= 7) buckets["1 Week"].push(h)
    else if (d <= 30) buckets["1 Month"].push(h)
    else buckets["3+ Months"].push(h)
  }
  return buckets
}

export function CrisisTimeline({ ripple, event }: Props) {
  if (!ripple) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 13, color: "var(--ink-lighter)", fontFamily: "var(--font-sans)" }}>
          Awaiting scenario
        </span>
      </div>
    )
  }

  const buckets = bucketHops(ripple.hops)

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
      }}>
        <h2 style={{ fontSize: 16, fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--ink)", margin: 0 }}>
          Timeline projection
        </h2>
        <span style={{ fontSize: 11, color: "var(--ink-light)", fontFamily: "var(--font-sans)" }}>
          {ripple.total_affected_nodes} nodes affected
        </span>
      </div>

      <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", flexShrink: 0, backgroundColor: "var(--surface)" }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--ink)", letterSpacing: "0.05em", marginBottom: 6, fontFamily: "var(--font-sans)" }}>Origin</div>
        <p style={{ fontSize: 14, fontWeight: 400, color: "var(--ink)", lineHeight: 1.5, fontFamily: "var(--font-serif)" }}>{event}</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 0" }}>
        {Object.entries(buckets).map(([bucket, hops]) => {
          if (!hops.length) return null
          return (
            <div key={bucket} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 24px", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontStyle: "italic", color: "var(--ink-light)", fontFamily: "var(--font-serif)" }}>
                  {bucket}
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
              </div>
              
              {hops.slice(0, 3).map((hop, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 24px", transition: "background 0.3s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span style={{ fontSize: 13, fontWeight: 400, color: "var(--ink)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>
                    {hop.node_label}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--ink-light)", fontFamily: "var(--font-sans)", flexShrink: 0 }}>{hop.region}</span>
                  <Badge label={hop.impact} />
                </div>
              ))}
              {hops.length > 3 && (
                <div style={{ padding: "8px 24px" }}>
                  <span style={{ fontSize: 11, color: "var(--ink-lighter)", fontFamily: "var(--font-sans)", fontStyle: "italic" }}>
                    + {hops.length - 3} additional nodes
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}