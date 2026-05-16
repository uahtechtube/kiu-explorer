/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#002147", // KIU Deep Navy
          light: "#003366",
          dark: "#001a33",
        },
        secondary: {
          DEFAULT: "#FFD700", // KIU Gold
          light: "#FFEB3B",
          dark: "#C5A300",
        },
        accent: {
          DEFAULT: "#E63946", // Vibrant Red
        },
        background: {
          DEFAULT: "#F8F9FA",
          dark: "#121212",
        },
      },
    },
  },
  plugins: [],
};
