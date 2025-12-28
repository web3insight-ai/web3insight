import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { QueryProvider } from "@/providers/QueryProvider"
import { PrivyProvider } from "@/providers/PrivyProvider"
import { env } from "@/env"
import "./globals.css"

export const metadata: Metadata = {
  title: "Dev Card | Web3Insight",
  description: "Not just a profile—it's your proof of build",
  generator: "Web3Insight",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        {env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && env.NEXT_PUBLIC_UMAMI_URL && (
          <script
            defer
            src={`${env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
            data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </head>
      <body className="antialiased font-sans" style={{ fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif" }}>
        <QueryProvider>
          <PrivyProvider>
            {children}
          </PrivyProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
