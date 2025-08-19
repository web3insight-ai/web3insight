import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { authModalOpenAtom, authModalTypeAtom } from "#/atoms";

function useSessionActions() {
  const [, setAuthModalOpen] = useAtom(authModalOpenAtom);
  const [, setAuthModalType] = useAtom(authModalTypeAtom);

  const router = useRouter();
  // Note: In Next.js, we'll manage user state differently
  // For now, we'll remove the setUser dependency

  // Function to open auth modal with specified type
  const openAuthModal = (type: 'signin' | 'signup' | 'forgotPassword' | 'resetPassword') => {
    setAuthModalType(type);
    setAuthModalOpen(true);
  };

  const signOut = () => {
    // Navigate to home page - user state will be managed by parent component
    router.push('/');
  };

  return {
    signIn: openAuthModal.bind(null, 'signin'),
    signOut,
    resetPassword: openAuthModal.bind(null,'resetPassword'),
  };
}

export default useSessionActions;
