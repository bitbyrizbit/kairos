"use client"

import { useEffect, useRef } from "react"
import { scoreColor } from "@/lib/utils"
import type { RippleChain, SignalCluster } from "@/types"

interface Props {
  ripple: RippleChain | null
  clusters: SignalCluster[]
}

const POSITIONS: Record<string, [number, number]> = {
  TWN: [76, 38], CHN: [72, 35], USA: [18, 35], DEU: [48, 28],
  JPN: [80, 33], KOR: [77, 32], IND: [65, 40], RUS: [65, 22],
  UKR: [53, 27], SAU: [57, 42], IRN: [60, 38], ARE: [60, 42],
  MYS: [73, 48], VNM: [74, 43], THA: [72, 44], IDN: [75, 52],
  BRA: [28, 58], MEX: [16, 42], CAN: [18, 25], AUS: [78, 65],
  ZAF: [52, 68], EGY: [53, 38], NLD: [47, 26], GBR: [45, 26],
  FRA: [46, 28],
  TR_SUEZ: [54, 39], TR_MALACCA: [73, 49], TR_HORMUZ: [60, 41],
  TR_PANAMA: [20, 48], TR_BOSPHORUS: [53, 30], TR_SOUTHCHINA: [75, 44],
}

export function WorldMap({ ripple, clusters }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const active: Record<string, number> = {}
  if (ripple) {
    active[ripple.origin_node] = 1.0
    for (const hop of ripple.hops) {
      if (POSITIONS[hop.node_id]) active[hop.node_id] = hop.severity_score
    }
  }
  for (const c of clusters) {
    for (const r of c.primary_regions) {
      const k = Object.keys(POSITIONS).find(p => p.toLowerCase() === r.toLowerCase().slice(0, 3))
      if (k && !active[k]) active[k] = c.kairos_score / 100
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      const W = canvas.offsetWidth * window.devicePixelRatio
      const H = canvas.offsetHeight * window.devicePixelRatio
      canvas.width = W
      canvas.height = H
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      ctx.clearRect(0, 0, w, h)

      // draw all nodes
      for (const [id, [px, py]] of Object.entries(POSITIONS)) {
        const x = (px / 100) * w
        const y = (py / 100) * h
        const sev = active[id] ?? 0
        const isActive = sev > 0
        const color = isActive ? scoreColor(Math.round(sev * 100)) : "#2a2a2a"
        const size = isActive ? 5 + sev * 12 : 3

        if (isActive) {
          // glow
          const g = ctx.createRadialGradient(x, y, 0, x, y, size * 4)
          g.addColorStop(0, color + "55")
          g.addColorStop(1, "transparent")
          ctx.beginPath()
          ctx.arc(x, y, size * 4, 0, Math.PI * 2)
          ctx.fillStyle = g
          ctx.fill()

          // connection line to origin
          if (ripple && id !== ripple.origin_node && POSITIONS[ripple.origin_node]) {
            const [ox, oy] = POSITIONS[ripple.origin_node]
            ctx.beginPath()
            ctx.moveTo((ox / 100) * w, (oy / 100) * h)
            ctx.lineTo(x, y)
            ctx.strokeStyle = color + "22"
            ctx.lineWidth = 0.5
            ctx.setLineDash([3, 5])
            ctx.stroke()
            ctx.setLineDash([])
          }
        }

        // dot
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        // label for active nodes
        if (isActive && sev > 0.4) {
          ctx.font = "bold 8px monospace"
          ctx.fillStyle = color
          ctx.textAlign = "center"
          ctx.fillText(id, x, y - size - 4)
        }
      }
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [ripple, clusters])

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid #1a1a1a",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#666", letterSpacing: "0.15em" }}>GLOBAL RISK MAP</span>
        <div style={{ display: "flex", gap: 10 }}>
          {[["#ef4444", "Critical"], ["#f97316", "High"], ["#f59e0b", "Medium"], ["#22c55e", "Low"]].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: c }} />
              <span style={{ fontSize: 8, color: "#444" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        {/* grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        {!Object.keys(active).length && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, color: "#222", fontFamily: "monospace" }}>No active risk nodes</span>
          </div>
        )}
      </div>
    </div>
  )
}