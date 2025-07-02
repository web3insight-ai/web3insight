import { atom } from 'jotai';

export type AuthModalType = 'signin' | 'signup' | 'forgotPassword' | 'resetPassword';

export const upgradePremiumModalOpenAtom = atom(false);
export const authModalOpenAtom = atom(false);
export const authModalTypeAtom = atom<AuthModalType>('signin');
export const authRedirectToAtom = atom<string | null>(null);
export const signinModalOpenAtom = atom(false);

// Toast notification atoms
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export const toastsAtom = atom<Toast[]>([]);

// Helper atom to add a toast
export const addToastAtom = atom(
  null,
  (get, set, toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast,
    };

    set(toastsAtom, [...get(toastsAtom), newToast]);

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set(toastsAtom, (toasts) => toasts.filter(t => t.id !== id));
      }, newToast.duration);
    }
  },
);

// Helper atom to remove a toast
export const removeToastAtom = atom(
  null,
  (get, set, id: string) => {
    set(toastsAtom, get(toastsAtom).filter(toast => toast.id !== id));
  },
);
