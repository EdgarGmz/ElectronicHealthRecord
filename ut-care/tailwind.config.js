/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          'light-border': 'rgba(255, 255, 255, 0.8)',
          dark: 'rgba(0, 0, 0, 0.4)',
          'dark-border': 'rgba(255, 255, 255, 0.1)',
          primary: 'rgba(37, 99, 235, 0.15)',
          'primary-border': 'rgba(37, 99, 235, 0.3)',
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      borderRadius: {
        glass: '16px',
        'glass-lg': '20px',
      },
      boxShadow: {
        glass: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 8px 24px -4px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
