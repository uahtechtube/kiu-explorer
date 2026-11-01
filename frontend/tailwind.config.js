/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#002147", // KIU Navy
          light: "#1A335E",
          dark: "#00152E",
        },
        secondary: {
          DEFAULT: "#FFD700", // KIU Gold
          light: "#FFDF33",
          dark: "#CCAC00",
        },
        accent: {
          DEFAULT: "#C4956B", // Beige/Tan
          light: "#D4A87B",
          dark: "#B4855B",
        },
        background: {
          DEFAULT: "#F8F9FA", // Light mode background
          light: "#FFFFFF", // Light mode secondary
          dark: "#002147", // Dark mode background (KIU Navy)
          darker: "#00152E", // Dark mode secondary
        },
        navy: {
          DEFAULT: "#002147",
          light: "#1A335E",
          dark: "#00152E",
        },
      },
    },
  },
  plugins: [],
};
