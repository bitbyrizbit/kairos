"use client"

import { formatTime, scoreColor } from "@/lib/utils"
import type { SignalCluster } from "@/types"

interface Props {
  clusters: SignalCluster[]
  lastUpdated: string
}

export function SignalFeed({ clusters, lastUpdated }: Props) {
  // flatten all signals across clusters, sort by score
  const signals = clusters
    .flatMap(c =>
      c.signals.map(s => ({
        ...s,
        cluster_theme: c.theme,
        cluster_score: c.kairos_score,
      }))
    )
    .sort((a, b) => b.cluster_score - a.cluster_score)
    .slice(0, 20)

  return (
    <div className="card flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #0f1f35" }}
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-red" />
          <span className="text-xs font-mono font-semibold tracking-wider uppercase" style={{ color: "#94a3b8" }}>
            Signal Feed
          </span>
        </div>
        <span className="text-[10px] font-mono" style={{ color: "#334155" }}>
          {lastUpdated ? `updated ${formatTime(lastUpdated)}` : "—"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <div
              className="w-6 h-6 rounded-full border border-dashed animate-spin"
              style={{ borderColor: "#1e3a5f" }}
            />
            <span className="text-xs font-mono" style={{ color: "#334155" }}>
              Scanning feeds...
            </span>
          </div>
        ) : (
          signals.map((signal, i) => (
            <a
              key={signal.id + i}
              href={signal.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-2.5 card-hover block"
              style={{ borderBottom: "1px solid #0a1628", textDecoration: "none" }}
            >
              {/* signal strength bar */}
              <div className="flex flex-col items-center gap-0.5 mt-1 flex-shrink-0">
                {[1, 0.7, 0.4].map((threshold, j) => (
                  <div
                    key={j}
                    className="w-0.5 rounded-full"
                    style={{
                      height: 4 + j * 2,
                      backgroundColor:
                        signal.signal_strength >= threshold
                          ? scoreColor(signal.cluster_score)
                          : "#1e3a5f",
                    }}
                  />
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-xs leading-snug line-clamp-2"
                  style={{ color: "#cbd5e1" }}
                >
                  {signal.headline}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono" style={{ color: "#334155" }}>
                    {signal.source}
                  </span>
                  <span style={{ color: "#1e3a5f" }}>·</span>
                  <span
                    className="text-[10px] font-mono truncate"
                    style={{ color: scoreColor(signal.cluster_score) }}
                  >
                    {signal.cluster_theme}
                  </span>
                </div>
              </div>

              <span
                className="text-[10px] font-mono font-bold flex-shrink-0 mt-0.5"
                style={{ color: scoreColor(signal.cluster_score) }}
              >
                {signal.cluster_score}
              </span>
            </a>
          ))
        )}
      </div>
    </div>
  )
}