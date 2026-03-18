"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { scoreColor } from "@/lib/utils"
import type { RippleChain, SignalCluster } from "@/types"

interface Props {
  ripple: RippleChain | null
  clusters: SignalCluster[]
}

const NODE_TO_ISO: Record<string, number> = {
  TWN: 158, CHN: 156, USA: 840, DEU: 276,
  JPN: 392, KOR: 410, IND: 356, RUS: 643,
  UKR: 804, SAU: 682, IRN: 364, ARE: 784,
  MYS: 458, VNM: 704, THA: 764, IDN: 360,
  BRA: 76,  MEX: 484, CAN: 124, AUS: 36,
  ZAF: 710, EGY: 818, NLD: 528, GBR: 826,
  FRA: 250,
}

const ROUTE_POSITIONS: Record<string, [number, number]> = {
  TR_SUEZ: [54, 42], TR_MALACCA: [74, 52],
  TR_HORMUZ: [61, 44], TR_PANAMA: [22, 50],
  TR_BOSPHORUS: [54, 32], TR_SOUTHCHINA: [76, 46],
}

export function WorldMap({ ripple, clusters }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<any>(null)
  const zoomRef = useRef<any>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [mapReady, setMapReady] = useState(false)

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
      const match = Object.keys(NODE_TO_ISO).find(
        k => k.toLowerCase() === r.toLowerCase().slice(0, 3)
      )
      if (match && !active[match]) {
        active[match] = { severity: c.kairos_score / 100, label: r }
      }
    }
  }

  // reverse lookup: numeric id → node id
  const numericToNode: Record<number, string> = {}
  for (const [nodeId, num] of Object.entries(NODE_TO_ISO)) {
    numericToNode[num] = nodeId
  }

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !svgRef.current) return

    const draw = async () => {
      try {
        const [d3, topojson] = await Promise.all([
          import("d3"),
          import("topojson-client"),
        ])

        const resp = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        const world = await resp.json()

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove()

        const W = svgRef.current!.clientWidth || 800
        const H = svgRef.current!.clientHeight || 360

        const projection = d3.geoNaturalEarth1()
  .scale(W / 6.2)
  .translate([W / 2, H / 2])
  .precision(0.1)

        const path = d3.geoPath().projection(projection)

        // group for zoom/pan
        const g = svg.append("g")
        gRef.current = g

        // zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([1, 12])
          .translateExtent([[0, 0], [W, H]])
          .on("zoom", (event) => {
            g.attr("transform", event.transform.toString())
          })

        svg.call(zoom as any)
        zoomRef.current = zoom

        // graticule lines
        const graticule = d3.geoGraticule()
        g.append("path")
          .datum(graticule())
          .attr("d", path as any)
          .attr("fill", "none")
          .attr("stroke", "#161616")
          .attr("stroke-width", 0.4)

        // sphere outline
        g.append("path")
          .datum({ type: "Sphere" })
          .attr("d", path as any)
          .attr("fill", "none")
          .attr("stroke", "#1e1e1e")
          .attr("stroke-width", 0.5)

        // @ts-ignore
        const countries = topojson.feature(world, world.objects.countries)

        // @ts-ignore
        g.selectAll(".country")
          .data((countries as any).features)
          .enter()
          .append("path")
          .attr("class", "country")
          .attr("d", path as any)
          .attr("fill", (d: any) => {
            const nodeId = numericToNode[+d.id]
            if (!nodeId || !active[nodeId]) return "#161616"
            return scoreColor(Math.round(active[nodeId].severity * 100))
          })
          .attr("fill-opacity", (d: any) => {
            const nodeId = numericToNode[+d.id]
            if (!nodeId || !active[nodeId]) return 0.8
            return 0.25 + active[nodeId].severity * 0.55
          })
          .attr("stroke", (d: any) => {
            const nodeId = numericToNode[+d.id]
            if (!nodeId || !active[nodeId]) return "#222"
            return scoreColor(Math.round(active[nodeId].severity * 100))
          })
          .attr("stroke-width", (d: any) => {
            const nodeId = numericToNode[+d.id]
            if (!nodeId || !active[nodeId]) return 0.3
            return 1.2
          })
          .style("cursor", (d: any) => {
            const nodeId = numericToNode[+d.id]
            return nodeId && active[nodeId] ? "pointer" : "default"
          })
          .on("mouseenter", function(this: any, event: any, d: any) {
            const nodeId = numericToNode[+d.id]
            if (!nodeId || !active[nodeId]) return
            d3.select(this).attr("fill-opacity", 0.9)
            const rect = svgRef.current!.getBoundingClientRect()
            setTooltip({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              text: `${active[nodeId].label} · Score ${Math.round(active[nodeId].severity * 100)}`,
            })
          })
          .on("mousemove", function(this: any, event: any, d: any) {
            const nodeId = numericToNode[+d.id]
            if (!nodeId || !active[nodeId]) return
            const rect = svgRef.current!.getBoundingClientRect()
            setTooltip(prev => prev ? {
              ...prev,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            } : null)
          })
          .on("mouseleave", function(this: any, event: any, d: any) {
            const nodeId = numericToNode[+d.id]
            if (!nodeId || !active[nodeId]) return
            const sev = active[nodeId]?.severity ?? 0
            d3.select(this).attr("fill-opacity", 0.25 + sev * 0.55)
            setTooltip(null)
          })

        // country borders
        // @ts-ignore
        const borders = topojson.mesh(world, world.objects.countries, (a: any, b: any) => a !== b)
        g.append("path")
          .datum(borders)
          .attr("d", path as any)
          .attr("fill", "none")
          .attr("stroke", "#252525")
          .attr("stroke-width", 0.4)

        // trade route markers
        for (const [nodeId, [px, py]] of Object.entries(ROUTE_POSITIONS)) {
          if (!active[nodeId]) continue
          const x = (px / 100) * W
          const y = (py / 100) * H
          const color = scoreColor(Math.round(active[nodeId].severity * 100))

          g.append("circle")
            .attr("cx", x).attr("cy", y).attr("r", 8)
            .attr("fill", color).attr("fill-opacity", 0.12)

          g.append("circle")
            .attr("cx", x).attr("cy", y).attr("r", 3.5)
            .attr("fill", color)
            .attr("stroke", "#000").attr("stroke-width", 0.5)

          g.append("text")
            .attr("x", x).attr("y", y - 7)
            .attr("text-anchor", "middle")
            .attr("font-size", "7px")
            .attr("font-family", "monospace")
            .attr("fill", color)
            .attr("pointer-events", "none")
            .text(nodeId.replace("TR_", ""))
        }

        setMapReady(true)
      } catch (err) {
        console.log("Map load error:", err)
      }
    }

    draw()
  }, [mounted, ripple, clusters])

  const resetZoom = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return
    import("d3").then(d3 => {
      d3.select(svgRef.current as SVGSVGElement)
        .transition().duration(400)
        .call(zoomRef.current.transform, d3.zoomIdentity)
    })
  }, [])

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      backgroundColor: "#080808", border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden",
    }}>
      {/* header */}
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid #1a1a1a", flexShrink: 0,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#666", letterSpacing: "0.15em" }}>GLOBAL RISK MAP</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[["#ef4444", "Critical"], ["#f97316", "High"], ["#f59e0b", "Elevated"], ["#22c55e", "Low"]].map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: c as string, opacity: 0.8 }} />
                <span style={{ fontSize: 8, color: "#444" }}>{l}</span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: 8, color: "#2a2a2a" }}>|</span>
          <span style={{ fontSize: 8, color: "#333", fontFamily: "monospace" }}>scroll to zoom · drag to pan</span>
        </div>
      </div>

      {/* map */}
      <div style={{ flex: 1, position: "relative", minHeight: 0, overflow: "hidden", backgroundColor: "#080808" }}>
        <svg
          ref={svgRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />

        {/* tooltip */}
        {tooltip && (
          <div style={{
            position: "absolute",
            left: Math.min(tooltip.x + 12, (svgRef.current?.clientWidth ?? 400) - 160),
            top: Math.max(tooltip.y - 30, 4),
            padding: "5px 10px", borderRadius: 4, pointerEvents: "none", zIndex: 20,
            backgroundColor: "#0d0d0d", border: "1px solid #2a2a2a",
            fontSize: 10, fontFamily: "monospace", color: "#ccc",
            whiteSpace: "nowrap",
          }}>
            {tooltip.text}
          </div>
        )}

        {/* reset zoom */}
        {mapReady && (
          <button
            onClick={resetZoom}
            style={{
              position: "absolute", bottom: 8, right: 8, zIndex: 10,
              padding: "3px 8px", borderRadius: 3, cursor: "pointer",
              backgroundColor: "#111", border: "1px solid #222",
              fontSize: 8, fontFamily: "monospace", color: "#444",
            }}
          >
            RESET ZOOM
          </button>
        )}

        {!mapReady && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 10, color: "#333", fontFamily: "monospace" }}>Loading map...</span>
          </div>
        )}
      </div>
    </div>
  )
}