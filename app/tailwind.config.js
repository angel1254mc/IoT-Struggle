/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient': 'linear-gradient(180deg, #FFF 52.08%, #B2FFBA 100%);',
        'horizontal-gradient': 'linear-gradient(90deg, #000 11.89%, #436F0B 45.6%, #5DD100 111.45%);'
      },
      colors: {
        'lightgreen': "#79CB38"
      }
    },
  },
  plugins: [],
}
