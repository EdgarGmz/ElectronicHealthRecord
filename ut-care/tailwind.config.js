/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
        },
        background: "#f8fafc",
        foreground: "#0f172a",
      },
    },
  },
  plugins: [],
}
