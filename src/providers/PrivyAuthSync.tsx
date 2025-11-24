"use client";

import { useEffect, useRef } from "react";
import { usePrivy, useIdentityToken } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { signInWithPrivy } from "~/auth/client-repository";

/**
 * Component to sync Privy authentication with backend
 * Automatically calls backend auth API when Privy login is detected
 */
export function PrivyAuthSync() {
  const { ready, authenticated, user } = usePrivy();
  const { identityToken } = useIdentityToken();
  const router = useRouter();
  const hasAuthenticatedRef = useRef(false);

  useEffect(() => {
    // Only proceed if Privy is ready and user is authenticated
    if (!ready || !authenticated || !user || !identityToken) {
      return;
    }

    // Prevent duplicate authentication calls
    if (hasAuthenticatedRef.current) {
      return;
    }

    // Mark as authenticated to prevent duplicate calls
    hasAuthenticatedRef.current = true;

    // Call backend authentication API
    const authenticateWithBackend = async () => {
      try {
        const result = await signInWithPrivy(identityToken);

        if (result.success) {
          // Refresh the page to update auth state across the app
          router.refresh();
        } else {
          hasAuthenticatedRef.current = false; // Allow retry
        }
      } catch (error) {
        hasAuthenticatedRef.current = false; // Allow retry
      }
    };

    authenticateWithBackend();
  }, [ready, authenticated, user, identityToken, router]);

  // Reset auth flag when user logs out
  useEffect(() => {
    if (!authenticated) {
      hasAuthenticatedRef.current = false;
    }
  }, [authenticated]);

  return null; // This component doesn't render anything
}

