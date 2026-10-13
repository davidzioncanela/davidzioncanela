import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        game: ['Nunito', 'system-ui', 'sans-serif'],
        title: ['Fredoka', 'Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
