/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',           
    './public/**/*.{js,html}'
  ],
  theme: {
      extend: {
        fontFamily: {
          block: ['BlockFont', 'sans-serif'],
        },
      },
    },
  plugins: [],
};