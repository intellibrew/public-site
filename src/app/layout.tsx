import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" })
export const metadata: Metadata = {
  title: "NeoFab – The Smart Way to Build Your Factory",
  description: "Discover, compare, and source machines with verified specs, pricing signals and instant RFQs.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
