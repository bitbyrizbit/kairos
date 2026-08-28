import type { Metadata } from "next"
import { Cinzel, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const cinzel = Cinzel({ 
  weight: ["400", "500", "600"],
  subsets: ["latin"], 
  variable: "--font-serif" 
})
const jetbrains = JetBrains_Mono({ 
  weight: ["300", "400", "500"],
  subsets: ["latin"], 
  variable: "--font-sans" 
})

export const metadata: Metadata = {
  title: "KAIROS",
  description: "Global Intelligence",
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${jetbrains.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}