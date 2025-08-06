/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Modern Glassy Theme
        glass: {
          primary: '#0f0f23',
          secondary: '#1a1a2e',
          accent: '#16213e',
          surface: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        neon: {
          blue: '#00d4ff',
          purple: '#8b5cf6',
          pink: '#ec4899',
          green: '#10b981',
          cyan: '#06b6d4',
          orange: '#f97316',
        },
        game: {
          gold: '#fbbf24',
          health: '#ef4444',
          mana: '#00d4ff',
          exp: '#10b981',
        }
      },
      fontFamily: {
        'game': ['Orbitron', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

