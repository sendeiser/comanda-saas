// tests/botConfig.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderBotGreeting, loadBotConfig, compileBotVariables } from '../server/botStoreConfig.js';

test('renderBotGreeting formats welcome message with dynamic store name and catalog link', () => {
  const greeting = renderBotGreeting({
    name: 'Pizzería Napoles',
    slug: 'pizzeria-napoles',
    baseUrl: 'https://comanda.app'
  });
  assert.ok(greeting.includes('Pizzería Napoles'));
  assert.ok(greeting.includes('https://comanda.app/carta/pizzeria-napoles'));
  assert.ok(!greeting.includes('Burga'));
});

test('compileBotVariables populates store variables dynamically', () => {
  const vars = compileBotVariables({
    name: 'Rotisería San Cayetano',
    slug: 'rotiseria-san-cayetano',
    address: 'Av. San Martín 450',
    schedule: 'Lunes a Sábados 11:30 a 14:30 hs'
  });

  assert.equal(vars.nombre_local, 'Rotisería San Cayetano');
  assert.equal(vars.direccion, 'Av. San Martín 450');
  assert.equal(vars.horarios, 'Lunes a Sábados 11:30 a 14:30 hs');
  assert.ok(vars.link_carta.includes('rotiseria-san-cayetano'));
});

test('loadBotConfig falls back to default store when no store is specified', () => {
  const config = loadBotConfig();
  assert.ok(config);
  assert.ok(config.store);
  assert.ok(config.store.name);
  assert.ok(typeof config.store.slug === 'string');
});

test('DEFAULT_TEMPLATES template_menu includes predesigned catalog placeholder', async () => {
  const { DEFAULT_TEMPLATES } = await import('../src/services/whatsappBotConstants.js');
  assert.ok(DEFAULT_TEMPLATES.template_menu.includes('{catalogo_lista}'));
  assert.ok(DEFAULT_TEMPLATES.template_menu.includes('{cliente}'));
  assert.ok(DEFAULT_TEMPLATES.template_menu.includes('{nombre_local}'));
});

test('geminiBotService initializes with Groq enabled and valid keys', async () => {
  const { geminiBotService } = await import('../server/geminiBotService.js');
  const safeConfig = geminiBotService.getConfigSafe();
  assert.equal(safeConfig.enabled, true);
  assert.ok(safeConfig.hasGroq, 'Debe tener Groq disponible');
  assert.ok(safeConfig.groqApiKeyMasked.startsWith('gsk_'), 'La clave Groq enmascarada debe comenzar con gsk_');
  assert.ok(safeConfig.groqModel);
});

test('geminiBotService extractOrderItems recognizes natural language multi-item orders', async () => {
  const { geminiBotService } = await import('../server/geminiBotService.js');
  const prods = [
    { id: 'prod-1', name: 'Burger Clásica', price: 6500 },
    { id: 'prod-7', name: 'Papas Cheddar & Bacon', price: 4900 },
    { id: 'prod-11', name: 'Cerveza IPA 473ml', price: 3200 }
  ];
  const items = await geminiBotService.extractOrderItems(
    'quiero 2 burguer clasica una papas cheddar y una cerveza ipa',
    prods
  );
  assert.ok(Array.isArray(items));
  assert.ok(items.length >= 2, 'Debe haber extraído al menos 2 o los 3 productos');
  const burger = items.find(i => i.id === 'prod-1' || (i.name && i.name.toLowerCase().includes('clasica')));
  assert.ok(burger, 'Debe reconocer la Burger Clásica');
  assert.equal(burger.qty, 2, 'La cantidad de Burger Clásica debe ser 2');
});


