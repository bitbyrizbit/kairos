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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        border: "1px solid var(--border)", backgroundColor: "var(--surface)",
        borderRadius: 2
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
            padding: "20px 24px", fontSize: 14, color: "var(--ink)",
            fontFamily: "var(--font-serif)", resize: "none", lineHeight: 1.6,
          }}
        />
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 24px", borderTop: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: 11, color: "var(--ink-light)", fontFamily: "var(--font-sans)" }}>
            {mode === "simulate" ? "Hypothetical scenario" : "Live event"} (Ctrl+Enter)
          </span>
          <button
            onClick={run}
            disabled={!value.trim() || isLoading}
            style={{
              padding: "8px 20px", border: "1px solid var(--border)",
              fontSize: 12, fontWeight: 500, fontFamily: "var(--font-sans)",
              cursor: !value.trim() || isLoading ? "not-allowed" : "pointer",
              backgroundColor: !value.trim() || isLoading ? "var(--bg)" : "var(--ink)",
              color: !value.trim() || isLoading ? "var(--ink-lighter)" : "var(--surface)",
              transition: "all 0.3s",
              borderRadius: 40
            }}
          >
            {isLoading ? "Simulating" : "Run simulation"}
          </button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, color: "var(--ink-light)", letterSpacing: "0.05em", marginBottom: 12, fontFamily: "var(--font-sans)", fontWeight: 500 }}>Prepared scenarios</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DEMO_SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => { setValue(s.description); onSubmit(s.description) }}
              disabled={isLoading}
              style={{
                textAlign: "left", padding: "16px 20px",
                backgroundColor: "var(--surface)", border: "1px solid var(--border)",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s", borderRadius: 2
              }}
              onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--surface)")}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 4, fontFamily: "var(--font-sans)" }}>{s.label}</div>
              <div style={{ fontSize: 12, color: "var(--ink-light)", lineHeight: 1.5, fontFamily: "var(--font-serif)" }}>{s.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}