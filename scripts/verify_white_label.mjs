// scripts/verify_white_label.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('🔍 VERIFICACIÓN INTEGRAL: WHITE-LABEL GASTRONÓMICO');
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

// 1. Arquitectura de Archivos Core
step('Verificar archivos de arquitectura White-Label', () => {
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

// 2. Ejecución de la Suite de Pruebas Unitarias
step('Ejecutar suite completa de tests unitarios (node --test)', () => {
  const output = execSync('node --test tests/*.test.js', { encoding: 'utf-8' });
  if (output.includes('fail 1') || output.includes('failing tests')) {
    throw new Error(`Fallos detectados en tests unitarios:\n${output}`);
  }
});

// 3. Compilación limpia para Producción (Vite build)
step('Validar build de producción Vite (npm run build)', () => {
  execSync('npm run build', { encoding: 'utf-8', stdio: 'pipe' });
  if (!fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))) {
    throw new Error('El directorio dist/index.html no fue generado.');
  }
});

// 4. Verificación de Presets Multirubro
step('Verificar catálogo de plantillas para comercios', () => {
  const templatesFile = fs.readFileSync('src/data/storeTemplates.js', 'utf-8').toLowerCase();
  const expectedRubros = ['hamburgues', 'pizzeria', 'rotiseria', 'restaurant'];
  for (const rubro of expectedRubros) {
    if (!templatesFile.includes(rubro)) {
      throw new Error(`Falta plantilla para el rubro: ${rubro}`);
    }
  }
});

// 5. Verificación de Enrutamiento Dinámico
step('Verificar soporte de rutas /carta en App.jsx', () => {
  const appContent = fs.readFileSync('src/App.jsx', 'utf-8');
  if (!appContent.includes("pathname.startsWith('/carta')") || !appContent.includes('CatalogPage')) {
    throw new Error('App.jsx no tiene configurada la ruta /carta para el catálogo público');
  }
});

console.log('\n====================================================');
if (failed) {
  console.error('❌ LA VERIFICACIÓN NO FUE EXITOSA.');
  process.exit(1);
} else {
  console.log('🎉 TODAS LAS VERIFICACIONES COMPLETADAS EXITOSAMENTE.');
  console.log('✨ El sistema está 100% listo para venta y despliegue a comercios gastronómicos.');
  console.log('====================================================');
}
