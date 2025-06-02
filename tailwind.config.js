module.exports = {
  content: [
    "./index.html",
    "./script.js",
    "./data/*.json"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#197fe5',
          light: '#3b8dff',
          dark: '#156abc'
        },
        secondary: '#10b981',
        background: '#0a1016',
        card: '#111a22',
        accent: '#6366f1'
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
        '160': '40rem'
      }
    },
  },
  safelist: [
  'text-[#197fe5]',
  'bg-[#111a22]',
  'hover:bg-[#16202a]',
  'progress-bar-fill'
  ],
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
  corePlugins: {
    preflight: false,
  }
}
