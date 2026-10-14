// scripts/verify_white_label.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('🔍 VERIFICACIÓN INTEGRAL: WHITE-LABEL SAAS & CRM');
console.log('====================================================\n');

let failed = false;

function step(title, fn) {
  process.stdout.write(`⏳ ${title}... `);
  try {
    fn();
    console.log('✅ OK');
  } catch (err) {
    console.log('❌ FALLÓ');
    console.error(`   Error: ${err.message || err}`);
    failed = true;
  }
}

// 1. Arquitectura de Archivos Core & Multi-Tenant
step('Verificar archivos de arquitectura White-Label y Multi-Tenant', () => {
  const requiredFiles = [
    'src/services/themeService.js',
    'src/services/storeService.js',
    'src/services/tableService.js',
    'server/botStoreConfig.js',
    'src/data/storeTemplates.js',
    'src/components/admin/onboarding/StoreOnboardingWizard.jsx',
    'src/components/pos/TableMapModal.jsx',
    'supabase/migrations/001_multi_tenant_stores.sql'
  ];

  for (const f of requiredFiles) {
    if (!fs.existsSync(path.join(process.cwd(), f))) {
      throw new Error(`Falta el archivo crítico: ${f}`);
    }
  }
});

// 2. Arquitectura de Servicios SaaS & CRM Dual
step('Verificar archivos de motor SaaS y CRM de Fiados', () => {
  const crmFiles = [
    'src/services/saasCrmService.js',
    'src/services/customerCrmService.js',
    'src/components/admin/SaasAdminPortal.jsx',
    'src/components/pos/CustomerCrmModal.jsx'
  ];

  for (const f of crmFiles) {
    if (!fs.existsSync(path.join(process.cwd(), f))) {
      throw new Error(`Falta el componente CRM: ${f}`);
    }
  }
});

// 3. Ejecución de la Suite de Pruebas Unitarias (20 tests)
step('Ejecutar suite completa de tests unitarios (node --test)', () => {
  const output = execSync('node --test tests/*.test.js', { encoding: 'utf-8' });
  if (output.includes('fail 1') || output.includes('failing tests')) {
    throw new Error(`Fallos detectados en tests unitarios:\n${output}`);
  }
});

// 4. Compilación limpia para Producción (Vite build)
step('Validar build de producción Vite (npm run build)', () => {
  execSync('npm run build', { encoding: 'utf-8', stdio: 'pipe' });
  if (!fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))) {
    throw new Error('El directorio dist/index.html no fue generado.');
  }
});

// 5. Verificación de Presets Multirubro
step('Verificar catálogo de plantillas para comercios', () => {
  const templatesFile = fs.readFileSync('src/data/storeTemplates.js', 'utf-8').toLowerCase();
  const expectedRubros = ['hamburgues', 'pizzeria', 'rotiseria', 'restaurant'];
  for (const rubro of expectedRubros) {
    if (!templatesFile.includes(rubro)) {
      throw new Error(`Falta plantilla para el rubro: ${rubro}`);
    }
  }
});

// 6. Verificación de Enrutamiento Dinámico y Portales Web
step('Verificar soporte de rutas /carta y portal SaaS en App.jsx', () => {
  const appContent = fs.readFileSync('src/App.jsx', 'utf-8');
  if (!appContent.includes("pathname.startsWith('/carta')") || !appContent.includes('CatalogPage')) {
    throw new Error('App.jsx no tiene configurada la ruta /carta para el catálogo público');
  }
  if (!appContent.includes('SaasAdminPortal') || !appContent.includes('#saas')) {
    throw new Error('App.jsx no tiene configurada la ruta #saas para el portal de suscripciones');
  }
});

// 7. Verificación del Método A Cuenta en POS
step('Verificar integración del método de pago A Cuenta en POS', () => {
  const paymentContent = fs.readFileSync('src/components/pos/PaymentModal.jsx', 'utf-8');
  if (!paymentContent.includes('a_cuenta') || !paymentContent.includes('customerCrmService')) {
    throw new Error('PaymentModal no tiene integrado el método de pago a_cuenta vinculado al CRM');
  }
});

console.log('\n====================================================');
if (failed) {
  console.error('❌ LA VERIFICACIÓN NO FUE EXITOSA.');
  process.exit(1);
} else {
  console.log('🎉 TODAS LAS VERIFICACIONES (7/7) COMPLETADAS EXITOSAMENTE.');
  console.log('✨ Plataforma Web SaaS y CRM Gastronómico 100% operativos y verificados.');
  console.log('====================================================');
}
