/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          charcoal: '#121212', // Main background
          card: '#1A1A1A',     // Surface & Cards BG
          black: '#000000',    // Pure Contrast BG
          subtle: '#222222',
          border: 'rgba(212, 175, 55, 0.15)',
        },
        gold: {
          DEFAULT: '#D4AF37',  // Primary Champagne Gold
          light: '#F3E5AB',
          hover: '#C29B27',
          dark: '#997D20',
          glow: 'rgba(212, 175, 55, 0.25)',
        },
        emerald: {
          DEFAULT: '#059669',  // Deep Emerald Green
          light: '#10B981',
          glow: 'rgba(5, 150, 105, 0.25)',
        },
        cyan: {
          electric: '#0EA5E9', // Electric Cyan
          glow: 'rgba(14, 165, 233, 0.20)',
        },
        slate: {
          muted: '#94A3B8',    // Soft Muted Slate
          sub: '#64748B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 35px -5px rgba(212, 175, 55, 0.3)',
        'cyan-glow': '0 0 45px -5px rgba(14, 165, 233, 0.25)',
        'card-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
