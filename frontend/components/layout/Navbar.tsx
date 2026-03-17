"use client"

import { useState, useEffect } from "react"
import { scoreColor, statusColor } from "@/lib/utils"
import type { KairosIndex } from "@/types"

interface NavbarProps {
  kairosIndex: KairosIndex | null
}

export function Navbar({ kairosIndex }: NavbarProps) {
  const [time, setTime] = useState("")

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toUTCString().slice(17, 25) + " UTC")
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const indexVal = kairosIndex?.index_value ?? 0
  const indexColor = scoreColor(indexVal)

  return (
    <header
      className="flex items-center justify-between px-6 h-14 flex-shrink-0"
      style={{ borderBottom: "1px solid #0f1f35", backgroundColor: "#050b18" }}
    >
      {/* left — logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-black"
            style={{ backgroundColor: "#f59e0b", color: "#050b18" }}
          >
            K
          </div>
          {/* live pulse dot */}
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse-red"
            style={{ backgroundColor: "#ef4444" }}
          />
        </div>
        <div>
          <span className="text-sm font-bold tracking-widest" style={{ color: "#e2e8f0" }}>
            KAIROS
          </span>
          <span
            className="ml-2 text-[10px] font-mono tracking-wider"
            style={{ color: "#475569" }}
          >
            CRISIS INTELLIGENCE
          </span>
        </div>
      </div>

      {/* center — foresight index */}
      {kairosIndex && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "#475569" }}>
            Foresight Index
          </span>
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded font-mono"
            style={{
              backgroundColor: `${indexColor}12`,
              border: `1px solid ${indexColor}30`,
            }}
          >
            <span className="text-lg font-black" style={{ color: indexColor }}>
              {indexVal}
            </span>
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: indexColor }}>
                {kairosIndex.status}
              </span>
              {kairosIndex.delta_1h !== 0 && (
                <span
                  className="text-[9px] font-mono"
                  style={{ color: kairosIndex.delta_1h > 0 ? "#ef4444" : "#22c55e" }}
                >
                  {kairosIndex.delta_1h > 0 ? "▲" : "▼"} {Math.abs(kairosIndex.delta_1h)} 1h
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* right — clock + status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono" style={{ color: "#475569" }}>
            LIVE
          </span>
        </div>
        <span className="text-[11px] font-mono tabular-nums" style={{ color: "#334155" }}>
          {time}
        </span>
      </div>
    </header>
  )
}