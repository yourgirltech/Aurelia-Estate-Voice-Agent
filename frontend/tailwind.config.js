import { COMPANY } from "./src/config/company.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: COMPANY.colors.primary,
          dark: COMPANY.colors.primaryDark,
          gold: COMPANY.colors.accent,
          "gold-light": COMPANY.colors.accentLight,
          bg: COMPANY.colors.background,
          surface: COMPANY.colors.surface,
          border: COMPANY.colors.border,
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(11, 31, 58, 0.06)",
        card: "0 4px 20px rgba(11, 31, 58, 0.08)",
      },
    },
  },
  plugins: [],
};
