import type { Metadata } from "next"
import { Playfair_Display, Montserrat, Great_Vibes } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({ 
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"], 
  variable: "--font-serif" 
})

const montserrat = Montserrat({ 
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"], 
  variable: "--font-sans" 
})

const script = Great_Vibes({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-script"
})

export const metadata: Metadata = {
  title: "KAIROS",
  description: "Global Intelligence",
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable} ${script.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}