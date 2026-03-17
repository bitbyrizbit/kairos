"use client"

import { useState } from "react"
import { Zap } from "lucide-react"
import { DEMO_SCENARIOS } from "@/lib/constants"

interface Props {
  onSubmit: (description: string) => void
  isLoading: boolean
  mode?: "analyze" | "simulate"
}

export function WhatIfInput({ onSubmit, isLoading, mode = "simulate" }: Props) {
  const [value, setValue] = useState("")

  const handleSubmit = () => {
    const text = value.trim()
    if (!text || isLoading) return
    onSubmit(text)
  }

  const handleScenario = (description: string) => {
    setValue(description)
    onSubmit(description)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* input area */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid #1e3a5f", backgroundColor: "#0a1628" }}
      >
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit()
          }}
          placeholder={
            mode === "analyze"
              ? "Describe a real disruption event..."
              : "Describe a hypothetical scenario — e.g. 'What if China blockades Taiwan?'"
          }
          rows={3}
          className="w-full bg-transparent px-4 pt-3 pb-2 text-sm resize-none outline-none font-mono"
          style={{ color: "#e2e8f0" }}
          disabled={isLoading}
        />
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderTop: "1px solid #0f1f35" }}
        >
          <span className="text-[10px] font-mono" style={{ color: "#334155" }}>
            {mode === "simulate" ? "Hypothetical simulation" : "Live event analysis"} · Ctrl+Enter to run
          </span>
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all"
            style={{
              backgroundColor: !value.trim() || isLoading ? "#0f1f35" : "#f59e0b",
              color: !value.trim() || isLoading ? "#334155" : "#050b18",
              cursor: !value.trim() || isLoading ? "not-allowed" : "pointer",
            }}
          >
            <Zap size={11} />
            {isLoading ? "Analyzing..." : "Run"}
          </button>
        </div>
      </div>

      {/* pre-loaded demo scenarios */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: "#334155" }}>
          Quick scenarios
        </p>
        <div className="flex flex-col gap-1.5">
          {DEMO_SCENARIOS.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => handleScenario(scenario.description)}
              disabled={isLoading}
              className="text-left px-3 py-2 rounded text-xs font-mono card-hover transition-colors"
              style={{
                backgroundColor: "#0a1628",
                border: "1px solid #0f1f35",
                color: "#64748b",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              <span className="font-semibold" style={{ color: "#94a3b8" }}>
                {scenario.label}
              </span>
              <br />
              <span style={{ color: "#475569" }}>{scenario.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}