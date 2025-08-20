"use client";

import React, { createContext, useContext } from "react";
import { CampProvider } from "@campnetwork/origin/react";
import { env } from "@/env";

interface OriginProviderProps {
  children: React.ReactNode;
}

// Create a context to track if Origin is available
const OriginAvailabilityContext = createContext<{ isAvailable: boolean }>({
  isAvailable: false,
});

export const useOriginAvailable = () => useContext(OriginAvailabilityContext);

export function OriginProvider({ children }: OriginProviderProps) {
  // Direct access to NEXT_PUBLIC_ environment variable
  const originClientId = env.NEXT_PUBLIC_ORIGIN_CLIENT_ID;

  // Get current origin safely (SSR compatible)
  const currentOrigin =
    typeof window !== "undefined" ? window.location.origin : "";
  const profileRedirect = currentOrigin
    ? `${currentOrigin}/profile`
    : "/profile";

  // On server side, always return as unavailable to prevent SSR issues
  if (typeof window === "undefined") {
    return (
      <OriginAvailabilityContext.Provider value={{ isAvailable: false }}>
        {children}
      </OriginAvailabilityContext.Provider>
    );
  }

  // Client side - check if we have the client ID
  if (!originClientId) {
    return (
      <OriginAvailabilityContext.Provider value={{ isAvailable: false }}>
        {children}
      </OriginAvailabilityContext.Provider>
    );
  }

  // Client side with valid client ID - wrap CampProvider in error boundary
  try {
    return (
      <OriginAvailabilityContext.Provider value={{ isAvailable: true }}>
        <CampProvider
          clientId={originClientId}
          redirectUri={profileRedirect}
          allowAnalytics={true}
        >
          {children}
        </CampProvider>
      </OriginAvailabilityContext.Provider>
    );
  } catch (error) {
    console.warn("Origin provider initialization failed:", error);
    return (
      <OriginAvailabilityContext.Provider value={{ isAvailable: false }}>
        {children}
      </OriginAvailabilityContext.Provider>
    );
  }
}
