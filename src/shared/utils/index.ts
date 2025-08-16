export {
  noop,
  isNumber, isString, isNumeric, isArray, isPlainObject,
  capitalize,
  pick, omit,
} from "@ntks/toolbox";

export {
  detectBrowserLanguage,
  getUserLanguagePreference,
  getStoredLanguagePreference,
  setStoredLanguagePreference,
  clearStoredLanguagePreference,
} from "./locale";

export type { Language } from "./locale";
