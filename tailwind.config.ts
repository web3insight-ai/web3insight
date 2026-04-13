import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        // Semantic tokens (read live from CSS vars — flip with theme toggle)
        bg: "var(--bg)",
        "bg-raised": "var(--bg-raised)",
        "bg-sunken": "var(--bg-sunken)",
        fg: "var(--fg)",
        "fg-muted": "var(--fg-muted)",
        "fg-subtle": "var(--fg-subtle)",
        rule: "var(--rule)",
        "rule-strong": "var(--rule-strong)",
        accent: {
          DEFAULT: "var(--accent)",
          fg: "var(--accent-fg)",
          muted: "var(--accent-muted)",
          subtle: "var(--accent-subtle)",
        },
        warn: {
          DEFAULT: "var(--warn)",
          subtle: "var(--warn-subtle)",
        },
        danger: {
          DEFAULT: "var(--danger)",
        },

        // Teal ramp (for charts and raw palette access)
        teal: {
          50: "var(--teal-50)",
          100: "var(--teal-100)",
          200: "var(--teal-200)",
          300: "var(--teal-300)",
          400: "var(--teal-400)",
          500: "var(--teal-500)",
          600: "var(--teal-600)",
          700: "var(--teal-700)",
          800: "var(--teal-800)",
          900: "var(--teal-900)",
          950: "var(--teal-950)",
        },

        // Legacy aliases kept ONLY to prevent build breakage during the
        // phased migration. Every use-site will be replaced across Phases 1–9
        // and these aliases will be deleted in Phase 9.
        background: {
          DEFAULT: "var(--bg)",
          dark: "var(--bg)",
        },
        foreground: {
          DEFAULT: "var(--fg)",
          dark: "var(--fg)",
        },
        surface: {
          DEFAULT: "var(--bg-raised)",
          dark: "var(--bg-raised)",
          elevated: "var(--bg-sunken)",
        },
        border: {
          DEFAULT: "var(--rule)",
          dark: "var(--rule)",
        },
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-fg)",
        },
        success: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-fg)",
        },
        warning: {
          DEFAULT: "var(--warn)",
          foreground: "var(--accent-fg)",
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        120: "30rem",
      },
      maxWidth: {
        "8xl": "88rem",
        content: "60rem",
        measure: "68ch",
        "measure-wide": "78ch",
      },
      boxShadow: {
        // Editorial rule-shadow: 1px hairline + subtle lift
        editorial: "0 0 0 1px var(--rule), 0 1px 2px rgba(0, 0, 0, 0.04)",
        "editorial-raised":
          "0 0 0 1px var(--rule), 0 4px 12px rgba(0, 0, 0, 0.06)",
      },
      transitionTimingFunction: {
        "out-editorial": "cubic-bezier(0.22, 1, 0.36, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      animation: {
        "fade-in": "fadeIn 400ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "editorial-pulse":
          "editorial-pulse 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite",
      },
      gridColumn: {
        "span-2": "span 2 / span 2",
        "span-3": "span 3 / span 3",
        "span-4": "span 4 / span 4",
      },
      keyframes: {
        fadeIn: {
          "0%": { transform: "translateY(4px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "editorial-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
