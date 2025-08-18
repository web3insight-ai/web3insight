import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

export default {
  content: [
    "./src/shared/components/**/*.{js,jsx,ts,tsx}",
    "./src/domain/**/*.{js,jsx,ts,tsx}",
    "./src/entry/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        background: {
          DEFAULT: "#FFFFFF",
          dark: "#0F0F0F",
        },
        surface: {
          DEFAULT: "#FAFAFA",
          dark: "#1A1A1A",
          elevated: "#252525",
        },
        border: {
          DEFAULT: "rgba(0, 0, 0, 0.06)",
          dark: "rgba(255, 255, 255, 0.08)",
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        120: "30rem",
      },
      maxWidth: {
        "8xl": "88rem",
        content: "1024px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
        card: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
        hover: "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      animation: {
        "fade-in": "fadeIn 400ms ease-in-out",
        "slide-up": "slideUp 400ms ease-out",
        typewriter: "typewriter 2s steps(40) 1s forwards",
        blink: "blink 1s infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "gradient-x": "gradientX 3s ease infinite",
        "scale-in": "scaleIn 300ms ease-out",
      },
      gridColumn: {
        "span-2": "span 2 / span 2",
        "span-3": "span 3 / span 3",
        "span-4": "span 4 / span 4",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        typewriter: {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        pulseGlow: {
          "0%, 100%": {
            opacity: "1",
            boxShadow:
              "0 0 20px rgba(15, 118, 110, 0.5), 0 0 40px rgba(15, 118, 110, 0.3)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow:
              "0 0 30px rgba(15, 118, 110, 0.8), 0 0 60px rgba(15, 118, 110, 0.4)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  darkMode: ["selector", '[data-theme="dark"]'],
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: "#FFFFFF",
            foreground: "#000000",
            primary: {
              DEFAULT: "#0F766E",
              foreground: "#FFFFFF",
            },
            focus: "#0F766E",
            success: "#059669",
            warning: "#D97706",
            danger: "#DC2626",
            secondary: "#6366F1",
          },
        },
        dark: {
          colors: {
            background: "#0F0F0F",
            foreground: "#FFFFFF",
            primary: {
              DEFAULT: "#14B8A6",
              foreground: "#FFFFFF",
            },
            focus: "#14B8A6",
            success: "#10B981",
            warning: "#F59E0B",
            danger: "#EF4444",
            secondary: "#818CF8",
          },
        },
      },
    }),
  ],
} satisfies Config;
