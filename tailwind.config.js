import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  plugins: [
    typography
  ],
  // Tailwind v4: la variante dark se define en CSS con @custom-variant en main.css
}
