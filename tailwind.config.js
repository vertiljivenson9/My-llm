/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        forge: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fd',
          300: '#a5bbfc',
          400: '#8196f8',
          500: '#6272f1',
          600: '#4d55e5',
          700: '#3f44ca',
          800: '#353aa4',
          900: '#303682',
          950: '#1d1f4d',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8f9fc',
          100: '#f0f2f8',
          200: '#e4e7f0',
          300: '#d0d4e4',
          400: '#9ba3c4',
          500: '#6b75a0',
          600: '#4b5478',
          700: '#353d60',
          800: '#242b4a',
          900: '#181d38',
          950: '#0e1124',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(98, 114, 241, 0.15)',
        'glow':    '0 0 24px rgba(98, 114, 241, 0.2)',
        'glow-lg': '0 0 48px rgba(98, 114, 241, 0.25)',
        'card':    '0 1px 3px rgba(14,17,36,0.06), 0 4px 16px rgba(14,17,36,0.08)',
        'card-hover': '0 4px 12px rgba(14,17,36,0.08), 0 12px 32px rgba(14,17,36,0.12)',
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':      'fadeIn 0.4s ease-out',
        'slide-up':     'slideUp 0.4s ease-out',
        'slide-down':   'slideDown 0.3s ease-out',
        'spin-slow':    'spin 2s linear infinite',
        'shimmer':      'shimmer 1.6s infinite',
        'float':        'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
      backgroundImage: {
        'gradient-forge': 'linear-gradient(135deg, #4d55e5 0%, #6272f1 50%, #8196f8 100%)',
        'gradient-mesh':  'radial-gradient(at 40% 20%, hsla(240,80%,70%,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(230,75%,65%,0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(245,85%,72%,0.05) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
}
