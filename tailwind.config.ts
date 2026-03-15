import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#07090d",
          900: "#0d1117",
          800: "#121924"
        },
        accent: {
          500: "#4f7cff",
          400: "#678dff",
          300: "#89a4ff"
        }
      },
      boxShadow: {
        premium: "0 24px 80px -38px rgba(79, 124, 255, 0.45)"
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
        spotlight: "radial-gradient(ellipse at top, rgba(79, 124, 255, 0.22), transparent 55%)"
      }
    }
  },
  plugins: []
};

export default config;
