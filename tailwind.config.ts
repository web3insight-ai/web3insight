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
          dark: "#000000",
        },
        surface: {
          DEFAULT: "#FAFAFA",
          dark: "#0A0A0A",
        },
        border: {
          DEFAULT: "rgba(0, 0, 0, 0.06)",
          dark: "rgba(255, 255, 255, 0.06)",
        },
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        120: "30rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "content": "1024px",
      },
      boxShadow: {
        "subtle": "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
        "card": "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
        "hover": "0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      animation: {
        "fade-in": "fadeIn 400ms ease-in-out",
        "slide-up": "slideUp 400ms ease-out",
        "typewriter": "typewriter 2s steps(40) 1s forwards",
        "blink": "blink 1s infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "gradient-x": "gradientX 3s ease infinite",
        "scale-in": "scaleIn 300ms ease-out",
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
            boxShadow: "0 0 20px rgba(0, 111, 238, 0.5), 0 0 40px rgba(0, 111, 238, 0.3)",
          },
          "50%": { 
            opacity: "0.8",
            boxShadow: "0 0 30px rgba(0, 111, 238, 0.8), 0 0 60px rgba(0, 111, 238, 0.4)",
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
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: "#FFFFFF",
            foreground: "#000000",
            primary: {
              DEFAULT: "#006FEE",
              foreground: "#FFFFFF",
            },
            focus: "#006FEE",
          },
        },
        dark: {
          colors: {
            background: "#000000",
            foreground: "#FFFFFF",
            primary: {
              DEFAULT: "#338EF7",
              foreground: "#FFFFFF",
            },
            focus: "#338EF7",
          },
        },
      },
    }),
  ],
} satisfies Config;
