"use client"

export function LoadingPulse({ message = "PROCESSING..." }: { message?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "40px 0" }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 24, backgroundColor: "var(--red)",
            animation: `pulse-dot 1s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
            boxShadow: "0 0 8px rgba(255,51,51,0.5)"
          }} />
        ))}
      </div>
      <span style={{ fontSize: 12, fontFamily: "var(--font-mono-data)", color: "var(--red)", letterSpacing: "0.2em", fontWeight: 700 }}>{message}</span>
    </div>
  )
}

export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          height: 12,
          backgroundColor: "rgba(255,255,255,0.05)",
          width: `${50 + (i * 17) % 40}%`,
          clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)"
        }} />
      ))}
    </div>
  )
}