"use client"

import { useEffect, useRef, useState } from "react"
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
              "shape": "ellipse",
              "background-color": (ele: any) => ele.data("type") === "origin" ? "#111" : "#fff",
              "border-color": "#111",
              "border-width": 1,
              "label": "data(label)",
              "color": "#111",
              "font-size": "10px",
              "font-family": "var(--font-sans)",
              "text-valign": "bottom",
              "text-margin-y": 6,
              "width": (ele: any) => ele.data("type") === "origin" ? 24 : 12,
              "height": (ele: any) => ele.data("type") === "origin" ? 24 : 12,
            }
          },
          {
            selector: "edge",
            style: {
              "width": 1,
              "line-color": "#e0e0dd",
              "target-arrow-color": "#111",
              "target-arrow-shape": "vee",
              "curve-style": "bezier",
              "arrow-scale": 0.8,
            }
          },
        ],
        layout: {
          name: "breadthfirst",
          directed: true,
          padding: 40,
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
        setTooltip({ x: pos.x, y: pos.y - 10, content: node.data("fullLabel") })
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
          cy.getElementById(hop.node_id).animate({ style: { opacity: 1 } }, { duration: 300 })
          cy.edges(`[target = "${hop.node_id}"]`).animate({ style: { opacity: 1 } }, { duration: 300 })
          i++
        }, 150)
      }
    }
    init()
    return () => { if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null } }
  }, [ripple])

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
      }}>
        <h2 style={{ fontSize: 16, fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--ink)", margin: 0 }}>
          Simulation cascade
        </h2>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        {tooltip && (
          <div style={{
            position: "absolute",
            left: tooltip.x + 10, top: tooltip.y - 30,
            padding: "4px 8px", background: "var(--surface)", border: "1px solid var(--border)",
            fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--ink)",
            pointerEvents: "none", zIndex: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            borderRadius: 2,
          }}>
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  )
}