import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Host_Grotesk,
  JetBrains_Mono,
  Caveat,
} from "next/font/google";

import { env } from "@env";
import { getTitle, getMetadata } from "@/utils/app";
import { ClientProviders } from "./providers";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  axes: ["opsz"],
});

const host = Host_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-host",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

// Caveat powers the Blueprint <HandLabel> script callouts. Used sparingly.
const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "700"],
  variable: "--font-caveat",
});

const { description } = getMetadata();
const title = getTitle();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0D0D" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: `${title} — Web3 Analytics Platform`,
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
    title: `${title} — Web3 Analytics Platform`,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} — Web3 Analytics Platform`,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = `${bricolage.variable} ${host.variable} ${jetbrains.variable} ${caveat.variable}`;

  return (
    <html lang="en" suppressHydrationWarning className={fontVars}>
      <head>
        {env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <script
            defer
            src="https://umami.web3insight.ai/script.js"
            data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </head>
      <body className="font-sans bg-bg text-fg">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
