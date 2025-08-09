// tailwind.config.js
// File konfigurasi Tailwind CSS untuk NEXUS-SENTIENT-PLATFORM.
// Mendefinisikan token desain kustom dan plugin yang digunakan.

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'], // <<<<<<<<< SESUAIKAN DENGAN STRUKTUR PROYEK
	theme: {
		extend: {
			// --- Definisi Token Desain Kustom ---
			colors: {
				// Palet warna utama NEXUS (biru ITS)
				'nexus-blue': {
					50: '#ebf8ff',
					100: '#d7f0ff',
					200: '#b3e0ff',
					300: '#80cfff',
					400: '#4dbdff',
					500: '#1aa9ff', // <<<<<<<<< WARNA UTAMA (Primary Blue)
					600: '#0088e0',
					700: '#0066b3',
					800: '#004480',
					900: '#00224d'
				},
				// Warna pendukung
				'nexus-green': {
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#22c55e',
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#14532d'
				},
				'nexus-amber': {
					50: '#fffbeb',
					100: '#fef3c7',
					200: '#fde68a',
					300: '#fcd34d',
					400: '#fbbf24',
					500: '#f59e0b',
					600: '#d97706',
					700: '#b45309',
					800: '#92400e',
					900: '#78350f'
				},
				'nexus-red': {
					 50: '#fef2f2',
					100: '#fee2e2',
					200: '#fecaca',
					300: '#fca5a5',
					400: '#f87171',
					500: '#ef4444',
					600: '#dc2626',
					700: '#b91c1c',
					800: '#991b1b',
					900: '#7f1d1d'
				},
				// Abu-abu netral untuk teks, latar belakang, border
				'nexus-gray': {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a'
				}
			},
			fontFamily: {
				// Font utama untuk antarmuka
				sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
				// Font sekunder untuk judul naratif atau elemen kreatif (jika diperlukan)
				serif: ['Playfair Display', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif']
			},
			spacing: {
				// Skala spasi kustom (jika diperlukan selain default Tailwind)
				// '7': '1.75rem', // Contoh penambahan spasi kustom
				// '14': '3.5rem',
			},
			borderRadius: {
				// Radius sudut kustom
				// 'xl': '1rem', // Contoh penambahan radius kustom
			},
			// Tambahkan extend theme lainnya jika diperlukan (fontSize, boxShadow, transitionDuration, dll.)
		}
	},
	plugins: [
		// Tambahkan plugin Tailwind jika diperlukan
		// Contoh: require('@tailwindcss/forms'), require('@tailwindcss/typography')
	],
	corePlugins: {
		// Jika perlu menonaktifkan core plugin tertentu
		// Contoh: preflight: false // Menonaktifkan reset CSS bawaan Tailwind
	}
};