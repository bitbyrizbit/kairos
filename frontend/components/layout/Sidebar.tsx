"use client"

import { LayoutDashboard, Zap, History, Radio, FileText } from "lucide-react"

type View = "dashboard" | "simulator" | "historical" | "signals" | "report"

interface Props {
  active: View
  onChange: (v: View) => void
}

const NAV = [
  { id: "dashboard",  icon: LayoutDashboard, label: "DASH" },
  { id: "simulator",  icon: Zap,             label: "SIM"  },
  { id: "historical", icon: History,         label: "HIST" },
  { id: "signals",    icon: Radio,           label: "FEED" },
  { id: "report",     icon: FileText,        label: "RPT"  },
] as const

export function Sidebar({ active, onChange }: Props) {
  return (
    <div style={{
      width: 56, flexShrink: 0,
      backgroundColor: "#0a0a0a",
      borderRight: "1px solid #1a1a1a",
      display: "flex", flexDirection: "column",
      alignItems: "center", paddingTop: 8, gap: 2,
    }}>
      {NAV.map(({ id, icon: Icon, label }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id as View)}
            title={label}
            style={{
              width: 44, height: 44, borderRadius: 6,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3,
              backgroundColor: isActive ? "#141414" : "transparent",
              border: "none", cursor: "pointer",
              borderLeft: isActive ? "2px solid #f59e0b" : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            <Icon size={15} color={isActive ? "#f59e0b" : "#444"} />
            <span style={{
              fontSize: 8, fontFamily: "monospace", fontWeight: 700,
              letterSpacing: "0.1em",
              color: isActive ? "#f59e0b" : "#333",
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}