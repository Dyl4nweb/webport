import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "rgb(var(--color-surface, 251 251 253) / <alpha-value>)",
          alt: "rgb(var(--color-surface-alt, 245 245 247) / <alpha-value>)",
          card: "rgb(var(--color-surface-card, 255 255 255) / <alpha-value>)",
          dark: "rgb(var(--color-surface-dark, 0 0 0) / <alpha-value>)",
          "dark-alt": "rgb(var(--color-surface-dark-alt, 17 17 19) / <alpha-value>)",
          "dark-card": "rgb(var(--color-surface-dark-card, 29 29 31) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--color-ink, 29 29 31) / <alpha-value>)",
          secondary: "rgb(var(--color-ink-secondary, 134 134 139) / <alpha-value>)",
          tertiary: "rgb(var(--color-ink-tertiary, 110 110 115) / <alpha-value>)",
          dark: "rgb(var(--color-ink-dark, 245 245 247) / <alpha-value>)",
          "dark-secondary": "rgb(var(--color-ink-dark-secondary, 152 152 157) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--color-line, 210 210 215) / <alpha-value>)",
          dark: "rgb(var(--color-line-dark, 66 66 69) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent, 29 29 31) / <alpha-value>)",
          hover: "rgb(var(--color-accent-hover, 0 0 0) / <alpha-value>)",
          dark: "rgb(var(--color-accent-dark, 245 245 247) / <alpha-value>)",
          "dark-hover": "rgb(var(--color-accent-dark-hover, 255 255 255) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        text: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        content: "1180px",
        narrow: "780px",
      },
      borderRadius: {
        apple: "20px",
        "apple-sm": "14px",
        "apple-lg": "28px",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.28, 0.11, 0.32, 1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.8s cubic-bezier(0.28,0.11,0.32,1) both",
        fadeIn: "fadeIn 0.6s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
