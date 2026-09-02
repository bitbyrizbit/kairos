"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { RippleChain, SignalCluster } from "@/types"

interface Props {
  ripple: RippleChain | null
  clusters: SignalCluster[]
}

const NODE_TO_ISO: Record<string, number> = {
  TWN: 158, CHN: 156, USA: 840, DEU: 276, JPN: 392, KOR: 410, IND: 356, RUS: 643,
  UKR: 804, SAU: 682, IRN: 364, ARE: 784, MYS: 458, VNM: 704, THA: 764, IDN: 360,
  BRA: 76,  MEX: 484, CAN: 124, AUS: 36, ZAF: 710, EGY: 818, NLD: 528, GBR: 826, FRA: 250,
}

const ROUTE_POSITIONS: Record<string, [number, number]> = {
  TR_SUEZ: [54, 42], TR_MALACCA: [74, 52], TR_HORMUZ: [61, 44], TR_PANAMA: [22, 50],
  TR_BOSPHORUS: [54, 32], TR_SOUTHCHINA: [76, 46],
}

// Minimal editorial color scale
function severityIntensity(score: number): number {
  return score; // 0 to 1
}

export function WorldMap({ ripple, clusters }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<any>(null)
  const zoomRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)

  const active: Record<string, { severity: number; label: string; description?: string }> = {}
  if (ripple) {
    active[ripple.origin_node] = { severity: 1.0, label: ripple.origin_node, description: "Epicenter of cascading disruption." }
    for (const hop of ripple.hops) {
      if (NODE_TO_ISO[hop.node_id] || ROUTE_POSITIONS[hop.node_id]) {
        active[hop.node_id] = { severity: hop.severity_score, label: hop.node_label, description: hop.explanation }
      }
    }
  }
  for (const c of clusters) {
    for (const r of c.primary_regions) {
      const match = Object.keys(NODE_TO_ISO).find(k => k.toLowerCase() === r.toLowerCase().slice(0, 3))
      if (match && !active[match]) {
        active[match] = { severity: c.kairos_score / 100, label: r, description: `Active anomaly cluster: ${c.theme}` }
      }
    }
  }

  const numericToNode: Record<number, string> = {}
  for (const [nodeId, num] of Object.entries(NODE_TO_ISO)) numericToNode[num] = nodeId

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !svgRef.current) return
    const draw = async () => {
      try {
        const [d3, topojson] = await Promise.all([import("d3"), import("topojson-client")])
        const resp = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        const world = await resp.json()

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const W = window.innerWidth
        const H = window.innerHeight

        // Flat, paper-like projection
        const projection = d3.geoEquirectangular().scale(W / 6.5).translate([W / 2, H / 1.8]).precision(0.1)
        const path = d3.geoPath().projection(projection)

        const g = svg.append("g")
        gRef.current = g

        const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([1, 6]).translateExtent([[0, 0], [W, H]])
          .on("zoom", (event) => {
             g.attr("transform", event.transform.toString())
             window.dispatchEvent(new CustomEvent("open-luxury-popup", { detail: null }))
          })
        svg.call(zoom as any)
        zoomRef.current = zoom

        // @ts-ignore
        const land = topojson.feature(world, world.objects.land)
        // @ts-ignore
        const countries = topojson.feature(world, world.objects.countries)

        // Draw the ultra-premium continuous landmass (No borders, no grids)
        g.append("path")
          .datum(land)
          .attr("d", path as any)
          .attr("fill", "#E6E2D6") // Elegant architectural stone color
          .attr("stroke", "none")
          .style("filter", "drop-shadow(0 10px 20px rgba(0,0,0,0.02))")

        // Create interactive ring markers
        const markersLayer = g.append("g").attr("class", "markers-layer")
        
        // Find centroids for active nodes using the invisible country features
        const markerData = Object.keys(active).map(nodeId => {
          const entry = Object.entries(numericToNode).find(([num, id]) => id === nodeId)
          if (!entry) return null
          // @ts-ignore
          const feature = (countries as any).features.find((f: any) => +f.id === +entry[0])
          if (!feature) return null
          const centroid = path.centroid(feature)
          if (isNaN(centroid[0])) return null
          return { ...active[nodeId], x: centroid[0], y: centroid[1], nodeId }
        }).filter(Boolean)

        // Draw Rings
        const rings = markersLayer.selectAll(".ring").data(markerData).enter().append("g")
          .attr("class", "ring")
          .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`)
          .style("cursor", "pointer")
          
        rings.append("circle")
          .attr("r", 14)
          .attr("fill", "transparent")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.5)
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")

        rings.append("circle")
          .attr("r", 3)
          .attr("fill", "#ffffff")

        // Interactive hover area
        rings.append("circle")
          .attr("r", 20)
          .attr("fill", "transparent")
          .on("mouseenter", (event: any, d: any) => {
             const transform = d3.zoomTransform(svg.node() as Element)
             const screenX = transform.applyX(d.x)
             const screenY = transform.applyY(d.y)
             window.dispatchEvent(new CustomEvent("open-luxury-popup", { detail: { ...d, screenX, screenY } }))
          })
          .on("mouseleave", () => {
             window.dispatchEvent(new CustomEvent("open-luxury-popup", { detail: null }))
          })

        // Draw animated ripple lines if a ripple cascade is active
        if (ripple) {
          const originEntry = Object.entries(numericToNode).find(([_, id]) => id === ripple.origin_node)
          const originFeature = originEntry ? (countries as any).features.find((f: any) => +f.id === +originEntry[0]) : null
          const originCentroid = originFeature ? path.centroid(originFeature) : null

          if (originCentroid && !isNaN(originCentroid[0])) {
            const ripplePaths = markersLayer.append("g").attr("class", "ripple-lines")
            
            for (const hop of ripple.hops) {
              const targetEntry = Object.entries(numericToNode).find(([_, id]) => id === hop.node_id)
              const targetFeature = targetEntry ? (countries as any).features.find((f: any) => +f.id === +targetEntry[0]) : null
              const targetCentroid = targetFeature ? path.centroid(targetFeature) : null
              
              if (targetCentroid && !isNaN(targetCentroid[0])) {
                const dx = targetCentroid[0] - originCentroid[0]
                const dy = targetCentroid[1] - originCentroid[1]
                const dr = Math.sqrt(dx * dx + dy * dy) * 1.5 // nice bezier bend
                
                const pathNode = ripplePaths.append("path")
                  .attr("d", `M${originCentroid[0]},${originCentroid[1]} A${dr},${dr} 0 0,1 ${targetCentroid[0]},${targetCentroid[1]}`)
                  .attr("fill", "none")
                  .attr("stroke", "rgba(255, 60, 60, 0.6)")
                  .attr("stroke-width", 1.5)
                  .style("filter", "drop-shadow(0 0 6px rgba(255, 60, 60, 0.8))")
                  
                const length = (pathNode.node() as SVGPathElement).getTotalLength()
                pathNode.attr("stroke-dasharray", length + " " + length)
                  .attr("stroke-dashoffset", length)
                  .transition().duration(2500).ease(d3.easeCubicOut)
                  .attr("stroke-dashoffset", 0)
              }
            }
          }
        }

      } catch (err) { console.log("Map load error:", err) }
    }
    draw()
  }, [mounted, ripple, clusters])
  
  const [activePopup, setActivePopup] = useState<any>(null)
  
  useEffect(() => {
    const handler = (e: any) => setActivePopup(e.detail)
    window.addEventListener("open-luxury-popup", handler)
    return () => window.removeEventListener("open-luxury-popup", handler)
  }, [])

  return (
    <>
      <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Luxury Popup Card Overlay (Circular Lens) */}
      {activePopup && (
        <div 
          style={{
            position: "absolute",
            left: activePopup.screenX,
            top: activePopup.screenY - 140, // Offset it UP
            transform: "translate(-50%, -50%)",
            width: 240, height: 240, // Slightly smaller
            borderRadius: "50%",
            zIndex: 50,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center",
            padding: 24,
            background: "rgba(249, 249, 247, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.05)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
            pointerEvents: "none" // Let the ring underneath keep the mouse hover!
          }} 
          className="fade-in"
        >
            <h3 style={{ 
              fontFamily: "var(--font-serif)", fontSize: 24, 
              fontWeight: 400, color: "var(--ink)", 
              textTransform: "uppercase", letterSpacing: "0.1em",
              margin: "0 0 8px 0", lineHeight: 1.1
            }}>
              {activePopup.label}
            </h3>
            <span style={{ fontSize: 10, fontFamily: "var(--font-sans)", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink-light)", marginBottom: 12 }}>
              Severity: <strong style={{ color: "var(--ink)", fontSize: 12 }}>{Math.round(activePopup.severity * 100)}</strong>
            </span>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 11,
              color: "var(--ink-light)", lineHeight: 1.6, fontWeight: 300,
              margin: 0,
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"
            }}>
              {activePopup.description || "Monitoring anomalous supply chain and stability signals across regional nodes."}
            </p>
        </div>
      )}
    </>
  )
}