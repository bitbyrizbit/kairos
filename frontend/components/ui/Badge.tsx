"use client"

import { impactColor, statusColor } from "@/lib/utils"
import type { ImpactLevel, RiskStatus } from "@/types"

interface Props {
  label: string
  type?: "impact" | "status" | "default"
  value?: ImpactLevel | RiskStatus | string
  size?: "sm" | "md"
}

export function Badge({ label, type = "default", value, size = "md" }: Props) {
  let color = "#555"
  if (type === "impact" && value) color = impactColor(value as ImpactLevel)
  else if (type === "status" && value) color = statusColor(value as RiskStatus)

  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: size === "sm" ? "2px 6px" : "3px 8px",
      fontSize: size === "sm" ? 9 : 10,
      fontFamily: "monospace", fontWeight: 700,
      letterSpacing: "0.1em", textTransform: "uppercase",
      borderRadius: 3, color,
      backgroundColor: `${color}15`,
      border: `1px solid ${color}30`,
    }}>
      {label}
    </span>
  )
}