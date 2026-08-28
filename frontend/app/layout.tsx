import type { Metadata } from "next"
import { Cormorant_Garamond, Lato } from "next/font/google"
import "./globals.css"

const cormorant = Cormorant_Garamond({ 
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"], 
  style: ["normal", "italic"], 
  variable: "--font-serif" 
})
const lato = Lato({ 
  weight: ["300", "400", "700"],
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
    <html lang="en" className={`${cormorant.variable} ${lato.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}