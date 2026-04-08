/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",  // ← make sure .jsx is included
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}