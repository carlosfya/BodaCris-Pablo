import type { Config } from "tailwindcss";

export default {
  content: [
    "./public/**/*.html",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wedding: {
          bg: "#faf8f5",
          bg2: "#f5f2ed",
          ink: "#5a5a5a",
          muted: "#8a8a8a",
          green: "#7d9b76",
          rose: "#d4a5a5",
          gold: "#c9a86c",
          sand: "#c9b896"
        },
      },
      fontFamily: {
        title: ["Cormorant Garamond", "serif"],
        body: ["Montserrat", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
