/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#13F287",
          200: "#13CA72",
          300: "#32634C",
        },
        netral: {
          100: "#C3C3C3",
          200: "#A4A4A4",
          300: "#333333",
          400: "#1A1919",
          500: "#030303",
        },
      },
      animation: {
        "spin-slow": "spin 5s linear infinite",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
