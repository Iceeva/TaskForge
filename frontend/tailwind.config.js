/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f1ff', 100: '#e3e5ff', 200: '#cbcdff', 300: '#a7a4ff',
          400: '#8b7bff', 500: '#7c5cff', 600: '#6d3ff5', 700: '#5c2fd8',
          800: '#4b28ae', 900: '#3f2589',
        },
        accent: {
          teal: '#2dd4bf', amber: '#fbbf24', rose: '#fb7185', sky: '#38bdf8',
        },
        surface: {
          50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 800: '#221f2e',
          900: '#171522', 950: '#0d0b14',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,92,255,0.15), 0 8px 24px -8px rgba(124,92,255,0.35)',
        card: '0 1px 2px rgba(0,0,0,0.3), 0 8px 24px -12px rgba(0,0,0,0.5)',
      },
      keyframes: {
        'slide-up': { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        'fade-in': 'fade-in 0.15s ease-out',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c5cff 0%, #5c2fd8 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
