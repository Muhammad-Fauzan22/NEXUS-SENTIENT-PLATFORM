// e2e/demo.test.ts
import { test, expect } from '@playwright/test';

test.describe('Demo Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Verify Home Page Title', async ({ page }) => {
    // Assert the page title
    const title = await page.title();
    expect(title).toBe('NEXUS-SENTIENT-PLATFORM');
  });

  test('Navigate to IDP Viewer', async ({ page }) => {
    // Click on the "View IDP" button or link
    await page.click('text=View IDP');

    // Wait for navigation to complete
    await page.waitForURL('/idp/[id]');

    // Verify the presence of IDP content
    const idpContent = await page.textContent('.idp-content-container');
    expect(idpContent).toContain('Individual Development Plan (IDP)');
  });

  test('Download IDP PDF', async ({ page }) => {
    // Navigate to IDP Viewer
    await page.goto('/idp/[id]');

    // Click on the "Download as PDF" button
    await page.click('text=Unduh sebagai PDF');

    // Verify download completion (optional)
    // Note: Playwright does not directly support file downloads.
    // You may need to use a workaround or external tool to verify downloads.
  });

  test('Submit Assessment Form', async ({ page }) => {
    // Navigate to Assessment Form
    await page.goto('/assessment');

    // Fill out the form fields
    await page.fill('#nim-input', '1234567890'); // Replace with actual input selector
    await page.fill('#name-input', 'John Doe'); // Replace with actual input selector

    // Submit the form
    await page.click('text=Kirim Asesmen');

    // Verify success message or redirection
    const successMessage = await page.textContent('.success-message');
    expect(successMessage).toContain('Asesmen berhasil dikirim!');
  });
});