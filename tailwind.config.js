/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          50: '#f7f8fa', 100: '#eceef2', 200: '#dde1e8', 300: '#c3c9d4',
          700: '#2a2f3a', 800: '#1c2028', 900: '#12151a', 950: '#0b0d11',
        },
        accent: {
          500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
