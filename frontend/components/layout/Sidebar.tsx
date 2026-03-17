"use client"

import { LayoutDashboard, Zap, History, Radio, FileText } from "lucide-react"

type View = "dashboard" | "simulator" | "historical" | "signals" | "report"

interface SidebarProps {
  active: View
  onChange: (v: View) => void
}

const NAV = [
  { id: "dashboard",  icon: LayoutDashboard, label: "Dashboard"  },
  { id: "simulator",  icon: Zap,             label: "Simulator"  },
  { id: "historical", icon: History,         label: "Historical" },
  { id: "signals",    icon: Radio,           label: "Signals"    },
  { id: "report",     icon: FileText,        label: "Report"     },
] as const

export function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside
      className="flex flex-col w-14 flex-shrink-0 py-3 gap-1"
      style={{ borderRight: "1px solid #0f1f35", backgroundColor: "#050b18" }}
    >
      {NAV.map(({ id, icon: Icon, label }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id as View)}
            title={label}
            className="relative flex items-center justify-center w-full h-10 rounded-none transition-colors group"
            style={{
              backgroundColor: isActive ? "#0a1628" : "transparent",
              borderLeft: isActive ? "2px solid #f59e0b" : "2px solid transparent",
            }}
          >
            <Icon
              size={16}
              style={{ color: isActive ? "#f59e0b" : "#334155" }}
            />
            {/* tooltip on hover */}
            <div
              className="absolute left-14 z-50 px-2 py-1 rounded text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
              style={{
                backgroundColor: "#0f1f35",
                border: "1px solid #1e3a5f",
                color: "#94a3b8",
              }}
            >
              {label}
            </div>
          </button>
        )
      })}
    </aside>
  )
}