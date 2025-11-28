"use client"

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth"
import { env } from "@/env"
import { PrivyAuthSync } from "./PrivyAuthSync"

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!appId) {
    console.warn("NEXT_PUBLIC_PRIVY_APP_ID is not configured - Privy features will be disabled")
    return <>{children}</>
  }

  return (
    <PrivyAuthProvider
      appId={appId}
      config={{
        // Enable identity tokens - this allows the frontend to pass user data to backend
        appearance: {
          theme: "dark",
          accentColor: "#9F8EFF",
          logo: "/images/web3insight_logo.svg",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        loginMethods: ["email", "wallet", "google", "github"],
      }}
    >
      <PrivyAuthSync />
      {children}
    </PrivyAuthProvider>
  )
}
