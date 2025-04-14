/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}', // Adjust paths as needed for your project structure
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2E57A9',
      },
    },
  },
  plugins: [],
}
