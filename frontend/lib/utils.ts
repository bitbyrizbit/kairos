// utils.ts
// small helpers used across components

import type { RiskStatus, ImpactLevel } from "@/types"

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function statusColor(status: RiskStatus): string {
  switch (status) {
    case "catastrophic": return "#ef4444"
    case "critical":     return "#f97316"
    case "elevated":     return "#f59e0b"
    case "monitoring":   return "#22c55e"
    default:             return "#64748b"
  }
}

export function impactColor(impact: ImpactLevel): string {
  switch (impact) {
    case "critical": return "#ef4444"
    case "high":     return "#f97316"
    case "medium":   return "#f59e0b"
    case "low":      return "#22c55e"
    default:         return "#64748b"
  }
}

export function scoreColor(score: number): string {
  if (score >= 80) return "#ef4444"
  if (score >= 65) return "#f97316"
  if (score >= 45) return "#f59e0b"
  return "#22c55e"
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "CATASTROPHIC"
  if (score >= 65) return "CRITICAL"
  if (score >= 45) return "ELEVATED"
  return "MONITORING"
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  } catch {
    return "--:--"
  }
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "Unknown"
  }
}

// triggers a file download from a blob
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}