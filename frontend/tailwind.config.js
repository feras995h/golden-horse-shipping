/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF9E5',
          100: '#FFF2CC',
          200: '#FFE699',
          300: '#FFD966',
          400: '#FFCC33',
          500: '#E6B800', // ذهبي متوسط
          600: '#D4AF37', // ذهبي كلاسيكي
          700: '#B8860B', // ذهبي داكن
          800: '#996515',
          900: '#7D5700',
          950: '#422006',
        },
        secondary: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838', // أسود فاتح
          900: '#1f1f1f', // أسود متوسط
          950: '#121212', // أسود داكن
        },
        gold: {
          50: '#FFF9E5',
          100: '#FFF2CC',
          200: '#FFE699',
          300: '#FFD966',
          400: '#FFCC33',
          500: '#E6B800', // ذهبي متوسط
          600: '#D4AF37', // ذهبي كلاسيكي - اللون الرئيسي للشعار
          700: '#B8860B', // ذهبي داكن
          800: '#996515',
          900: '#7D5700',
          950: '#422006',
        },
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        arabic: ['Noto Sans Arabic', 'Arial', 'sans-serif'],
        english: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
