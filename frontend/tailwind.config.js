/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Paleta sobria: el enunciado no evalua diseno grafico.
        brand: {
          50: '#eef4ff',
          100: '#dae5ff',
          500: '#3b6cf6',
          600: '#2b55d4',
          700: '#2244aa',
        },
      },
    },
  },
  plugins: [],
};
