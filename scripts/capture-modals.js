import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(process.cwd(), 'tests/screenshots');

async function captureModals() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`[Playwright Modals] Conectando a ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // 1. Go to POS
  await page.goto(`${BASE_URL}/#pos`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('comandafast_theme', 'dark');
    localStorage.setItem('comandafast_theme_atelier_v1', 'true');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.className = 'dark-theme';
  });
  await page.waitForTimeout(1000);

  // Login if pinpad is visible
  const pinInput = page.locator('input[type="password"]');
  if (await pinInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('[Playwright Modals] Ingresando credenciales de cajero...');
    const userInput = page.locator('input[type="text"]').first();
    if (await userInput.isVisible()) {
      await userInput.fill('admin');
    }
    await pinInput.fill('1234');
    const submitBtn = page.locator('button:has-text("Iniciar Turno en POS"), button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(1200);
  }

  // 2. Open Cash Control Modal
  console.log('[Playwright Modals] Abriendo Control de Caja...');
  const cashTrigger = page.locator('.shift-status-pill').first();
  if (await cashTrigger.isVisible({ timeout: 2500 }).catch(() => false)) {
    await cashTrigger.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'modal-cash-control.png') });
    console.log('✓ Guardado: modal-cash-control.png');
    // Close modal via Escape or close button
    const closeBtn = page.locator('.btn-close-modal, button:has-text("Cerrar Ventana")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);
  } else {
    console.log('⚠️ No se encontró trigger de caja (.shift-status-pill)');
  }

  // 3. Open Table Map Modal
  console.log('[Playwright Modals] Abriendo Plano de Mesas...');
  const mesaChannelBtn = page.locator('button.channel-btn:has-text("Mesa")').first();
  if (await mesaChannelBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
    await mesaChannelBtn.click();
    await page.waitForTimeout(400);
    const salonBtn = page.locator('button:has-text("Salón")').first();
    if (await salonBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await salonBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'modal-table-map.png') });
      console.log('✓ Guardado: modal-table-map.png');
      const closeBtn = page.locator('.btn-close-modal, button:has-text("Cerrar")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(500);
    }
  }

  // 4. Open Customer CRM Modal
  console.log('[Playwright Modals] Abriendo CRM Clientes & Fiados...');
  const crmTrigger = page.locator('button:has-text("Clientes & Fiados"), button:has-text("Clientes")').first();
  if (await crmTrigger.isVisible({ timeout: 2500 }).catch(() => false)) {
    await crmTrigger.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'modal-customer-crm.png') });
    console.log('✓ Guardado: modal-customer-crm.png');
    const closeBtn = page.locator('.btn-close-modal, button:has-text("Cerrar")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);
  }

  // 5. Open Settings Modal
  console.log('[Playwright Modals] Abriendo Configuración...');
  const settingsTrigger = page.locator('button[title="Configuración general e impresión"]').first();
  if (await settingsTrigger.isVisible({ timeout: 2500 }).catch(() => false)) {
    await settingsTrigger.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'modal-settings.png') });
    console.log('✓ Guardado: modal-settings.png');
    const closeBtn = page.locator('.btn-close-modal, button:has-text("✕")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);
  }

  // 6. Navigate to WhatsApp Live Monitor Tab
  console.log('[Playwright Modals] Abriendo Monitor WhatsApp Live...');
  const waTab = page.locator('button:has-text("WhatsApp")').first();
  if (await waTab.isVisible({ timeout: 2500 }).catch(() => false)) {
    await waTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'view-whatsapp-live.png') });
    console.log('✓ Guardado: view-whatsapp-live.png');
  }

  await browser.close();
  console.log('[Playwright Modals] Capturas de modales y vistas finalizadas con éxito.');
}

captureModals().catch(err => {
  console.error('[Playwright Modals] Error:', err);
  process.exit(1);
});
