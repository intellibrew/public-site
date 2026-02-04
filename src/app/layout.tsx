import "./globals.css"
import type { Metadata } from "next"
import { Orbitron, Montserrat } from "next/font/google"
import SmoothScroll from "@/components/SmoothScroll"

const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-orbitron",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "NeoFab - AI Factory Planning",
  description:
    "Discover, compare, and source machines with verified specs, pricing signals and instant RFQs.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${montserrat.variable}`}>
      <body className="min-h-screen font-sans bg-background text-foreground">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
