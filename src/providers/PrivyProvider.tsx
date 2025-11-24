"use client";

import { PrivyProvider as PrivyAuthProvider } from "@privy-io/react-auth";
import { env } from "@env";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.warn("NEXT_PUBLIC_PRIVY_APP_ID is not configured");
    return <>{children}</>;
  }

  return (
    <PrivyAuthProvider
      appId={appId}
      config={{
        // Enable identity tokens - this allows the frontend to pass user data to backend
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        loginMethods: ["email", "wallet", "google", "github"],
      }}
    >
      {children}
    </PrivyAuthProvider>
  );
}

