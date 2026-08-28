import type { Metadata } from "next"
import { Montserrat, Inter } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({ 
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"], 
  variable: "--font-serif" // reusing the css variable name so we don't have to rewrite everything
})
const inter = Inter({ 
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
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}