
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#141413",
          foreground: "#FAFAF8",
        },
        secondary: {
          DEFAULT: "#828179",
          foreground: "#FAFAF8",
        },
        muted: {
          DEFAULT: "#E6E4DD",
          foreground: "#605F5B",
        },
        accent: {
          DEFAULT: "#EBDBBC",
          foreground: "#3A3935",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#141413",
        },
        blue: {
          50: "#e6f1fe",
          100: "#cce3fd",
          200: "#99c7fb",
          300: "#66abf9",
          400: "#338ff7",
          500: "#0066ff",
          600: "#0052cc",
          700: "#003d99",
          800: "#002966",
          900: "#001433",
        },
        green: {
          50: "#e6f7ef",
          100: "#ccefdf",
          200: "#99dfbf",
          300: "#66cf9f",
          400: "#33bf7f",
          500: "#00af5f",
          600: "#008c4c",
          700: "#006939",
          800: "#004626",
          900: "#002313",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
