// api.ts
// all backend calls go through here — one place to update base URL, headers, etc.

import axios from "axios"
import type { AnalyzeResponse, SignalsResponse, HistoricalEvent } from "@/types"

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const http = axios.create({
  baseURL: `${BASE}/api/v1`,
  timeout: 30000, // LLM calls can be slow, 30s is reasonable
  headers: { "Content-Type": "application/json" },
})

export const api = {
  analyze: async (description: string): Promise<AnalyzeResponse> => {
  const res = await http.post("/analyze", { description })
  return res.data
},

  simulate: async (description: string): Promise<AnalyzeResponse> => {
    const res = await http.post("/simulate", { description, is_hypothetical: true })
    return res.data
  },

  signals: async (): Promise<SignalsResponse> => {
    const res = await http.get("/signals")
    return res.data
  },

  historical: async (): Promise<{ events: HistoricalEvent[] }> => {
    const res = await http.get("/historical")
    return res.data
  },

  // returns a blob — caller creates a download link
  report: async (
    event_description: string,
    ripple_data: object,
    kairos_score: number
  ): Promise<Blob> => {
    const res = await http.post(
      "/report",
      { event_description, ripple_data, kairos_score },
      { responseType: "blob" }
    )
    return res.data
  },
}