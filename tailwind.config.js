/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#4285F4',
          'blue-hover': '#3367D6',
          'blue-light': '#E8F0FE',
          red: '#EA4335',
          'red-light': '#FCE8E6',
          yellow: '#FBBC05',
          'yellow-light': '#FEF7E0',
          green: '#34A853',
          'green-light': '#E6F4EA',
        },
        surface: {
          50: '#F8F9FA',
          100: '#F1F3F4',
          200: '#E8EAED',
          300: '#DADCE0',
          800: '#3C4043',
          900: '#202124',
        }
      },
      fontFamily: {
        sans: [
          'Google Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        google: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        'google-hover': '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
        'google-card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'google': '8px',
        'google-pill': '24px',
      }
    },
  },
  plugins: [],
}
