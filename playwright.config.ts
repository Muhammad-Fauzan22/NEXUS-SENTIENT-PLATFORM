import { defineConfig, devices } from '@playwright/test';
# --- PROTOKOL VERIFIKASI FINAL & PEMICU ALUR KERJA ---

# FASE 1: VALIDASI LOKAL
# Menjalankan suite tes lengkap untuk memastikan integritas sistem secara lokal.
npm test && npx playwright test

# FASE 2: SINKRONISASI & PENGERAHAN
# Mendorong commit terakhir yang berisi semua perbaikan ke GitHub.
# Tindakan ini akan secara otomatis memicu alur kerja CI/CD di GitHub Actions,
# yang kemudian akan memicu deployment ke Vercel setelah berhasil.
git push origin main
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: './e2e',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: 'html',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: 'http://localhost:5173',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry'
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],

	/* Run your local dev server before starting the tests */
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI
	},

	// Note: Path aliases for $lib are handled by SvelteKit's build system
	// and will work correctly when tests run against the web server
});