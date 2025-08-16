import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { languageAtom } from '#/atoms';
import { getUserLanguagePreference } from './locale';

/**
 * Hook to initialize language preference on client-side
 * Should be called in the root component to ensure proper language detection
 */
export function useLanguageInit() {
  const setLanguage = useSetAtom(languageAtom);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const detectedLanguage = getUserLanguagePreference();
      setLanguage(detectedLanguage);
    }
  }, [setLanguage]);
}
