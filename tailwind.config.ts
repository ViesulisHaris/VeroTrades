import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        metallic: {
          silver: '#C0C0C0',
          dark: '#A8A8A8',
          light: '#E5E5E5',
          bg: '#1a1a1a',  // Dark metallic bg
        },
        primary: '#C0C0C0',  // Silver primary
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
