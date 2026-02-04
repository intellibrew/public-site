import "./globals.css"
import type { Metadata } from "next"
import { Inter, Orbitron, Montserrat } from "next/font/google"
import SmoothScroll from "@/components/SmoothScroll"

// Base sans for most copy
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

// Landing hero headline fonts
export const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-orbitron",
})

export const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "NeoFab – The Smart Way to Build Your Factory",
  description:
    "Discover, compare, and source machines with verified specs, pricing signals and instant RFQs.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${montserrat.variable}`}>
      <body className="min-h-screen font-sans bg-background text-foreground">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
