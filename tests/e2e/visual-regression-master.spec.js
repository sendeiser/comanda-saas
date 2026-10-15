// tests/e2e/visual-regression-master.spec.js
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const surfaces = [
  { name: 'landing-desktop', url: 'http://localhost:5173/', viewport: { width: 1440, height: 900 } },
  { name: 'landing-mobile', url: 'http://localhost:5173/', viewport: { width: 390, height: 844 } },
  { name: 'catalog-desktop', url: 'http://localhost:5173/#catalog', viewport: { width: 1440, height: 900 } },
  { name: 'catalog-mobile', url: 'http://localhost:5173/#catalog', viewport: { width: 390, height: 844 } },
  { name: 'kds-desktop', url: 'http://localhost:5173/#cocina', viewport: { width: 1440, height: 900 } },
  { name: 'pos-desktop', url: 'http://localhost:5173/#pos', viewport: { width: 1440, height: 900 } }
];

test.beforeAll(() => {
  const screenshotDir = path.resolve(process.cwd(), 'tests/screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
});

for (const surface of surfaces) {
  test(`visual check for ${surface.name}`, async ({ page }) => {
    await page.setViewportSize(surface.viewport);
    await page.goto(surface.url);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(600); // Allow render stability and animations to settle

    // If pos surface and login is required, fill login
    if (surface.name === 'pos-desktop') {
      const pinInput = page.locator('input[type="password"]');
      if (await pinInput.isVisible()) {
        const userInput = page.locator('input[type="text"]').first();
        if (await userInput.isVisible()) {
          await userInput.fill('admin');
        }
        await pinInput.fill('1234');
        const submitBtn = page.locator('button:has-text("Iniciar Turno en POS"), button[type="submit"]').first();
        await submitBtn.click();
        await page.waitForTimeout(600);
      }
    }

    // Verify zero horizontal page-level overflow (with 2px subpixel buffer)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    // Capture visual artifact screenshot
    await page.screenshot({ path: `tests/screenshots/${surface.name}.png`, fullPage: false });
  });
}
