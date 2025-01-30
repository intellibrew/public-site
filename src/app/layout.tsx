import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

export const metadata = {
  title: "Leen - The Unified API for Security Data",
  description: "Unlock security data from hundreds of tools with a single API",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  )
}

