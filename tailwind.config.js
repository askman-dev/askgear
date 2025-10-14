import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      minHeight: {
        'touch': '44px',
      },
      typography: ({ theme }) => ({
        sm: {
          css: {
            h1: {
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1f2937',
            },
            h2: {
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              marginTop: '1.25rem',
              marginBottom: '0.75rem',
            },
            h3: {
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1f2937',
            },
            strong: {
              color: '#1f2937',
            },
            p: {
              color: '#374151',
            },
            li: {
              color: '#374151',
            },
            code: {
              color: '#1f2937',
              backgroundColor: '#e5e7eb',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            pre: {
              color: '#e5e7eb',
              backgroundColor: '#1f2937',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: '0',
              borderRadius: '0',
              fontWeight: 'inherit',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
}