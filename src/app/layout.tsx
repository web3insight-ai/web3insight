import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { env } from "@env";
import { getTitle, getMetadata } from "@/utils/app";
import { ClientProviders } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const { description } = getMetadata();
const title = getTitle();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F0F" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: `${title} - Web3 Analytics Platform`,
    template: `%s | ${title}`,
  },
  description,
  metadataBase: new URL("https://web3insight.ai"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: title,
    title: `${title} - Web3 Analytics Platform`,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} - Web3 Analytics Platform`,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <script
            defer
            src="https://umami.web3insight.ai/script.js"
            data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </head>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
