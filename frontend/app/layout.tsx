import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "SRBT Portal",
  description: "Sri Raghavendra Blue Metals & Transport — Order & Delivery Portal",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SRBT",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1d4ed8",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ scrollbarGutter: "stable" }}
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>
          {children}
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  )
}
