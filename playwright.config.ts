import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	// Direktori utama tempat Playwright akan mencari file tes.
	testDir: './e2e',

	/* Menjalankan semua file tes secara paralel untuk efisiensi maksimum. */
	fullyParallel: true,

	/* Gagal di CI jika ada `test.only` yang tertinggal di kode. */
	forbidOnly: !!process.env.CI,

	/* Coba ulangi tes yang gagal hanya di lingkungan CI untuk menangani flakiness. */
	retries: process.env.CI ? 2 : 0,

	/* Batasi jumlah worker di CI, tetapi gunakan semua yang tersedia secara lokal. */
	workers: process.env.CI ? 1 : undefined,

	/* Reporter untuk hasil tes. 'html' menghasilkan laporan web yang interaktif. */
	reporter: 'html',

	/* Pengaturan global untuk semua proyek tes. */
	use: {
		/* Base URL untuk semua aksi navigasi, seperti `await page.goto('/')`. */
		baseURL: 'http://localhost:5173',

		/* Kumpulkan 'trace' saat mencoba ulang tes yang gagal. Ini sangat berharga untuk debugging. */
		trace: 'on-first-retry'
	},

	/* Konfigurasi proyek untuk browser utama. */
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},

		// Uncomment untuk mengaktifkan pengujian di browser lain.
		// {
		//   name: 'firefox',
		//   use: { ...devices['Desktop Firefox'] },
		// },
		// {
		//   name: 'webkit',
		//   use: { ...devices['Desktop Safari'] },
		// },
	],

	/* Jalankan server pengembangan lokal secara otomatis sebelum memulai tes. */
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		// Tambahkan timeout yang wajar untuk server pengembangan memulai.
		timeout: 120 * 1000,
	},

	// Note: Path aliases for $lib are handled by SvelteKit's build system
	// and will work correctly when tests run against the web server
});