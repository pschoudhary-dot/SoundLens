import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#121212',
        secondary: '#FFFFFF',
        accent: '#1DB954', // Spotify Green
        'accent-alt': '#1ABC9C', // Teal alternative
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    function({ addUtilities, theme }) {
      const newUtilities = {}
      for (let i = 1; i <= 10; i++) {
        newUtilities[`.animation-delay-${i * 100}`] = {
          'animation-delay': `${i * 0.1}s`,
        }
        newUtilities[`.animation-delay-${i * 300}`] = {
          'animation-delay': `${i * 0.3}s`,
        }
      }
      addUtilities(newUtilities)
    },
  ],
};

export default config;
