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
          DEFAULT: "#fbfbfd",
          alt: "#f5f5f7",
          card: "#ffffff",
          dark: "#000000",
          "dark-alt": "#111113",
          "dark-card": "#1d1d1f",
        },
        ink: {
          DEFAULT: "#1d1d1f",
          secondary: "#86868b",
          tertiary: "#6e6e73",
          dark: "#f5f5f7",
          "dark-secondary": "#98989d",
        },
        line: {
          DEFAULT: "#d2d2d7",
          dark: "#424245",
        },
        accent: {
          DEFAULT: "#1d1d1f",
          hover: "#000000",
          dark: "#f5f5f7",
          "dark-hover": "#ffffff",
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
