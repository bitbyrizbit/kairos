"use client"

import { useEffect, useRef, useState } from "react"
import { impactColor, scoreColor } from "@/lib/utils"
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
              "background-color": (ele: any) => ele.data("type") === "origin" ? "#f59e0b" : "#1a1a1a",
              "border-color": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return "#f59e0b"
                return impactColor(t)
              },
              "border-width": (ele: any) => ele.data("type") === "origin" ? 2.5 : 1.5,
              "label": "data(label)",
              "color": "#cccccc",
              "font-size": "10px",
              "font-family": "monospace",
              "font-weight": 600,
              "text-valign": "bottom",
              "text-margin-y": 5,
              "width": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return 44
                if (t === "critical") return 36
                if (t === "high") return 30
                return 24
              },
              "height": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return 44
                if (t === "critical") return 36
                if (t === "high") return 30
                return 24
              },
            }
          },
          {
            selector: "node:hover",
            style: {
              "border-width": 2.5,
              "background-color": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return "#f59e0b"
                return "#252525"
              },
            }
          },
          {
            selector: "edge",
            style: {
              "width": 1.5,
              "line-color": "#2a2a2a",
              "target-arrow-color": "#3a3a3a",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              "arrow-scale": 0.7,
              "opacity": 0.7,
            }
          },
        ],
        layout: {
          name: "breadthfirst",
          directed: true,
          padding: 24,
          spacingFactor: 1.6,
          animate: false,
        },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
      })

      // node hover tooltip
      cy.on("mouseover", "node", (evt: any) => {
        const node = evt.target
        const pos = evt.renderedPosition
        const data = node.data()
        const lines = [
          data.fullLabel,
          data.region ? `Region: ${data.region}` : null,
          data.time ? `Impact: ${data.time}` : null,
          data.severity ? `Severity: ${Math.round(data.severity * 100)}` : null,
          data.companies ? `Companies: ${data.companies}` : null,
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
        }, 220)
      }
    }

    init()

    return () => {
      if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null }
    }
  }, [ripple])

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid #1a1a1a",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: "#666", letterSpacing: "0.15em" }}>RIPPLE PROPAGATION</span>
        {ripple && (
          <span style={{ fontSize: 9, color: "#555", fontFamily: "monospace", fontWeight: 600 }}>
            {ripple.total_hops} hops · {ripple.total_affected_nodes} nodes
          </span>
        )}
      </div>

      {!ripple ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 60, height: 60 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: "1px solid #1a1a1a",
                transform: `scale(${1 + i * 0.5})`,
                opacity: 1 - i * 0.3,
                animation: `pulse-dot ${1.5 + i * 0.4}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }} />
            ))}
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              backgroundColor: "#f59e0b15", border: "1px solid #f59e0b33",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#333", fontFamily: "monospace" }}>
            Awaiting disruption event
          </span>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
          {/* node tooltip */}
          {tooltip && (
            <div style={{
              position: "absolute",
              left: Math.min(tooltip.x + 12, 240),
              top: Math.max(tooltip.y - 60, 4),
              padding: "6px 10px", borderRadius: 4,
              backgroundColor: "#0d0d0d", border: "1px solid #2a2a2a",
              fontSize: 10, fontFamily: "monospace", color: "#ccc",
              pointerEvents: "none", zIndex: 20,
              whiteSpace: "pre", lineHeight: 1.6,
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}>
              {tooltip.content}
            </div>
          )}
        </div>
      )}
    </div>
  )
}