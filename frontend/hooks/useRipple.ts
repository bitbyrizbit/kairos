import { useState } from "react"
import { api } from "@/lib/api"
import type { AnalyzeResponse } from "@/types"

export function useRipple() {
  const [data, setData] = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = async (description: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.analyze(description)
      setData(result)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
  }

  return { data, loading, error, analyze, reset }
}