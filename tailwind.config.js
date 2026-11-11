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
        phantom: {
          bg: '#08080a',
          surface1: '#0e0e11',
          surface2: '#121216',
          surface3: '#17171c',
          surface4: '#1c1c22',
          surface5: '#22222a',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: 'var(--ph-accent)',
          accentInk: 'var(--ph-accent-ink)',
          ok: '#22c55e',
          warn: '#eab308',
          bad: '#ef4444',
          badText: '#f87171',
        }
      },
      fontFamily: {
        display: ['Tektur', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
