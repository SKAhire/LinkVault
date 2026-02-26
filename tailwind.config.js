/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        geist: ["GeistMono-Regular"],
        geistBold: ["GeistMono-Bold"],
      },
      colors: {
        // Brand Colors
        primary: "#C0301E",
        secondary: "#F6DA9D",
        baseBlack: "#000000",

        // Core theme
        black: {
          DEFAULT: "#000000",
          soft: "#1A1A1A",
        },

        // Neutral scale for dark mode
        neutral: {
          800: "#1A1A1A",
          900: "#0A0A0A",
        },
      },
    },
  },
  plugins: [],
};
