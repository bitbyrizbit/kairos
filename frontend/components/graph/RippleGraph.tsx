"use client"

import { useEffect, useRef, useState } from "react"
import { impactColor } from "@/lib/utils"
import type { RippleChain } from "@/types"

interface Props {
  ripple: RippleChain | null
  isAnimating: boolean
}

export function RippleGraph({ ripple, isAnimating }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<any>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    if (cyRef.current) {
      cyRef.current.destroy()
      cyRef.current = null
    }

    if (!ripple) return

    const init = async () => {
      const cytoscape = (await import("cytoscape")).default

      const nodes: any[] = []
      const edges: any[] = []
      const seen = new Set<string>([ripple.origin_node])

      nodes.push({
        data: {
          id: ripple.origin_node,
          label: ripple.origin_node,
          fullLabel: ripple.origin_node,
          type: "origin",
          companies: "",
        }
      })

      for (const hop of ripple.hops) {
        if (!seen.has(hop.node_id)) {
          nodes.push({
            data: {
              id: hop.node_id,
              label: hop.node_label.length > 12 ? hop.node_label.slice(0, 11) + "…" : hop.node_label,
              fullLabel: hop.node_label,
              type: hop.impact,
              hop: hop.hop,
              severity: hop.severity_score,
              time: hop.time_to_impact,
              companies: hop.affected_companies.join(", "),
              region: hop.region,
            }
          })
          seen.add(hop.node_id)
        }
        const prev = ripple.hops.find(h => h.hop === hop.hop - 1)
        const src = prev ? prev.node_id : ripple.origin_node
        if (seen.has(src)) {
          edges.push({
            data: {
              id: `e-${src}-${hop.node_id}`,
              source: src, target: hop.node_id,
              impact: hop.impact,
            }
          })
        }
      }

      const cy = cytoscape({
        container: containerRef.current,
        elements: { nodes, edges },
        style: [
          {
            selector: "node",
            style: {
              "shape": "diamond",
              "background-color": (ele: any) => ele.data("type") === "origin" ? "#FF3333" : "rgba(15, 15, 18, 0.9)",
              "border-color": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return "#FF3333"
                return impactColor(t)
              },
              "border-width": (ele: any) => ele.data("type") === "origin" ? 2 : 1.5,
              "label": "data(label)",
              "color": "#F2F2F2",
              "font-size": "10px",
              "font-family": "monospace",
              "font-weight": "bold",
              "text-valign": "bottom",
              "text-margin-y": 6,
              "width": (ele: any) => ele.data("type") === "origin" ? 40 : 25,
              "height": (ele: any) => ele.data("type") === "origin" ? 40 : 25,
            }
          },
          {
            selector: "node:hover",
            style: {
              "border-width": 3,
              "background-color": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return "#FF3333"
                return "rgba(255,255,255,0.1)"
              },
            }
          },
          {
            selector: "edge",
            style: {
              "width": 1.5,
              "line-color": "rgba(255,255,255,0.15)",
              "target-arrow-color": "rgba(255,255,255,0.3)",
              "target-arrow-shape": "triangle",
              "curve-style": "taxi",
              "taxi-direction": "downward",
              "arrow-scale": 0.8,
              "opacity": 0.8,
            }
          },
        ],
        layout: {
          name: "breadthfirst",
          directed: true,
          padding: 30,
          spacingFactor: 1.8,
          animate: false,
        },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
      })

      cy.on("mouseover", "node", (evt: any) => {
        const node = evt.target
        const pos = evt.renderedPosition
        const data = node.data()
        const lines = [
          data.fullLabel,
          data.region ? `REGION: ${data.region}` : null,
          data.time ? `IMPACT: ${data.time}` : null,
          data.severity ? `SEVERITY: ${Math.round(data.severity * 100)}` : null,
          data.companies ? `COMPANIES: ${data.companies}` : null,
        ].filter(Boolean).join("\n")
        setTooltip({ x: pos.x, y: pos.y - 10, content: lines })
      })

      cy.on("mouseout", "node", () => setTooltip(null))

      cyRef.current = cy

      if (isAnimating) {
        cy.nodes().style("opacity", 0)
        cy.edges().style("opacity", 0)
        cy.getElementById(ripple.origin_node).style("opacity", 1)

        let i = 0
        const timer = setInterval(() => {
          if (i >= ripple.hops.length) { clearInterval(timer); return }
          const hop = ripple.hops[i]
          cy.getElementById(hop.node_id).animate({ style: { opacity: 1 } }, { duration: 200 })
          cy.edges(`[target = "${hop.node_id}"]`).animate({ style: { opacity: 1 } }, { duration: 200 })
          i++
        }, 150)
      }
    }

    init()

    return () => {
      if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null }
    }
  }, [ripple])

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)", letterSpacing: "0.15em", fontFamily: "var(--font-mono-data)" }}>RIPPLE CASCADE</span>
        {ripple && (
          <span style={{ fontSize: 10, color: "var(--cyan)", fontFamily: "var(--font-mono-data)", fontWeight: 700 }}>
            {ripple.total_hops} HOPS / {ripple.total_affected_nodes} NODES
          </span>
        )}
      </div>

      {!ripple ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 100, height: 100, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(45deg)" }}>
            <div style={{ width: 60, height: 60, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 8, height: 8, backgroundColor: "var(--red)" }} className="pulse-dot" />
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", fontFamily: "var(--font-mono-data)", marginTop: 20 }}>
            AWAITING EVENT...
          </span>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
          {tooltip && (
            <div style={{
              position: "absolute",
              left: Math.min(tooltip.x + 16, 240),
              top: Math.max(tooltip.y - 70, 4),
              padding: "10px 14px",
              backgroundColor: "var(--bg2)", border: "1px solid var(--border)", backdropFilter: "blur(8px)",
              fontSize: 10, fontFamily: "var(--font-mono-data)", color: "var(--text1)", fontWeight: 600,
              pointerEvents: "none", zIndex: 20, whiteSpace: "pre", lineHeight: 1.6,
              boxShadow: "0 8px 32px rgba(0,0,0,0.8)", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))"
            }}>
              {tooltip.content}
            </div>
          )}
        </div>
      )}
    </div>
  )
}