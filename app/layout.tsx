import type { Metadata } from "next";

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
        <script
          defer
          src="https://umami.web3insight.ai/script.js"
          data-website-id="b036732f-4406-4778-90cc-2e4002b5e13b"
        />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
