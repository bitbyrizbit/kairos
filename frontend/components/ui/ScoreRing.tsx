"use client"

import { scoreColor, scoreLabel } from "@/lib/utils"

interface ScoreRingProps {
  score: number
  size?: number
  showLabel?: boolean
}

export function ScoreRing({ score, size = 80, showLabel = true }: ScoreRingProps) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  // score goes 0-100, map to stroke dashoffset
  const offset = circumference - (score / 100) * circumference
  const color = scoreColor(score)
  const label = scoreLabel(score)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e3a5f"
            strokeWidth={6}
          />
          {/* score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s ease" }}
          />
        </svg>
        {/* number in center */}
        <div
          className="absolute inset-0 flex items-center justify-center font-bold font-mono"
          style={{ fontSize: size * 0.22, color }}
        >
          {score}
        </div>
      </div>
      {showLabel && (
        <span
          className="text-[10px] font-mono font-semibold tracking-widest uppercase"
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  )
}