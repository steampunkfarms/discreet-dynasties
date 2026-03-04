/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dynasty design tokens — deep walnut + amber + parchment
        'dynasty-bg': 'var(--color-bg)',
        'dynasty-bg-elevated': 'var(--color-bg-elevated)',
        'dynasty-bg-recessed': 'var(--color-bg-recessed)',
        'dynasty-surface': 'var(--color-surface)',
        'dynasty-ink': 'var(--color-ink)',
        'dynasty-ink-light': 'var(--color-ink-light)',
        'dynasty-ink-muted': 'var(--color-ink-muted)',
        'dynasty-amber': 'var(--color-amber)',
        'dynasty-amber-light': 'var(--color-amber-light)',
        'dynasty-amber-dark': 'var(--color-amber-dark)',
        'dynasty-walnut': 'var(--color-walnut)',
        'dynasty-walnut-light': 'var(--color-walnut-light)',
        'dynasty-border': 'var(--color-border)',
        'dynasty-border-strong': 'var(--color-border-strong)',
      },
      fontFamily: {
        display: ['var(--font-crimson-pro)', 'Georgia', 'serif'],
        body: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'Menlo', 'monospace'],
        reading: ['var(--font-crimson-pro)', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-md': ['1.875rem', { lineHeight: '1.2' }],
        'display-sm': ['1.5rem', { lineHeight: '1.3' }],
        'reading-lg': ['1.25rem', { lineHeight: '1.9' }],
        'reading-md': ['1.125rem', { lineHeight: '1.85' }],
      },
      maxWidth: {
        'prose': '42rem',
        'content': '48rem',
        'wide': '64rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
