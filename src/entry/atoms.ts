import { atom } from 'jotai';

export type AuthModalType = 'signin' | 'signup' | 'forgotPassword' | 'resetPassword';

export const upgradePremiumModalOpenAtom = atom(false);
export const authModalOpenAtom = atom(false);
export const authModalTypeAtom = atom<AuthModalType>('signin');
export const authRedirectToAtom = atom<string | null>(null);
export const signinModalOpenAtom = atom(false);
