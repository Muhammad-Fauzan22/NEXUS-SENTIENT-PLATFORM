import { test, expect } from '@playwright/test';

test('Full assessment end-to-end flow', async ({ page }) => {
	// Langkah 0: Navigasi ke halaman utama aplikasi.
	await page.goto('/');

	// --- Langkah 1: Mengisi dan Mensubmit Data Pengguna ---
	await expect(page.getByRole('heading', { name: 'Welcome to Nexus' })).toBeVisible();
	await page.getByLabel('Full Name').fill('E2E Test User');
	await page.getByLabel('Email Address').fill('e2e.test@example.com');
	await page.getByLabel('Age').fill('30');
	await page.getByLabel('Current Occupation or Field of Study').fill('Test Engineer');
	await page.getByRole('button', { name: 'Continue to RIASEC Assessment' }).click();

	// --- Langkah 2: Menyelesaikan Asesmen RIASEC ---
	await expect(page.getByRole('heading', { name: 'RIASEC Assessment' })).toBeVisible();
	// Untuk efisiensi tes, kita memilih 'Yes' untuk semua pertanyaan.
	const riasecQuestions = await page.locator('fieldset').all();
	for (const question of riasecQuestions) {
		await question.getByText('Yes').click();
	}
	await page.getByRole('button', { name: 'Continue to PWB Assessment' }).click();

	// --- Langkah 3: Menyelesaikan Asesmen PWB & Submit ---
	await expect(page.getByRole('heading', { name: 'Psychological Well-Being Scale' })).toBeVisible();
	const pwbQuestions = await page.locator('fieldset').all();
	for (const question of pwbQuestions) {
		// Memilih skor '5' untuk semua pertanyaan.
		await question.locator('input[value="5"]').click();
	}
	await page.getByRole('button', { name: 'Submit & Generate My Plan' }).click();

	// --- Langkah 4: Memverifikasi Status Loading dan Hasil Akhir ---
	// Menegaskan bahwa UI menampilkan status loading setelah submit.
	// Playwright akan secara otomatis menunggu elemen ini muncul.
	await expect(page.getByRole('heading', { name: 'Generating Your Plan...' })).toBeVisible();

	// Menegaskan bahwa halaman hasil akhir ditampilkan.
	// Timeout diperpanjang menjadi 60 detik untuk mengakomodasi latensi API AI.
	await expect(page.getByRole('heading', { name: 'Individual Development Plan for E2E Test User' })).toBeVisible({ timeout: 60000 });

	// Verifikasi akhir untuk memastikan konten rencana aksi telah dirender.
	await expect(page.getByRole('heading', { name: 'Your Action Plan' })).toBeVisible();
});