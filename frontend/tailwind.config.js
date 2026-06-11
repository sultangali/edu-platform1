/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Gradient color stops (from-/via-/to-) are stored in the database and applied
  // at runtime, so Tailwind can't find them in the source and would purge them —
  // leaving white text on an empty background. Safelist every color/shade we seed.
  safelist: [
    {
      pattern:
        /^(from|via|to)-(slate|pink|rose|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia)-(300|400|500|600|700)$/
    }
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 2.5s infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' }
        }
      },
      boxShadow: {
        glow: '0 0 60px -10px rgba(217, 70, 239, 0.5)',
        'glow-cyan': '0 0 60px -10px rgba(34, 211, 238, 0.6)'
      }
    }
  },
  plugins: []
};
