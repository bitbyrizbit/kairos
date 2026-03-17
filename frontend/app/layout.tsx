import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "KAIROS — Crisis Intelligence",
  description: "Real-time global crisis intelligence. Detects weak signals, predicts cascading supply chain failures before they happen.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}