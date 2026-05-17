"use client"

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth"
import { env } from "@/env"
import { PrivyAuthSync } from "./PrivyAuthSync"
import { useState, useEffect } from "react"
import { USER_TYPE_CHANGE_EVENT, getUserType } from "@/lib/userTypeEvents"

function PrivyConfiguredProvider({ children }: { children: React.ReactNode }) {
  const appId = env.NEXT_PUBLIC_PRIVY_APP_ID

  // State to track user type and trigger re-render when it changes
  const [userType, setUserType] = useState<string>(() => getUserType())

  // Listen for userType changes via custom event (same tab) and storage event (cross-tab)
  useEffect(() => {
    // Handle cross-tab changes via storage event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userType') {
        setUserType(e.newValue || 'dev')
      }
    }

    // Handle same-tab changes via custom event (replaces 100ms polling)
    const handleUserTypeChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      setUserType(customEvent.detail || 'dev')
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(USER_TYPE_CHANGE_EVENT, handleUserTypeChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(USER_TYPE_CHANGE_EVENT, handleUserTypeChange)
    }
  }, [])

  if (!appId) {
    console.warn("NEXT_PUBLIC_PRIVY_APP_ID is not configured - Privy features will be disabled")
    return <>{children}</>
  }

  // Determine login methods based on user type
  const loginMethods: ("github" | "email")[] =
    userType === "dev" ? ["github"] : ["email"]

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
        loginMethods,
      }}
    >
      <PrivyAuthSync />
      {children}
    </PrivyAuthProvider>
  )
}

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return <PrivyConfiguredProvider>{children}</PrivyConfiguredProvider>
}
