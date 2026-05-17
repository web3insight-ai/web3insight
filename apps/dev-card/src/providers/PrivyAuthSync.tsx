"use client"

import { useEffect, useRef } from "react"
import { usePrivy, useIdentityToken } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { orpc } from "@/orpc/client"

/**
 * Component to sync Privy authentication with backend
 * Automatically calls backend auth API when Privy login is detected
 */
export function PrivyAuthSync() {
  const { ready, authenticated, user } = usePrivy()
  const { identityToken } = useIdentityToken()
  const router = useRouter()
  const queryClient = useQueryClient()
  const hasAuthenticatedRef = useRef(false)

  // Use oRPC mutation for sign in
  const signInMutation = useMutation({
    ...orpc.auth.signInWithPrivy.mutationOptions(),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate user queries to refetch with new auth
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() })

        // Only redirect to create page if user clicked "Connect" from home page
        if (typeof window !== "undefined") {
          const shouldRedirectToCreate = localStorage.getItem("redirectToCreate")
          const ecosystem = localStorage.getItem("redirectEcosystem") || "mantle"

          if (shouldRedirectToCreate === "true") {
            // Clear the flags
            localStorage.removeItem("redirectToCreate")
            localStorage.removeItem("redirectEcosystem")

            // Redirect to appropriate ecosystem's create page
            router.push(`/${ecosystem}/create`)
            router.refresh()
          }
        }
      } else {
        hasAuthenticatedRef.current = false // Allow retry
      }
    },
    onError: () => {
      hasAuthenticatedRef.current = false // Allow retry
    },
  })

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

    // Call backend authentication API using oRPC mutation
    signInMutation.mutate({ idToken: identityToken })
  }, [ready, authenticated, user, identityToken])

  // Reset auth flag when user logs out
  useEffect(() => {
    if (!authenticated) {
      hasAuthenticatedRef.current = false
    }
  }, [authenticated])

  return null // This component doesn't render anything
}
