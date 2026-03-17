"use client"

export function LoadingPulse({ message = "Processing..." }: { message?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "40px 0" }}>
      <div style={{ position: "relative", width: 36, height: 36 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "2px solid #1a1a1a", borderTopColor: "#f59e0b",
          animation: "spin-slow 1s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#f59e0b" }} />
        </div>
      </div>
      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#444" }}>{message}</span>
    </div>
  )
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          height: 14, borderRadius: 3,
          backgroundColor: "#141414",
          width: `${65 + (i * 11) % 30}%`,
        }} />
      ))}
    </div>
  )
}