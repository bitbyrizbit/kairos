import type { Metadata } from "next"
import { Newsreader, Inter } from "next/font/google"
import "./globals.css"

const newsreader = Newsreader({ 
  subsets: ["latin"], 
  style: ["normal", "italic"], 
  variable: "--font-serif" 
})
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
})

export const metadata: Metadata = {
  title: "Kairos Intelligence",
  description: "Global crisis intelligence and supply chain cascade modeling.",
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}