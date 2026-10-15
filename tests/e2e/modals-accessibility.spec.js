// tests/e2e/modals-accessibility.spec.js
import { test, expect } from '@playwright/test';

test.describe('Modal accessibility and hardening', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/#pos');
    await page.waitForLoadState('domcontentloaded');

    // Auto-login cashier if cashier login screen is presented
    const pinInput = page.locator('input[type="password"]');
    if (await pinInput.isVisible()) {
      const userInput = page.locator('input[type="text"]').first();
      if (await userInput.isVisible()) {
        await userInput.fill('admin');
      }
      await pinInput.fill('1234');
      const submitBtn = page.locator('button:has-text("Iniciar Turno en POS"), button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('CashControlModal opens and closes on ESC key', async ({ page }) => {
    // Locate Cash / Arqueo element in Header (.shift-status-pill)
    const cashTrigger = page.locator('.shift-status-pill, button:has-text("Caja"), button:has-text("Arqueo")').first();
    await expect(cashTrigger).toBeVisible({ timeout: 10000 });
    await cashTrigger.click();

    // Verify modal appears
    const modalOverlay = page.locator('.modal-overlay').first();
    await expect(modalOverlay).toBeVisible();

    const modalCard = page.locator('.modal-card').first();
    await expect(modalCard).toBeVisible();

    // Verify modal-overlay has backdrop-filter styling in document stylesheets
    const hasBlurInCSS = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes('.modal-overlay')) {
              if (rule.style?.backdropFilter?.includes('blur') || rule.style?.cssText?.includes('blur')) {
                return true;
              }
            }
          }
        } catch (_) {}
      }
      return false;
    });
    expect(hasBlurInCSS).toBe(true);

    // Test ESC key closes the modal
    await page.keyboard.press('Escape');
    await expect(modalCard).not.toBeVisible({ timeout: 5000 });
  });

  test('CustomerCrmModal opens and closes on ESC key', async ({ page }) => {
    const crmBtn = page.locator('button:has-text("Clientes"), button:has-text("Fiados")').first();
    if (await crmBtn.isVisible()) {
      await crmBtn.click();
      const modalOverlay = page.locator('.modal-overlay').first();
      await expect(modalOverlay).toBeVisible({ timeout: 5000 });

      // Test ESC key closes the modal
      await page.keyboard.press('Escape');
      await expect(modalOverlay).not.toBeVisible({ timeout: 5000 });
    }
  });
});
