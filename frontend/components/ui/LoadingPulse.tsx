"use client"

export function LoadingPulse({ message = "Processing..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-full border-2 animate-spin"
          style={{ borderColor: "#1e3a5f", borderTopColor: "#f59e0b" }}
        />
        <div className="absolute w-3 h-3 rounded-full bg-amber-400" />
      </div>
      <p className="text-sm font-mono" style={{ color: "#64748b" }}>
        {message}
      </p>
    </div>
  )
}

// skeleton for cards while data loads
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded animate-pulse"
          style={{
            backgroundColor: "#0f1f35",
            width: `${70 + (i * 7.3) % 30}%`,
          }}
        />
      ))}
    </div>
  )
}