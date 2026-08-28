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
  let color = "var(--text2)"
  if (type === "impact" && value) color = impactColor(value as ImpactLevel)
  else if (type === "status" && value) color = statusColor(value as RiskStatus)

  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: size === "sm" ? "3px 6px" : "4px 8px",
      fontSize: size === "sm" ? 10 : 11,
      fontFamily: "var(--font-sans)", fontWeight: 400,
      borderRadius: 3, color,
      backgroundColor: `${color}20`,
      border: `1px solid ${color}60`,
      clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))"
    }}>
      {label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}
    </span>
  )
}