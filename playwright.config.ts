// playwright.config.ts
// File konfigurasi Playwright untuk NEXUS-SENTIENT-PLATFORM.
// Mengatur browser, direktori output, timeout, dan konfigurasi lainnya untuk pengujian E2E.

import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

/**
 * Baca environment variables dari file .env.
 * Ini memungkinkan konfigurasi berbasis lingkungan (development, staging, production).
 */
dotenv.config({ path: '.env' }); // <<<<<<<<< BACA .env

/**
 * Konfigurasi utama untuk Playwright Test.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	// --- Konfigurasi Dasar ---
	/**
	 * Direktori yang berisi file-file tes E2E.
	 * Playwright akan mencari file tes di sini secara rekursif.
	 */
	testDir: './tests/e2e', // <<<<<<<<< SESUAIKAN DENGAN STRUKTUR FOLDER

	/**
	 * Folder untuk output artefak pengujian.
	 * Termasuk laporan HTML, lampiran (screenshots, videos), dan trace.
	 */
	outputDir: './tests/e2e/artifacts', // <<<<<<<<< SESUAIKAN DENGAN STRUKTUR FOLDER

	/**
	 * Jalur ke file konfigurasi TypeScript untuk tes.
	 * Memungkinkan type checking dan autocomplete untuk API Playwright di file tes.
	 */
	tsconfig: './tests/e2e/tsconfig.json', // <<<<<<<<< SESUAIKAN JIKA ADA TS UNTUK TESTS

	/**
	 * Timeout maksimum untuk seluruh test suite (dalam milidetik).
	 * Jika semua tes tidak selesai dalam waktu ini, proses akan dihentikan.
	 */
	globalTimeout: 60 * 60 * 1000, // 60 menit

	/**
	 * Timeout maksimum untuk setiap test case individu (dalam milidetik).
	 * Jika satu test tidak selesai dalam waktu ini, test akan dianggap gagal.
	 */
	timeout: 30 * 1000, // 30 detik per test

	/**
	 * Timeout maksimum untuk setiap expect/assertion (dalam milidetik).
	 * Jika assertion tidak terpenuhi dalam waktu ini, test akan dianggap gagal.
	 */
	expect: {
		timeout: 5000 // 5 detik per expect
	},

	/**
	 * Jumlah worker (proses paralel) yang digunakan untuk menjalankan tes.
	 * Mengatur ke 1 untuk debugging, atau lebih tinggi untuk kecepatan di CI.
	 */
	workers: process.env.CI ? 1 : undefined, // 1 worker di CI, default (jumlah CPU) di lokal

	/**
	 * Jumlah retry maksimum untuk tes yang gagal.
	 * Berguna untuk mengatasi flaky test di CI.
	 */
	retries: process.env.CI ? 2 : 0, // 2 retry di CI, 0 di lokal

	// --- Konfigurasi Reporter ---
	/**
	 * Daftar reporter yang digunakan untuk menampilkan dan menyimpan hasil tes.
	 * Bisa berupa string (untuk reporter built-in) atau objek (untuk konfigurasi khusus).
	 */
	reporter: [
		['list'], // Tampilkan hasil tes di console dalam format list
		['html', { outputFolder: 'playwright-report', open: 'on-failure' }], // Hasil HTML di folder playwright-report, buka jika ada failure
		['json', { outputFile: 'playwright-report/results.json' }] // Hasil JSON untuk integrasi CI/CD
	],

	// --- Konfigurasi Proyek untuk Berbagai Browser & Perangkat ---
	/**
	 * Daftar konfigurasi proyek untuk browser dan perangkat yang berbeda.
	 * Memungkinkan pengujian cross-browser.
	 */
	projects: [
		{
			name: 'chromium', // <<<<<<<<< BROWSER UTAMA UNTUK DEVELOPMENT
			use: {
				...devices['Desktop Chrome'] // Gunakan preset device untuk Chrome desktop
			}
		},

		// --- Proyek untuk Browser Lain (Opsional untuk CI/Staging) ---
		/*
		{
			name: 'firefox',
			use: {
				...devices['Desktop Firefox']
			}
		},

		{
			name: 'webkit',
			use: {
				...devices['Desktop Safari']
			}
		},
		*/

		// --- Proyek untuk Mode Seluler (Opsional untuk CI/Staging) ---
		/*
		{
			name: 'Mobile Chrome',
			use: {
				...devices['Pixel 5']
			}
		},
		{
			name: 'Mobile Safari',
			use: {
				...devices['iPhone 12']
			}
		},
		*/
	],

	// --- Konfigurasi Server Web (WebServer) ---
	/**
	 * Konfigurasi untuk menjalankan server web lokal selama pengujian.
	 * Ini memastikan aplikasi berjalan sebelum tes dimulai.
	 * Berguna untuk pengujian terhadap aplikasi yang dikembangkan secara lokal.
	 */
	webServer: {
		/**
		 * Perintah untuk memulai server web.
		 * Harus sesuai dengan skrip di package.json (misalnya, "dev", "start", "preview").
		 * Untuk SvelteKit, "npm run dev" adalah pilihan yang umum untuk development/testing.
		 */
		command: 'npm run dev', // <<<<<<<<< MENJALANKAN SERVER DEVELOPMENT

		/**
		 * URL yang digunakan untuk memeriksa apakah server sudah siap.
		 * Playwright akan menunggu hingga URL ini merespons dengan status 2xx/3xx sebelum menjalankan tes.
		 */
		url: 'http://localhost:5173', // <<<<<<<<< SESUAIKAN DENGAN PORT DEV SERVER

		/**
		 * Timeout maksimum untuk menunggu server web siap (dalam milidetik).
		 * Jika server tidak siap dalam waktu ini, pengujian akan dibatalkan.
		 */
		timeout: 120 * 1000, // 120 detik

		/**
		 * Apakah server web harus dihentikan setelah pengujian selesai.
		 * Jika true, Playwright akan menjalankan `command` dan menghentikannya setelah tes.
		 * Jika false, Playwright mengasumsikan server sudah berjalan.
		 */
		reuseExistingServer: !process.env.CI, // Di CI, selalu mulai server baru. Di lokal, gunakan server yang sudah ada jika memungkinkan.
	},

	// --- Konfigurasi Koneksi & Trace ---
	/**
	 * Konfigurasi untuk koneksi ke browser.
	 * `launchOptions` untuk mengatur opsi saat meluncurkan browser.
	 */
	use: {
		/**
		 * Base URL untuk semua permintaan API dan navigasi dalam tes.
		 * Menghindari pengulangan URL dasar di setiap test file.
		 */
		baseURL: 'http://localhost:5173', // <<<<<<<<< SESUAIKAN DENGAN BASE URL APLIKASI

		/**
		 * Opsi pel peluncuran browser.
		 * Misalnya, menjalankan browser di mode headless atau bukan.
		 */
		launchOptions: {
			// headless: false, // Untuk debugging, tampilkan browser GUI
		},

		/**
		 * Opsi konteks browser.
		 * Misalnya, ukuran viewport, permissions, geolocation.
		 */
		contextOptions: {
			// viewport: { width: 1280, height: 720 },
		},

		/**
		 * Apakah mengambil screenshot saat tes gagal.
		 * Berguna untuk debugging visual.
		 */
		screenshot: 'only-on-failure',

		/**
		 * Apakah merekam video dari sesi tes.
		 * Berguna untuk debugging alur tes yang kompleks.
		 */
		video: 'retain-on-failure', // Simpan video hanya jika tes gagal

		/**
		 * Apakah merekam trace saat tes berjalan.
		 * Trace mencakup detail langkah-langkah, network, console, dll.
		 * Sangat berguna untuk debugging mendalam.
		 */
		trace: 'retain-on-failure', // Simpan trace hanya jika tes gagal

		/**
		 * (Opsional) Konfigurasi proxy jika diperlukan.
		 */
		// proxy: {
		//   server: 'http://myproxy.com:3128',
		//   bypass: '<-loopback>',
		// },

		/**
		 * (Opsional) Konfigurasi geolocation palsu untuk tes.
		 */
		// geolocation: { longitude: 112.7979, latitude: -7.2755 }, // Koordinat Surabaya

		/**
		 * (Opsional) Konfigurasi timezone untuk tes.
		 */
		// timezoneId: 'Asia/Jakarta',
	}
});