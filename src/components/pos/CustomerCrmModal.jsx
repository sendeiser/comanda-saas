import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  AlertCircle, 
  Search, 
  Plus, 
  X, 
  CreditCard, 
  MessageSquare, 
  Clock, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  FileText,
  History,
  Copy,
  Check,
  ShoppingBag,
  ArrowUpRight,
  TrendingDown,
  UserCheck
} from 'lucide-react';
import { 
  getCustomers, 
  saveCustomer, 
  recordCustomerPayment, 
  generateWhatsAppDebtReminder 
} from '../../services/customerCrmService.js';
import '../../styles/crm.css';

export default function CustomerCrmModal({ 
  isOpen, 
  onClose, 
  storeId = 'default', 
  storeConfig = {},
  onSelectCustomer 
}) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'debt' | 'clear'
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Form state for creating a new customer
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    currentBalance: ''
  });

  // State for collecting debt
  const [payingCustomer, setPayingCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  // State for viewing ledger history
  const [historyCustomer, setHistoryCustomer] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers(storeId);
      setCustomers(data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen, storeId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.storeId === storeId && Array.isArray(e.detail?.customers)) {
        setCustomers(e.detail.customers);
      } else {
        loadCustomers();
      }
    };
    window.addEventListener('comandafast:customers_updated', handleUpdate);
    return () => window.removeEventListener('comandafast:customers_updated', handleUpdate);
  }, [storeId]);

  // Summaries
  const totalDebt = useMemo(() => {
    return customers.reduce((acc, c) => acc + (Number(c.currentBalance) || 0), 0);
  }, [customers]);

  const debtorsCount = useMemo(() => {
    return customers.filter(c => (Number(c.currentBalance) || 0) > 0).length;
  }, [customers]);

  const clearCount = useMemo(() => {
    return customers.filter(c => (Number(c.currentBalance) || 0) <= 0).length;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const term = search.toLowerCase().trim();
      const balance = Number(c.currentBalance) || 0;

      if (filterTab === 'debt' && balance <= 0) return false;
      if (filterTab === 'clear' && balance > 0) return false;

      if (!term) return true;
      return (
        (c.name || '').toLowerCase().includes(term) ||
        (c.phone || '').includes(term) ||
        (c.address || '').toLowerCase().includes(term) ||
        (c.notes || '').toLowerCase().includes(term)
      );
    });
  }, [customers, search, filterTab]);

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleCopy = (text, label) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      showToast(`📋 ${label} copiado`);
    } catch (_) {}
  };

  const handleSaveNewCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name.trim()) return;

    try {
      await saveCustomer(storeId, {
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        address: newCustomer.address.trim(),
        notes: newCustomer.notes.trim(),
        currentBalance: Number(newCustomer.currentBalance) || 0
      });

      setNewCustomer({ name: '', phone: '', address: '', notes: '', currentBalance: '' });
      setIsCreatingCustomer(false);
      showToast('✅ Cliente registrado con éxito');
      const updated = await getCustomers(storeId);
      setCustomers(updated);
    } catch (err) {
      alert('Error al registrar cliente: ' + err.message);
    }
  };

  const handleOpenPayment = (customer) => {
    setPayingCustomer(customer);
    setPaymentAmount(customer.currentBalance || 0);
    setPaymentMethod('efectivo');
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!payingCustomer) return;
    try {
      await recordCustomerPayment(storeId, payingCustomer.id, Number(paymentAmount), paymentMethod);
      const updated = await getCustomers(storeId);
      setCustomers(updated);
      setPayingCustomer(null);
      showToast('💰 Cobro registrado correctamente');
    } catch (err) {
      alert('Error al imputar cobro: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="crm-modal-backdrop" onClick={onClose}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#080d1a',
          color: '#ffffff',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          padding: '8px 18px',
          borderRadius: '24px',
          fontSize: '0.86rem',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toast}
        </div>
      )}

      <div 
        className="crm-modal-card" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="crm-modal-title"
      >
        {/* 1. HEADER */}
        <header className="crm-header">
          <div className="crm-header-info">
            <div className="crm-header-icon-wrap">
              <Users size={22} />
            </div>
            <div>
              <h2 id="crm-modal-title" className="crm-header-title">
                Clientes & Cuentas Corrientes (Fiados)
              </h2>
              <p className="crm-header-subtitle">
                Libreta digital de comensales, gestión de crédito, saldos y cobranzas
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsCreatingCustomer(true)}
              className="crm-btn-gold tactile-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              <span>+ Nuevo Cliente</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="crm-action-btn-icon tactile-btn"
              aria-label="Cerrar modal"
              title="Cerrar (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* 2. STATS KPI BAR */}
        <section className="crm-stats-bar" aria-label="Métricas del Directorio">
          {/* Total Clientes */}
          <div className="crm-stat-card">
            <div className="crm-stat-icon-wrap" style={{ background: 'rgba(212, 175, 55, 0.16)', color: '#d4af37' }}>
              <Users size={19} />
            </div>
            <div>
              <span className="crm-stat-label">Clientes Registrados</span>
              <span className="crm-stat-value">{customers.length}</span>
              <span className="crm-stat-subtext">Directorio en cartera</span>
            </div>
          </div>

          {/* Deuda en la Calle */}
          <div className="crm-stat-card" style={totalDebt > 0 ? { borderColor: 'rgba(212, 175, 55, 0.4)' } : {}}>
            <div className="crm-stat-icon-wrap" style={{ 
              background: totalDebt > 0 ? 'rgba(212, 175, 55, 0.18)' : 'rgba(100, 116, 139, 0.12)', 
              color: totalDebt > 0 ? '#f3d07a' : 'var(--text-muted)' 
            }}>
              <DollarSign size={19} />
            </div>
            <div>
              <span className="crm-stat-label">Deuda en la Calle</span>
              <span className="crm-stat-value" style={{ color: totalDebt > 0 ? '#f3d07a' : '#ffffff' }}>
                ${totalDebt.toLocaleString('es-AR')}
              </span>
              <span className="crm-stat-subtext">
                {debtorsCount === 0 ? 'Sin saldos pendientes' : `${debtorsCount} ${debtorsCount === 1 ? 'cliente con saldo deudor' : 'clientes con saldo deudor'}`}
              </span>
            </div>
          </div>

          {/* Clientes al Día */}
          <div className="crm-stat-card">
            <div className="crm-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.14)', color: '#10b981' }}>
              <CheckCircle2 size={19} />
            </div>
            <div>
              <span className="crm-stat-label">Clientes al Día</span>
              <span className="crm-stat-value" style={{ color: '#34d399' }}>
                {clearCount}
              </span>
              <span className="crm-stat-subtext">
                {customers.length > 0 ? `${Math.round((clearCount / customers.length) * 100)}% de la cartera al día` : '100% de la cartera al día'}
              </span>
            </div>
          </div>
        </section>

        {/* 3. TOOLBAR: FILTERS & SEARCH */}
        <div className="crm-toolbar">
          <div className="crm-filter-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={filterTab === 'all'}
              className={`crm-filter-tab ${filterTab === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTab('all')}
            >
              <span>Todos</span>
              <span style={{ 
                background: 'rgba(255,255,255,0.08)', 
                padding: '1px 6px', 
                borderRadius: '10px', 
                fontSize: '0.72rem' 
              }}>
                {customers.length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filterTab === 'debt'}
              className={`crm-filter-tab ${filterTab === 'debt' ? 'active' : ''}`}
              onClick={() => setFilterTab('debt')}
              style={debtorsCount > 0 && filterTab === 'debt' ? { color: '#f3d07a' } : {}}
            >
              <span>Con Deuda</span>
              <span style={{ 
                background: debtorsCount > 0 ? 'rgba(212, 175, 55, 0.22)' : 'rgba(255,255,255,0.08)', 
                color: debtorsCount > 0 ? '#f3d07a' : 'inherit',
                padding: '1px 6px', 
                borderRadius: '10px', 
                fontSize: '0.72rem',
                fontWeight: 800
              }}>
                {debtorsCount}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filterTab === 'clear'}
              className={`crm-filter-tab ${filterTab === 'clear' ? 'active' : ''}`}
              onClick={() => setFilterTab('clear')}
            >
              <span>Al Día</span>
              <span style={{ 
                background: 'rgba(16, 185, 129, 0.15)', 
                color: '#10b981',
                padding: '1px 6px', 
                borderRadius: '10px', 
                fontSize: '0.72rem',
                fontWeight: 800
              }}>
                {clearCount}
              </span>
            </button>
          </div>

          <div className="crm-search-box">
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: 12, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }} 
            />
            <input
              type="text"
              className="crm-search-input"
              placeholder="Buscar por nombre, teléfono, calle o nota..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 4. CUSTOMER DIRECTORY LIST */}
        <main className="crm-customer-list">
          {filteredCustomers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--bg-card-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <Search size={26} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                {search ? 'Sin resultados para la búsqueda' : 'No hay clientes en esta sección'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', maxWidth: '340px' }}>
                {search 
                  ? `No encontramos coincidencias para "${search}". Verificá la ortografía o cambiá de filtro.`
                  : 'Podés dar de alta a tu primer cliente para comenzar a registrar pedidos a cuenta corriente y fiados.'
                }
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={() => setIsCreatingCustomer(true)}
                  className="crm-btn-gold tactile-btn"
                  style={{ marginTop: '8px' }}
                >
                  <Plus size={16} /> + Registrar Primer Cliente
                </button>
              )}
            </div>
          ) : (
            filteredCustomers.map(cust => {
              const balance = Number(cust.currentBalance) || 0;
              const hasDebt = balance > 0;
              const initials = getInitials(cust.name);
              const reminder = generateWhatsAppDebtReminder(cust, storeConfig);

              return (
                <article
                  key={cust.id}
                  className={`crm-card ${hasDebt ? 'has-debt' : 'is-clear'}`}
                >
                  {/* Left: Avatar + Identity Info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: '1 1 340px', minWidth: '240px' }}>
                    {/* Initials Avatar */}
                    <div 
                      className="crm-customer-avatar"
                      style={{
                        background: hasDebt 
                          ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(184, 148, 40, 0.38) 100%)' 
                          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.3) 100%)',
                        color: hasDebt ? '#f3d07a' : '#34d399',
                        border: hasDebt ? '1px solid rgba(212, 175, 55, 0.45)' : '1px solid rgba(16, 185, 129, 0.35)'
                      }}
                      title={cust.name}
                    >
                      {initials}
                    </div>

                    {/* Details Column */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 className="crm-customer-name">
                          {cust.name}
                        </h3>

                        {hasDebt ? (
                          <span className="crm-badge-debt">
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d4af37' }} />
                            Saldo Deudor
                          </span>
                        ) : (
                          <span className="crm-badge-clear">
                            <Check size={12} strokeWidth={3} />
                            Al Día
                          </span>
                        )}
                      </div>

                      {/* Contact metadata */}
                      <div className="crm-meta-row">
                        {cust.phone && (
                          <span 
                            className="crm-meta-item" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleCopy(cust.phone, 'Teléfono')}
                            title="Click para copiar teléfono"
                          >
                            <Phone size={13} style={{ color: 'var(--text-muted)' }} />
                            <strong style={{ color: 'var(--text-primary)' }}>{cust.phone}</strong>
                          </span>
                        )}

                        {cust.address && (
                          <span className="crm-meta-item" title={cust.address}>
                            <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                            <span>{cust.address}</span>
                          </span>
                        )}

                        <span className="crm-meta-item">
                          <ShoppingBag size={13} style={{ color: 'var(--text-muted)' }} />
                          <span>{cust.totalOrdersCount || 0} {cust.totalOrdersCount === 1 ? 'pedido' : 'pedidos'}</span>
                        </span>
                      </div>

                      {/* Note Callout */}
                      {cust.notes && (
                        <div className="crm-note-box">
                          <FileText size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Nota: {cust.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: Current Balance */}
                  <div className="crm-balance-box">
                    <span className="crm-balance-label">Saldo Pendiente</span>
                    <div 
                      className="crm-balance-value"
                      style={{ 
                        color: hasDebt ? '#f3d07a' : 'var(--text-secondary)'
                      }}
                    >
                      ${balance.toLocaleString('es-AR')}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="crm-actions-row">
                    {hasDebt && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(cust)}
                          className="crm-action-btn-pay tactile-btn"
                          title="Cobrar total o parte del fiado en caja"
                        >
                          <CreditCard size={15} />
                          <span>Cobrar</span>
                        </button>

                        {cust.phone && (
                          <a
                            href={reminder.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="crm-action-btn-wa tactile-btn"
                            title="Enviar aviso cordial de saldo pendiente por WhatsApp"
                          >
                            <MessageSquare size={15} />
                            <span>Avisar WA</span>
                          </a>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setHistoryCustomer(cust)}
                      className="crm-action-btn-icon tactile-btn"
                      title="Ver historial de cargos y cobranzas de este cliente"
                      aria-label="Ver historial"
                    >
                      <History size={16} />
                    </button>

                    {onSelectCustomer && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCustomer(cust);
                          onClose();
                        }}
                        className="crm-btn-gold tactile-btn"
                        style={{
                          padding: '0.45rem 0.9rem',
                          fontSize: '0.82rem'
                        }}
                        title="Asignar cliente a la comanda actual"
                      >
                        Cargar
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </main>
      </div>

      {/* 5. SUBMODAL: NUEVO CLIENTE */}
      {isCreatingCustomer && (
        <div className="crm-modal-backdrop" style={{ zIndex: 1250 }} onClick={() => setIsCreatingCustomer(false)}>
          <div 
            className="crm-modal-card" 
            style={{ maxWidth: '460px', borderRadius: '18px' }} 
            onClick={e => e.stopPropagation()}
          >
            <div className="crm-header" style={{ padding: '1.1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.08rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                    Registrar Nuevo Cliente
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Alta directa en la libreta de cuentas corrientes
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsCreatingCustomer(false)}
                className="crm-action-btn-icon tactile-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewCustomer} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  placeholder="Ej: Marcelo Morales"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: 3826 430159"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Dirección de Entrega
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Av. San Martín 230 (Barrio Centro)"
                  value={newCustomer.address}
                  onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Saldo Inicial en Deuda / Fiado ($)
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="0 si empieza al día"
                  value={newCustomer.currentBalance}
                  onChange={e => setNewCustomer({ ...newCustomer, currentBalance: e.target.value })}
                  style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Notas / Observaciones
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Pide delivery los viernes, amigo del dueño"
                  value={newCustomer.notes}
                  onChange={e => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustomer(false)}
                  className="crm-btn-secondary tactile-btn"
                  style={{ flex: 1, padding: '0.55rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="crm-btn-gold tactile-btn"
                  style={{ flex: 1, padding: '0.55rem', justifyContent: 'center' }}
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. SUBMODAL: COBRAR FIADO */}
      {payingCustomer && (
        <div className="crm-modal-backdrop" style={{ zIndex: 1250 }} onClick={() => setPayingCustomer(null)}>
          <div 
            className="crm-modal-card" 
            style={{ maxWidth: '440px', borderRadius: '18px' }} 
            onClick={e => e.stopPropagation()}
          >
            <div className="crm-header" style={{ padding: '1.1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.08rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                    Cobrar Saldo de Fiado
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Imputación directa a cuenta corriente
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setPayingCustomer(null)}
                className="crm-action-btn-icon tactile-btn"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ 
                background: '#131e36', 
                border: '1px solid rgba(226, 232, 240, 0.1)', 
                borderRadius: '12px', 
                padding: '0.85rem 1rem' 
              }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Cliente</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  {payingCustomer.name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Deuda acumulada actual:</span>
                  <strong style={{ fontSize: '1.15rem', color: '#f3d07a', fontWeight: 900 }}>
                    ${Number(payingCustomer.currentBalance || 0).toLocaleString('es-AR')}
                  </strong>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Monto a Cobrar ($)
                </label>
                <input
                  type="number"
                  className="input-field"
                  required
                  min="1"
                  max={payingCustomer.currentBalance}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  style={{ width: '100%', height: '42px', fontSize: '1.2rem', fontWeight: 900, borderRadius: '8px' }}
                />

                {/* Quick amount shortcuts */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(payingCustomer.currentBalance)}
                    className="crm-btn-secondary tactile-btn"
                    style={{ flex: 1, padding: '5px', fontSize: '0.75rem', fontWeight: 800, borderRadius: '6px' }}
                  >
                    Total (${Number(payingCustomer.currentBalance || 0).toLocaleString('es-AR')})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(Math.round((payingCustomer.currentBalance || 0) / 2))}
                    className="crm-btn-secondary tactile-btn"
                    style={{ flex: 1, padding: '5px', fontSize: '0.75rem', fontWeight: 800, borderRadius: '6px' }}
                  >
                    50% (${Math.round((payingCustomer.currentBalance || 0) / 2).toLocaleString('es-AR')})
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Medio de Cobro
                </label>
                <select
                  className="input-field"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '8px' }}
                >
                  <option value="efectivo">Efectivo en Caja</option>
                  <option value="transferencia">Transferencia / Mercado Pago</option>
                  <option value="tarjeta">Tarjeta Débito / Crédito</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPayingCustomer(null)}
                  className="crm-btn-secondary tactile-btn"
                  style={{ flex: 1, padding: '0.55rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="tactile-btn"
                  style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', fontWeight: 800, background: '#10b981', color: '#080d1a', border: 'none', cursor: 'pointer' }}
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. SUBMODAL: HISTORIAL / LEDGER */}
      {historyCustomer && (
        <div className="crm-modal-backdrop" style={{ zIndex: 1250 }} onClick={() => setHistoryCustomer(null)}>
          <div 
            className="crm-modal-card" 
            style={{ maxWidth: '520px', maxHeight: '82vh', borderRadius: '18px' }} 
            onClick={e => e.stopPropagation()}
          >
            <div className="crm-header" style={{ padding: '1.1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
                  <History size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.08rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                    Historial de Cuenta: {historyCustomer.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Libro mayor de cargos y cobranzas
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setHistoryCustomer(null)}
                className="crm-action-btn-icon tactile-btn"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(!historyCustomer.ledger || historyCustomer.ledger.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  <FileText size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <div>No hay movimientos registrados para este cliente.</div>
                </div>
              ) : (
                historyCustomer.ledger.map((entry, i) => (
                  <div
                    key={entry.id || i}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#131e36',
                      border: '1px solid rgba(226, 232, 240, 0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: entry.type === 'charge' ? '4px solid #d4af37' : '4px solid #10b981'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ffffff' }}>
                        {entry.concept || (entry.type === 'charge' ? 'Comanda a cuenta (Fiado)' : 'Cobro de saldo')}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '2px' }}>
                        {entry.date ? new Date(entry.date).toLocaleString('es-AR') : '—'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontWeight: 900,
                        fontSize: '0.94rem',
                        color: entry.type === 'charge' ? '#f3d07a' : '#34d399'
                      }}>
                        {entry.type === 'charge' ? `+$${Number(entry.amount || 0).toLocaleString('es-AR')}` : `-$${Number(entry.amount || 0).toLocaleString('es-AR')}`}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Saldo posterior: ${Number(entry.balanceAfter || 0).toLocaleString('es-AR')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
