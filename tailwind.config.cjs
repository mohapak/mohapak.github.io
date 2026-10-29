const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      /* Colour tokens are HSL triplets in index.css so every opacity step
         (text-fg/60, border-fg/10 …) works in both themes. */
      colors: {
        bg: 'hsl(var(--bg) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        fg: 'hsl(var(--fg) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        'on-accent': 'hsl(var(--on-accent) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', ...defaultTheme.fontFamily.sans],
        display: ['"Instrument Serif"', 'Georgia', ...defaultTheme.fontFamily.serif],
      },
      letterSpacing: {
        label: '0.18em',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
