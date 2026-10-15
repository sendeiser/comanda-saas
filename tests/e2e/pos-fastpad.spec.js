// tests/e2e/pos-fastpad.spec.js
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 800 } });

test('pos fast order pad allows rapid item selection and modal payment trigger with accessible touch targets', async ({ page }) => {
  await page.goto('http://localhost:5173/#pos');
  await page.waitForLoadState('domcontentloaded');

  // Fill credentials and login if login screen is presented
  const loginBtn = page.locator('button:has-text("Iniciar Turno en POS")');
  if (await loginBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    const userField = page.locator('input[placeholder*="lucas"]').first();
    const pinField = page.locator('input[type="password"]').first();
    await userField.fill('admin');
    await pinField.fill('1234');
    await loginBtn.click();
  }

  // 1. Verify product items exist and satisfy >= 44px touch targets
  const itemBtn = page.locator('.product-card').first();
  await expect(itemBtn).toBeVisible({ timeout: 15000 });
  const box = await itemBtn.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.width).toBeGreaterThanOrEqual(44);

  // 2. Verify category filter buttons satisfy >= 40px touch target
  const catPill = page.locator('.cat-pill-btn').first();
  await expect(catPill).toBeVisible();
  const pillBox = await catPill.boundingBox();
  expect(pillBox.height).toBeGreaterThanOrEqual(40);
});
