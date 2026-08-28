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

        const projection = d3.geoNaturalEarth1().scale(W / 6).translate([W / 1.7, H / 2]).precision(0.1)
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
        
        // @ts-ignore
        const countryPaths = g.selectAll(".country").data((countries as any).features).enter().append("path").attr("class", "country")
          .attr("d", path as any)
          .attr("fill", (d: any) => {
            const nodeId = numericToNode[+d.id]
            if (!nodeId || !active[nodeId]) return "#fcfcfc"
            const v = Math.round(240 - (active[nodeId].severity * 60))
            return `rgb(${v},${v},${v})`
          })
          .attr("stroke", "var(--border)")
          .attr("stroke-width", 0.5)
          .style("transition", "stroke 0.8s ease, stroke-width 0.8s ease")
          
        countryPaths.on("mouseenter", function(this: any) {
            d3.select(this)
              .attr("stroke", "#ff3333")
              .attr("stroke-width", 1.5)
          })
          .on("mouseleave", function(this: any) {
            d3.select(this)
              .attr("stroke", "var(--border)")
              .attr("stroke-width", 0.5)
          })

        // Draw Markers (Score + Label) at centroids
        countryPaths.each(function(this: any, d: any) {
          const nodeId = numericToNode[+d.id]
          if (!nodeId || !active[nodeId]) return
          
          const centroid = path.centroid(d)
          if (isNaN(centroid[0]) || isNaN(centroid[1])) return

          const [x, y] = centroid
          const nodeData = active[nodeId]
          const displayScore = Math.round(nodeData.severity * 100)

          // Group for the pin
          const pin = g.append("g")
            .attr("transform", `translate(${x}, ${y})`)
            .style("pointer-events", "none")

          // Score text
          pin.append("text")
            .text(displayScore)
            .attr("text-anchor", "middle")
            .attr("y", -8)
            .attr("font-family", "var(--font-sans)")
            .attr("font-size", "14px")
            .attr("font-weight", "600")
            .attr("fill", "#000")

          // Label text
          pin.append("text")
            .text(nodeData.label)
            .attr("text-anchor", "middle")
            .attr("y", 6)
            .attr("font-family", "var(--font-sans)")
            .attr("font-size", "10px")
            .attr("font-weight", "400")
            .attr("fill", "#666")
            .attr("letter-spacing", "0.05em")
        })

        // Routes
        for (const [nodeId, [px, py]] of Object.entries(ROUTE_POSITIONS)) {
          if (!active[nodeId]) continue
          const x = (px / 100) * W
          const y = (py / 100) * H
          const displayScore = Math.round(active[nodeId].severity * 100)

          const pin = g.append("g")
            .attr("transform", `translate(${x}, ${y})`)
            .style("pointer-events", "none")

          pin.append("circle").attr("r", 4).attr("fill", "#000")

          pin.append("text")
            .text(displayScore)
            .attr("text-anchor", "middle")
            .attr("y", -12)
            .attr("font-family", "var(--font-sans)")
            .attr("font-size", "14px")
            .attr("font-weight", "600")
            .attr("fill", "#000")
            
          pin.append("text")
            .text(active[nodeId].label)
            .attr("text-anchor", "middle")
            .attr("y", 14)
            .attr("font-family", "var(--font-sans)")
            .attr("font-size", "10px")
            .attr("font-weight", "400")
            .attr("fill", "#666")
        }
      } catch (err) { console.log("Map load error:", err) }
    }
    draw()
  }, [mounted, ripple, clusters])

  // Map is interactive now, so remove pointerEvents: none from container
  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
    </div>
  )
}