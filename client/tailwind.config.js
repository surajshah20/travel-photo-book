// client/tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Blushbook brand colors
        blush: {
          50:  "#fff0f3",
          100: "#ffe0e8",
          200: "#ffc0d0",
          300: "#ff91aa",
          400: "#ff5c80",
          500: "#ff2d5a",
          600: "#ed1147",
          700: "#c8083a",
          800: "#a80a35",
          900: "#8f0c32",
        },
        rose: {
          50:  "#fff1f3",
          100: "#ffe4e8",
          200: "#ffccd5",
          300: "#ffa0b0",
          400: "#ff6b85",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 20px rgba(255, 100, 130, 0.08)",
        card: "0 4px 24px rgba(0, 0, 0, 0.06)",
        pink: "0 4px 24px rgba(255, 45, 90, 0.15)",
      },
    },
  },
  plugins: [],
}