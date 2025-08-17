import { test, expect } from '@playwright/test';

// Minimal happy-path E2E to check dashboard + metrics + endpoint health
// Assumes app is running on http://localhost:5173 (adjust if needed)

test('dashboard and metrics render', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/dashboard');
  // MarketInsights area should not crash even if no data
  await expect(page.locator('text=Market Insights')).toBeVisible();

  // Admin metrics page
  await page.goto('http://localhost:5173/admin/metrics');
  await expect(page.locator('text=Admin Metrics')).toBeVisible();
  await expect(page.locator('text=Knowledge Chunks')).toBeVisible();
});

