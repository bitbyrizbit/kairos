"use client"

import { useEffect, useState } from "react"
import { scoreColor, scoreLabel } from "@/lib/utils"
import type { KairosIndex } from "@/types"

interface Props {
  kairosIndex: KairosIndex | null
}

export function Navbar({ kairosIndex }: Props) {
  const [time, setTime] = useState("")

  useEffect(() => {
    const tick = () => {
  const now = new Date()
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000))
  const hh = String(ist.getUTCHours()).padStart(2, "0")
  const mm = String(ist.getUTCMinutes()).padStart(2, "0")
  const ss = String(ist.getUTCSeconds()).padStart(2, "0")
  setTime(`${hh}:${mm}:${ss} IST`)
}
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const val = kairosIndex?.index_value ?? 0
  const color = scoreColor(val)
  const label = scoreLabel(val)

  return (
    <div
      style={{
        height: 48,
        backgroundColor: "#0a0a0a",
        borderBottom: "1px solid #1e1e1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        flexShrink: 0,
      }}
    >
      {/* logo */}
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", cursor: "pointer" }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          backgroundColor: "#f59e0b",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 900, color: "#000", letterSpacing: 1,
          position: "relative",
        }}>
          K
          <span style={{
            position: "absolute", top: -3, right: -3,
            width: 7, height: 7, borderRadius: "50%",
            backgroundColor: "#ef4444",
            animation: "pulse-dot 1.5s ease-in-out infinite",
          }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.15em", color: "#f0f0f0" }}>
            KAIROS
          </div>
          <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", marginTop: -1 }}>
            CRISIS INTELLIGENCE
          </div>
        </div>
      </a>

      {/* foresight index */}
      {kairosIndex && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "4px 14px", borderRadius: 6,
          backgroundColor: `${color}10`,
          border: `1px solid ${color}25`,
        }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.15em" }}>FORESIGHT INDEX</div>
            <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.1em" }}>{kairosIndex.highest_risk_region} · {kairosIndex.highest_risk_commodity}</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "monospace", lineHeight: 1 }}>
            {val}
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: "0.15em" }}>{label}</div>
            {kairosIndex.delta_1h !== 0 && (
              <div style={{ fontSize: 9, color: kairosIndex.delta_1h > 0 ? "#ef4444" : "#22c55e" }}>
                {kairosIndex.delta_1h > 0 ? "▲" : "▼"} {Math.abs(kairosIndex.delta_1h)} 1h
              </div>
            )}
          </div>
        </div>
      )}

      {/* time */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block", animation: "pulse-dot 2s ease-in-out infinite" }} />
        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#555", letterSpacing: "0.05em" }}>{time}</span>
      </div>
    </div>
  )
}