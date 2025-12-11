import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './types.ts',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(152, 32%, 82%)',
        input: 'hsl(152, 32%, 82%)',
        ring: 'hsl(152, 56%, 33%)',
        background: 'hsl(150, 33%, 96%)',
        foreground: 'hsl(222, 47%, 11%)',
        muted: 'hsl(152, 28%, 92%)',
        'muted-foreground': 'hsl(150, 18%, 40%)',
        accent: 'hsl(148, 45%, 92%)',
        'accent-foreground': 'hsl(154, 50%, 28%)',
        'card-bg': 'hsl(0, 0%, 100%)',
        sidebar: 'hsl(152, 31%, 14%)',
        'sidebar-muted': 'rgba(255,255,255,0.8)',
        primary: {
          DEFAULT: 'hsl(152, 56%, 33%)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'hsl(152, 28%, 92%)',
          foreground: 'hsl(152, 56%, 22%)',
        },
      },
      boxShadow: {
        soft: '0 20px 40px -24px rgba(15, 118, 110, 0.3)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '28px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
