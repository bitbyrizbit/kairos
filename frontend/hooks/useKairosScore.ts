import { useMemo } from "react"
import type { SignalsResponse } from "@/types"

// derives the kairos index from signals data
// kept separate so components dont need to know where the index comes from
export function useKairosScore(signals: SignalsResponse | null) {
  return useMemo(() => {
    if (!signals) return null
    return signals.kairos_index
  }, [signals])
}