/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paw: {
          orange: '#FF6B35',
          cream: '#FFF8F0',
          brown: '#6B3F2A',
          green: '#4CAF82',
        }
      },
      fontFamily: { display: ['Nunito', 'sans-serif'] }
    },
  },
  plugins: [],
}