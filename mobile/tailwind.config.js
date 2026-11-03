/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F3A',
          950: '#061426',
          900: '#08182D',
          800: '#0B1F3A',
          700: '#122B4D',
          600: '#1B3A63',
          500: '#284C7A',
        },
        ink: '#101D2F',
        muted: '#7D889A',
        subtle: '#9AA5B4',
        canvas: '#F6F9FD',
        surface: '#FFFFFF',
        line: '#E8EEF6',
        yellow: {
          DEFAULT: '#F5B82E',
          500: '#F5B82E',
          400: '#F7C64D',
          300: '#FBD46D',
          100: '#FEF5DB',
          50: '#FFFBF0',
        },
        action: {
          red: '#FDEBEE',
          blue: '#EAF2FE',
          green: '#E7F7EF',
          navy: '#EDF2FA',
        },
        brand: {
          blue: '#2F80ED',
          red: '#EF4453',
          green: '#12A76A',
          purple: '#7C5CFC',
          orange: '#F79009',
        },
        'alert-pink': '#FCEAEF',
        'alert-pink-deep': '#F8DCE4',
      },
      fontFamily: {
        sans: ['Poppins_400Regular'],
        pmedium: ['Poppins_500Medium'],
        psemibold: ['Poppins_600SemiBold'],
        pbold: ['Poppins_700Bold'],
        pextrabold: ['Poppins_800ExtraBold'],
      },
    },
  },
  plugins: [],
};
