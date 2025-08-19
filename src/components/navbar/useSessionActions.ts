import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { authModalOpenAtom, authModalTypeAtom } from "#/atoms";

import type { ApiUser } from "~/auth/typing";

function useSessionActions<U = ApiUser | null>() {
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);
  const [, setAuthModalType] = useAtom(authModalTypeAtom);

  const router = useRouter();
  // For now, simplified without outlet context
  const setUser = (user: U) => {
    // This will be handled differently in Next.js
    console.log('Setting user:', user);
  };

  // Function to open auth modal with specified type
  const openAuthModal = (type: 'signin' | 'signup' | 'forgotPassword' | 'resetPassword') => {
    setAuthModalType(type);
    setAuthModalOpen(true);
  };

  const signOut = (user: U) => {
    // Immediately update the UI
    setUser(user);
    // Navigate to home page
    router.push('/');
  };

  return {
    signIn: openAuthModal.bind(null, 'signin'),
    signOut,
    resetPassword: openAuthModal.bind(null,'resetPassword'),
  };
}

export default useSessionActions;
