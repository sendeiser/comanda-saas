import React, { useState, useMemo, useEffect } from 'react';
import { sanitizeSlug, DEFAULT_DEMO_STORE } from '../services/storeService.js';
import { DEFAULT_SAAS_PLANS } from '../services/saasCrmService.js';
import '../styles/landing.css';

// ============================================================================
// COHESIVE SVG ICON SYSTEM (Strictly zero emojis per Impeccable / Taste-Design)
// ============================================================================
function IconBolt({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconMonitor({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconChef({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 13.8a4.5 4.5 0 1 1 3.5-7.3 5 5 0 0 1 9 0A4.5 4.5 0 1 1 18 13.8" />
      <path d="M6 14h12v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  );
}

function IconLayoutGrid({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconMessageCircle({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconQrCode({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3z" />
      <path d="M20 14v3h-3" />
      <path d="M14 20h7" />
    </svg>
  );
}

function IconUsers({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconCheck({ className = '', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX({ className = '', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconStore({ className = '', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconRocket({ className = '', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2 5-2" />
      <path d="M15 9V4s3.03.55 4.5 2c1.63 1.62 2 5 2 5" />
    </svg>
  );
}

function IconSettings({ className = '', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconShieldCheck({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconPercent({ className = '', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function IconWifiOff({ className = '', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function IconPrinter({ className = '', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function IconCalculator({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="16" y1="14" x2="16" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}

function IconArrowRight({ className = '', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconChevronDown({ className = '', size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ============================================================================
// MAIN COMPONENT: LANDING PAGE
// ============================================================================
export default function LandingPage({
  onEnterStore,
  onOpenDemo,
  onOpenSaas,
  onOpenCatalog
}) {
  const [activeModuleTab, setActiveModuleTab] = useState('pos');
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [storeInputSlug, setStoreInputSlug] = useState('');
  const [storeInputError, setStoreInputError] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  
  // Billing cycle toggle: 'monthly' | 'annual' (20% off / 2 months free)
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Interactive ROI Calculator State
  const [calcSales, setCalcSales] = useState(2500000); // 2.5 millones mensuales de venta estimada
  const [calcCommissionRate, setCalcCommissionRate] = useState(22); // 22% apps tradicionales

  // Keyboard accessibility: ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isStoreModalOpen) {
        setIsStoreModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStoreModalOpen]);

  // Modules definition with clean SVG icons
  const modules = [
    {
      id: 'pos',
      Icon: IconMonitor,
      name: 'Punto de Venta (POS)',
      tagline: 'Despacho táctil de alta velocidad en 3 toques',
      description: 'Construido específicamente para el ritmo de mostrador y delivery. Emisión inmediata de comandas térmicas (58mm y 80mm), cálculo de vuelto en efectivo, validación de transferencias y funcionamiento offline continuo.',
      bullets: [
        'Carga instantánea de comandas por mostrador, salón o delivery en segundos',
        'Cálculo de cambio en efectivo y validación de transferencias con alias directo',
        'Impresión térmica configurable (58mm / 80mm) con corte de papel',
        'Arquitectura 100% offline: si se corta internet, sigues cobrando y emitiendo tickets'
      ],
      previewBadge: 'Mostrador & Delivery',
      previewHeadline: 'Ventas a la Velocidad de la Luz',
      mockStats: [
        { label: 'Tiempo por pedido', val: '< 15 seg' },
        { label: 'Métodos de cobro', val: 'Efectivo, Transferencia, Fiado' },
        { label: 'Soporte offline', val: '100% Activo' }
      ]
    },
    {
      id: 'kds',
      Icon: IconChef,
      name: 'Pantalla de Cocina (KDS)',
      tagline: 'Cero gritos y comandas de papel perdidas',
      description: 'Comandera digital en tiempo real para cocineros y despachadores. Los pedidos ingresan con campanada sonora, cronómetro de espera por comanda y organización cronológica por orden de llegada.',
      bullets: [
        'Alerta sonora al recibir nuevos pedidos o modificaciones del salón',
        'Control visual de estados: Pendiente, En Cocina, Listo para Entrega y Despachado',
        'Modo Zen Pantalla Completa optimizado para tablets y televisores de cocina',
        'Filtro por canal: Salón, Mostrador o Delivery'
      ],
      previewBadge: 'Cocina & Despacho',
      previewHeadline: 'Sincronización Total con el Salón',
      mockStats: [
        { label: 'Alertas sonoras', val: 'Instantáneas' },
        { label: 'Tiempo promedio', val: '8 min' },
        { label: 'Modo Zen', val: 'Pantalla Completa' }
      ]
    },
    {
      id: 'salon',
      Icon: IconLayoutGrid,
      name: 'Salón & Mapa de Mesas',
      tagline: 'Distribución física interactiva y adición en vivo',
      description: 'Dibuja el plano exacto de tu restaurante. Visualiza en vivo qué mesas están libres, ocupadas o pidiendo la cuenta. Asigna mozos y realiza cierres de mesa directo al punto de venta.',
      bullets: [
        'Editor visual de distribución física de mesas (cuadradas, redondas, barras)',
        'Indicadores en vivo de estado de mesa (Verde = Libre, Rojo = Ocupada, Ámbar = Por cobrar)',
        'Cierre de mesa y adición directa al Punto de Venta sin retrasos',
        'Soporte para múltiples sectores (Salón interior, Terraza, Barra)'
      ],
      previewBadge: 'Gestión de Salón',
      previewHeadline: 'Control Visual de cada Comensal',
      mockStats: [
        { label: 'Distribución', val: 'Arrastrar & Soltar' },
        { label: 'Estados de mesa', val: 'En tiempo real' },
        { label: 'Capacidad', val: 'Ilimitada' }
      ]
    },
    {
      id: 'whatsapp',
      Icon: IconMessageCircle,
      name: 'Bot WhatsApp 24/7',
      tagline: 'Pedidos automatizados en tu propio número con $0 de API',
      description: 'Atención automática con el WhatsApp de tu negocio escaneando un código QR. El bot saluda al cliente, envía tu carta interactiva y carga el pedido directo en tu cocina sin pagar comisiones por mensaje a Meta.',
      bullets: [
        'Corre directamente en tu servidor local sin pagar costos por mensaje a Meta',
        'Envío automático de carta interactiva y promociones del día',
        'Recepción de comprobantes de transferencia y pedidos confirmados',
        'Modo híbrido: el bot atiende automáticamente y puedes intervenir en cualquier momento'
      ],
      previewBadge: 'WhatsApp Local',
      previewHeadline: 'Tu Negocio Abierto las 24 Horas',
      mockStats: [
        { label: 'Costo por mensaje', val: '$0 (Sin API paga)' },
        { label: 'Disponibilidad', val: '24/7/365' },
        { label: 'Integración', val: 'Inyección directa al KDS' }
      ]
    },
    {
      id: 'carta',
      Icon: IconQrCode,
      name: 'Carta Digital QR',
      tagline: 'Menú web liviano con 7 identidades visuales',
      description: 'Menú web ultraliviano para teléfonos móviles. Los clientes escanean el código QR en la mesa o desde Instagram y arman su pedido. Elige entre 7 temas visuales gastronómicos configurables desde el POS.',
      bullets: [
        'URL propia por comercio: tudominio.com/carta/tunegocio',
        '7 temas visuales gastronómicos (Retro Burger, Trattoria, Neon Cyber, Bistro, etc.)',
        'Envío de pedidos directo al WhatsApp del local o a la comanda de mostrador',
        'Modo mesa: el comensal especifica su número de mesa para servicio rápido'
      ],
      previewBadge: 'Menú Web QR',
      previewHeadline: 'Menú Siempre Actualizado sin Re-impresiones',
      mockStats: [
        { label: 'Tiempo de carga', val: '< 0.5 seg' },
        { label: 'Temas visuales', val: '7 estilos' },
        { label: 'Modo Mesa', val: 'QR individual' }
      ]
    },
    {
      id: 'crm',
      Icon: IconUsers,
      name: 'CRM & Cuentas Corrientes',
      tagline: 'Control de clientes frecuentes y libreta de fiados',
      description: 'Administra tus clientes habituales y ventas a crédito. Vende a cuenta corriente con saldo transparente y envía recordatorios de deuda personalizados por WhatsApp con un solo clic.',
      bullets: [
        'Ficha completa de cliente con historial de consumos y límite de confianza',
        'Método de cobro "A Cuenta / Fiado" integrado en la comanda del mostrador',
        'Historial de cargos y abonos con fecha y número de comanda auditada',
        'Botón de cobranza WhatsApp con plantilla de cortesía prearmada'
      ],
      previewBadge: 'Finanzas & Fidelización',
      previewHeadline: 'Cuentas Claras y Cobranzas sin Vergüenza',
      mockStats: [
        { label: 'Cobranzas', val: 'Recordatorio WhatsApp 1 clic' },
        { label: 'Auditoría', val: 'Historial de cargos y pagos' },
        { label: 'Fidelización', val: 'Base de clientes propia' }
      ]
    }
  ];

  // Pricing plans definition
  const plansData = [
    {
      id: 'basico',
      name: 'Plan Básico',
      badge: 'Para Empezar',
      isPopular: false,
      monthlyPrice: 18000,
      annualPrice: 14400,
      description: 'Ideal para carritos, venta en mostrador, delivery inicial y locales pequeños.',
      features: [
        'Punto de Venta Táctil Mostrador ultrarrápido',
        'Carta Digital Web QR por Local (7 temas)',
        'Control de Caja & Arqueo Ciego',
        'Tickets Térmicos 58mm y 80mm',
        'Base de Datos Segura en la Nube con RLS',
        'Soporte Estándar por WhatsApp'
      ],
      ctaText: 'Elegir Plan Básico',
      whatsappMessage: (cycle) => `Hola! Quiero contratar el Plan Básico (${cycle === 'annual' ? '$14.400/mes anual' : '$18.000/mes'}) para mi local gastronómico.`
    },
    {
      id: 'pro',
      name: 'Plan Pro Gastronómico',
      badge: 'MÁS ELEGIDO',
      isPopular: true,
      monthlyPrice: 28000,
      annualPrice: 22400,
      description: 'La solución definitiva para hamburgueserías, pizzerías, bares y restaurantes con salón.',
      features: [
        'Todo lo incluido en el Plan Básico',
        'Módulo de Salón & Mapa de Mesas interactivo',
        'Pantalla de Cocina KDS con sonido en vivo',
        'Bot de WhatsApp Local 24/7 sin APIs costosas',
        'Sincronización en tiempo real de múltiples dispositivos',
        'Soporte Técnico Asistido & Configuración de Carta'
      ],
      ctaText: 'Comenzar con Plan Pro',
      whatsappMessage: (cycle) => `Hola! Quiero probar y contratar el Plan Pro Gastronómico (${cycle === 'annual' ? '$22.400/mes anual' : '$28.000/mes'}) para mi local.`
    },
    {
      id: 'full',
      name: 'Plan Full Franquicia',
      badge: 'VIP COMPLETO',
      isPopular: false,
      monthlyPrice: 38000,
      annualPrice: 30400,
      description: 'Para negocios consolidados, múltiples cajeros, franquicias y gestión de clientes.',
      features: [
        'Todo lo incluido en el Plan Pro Gastronómico',
        'CRM de Clientes & Libreta de Fiados (Cuentas corrientes)',
        'Cobranzas automatizadas por WhatsApp en 1 clic',
        'Múltiples Cajas y Roles de Cajero/Mozo independientes',
        'Reportes avanzados de rentabilidad y ticket promedio',
        'Soporte Prioritario VIP 24/7 con guardia telefónica'
      ],
      ctaText: 'Contratar Plan Full',
      whatsappMessage: (cycle) => `Hola! Quiero contratar el Plan Full Franquicia (${cycle === 'annual' ? '$30.400/mes anual' : '$38.000/mes'}) para mi negocio.`
    }
  ];

  // FAQ items
  const faqs = [
    {
      q: '¿Todos los negocios comparten la misma base de datos o cada uno tiene una separada?',
      a: 'Todos los locales se gestionan sobre una arquitectura centralizada en Supabase de última generación con seguridad estricta a nivel de fila (Row Level Security - RLS). Esto garantiza que la información de cada negocio (pedidos, productos, clientes, cajas) está 100% aislada e inaccesible para los demás, con la enorme ventaja de contar con backups centralizados, velocidad instantánea y costos de infraestructura optimizados.'
    },
    {
      q: '¿Cobran algún porcentaje o comisión sobre mis ventas?',
      a: 'No. Cero comisiones (0%). Solo abonas la suscripción fija mensual de tu plan. El 100% del dinero cobrado en efectivo, transferencia o tarjetas va directo a tu cuenta bancaria o caja sin ningún descuento.'
    },
    {
      q: '¿Qué equipamiento o computadoras necesito para usarlo?',
      a: 'El sistema funciona directo en el navegador web (Google Chrome, Safari, Edge, Firefox). Puedes usarlo en computadoras de escritorio, notebooks, tablets Android, iPads o incluso teléfonos celulares. Es compatible con cualquier impresora térmica común (USB, Bluetooth o de red).'
    },
    {
      q: '¿Qué sucede si se corta internet en mi local?',
      a: 'Comanda SaaS cuenta con arquitectura offline-first. Puedes seguir tomando pedidos en mostrador y emitiendo tickets en papel normalmente. Tan pronto como vuelva la conexión, el sistema sincroniza automáticamente todo con la nube.'
    },
    {
      q: '¿Cómo funciona el Bot de WhatsApp sin pagar APIs caras?',
      a: 'Integramos un conector local que corre directamente con tu propio número de WhatsApp (escaneando un código QR similar a WhatsApp Web). De este modo, no tienes que pagar cuotas mensuales por conversación a Meta ni depender de servicios costosos de terceros.'
    }
  ];

  const handleStoreSubmit = (e) => {
    e.preventDefault();
    const clean = sanitizeSlug(storeInputSlug);
    if (!clean) {
      setStoreInputError('Por favor escribe el nombre o identificador de tu comercio.');
      return;
    }
    setStoreInputError('');
    setIsStoreModalOpen(false);
    if (typeof onEnterStore === 'function') {
      onEnterStore(clean);
    } else {
      window.location.search = `?store=${clean}`;
      window.location.hash = '#pos';
    }
  };

  const openWhatsAppContact = (text) => {
    const encoded = encodeURIComponent(text || 'Hola! Me interesa conocer más sobre Comanda SaaS.');
    window.open(`https://wa.me/5491122334455?text=${encoded}`, '_blank');
  };

  // Calculations for Commission Savings
  const estimatedAppCommission = useMemo(() => {
    return Math.round(calcSales * (calcCommissionRate / 100));
  }, [calcSales, calcCommissionRate]);

  const comandaSaasCost = 28000; // Plan Pro
  const monthlySavings = useMemo(() => {
    return Math.max(0, estimatedAppCommission - comandaSaasCost);
  }, [estimatedAppCommission]);

  const annualSavings = useMemo(() => {
    return monthlySavings * 12;
  }, [monthlySavings]);

  const selectedModule = modules.find(m => m.id === activeModuleTab) || modules[0];

  return (
    <div className="landing-saas-root">
      {/* ==================================================================== */}
      {/* NAVBAR                                                               */}
      {/* ==================================================================== */}
      <header className="landing-navbar">
        <div className="landing-container landing-nav-inner">
          <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="landing-brand-icon">
              <IconBolt size={22} />
            </div>
            <div className="landing-brand-text">
              <span className="brand-title">Comanda<span className="brand-accent">SaaS</span></span>
              <span className="brand-badge">Gastronomía Operativa</span>
            </div>
          </div>

          <nav className="landing-nav-links" aria-label="Navegación principal">
            <a href="#modulos">Módulos</a>
            <a href="#ahorro">Calculadora 0%</a>
            <a href="#planes">Planes & Suscripciones</a>
            <a href="#arquitectura">Seguridad</a>
            <a href="#faq">Preguntas</a>
          </nav>

          <div className="landing-nav-actions">
            <button 
              type="button"
              className="btn-store-login"
              onClick={() => setIsStoreModalOpen(true)}
            >
              <IconStore size={16} />
              <span>Ingresar a mi Local</span>
            </button>
            <button 
              type="button" 
              className="btn-demo-primary"
              onClick={onOpenDemo}
            >
              <IconRocket size={16} />
              <span>Probar Demo en Vivo</span>
            </button>
            <button
              type="button"
              className="btn-saas-link"
              title="Portal Super-Admin"
              aria-label="Acceso al portal Super-Admin"
              onClick={onOpenSaas}
            >
              <IconSettings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* HERO SECTION                                                         */}
      {/* ==================================================================== */}
      <section className="landing-hero">
        <div className="landing-container landing-hero-grid">
          <div className="landing-hero-content">
            <div className="hero-pill">
              <span className="pill-dot"></span>
              Plataforma Multi-Comercio Todo-en-Uno
            </div>

            <h1 className="hero-title">
              El Sistema Operativo Gastronómico que Acelera tus Ventas y Elimina el Caos
            </h1>

            <p className="hero-subtitle">
              Punto de Venta ultrarrápido, Comandera KDS para cocina, Mapa interactivo de Salón, Bot de WhatsApp 24/7 sin costos por mensaje y Carta Digital con 7 temas visuales. 
              <strong> 100% en la nube, con arquitectura offline-first y 0% de comisiones sobre tus ventas.</strong>
            </p>

            <div className="hero-cta-group">
              <button 
                type="button" 
                className="btn-hero-cta"
                onClick={onOpenDemo}
              >
                <div className="btn-cta-text-wrap">
                  <span className="btn-cta-title">
                    <IconBolt size={18} />
                    <span>Probar Demo en Vivo Gratis</span>
                  </span>
                  <span className="btn-cta-caption">Sin registro previo ni tarjeta</span>
                </div>
                <IconArrowRight size={18} />
              </button>

              <button 
                type="button" 
                className="btn-hero-secondary"
                onClick={() => setIsStoreModalOpen(true)}
              >
                <IconStore size={18} />
                <span>Ingresar a mi Local</span>
              </button>
            </div>

            <div className="hero-badges-row">
              <div className="hero-badge-item">
                <IconPercent size={18} className="badge-svg" />
                <span><strong>0%</strong> Comisiones</span>
              </div>
              <div className="hero-badge-item">
                <IconWifiOff size={18} className="badge-svg" />
                <span><strong>100%</strong> Offline-First</span>
              </div>
              <div className="hero-badge-item">
                <IconPrinter size={18} className="badge-svg" />
                <span>Tickets <strong>58 / 80mm</strong></span>
              </div>
              <div className="hero-badge-item">
                <IconShieldCheck size={18} className="badge-svg" />
                <span>Datos <strong>Aislados RLS</strong></span>
              </div>
            </div>
          </div>

          {/* HERO INTERACTIVE COCKPIT MOCKUP */}
          <div className="landing-hero-card">
            <div className="mockup-frame">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="mockup-address">
                  <span className="address-lock">🔒</span>
                  <span>comandasaas.app · Panel Operativo Gastronómico</span>
                </div>
                <div className="mockup-status">
                  <span className="status-live-pulse"></span>
                  <span>En vivo</span>
                </div>
              </div>

              <div className="mockup-body">
                {/* Stats Bar with tabular numbers */}
                <div className="mockup-stats-bar">
                  <div className="m-stat">
                    <span className="m-stat-title">Ventas del Turno</span>
                    <span className="m-stat-val font-mono">$184.500</span>
                  </div>
                  <div className="m-stat">
                    <span className="m-stat-title">Comandas Activas</span>
                    <span className="m-stat-val font-mono">14 en marcha</span>
                  </div>
                  <div className="m-stat">
                    <span className="m-stat-title">Mesas en Salón</span>
                    <span className="m-stat-val font-mono">8 ocupadas</span>
                  </div>
                </div>

                {/* Real Gastro Orders Simulation */}
                <div className="mockup-order-cards">
                  <div className="m-order-card urgent">
                    <div className="m-order-head">
                      <div className="m-order-title-wrap">
                        <span className="m-order-id font-mono">#104</span>
                        <span className="m-order-table">Salón · Mesa 4</span>
                      </div>
                      <span className="m-badge-prep">Cocina · 4m</span>
                    </div>
                    <div className="m-order-items">
                      <div className="m-item-line">
                        <span className="m-qty font-mono">2x</span>
                        <span className="m-name">Smash Burger Doble Cheddar</span>
                      </div>
                      <div className="m-item-line">
                        <span className="m-qty font-mono">1x</span>
                        <span className="m-name">Papas Rústicas con Panceta</span>
                      </div>
                      <div className="m-item-line">
                        <span className="m-qty font-mono">2x</span>
                        <span className="m-name">Cerveza Artesanal IPA 500ml</span>
                      </div>
                    </div>
                  </div>

                  <div className="m-order-card whatsapp">
                    <div className="m-order-head">
                      <div className="m-order-title-wrap">
                        <span className="m-order-id font-mono">#105</span>
                        <span className="m-order-channel">WhatsApp Bot 24/7</span>
                      </div>
                      <span className="m-badge-wa">Delivery</span>
                    </div>
                    <div className="m-order-items">
                      <div className="m-item-line">
                        <span className="m-qty font-mono">1x</span>
                        <span className="m-name">Pizza Napolitana Familiar + Fainá</span>
                      </div>
                      <div className="m-item-sub font-mono">
                        Transferencia MP · Alias verificado · $14.200
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mockup-actions-footer">
                  <button 
                    type="button" 
                    className="btn-mockup-test"
                    onClick={onOpenDemo}
                  >
                    <span>Explorar Sistema Completo en Vivo</span>
                    <IconArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* MODULOS / SYSTEM ARSENAL (Tabs and Deep Dive)                         */}
      {/* ==================================================================== */}
      <section id="modulos" className="landing-modules">
        <div className="landing-container">
          <div className="section-head text-center">
            <h2 className="section-title">Todo lo que Necesita tu Local en una Sola Plataforma</h2>
            <p className="section-desc">
              Diseñado junto a gastronómicos, cocineros y mozos para responder a la máxima presión en momentos de salón lleno.
            </p>
          </div>

          <div className="module-tabs-nav" role="tablist">
            {modules.map(mod => {
              const TabIcon = mod.Icon;
              const isActive = activeModuleTab === mod.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`module-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveModuleTab(mod.id)}
                >
                  <TabIcon size={18} className="module-tab-icon" />
                  <span className="module-tab-text">{mod.name}</span>
                </button>
              );
            })}
          </div>

          <div className="module-showcase-card">
            <div className="module-showcase-info">
              <span className="showcase-badge">{selectedModule.previewBadge}</span>
              <h3 className="showcase-title">{selectedModule.name}</h3>
              <p className="showcase-tagline">{selectedModule.tagline}</p>
              <p className="showcase-description">{selectedModule.description}</p>

              <ul className="showcase-bullets">
                {selectedModule.bullets.map((b, i) => (
                  <li key={i}>
                    <span className="bullet-check">
                      <IconCheck size={14} />
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="showcase-action">
                <button 
                  type="button" 
                  className="btn-showcase-demo"
                  onClick={onOpenDemo}
                >
                  <span>Probar {selectedModule.name} en vivo</span>
                  <IconArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="module-showcase-visual">
              <div className="visual-card-inner">
                <div className="visual-header">
                  <div className="visual-icon-wrap">
                    <selectedModule.Icon size={22} />
                  </div>
                  <span className="visual-title">{selectedModule.previewHeadline}</span>
                </div>

                <div className="visual-stats-grid">
                  {selectedModule.mockStats.map((st, i) => (
                    <div key={i} className="visual-stat-box">
                      <span className="v-label">{st.label}</span>
                      <strong className="v-value font-mono">{st.val}</strong>
                    </div>
                  ))}
                </div>

                <div className="visual-action-hint">
                  <IconMonitor size={16} />
                  <span>Optimizado para pantallas táctiles de cualquier tamaño (móviles, tablets, all-in-one).</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* CALCULADORA DE AHORRO EN COMISIONES (0% vs Delivery Apps)            */}
      {/* ==================================================================== */}
      <section id="ahorro" className="landing-calculator-section">
        <div className="landing-container">
          <div className="calc-card-container">
            <div className="calc-intro">
              <div className="calc-badge">
                <IconCalculator size={18} />
                <span>Calculadora de Rentabilidad</span>
              </div>
              <h2 className="calc-title">¿Cuánto Dinero Pierdes Hoy Pagando Comisiones?</h2>
              <p className="calc-subtitle">
                Las apps tradicionales de delivery cobran entre un <strong>18% y un 30%</strong> por cada pedido. Con ComandaSaaS pagas una suscripción fija plana y el <strong>100% de tus ventas es tuyo</strong>.
              </p>

              <div className="calc-controls">
                <div className="calc-field">
                  <div className="calc-label-row">
                    <label htmlFor="salesRange">Venta estimada mensual de tu local:</label>
                    <span className="calc-val-highlight font-mono">${Number(calcSales).toLocaleString('es-AR')}</span>
                  </div>
                  <input 
                    id="salesRange"
                    type="range" 
                    min="500000" 
                    max="10000000" 
                    step="250000"
                    value={calcSales}
                    onChange={(e) => setCalcSales(Number(e.target.value))}
                    className="calc-range-slider"
                  />
                  <div className="calc-ticks font-mono">
                    <span>$500k</span>
                    <span>$2.5M</span>
                    <span>$5M</span>
                    <span>$10M</span>
                  </div>
                </div>

                <div className="calc-field">
                  <div className="calc-label-row">
                    <label htmlFor="commRange">Comisión promedio de apps que pagas hoy:</label>
                    <span className="calc-val-highlight font-mono">{calcCommissionRate}%</span>
                  </div>
                  <input 
                    id="commRange"
                    type="range" 
                    min="15" 
                    max="32" 
                    step="1"
                    value={calcCommissionRate}
                    onChange={(e) => setCalcCommissionRate(Number(e.target.value))}
                    className="calc-range-slider"
                  />
                </div>
              </div>
            </div>

            <div className="calc-results-box">
              <div className="calc-metric-row">
                <div className="calc-metric-item danger">
                  <span className="calc-metric-label">Comisiones perdidas al mes:</span>
                  <span className="calc-metric-number font-mono">-${estimatedAppCommission.toLocaleString('es-AR')}</span>
                  <small className="calc-metric-note">Con apps tradicionales ({calcCommissionRate}%)</small>
                </div>

                <div className="calc-metric-item safe">
                  <span className="calc-metric-label">Costo mensual ComandaSaaS:</span>
                  <span className="calc-metric-number font-mono">${comandaSaasCost.toLocaleString('es-AR')}</span>
                  <small className="calc-metric-note">Plan Pro Gastronómico fijo</small>
                </div>
              </div>

              <div className="calc-total-banner">
                <span className="calc-savings-title">Ahorro Neto Directo para tu Negocio:</span>
                <div className="calc-savings-amount font-mono">
                  +${monthlySavings.toLocaleString('es-AR')} <span className="savings-period">/ mes</span>
                </div>
                <div className="calc-annual-callout font-mono">
                  Equivale a un ahorro de <strong>+${annualSavings.toLocaleString('es-AR')} al año</strong> en tu bolsillo.
                </div>
              </div>

              <button 
                type="button" 
                className="btn-calc-cta"
                onClick={onOpenDemo}
              >
                <span>Empezar a Ahorrar con ComandaSaaS</span>
                <IconArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PLANES & SUSCRIPCIONES                                               */}
      {/* ==================================================================== */}
      <section id="planes" className="landing-pricing">
        <div className="landing-container">
          <div className="section-head text-center">
            <h2 className="section-title">Elige el Plan Perfecto para tu Negocio</h2>
            <p className="section-desc">
              Sin contratos forzosos. Cancela o cambia de plan en cualquier momento. 0% de comisiones sobre tus ventas.
            </p>

            {/* Billing Toggle (Monthly / Annual with 20% discount) */}
            <div className="billing-toggle-wrap">
              <div className="billing-toggle-pill">
                <button
                  type="button"
                  className={`billing-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Facturación Mensual
                </button>
                <button
                  type="button"
                  className={`billing-btn ${billingCycle === 'annual' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('annual')}
                >
                  <span>Facturación Anual</span>
                  <span className="discount-chip">2 meses gratis</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pricing-grid">
            {plansData.map(plan => {
              const currentPrice = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              const formattedPrice = `$${currentPrice.toLocaleString('es-AR')}`;
              
              return (
                <div 
                  key={plan.id} 
                  className={`pricing-card ${plan.isPopular ? 'popular-card' : ''}`}
                >
                  {plan.badge && (
                    <div className={`pricing-badge ${plan.isPopular ? 'popular-badge' : ''}`}>
                      {plan.badge}
                    </div>
                  )}

                  <div className="pricing-header">
                    <h3 className="plan-name">{plan.name}</h3>
                    <p className="plan-desc">{plan.description}</p>
                    
                    <div className="plan-price-wrap">
                      <span className="plan-price font-mono">{formattedPrice}</span>
                      <span className="plan-period">/ mes</span>
                    </div>

                    {billingCycle === 'annual' && (
                      <div className="plan-billed-note font-mono">
                        Facturado anualmente (${(currentPrice * 12).toLocaleString('es-AR')}/año)
                      </div>
                    )}
                  </div>

                  <div className="plan-divider"></div>

                  <ul className="plan-features">
                    {plan.features.map((feat, idx) => (
                      <li key={idx}>
                        <span className="feat-check">
                          <IconCheck size={14} />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pricing-footer">
                    <button
                      type="button"
                      className={`btn-plan-cta ${plan.isPopular ? 'btn-plan-popular' : ''}`}
                      onClick={() => openWhatsAppContact(plan.whatsappMessage(billingCycle))}
                    >
                      <span>{plan.ctaText}</span>
                      <IconArrowRight size={16} />
                    </button>
                    <small className="plan-guarantee">Activación inmediata sin costos ocultos</small>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Franchise / Chains Custom Banner */}
          <div className="pricing-custom-banner">
            <div className="banner-content">
              <h4>¿Tienes una cadena de locales o franquicia con más de 3 sucursales?</h4>
              <p>Ofrecemos planes corporativos a medida con base de datos dedicada, analíticas consolidadas y soporte presencial.</p>
            </div>
            <button 
              type="button" 
              className="btn-banner-cta"
              onClick={() => openWhatsAppContact('Hola! Quiero consultar por un plan corporativo para franquicias y múltiples sucursales.')}
            >
              <span>Consultar Plan Franquicias</span>
              <IconArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ARQUITECTURA & SEGURIDAD MULTI-TENANT                                */}
      {/* ==================================================================== */}
      <section id="arquitectura" className="landing-security">
        <div className="landing-container">
          <div className="security-box">
            <div className="security-icon">
              <IconShieldCheck size={36} />
            </div>
            <div className="security-text">
              <h3>Arquitectura Multi-Comercio Segura & Centralizada</h3>
              <p>
                Todos los locales operan bajo una base de datos centralizada de alta disponibilidad con 
                <strong> Row Level Security (RLS)</strong>. Ningún comercio puede acceder a los datos de otro. 
                Tus precios, clientes, ventas y configuraciones están 100% protegidos, con copias de seguridad automáticas 
                y velocidad instantánea garantizada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PREGUNTAS FRECUENTES (FAQ)                                           */}
      {/* ==================================================================== */}
      <section id="faq" className="landing-faq">
        <div className="landing-container">
          <div className="section-head text-center">
            <h2 className="section-title">Preguntas Frecuentes</h2>
            <p className="section-desc">Resolvemos las consultas técnicas y comerciales más habituales.</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button 
                    type="button" 
                    className="faq-question"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  >
                    <span>{faq.q}</span>
                    <span className={`faq-toggle-icon ${isOpen ? 'rotate' : ''}`}>
                      <IconChevronDown size={20} />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FOOTER                                                               */}
      {/* ==================================================================== */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-grid">
          <div className="footer-col brand-col">
            <div className="landing-brand">
              <div className="landing-brand-icon">
                <IconBolt size={20} />
              </div>
              <div className="landing-brand-text">
                <span className="brand-title">Comanda<span className="brand-accent">SaaS</span></span>
              </div>
            </div>
            <p className="footer-text">
              La plataforma integral para locales gastronómicos que buscan máxima velocidad en mostrador, control de cocina y cero comisiones.
            </p>
            <div className="footer-status-pill">
              <span className="status-dot"></span>
              <span>Sistemas Operativos 100% Online</span>
            </div>
          </div>

          <div className="footer-col">
            <h5>Navegación</h5>
            <ul>
              <li><a href="#modulos">Módulos del Sistema</a></li>
              <li><a href="#ahorro">Calculadora de Ahorro</a></li>
              <li><a href="#planes">Planes de Suscripción</a></li>
              <li><a href="#faq">Preguntas Frecuentes</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Acceso Clientes</h5>
            <ul>
              <li><button type="button" className="footer-link-btn" onClick={() => setIsStoreModalOpen(true)}>Ingresar a mi Local</button></li>
              <li><button type="button" className="footer-link-btn" onClick={onOpenDemo}>Probar Demo en Vivo</button></li>
              <li><button type="button" className="footer-link-btn" onClick={onOpenSaas}>Portal Super-Admin</button></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Contacto Directo</h5>
            <p className="footer-contact-p">
              ¿Dudas técnicas o comerciales? Escríbenos directamente a nuestro WhatsApp:
            </p>
            <button 
              type="button" 
              className="btn-footer-whatsapp"
              onClick={() => openWhatsAppContact()}
            >
              <IconMessageCircle size={18} />
              <span>WhatsApp de Soporte</span>
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="landing-container footer-bottom-inner">
            <p>© 2026 Comanda SaaS Gastronomía. Todos los derechos reservados.</p>
            <p className="footer-credits">Desarrollado para alta velocidad operativa y confiabilidad total.</p>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* MODAL: INGRESO A MI COMERCIO                                         */}
      {/* ==================================================================== */}
      {isStoreModalOpen && (
        <div 
          className="landing-modal-overlay" 
          onClick={() => setIsStoreModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalStoreTitle"
        >
          <div className="landing-modal-card" onClick={e => e.stopPropagation()}>
            <div className="landing-modal-head">
              <div className="modal-title-group">
                <IconStore size={22} className="modal-title-icon" />
                <h3 id="modalStoreTitle">Ingresar a mi Local</h3>
              </div>
              <button 
                type="button" 
                className="btn-close-modal"
                aria-label="Cerrar modal"
                onClick={() => setIsStoreModalOpen(false)}
              >
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleStoreSubmit} className="landing-modal-body">
              <p className="modal-instruction">
                Ingresa el nombre o identificador (slug) de tu comercio para acceder a tu panel de ventas y cocina:
              </p>

              <div className="input-group">
                <label htmlFor="storeSlugInput">Identificador de tu Local</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix font-mono">app/</span>
                  <input 
                    id="storeSlugInput"
                    type="text" 
                    placeholder="ej: fastburga, don-tito, mibar"
                    value={storeInputSlug}
                    onChange={e => {
                      setStoreInputSlug(e.target.value);
                      if (storeInputError) setStoreInputError('');
                    }}
                    autoFocus
                  />
                </div>
                {storeInputError && (
                  <span className="input-error-msg" role="alert">{storeInputError}</span>
                )}
              </div>

              <div className="quick-access-suggestions">
                <span className="quick-label">Locales de prueba rápida:</span>
                <div className="quick-buttons">
                  <button 
                    type="button" 
                    className="quick-chip font-mono"
                    onClick={() => {
                      setIsStoreModalOpen(false);
                      onOpenDemo();
                    }}
                  >
                    comanda-demo
                  </button>
                  <button 
                    type="button" 
                    className="quick-chip font-mono"
                    onClick={() => {
                      setStoreInputSlug('fastburga');
                    }}
                  >
                    fastburga
                  </button>
                </div>
              </div>

              <div className="landing-modal-actions">
                <button 
                  type="button" 
                  className="btn-modal-cancel"
                  onClick={() => setIsStoreModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-modal-submit"
                >
                  <span>Entrar al Sistema</span>
                  <IconArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
