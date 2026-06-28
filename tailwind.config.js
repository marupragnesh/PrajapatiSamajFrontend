/** @type {import('tailwindcss').Config} */
export default {
  // Enable class-based dark mode (toggled via className on <html>)
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: {
          DEFAULT: '#B5451B',
          light: '#F4A261',
        },
        background: {
          light: '#FFF8F0',
          dark: '#1A1A2E',
        },
        card: {
          dark: '#16213E',
        },
        border: {
          DEFAULT: '#E8D5C4',
        },
        success: '#2D6A4F',
        error: '#C62828',
      },
    },
  },
  plugins: [],
};
