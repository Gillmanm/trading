/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#070b12',
          card: '#0d131d',
          card2: '#111a26',
          border: '#1d2a3a',
          sidebar: '#090e16',
          muted: '#8190a4',
          text: '#edf3fb',
          accent: '#55a7ff',
          green: '#35d49a',
          red: '#ff6175',
          yellow: '#f6c85f',
        }
      }
    },
  },
  plugins: [],
}
