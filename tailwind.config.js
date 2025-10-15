/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,jsx}",
      "./components/**/*.{js,jsx}",
    ],
    darkMode: "class", // we'll default to dark via class on <body>
    theme: {
      extend: {
        colors: {
          bg: "#0b0f13",
          card: "#0f1720",
          accent: "#6ee7b7",
          glow: "#7c3aed"
        }
      },
    },
    plugins: [],
  }
  