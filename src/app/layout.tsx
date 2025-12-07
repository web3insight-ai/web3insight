import type { Metadata } from "next";

import { env } from "@env";
import { getTitle } from "@/utils/app";
import { ClientProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: `${getTitle()} - Blockchain Analytics`,
  description: "Explore insights on blockchain projects and developers",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <script
            defer
            src="https://umami.web3insight.ai/script.js"
            data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
