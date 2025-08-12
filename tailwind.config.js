/** @type {import('tailwindcss').Config} */
export default {
  // Memberitahu Tailwind untuk memindai semua file sumber yang relevan
  // untuk mendeteksi kelas utilitas yang digunakan, memastikan file CSS
  // produksi hanya berisi gaya yang diperlukan.
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    // Di sini Anda dapat memperluas palet warna, font, dll.
    // default dari Tailwind.
    extend: {},
  },

  // Di sini Anda dapat menambahkan plugin Tailwind resmi atau pihak ketiga,
  // seperti @tailwindcss/typography atau @tailwindcss/forms.
  plugins: [],
};