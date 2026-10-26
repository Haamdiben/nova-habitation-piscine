/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        // Colours are CSS variables (see styles.scss) so `.on-dark` can swap them
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
        },
        // Gold for the small uppercase labels and the key figures (lighter inside .on-dark)
        gold: {
          DEFAULT: 'rgb(var(--gold) / <alpha-value>)',
          light: 'rgb(var(--gold-light) / <alpha-value>)',
        },
        // Riviera blue scale: navy text (50-200), blues (300+), accent (500)
        sea: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => [
            shade,
            `rgb(var(--sea-${shade}) / <alpha-value>)`,
          ]),
        ),
      },
    },
  },
  plugins: [],
}
