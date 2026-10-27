/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060913',
          900: '#0a0f1d',
          850: '#0f172a',
          800: '#141e38',
          700: '#1e294b',
          600: '#2c3c69',
        },
        spectral: {
          purple: '#a855f7',
          violet: '#8b5cf6',
          cyan: '#06b6d4',
          sky: '#38bdf8',
          glow: 'rgba(168, 85, 247, 0.4)',
          cyanglow: 'rgba(6, 182, 212, 0.4)',
        }
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'spectral-drift': 'drift 8s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.06)' },
        },
        drift: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%': { transform: 'translate(10px, -8px) rotate(2deg)' },
          '100%': { transform: 'translate(-8px, -15px) rotate(-2deg)' },
        }
      }
    },
  },
  plugins: [],
}
