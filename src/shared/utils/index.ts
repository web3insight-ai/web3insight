// Utility functions previously from @ntks/toolbox, now implemented locally
export const noop = (): void => {
  // Intentionally empty no-op function
};

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value);

export const isString = (value: unknown): value is string =>
  typeof value === 'string';

export const isNumeric = (value: unknown): boolean =>
  !isNaN(Number(value)) && !isNaN(parseFloat(value));

export const isArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);

export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && value.constructor === Object;

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

export {
  detectBrowserLanguage,
  getUserLanguagePreference,
  getStoredLanguagePreference,
  setStoredLanguagePreference,
  clearStoredLanguagePreference,
} from "./locale";

export type { Language } from "./locale";
