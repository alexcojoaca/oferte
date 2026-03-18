/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,.08)',
        card: '0 12px 40px rgba(0,0,0,.10)'
      }
    }
  },
  plugins: []
};

