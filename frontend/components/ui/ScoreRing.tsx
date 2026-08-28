"use client"

import { scoreColor, scoreLabel } from "@/lib/utils"

interface Props {
  score: number
  size?: number
  showLabel?: boolean
}

export function ScoreRing({ score, size = 80, showLabel = true }: Props) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = scoreColor(score)

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={4} />
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={6}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="square"
            style={{ transition: "stroke-dashoffset 1s ease, stroke 0.3s ease", filter: `drop-shadow(0 0 8px ${color}88)` }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.3, fontWeight: 800, color,
          fontFamily: "var(--font-mono-data)",
        }}>
          {score}
        </div>
      </div>
      {showLabel && (
        <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: "0.15em", fontFamily: "var(--font-mono-data)" }}>
          [{scoreLabel(score)}]
        </span>
      )}
    </div>
  )
}