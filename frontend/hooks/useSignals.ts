import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { REFRESH_INTERVAL_MS } from "@/lib/constants"
import type { SignalsResponse } from "@/types"

export function useSignals() {
  const [data, setData] = useState<SignalsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      const result = await api.signals()
      setData(result)
      setError(null)
    } catch (err: any) {
      setError("Signal feed unavailable")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    // refresh every 5 mins — matches backend cache interval
    const id = setInterval(fetch, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetch])

  return { data, loading, error, refresh: fetch }
}