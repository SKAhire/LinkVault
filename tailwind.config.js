
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        geist: ["GeistMono-Regular"],
        geistBold: ["GeistMono-Bold"],
      },
      colors: {
        // Core theme
        black: {
          DEFAULT: "#000000",
          soft: "#1A1A1A", // for subtle contrasts (grid bg, cards)
        },
        neon: {
          orange: "#FF5F1F", // main accent
          soft: "#FFB347", // secondary / highlight
        },

        // Utility colors for UI
        grid: {
          past: "#FF5F1F", // marked box
          current: "#FFB347", // highlighted glow/current
          future: "#222222", // upcoming box
        },
      },
    },
  },
  plugins: [],
};
