'use client';

import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { authModalOpenAtom, authModalTypeAtom } from "#/atoms";
import { usePrivy } from "@privy-io/react-auth";

import type { ApiUser } from "~/auth/typing";

function useSessionActions<U = ApiUser | null>() {
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);
  const [, setAuthModalType] = useAtom(authModalTypeAtom);
  const { ready, authenticated, login, logout } = usePrivy();

  const router = useRouter();
  // For now, simplified without outlet context
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setUser = (_user: U) => {
    // This will be handled differently in Next.js
  };

  // Function to open auth modal with specified type (legacy support)
  const openAuthModal = (type: 'signin' | 'signup' | 'forgotPassword' | 'resetPassword') => {
    setAuthModalType(type);
    setAuthModalOpen(true);
  };

  // Sign in using Privy directly
  const signIn = () => {
    if (ready && !authenticated) {
      // Directly trigger Privy login UI
      login();
    }
    // If Privy is not ready, wait for it (it will be ready soon)
    // Don't show fallback modal anymore
  };

  // Sign out using Privy
  const signOut = async (user: U) => {
    // Immediately update the UI
    setUser(user);

    if (ready && authenticated) {
      // Use Privy logout
      await logout();
    }

    // Navigate to home page
    router.push('/');
    router.refresh();
  };

  return {
    signIn,
    signOut,
    resetPassword: openAuthModal.bind(null,'resetPassword'),
  };
}

export default useSessionActions;
