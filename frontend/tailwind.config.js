/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff7ed',
          100: '#ffedd5',
          600: '#f97316',
          800: '#c2410c',
        },
        green: {
          100: '#dcfce7',
          600: '#16a34a',
          800: '#166534',
        },
        blue: {
          100: '#dbeafe',
          600: '#2563eb',
          800: '#1e40af',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};