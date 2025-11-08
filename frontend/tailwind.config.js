/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0ac2ac",
        "background": {
          "light": "#f5f8f8",
          "dark": "#102220",
          "page": "#f8fcfb"
        },
        "card": {
          "light": "#ffffff",
          "dark": "#1a2c2a"
        },
        "text": {
          "light": "#000000",
          "dark": "#e0e0e0",
          "subtle": {
            "light": "#6b7280",
            "dark": "#8cd4cb"
          }
        },
        "action": {
          "primary": "#0fbdac",
          "secondary": "#e7f3f2"
        },
        "input": {
          "background": {
            "light": "#e7f3f2",
            "dark": "#1f3a37"
          },
          "placeholder": {
            "light": "#666666",
            "dark": "#a0a0a0"
          },
          "icon": {
            "light": "#4b5563",
            "dark": "#9ca3af"
          }
        }
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
