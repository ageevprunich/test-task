/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // всі файли JS/TS/TSX у src
    "./app/**/*.{js,ts,jsx,tsx}", // якщо у тебе app router
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
