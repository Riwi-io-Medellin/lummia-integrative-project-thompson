/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        app: 'rgb(var(--rgb-bg) / <alpha-value>)',
        card: 'rgb(var(--rgb-card) / <alpha-value>)',
        input: 'rgb(var(--rgb-input) / <alpha-value>)',
        main: 'rgb(var(--rgb-text) / <alpha-value>)',
        muted: 'rgb(var(--rgb-muted) / <alpha-value>)',
        line: 'rgb(var(--rgb-border) / <alpha-value>)',
        accent: 'rgb(var(--rgb-accent) / <alpha-value>)',
      },
      backdropBlur: {
        theme: 'var(--blur-theme)',
      },
      boxShadow: {
        theme: 'var(--shadow-main)',
      }
    },
  },
  plugins: [],
}