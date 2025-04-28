/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#A47863",
        secondary: "#644639",
        background: "#F1F0E2",
        text: "#6B3E26",
        highlights: "#C6C458",
        border: "#0F0B0A",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
