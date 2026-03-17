"use client"

import { scoreColor, scoreLabel } from "@/lib/utils"

interface Props {
  score: number
  size?: number
  showLabel?: boolean
}

export function ScoreRing({ score, size = 80, showLabel = true }: Props) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = scoreColor(score)

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a1a" strokeWidth={7} />
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={7}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease, stroke 0.3s ease", filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.24, fontWeight: 900, color,
          fontFamily: "monospace",
        }}>
          {score}
        </div>
      </div>
      {showLabel && (
        <span style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: "0.15em", fontFamily: "monospace" }}>
          {scoreLabel(score)}
        </span>
      )}
    </div>
  )
}