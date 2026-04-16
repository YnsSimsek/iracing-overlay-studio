/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        yuka: {
          bg: '#0a0e27',
          bgSecondary: '#0f1229',
          accent: '#ff1744',
          cyan: '#00bcd4',
          text: '#ffffff',
          textSecondary: '#b0b0b0',
          textTertiary: '#707070',
          border: '#1a1f3a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        yuka: '0 4px 20px rgba(0, 0, 0, 0.5)'
      },
      backdropBlur: {
        yuka: '10px'
      },
      transitionDuration: {
        250: '250ms'
      }
    }
  },
  plugins: []
}
