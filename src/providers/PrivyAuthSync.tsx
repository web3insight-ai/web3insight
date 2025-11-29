"use client"

import { useEffect, useRef } from "react"
import { usePrivy, useIdentityToken } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { signInWithPrivy } from "@/services/auth"

/**
 * Component to sync Privy authentication with backend
 * Automatically calls backend auth API when Privy login is detected
 */
export function PrivyAuthSync() {
  const { ready, authenticated, user } = usePrivy()
  const { identityToken } = useIdentityToken()
  const router = useRouter()
  const hasAuthenticatedRef = useRef(false)

  useEffect(() => {
    // Only proceed if Privy is ready and user is authenticated
    if (!ready || !authenticated || !user || !identityToken) {
      return
    }

    // Prevent duplicate authentication calls
    if (hasAuthenticatedRef.current) {
      return
    }

    // Mark as authenticated to prevent duplicate calls
    hasAuthenticatedRef.current = true

    // Call backend authentication API
    const authenticateWithBackend = async () => {
      try {
        const result = await signInWithPrivy(identityToken)

        if (result.success) {
          // Only redirect to create page if user clicked "Connect" from home page
          // Check for the redirect flag in localStorage
          if (typeof window !== 'undefined') {
            const shouldRedirectToCreate = localStorage.getItem('redirectToCreate')

            if (shouldRedirectToCreate === 'true') {
              // Clear the flag
              localStorage.removeItem('redirectToCreate')

              // Redirect to create page
              router.push('/monad/create')
              // Also refresh to ensure auth state is updated
              router.refresh()
            }
          }
        } else {
          hasAuthenticatedRef.current = false // Allow retry
        }
      } catch (error) {
        hasAuthenticatedRef.current = false // Allow retry
      }
    }

    authenticateWithBackend()
  }, [ready, authenticated, user, identityToken, router])

  // Reset auth flag when user logs out
  useEffect(() => {
    if (!authenticated) {
      hasAuthenticatedRef.current = false
    }
  }, [authenticated])

  return null // This component doesn't render anything
}
