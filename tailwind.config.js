/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          dark: '#0f2a1f',
          DEFAULT: '#164632',
          light: '#1d5a41',
        },
        amber: {
          DEFAULT: '#f2b705',
          deep: '#c98a02',
        },
        cream: '#f6ecd8',
        red: {
          DEFAULT: '#c1440e',
          deep: '#8f2e0a',
        },
        ink: '#0b1a13',
        wood: '#2b1a10',
      },
      fontFamily: {
        baloo: ['"Baloo 2"', 'sans-serif'],
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
