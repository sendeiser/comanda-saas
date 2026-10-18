import React, { useState, useEffect } from 'react';
import { sanitizeSlug, DEFAULT_DEMO_STORE } from '../services/storeService.js';
import '../styles/landing.css';

// ============================================================================
// COHESIVE SVG ICONS (Offline-first & pixel-perfect vector rendering)
// ============================================================================
function IconGridView({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconMenu({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconArrowRight({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconPlayCircle({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function IconPointOfSale({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <path d="M6 8h4" />
      <path d="M6 11h2" />
      <circle cx="16" cy="9.5" r="1.5" />
    </svg>
  );
}

function IconSoupKitchen({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 11h16a1 1 0 0 1 1 1 8 8 0 0 1-8 8 8 8 0 0 1-8-8 1 1 0 0 1 1-1z" />
      <line x1="4" y1="21" x2="20" y2="21" />
      <path d="M6 7c0-1.5 1-2.5 1-4" />
      <path d="M12 7c0-1.5 1-2.5 1-4" />
      <path d="M18 7c0-1.5 1-2.5 1-4" />
    </svg>
  );
}

function IconChat({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconQrScanner({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect x="7" y="7" width="3" height="3" />
      <rect x="14" y="7" width="3" height="3" />
      <rect x="7" y="14" width="3" height="3" />
      <line x1="14" y1="14" x2="17" y2="14" />
      <line x1="14" y1="17" x2="17" y2="17" />
    </svg>
  );
}

function IconInventory({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function IconCheck({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}



function IconChevronDown({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconClose({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconStore({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconSettings({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// ============================================================================
// MAIN COMPONENT: LANDING PAGE (Google Stitch Minimalist & Professional)
// ============================================================================
export default function LandingPage({
  onEnterStore,
  onOpenDemo,
  onOpenSaas,
  onOpenCatalog
}) {
  // Modal State
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [storeInputSlug, setStoreInputSlug] = useState('');
  const [storeInputError, setStoreInputError] = useState('');

  // Billing cycle toggle: 'monthly' | 'annual'
  const [billingCycle, setBillingCycle] = useState('monthly');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Mobile Navigation Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fast email lead capture
  const [leadEmail, setLeadEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState('');

  // Keyboard accessibility: ESC to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isStoreModalOpen) setIsStoreModalOpen(false);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStoreModalOpen, isMobileMenuOpen]);

  // Handle store login submission
  const handleStoreSubmit = (e) => {
    e.preventDefault();
    const clean = sanitizeSlug(storeInputSlug);
    if (!clean) {
      setStoreInputError('Por favor escribe el identificador de tu comercio.');
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

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (!leadEmail.trim()) {
      if (typeof onOpenDemo === 'function') onOpenDemo();
      return;
    }
    setLeadStatus('¡Solicitud recibida! Abriendo entorno de demostración...');
    setTimeout(() => {
      if (typeof onOpenDemo === 'function') onOpenDemo();
    }, 700);
  };

  return (
    <div className="landing-page">
      {/* ==================================================================== */}
      {/* 1. TOP APP BAR                                                      */}
      {/* ==================================================================== */}
      <header className="st-header">
        <div className="st-container st-header-inner">
          {/* Brand Logo */}
          <a 
            href="#" 
            className="st-logo"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="st-logo-icon">
              <IconGridView size={14} />
            </div>
            <span className="st-logo-text">ComandaSaaS</span>
            <span className="st-version-badge">v2.4</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="st-nav-links" aria-label="Navegación principal">
            <a className="st-nav-link" href="#modulos">Product</a>
            <a className="st-nav-link" href="#precios">Pricing</a>
            <a className="st-nav-link" href="#faq">FAQ</a>
          </nav>

          {/* Actions */}
          <div className="st-header-actions">
            <button 
              type="button" 
              className="st-btn-ghost"
              onClick={() => setIsStoreModalOpen(true)}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className="st-btn-primary"
              onClick={onOpenDemo}
            >
              Request Access
            </button>
            {typeof onOpenSaas === 'function' && (
              <button
                type="button"
                className="st-btn-ghost"
                style={{ padding: '6px 8px' }}
                title="Super-Admin Portal"
                aria-label="Super-Admin Portal"
                onClick={onOpenSaas}
              >
                <IconSettings size={15} />
              </button>
            )}
            {/* Mobile Navigation Toggle */}
            <button 
              type="button" 
              className="st-mobile-toggle"
              aria-label="Abrir menú de navegación"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <IconClose size={20} /> : <IconMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="st-mobile-drawer open">
            <a className="st-mobile-nav-link" href="#modulos" onClick={() => setIsMobileMenuOpen(false)}>
              <span>Product (Módulos)</span>
              <IconArrowRight size={14} />
            </a>
            <a className="st-mobile-nav-link" href="#precios" onClick={() => setIsMobileMenuOpen(false)}>
              <span>Pricing (Planes)</span>
              <IconArrowRight size={14} />
            </a>
            <a className="st-mobile-nav-link" href="#faq" onClick={() => setIsMobileMenuOpen(false)}>
              <span>Preguntas Frecuentes</span>
              <IconArrowRight size={14} />
            </a>
            <div className="st-mobile-drawer-actions">
              <button 
                type="button" 
                className="st-btn-dark"
                style={{ width: '100%', height: '44px' }}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenDemo();
                }}
              >
                Probar Demo Gratuita
              </button>
              <button 
                type="button" 
                className="st-btn-outline"
                style={{ width: '100%', height: '44px' }}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsStoreModalOpen(true);
                }}
              >
                Ingresar a mi Local
              </button>
              {typeof onOpenSaas === 'function' && (
                <button
                  type="button"
                  className="st-btn-ghost"
                  style={{ width: '100%', justifyContent: 'center', height: '40px' }}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSaas();
                  }}
                >
                  <IconSettings size={16} />
                  <span style={{ marginLeft: '6px' }}>Portal Super-Admin</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ==================================================================== */}
        {/* 2. HERO SECTION                                                     */}
        {/* ==================================================================== */}
        <section className="st-hero">
          <div className="st-container">
            {/* Micro-Badge */}
            <div className="st-micro-badge">
              <span className="st-dot"></span>
              <span>INFRAESTRUCTURA OPERATIVA PARA GASTRONOMÍA</span>
            </div>

            {/* Headline */}
            <h1 className="st-hero-title">
              La plataforma operativa diseñada para la velocidad de tu restaurante
            </h1>

            {/* Subtitle */}
            <p className="st-hero-subtitle">
              Punto de venta táctil, comanderas de cocina en tiempo real, pedidos por WhatsApp automatizados y analíticas de caja. Sin comisiones por venta, arquitectura offline-first.
            </p>

            {/* CTAs */}
            <div className="st-hero-ctas">
              <button 
                type="button" 
                className="st-btn-dark"
                onClick={onOpenDemo}
              >
                <span>Empezar Demo</span>
                <IconArrowRight size={16} />
              </button>
              <button 
                type="button" 
                className="st-btn-outline"
                onClick={() => {
                  const el = document.getElementById('preview');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <IconPlayCircle size={16} />
                <span>Ver funcionamiento en vivo</span>
              </button>
              <button 
                type="button" 
                className="st-btn-outline"
                onClick={() => setIsStoreModalOpen(true)}
              >
                <IconStore size={16} />
                <span>Ingresar a mi Local</span>
              </button>
            </div>

            {/* SAAS INTERFACE PREVIEW (Surgical Bento / Split Dashboard Mockup) */}
            <div className="st-preview-card" id="preview">
              {/* Window Bar */}
              <div className="st-window-bar">
                <div className="st-window-dots">
                  <div className="st-w-dot"></div>
                  <div className="st-w-dot"></div>
                  <div className="st-w-dot"></div>
                  <span className="st-window-tag">app.comanda.internal / terminal-01 [ACTIVE_SERVICE]</span>
                </div>
                <div>
                  <span className="st-sync-badge">
                    <span className="st-sync-dot"></span>
                    SYNC: LOCAL_FIRST_OK
                  </span>
                </div>
              </div>

              {/* Dashboard Body */}
              <div className="st-preview-body">
                {/* Metric Top Bar */}
                <div className="st-metrics-top-bar">
                  <div className="st-preview-stat">
                    <div className="st-stat-label">VENTAS DE TURNO</div>
                    <div className="st-stat-value">$482.900</div>
                    <div className="st-stat-sub">+14.2% vs. ayer</div>
                  </div>
                  <div className="st-preview-stat">
                    <div className="st-stat-label">TIEMPO PROMEDIO PREP</div>
                    <div className="st-stat-value">9m 42s</div>
                    <div className="st-stat-sub" style={{ color: 'var(--st-primary)' }}>-1m 10s objetivo</div>
                  </div>
                  <div className="st-preview-stat">
                    <div className="st-stat-label">TICKET PROMEDIO</div>
                    <div className="st-stat-value">$14.200</div>
                    <div className="st-stat-sub">34 mesas cerradas</div>
                  </div>
                  <div className="st-preview-stat">
                    <div className="st-stat-label">COMANDAS ACTIVAS</div>
                    <div className="st-stat-value">8 en curso</div>
                    <div className="st-stat-sub">5 Salón / 3 WhatsApp</div>
                  </div>
                </div>

                {/* Split Working Pane (KDS & Live Orders) */}
                <div className="st-split-pane">
                  {/* Left: Live Orders Feed */}
                  <div>
                    <div className="st-pane-header">
                      <span className="st-stat-label" style={{ color: 'var(--st-text-main)' }}>COLA DE COCINA (KDS LIVE STREAM)</span>
                      <span className="st-stat-sub">4 PARTIDAS DESPACHANDO</span>
                    </div>

                    {/* Order Card 1 */}
                    <div className="st-order-card">
                      <div className="st-order-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: 'var(--st-text-main)' }}>MESA 12</strong>
                          <span className="st-badge-tag">SALÓN</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--st-primary)', fontWeight: 600, fontSize: '0.75rem' }}>06:14</span>
                          <span className="st-badge-tag" style={{ background: 'var(--st-primary-light)', color: 'var(--st-primary)', fontWeight: 700 }}>MARCHANDO</span>
                        </div>
                      </div>
                      <div className="st-order-items">
                        <div className="st-order-item-row">
                          <span>2× Bife de Chorizo Dry-Aged (Punto medio)</span>
                          <span className="st-badge-tag">GRILL</span>
                        </div>
                        <div className="st-order-item-row">
                          <span>1× Risotto de Hongos Silvestres</span>
                          <span className="st-badge-tag">PASTA</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Card 2 */}
                    <div className="st-order-card">
                      <div className="st-order-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: 'var(--st-text-main)' }}>#WA-4921</strong>
                          <span className="st-badge-tag" style={{ background: '#dfe2ec', color: '#181c23' }}>WHATSAPP DIRECTO</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--st-text-muted)', fontSize: '0.75rem' }}>02:40</span>
                          <span className="st-badge-tag">ENTRANTE</span>
                        </div>
                      </div>
                      <div className="st-order-items">
                        <div className="st-order-item-row">
                          <span>1× Smash Burger Doble Bacon + Papas Trufadas</span>
                          <span className="st-badge-tag">DELIVERY</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stock & Cost Ratios */}
                  <div className="st-cost-panel">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--st-border)' }}>
                        <span className="st-stat-label" style={{ color: 'var(--st-text-main)' }}>RENDIMIENTO &amp; RECETA ACTIVA</span>
                        <span className="st-stat-sub">COSTEO DINÁMICO</span>
                      </div>
                      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--st-text-muted)' }}>
                            <span>Costo Insumos Teórico</span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--st-text-main)', fontWeight: 600 }}>26.4%</span>
                          </div>
                          <div className="st-progress-bar-bg">
                            <div className="st-progress-bar-fill" style={{ width: '26.4%', background: 'var(--st-text-main)' }}></div>
                          </div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--st-text-muted)' }}>
                            <span>Margen de Contribución</span>
                            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--st-text-main)', fontWeight: 600 }}>73.6%</span>
                          </div>
                          <div className="st-progress-bar-bg">
                            <div className="st-progress-bar-fill" style={{ width: '73.6%', background: 'var(--st-primary)' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ paddingTop: '12px', borderTop: '1px solid var(--st-border)', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--st-text-muted)' }}>
                        <span>OFFLINE BUFFER: 0 PENDIENTES</span>
                        <span style={{ color: 'var(--st-text-main)', fontWeight: 600 }}>REPLICACIÓN: 4ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 3. TRUST METRICS ROW                                                */}
        {/* ==================================================================== */}
        <section className="st-trust-row">
          <div className="st-container">
            <div className="st-trust-grid">
              <div className="st-trust-col">
                <div className="st-trust-metric">0%</div>
                <div className="st-trust-desc">Comisiones por pedido</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--st-text-muted)', marginTop: '4px' }}>Cero intermediación forzada.</div>
              </div>
              <div className="st-trust-col">
                <div className="st-trust-metric">&lt; 12 seg</div>
                <div className="st-trust-desc">Por comanda emitida</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--st-text-muted)', marginTop: '4px' }}>Velocidad pura en salón.</div>
              </div>
              <div className="st-trust-col">
                <div className="st-trust-metric">100%</div>
                <div className="st-trust-desc">Operativo offline-first</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--st-text-muted)', marginTop: '4px' }}>Si cae internet, no frena.</div>
              </div>
              <div className="st-trust-col">
                <div className="st-trust-metric">RLS Strict</div>
                <div className="st-trust-desc">Aislamiento de bases</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--st-text-muted)', marginTop: '4px' }}>Aislamiento por sucursal.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 4. SUITE DE MÓDULOS                                                 */}
        {/* ==================================================================== */}
        <section className="st-section" id="modulos">
          <div className="st-container">
            <div className="st-section-head">
              <span className="st-section-tag">SUITE INTEGRAL</span>
              <h2 className="st-section-title">Módulos construidos para la exigencia del despacho</h2>
              <p className="st-section-subtitle">Herramientas especializadas que reemplazan múltiples servicios fragmentados.</p>
            </div>

            <div className="st-modules-grid">
              {/* Card 1: POS */}
              <div className="st-module-card">
                <div>
                  <div className="st-module-icon-wrap">
                    <IconPointOfSale size={20} />
                  </div>
                  <h3 className="st-module-title">Punto de Venta (POS)</h3>
                  <p className="st-module-desc">
                    Interfaz ultra rápida diseñada para pantallas táctiles. Admite cobros combinados inmediatos, división de cuentas por comensal y control de turnos ciegos para prevenir desvíos de caja.
                  </p>
                </div>
                <div className="st-module-footer">
                  <IconCheck size={14} />
                  <span>Sub-segundo en procesamiento</span>
                </div>
              </div>

              {/* Card 2: KDS */}
              <div className="st-module-card">
                <div>
                  <div className="st-module-icon-wrap">
                    <IconSoupKitchen size={20} />
                  </div>
                  <h3 className="st-module-title">Pantalla de Cocina (KDS)</h3>
                  <p className="st-module-desc">
                    Cronómetros y semáforos por partida operativa (grill, ensaladas, postres). Despacho ordenado, control auditado de demoras y erradicación definitiva de comanderas ruidosas de papel.
                  </p>
                </div>
                <div className="st-module-footer">
                  <IconCheck size={14} />
                  <span>Ruteo automático a estaciones</span>
                </div>
              </div>

              {/* Card 3: WhatsApp Bot */}
              <div className="st-module-card">
                <div>
                  <div className="st-module-icon-wrap">
                    <IconChat size={20} />
                  </div>
                  <h3 className="st-module-title">Bot WhatsApp 24/7</h3>
                  <p className="st-module-desc">
                    Canal de venta directo al cliente sin pasar por marketplaces. Menú interactivo con checkout automatizado, validación de pago y sincronización instantánea con el KDS.
                  </p>
                </div>
                <div className="st-module-footer">
                  <IconCheck size={14} />
                  <span>0% de comisiones por venta</span>
                </div>
              </div>

              {/* Card 4: QR Menu */}
              <div className="st-module-card">
                <div>
                  <div className="st-module-icon-wrap">
                    <IconQrScanner size={20} />
                  </div>
                  <h3 className="st-module-title">Carta Digital QR</h3>
                  <p className="st-module-desc">
                    Actualización inmediata de precios, etiquetas de alérgenos y fotografías de alta resolución. Ocultación automática de platos según existencias reales en stock.
                  </p>
                </div>
                <div className="st-module-footer">
                  <IconCheck size={14} />
                  <span>Cero retraso en propagación CDN</span>
                </div>
              </div>

              {/* Card 5: Inventory & Recipes */}
              <div className="st-module-card" style={{ gridColumn: 'span 2' }}>
                <div>
                  <div className="st-module-icon-wrap">
                    <IconInventory size={20} />
                  </div>
                  <h3 className="st-module-title">Control de Stock, Recetas &amp; Rendimiento</h3>
                  <p className="st-module-desc" style={{ maxWidth: '640px' }}>
                    Mise-en-place de precisión. Fichas técnicas de platos con desglose gramo a gramo, costeo dinámico según facturas de proveedores y disparo de alertas automáticas ante mermas no autorizadas.
                  </p>
                </div>
                <div className="st-module-footer" style={{ gap: '1.25rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--st-primary)' }}></span>
                    Costeo en tiempo real
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--st-text-main)' }}></span>
                    Subrecetas ilimitadas
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--st-text-muted)' }}></span>
                    Alerta de merma operativa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* ==================================================================== */}
        {/* 6. PRECIOS Y PLANES                                                 */}
        {/* ==================================================================== */}
        <section className="st-section" id="precios">
          <div className="st-container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
              <span className="st-section-tag">TARIFA PLANA Y FIJA</span>
              <h2 className="st-section-title">Planes diseñados para tu escala</h2>
              <p className="st-section-subtitle">Sin letra chica ni costos variables por volumen facturado.</p>

              {/* Billing Cycle Toggle */}
              <div className="st-pricing-toggle">
                <button
                  type="button"
                  className={`st-toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  className={`st-toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('annual')}
                >
                  <span>Anual</span>
                  <span className="st-badge-discount">2 MESES OFF</span>
                </button>
              </div>
            </div>

            <div className="st-plans-grid">
              {/* Plan 1 */}
              <div className="st-plan-card">
                <div>
                  <span className="st-stat-label">INICIAL</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--st-text-main)', marginTop: '4px' }}>Mostrador &amp; Delivery</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--st-text-muted)', marginTop: '6px' }}>
                    Para locales de despacho ágil, cafeterías de especialidad y dark kitchens.
                  </p>
                  <div style={{ margin: '1.25rem 0' }}>
                    <span className="st-plan-price-num">
                      {billingCycle === 'annual' ? '$15.000' : '$18.000'}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--st-text-muted)' }}>/mes</span>
                  </div>
                  <ul className="st-plan-bullets">
                    <li className="st-plan-bullet-item">
                      <IconCheck size={14} />
                      <span>POS táctil de mostrador ilimitado</span>
                    </li>
                    <li className="st-plan-bullet-item">
                      <IconCheck size={14} />
                      <span>Gestión de delivery propio y caja</span>
                    </li>
                    <li className="st-plan-bullet-item">
                      <IconCheck size={14} />
                      <span>Carta QR estándar con actualización</span>
                    </li>
                    <li className="st-plan-bullet-item">
                      <IconCheck size={14} />
                      <span>Modo offline-first continuo</span>
                    </li>
                  </ul>
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <button 
                    type="button" 
                    className="st-btn-outline" 
                    style={{ width: '100%' }}
                    onClick={onOpenDemo}
                  >
                    Elegir Inicial
                  </button>
                </div>
              </div>

              {/* Plan 2 (Featured Pro) */}
              <div className="st-plan-card featured">
                <div className="st-plan-badge-top">MÁS ELEGIDO</div>
                <div>
                  <span className="st-stat-label">PROFESIONAL</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--st-text-main)', marginTop: '4px' }}>Salón, Cocina KDS &amp; Bot</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--st-text-muted)', marginTop: '6px' }}>
                    La estación completa para restaurantes de servicio completo con salón.
                  </p>
                  <div style={{ margin: '1.25rem 0' }}>
                    <span className="st-plan-price-num">
                      {billingCycle === 'annual' ? '$23.300' : '$28.000'}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--st-text-muted)' }}>/mes</span>
                  </div>
                  <ul className="st-plan-bullets">
                    <li className="st-plan-bullet-item" style={{ color: 'var(--st-text-main)', fontWeight: 500 }}>
                      <IconCheck size={14} style={{ color: 'var(--st-primary)' }} />
                      <span>Todo lo incluido en Plan Inicial</span>
                    </li>
                    <li className="st-plan-bullet-item">
                      <IconCheck size={14} />
                      <span>Pantalla KDS multi-partida ilimitada</span>
                    </li>
                    <li className="st-plan-bullet-item">
                      <IconCheck size={14} />
                      <span>Bot de pedidos por WhatsApp 24/7</span>
                    </li>
                    <li className="st-plan-bullet-item">
                      <IconCheck size={14} />
                      <span>Mapa de salón interactivo por mozo</span>
                    </li>
                    <li className="st-plan-bullet-item">
                      <IconCheck size={14} />
                      <span>Escandallo de recetas e inventario</span>
                    </li>
                  </ul>
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <button 
                    type="button" 
                    className="st-btn-dark" 
                    style={{ width: '100%' }}
                    onClick={onOpenDemo}
                  >
                    Iniciar prueba Pro
                  </button>
                </div>
              </div>

              {/* Plan 3 */}
              <div className="st-plan-card">
                <div>
                  <span className="st-stat-label">CORPORATIVO</span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--st-text-main)', marginTop: '4px' }}>Franquicias &amp; Grupos</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--st-text-muted)', marginTop: '6px' }}>
                    Visión consolidada multi-sucursal con permisos segregados y centros de costos.
                  </p>
                  <div style={{ margin: '1.25rem 0' }}>
                    <span className="st-plan-price-num">
                      {billingCycle === 'annual' ? '$31.500' : '$38.000'}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--st-text-muted)' }}>/mes por sucursal</span>
                  </div>
                  <ul className="st-plan-bullets">
                    <li className="st-plan-bullet-item" style={{ color: 'var(--st-text-main)', fontWeight: 500 }}>
                      <IconCheck size={14} style={{ color: 'var(--st-primary)' }} />
                      <span>Todo lo incluido en Plan Pro</span>
                    </li>
                    <li className="st-plan-bullet-item">
                      <IconCheck size={14} />
                      <span>Panel consolidado de métricas multi-local</span>
                    </li>
                    <li className="st-plan-bullet-item">
                      <IconCheck size={14} />
                      <span>Gestión centralizada de cartas y recetas</span>
                    </li>
                    <li className="st-plan-bullet-item">
                      <IconCheck size={14} />
                      <span>API de integración contable &amp; ERP</span>
                    </li>
                    <li className="st-plan-bullet-item">
                      <IconCheck size={14} />
                      <span>Soporte prioritario con SLA 99.9%</span>
                    </li>
                  </ul>
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <button 
                    type="button" 
                    className="st-btn-outline" 
                    style={{ width: '100%' }}
                    onClick={onOpenDemo}
                  >
                    Contactar Ventas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ==================================================================== */}
        {/* 8. PREGUNTAS FRECUENTES (FAQ)                                       */}
        {/* ==================================================================== */}
        <section className="st-section" id="faq">
          <div className="st-container" style={{ maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span className="st-section-tag">RESOLUCIÓN DE DUDAS</span>
              <h2 className="st-section-title">Preguntas Frecuentes</h2>
            </div>

            <div className="st-faq-wrap">
              {/* FAQ 1 */}
              <div className="st-faq-item">
                <div 
                  className="st-faq-question"
                  onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
                >
                  <span>¿Qué ocurre si se corta la conexión a internet durante el servicio?</span>
                  <div style={{ transform: openFaqIndex === 0 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--st-text-muted)' }}>
                    <IconChevronDown size={18} />
                  </div>
                </div>
                {openFaqIndex === 0 && (
                  <p className="st-faq-answer">
                    Absolutamente nada se interrumpe. ComandaSaaS fue concebido bajo arquitectura offline-first. Las comandas siguen saliendo a cocina, las mesas se pueden abrir y cerrar, y los tickets fiscales se guardan en la memoria local del terminal hasta que vuelva la conectividad para sincronizarse con la nube.
                  </p>
                )}
              </div>

              {/* FAQ 2 */}
              <div className="st-faq-item">
                <div 
                  className="st-faq-question"
                  onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
                >
                  <span>¿Necesito comprar hardware o terminales especiales?</span>
                  <div style={{ transform: openFaqIndex === 1 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--st-text-muted)' }}>
                    <IconChevronDown size={18} />
                  </div>
                </div>
                {openFaqIndex === 1 && (
                  <p className="st-faq-answer">
                    No. ComandaSaaS funciona en navegadores web modernos y es compatible con tablets iPad o Android, pantallas táctiles all-in-one, computadoras con Windows/Mac/Linux y comandatarios móviles de cualquier marca. Además, se integra con impresoras térmicas estándar USB, Ethernet y Bluetooth.
                  </p>
                )}
              </div>

              {/* FAQ 3 */}
              <div className="st-faq-item">
                <div 
                  className="st-faq-question"
                  onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
                >
                  <span>¿Cobran algún porcentaje sobre los pedidos de WhatsApp o salón?</span>
                  <div style={{ transform: openFaqIndex === 2 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--st-text-muted)' }}>
                    <IconChevronDown size={18} />
                  </div>
                </div>
                {openFaqIndex === 2 && (
                  <p className="st-faq-answer">
                    No. Mantenemos una política estricta de 0% comisiones. El cobro es una suscripción mensual fija sin importar si facturas cien mil pesos o cien millones de pesos al mes.
                  </p>
                )}
              </div>

              {/* FAQ 4 */}
              <div className="st-faq-item">
                <div 
                  className="st-faq-question"
                  onClick={() => setOpenFaqIndex(openFaqIndex === 3 ? null : 3)}
                >
                  <span>¿Cuánto tiempo toma migrar desde otro software gastronómico?</span>
                  <div style={{ transform: openFaqIndex === 3 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', color: 'var(--st-text-muted)' }}>
                    <IconChevronDown size={18} />
                  </div>
                </div>
                {openFaqIndex === 3 && (
                  <p className="st-faq-answer">
                    Nuestro equipo de onboarding importa tu carta, stock y recetas en menos de 48 horas mediante plantillas estructuradas o conexión API directa, capacitando a mozos y cocina en una sola sesión de 45 minutos.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* 9. FINAL CTA STRIP                                                  */}
        {/* ==================================================================== */}
        <section className="st-final-cta" id="demo">
          <div className="st-container">
            <div className="st-final-cta-inner">
              <div>
                <span className="st-stat-label" style={{ color: '#a0a0a0' }}>DESPLIEGUE RÁPIDO</span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 600, color: '#ffffff', margin: '4px 0 6px' }}>
                  Llevá la precisión operativa a tu cocina hoy
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#c0c0c0', margin: 0 }}>
                  Sin contratos forzados. Activación en 24 horas.
                </p>
                {leadStatus && (
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#4ade80' }}>
                    {leadStatus}
                  </div>
                )}
              </div>

              <form className="st-final-cta-input-group" onSubmit={handleLeadSubmit}>
                <input 
                  type="email"
                  className="st-final-cta-input"
                  placeholder="tu@restaurante.com"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                />
                <button type="submit" className="st-btn-primary" style={{ whiteSpace: 'nowrap', padding: '9px 16px' }}>
                  Solicitar Demo
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* ==================================================================== */}
      {/* 10. FOOTER                                                          */}
      {/* ==================================================================== */}
      <footer className="st-footer">
        <div className="st-container">
          <div className="st-footer-grid">
            {/* Brand Col */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div className="st-logo-icon" style={{ width: '22px', height: '22px' }}>
                  <IconGridView size={12} />
                </div>
                <span className="st-logo-text" style={{ fontSize: '1rem' }}>ComandaSaaS</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--st-text-muted)', lineHeight: 1.6, maxWidth: '280px', marginBottom: '14px' }}>
                High-velocity culinary engineering. Infraestructura digital para restaurantes, dark kitchens y franquicias gastronómicas.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--st-text-muted)' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--st-emerald)' }}></span>
                <span>System Status: Operational</span>
              </div>
            </div>

            {/* Links 1 */}
            <div>
              <div className="st-footer-col-title">Arquitectura</div>
              <ul className="st-footer-list">
                <li><a href="#modulos">Platform Architecture</a></li>
                <li><a href="#modulos">Recipe Engineering</a></li>
                <li><a href="#precios">Planes y Precios</a></li>
                <li><a href="#faq">Preguntas Frecuentes</a></li>
              </ul>
            </div>

            {/* Links 2 */}
            <div>
              <div className="st-footer-col-title">Recursos</div>
              <ul className="st-footer-list">
                <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenDemo(); }}>API Documentation</a></li>
                <li><a href="#precios">Tarifas y Escala</a></li>
                <li><a href="#faq">Centro de Ayuda</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenDemo(); }}>Changelog</a></li>
              </ul>
            </div>

            {/* Links 3 */}
            <div>
              <div className="st-footer-col-title">Legal &amp; Control</div>
              <ul className="st-footer-list">
                <li><a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Acuerdo de Confidencialidad</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setIsStoreModalOpen(true); }}>Contacto Corporativo</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright bar */}
          <div style={{ paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: 'var(--st-text-muted)' }}>
            <div>
              © 2025 ComandaSaaS Inc. High-velocity culinary engineering. All rights reserved.
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
              DEPLOYED: VER_4.18.2 / REGION_SA_EAST
            </div>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* 11. STORE ACCESS MODAL                                               */}
      {/* ==================================================================== */}
      {isStoreModalOpen && (
        <div 
          className="st-modal-backdrop" 
          role="dialog"
          aria-modal="true"
          aria-labelledby="st-modal-title"
          onClick={() => setIsStoreModalOpen(false)}
        >
          <div 
            className="st-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="st-modal-header">
              <h3 id="st-modal-title" className="st-modal-title">
                Acceso a Terminal de Comercio
              </h3>
              <button 
                type="button" 
                className="st-modal-close-btn"
                onClick={() => setIsStoreModalOpen(false)}
                aria-label="Cerrar modal"
              >
                <IconClose size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--st-text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Ingresa el identificador único o slug de tu restaurante para abrir el terminal POS y panel de cocina.
            </p>

            <form onSubmit={handleStoreSubmit}>
              <div className="st-form-group">
                <label htmlFor="store-slug-input" className="st-form-label">
                  Identificador de Comercio (Slug)
                </label>
                <input 
                  id="store-slug-input"
                  type="text"
                  className="st-form-input"
                  placeholder="ej. fast-burger, demo"
                  value={storeInputSlug}
                  onChange={(e) => {
                    setStoreInputSlug(e.target.value);
                    if (storeInputError) setStoreInputError('');
                  }}
                  autoFocus
                />
                {storeInputError && (
                  <div className="st-form-error">{storeInputError}</div>
                )}
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--st-text-muted)', marginBottom: '6px' }}>
                Locales de prueba rápida:
              </div>
              <div className="st-modal-presets">
                <button
                  type="button"
                  className="st-preset-chip"
                  onClick={() => setStoreInputSlug(DEFAULT_DEMO_STORE || 'demo')}
                >
                  ⚡ demo
                </button>
                <button
                  type="button"
                  className="st-preset-chip"
                  onClick={() => setStoreInputSlug('fast-burger')}
                >
                  🍔 fast-burger
                </button>
                <button
                  type="button"
                  className="st-preset-chip"
                  onClick={() => setStoreInputSlug('la-trattoria')}
                >
                  🍕 la-trattoria
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="st-btn-ghost"
                  onClick={() => setIsStoreModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="st-btn-primary"
                >
                  Ingresar al Local
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 12. STICKY MOBILE BOTTOM BAR (Native Mobile Ergonomics)             */}
      {/* ==================================================================== */}
      <aside className="st-mobile-bottom-bar" aria-label="Acciones rápidas móviles">
        <button 
          type="button" 
          className="st-btn-outline"
          onClick={() => setIsStoreModalOpen(true)}
        >
          <IconStore size={16} />
          <span>Mi Local</span>
        </button>
        <button 
          type="button" 
          className="st-btn-dark"
          onClick={onOpenDemo}
        >
          <span>Empezar Demo</span>
          <IconArrowRight size={16} />
        </button>
      </aside>
    </div>
  );
}
