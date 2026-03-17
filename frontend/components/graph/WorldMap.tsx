"use client"

import { useEffect, useRef } from "react"
import { scoreColor } from "@/lib/utils"
import type { RippleChain, SignalCluster } from "@/types"

interface Props {
  ripple: RippleChain | null
  clusters: SignalCluster[]
}

// country code → approximate [x%, y%] position on a 100x100 grid
const COUNTRY_POSITIONS: Record<string, [number, number]> = {
  TWN: [76, 38], CHN: [72, 35], USA: [18, 35], DEU: [48, 28],
  JPN: [80, 33], KOR: [77, 32], IND: [65, 40], RUS: [65, 22],
  UKR: [53, 27], SAU: [57, 42], IRN: [60, 38], ARE: [60, 42],
  MYS: [73, 48], VNM: [74, 43], THA: [72, 44], IDN: [75, 52],
  BRA: [28, 58], MEX: [16, 42], CAN: [18, 25], AUS: [78, 65],
  ZAF: [52, 68], EGY: [53, 38], NLD: [47, 26], GBR: [45, 26],
  FRA: [46, 28],
  // trade routes
  TR_SUEZ: [54, 39], TR_MALACCA: [73, 49], TR_HORMUZ: [60, 41],
  TR_PANAMA: [20, 48], TR_BOSPHORUS: [53, 30], TR_SOUTHCHINA: [75, 44],
}

export function WorldMap({ ripple, clusters }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // collect which node IDs are active and their severity
  const activeNodes: Record<string, number> = {}

  if (ripple) {
    activeNodes[ripple.origin_node] = 1.0
    for (const hop of ripple.hops) {
      if (COUNTRY_POSITIONS[hop.node_id]) {
        activeNodes[hop.node_id] = hop.severity_score
      }
    }
  }

  for (const cluster of clusters) {
    for (const region of cluster.primary_regions) {
      // try to find a matching node id
      const match = Object.keys(COUNTRY_POSITIONS).find(
        k => k.toLowerCase() === region.toLowerCase().slice(0, 3)
      )
      if (match && !activeNodes[match]) {
        activeNodes[match] = cluster.kairos_score / 100
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      canvas.width = W
      canvas.height = H

      ctx.clearRect(0, 0, W, H)

      // draw all known country dots
      for (const [nodeId, [px, py]] of Object.entries(COUNTRY_POSITIONS)) {
        const x = (px / 100) * W
        const y = (py / 100) * H
        const severity = activeNodes[nodeId] ?? 0
        const isActive = severity > 0

        const color = isActive ? scoreColor(Math.round(severity * 100)) : "#1e3a5f"
        const size = isActive ? 4 + severity * 6 : 2.5

        // glow for active nodes
        if (isActive) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
          gradient.addColorStop(0, color + "44")
          gradient.addColorStop(1, "transparent")
          ctx.beginPath()
          ctx.arc(x, y, size * 3, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = isActive ? color : "#1e3a5f"
        ctx.fill()

        // draw ripple lines between connected active nodes
        if (ripple && isActive && nodeId !== ripple.origin_node) {
          const originPos = COUNTRY_POSITIONS[ripple.origin_node]
          if (originPos) {
            const ox = (originPos[0] / 100) * W
            const oy = (originPos[1] / 100) * H
            ctx.beginPath()
            ctx.moveTo(ox, oy)
            ctx.lineTo(x, y)
            ctx.strokeStyle = color + "22"
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    draw()
    window.addEventListener("resize", draw)
    return () => window.removeEventListener("resize", draw)
  }, [ripple, clusters])

  return (
    <div className="card flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #0f1f35" }}
      >
        <span className="text-xs font-mono font-semibold tracking-wider uppercase" style={{ color: "#94a3b8" }}>
          Global Risk Map
        </span>
        <div className="flex items-center gap-3">
          {[
            { label: "Critical", color: "#ef4444" },
            { label: "High", color: "#f97316" },
            { label: "Medium", color: "#f59e0b" },
            { label: "Low", color: "#22c55e" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[9px] font-mono" style={{ color: "#475569" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        {/* subtle grid lines to suggest a map */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(30,58,95,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(30,58,95,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        {Object.keys(activeNodes).length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs font-mono" style={{ color: "#334155" }}>
              No active risk nodes
            </p>
          </div>
        )}
      </div>
    </div>
  )
}