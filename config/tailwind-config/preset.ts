/**
 * Tailwind v4 shared preset for Web3Insight apps.
 *
 * In Tailwind v4, configuration is primarily via CSS @theme directives in globals.css.
 * This file exposes the canonical theme tokens as TypeScript so they can be referenced
 * from JS code (e.g., chart color tokens, programmatic theming).
 *
 * Apps should import this and re-export from their own tailwind.config (if any), or
 * read tokens directly for chart libraries.
 */

export const tokens = {
  colors: {
    bg: 'var(--color-bg)',
    fg: 'var(--color-fg)',
    accent: 'var(--color-accent)',
    warn: 'var(--color-warn)',
    danger: 'var(--color-danger)',
    surface: 'var(--color-surface)',
    teal: {
      50: 'var(--color-teal-50)',
      100: 'var(--color-teal-100)',
      200: 'var(--color-teal-200)',
      300: 'var(--color-teal-300)',
      400: 'var(--color-teal-400)',
      500: 'var(--color-teal-500)',
      600: 'var(--color-teal-600)',
      700: 'var(--color-teal-700)',
      800: 'var(--color-teal-800)',
      900: 'var(--color-teal-900)',
      950: 'var(--color-teal-950)',
    },
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  },
} as const;

export type Tokens = typeof tokens;
