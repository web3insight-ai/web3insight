export type Language = 'english' | 'chinese';

/**
 * Chinese locale codes that should default to 'chinese'
 */
const CHINESE_LOCALES = [
  'zh',      // Chinese
  'zh-cn',   // Simplified Chinese - China
  'zh-tw',   // Traditional Chinese - Taiwan
  'zh-hk',   // Traditional Chinese - Hong Kong
  'zh-sg',   // Simplified Chinese - Singapore
  'zh-mo',   // Traditional Chinese - Macau
];

/**
 * Storage key for user's language preference
 */
const LANGUAGE_STORAGE_KEY = 'web3insight_language_preference';

/**
 * Detects if a locale string indicates Chinese language
 */
function isChineseLocale(locale: string): boolean {
  const normalizedLocale = locale.toLowerCase();
  return CHINESE_LOCALES.some(chineseLocale => 
    normalizedLocale === chineseLocale || normalizedLocale.startsWith(`${chineseLocale}-`),
  );
}

/**
 * Detects browser language and returns appropriate language preference
 * Defaults to 'chinese' for Chinese locales, 'english' for others
 */
export function detectBrowserLanguage(): Language {
  // Server-side rendering check
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'english';
  }

  try {
    // Get browser languages in order of preference
    const languages = navigator.languages || [navigator.language];
    
    // Check each language in order
    for (const lang of languages) {
      if (lang && isChineseLocale(lang)) {
        return 'chinese';
      }
    }
    
    return 'english';
  } catch (error) {
    // Fallback to english if detection fails
    console.warn('Failed to detect browser language:', error);
    return 'english';
  }
}

/**
 * Gets the user's stored language preference from localStorage
 * Returns null if no preference is stored
 */
export function getStoredLanguagePreference(): Language | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'english' || stored === 'chinese') {
      return stored;
    }
    return null;
  } catch (error) {
    console.warn('Failed to read language preference from localStorage:', error);
    return null;
  }
}

/**
 * Stores the user's language preference in localStorage
 */
export function setStoredLanguagePreference(language: Language): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.warn('Failed to store language preference in localStorage:', error);
  }
}

/**
 * Clears the stored language preference, falling back to browser detection
 */
export function clearStoredLanguagePreference(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear language preference from localStorage:', error);
  }
}

/**
 * Gets the user's language preference with the following priority:
 * 1. Stored user preference (from manual selection)
 * 2. Browser language detection
 * 3. Default to 'english'
 */
export function getUserLanguagePreference(): Language {
  // Check for stored preference first (user manually selected)
  const storedPreference = getStoredLanguagePreference();
  if (storedPreference) {
    return storedPreference;
  }

  // Fall back to browser detection
  return detectBrowserLanguage();
}
