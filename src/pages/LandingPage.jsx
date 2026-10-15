import React, { useState } from 'react';
import { sanitizeSlug, DEFAULT_DEMO_STORE } from '../services/storeService.js';
import { DEFAULT_SAAS_PLANS } from '../services/saasCrmService.js';
import '../styles/landing.css';

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

  const modules = [
    {
      id: 'pos',
      icon: '🖥️',
      name: 'Punto de Venta (POS)',
      tagline: 'Cobros ultrarrápidos en 3 toques',
      description: 'Interfaz táctil optimizada para alta rotación en mostrador y delivery. Emisión de tickets de 58mm y 80mm, cobro rápido con vuelto automático, control de arqueo ciego y compatibilidad offline.',
      bullets: [
        'Carga de comandas por mostrador, salón o delivery en segundos',
        'Cálculo de cambio en efectivo y validación de transferencias con alias',
        'Impresión térmica configurable (58mm / 80mm) con corte de papel',
        'Funciona 100% offline: si se corta internet, sigues vendiendo sin freno'
      ],
      previewBadge: 'Mostrador & Delivery',
      previewHeadline: 'Ventas a la Velocidad de la Luz',
      mockStats: [
        { label: 'Tiempo por pedido', val: '< 15 seg' },
        { label: 'Métodos de pago', val: 'Efectivo, Transferencia, Fiado' },
        { label: 'Soporte offline', val: '100% Activo' }
      ]
    },
    {
      id: 'kds',
      icon: '👨‍🍳',
      name: 'Pantalla de Cocina (KDS)',
      tagline: 'Cero gritos y comandas perdidas',
      description: 'Comandera digital para cocina y barra. Los pedidos entran en tiempo real con alertas sonoras, cronómetro de preparación y organización visual de comandas por orden de llegada.',
      bullets: [
        'Sonido de campana cada vez que ingresa un nuevo pedido o modificación',
        'Control visual de estados: Pendiente ⏳, En Cocina 🔥, Listo ✅, Entregado 🛵',
        'Modo Zen Pantalla Completa para tablets y televisores en cocina',
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
      icon: '🪑',
      name: 'Salón & Mapa de Mesas',
      tagline: 'Diseño visual y adición interactiva',
      description: 'Dibuja el plano de tu restaurante o salón. Visualiza mesas libres, ocupadas, con pedido pendiente o por cobrar. Asigna mozos y divide cuentas con total transparencia.',
      bullets: [
        'Editor visual de distribución física de mesas (cuadradas, redondas, barras)',
        'Colores en vivo según estado de la mesa (Verde = Libre, Rojo = Ocupada)',
        'Cierre de mesa y adición directa al Punto de Venta',
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
      icon: '🤖',
      name: 'Bot WhatsApp 24/7',
      tagline: 'Vende mientras duermes sin APIs caras',
      description: 'Atención automática directamente en tu propio número de WhatsApp. El bot saluda con el nombre de tu local, comparte tu carta digital QR y carga los pedidos en tu comanda sin comisiones.',
      bullets: [
        'Funciona en tu propia PC o servidor local sin pagar costos por mensaje a Meta',
        'Envío automático de carta interactiva y promociones del día',
        'Recepción de comprobantes de transferencia y pedidos confirmados',
        'Modo híbrido: el bot atiende y puedes intervenir cuando lo desees'
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
      icon: '📲',
      name: 'Carta Digital QR',
      tagline: 'Tus clientes piden desde su teléfono',
      description: 'Menú web ultraliviano y personalizado con la estética de tu comercio. Los comensales escanean el código QR en la mesa o entran desde Instagram para armar su pedido.',
      bullets: [
        'URL propia por comercio: tudominio.com/carta/tunegocio',
        'Fotos de platos, categorías, extras, modificadores y precios en vivo',
        'Envío de pedidos directo al WhatsApp del local o a la comanda',
        'Modo mesa: el comensal especifica su número de mesa para servicio rápido'
      ],
      previewBadge: 'Menú Web QR',
      previewHeadline: 'Menú Siempre Actualizado sin Re-impresiones',
      mockStats: [
        { label: 'Tiempo de carga', val: '< 0.5 seg' },
        { label: 'Diseño', val: '100% Mobile Responsive' },
        { label: 'Modo Mesa', val: 'QR individual' }
      ]
    },
    {
      id: 'crm',
      icon: '📒',
      name: 'CRM & Libreta de Fiados',
      tagline: 'Cobranzas ordenadas y clientes felices',
      description: 'Administra tus clientes frecuentes y cuentas corrientes. Vende a crédito (fiado) con límite de confianza y envía recordatorios de deuda elegantes por WhatsApp con 1 solo clic.',
      bullets: [
        'Registro de clientes con teléfono, dirección y saldo histórico',
        'Método de pago "A Cuenta / Fiado" integrado en el punto de venta',
        'Historial de cargos y abonos con fecha y número de comanda',
        'Botón de cobranza WhatsApp con texto de cortesía prearmado'
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

  const plans = [
    {
      id: 'basico',
      name: 'Plan Básico',
      badge: 'Para Empezar',
      isPopular: false,
      price: '$18.000',
      period: '/ mes',
      description: 'Ideal para carritos, venta en mostrador, delivery inicial y locales pequeños.',
      features: [
        'Punto de Venta Táctil Mostrador ultrarrápido',
        'Carta Digital Web QR por Local',
        'Control de Caja & Arqueo Ciego',
        'Tickets Térmicos 58mm y 80mm',
        'Base de Datos Segura en la Nube',
        'Soporte Estándar por WhatsApp'
      ],
      ctaText: 'Elegir Plan Básico',
      whatsappMessage: 'Hola! Quiero contratar el Plan Básico ($18.000/mes) para mi local gastronómico.'
    },
    {
      id: 'pro',
      name: 'Plan Pro Gastronómico',
      badge: '⭐ MÁS ELEGIDO',
      isPopular: true,
      price: '$28.000',
      period: '/ mes',
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
      whatsappMessage: 'Hola! Quiero probar y contratar el Plan Pro Gastronómico ($28.000/mes) para mi local.'
    },
    {
      id: 'full',
      name: 'Plan Full Franquicia',
      badge: '🚀 VIP COMPLETO',
      isPopular: false,
      price: '$38.000',
      period: '/ mes',
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
      whatsappMessage: 'Hola! Quiero contratar el Plan Full Franquicia ($38.000/mes) para mi negocio.'
    }
  ];

  const faqs = [
    {
      q: '¿Todos los negocios comparten la misma base de datos o cada uno tiene una separada?',
      a: 'Todos los locales se gestionan sobre una única arquitectura centralizada en Supabase de última generación con seguridad a nivel de fila (Row Level Security - RLS). Esto significa que la información de cada negocio (pedidos, productos, clientes, cajas) está 100% aislada e inaccesible para los demás, pero con la enorme ventaja de contar con backups centralizados, máxima velocidad y costos de infraestructura optimizados.'
    },
    {
      q: '¿Cobran algún porcentaje o comisión sobre mis ventas?',
      a: '¡No! Cero comisiones (0%). Solo abonas la suscripción fija mensual de tu plan. El 100% del dinero cobrado en efectivo, transferencia o tarjetas va directo a tu bolsillo o cuenta bancaria.'
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
      setStoreInputError('Por favor escribe el nombre o código de tu comercio.');
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

  const selectedModule = modules.find(m => m.id === activeModuleTab) || modules[0];

  return (
    <div className="landing-saas-root">
      {/* HEADER / NAVBAR */}
      <header className="landing-navbar">
        <div className="landing-container landing-nav-inner">
          <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="landing-brand-icon">⚡</div>
            <div className="landing-brand-text">
              <span className="brand-title">Comanda<span className="brand-accent">SaaS</span></span>
              <span className="brand-badge">Gastronomía 2.0</span>
            </div>
          </div>

          <nav className="landing-nav-links">
            <a href="#modulos">Módulos</a>
            <a href="#planes">Planes & Precios</a>
            <a href="#faq">Preguntas Frecuentes</a>
          </nav>

          <div className="landing-nav-actions">
            <button 
              type="button"
              className="btn-store-login"
              onClick={() => setIsStoreModalOpen(true)}
            >
              🏪 Ingresar a mi Local
            </button>
            <button 
              type="button" 
              className="btn-demo-primary"
              onClick={onOpenDemo}
            >
              🚀 Probar Demo
            </button>
            <button
              type="button"
              className="btn-saas-link"
              title="Acceso Super-Admin"
              onClick={onOpenSaas}
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="landing-container landing-hero-grid">
          <div className="landing-hero-content">
            <div className="hero-pill">
              <span className="pill-dot"></span>
              Plataforma Multi-Comercio Todo-en-Uno
            </div>
            <h1 className="hero-title">
              El Sistema Operativo Gastronómico que <span className="text-gradient">Multiplica tus Ventas</span> y Elimina el Caos
            </h1>
            <p className="hero-subtitle">
              Punto de Venta ultrarrápido, Comandera KDS para cocina, Mapa de Mesas de salón, Bot de WhatsApp 24/7 sin intermediarios y Carta Digital QR. 
              <strong> 100% en la nube, con soporte offline y 0% de comisiones por pedido.</strong>
            </p>

            <div className="hero-cta-group">
              <button 
                type="button" 
                className="btn-hero-cta"
                onClick={onOpenDemo}
              >
                <span>⚡ Probar Demo en Vivo Gratis</span>
                <small>Sin registro previo ni tarjeta</small>
              </button>

              <button 
                type="button" 
                className="btn-hero-secondary"
                onClick={() => setIsStoreModalOpen(true)}
              >
                <span>🏪 Ya tengo una cuenta</span>
                <small>Ingresar a mi comercio</small>
              </button>
            </div>

            <div className="hero-badges-row">
              <div className="hero-badge-item">
                <span className="badge-icon">💰</span>
                <span><strong>0%</strong> Comisiones</span>
              </div>
              <div className="hero-badge-item">
                <span className="badge-icon">📶</span>
                <span><strong>100%</strong> Offline-First</span>
              </div>
              <div className="hero-badge-item">
                <span className="badge-icon">🖨️</span>
                <span>Tickets <strong>58/80mm</strong></span>
              </div>
              <div className="hero-badge-item">
                <span className="badge-icon">🛡️</span>
                <span>Datos <strong>Aislados & Seguros</strong></span>
              </div>
            </div>
          </div>

          <div className="landing-hero-card">
            <div className="mockup-frame">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="mockup-address">comandasaas.app · Panel Operativo</div>
                <div className="mockup-status">🟢 En vivo</div>
              </div>
              <div className="mockup-body">
                <div className="mockup-stats-bar">
                  <div className="m-stat">
                    <span className="m-stat-title">Ventas del Día</span>
                    <span className="m-stat-val">$184.500</span>
                  </div>
                  <div className="m-stat">
                    <span className="m-stat-title">Comandas</span>
                    <span className="m-stat-val">38 activas</span>
                  </div>
                  <div className="m-stat">
                    <span className="m-stat-title">Mesas</span>
                    <span className="m-stat-val">8 ocupadas</span>
                  </div>
                </div>

                <div className="mockup-order-cards">
                  <div className="m-order-card urgent">
                    <div className="m-order-head">
                      <span className="m-order-id">#104 · Salón Mesa 4</span>
                      <span className="m-badge-prep">🔥 En Cocina (4m)</span>
                    </div>
                    <div className="m-order-items">
                      2x Burger Doble Cheddar + Papas Rústicas<br />
                      1x Cerveza Artesanal IPA
                    </div>
                  </div>

                  <div className="m-order-card whatsapp">
                    <div className="m-order-head">
                      <span className="m-order-id">#105 · WhatsApp Bot 🤖</span>
                      <span className="m-badge-wa">🛵 Delivery</span>
                    </div>
                    <div className="m-order-items">
                      1x Pizza Napolitana Familiar + Fainá<br />
                      Alias confirmado · $14.200
                    </div>
                  </div>
                </div>

                <div className="mockup-actions-footer">
                  <button 
                    type="button" 
                    className="btn-mockup-test"
                    onClick={onOpenDemo}
                  >
                    👉 Probar Pantalla Completa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULOS / HOW IT WORKS */}
      <section id="modulos" className="landing-modules">
        <div className="landing-container">
          <div className="section-head text-center">
            <span className="section-tag">EL ARSENAL GASTRONÓMICO</span>
            <h2 className="section-title">Todo lo que Necesita tu Local en una Sola Pantalla</h2>
            <p className="section-desc">
              Diseñado junto a cocineros, mozos y dueños de locales gastronómicos para responder a la máxima presión.
            </p>
          </div>

          <div className="module-tabs-nav">
            {modules.map(mod => (
              <button
                key={mod.id}
                type="button"
                className={`module-tab-btn ${activeModuleTab === mod.id ? 'active' : ''}`}
                onClick={() => setActiveModuleTab(mod.id)}
              >
                <span className="module-tab-icon">{mod.icon}</span>
                <span className="module-tab-text">{mod.name}</span>
              </button>
            ))}
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
                    <span className="bullet-check">✔</span>
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
                  Probar este módulo en vivo →
                </button>
              </div>
            </div>

            <div className="module-showcase-visual">
              <div className="visual-card-inner">
                <div className="visual-header">
                  <span className="visual-icon">{selectedModule.icon}</span>
                  <span className="visual-title">{selectedModule.previewHeadline}</span>
                </div>

                <div className="visual-stats-grid">
                  {selectedModule.mockStats.map((st, i) => (
                    <div key={i} className="visual-stat-box">
                      <span className="v-label">{st.label}</span>
                      <strong className="v-value">{st.val}</strong>
                    </div>
                  ))}
                </div>

                <div className="visual-action-hint">
                  <span>💡 Diseñado para operar en pantallas táctiles de cualquier tamaño.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES & PRECIOS */}
      <section id="planes" className="landing-pricing">
        <div className="landing-container">
          <div className="section-head text-center">
            <span className="section-tag">PRECIOS TRANSPARENTES</span>
            <h2 className="section-title">Elige el Plan Perfecto para tu Negocio</h2>
            <p className="section-desc">
              Sin contratos forzosos. Cancela o cambia de plan en cualquier momento. 0% de comisiones sobre tus ventas.
            </p>
          </div>

          <div className="pricing-grid">
            {plans.map(plan => (
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
                    <span className="plan-price">{plan.price}</span>
                    <span className="plan-period">{plan.period}</span>
                  </div>
                </div>

                <ul className="plan-features">
                  {plan.features.map((feat, idx) => (
                    <li key={idx}>
                      <span className="feat-check">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="pricing-footer">
                  <button
                    type="button"
                    className={`btn-plan-cta ${plan.isPopular ? 'btn-plan-popular' : ''}`}
                    onClick={() => openWhatsAppContact(plan.whatsappMessage)}
                  >
                    {plan.ctaText}
                  </button>
                  <small className="plan-guarantee">Activación inmediata sin demora</small>
                </div>
              </div>
            ))}
          </div>

          <div className="pricing-custom-banner">
            <div className="banner-content">
              <h4>¿Tienes una cadena de locales o franquicia con más de 3 sucursales?</h4>
              <p>Ofrecemos planes corporativos a medida con base de datos dedicada, analíticas consolidadas y soporte presencial.</p>
            </div>
            <button 
              type="button" 
              className="btn-banner-cta"
              onClick={() => openWhatsAppContact('Hola! Quiero consultar por un plan para cadena de locales / franquicia.')}
            >
              Consultar Plan Franquicias →
            </button>
          </div>
        </div>
      </section>

      {/* TRANSPARENCIA MULTI-TENANT */}
      <section className="landing-security">
        <div className="landing-container">
          <div className="security-box">
            <div className="security-icon">🛡️</div>
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

      {/* PREGUNTAS FRECUENTES (FAQ) */}
      <section id="faq" className="landing-faq">
        <div className="landing-container">
          <div className="section-head text-center">
            <span className="section-tag">DUDAS RESUELTAS</span>
            <h2 className="section-title">Preguntas Frecuentes</h2>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button 
                    type="button" 
                    className="faq-question"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  >
                    <span>{faq.q}</span>
                    <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
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

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-grid">
          <div className="footer-col brand-col">
            <div className="landing-brand">
              <div className="landing-brand-icon">⚡</div>
              <div className="landing-brand-text">
                <span className="brand-title">Comanda<span className="brand-accent">SaaS</span></span>
              </div>
            </div>
            <p className="footer-text">
              La plataforma integral para locales gastronómicos que buscan velocidad, control y cero comisiones.
            </p>
            <div className="footer-status-pill">
              <span className="status-dot"></span> Sistemas Operativos 100% Online
            </div>
          </div>

          <div className="footer-col">
            <h5>Navegación</h5>
            <ul>
              <li><a href="#modulos">Módulos del Sistema</a></li>
              <li><a href="#planes">Planes de Suscripción</a></li>
              <li><a href="#faq">Preguntas Frecuentes</a></li>
              <li><a href="/carta/demo" target="_blank" rel="noreferrer">Carta Digital Demo</a></li>
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
            <h5>Contacto</h5>
            <p className="footer-contact-p">
              ¿Dudas técnicas o comerciales? Escríbenos directamente:
            </p>
            <button 
              type="button" 
              className="btn-footer-whatsapp"
              onClick={() => openWhatsAppContact()}
            >
              💬 WhatsApp de Soporte
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="landing-container footer-bottom-inner">
            <p>© 2026 Comanda SaaS Gastronomía. Todos los derechos reservados.</p>
            <p className="footer-credits">Desarrollado para alta velocidad y confiabilidad total.</p>
          </div>
        </div>
      </footer>

      {/* MODAL INGRESO A MI COMERCIO */}
      {isStoreModalOpen && (
        <div className="landing-modal-overlay" onClick={() => setIsStoreModalOpen(false)}>
          <div className="landing-modal-card" onClick={e => e.stopPropagation()}>
            <div className="landing-modal-head">
              <h3>🏪 Ingresar a mi Local</h3>
              <button 
                type="button" 
                className="btn-close-modal"
                onClick={() => setIsStoreModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStoreSubmit} className="landing-modal-body">
              <p className="modal-instruction">
                Ingresa el nombre o identificador (slug) de tu comercio para acceder a tu panel de ventas y cocina:
              </p>

              <div className="input-group">
                <label htmlFor="storeSlugInput">Identificador de tu Local</label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">app/</span>
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
                  <span className="input-error-msg">{storeInputError}</span>
                )}
              </div>

              <div className="quick-access-suggestions">
                <span className="quick-label">Locales de prueba rápida:</span>
                <div className="quick-buttons">
                  <button 
                    type="button" 
                    className="quick-chip"
                    onClick={() => {
                      setIsStoreModalOpen(false);
                      onOpenDemo();
                    }}
                  >
                    🍔 comanda-demo
                  </button>
                  <button 
                    type="button" 
                    className="quick-chip"
                    onClick={() => {
                      setStoreInputSlug('fastburga');
                    }}
                  >
                    🍟 fastburga
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
                  Entrar al Sistema →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
