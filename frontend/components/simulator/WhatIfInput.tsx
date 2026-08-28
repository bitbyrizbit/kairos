"use client"

import { useState } from "react"
import { DEMO_SCENARIOS } from "@/lib/constants"

interface Props {
  onSubmit: (description: string) => void
  isLoading: boolean
  mode?: "analyze" | "simulate"
}

export function WhatIfInput({ onSubmit, isLoading, mode = "simulate" }: Props) {
  const [value, setValue] = useState("")

  const run = () => {
    const t = value.trim()
    if (!t || isLoading) return
    onSubmit(t)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        border: "1px solid var(--border)", backgroundColor: "rgba(0,0,0,0.5)",
        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))"
      }}>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) run() }}
          placeholder={mode === "analyze" ? "DESCRIBE A REAL DISRUPTION EVENT..." : "WHAT IF CHINA BLOCKADES TAIWAN? WHAT IF SUEZ CANAL CLOSES?"}
          rows={3}
          disabled={isLoading}
          style={{
            width: "100%", backgroundColor: "transparent", border: "none", outline: "none",
            padding: "16px 20px", fontSize: 13, color: "var(--text1)",
            fontFamily: "var(--font-mono-data)", resize: "none", lineHeight: 1.5,
          }}
        />
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono-data)" }}>
            {mode === "simulate" ? "HYPOTHETICAL" : "LIVE EVENT"} // CTRL+ENTER
          </span>
          <button
            className="panel-tactical-btn"
            onClick={run}
            disabled={!value.trim() || isLoading}
            style={{
              padding: "6px 16px", border: "none",
              fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono-data)",
              cursor: !value.trim() || isLoading ? "not-allowed" : "pointer",
              backgroundColor: !value.trim() || isLoading ? "rgba(255,255,255,0.05)" : "var(--red)",
              color: !value.trim() || isLoading ? "var(--text3)" : "#000",
              transition: "all 0.2s",
            }}
          >
            {isLoading ? "PROCESSING..." : "EXECUTE"}
          </button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, color: "var(--text2)", letterSpacing: "0.15em", marginBottom: 10, fontFamily: "var(--font-mono-data)", fontWeight: 700 }}>QUICK SCENARIOS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {DEMO_SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => { setValue(s.description); onSubmit(s.description) }}
              disabled={isLoading}
              style={{
                textAlign: "left", padding: "10px 14px",
                backgroundColor: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)"
              }}
              onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.3)")}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cyan)", marginBottom: 4, fontFamily: "var(--font-mono-data)" }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "var(--text2)", lineHeight: 1.4, fontFamily: "var(--font-body)" }}>{s.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}