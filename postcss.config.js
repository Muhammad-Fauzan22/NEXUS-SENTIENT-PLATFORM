export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}```

**PATH:** `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: { extend: {} },
  plugins: [],
}