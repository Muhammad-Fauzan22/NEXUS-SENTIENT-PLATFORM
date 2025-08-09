// postcss.config.js
// File konfigurasi PostCSS untuk NEXUS-SENTIENT-PLATFORM.
// Digunakan oleh Vite dan Tailwind CSS.

export default {
    plugins: {
        // Plugin Tailwind CSS v4 untuk memproses kelas utilitas Tailwind menjadi CSS asli.
        tailwindcss: {},
        
        // Plugin Autoprefixer untuk menambahkan prefix vendor secara otomatis (-webkit-, -moz-, dll.).
        // Ini memastikan kompatibilitas browser yang lebih luas.
        autoprefixer: {}
    }
};
