/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel Decorative"', '"Cinzel"', 'Georgia', 'serif'],
        body:    ['"EB Garamond"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      colors: {
        // Core palette
        void:   { DEFAULT: '#080608', 50: '#1a0f1a', 100: '#120b12' },
        blood:  { DEFAULT: '#8b0000', light: '#b71c1c', dark: '#4a0000', glow: '#ff1a1a' },
        gold:   { DEFAULT: '#c9a227', light: '#e8c84a', dark: '#8a6c1a', pale: '#f0d878' },
        ash:    { DEFAULT: '#4a4048', light: '#6b5f6a', dark: '#2a2028' },
        rune:   { DEFAULT: '#6b21a8', light: '#9333ea', glow: '#c084fc' },
      },
      keyframes: {
        flicker:  { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.7 }, '75%': { opacity: 0.9 } },
        runeGlow: { '0%,100%': { textShadow: '0 0 4px #9333ea' }, '50%': { textShadow: '0 0 12px #c084fc, 0 0 24px #9333ea' } },
        bloodPulse:{ '0%,100%': { boxShadow: '0 0 4px #8b0000' }, '50%': { boxShadow: '0 0 16px #b71c1c, 0 0 32px #8b0000' } },
        fadeIn:   { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        countUp:  { from: { opacity: 0, transform: 'translateY(-4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        flicker:   'flicker 3s ease-in-out infinite',
        runeGlow:  'runeGlow 4s ease-in-out infinite',
        bloodPulse:'bloodPulse 3s ease-in-out infinite',
        fadeIn:    'fadeIn 0.25s ease-out',
        countUp:   'countUp 0.15s ease-out',
      },
    },
  },
  plugins: [],
}
