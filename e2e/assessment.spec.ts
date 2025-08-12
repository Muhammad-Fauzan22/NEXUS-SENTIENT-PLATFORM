import { test, expect } from '@playwright/test';

test('Full assessment end-to-end flow', async ({ page }) => {
	// Step 0: Navigate to the home page
	await page.goto('/');

	// --- Step 1: Fill out User Data ---
	await expect(page.getByRole('heading', { name: 'Welcome to Nexus' })).toBeVisible();
	await page.getByLabel('Full Name').fill('Fauzan Test User');
	await page.getByLabel('Email Address').fill('fauzan.test@example.com');
	await page.getByLabel('Age').fill('25');
	await page.getByLabel('Current Occupation or Field of Study').fill('AI Researcher');
	await page.getByRole('button', { name: 'Continue to RIASEC Assessment' }).click();

	// --- Step 2: Complete RIASEC Assessment ---
	await expect(page.getByRole('heading', { name: 'RIASEC Assessment' })).toBeVisible();
	// For simplicity, we'll just click the first option ('Yes') for all questions.
	const riasecQuestions = await page.locator('fieldset').all();
	for (const question of riasecQuestions) {
		await question.getByText('Yes').click();
	}
	await page.getByRole('button', { name: 'Continue to PWB Assessment' }).click();

	// --- Step 3: Complete PWB Assessment & Submit ---
	await expect(page.getByRole('heading', { name: 'Psychological Well-Being Scale' })).toBeVisible();
	const pwbQuestions = await page.locator('fieldset').all();
	for (const question of pwbQuestions) {
		// Click the radio button with the value "5"
		await question.locator('input[value="5"]').click();
	}
	await page.getByRole('button', { name: 'Submit & Generate My Plan' }).click();

	// --- Step 4: Verify Loading and Final Result ---
	// Assert that the loading screen appears. Playwright will wait automatically.
	await expect(page.getByRole('heading', { name: 'Generating Your Plan...' })).toBeVisible();

	// Assert that the final result page is displayed. We set a generous timeout
	// because the AI generation can be slow.
	await expect(page.getByRole('heading', { name: 'Individual Development Plan for Fauzan Test User' })).toBeVisible({ timeout: 60000 }); // 60 second timeout

	// A final check to ensure the content is rendered
	await expect(page.getByRole('heading', { name: 'Your Action Plan' })).toBeVisible();
});