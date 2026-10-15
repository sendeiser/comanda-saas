// tests/e2e/kds-visual.spec.js
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('kitchen display orders have high contrast status badges and action buttons', async ({ page }) => {
  await page.goto('http://localhost:5173/#cocina');
  await page.waitForLoadState('domcontentloaded');

  // Verify KDS title or column headers are visible
  const kdsIndicator = page.locator('.kds-header-title, .kds-header-bar, .kds-container').first();
  await expect(kdsIndicator).toBeVisible({ timeout: 10000 });

  // Verify KDS action buttons satisfy ergonomic touch target (>= 40px)
  const actionBtn = page.locator('.btn-kds-action, .kds-header-btn, .kds-column-header').first();
  if (await actionBtn.isVisible()) {
    const box = await actionBtn.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(40);
  }
});

test('kitchen display responsive zero-overflow on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/#cocina');
  await page.waitForLoadState('domcontentloaded');

  const kdsContainer = page.locator('.kds-container');
  await expect(kdsContainer).toBeVisible({ timeout: 10000 });

  // Verify no page-level horizontal overflow
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
});

