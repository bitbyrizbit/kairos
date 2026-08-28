import type { Metadata } from "next"
import { Space_Grotesk, IBM_Plex_Mono, Manrope } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" })
const ibmPlexMono = IBM_Plex_Mono({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-mono" })
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" })

export const metadata: Metadata = {
  title: "KAIROS — Crisis Terminal",
  description: "Global crisis intelligence platform. Detects weak signals, predicts cascading supply chain failures.",
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${manrope.variable}`}>
      <body style={{ height: "100vh", overflow: "hidden", backgroundColor: "#020202", color: "#F2F2F2", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}