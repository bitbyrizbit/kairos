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
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        borderRadius: 6, overflow: "hidden",
        border: "1px solid #1e1e1e", backgroundColor: "#0d0d0d",
      }}>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) run() }}
          placeholder={mode === "analyze" ? "Describe a real disruption event..." : "What if China blockades Taiwan? What if Suez Canal closes?"}
          rows={3}
          disabled={isLoading}
          style={{
            width: "100%", backgroundColor: "transparent", border: "none", outline: "none",
            padding: "12px 14px", fontSize: 12, color: "#ccc",
            fontFamily: "monospace", resize: "none", lineHeight: 1.5,
          }}
        />
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 12px", borderTop: "1px solid #1a1a1a",
        }}>
          <span style={{ fontSize: 9, color: "#333", fontFamily: "monospace" }}>
            {mode === "simulate" ? "Hypothetical" : "Live event"} · Ctrl+Enter
          </span>
          <button
            onClick={run}
            disabled={!value.trim() || isLoading}
            style={{
              padding: "5px 14px", borderRadius: 4, border: "none",
              fontSize: 11, fontWeight: 700, fontFamily: "monospace",
              cursor: !value.trim() || isLoading ? "not-allowed" : "pointer",
              backgroundColor: !value.trim() || isLoading ? "#1a1a1a" : "#f59e0b",
              color: !value.trim() || isLoading ? "#444" : "#000",
              transition: "all 0.15s",
            }}
          >
            {isLoading ? "Running..." : "RUN →"}
          </button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.15em", marginBottom: 8 }}>QUICK SCENARIOS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {DEMO_SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => { setValue(s.description); onSubmit(s.description) }}
              disabled={isLoading}
              style={{
                textAlign: "left", padding: "8px 12px", borderRadius: 4,
                backgroundColor: "#0d0d0d", border: "1px solid #1a1a1a",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => !isLoading && (e.currentTarget.style.borderColor = "#2a2a2a")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#1a1a1a")}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "#444", lineHeight: 1.4 }}>{s.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}