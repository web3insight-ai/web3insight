import type React from "react"
import type { Metadata } from "next"
import { Bricolage_Grotesque, JetBrains_Mono, Manrope, Caveat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { I18nProvider } from "@/lib/i18n-context"
import { QueryProvider } from "@/lib/query/provider"
import { env } from "@/env"
import "./globals.css"

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
  display: "swap",
})

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-terminal",
  weight: ["400", "500", "700"],
  display: "swap",
})

const label = Caveat({
  subsets: ["latin"],
  variable: "--font-label-script",
  weight: ["500", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Web3Insight — Discover, Analyze & Connect with Web3 Developers",
  description:
    "AI-powered developer insights for Web3 ecosystems. Identify developers, track events, and power ecosystem growth with GitHub data and on-chain activity.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          defer
          src="https://umami.web3insight.ai/script.js"
          data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        />
      </head>
      <body
        className={`${body.variable} ${display.variable} ${mono.variable} ${label.variable} font-sans antialiased overflow-x-hidden`}
      >
        <QueryProvider>
          <I18nProvider>{children}</I18nProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
