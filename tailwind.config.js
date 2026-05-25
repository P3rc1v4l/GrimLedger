/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],
        body:    ['"EB Garamond"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        shimmer:  { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
        slideIn:  { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        popIn:    { '0%': { transform: 'scale(0.92)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        glow:     { '0%,100%': { boxShadow: '0 0 6px rgba(251,191,36,0.15)' }, '50%': { boxShadow: '0 0 18px rgba(251,191,36,0.35)' } },
      },
      animation: {
        shimmer: 'shimmer 2.5s ease-in-out infinite',
        slideIn: 'slideIn 0.25s ease-out',
        popIn:   'popIn 0.2s ease-out',
        glow:    'glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
