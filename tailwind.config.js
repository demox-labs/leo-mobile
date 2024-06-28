/** @type {import('tailwindcss').Config} */
const colors = require('./tailwind.config.colors')

module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './.storybook/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [],
  theme: {
    extend: {
      colors: colors
    },
  },
}
