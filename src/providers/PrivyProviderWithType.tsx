"use client"

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth"
import { env } from "@/env"
import { PrivyAuthSync } from "./PrivyAuthSync"

interface PrivyProviderWithTypeProps {
  children: React.ReactNode
  userType?: "dev" | "other"
}

export function PrivyProviderWithType({ children, userType = "dev" }: PrivyProviderWithTypeProps) {
  const appId = env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!appId) {
    console.warn("NEXT_PUBLIC_PRIVY_APP_ID is not configured - Privy features will be disabled")
    return <>{children}</>
  }

  // Configure login methods based on user type
  const loginMethods = userType === "dev"
    ? ["github"] // Only GitHub for developers
    : ["email"] // Only Email for non-developers

  return (
    <PrivyAuthProvider
      appId={appId}
      config={{
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
        loginMethods: loginMethods as any,
      }}
    >
      <PrivyAuthSync />
      {children}
    </PrivyAuthProvider>
  )
}

