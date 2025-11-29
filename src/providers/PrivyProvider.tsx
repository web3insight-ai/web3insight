"use client"

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth"
import { env } from "@/env"
import { PrivyAuthSync } from "./PrivyAuthSync"
import { useState, useEffect } from "react"

function PrivyConfiguredProvider({ children }: { children: React.ReactNode }) {
  const appId = env.NEXT_PUBLIC_PRIVY_APP_ID

  // State to track user type and trigger re-render when it changes
  const [userType, setUserType] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userType') || 'dev' // Default to 'dev'
    }
    return 'dev'
  })

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const newType = localStorage.getItem('userType') || 'dev'
        setUserType(newType)
      }
    }

    // Listen to storage events (for changes from other tabs/windows)
    window.addEventListener('storage', handleStorageChange)

    // Also poll for changes in the same tab (since storage event doesn't fire in same tab)
    const interval = setInterval(() => {
      if (typeof window !== 'undefined') {
        const currentType = localStorage.getItem('userType') || 'dev'
        if (currentType !== userType) {
          setUserType(currentType)
        }
      }
    }, 100) // Check every 100ms

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [userType])

  if (!appId) {
    console.warn("NEXT_PUBLIC_PRIVY_APP_ID is not configured - Privy features will be disabled")
    return <>{children}</>
  }

  // Determine login methods based on user type
  const loginMethods = userType === "dev" ? ["github"] : ["email"]

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
