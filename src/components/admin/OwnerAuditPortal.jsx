import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, Bot, BarChart3, DollarSign, ShieldAlert, Sparkles, LogOut, 
  ArrowLeft, Download, Calendar, Printer, Database, Smartphone,
  ChevronLeft, ChevronRight, ChevronDown, Check, Sun, Moon, RefreshCw,
  Store, Plus, Menu, X, Building2
} from 'lucide-react';
import AuditKpisTab from './AuditKpisTab';
import AuditCashShiftsTab from './AuditCashShiftsTab';
import AuditSecurityTab from './AuditSecurityTab';
import AuditMenuAnalytics from './AuditMenuAnalytics';
import AuditSecuritySettings from './AuditSecuritySettings';
import AdminWhatsAppBot from './bot/AdminWhatsAppBot';
import AdminDatabaseTablesTab from './database/AdminDatabaseTablesTab';
import StoreOnboardingWizard from './onboarding/StoreOnboardingWizard.jsx';
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

  const activeStore = useMemo(() => {
    try {
      return getActiveStore() || { name: 'ComandaFast', slug: 'demo' };
    } catch (_) {
      return { name: 'ComandaFast', slug: 'demo' };
    }
  }, []);

  // Keyboard accessibility: ESC to return to POS, Ctrl+B / Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.key === 'Escape') {
        if (isMobileAccordionOpen) {
          setIsMobileAccordionOpen(false);
          return;
        }
        if (onBackToPos) {
          const tag = document.activeElement?.tagName?.toLowerCase();
          if (tag !== 'input' && tag !== 'textarea') {
            e.preventDefault();
            onBackToPos();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToPos, isMobileAccordionOpen]);

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
      group: 'operaciones',
      icon: BarChart3,
      badge: null,
      badgeColor: null
    },
    {
      id: 'shifts',
      label: 'Auditoría de Cajas',
      shortLabel: 'Cajas',
      group: 'operaciones',
      icon: DollarSign,
      badge: shifts.length > 0 ? shifts.length : null,
      badgeColor: 'var(--accent-amber)'
    },
    {
      id: 'security',
      label: 'Control Antifraude',
      shortLabel: 'Antifraude',
      group: 'operaciones',
      icon: ShieldAlert,
      badge: cancelledOrders.length > 0 ? cancelledOrders.length : null,
      badgeColor: cancelledOrders.length > 0 ? 'var(--accent-rose)' : null
    },
    {
      id: 'menu',
      label: 'Ranking de Menú',
      shortLabel: 'Menú',
      group: 'operaciones',
      icon: Sparkles,
      badge: null,
      badgeColor: null
    },
    {
      id: 'bot',
      label: 'WhatsApp Bot IA',
      shortLabel: 'Bot WA',
      group: 'herramientas',
      icon: Bot,
      badge: 'IA',
      badgeColor: 'var(--accent-emerald)'
    },
    {
      id: 'database',
      label: 'Tablas de BD',
      shortLabel: 'Tablas',
      group: 'herramientas',
      icon: Database,
      badge: null,
      badgeColor: null
    },
    {
      id: 'settings',
      label: 'Seguridad & Acceso',
      shortLabel: 'Seguridad',
      group: 'herramientas',
      icon: ShieldCheck,
      badge: null,
      badgeColor: null
    }
  ], [shifts.length, cancelledOrders.length]);

  const currentNavItem = useMemo(() => {
    return navItems.find(item => item.id === activeTab) || navItems[0];
  }, [navItems, activeTab]);

  const CurrentNavIcon = currentNavItem.icon;

  const renderNavButton = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        className={`admin-crm-nav-item tactile-btn ${isActive ? 'active' : ''}`}
        onClick={() => {
          setActiveTab(item.id);
          setIsMobileAccordionOpen(false);
        }}
        title={isSidebarCollapsed ? item.label : undefined}
      >
        <div className="admin-crm-item-icon-wrap">
          <Icon size={18} />
          {isSidebarCollapsed && item.badge !== null && (
            <span 
              className="admin-crm-dot-badge" 
              style={{ background: item.badgeColor || 'var(--accent-amber)' }}
              title={`${item.label}: ${item.badge}`}
            />
          )}
        </div>

        {!isSidebarCollapsed && (
          <span className="admin-crm-item-label">{item.label}</span>
        )}

        {!isSidebarCollapsed && item.badge !== null && (
          <span 
            className="admin-crm-badge-pill"
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
  };

  return (
    <div ref={portalRef} className="admin-crm-container">
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileAccordionOpen && (
        <div 
          className="admin-crm-mobile-backdrop" 
          onClick={() => setIsMobileAccordionOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* CRM DOCKED LEFT SIDEBAR (Full height 100vh, collapsible to icon rail) */}
      <aside 
        className={`admin-crm-sidebar ${isSidebarCollapsed ? 'collapsed' : 'expanded'} ${isMobileAccordionOpen ? 'mobile-open' : ''}`}
        aria-label="Menú de Navegación CRM"
      >
        {/* 1. Header / Store Brand */}
        <div className="admin-crm-sidebar-header">
          <div className="admin-crm-brand">
            <div className="admin-crm-brand-icon">
              <ShieldCheck size={22} style={{ color: 'var(--accent-amber)' }} />
            </div>
            {!isSidebarCollapsed && (
              <div className="admin-crm-brand-info">
                <span className="admin-crm-brand-title">ComandaFast</span>
                <span className="admin-crm-brand-badge">CRM DUEÑO</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="admin-crm-collapse-btn tactile-btn"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expandir menú (Ctrl+B)" : "Minimizar menú (Ctrl+B)"}
            aria-label={isSidebarCollapsed ? "Expandir menú" : "Minimizar menú"}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* 2. Active Store Context Card */}
        {!isSidebarCollapsed && (
          <div className="admin-crm-store-card">
            <div className="admin-crm-store-avatar">
              <Store size={15} style={{ color: 'var(--accent-amber)' }} />
            </div>
            <div className="admin-crm-store-meta">
              <span className="admin-crm-store-name">{activeStore?.name || 'Local Principal'}</span>
              <span className="admin-crm-store-status">
                <span className="admin-crm-live-dot" /> RLS Activo
              </span>
            </div>
          </div>
        )}

        {/* 3. Navigation Sections (Scrollable) */}
        <div className="admin-crm-nav-scroll">
          {/* Group 1: Finanzas & Operaciones */}
          <div className="admin-crm-nav-group">
            {!isSidebarCollapsed && (
              <span className="admin-crm-group-title">Finanzas & Operación</span>
            )}
            <nav className="admin-crm-nav-list" aria-label="Finanzas y Operación">
              {navItems.filter(item => item.group === 'operaciones').map(item => renderNavButton(item))}
            </nav>
          </div>

          {/* Group 2: Herramientas & IA */}
          <div className="admin-crm-nav-group">
            {!isSidebarCollapsed && (
              <span className="admin-crm-group-title">Herramientas & IA</span>
            )}
            <nav className="admin-crm-nav-list" aria-label="Herramientas e Inteligencia Artificial">
              {navItems.filter(item => item.group === 'herramientas').map(item => renderNavButton(item))}
            </nav>
          </div>

          {/* Group 3: Gestión de Negocio */}
          <div className="admin-crm-nav-group">
            {!isSidebarCollapsed && (
              <span className="admin-crm-group-title">Gestión de Negocio</span>
            )}
            <div className="admin-crm-actions-list">


              <button
                type="button"
                className="admin-crm-action-item tactile-btn"
                onClick={handleRefreshSystem}
                disabled={isRefreshing}
                title={isSidebarCollapsed ? "Sincronizar y Actualizar BD" : undefined}
              >
                <div className="admin-crm-item-icon-wrap">
                  {refreshSuccess ? (
                    <Check size={17} style={{ color: 'var(--accent-emerald)' }} />
                  ) : (
                    <RefreshCw size={17} className={isRefreshing ? 'cf-spin' : ''} style={{ color: 'var(--accent-emerald)' }} />
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <span className="admin-crm-item-label">
                    {isRefreshing ? 'Actualizando...' : refreshSuccess ? '¡BD Al Día!' : 'Sincronizar BD'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Sidebar Bottom / User Profile Footer */}
        <div className="admin-crm-sidebar-footer">
          <div className="admin-crm-footer-quick">
            {onToggleTheme && (
              <button
                type="button"
                className="admin-crm-footer-btn tactile-btn"
                onClick={onToggleTheme}
                title={theme === 'dark' ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              >
                <div className="admin-crm-item-icon-wrap">
                  {theme === 'dark' ? <Sun size={16} style={{ color: 'var(--accent-amber)' }} /> : <Moon size={16} style={{ color: 'var(--accent-amber)' }} />}
                </div>
                {!isSidebarCollapsed && <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>}
              </button>
            )}

            {onBackToPos && (
              <button
                type="button"
                className="admin-crm-footer-btn tactile-btn btn-pos-switch"
                onClick={onBackToPos}
                title="Volver al Punto de Venta (Esc)"
              >
                <div className="admin-crm-item-icon-wrap">
                  <ArrowLeft size={16} />
                </div>
                {!isSidebarCollapsed && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>Punto de Venta</span>
                    <span className="admin-crm-kbd">Esc</span>
                  </div>
                )}
              </button>
            )}
          </div>

          <div className="admin-crm-user-profile">
            <div className="admin-crm-user-avatar">
              <span>{user?.user ? user.user[0].toUpperCase() : 'D'}</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="admin-crm-user-details">
                <span className="admin-crm-user-name">{user?.user || 'Dueño'}</span>
                <span className="admin-crm-user-role">Administrador Total</span>
              </div>
            )}
            {onLogout && (
              <button
                type="button"
                className="admin-crm-logout-btn tactile-btn"
                onClick={onLogout}
                title="Cerrar Sesión"
                aria-label="Cerrar Sesión"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN VIEWPORT */}
      <main className="admin-crm-main">
        {/* Executive Topbar */}
        <header className="admin-crm-topbar">
          <div className="admin-crm-topbar-left">
            {/* Mobile drawer toggle */}
            <button
              type="button"
              className="admin-crm-mobile-menu-btn tactile-btn"
              onClick={() => setIsMobileAccordionOpen(prev => !prev)}
              aria-label="Abrir menú de navegación"
            >
              <Menu size={20} />
            </button>

            {/* Active Module Breadcrumb & Meta */}
            <div className="admin-crm-topbar-breadcrumb">
              <div className="admin-crm-topbar-icon">
                <CurrentNavIcon size={19} style={{ color: 'var(--accent-amber)' }} />
              </div>
              <div className="admin-crm-topbar-titles">
                <div className="admin-crm-topbar-main-title">
                  <h2>{currentNavItem.label}</h2>
                  {currentNavItem.badge !== null && (
                    <span 
                      className="admin-crm-badge-pill" 
                      style={{ 
                        background: currentNavItem.badgeColor ? `${currentNavItem.badgeColor}20` : 'rgba(245, 158, 11, 0.15)', 
                        color: currentNavItem.badgeColor || 'var(--accent-amber)', 
                        borderColor: currentNavItem.badgeColor ? `${currentNavItem.badgeColor}40` : 'rgba(245, 158, 11, 0.3)' 
                      }}
                    >
                      {currentNavItem.badge}
                    </span>
                  )}
                </div>
                <span className="admin-crm-topbar-sub">
                  {activeTab === 'kpis' && 'Métricas financieras en tiempo real y rendimiento de comandas'}
                  {activeTab === 'shifts' && 'Auditoría de aperturas, cierres de turno y conciliación de caja'}
                  {activeTab === 'security' && 'Control de pedidos cancelados, auditoría de mozos y motivos'}
                  {activeTab === 'menu' && 'Platos más vendidos, rentabilidad y distribución horaria'}
                  {activeTab === 'bot' && 'Asistente de WhatsApp con IA, flujos y catálogo interactivo'}
                  {activeTab === 'database' && 'Explorador y edición directa de tablas Supabase / SQLite'}
                  {activeTab === 'settings' && 'Credenciales de acceso, pines de mozos y políticas de seguridad'}
                </span>
              </div>
            </div>
          </div>

          <div className="admin-crm-topbar-right">
            {/* Cloud Status Pill */}
            <div className="admin-crm-status-pill">
              <span className="admin-crm-status-dot" />
              <span className="admin-crm-status-text">Sistema En Línea • RLS</span>
            </div>

            {/* Quick CSV Export button (when in relevant tabs) */}
            {(activeTab === 'shifts' || activeTab === 'kpis') && (
              <button
                type="button"
                className="admin-crm-topbar-action-btn tactile-btn"
                onClick={activeTab === 'shifts' ? handleExportShifts : handleExportOrders}
                title="Exportar datos a CSV"
              >
                <Download size={14} />
                <span className="hide-on-mobile">Exportar CSV</span>
              </button>
            )}

            {/* Quick Return to POS button */}
            {onBackToPos && (
              <button
                type="button"
                className="admin-crm-topbar-btn-pos tactile-btn"
                onClick={onBackToPos}
                title="Ir al Punto de Venta (Esc)"
              >
                <ArrowLeft size={14} />
                <span>Punto de Venta</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Canvas Viewport */}
        <div className="admin-crm-canvas">
          {/* TAB CONTENTS */}
          <div className="admin-tab-content-container" style={{ flex: 1, minWidth: 0 }}>
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
      </main>

      {showOnboarding && (
        <StoreOnboardingWizard
          isOpen={showOnboarding}
          onClose={() => {
            try {
              const active = getActiveStore();
              localStorage.setItem('cf_onboarding_completed_' + (active.id || active.slug), 'true');
            } catch (_) {}
            setShowOnboarding(false);
          }}
          onStoreCreated={() => {
            try {
              const active = getActiveStore();
              localStorage.setItem('cf_onboarding_completed_' + (active.id || active.slug), 'true');
            } catch (_) {}
            setShowOnboarding(false);
            if (onRefreshSystem) onRefreshSystem();
          }}
        />
      )}
    </div>
  );
}

