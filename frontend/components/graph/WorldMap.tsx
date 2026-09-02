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

  const active: Record<string, { severity: number; label: string }> = {}
  if (ripple) {
    active[ripple.origin_node] = { severity: 1.0, label: ripple.origin_node }
    for (const hop of ripple.hops) {
      if (NODE_TO_ISO[hop.node_id] || ROUTE_POSITIONS[hop.node_id]) {
        active[hop.node_id] = { severity: hop.severity_score, label: hop.node_label }
      }
    }
  }
  for (const c of clusters) {
    for (const r of c.primary_regions) {
      const match = Object.keys(NODE_TO_ISO).find(k => k.toLowerCase() === r.toLowerCase().slice(0, 3))
      if (match && !active[match]) active[match] = { severity: c.kairos_score / 100, label: r }
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
          .on("zoom", (event) => g.attr("transform", event.transform.toString()))
        svg.call(zoom as any)
        zoomRef.current = zoom

        // Graticule - very subtle
        const graticule = d3.geoGraticule()
        g.append("path").datum(graticule()).attr("d", path as any).attr("fill", "none")
          .attr("stroke", "var(--border)").attr("stroke-width", 0.5)

        // @ts-ignore
        const countries = topojson.feature(world, world.objects.countries)
        
        // Define filters inside SVG for the smoke effect
        const defs = svg.append("defs")
        const filter = defs.append("filter").attr("id", "smoke-glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%")
        filter.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", "8").attr("result", "blur")
        filter.append("feMerge").selectAll("feMergeNode").data(["blur", "SourceGraphic"]).enter().append("feMergeNode").attr("in", d => d)

        // Group for all map paths to isolate raise()
        const mapLayer = g.append("g").attr("class", "map-layer")

        // @ts-ignore
        const countryPaths = mapLayer.selectAll(".country").data((countries as any).features).enter().append("path").attr("class", "country")
          .attr("d", path as any)
          .attr("fill", (d: any) => {
            const nodeId = numericToNode[+d.id]
            if (!nodeId || !active[nodeId]) return "#fcfcfc"
            const v = Math.round(240 - (active[nodeId].severity * 60))
            return `rgb(${v},${v},${v})`
          })
          .attr("stroke", "var(--border)")
          .attr("stroke-width", 0.5)
          .style("transition", "stroke 0.8s ease, stroke-width 0.8s ease, filter 0.8s ease")
          
        countryPaths.on("mouseenter", function(this: any) {
            d3.select(this)
              .attr("stroke", "transparent") // NO RED LINE!
              .attr("stroke-width", 2)
              .style("filter", "drop-shadow(0px 0px 15px rgba(255, 51, 51, 1))") // ONLY SMOKE
              .raise() // bring to front so stroke doesn't get clipped by neighbors
          })
          .on("mouseleave", function(this: any) {
            d3.select(this)
              .attr("stroke", "var(--border)")
              .attr("stroke-width", 0.5)
              .style("filter", "none")
          })

        // Create interactive ring markers (like Image 2)
        const markersLayer = g.append("g").attr("class", "markers-layer")
        
        // Find centroids for active nodes
        const markerData = Object.keys(active).map(nodeId => {
          const entry = Object.entries(numericToNode).find(([num, id]) => id === nodeId)
          if (!entry) return null
          // @ts-ignore
          const feature = countries.features.find((f: any) => +f.id === +entry[0])
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
          .on("click", (event: any, d: any) => {
             // Pass up or handle local state. We will handle local state via a custom event or we can just bind to React state.
             // Since d3 is outside react render cycle, we use a window event.
             window.dispatchEvent(new CustomEvent("open-luxury-popup", { detail: d }))
          })

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

      {/* Luxury Popup Card Overlay (Like Image 3) */}
      {activePopup && (
        <div style={{
          position: "absolute",
          left: activePopup.x + 40,
          top: activePopup.y - 120,
          width: 320,
          zIndex: 50,
        }} className="luxury-card luxury-card-chamfer fade-in">
          
          {/* Close Button floating outside */}
          <button 
            onClick={() => setActivePopup(null)}
            style={{
              position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)",
              width: 40, height: 40, borderRadius: "50%",
              background: "#fff", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 60
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>

          <div style={{ padding: "40px 32px" }}>
            <h3 style={{ 
              fontFamily: "var(--font-serif)", fontSize: 26, 
              fontWeight: 400, color: "#1A1A1A", 
              textTransform: "uppercase", letterSpacing: "0.05em",
              margin: "0 0 24px 0", lineHeight: 1.1
            }}>
              {activePopup.label}
            </h3>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 13,
              color: "#333", lineHeight: 1.6, fontWeight: 300,
              margin: 0
            }}>
              Severity Index: <span style={{ fontWeight: 500 }}>{Math.round(activePopup.severity * 100)}</span><br/><br/>
              Monitoring anomalous supply chain and stability signals across regional nodes.
            </p>
          </div>
        </div>
      )}
    </>
  )
}