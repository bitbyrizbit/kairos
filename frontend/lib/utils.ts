import type { RiskStatus, ImpactLevel } from "@/types"

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function statusColor(status: RiskStatus): string {
  switch (status) {
    case "catastrophic": return "#FF3333" // Red
    case "critical":     return "#FF6600" // Safety Orange
    case "elevated":     return "#E5A910" // Amber
    case "monitoring":   return "#00FFC4" // Cyan
    default:             return "#8F8F99"
  }
}

export function impactColor(impact: ImpactLevel | string): string {
  switch (impact) {
    case "critical": return "#FF3333"
    case "high":     return "#FF6600"
    case "medium":   return "#E5A910"
    case "low":      return "#00FFC4"
    default:         return "#8F8F99"
  }
}

export function scoreColor(score: number): string {
  if (score >= 80) return "#FF3333"
  if (score >= 65) return "#FF6600"
  if (score >= 45) return "#E5A910"
  return "#00FFC4"
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "CATASTROPHIC"
  if (score >= 65) return "CRITICAL"
  if (score >= 45) return "ELEVATED"
  return "STABLE"
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: false,
    })
  } catch { return "--:--" }
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      day: "numeric", month: "short", year: "numeric",
    })
  } catch { return "UNKNOWN" }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}