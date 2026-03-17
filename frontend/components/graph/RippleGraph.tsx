"use client"

import { useEffect, useRef } from "react"
import { impactColor } from "@/lib/utils"
import type { RippleChain } from "@/types"

interface Props {
  ripple: RippleChain | null
  isAnimating: boolean
}

export function RippleGraph({ ripple, isAnimating }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // destroy previous instance — this fixes the re-render issue
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
        data: { id: ripple.origin_node, label: ripple.origin_node, type: "origin" }
      })

      for (const hop of ripple.hops) {
        if (!seen.has(hop.node_id)) {
          nodes.push({
            data: {
              id: hop.node_id,
              label: hop.node_label.length > 12 ? hop.node_label.slice(0, 11) + "…" : hop.node_label,
              type: hop.impact,
              hop: hop.hop,
            }
          })
          seen.add(hop.node_id)
        }
        const prev = ripple.hops.find(h => h.hop === hop.hop - 1)
        const src = prev ? prev.node_id : ripple.origin_node
        if (seen.has(src)) {
          edges.push({ data: { id: `e-${src}-${hop.node_id}`, source: src, target: hop.node_id, impact: hop.impact } })
        }
      }

      const cy = cytoscape({
        container: containerRef.current,
        elements: { nodes, edges },
        style: [
          {
            selector: "node",
            style: {
              "background-color": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return "#f59e0b"
                return impactColor(t) + "22"
              },
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
              "text-valign": "bottom",
              "text-margin-y": 5,
              "width": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return 44
                if (t === "critical") return 36
                if (t === "high") return 32
                return 26
              },
              "height": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return 44
                if (t === "critical") return 36
                if (t === "high") return 32
                return 26
              },
            }
          },
          {
            selector: "edge",
            style: {
              "width": 1.5,
              "line-color": (ele: any) => impactColor(ele.data("impact")) + "44",
              "target-arrow-color": (ele: any) => impactColor(ele.data("impact")) + "88",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              "arrow-scale": 0.7,
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

      cyRef.current = cy

      // animate hops appearing one by one
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
        }, 250)
      }
    }

    init()

    return () => {
      if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null }
    }
  }, [ripple]) // ripple in deps — rebuilds completely on new event

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid #1a1a1a",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#666", letterSpacing: "0.15em" }}>RIPPLE PROPAGATION</span>
        {ripple && (
          <span style={{ fontSize: 9, color: "#333", fontFamily: "monospace" }}>
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
          <span style={{ fontSize: 11, color: "#333", fontFamily: "monospace" }}>
            Awaiting disruption event
          </span>
        </div>
      ) : (
        <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
      )}
    </div>
  )
}