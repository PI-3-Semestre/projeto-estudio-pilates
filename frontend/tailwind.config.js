/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: '#14b8a6', // teal-500
        'background-light': '#f0fdfa', // teal-50
        'background-dark': '#115e59', // teal-900
        'text-light': '#134e4a', // teal-900
        'text-dark': '#f0fdfa', // teal-50
        'input-bg-light': '#ffffff',
        'input-bg-dark': '#0f766e', // teal-700
        'input-placeholder-light': '#9ca3af', // gray-400
        'input-placeholder-dark': '#ccfbf1', // teal-100
        'input-icon-light': '#6b7280', // gray-500
        'input-icon-dark': '#99f6e4', // teal-200
        'secondary-text-light': '#4b5563', // gray-600
        'secondary-text-dark': '#d1d5db' // gray-300
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
      },
      backgroundImage: {
        'gradient-custom': 'linear-gradient(to bottom, #2dd4bf, #99f6e4, #f0fdfa)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
