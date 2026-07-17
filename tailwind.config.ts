import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0E14',
          soft: '#0F1319'
        },
        panel: {
          DEFAULT: '#12161F',
          raised: '#171C27'
        },
        line: {
          DEFAULT: '#232937',
          soft: '#1A2029'
        },
        ivory: {
          DEFAULT: '#E4E7EE',
          muted: '#7C8496',
          faint: '#4B5263'
        },
        brass: {
          50: '#FBF3E3',
          200: '#EBCE95',
          400: '#D4A24C',
          500: '#C0913F',
          600: '#9C7530',
          700: '#7A5B25'
        },
        signal: {
          red: '#E5484D',
          amber: '#D4A24C',
          green: '#3DD68C'
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)']
      },
      backgroundImage: {
        ledger: 'linear-gradient(rgba(228,231,238,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(228,231,238,0.035) 1px, transparent 1px)'
      },
      backgroundSize: {
        ledger: '28px 28px'
      },
      boxShadow: {
        seal: '0 0 0 1px rgba(212,162,76,0.35), 0 8px 24px -12px rgba(212,162,76,0.35)'
      },
      letterSpacing: {
        eyebrow: '0.18em'
      }
    }
  },
  plugins: []
};

export default config;
