/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1456f0",
          pink: "#ea5ec1",
          sky: "#3daeff",
          deep: "#17437d",
        },
        primary: {
          200: "#bfdbfe",
          light: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        text: {
          primary: "#222222",
          dark: "#18181b",
          charcoal: "#181e25",
          secondary: "#45515e",
          muted: "#8e8e93",
          light: "#5f5f5f",
        },
        surface: {
          white: "#ffffff",
          gray: "#f0f0f0",
          border: "#f2f3f5",
          borderGray: "#e5e7eb",
        },
        success: { bg: "#e8ffea" },
      },
      fontFamily: {
        dm: ["DM Sans", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        outfit: ["Outfit", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        roboto: ["Roboto", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        brand: "rgba(44, 30, 116, 0.16) 0px 0px 15px",
        "brand-offset": "rgba(44, 30, 116, 0.11) 6.5px 2px 17.5px",
        card: "rgba(36, 36, 36, 0.08) 0px 12px 16px -4px",
        soft: "rgba(0, 0, 0, 0.08) 0px 0px 22.576px",
        subtle: "rgba(0, 0, 0, 0.08) 0px 4px 6px",
      },
      borderRadius: {
        pill: "9999px",
        card: "20px",
        "card-lg": "24px",
        "ai-card": "13px",
      },
    },
  },
  plugins: [],
};
