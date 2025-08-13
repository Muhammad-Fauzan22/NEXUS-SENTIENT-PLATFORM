// tailwind.config.js
import { defineConfig } from 'tailwindcss';

export default defineConfig({
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        'primary-hover': 'hsl(var(--primary-hover))',
        'primary-focus': 'hsl(var(--primary-focus))',
        secondary: 'hsl(var(--secondary))',
        'secondary-hover': 'hsl(var(--secondary-hover))',
        destructive: 'hsl(var(--destructive))',
        'destructive-hover': 'hsl(var(--destructive-hover))',
        calm: 'hsl(var(--calm))'
      }
    }
  },
  plugins: []
});