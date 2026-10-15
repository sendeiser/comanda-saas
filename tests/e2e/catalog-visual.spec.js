// tests/e2e/catalog-visual.spec.js
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } }); // iPhone 12/13/14

test('catalog mobile view has no horizontal overflow and accessible cart drawer', async ({ page }) => {
  await page.goto('http://localhost:5173/#catalog');
  await page.waitForLoadState('domcontentloaded');

  // 1. Verify zero horizontal overflow on mobile
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

  // 2. Locate product add button or product card
  const addBtn = page.locator('.cat-add-btn, .cat-product-card, .cat-promo-chip-btn').first();
  await expect(addBtn).toBeVisible({ timeout: 10000 });
  await addBtn.click();

  // 3. Confirm modal opened and add to cart
  const modalAddBtn = page.locator('.cat-modal-add-btn, .cat-add-to-cart-btn');
  await expect(modalAddBtn).toBeVisible({ timeout: 5000 });
  await modalAddBtn.click();

  // 4. Verify floating cart bar appears with touch-friendly height (>= 44px)
  const floatingBar = page.locator('.cat-floating-cart-bar, .cat-floating-cart-btn').first();
  await expect(floatingBar).toBeVisible({ timeout: 5000 });
  const box = await floatingBar.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
});
