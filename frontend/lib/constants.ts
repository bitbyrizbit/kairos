// constants.ts

export const DEMO_SCENARIOS = [
  {
    id: "taiwan_chips",
    label: "Taiwan Semiconductor Shock",
    description: "Taiwan semiconductor production drops 35% due to major earthquake near Hsinchu Science Park",
  },
  {
    id: "suez_blockage",
    label: "Suez Canal Blockage",
    description: "Large container vessel runs aground in Suez Canal blocking all traffic in both directions",
  },
  {
    id: "ukraine_grain",
    label: "Ukraine Grain Export Halt",
    description: "Ukraine halts all grain exports through Black Sea ports due to escalating military conflict",
  },
  {
    id: "hormuz_closure",
    label: "Strait of Hormuz Closure",
    description: "Iran announces closure of Strait of Hormuz blocking 20% of global oil supply",
  },
  {
    id: "china_lockdown",
    label: "China Manufacturing Shutdown",
    description: "China imposes nationwide manufacturing shutdown affecting all export production facilities",
  },
]

export const KAIROS_INDEX_THRESHOLDS = {
  monitoring: 45,
  elevated: 65,
  critical: 80,
}

export const NODE_TYPE_ICONS: Record<string, string> = {
  country: "🌍",
  industry: "🏭",
  commodity: "📦",
  port: "⚓",
  trade_route: "🚢",
  company: "🏢",
}

export const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes