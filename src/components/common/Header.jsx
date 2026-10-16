import React, { useState, useEffect } from 'react';
import { 
  Flame,
  User,
  LogOut, 
  ShoppingCart, 
  ChefHat, 
  History, 
  UtensilsCrossed, 
  Settings, 
  Maximize2, 
  CheckCircle2, 
  AlertCircle, 
  Cloud, 
  Sun, 
  Moon,
  MessageSquare,
  QrCode,
  Users,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { supabaseSync } from '../../services/supabaseClient';
import { offlineSyncService } from '../../services/offlineSyncService';

export default function Header({ 
  currentCashier,
  onLogoutCashier,
  currentTab, 
  setCurrentTab, 
  pendingKitchenCount, 
  activeWhatsAppCount = 0,
  cashShift, 
  settings,
  theme,
  onToggleTheme,
  onOpenCashModal, 
  onOpenSettings,
  onOpenCatalogQR,
  isKitchenZenMode,
  onToggleKitchenZenMode,
  onOpenCrm
}) {
  const isCloudSynced = supabaseSync.isConfigured();
  const [offlineState, setOfflineState] = useState(() => ({
    isOnline: offlineSyncService.isOnline(),
    pendingCount: offlineSyncService.getPendingCount(),
    isSyncing: false
  }));

  useEffect(() => {
    return offlineSyncService.subscribe(state => {
      setOfflineState(state);
    });
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const cashierFirstName = currentCashier?.name 
    ? currentCashier.name.trim().split(' ')[0] 
    : 'Cajero';

  return (
    <>
    <header className="top-header">
      <div className="brand-section">
        {settings?.logo_url || settings?.logo ? (
          <img 
            src={settings.logo_url || settings.logo} 
            alt="Logo" 
            className="brand-logo-custom"
            style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="brand-logo-icon">
            <Flame size={20} />
          </div>
        )}
        <div>
          <div className="brand-name">
            <span className="brand-name-text">
              {settings?.businessName || settings?.nombre_local ? (settings.businessName || settings.nombre_local) : 'COMANDA'}
            </span>
            {!(settings?.businessName || settings?.nombre_local) && (
              <span style={{ color: 'var(--accent-amber)' }}>FAST</span>
            )}
            <span className="brand-badge">POS</span>
          </div>
        </div>
      </div>

      <nav className="nav-tabs desktop-nav-tabs">
        <button 
          className={`nav-tab-btn ${currentTab === 'pos' ? 'active' : ''}`}
          onClick={() => setCurrentTab('pos')}
          title="Mostrador de Ventas"
        >
          <ShoppingCart size={17} />
          <span className="nav-tab-label-full">Mostrador</span>
          <span className="nav-tab-label-short">Ventas</span>
        </button>

        <button 
          className={`nav-tab-btn ${currentTab === 'kds' ? 'active' : ''}`}
          onClick={() => setCurrentTab('kds')}
          title="Cocina / Pantalla KDS"
        >
          <ChefHat size={17} />
          <span>Cocina</span>
          {pendingKitchenCount > 0 && (
            <span className="nav-badge-count">{pendingKitchenCount}</span>
          )}
        </button>

        <button 
          className={`nav-tab-btn ${currentTab === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentTab('history')}
          title="Historial de Pedidos"
        >
          <History size={17} />
          <span>Historial</span>
        </button>

        <button 
          className={`nav-tab-btn ${currentTab === 'menu' ? 'active' : ''}`}
          onClick={() => setCurrentTab('menu')}
          title="Gestión de Menú y Precios"
        >
          <UtensilsCrossed size={17} />
          <span>Menú</span>
        </button>

        <button 
          className={`nav-tab-btn ${currentTab === 'whatsapp' ? 'active' : ''}`}
          onClick={() => setCurrentTab('whatsapp')}
          title="Monitoreo y Control de WhatsApp Bot en Vivo (F6)"
        >
          <MessageSquare size={17} style={{ color: currentTab === 'whatsapp' ? '#25D366' : 'inherit' }} />
          <span className="nav-tab-label-full">WhatsApp Live</span>
          <span className="nav-tab-label-short">WhatsApp</span>
          {activeWhatsAppCount > 0 && (
            <span className="nav-badge-count" style={{ background: '#25D366', color: '#052e16' }}>
              {activeWhatsAppCount}
            </span>
          )}
        </button>

        <button 
          type="button"
          className="nav-tab-btn"
          onClick={onOpenCrm}
          title="Directorio de Clientes y Cuentas Corrientes (Fiados)"
        >
          <Users size={17} style={{ color: 'var(--accent-blue, #3b82f6)' }} />
          <span className="nav-tab-label-full">Clientes & Fiados</span>
          <span className="nav-tab-label-short">Clientes</span>
        </button>
      </nav>

      <div className="header-right-actions">
        {/* Cashier Badge & Logout */}
        {currentCashier && (
          <div 
            className="header-cashier-pill tactile-btn"
            title={`Cajero conectado: ${currentCashier.name} (@${currentCashier.username})`}
          >
            <User size={14} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
            <span className="cashier-name-desktop">
              {currentCashier.name}
            </span>
            <span className="cashier-name-compact">
              {cashierFirstName}
            </span>
            <span className="cashier-name-mobile">
              {cashierFirstName}
            </span>
            <button
              type="button"
              className="btn-header-logout"
              onClick={onLogoutCashier}
              title="Cerrar sesión de cajero"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}

        {/* Shift status pill */}
        {cashShift && !cashShift.isClosed ? (
          <div className="shift-status-pill open" onClick={onOpenCashModal} title="Click para ver control de caja">
            <span className="shift-status-dot open" />
            <span className="shift-status-full-text">Caja Abierta (${cashShift.initialCash.toLocaleString('es-AR')})</span>
            <span className="shift-status-mid-text">Abierta (${cashShift.initialCash.toLocaleString('es-AR')})</span>
            <span className="shift-status-short-text">Abierta</span>
          </div>
        ) : (
          <div className="shift-status-pill closed" onClick={onOpenCashModal} title="Click para abrir turno de caja">
            <span className="shift-status-dot closed" />
            <span className="shift-status-full-text">Caja Cerrada</span>
            <span className="shift-status-mid-text">Cerrada</span>
            <span className="shift-status-short-text">Cerrada</span>
          </div>
        )}

        {/* Connection & Offline Resilience Pill */}
        <div 
          className={`connection-status-pill tactile-btn ${!offlineState.isOnline ? 'offline' : (offlineState.pendingCount > 0 ? 'syncing' : 'online')}`}
          onClick={() => {
            if (!offlineState.isOnline || offlineState.pendingCount > 0) {
              offlineSyncService.processQueue();
            } else {
              onOpenSettings();
            }
          }}
          title={
            !offlineState.isOnline 
              ? `⚠️ Modo Local / Sin Conexión (${offlineState.pendingCount} pedidos guardados localmente). Clic para reintentar sincronización con la nube.`
              : (offlineState.pendingCount > 0 
                  ? `🔄 Sincronizando ${offlineState.pendingCount} elementos con Supabase...` 
                  : '🟢 Conexión en Tiempo Real con Supabase Cloud')
          }
        >
          {!offlineState.isOnline ? (
            <>
              <WifiOff size={13} style={{ color: '#f87171' }} />
              <span className="conn-text-full">Sin Internet ({offlineState.pendingCount})</span>
              <span className="conn-text-short">Offline ({offlineState.pendingCount})</span>
            </>
          ) : offlineState.pendingCount > 0 ? (
            <>
              <RefreshCw size={13} className="spin-animation" style={{ color: '#38bdf8' }} />
              <span className="conn-text-full">Subiendo ({offlineState.pendingCount})...</span>
              <span className="conn-text-short">Sync ({offlineState.pendingCount})</span>
            </>
          ) : (
            <>
              <span className="conn-pulse-dot" />
              <Cloud size={13} style={{ color: '#34d399' }} />
              <span className="conn-text-full">En Línea</span>
            </>
          )}
        </div>

        {/* Theme Toggle Button (Light / Dark) */}
        <button 
          type="button"
          className="header-icon-btn" 
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
        >
          {theme === 'light' ? (
            <Moon size={15} style={{ color: 'var(--accent-indigo, #6366f1)' }} />
          ) : (
            <Sun size={15} style={{ color: 'var(--accent-amber)' }} />
          )}
        </button>

        {/* QR Carta Digital & Flyer PDF */}
        <button 
          type="button"
          className="header-icon-btn" 
          onClick={onOpenCatalogQR}
          title="Generar Código QR & Flyer de Carta Digital para imprimir en PDF"
          style={{ color: 'var(--accent-amber)' }}
        >
          <QrCode size={15} />
        </button>


        {/* Settings Modal Button */}
        <button 
          type="button"
          className="header-icon-btn" 
          onClick={onOpenSettings}
          title="Configuración general e impresión"
        >
          <Settings size={15} />
        </button>

        {/* Modo Cocina Zen Mode Toggle (Visible when on KDS tab) */}
        {currentTab === 'kds' && onToggleKitchenZenMode && (
          <button 
            type="button"
            className="header-icon-btn" 
            onClick={onToggleKitchenZenMode}
            title={isKitchenZenMode ? 'Salir de Modo Cocina' : 'Modo Cocina Enfocado / Pantalla Completa'}
            style={{ color: 'var(--accent-orange)' }}
          >
            <ChefHat size={16} />
          </button>
        )}

        {/* Fullscreen Toggle (Desktop Only) */}
        <button 
          type="button"
          className="header-icon-btn desktop-only-action" 
          onClick={toggleFullscreen}
          title="Pantalla completa"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </header>

    {/* MOBILE BOTTOM NAVIGATION BAR */}
    <nav className="mobile-bottom-nav">
      <button 
        type="button"
        className={`mobile-nav-item ${currentTab === 'pos' ? 'active' : ''}`}
        onClick={() => setCurrentTab('pos')}
      >
        <div className="mobile-nav-icon-box">
          <ShoppingCart size={19} />
        </div>
        <span className="mobile-nav-label">Mostrador</span>
      </button>

      <button 
        type="button"
        className={`mobile-nav-item ${currentTab === 'kds' ? 'active' : ''}`}
        onClick={() => {
          setCurrentTab('kds');
          if (onToggleKitchenZenMode) {
            onToggleKitchenZenMode(true);
          }
        }}
        title="Modo Cocina Pantalla Completa"
      >
        <div className="mobile-nav-icon-box">
          <ChefHat size={19} />
          {pendingKitchenCount > 0 && (
            <span className="mobile-nav-badge">{pendingKitchenCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">Cocina</span>
      </button>

      <button 
        type="button"
        className={`mobile-nav-item ${currentTab === 'history' ? 'active' : ''}`}
        onClick={() => setCurrentTab('history')}
      >
        <div className="mobile-nav-icon-box">
          <History size={19} />
        </div>
        <span className="mobile-nav-label">Historial</span>
      </button>

      <button 
        type="button"
        className={`mobile-nav-item ${currentTab === 'menu' ? 'active' : ''}`}
        onClick={() => setCurrentTab('menu')}
      >
        <div className="mobile-nav-icon-box">
          <UtensilsCrossed size={19} />
        </div>
        <span className="mobile-nav-label">Menú</span>
      </button>

    </nav>
    </>
  );
}
