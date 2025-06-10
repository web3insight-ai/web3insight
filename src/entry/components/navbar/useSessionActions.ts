import { useNavigate, useOutletContext } from "@remix-run/react";
import { useAtom } from "jotai";
import { authModalOpenAtom, authModalTypeAtom } from "#/atoms";

import type { StrapiUser } from "~/auth/typing";

function useSessionActions<U = StrapiUser | null>() {
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);
  const [, setAuthModalType] = useAtom(authModalTypeAtom);

  const navigate = useNavigate();
  const { setUser } = useOutletContext<{ setUser: (user: U) => void; }>();

  // Function to open auth modal with specified type
  const openAuthModal = (type: 'signin' | 'signup' | 'forgotPassword' | 'resetPassword') => {
    setAuthModalType(type);
    setAuthModalOpen(true);
  };

  const signOut = (user: U) => {
    // Immediately update the UI
    setUser(user);
    // Navigate to home page
    navigate('/', { replace: true });
  };

  return {
    signIn: openAuthModal.bind(null, 'signin'),
    signOut,
    resetPassword: openAuthModal.bind(null,'resetPassword'),
  };
}

export default useSessionActions;
