import "./globals.css"
import type { Metadata } from "next"
import SmoothScroll from "@/components/SmoothScroll"

export const metadata: Metadata = {
  title: "NeoFab - AI Factory Setup",
  description:
    "Discover, compare, and source machines with verified specs, pricing signals and instant RFQs.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased bg-background text-foreground">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
