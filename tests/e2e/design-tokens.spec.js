// tests/e2e/design-tokens.spec.js
import { test, expect } from '@playwright/test';

test('design tokens and typography classes are correctly loaded', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Verify primary brand color token is Warm Amber #f59e0b
  const primaryColor = await page.evaluate(() => 
    getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim()
  );
  expect(primaryColor.toLowerCase()).toBe('#f59e0b');

  // Verify background canvas token is Off-black (not pure black #000000)
  const bgCanvas = await page.evaluate(() => 
    getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()
  );
  expect(bgCanvas).not.toBe('#000000');
  expect(bgCanvas).toMatch(/#0[0-9a-f]{5}/i);

  // Verify spring timing token exists
  const springBounce = await page.evaluate(() => 
    getComputedStyle(document.documentElement).getPropertyValue('--spring-bounce').trim()
  );
  expect(springBounce).toBeTruthy();

  // Verify tabular-nums helper
  const hasTabularNums = await page.evaluate(() => {
    const el = document.createElement('span');
    el.className = 'tabular-nums';
    document.body.appendChild(el);
    const style = getComputedStyle(el).fontVariantNumeric;
    el.remove();
    return style.includes('tabular-nums');
  });
  expect(hasTabularNums).toBe(true);
});
