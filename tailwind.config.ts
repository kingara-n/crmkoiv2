import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces — true black-ish base, slightly lifted cards
        ink: {
          950: "#0a0a0a",   // page bg
          900: "#111111",   // card bg
          850: "#161616",   // hover bg
          800: "#1f1f1f",   // input/elevated
          700: "#2a2a2a",   // borders
          600: "#3a3a3a",   // strong borders / hover borders
        },
        // Primary neon green from screenshots
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#22c55e",   // primary buttons, links, active
          600: "#16a34a",
          700: "#15803d",
        },
        // Soft data-viz colors from charts
        chart: {
          blue: "#38bdf8",
          green: "#22c55e",
          amber: "#f59e0b",
          red: "#ef4444",
          violet: "#a855f7",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        chip: "9999px",
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.03)",
      },
    },
  },
  plugins: [],
};
export default config;
