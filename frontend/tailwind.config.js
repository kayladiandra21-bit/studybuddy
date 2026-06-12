/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // toggled by ThemeContext
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Soft indigo/violet brand palette (matches calendar category colors)
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};
