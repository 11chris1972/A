/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        remacle: {
          green: '#2d7a3a',
          'green-dark': '#1e5428',
          'green-light': '#4a9e5a',
          navy: '#1a2e4a',
          'navy-dark': '#0f1e30',
          'navy-light': '#2a4a6a',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}

