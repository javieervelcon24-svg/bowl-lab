/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: { 50: '#f1f5ee', 100: '#e2ebdc', 200: '#c7d8bd', 300: '#a8c19a', 400: '#8aa97c', 500: '#6f8f61', 600: '#587449' },
        forest: { 700: '#2f4a33', 800: '#243a28', 900: '#1b2d1f' },
        cream: '#fbf8f1',
        sand: '#efe6d4',
        peach: { 400: '#f4a574', 500: '#ee8f55' },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(0)', opacity: '0' }, '70%': { transform: 'scale(1.12)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        rise: { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: { pop: 'pop .45s cubic-bezier(.2,.9,.3,1.2) both', rise: 'rise .4s ease both' },
    },
  },
  plugins: [],
}
