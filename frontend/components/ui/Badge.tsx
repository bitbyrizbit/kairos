"use client"

import { impactColor, statusColor } from "@/lib/utils"
import type { ImpactLevel, RiskStatus } from "@/types"

interface BadgeProps {
  label: string
  type?: "impact" | "status" | "default"
  value?: ImpactLevel | RiskStatus
  size?: "sm" | "md"
}

export function Badge({ label, type = "default", value, size = "md" }: BadgeProps) {
  let color = "#64748b"

  if (type === "impact" && value) {
    color = impactColor(value as ImpactLevel)
  } else if (type === "status" && value) {
    color = statusColor(value as RiskStatus)
  }

  const padding = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded uppercase tracking-wider ${padding}`}
      style={{
        color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}35`,
      }}
    >
      {label}
    </span>
  )
}