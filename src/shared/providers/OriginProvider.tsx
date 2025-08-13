"use client";

import React, { createContext, useContext } from 'react';
import { CampProvider } from '@campnetwork/origin/react';
import { getVar } from '@/utils/env';

interface OriginProviderProps {
  children: React.ReactNode;
}

// Create a context to track if Origin is available
const OriginAvailabilityContext = createContext<{ isAvailable: boolean }>({
  isAvailable: false,
});

export const useOriginAvailable = () => useContext(OriginAvailabilityContext);

export function OriginProvider({ children }: OriginProviderProps) {
  const originClientId = getVar('ORIGIN_CLIENT_ID');

  // Get current origin safely (SSR compatible)
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const profileRedirect = currentOrigin ? `${currentOrigin}/profile` : '/profile';

  if (!originClientId) {
    console.warn('VITE_ORIGIN_CLIENT_ID environment variable not set. Origin SDK features will be disabled.');
    // Still provide context but mark as unavailable
    return (
      <OriginAvailabilityContext.Provider value={{ isAvailable: false }}>
        {children}
      </OriginAvailabilityContext.Provider>
    );
  }

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
}
