"use client"

import { useEffect, useRef, useState } from "react"
import { impactColor, scoreColor } from "@/lib/utils"
import type { RippleChain } from "@/types"

interface Props {
  ripple: RippleChain | null
  isAnimating: boolean
}

// cytoscape loaded dynamically — it touches window so cant be imported at module level in next.js
export function RippleGraph({ ripple, isAnimating }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!ripple || !containerRef.current) return

    let cy: any = null

    const init = async () => {
      const cytoscape = (await import("cytoscape")).default

      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }

      const nodes: any[] = []
      const edges: any[] = []

      // origin node
      nodes.push({
        data: {
          id: ripple.origin_node,
          label: ripple.origin_node,
          type: "origin",
          score: 100,
        }
      })

      // hop nodes + edges
      const seen = new Set<string>([ripple.origin_node])
      for (const hop of ripple.hops) {
        if (!seen.has(hop.node_id)) {
          nodes.push({
            data: {
              id: hop.node_id,
              label: hop.node_label.length > 14
                ? hop.node_label.slice(0, 12) + ".."
                : hop.node_label,
              type: hop.impact,
              score: Math.round(hop.severity_score * 100),
              hop: hop.hop,
            }
          })
          seen.add(hop.node_id)
        }

        const prevNode = ripple.hops.find(h => h.hop === hop.hop - 1)
        const sourceId = prevNode ? prevNode.node_id : ripple.origin_node
        edges.push({
          data: {
            id: `e-${sourceId}-${hop.node_id}`,
            source: sourceId,
            target: hop.node_id,
            impact: hop.impact,
          }
        })
      }

      cy = cytoscape({
        container: containerRef.current,
        elements: { nodes, edges },
        style: [
          {
            selector: "node",
            style: {
              "background-color": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return "#f59e0b"
                return impactColor(t) + "33"
              },
              "border-color": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return "#f59e0b"
                return impactColor(t)
              },
              "border-width": (ele: any) => ele.data("type") === "origin" ? 3 : 1.5,
              "label": "data(label)",
              "color": "#e2e8f0",
              "font-size": "9px",
              "font-family": "monospace",
              "text-valign": "bottom",
              "text-margin-y": 4,
              "width": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return 36
                if (t === "critical") return 28
                return 22
              },
              "height": (ele: any) => {
                const t = ele.data("type")
                if (t === "origin") return 36
                if (t === "critical") return 28
                return 22
              },
            }
          },
          {
            selector: "edge",
            style: {
              "width": 1,
              "line-color": (ele: any) => impactColor(ele.data("impact")) + "55",
              "target-arrow-color": (ele: any) => impactColor(ele.data("impact")),
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              "arrow-scale": 0.6,
            }
          },
          {
            selector: "node.highlighted",
            style: {
              "border-width": 3,
              "background-color": (ele: any) => impactColor(ele.data("type")) + "66",
            }
          }
        ],
        layout: {
          name: "breadthfirst",
          directed: true,
          padding: 20,
          spacingFactor: 1.4,
        },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
      })

      cyRef.current = cy
      setReady(true)

      // animate hops one by one if isAnimating
      if (isAnimating) {
        const allNodes = cy.nodes()
        allNodes.style("opacity", 0)
        cy.edges().style("opacity", 0)

        // show origin first
        cy.getElementById(ripple.origin_node).style("opacity", 1)

        let i = 0
        const interval = setInterval(() => {
          if (i >= ripple.hops.length) {
            clearInterval(interval)
            return
          }
          const hop = ripple.hops[i]
          cy.getElementById(hop.node_id).style("opacity", 1)
          // show edge too
          cy.edges().filter((e: any) => e.data("target") === hop.node_id).style("opacity", 1)
          i++
        }, 300)
      }
    }

    init()

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, [ripple, isAnimating])

  return (
    <div className="card flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #0f1f35" }}
      >
        <span className="text-xs font-mono font-semibold tracking-wider uppercase" style={{ color: "#94a3b8" }}>
          Ripple Propagation
        </span>
        {ripple && (
          <span className="text-[10px] font-mono" style={{ color: "#334155" }}>
            {ripple.total_hops} hops · {ripple.total_affected_nodes} nodes
          </span>
        )}
      </div>

      {!ripple ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="relative w-16 h-16">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border"
                style={{
                  borderColor: "#1e3a5f",
                  transform: `scale(${1 + i * 0.4})`,
                  opacity: 1 - i * 0.3,
                  animation: `ripple-out ${1.5 + i * 0.5}s ease-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                }}
              />
            ))}
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#f59e0b22", border: "1px solid #f59e0b44" }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
            </div>
          </div>
          <p className="text-xs font-mono" style={{ color: "#334155" }}>
            Awaiting disruption event
          </p>
        </div>
      ) : (
        <div ref={containerRef} className="flex-1" style={{ minHeight: 0 }} />
      )}
    </div>
  )
}