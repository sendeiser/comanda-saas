import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, Bot, BarChart3, DollarSign, ShieldAlert, Sparkles, LogOut, 
  ArrowLeft, Download, Calendar, Printer, Database, Smartphone,
  ChevronLeft, ChevronRight, ChevronDown, Check, Sun, Moon, RefreshCw
} from 'lucide-react';
import AuditKpisTab from './AuditKpisTab';
import AuditCashShiftsTab from './AuditCashShiftsTab';
import AuditSecurityTab from './AuditSecurityTab';
import AuditMenuAnalytics from './AuditMenuAnalytics';
import AuditSecuritySettings from './AuditSecuritySettings';
import AdminWhatsAppBot from './bot/AdminWhatsAppBot';
import AdminDatabaseTablesTab from './database/AdminDatabaseTablesTab';
import StoreOnboardingWizard from './onboarding/StoreOnboardingWizard.jsx';
import { Store, Plus, Building2 } from 'lucide-react';
import { auditService } from '../../services/auditService';
import { storageService } from '../../services/storageService';
import { supabaseSync } from '../../services/supabaseClient';
import { authService } from '../../services/authService';
import { getActiveStore } from '../../services/storeService';

export default function OwnerAuditPortal({ orders = [], onBackToPos, onLogout, theme, onToggleTheme, onRefreshSystem }) {
  const portalRef = useRef(null);
  const [activeTab, setActiveTab] = useState('kpis'); // 'kpis' | 'shifts' | 'security' | 'menu' | 'settings' | 'bot' | 'database'
  const [botSubTab, setBotSubTab] = useState('connection'); // 'connection' | 'security' | 'templates' | 'flows'
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const active = getActiveStore();
      if (!active) return false;
      if (active.slug === 'comandafast-demo' || active.slug === 'demo') return false;
      const done = localStorage.getItem('cf_onboarding_completed_' + (active.id || active.slug));
      return done !== 'true' && !active.onboardingCompleted;
    } catch (_) {
      return false;
    }
  });

  // Sidebar collapse state (persisted in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('cf_admin_sidebar_collapsed') === 'true';
    } catch (_) {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('cf_admin_sidebar_collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };

  // Mobile coupled accordion state
  const [isMobileAccordionOpen, setIsMobileAccordionOpen] = useState(false);

  const handleOpenBot = (subTab = 'connection') => {
    setBotSubTab(subTab);
    setActiveTab('bot');
    setIsMobileAccordionOpen(false);
  };

  // Al cambiar de pestaña, asegurar que la vista comience siempre arriba y colapsar acordeón móvil
  useEffect(() => {
    if (portalRef.current) {
      portalRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    setIsMobileAccordionOpen(false);
  }, [activeTab]);

  const [rangeType, setRangeType] = useState('today'); // 'today' | 'yesterday' | 'week' | 'month' | 'custom' | 'all'
  const [selectedShiftId, setSelectedShiftId] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Turnos históricos y pedidos cancelados reactivos
  const [shifts, setShifts] = useState(() => storageService.getCashShiftsHistory());
  const [cancelledOrders, setCancelledOrders] = useState(() => storageService.getCancelledOrders());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setShifts(storageService.getCashShiftsHistory());
      setCancelledOrders(storageService.getCancelledOrders());
    };
    window.addEventListener('comandafast:shifts_updated', handleUpdate);
    window.addEventListener('comandafast:cash-shift-change', handleUpdate);
    window.addEventListener('comandafast:orders_updated', handleUpdate);
    window.addEventListener('comandafast:system_refreshed', handleUpdate);

    if (supabaseSync && supabaseSync.isConfigured()) {
      supabaseSync.fetchCashShifts(50).then(cloudShifts => {
        if (Array.isArray(cloudShifts) && cloudShifts.length > 0) {
          const merged = storageService.syncCashShiftsFromCloud(cloudShifts);
          setShifts(merged);
        }
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('comandafast:shifts_updated', handleUpdate);
      window.removeEventListener('comandafast:cash-shift-change', handleUpdate);
      window.removeEventListener('comandafast:orders_updated', handleUpdate);
      window.removeEventListener('comandafast:system_refreshed', handleUpdate);
    };
  }, []);

  // Quick escape back to POS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onBackToPos) {
        // Only if no modal input is active
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          onBackToPos();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToPos]);

  const handleRefreshSystem = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setRefreshSuccess(false);

    try {
      if (onRefreshSystem) {
        await onRefreshSystem();
      } else {
        if (supabaseSync && supabaseSync.isConfigured()) {
          const cloudShifts = await supabaseSync.fetchCashShifts(50);
          if (Array.isArray(cloudShifts) && cloudShifts.length > 0) {
            storageService.syncCashShiftsFromCloud(cloudShifts);
          }
        }
        window.dispatchEvent(new CustomEvent('comandafast:orders_updated'));
        window.dispatchEvent(new CustomEvent('comandafast:shifts_updated'));
      }
      setShifts(storageService.getCashShiftsHistory());
      setCancelledOrders(storageService.getCancelledOrders());
      setRefreshSuccess(true);
      setTimeout(() => {
        setRefreshSuccess(false);
      }, 2500);
    } catch (err) {
      console.error('Error al recargar el sistema:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Turno específico seleccionado (si aplica)
  const selectedShift = useMemo(() => {
    if (!selectedShiftId || selectedShiftId === 'all') return null;
    return shifts.find(s => s.id === selectedShiftId) || null;
  }, [shifts, selectedShiftId]);

  // Filtrado reactivo de órdenes (por turno específico o por período de fechas)
  const filteredOrders = useMemo(() => {
    if (selectedShift) {
      return auditService.filterOrdersByShift(orders, selectedShift);
    }
    return auditService.filterOrdersByRange(orders, rangeType, customStart, customEnd);
  }, [orders, selectedShift, rangeType, customStart, customEnd]);

  // Cálculos consolidados
  const kpis = useMemo(() => {
    const relevantShifts = selectedShift ? [selectedShift] : shifts;
    return auditService.calculateFinancialKpis(filteredOrders, relevantShifts);
  }, [filteredOrders, selectedShift, shifts]);

  // Analítica de productos
  const productAnalytics = useMemo(() => {
    return auditService.getProductAnalytics(filteredOrders);
  }, [filteredOrders]);

  const user = authService.getCurrentUser();

  const handleExportOrders = () => {
    auditService.exportOrdersToCsv(filteredOrders);
  };

  const handleExportShifts = () => {
    auditService.exportShiftsToCsv(shifts);
  };

  // Definición unificada de módulos de navegación
  const navItems = useMemo(() => [
    {
      id: 'kpis',
      label: 'Métricas Financieras',
      shortLabel: 'Métricas',
      icon: BarChart3,
      badge: null,
      badgeColor: null
    },
    {
      id: 'shifts',
      label: 'Auditoría de Cajas',
      shortLabel: 'Cajas',
      icon: DollarSign,
      badge: shifts.length > 0 ? shifts.length : null,
      badgeColor: 'var(--accent-amber)'
    },
    {
      id: 'security',
      label: 'Control Antifraude',
      shortLabel: 'Antifraude',
      icon: ShieldAlert,
      badge: cancelledOrders.length > 0 ? cancelledOrders.length : null,
      badgeColor: cancelledOrders.length > 0 ? 'var(--accent-rose)' : null
    },
    {
      id: 'menu',
      label: 'Ranking de Menú',
      shortLabel: 'Menú',
      icon: Sparkles,
      badge: null,
      badgeColor: null
    },
    {
      id: 'bot',
      label: 'Bot WhatsApp',
      shortLabel: 'Bot WA',
      icon: Bot,
      badge: 'IA',
      badgeColor: 'var(--accent-emerald)'
    },
    {
      id: 'database',
      label: 'Tablas BD',
      shortLabel: 'Tablas',
      icon: Database,
      badge: null,
      badgeColor: null
    },
    {
      id: 'settings',
      label: 'Seguridad Dueño',
      shortLabel: 'Seguridad',
      icon: ShieldCheck,
      badge: null,
      badgeColor: null
    }
  ], [shifts.length, cancelledOrders.length]);

  const currentNavItem = useMemo(() => {
    return navItems.find(item => item.id === activeTab) || navItems[0];
  }, [navItems, activeTab]);

  const CurrentNavIcon = currentNavItem.icon;

  return (
    <div ref={portalRef} className="admin-portal-wrapper" style={{ overflowY: 'auto', paddingRight: '2px' }}>
      {/* EXECUTIVE HEADER */}
      <div 
        className="executive-header tactile-card"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px solid var(--accent-amber)',
            boxShadow: '0 0 16px var(--accent-amber-glow)',
            flexShrink: 0
          }}>
            <ShieldCheck size={26} style={{ color: 'var(--accent-amber)' }} />
          </div>

          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>Panel de Auditoría & Control del Dueño</span>
              <span style={{ 
                fontSize: '0.68rem', 
                background: 'rgba(16, 185, 129, 0.18)', 
                color: 'var(--accent-emerald)', 
                border: '1px solid var(--border-emerald-highlight)',
                padding: '2px 8px', 
                borderRadius: 'var(--radius-full)', 
                fontWeight: 900,
                letterSpacing: '0.5px'
              }}>
                SESIÓN ACTIVA
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Titular: <strong style={{ color: 'var(--text-primary)' }}>{user?.user || 'Dueño'}</strong> • Centro Financiero & Auditoría
            </div>
          </div>
        </div>

        {/* Right side of header: Clean CRM Dock Toggle Button & Active Module Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            className="admin-header-crm-badge tactile-btn"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expandir menú CRM" : "Compactar menú CRM"}
          >
            <CurrentNavIcon size={16} />
            <span>Módulo: <strong>{currentNavItem.shortLabel || currentNavItem.label}</strong></span>
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* ADMIN PORTAL MAIN BODY */}
      <div className="admin-portal-layout">
        {/* DESKTOP COLLAPSIBLE CRM SIDEBAR (DOCK LEFT) */}
        <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}>
          <div className="admin-sidebar-header">
            {!isSidebarCollapsed && (
              <span className="admin-sidebar-header-title">MENÚ CRM</span>
            )}
            <button
              type="button"
              className="admin-sidebar-toggle-btn tactile-btn"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? "Expandir menú CRM" : "Compactar menú CRM"}
              aria-label={isSidebarCollapsed ? "Expandir menú CRM" : "Compactar menú CRM"}
            >
              {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Módulos */}
          {!isSidebarCollapsed && (
            <span className="admin-sidebar-section-title">Módulos</span>
          )}

          <nav className="admin-sidebar-nav">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-sidebar-item tactile-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <div className="admin-sidebar-item-icon-wrap">
                    <Icon size={18} />
                    {isSidebarCollapsed && item.badge !== null && (
                      <span 
                        className="admin-sidebar-dot-badge" 
                        style={{ background: item.badgeColor || 'var(--accent-amber)' }}
                        title={`${item.label}: ${item.badge}`}
                      />
                    )}
                  </div>

                  {!isSidebarCollapsed && (
                    <span className="admin-sidebar-item-label">{item.label}</span>
                  )}

                  {!isSidebarCollapsed && item.badge !== null && (
                    <span 
                      className="admin-nav-item-badge"
                      style={{ 
                        backgroundColor: item.badgeColor ? `${item.badgeColor}22` : 'rgba(245, 158, 11, 0.15)',
                        color: item.badgeColor || 'var(--accent-amber)',
                        borderColor: item.badgeColor ? `${item.badgeColor}44` : 'rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Acciones de Local */}
          <div className="admin-sidebar-section-divider" />
          {!isSidebarCollapsed && (
            <span className="admin-sidebar-section-title">Acciones</span>
          )}

          <button
            type="button"
            className="admin-sidebar-action-btn tactile-btn"
            onClick={() => setShowOnboarding(true)}
            title={isSidebarCollapsed ? "Nuevo Comercio (+)" : undefined}
          >
            <div className="admin-sidebar-item-icon-wrap">
              <Plus size={17} style={{ color: 'var(--accent-amber)' }} />
            </div>
            {!isSidebarCollapsed && (
              <span className="admin-sidebar-item-label">+ Nuevo Comercio</span>
            )}
          </button>

          <button
            type="button"
            className="admin-sidebar-action-btn tactile-btn"
            onClick={handleRefreshSystem}
            disabled={isRefreshing}
            title={isSidebarCollapsed ? "Actualizar BD y Sincronizar" : undefined}
          >
            <div className="admin-sidebar-item-icon-wrap">
              {refreshSuccess ? (
                <Check size={17} style={{ color: 'var(--accent-emerald)' }} />
              ) : (
                <RefreshCw size={17} className={isRefreshing ? 'cf-spin' : ''} style={{ color: 'var(--accent-emerald)' }} />
              )}
            </div>
            {!isSidebarCollapsed && (
              <span className="admin-sidebar-item-label">
                {isRefreshing ? 'Actualizando...' : refreshSuccess ? '¡Actualizado!' : 'Actualizar BD'}
              </span>
            )}
          </button>

          <button
            type="button"
            className="admin-sidebar-action-btn tactile-btn"
            onClick={() => handleOpenBot('connection')}
            title={isSidebarCollapsed ? "Conexión WhatsApp Bot" : undefined}
          >
            <div className="admin-sidebar-item-icon-wrap">
              <Bot size={17} style={{ color: 'var(--accent-emerald)' }} />
            </div>
            {!isSidebarCollapsed && (
              <span className="admin-sidebar-item-label">Conexión Bot</span>
            )}
          </button>

          <button
            type="button"
            className="admin-sidebar-action-btn tactile-btn"
            onClick={() => handleOpenBot('security')}
            title={isSidebarCollapsed ? "Seguridad & Anti-Spam WA" : undefined}
          >
            <div className="admin-sidebar-item-icon-wrap">
              <ShieldAlert size={17} style={{ color: 'var(--accent-amber)' }} />
            </div>
            {!isSidebarCollapsed && (
              <span className="admin-sidebar-item-label">Anti-Spam WA</span>
            )}
          </button>

          {/* Sistema & Sesión */}
          <div className="admin-sidebar-section-divider" />
          {!isSidebarCollapsed && (
            <span className="admin-sidebar-section-title">Sistema</span>
          )}

          {onToggleTheme && (
            <button
              type="button"
              className="admin-sidebar-action-btn tactile-btn"
              onClick={onToggleTheme}
              title={isSidebarCollapsed ? (theme === 'dark' ? "Modo Claro" : "Modo Oscuro") : undefined}
            >
              <div className="admin-sidebar-item-icon-wrap">
                {theme === 'dark' ? (
                  <Sun size={17} style={{ color: 'var(--accent-amber)' }} />
                ) : (
                  <Moon size={17} style={{ color: 'var(--accent-amber)' }} />
                )}
              </div>
              {!isSidebarCollapsed && (
                <span className="admin-sidebar-item-label">
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                </span>
              )}
            </button>
          )}

          {onBackToPos && (
            <button
              type="button"
              className="admin-sidebar-action-btn tactile-btn"
              onClick={onBackToPos}
              title={isSidebarCollapsed ? "Volver al POS (Esc)" : undefined}
            >
              <div className="admin-sidebar-item-icon-wrap">
                <ArrowLeft size={17} />
              </div>
              {!isSidebarCollapsed && (
                <span className="admin-sidebar-item-label">Volver al POS</span>
              )}
            </button>
          )}

          {onLogout && (
            <button
              type="button"
              className="admin-sidebar-action-btn btn-danger tactile-btn"
              onClick={onLogout}
              title={isSidebarCollapsed ? "Cerrar Sesión" : undefined}
            >
              <div className="admin-sidebar-item-icon-wrap">
                <LogOut size={17} style={{ color: 'var(--accent-rose)' }} />
              </div>
              {!isSidebarCollapsed && (
                <span className="admin-sidebar-item-label" style={{ color: 'var(--accent-rose)' }}>
                  Cerrar Sesión
                </span>
              )}
            </button>
          )}

          {!isSidebarCollapsed && (
            <div className="admin-sidebar-footer">
              <span className="admin-sidebar-footer-text">ComandaFast CRM v2.0</span>
            </div>
          )}
        </aside>

        {/* MAIN VIEWPORT (RIGHT) */}
        <div className="admin-main-viewport">
          {/* MOBILE COUPLED ACCORDION NAVIGATION */}
          <div className="admin-mobile-accordion-container">
            <button
              type="button"
              className={`admin-mobile-accordion-trigger tactile-btn ${isMobileAccordionOpen ? 'active' : ''}`}
              onClick={() => setIsMobileAccordionOpen(prev => !prev)}
              aria-expanded={isMobileAccordionOpen}
            >
              <div className="admin-accordion-trigger-left">
                <div className="admin-accordion-icon-box">
                  <CurrentNavIcon size={18} style={{ color: 'var(--accent-amber)' }} />
                </div>
                <div className="admin-accordion-meta">
                  <span className="admin-accordion-subtitle">Módulo activo</span>
                  <div className="admin-accordion-title-wrap">
                    <span className="admin-accordion-title">{currentNavItem.label}</span>
                    {currentNavItem.badge !== null && (
                      <span 
                        className="admin-nav-item-badge"
                        style={{ 
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          backgroundColor: currentNavItem.badgeColor ? `${currentNavItem.badgeColor}22` : 'rgba(245, 158, 11, 0.15)',
                          color: currentNavItem.badgeColor || 'var(--accent-amber)',
                          borderColor: currentNavItem.badgeColor ? `${currentNavItem.badgeColor}44` : 'rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        {currentNavItem.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-accordion-trigger-right">
                <span className="admin-accordion-hint">Navegar</span>
                <ChevronDown 
                  size={18} 
                  className={`admin-accordion-chevron ${isMobileAccordionOpen ? 'rotated' : ''}`} 
                />
              </div>
            </button>

            {/* Accordion Unfolded Menu (Coupled) */}
            <div className={`admin-mobile-accordion-content ${isMobileAccordionOpen ? 'expanded' : ''}`}>
              <div className="admin-mobile-accordion-list">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`admin-accordion-item-btn tactile-btn ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileAccordionOpen(false);
                      }}
                    >
                      <div className="admin-accordion-item-main">
                        <Icon size={18} className="admin-accordion-item-icon" />
                        <span className="admin-accordion-item-text">{item.label}</span>
                      </div>

                      <div className="admin-accordion-item-end">
                        {item.badge !== null && (
                          <span 
                            className="admin-nav-item-badge"
                            style={{ 
                              fontSize: '0.68rem',
                              padding: '1px 6px',
                              backgroundColor: item.badgeColor ? `${item.badgeColor}22` : 'rgba(245, 158, 11, 0.15)',
                              color: item.badgeColor || 'var(--accent-amber)',
                              borderColor: item.badgeColor ? `${item.badgeColor}44` : 'rgba(245, 158, 11, 0.3)'
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && (
                          <Check size={16} style={{ color: 'var(--accent-amber)' }} />
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Mobile Acciones de Local */}
                <div className="admin-sidebar-section-divider" style={{ margin: '0.5rem 0 0.25rem' }} />
                <span className="admin-sidebar-section-title">Acciones de Local</span>

                <button
                  type="button"
                  className="admin-sidebar-action-btn tactile-btn"
                  onClick={() => {
                    setShowOnboarding(true);
                    setIsMobileAccordionOpen(false);
                  }}
                >
                  <Plus size={16} style={{ color: 'var(--accent-amber)' }} />
                  <span>+ Nuevo Comercio</span>
                </button>

                <button
                  type="button"
                  className="admin-sidebar-action-btn tactile-btn"
                  onClick={() => {
                    handleRefreshSystem();
                    setIsMobileAccordionOpen(false);
                  }}
                  disabled={isRefreshing}
                >
                  {refreshSuccess ? (
                    <Check size={16} style={{ color: 'var(--accent-emerald)' }} />
                  ) : (
                    <RefreshCw size={16} className={isRefreshing ? 'cf-spin' : ''} style={{ color: 'var(--accent-emerald)' }} />
                  )}
                  <span>{isRefreshing ? 'Actualizando...' : refreshSuccess ? '¡BD Actualizada!' : 'Actualizar BD'}</span>
                </button>

                <button
                  type="button"
                  className="admin-sidebar-action-btn tactile-btn"
                  onClick={() => handleOpenBot('connection')}
                >
                  <Bot size={16} style={{ color: 'var(--accent-emerald)' }} />
                  <span>Conexión Bot</span>
                </button>

                <button
                  type="button"
                  className="admin-sidebar-action-btn tactile-btn"
                  onClick={() => handleOpenBot('security')}
                >
                  <ShieldAlert size={16} style={{ color: 'var(--accent-amber)' }} />
                  <span>Anti-Spam WA</span>
                </button>

                {/* Mobile Sistema & Sesión */}
                <div className="admin-sidebar-section-divider" style={{ margin: '0.5rem 0 0.25rem' }} />
                <span className="admin-sidebar-section-title">Sistema</span>

                {onToggleTheme && (
                  <button
                    type="button"
                    className="admin-sidebar-action-btn tactile-btn"
                    onClick={() => {
                      onToggleTheme();
                      setIsMobileAccordionOpen(false);
                    }}
                  >
                    {theme === 'dark' ? <Sun size={16} style={{ color: 'var(--accent-amber)' }} /> : <Moon size={16} style={{ color: 'var(--accent-amber)' }} />}
                    <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                  </button>
                )}

                {onBackToPos && (
                  <button
                    type="button"
                    className="admin-sidebar-action-btn tactile-btn"
                    onClick={() => {
                      setIsMobileAccordionOpen(false);
                      onBackToPos();
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Volver al POS</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    type="button"
                    className="admin-sidebar-action-btn btn-danger tactile-btn"
                    onClick={() => {
                      setIsMobileAccordionOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={16} style={{ color: 'var(--accent-rose)' }} />
                    <span style={{ color: 'var(--accent-rose)' }}>Cerrar Sesión</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TOOLBAR: DATE FILTER & EXPORT BUTTONS (Para módulos de Auditoría de Cajas, Seguridad y Menú) */}
          {activeTab !== 'bot' && activeTab !== 'database' && activeTab !== 'kpis' && (
            <div 
              className="admin-period-bar tactile-card"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              {/* Date Filter Pills */}
              <div 
                className="scrollable-tabs-bar" 
                style={{ 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  flex: 1, 
                  minWidth: 0,
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none'
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                  <Calendar size={15} style={{ color: 'var(--accent-amber)' }} /> Período:
                </span>
                {[
                  { id: 'today', label: 'Hoy' },
                  { id: 'yesterday', label: 'Ayer' },
                  { id: 'week', label: 'Últimos 7 Días' },
                  { id: 'month', label: 'Este Mes' },
                  { id: 'all', label: 'Histórico' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    className={`cat-pill-btn tactile-btn ${rangeType === r.id ? 'active' : ''}`}
                    style={{ fontSize: '0.78rem', height: '32px', padding: '0.35rem 0.75rem', flexShrink: 0, whiteSpace: 'nowrap' }}
                    onClick={() => setRangeType(r.id)}
                  >
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>

              {/* CSV Export Button */}
              <button
                type="button"
                className="btn-confirm-order tactile-btn"
                style={{ width: 'auto', height: '36px', fontSize: '0.85rem', padding: '0 1rem', gap: '6px', flexShrink: 0 }}
                onClick={handleExportOrders}
              >
                <Download size={15} />
                <span>Exportar Ventas ({filteredOrders.length})</span>
              </button>
            </div>
          )}

          {/* TAB CONTENTS */}
          <div className="admin-tab-content-container" style={{ flex: 1 }}>
            {activeTab === 'kpis' && (
              <AuditKpisTab 
                kpis={kpis} 
                orders={filteredOrders}
                allOrders={orders}
                shifts={shifts}
                rangeType={rangeType}
                setRangeType={setRangeType}
                selectedShiftId={selectedShiftId}
                setSelectedShiftId={setSelectedShiftId}
                selectedShift={selectedShift}
                customStart={customStart}
                setCustomStart={setCustomStart}
                customEnd={customEnd}
                setCustomEnd={setCustomEnd}
                onOpenBot={handleOpenBot} 
              />
            )}
            {activeTab === 'shifts' && <AuditCashShiftsTab shifts={shifts} onExportCsv={handleExportShifts} />}
            {activeTab === 'security' && <AuditSecurityTab cancelledOrders={cancelledOrders} orders={orders} />}
            {activeTab === 'menu' && <AuditMenuAnalytics analytics={productAnalytics} />}
            {activeTab === 'bot' && <AdminWhatsAppBot initialTab={botSubTab} />}
            {activeTab === 'database' && <AdminDatabaseTablesTab />}
            {activeTab === 'settings' && <AuditSecuritySettings />}
          </div>
        </div>
      </div>

      {showOnboarding && (
        <StoreOnboardingWizard
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onStoreCreated={() => {
            setShowOnboarding(false);
            if (onRefreshSystem) onRefreshSystem();
          }}
        />
      )}
    </div>
  );
}

