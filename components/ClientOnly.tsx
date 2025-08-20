'use client';

import { type PropsWithChildren, useState, useEffect } from "react";

function ClientOnly({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Only set hydrated to true after the component has mounted
    // This ensures we're definitely on the client side
    setHydrated(true);
  }, []);

  // During SSR, return null to avoid indexedDB issues
  if (typeof window === 'undefined' || !hydrated) {
    return null;
  }

  return <>{children}</>;
}

export default ClientOnly;
