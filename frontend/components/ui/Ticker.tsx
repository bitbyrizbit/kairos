"use client"

import { useEffect, useRef } from "react"
import { scoreColor } from "@/lib/utils"
import type { SignalCluster } from "@/types"

interface TickerProps {
  clusters: SignalCluster[]
}

export function Ticker({ clusters }: TickerProps) {
  const items = clusters.flatMap(c =>
    c.signals.slice(0, 2).map(s => ({
      text: s.headline,
      score: c.kairos_score,
      source: s.source,
    }))
  )

  if (!items.length) {
    return (
      <div
        className="h-8 flex items-center px-4 text-xs font-mono"
        style={{ color: "#475569", borderBottom: "1px solid #0f1f35" }}
      >
        Scanning global signals...
      </div>
    )
  }

  return (
    <div
      className="h-8 overflow-hidden relative flex items-center"
      style={{ borderBottom: "1px solid #0f1f35", backgroundColor: "#050b18" }}
    >
      {/* LIVE indicator */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 px-3 z-10"
        style={{ borderRight: "1px solid #0f1f35" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-red" />
        <span className="text-[10px] font-mono font-bold tracking-widest text-red-500">
          LIVE
        </span>
      </div>

      {/* scrolling content */}
      <div className="flex-1 overflow-hidden">
        <div className="animate-ticker flex items-center gap-8 whitespace-nowrap">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="flex items-center gap-2 text-xs font-mono">
              <span
                className="font-semibold"
                style={{ color: scoreColor(item.score) }}
              >
                [{item.score}]
              </span>
              <span style={{ color: "#94a3b8" }}>{item.text}</span>
              <span style={{ color: "#334155" }}>— {item.source}</span>
              <span style={{ color: "#1e3a5f" }}>///</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}