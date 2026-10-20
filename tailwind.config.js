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
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        'surface-subtle': '#F1F5F9',
        border: '#E2E8F0',
        'primary-slate': '#0F172A',
        'telemetry-emerald': '#10B981',
      },
      borderRadius: {
        '24': '24px',
        '3xl': '24px',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        lcd: ['VT323', 'ui-monospace', '"Courier New"', 'monospace'],
        device: ['"Barlow Condensed"', '"Arial Narrow"', 'system-ui', 'sans-serif'],
        callout: ['Barlow', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 8px 24px -4px rgba(15, 23, 42, 0.07)',
        'modal': '0 12px 32px -4px rgba(15, 23, 42, 0.08)',
      }
    },
  },
  plugins: [],
}
