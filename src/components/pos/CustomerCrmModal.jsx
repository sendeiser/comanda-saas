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
  History
} from 'lucide-react';
import { 
  getCustomers, 
  saveCustomer, 
  recordCustomerPayment, 
  generateWhatsAppDebtReminder 
} from '../../services/customerCrmService.js';

export default function CustomerCrmModal({ 
  isOpen, 
  onClose, 
  storeId = 'default', 
  storeConfig = {},
  onSelectCustomer 
}) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (!isOpen) return null;

  // Summaries
  const totalDebt = useMemo(() => {
    return customers.reduce((acc, c) => acc + (Number(c.currentBalance) || 0), 0);
  }, [customers]);

  const debtorsCount = useMemo(() => {
    return customers.filter(c => (Number(c.currentBalance) || 0) > 0).length;
  }, [customers]);

  const filteredCustomers = customers.filter(c => {
    const term = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.phone || '').includes(term) ||
      (c.address || '').toLowerCase().includes(term)
    );
  });

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
    } catch (err) {
      alert('Error al imputar cobro: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1150 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '940px', 
          width: '95%', 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: 0,
          background: 'var(--bg-card, #131b2e)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle, #1e293b)',
          overflow: 'hidden'
        }}
      >
        {/* HEADER */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle, #1e293b)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-surface-elevated, #162035)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-blue, #3b82f6)'
            }}>
              <Users size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary, #fff)', margin: 0 }}>
                Clientes & Cuentas Corrientes (Fiados)
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '2px 0 0' }}>
                Libreta digital de comensales, saldos en cuenta corriente y cobranzas
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsCreatingCustomer(true)}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              <Plus size={16} />
              <span>+ Nuevo Cliente</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* STATS STRIP */}
        <div style={{
          padding: '0.9rem 1.5rem',
          background: 'rgba(0,0,0,0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle, #1e293b)'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'var(--bg-surface-card, #121929)',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle, #1e293b)'
            }}>
              <Users size={16} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Clientes:</span>
              <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{customers.length}</strong>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: totalDebt > 0 ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-surface-card, #121929)',
              borderRadius: '10px',
              border: totalDebt > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle, #1e293b)'
            }}>
              <DollarSign size={16} style={{ color: '#fbbf24' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Deuda en la Calle:</span>
              <strong style={{ fontSize: '0.95rem', color: totalDebt > 0 ? '#fbbf24' : '#fff' }}>
                ${totalDebt.toLocaleString('es-AR')}
              </strong>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'var(--bg-surface-card, #121929)',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle, #1e293b)'
            }}>
              <AlertCircle size={16} style={{ color: debtorsCount > 0 ? '#f87171' : '#34d399' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Con Saldo Pendiente:</span>
              <strong style={{ fontSize: '0.95rem', color: debtorsCount > 0 ? '#f87171' : '#34d399' }}>
                {debtorsCount}
              </strong>
            </div>
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por nombre, teléfono..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '32px', height: '36px', fontSize: '0.8rem', width: '100%' }}
            />
          </div>
        </div>

        {/* CUSTOMER DIRECTORY LIST */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          {filteredCustomers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No se encontraron comensales registrados.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredCustomers.map(cust => {
                const balance = Number(cust.currentBalance) || 0;
                const hasDebt = balance > 0;
                const reminder = generateWhatsAppDebtReminder(cust, storeConfig);

                return (
                  <div
                    key={cust.id}
                    style={{
                      background: 'var(--bg-surface-card, #121929)',
                      border: hasDebt ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle, #1e293b)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    {/* Left: Info */}
                    <div style={{ minWidth: '220px', flex: '1 1 240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                          {cust.name}
                        </span>
                        {hasDebt ? (
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#fbbf24',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            Saldo Deudor
                          </span>
                        ) : (
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            Al Día
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {cust.phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} />
                            {cust.phone}
                          </span>
                        )}
                        {cust.address && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} />
                            {cust.address}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={12} />
                          {cust.totalOrdersCount || 0} pedidos
                        </span>
                      </div>

                      {cust.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                          Nota: {cust.notes}
                        </div>
                      )}
                    </div>

                    {/* Middle: Current Balance */}
                    <div style={{ textAlign: 'right', minWidth: '130px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Saldo Pendiente
                      </div>
                      <div style={{
                        fontSize: '1.3rem',
                        fontWeight: 900,
                        color: hasDebt ? '#fbbf24' : 'var(--text-primary)'
                      }}>
                        ${balance.toLocaleString('es-AR')}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {hasDebt && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(cust)}
                            className="btn btn-secondary"
                            style={{
                              padding: '0.4rem 0.7rem',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#34d399',
                              borderColor: 'rgba(16, 185, 129, 0.4)'
                            }}
                            title="Cobrar total o parte del fiado"
                          >
                            <CreditCard size={14} />
                            <span>Cobrar</span>
                          </button>

                          {cust.phone && (
                            <a
                              href={reminder.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                              style={{
                                padding: '0.4rem 0.7rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#25D366',
                                textDecoration: 'none'
                              }}
                              title="Enviar aviso cordial de saldo por WhatsApp"
                            >
                              <MessageSquare size={14} />
                              <span>Avisar WA</span>
                            </a>
                          )}
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => setHistoryCustomer(cust)}
                        className="btn btn-secondary"
                        style={{
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.78rem',
                          color: 'var(--text-muted)'
                        }}
                        title="Ver historial de cargos y pagos"
                      >
                        <History size={14} />
                      </button>

                      {onSelectCustomer && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCustomer(cust);
                            onClose();
                          }}
                          className="btn btn-primary"
                          style={{
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.78rem',
                            fontWeight: 800
                          }}
                          title="Seleccionar cliente para la comanda actual"
                        >
                          Cargar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CREATE CUSTOMER MODAL */}
      {isCreatingCustomer && (
        <div className="modal-overlay" style={{ zIndex: 1250 }}>
          <div className="modal-content" style={{ maxWidth: '420px', background: 'var(--bg-card, #131b2e)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Registrar Nuevo Cliente</h3>
              <button 
                type="button" 
                onClick={() => setIsCreatingCustomer(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  className="input-field"
                  required
                  placeholder="Ej: Marcelo Morales"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: 3826 430159"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  Dirección de Entrega
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Av. San Martín 230"
                  value={newCustomer.address}
                  onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  Saldo Inicial en Deuda / Fiado ($)
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="0 si empieza al día"
                  value={newCustomer.currentBalance}
                  onChange={e => setNewCustomer({ ...newCustomer, currentBalance: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  Notas / Preferencias
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Paga los días 10, amigo del dueño"
                  value={newCustomer.notes}
                  onChange={e => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustomer(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, fontWeight: 800 }}
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COLLECT DEBT MODAL */}
      {payingCustomer && (
        <div className="modal-overlay" style={{ zIndex: 1250 }}>
          <div className="modal-content" style={{ maxWidth: '420px', background: 'var(--bg-card, #131b2e)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard style={{ color: '#34d399' }} size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Cobrar Saldo de Fiado</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPayingCustomer(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
              Cliente: <strong style={{ color: '#fff' }}>{payingCustomer.name}</strong> • Deuda actual: <strong style={{ color: '#fbbf24' }}>${payingCustomer.currentBalance?.toLocaleString('es-AR')}</strong>
            </p>

            <form onSubmit={handleConfirmPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Monto a Cobrar ($)
                </label>
                <input
                  type="number"
                  className="input-field"
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  style={{ width: '100%', fontSize: '1.2rem', fontWeight: 800 }}
                />

                {/* Quick buttons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(payingCustomer.currentBalance)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '4px', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    Total (${payingCustomer.currentBalance?.toLocaleString('es-AR')})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(Math.round(payingCustomer.currentBalance / 2))}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '4px', fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    50%
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Forma de Cobro
                </label>
                <select
                  className="input-field"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="efectivo">Efectivo en Caja</option>
                  <option value="transferencia">Transferencia / Mercado Pago</option>
                  <option value="tarjeta">Tarjeta Débito / Crédito</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPayingCustomer(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, fontWeight: 800 }}
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEDGER HISTORY MODAL */}
      {historyCustomer && (
        <div className="modal-overlay" style={{ zIndex: 1250 }}>
          <div className="modal-content" style={{ maxWidth: '480px', background: 'var(--bg-card, #131b2e)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History style={{ color: 'var(--accent-blue, #3b82f6)' }} size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Historial: {historyCustomer.name}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setHistoryCustomer(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(!historyCustomer.ledger || historyCustomer.ledger.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No hay movimientos registrados para este cliente.
                </div>
              ) : (
                historyCustomer.ledger.map((entry, i) => (
                  <div
                    key={entry.id || i}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: entry.type === 'charge' ? '3px solid #fbbf24' : '3px solid #34d399'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>
                        {entry.concept || (entry.type === 'charge' ? 'Pedido a cuenta' : 'Cobro de fiado')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {entry.date ? new Date(entry.date).toLocaleString('es-AR') : '—'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: entry.type === 'charge' ? '#fbbf24' : '#34d399'
                      }}>
                        {entry.type === 'charge' ? `+$${Number(entry.amount || 0).toLocaleString('es-AR')}` : `-$${Number(entry.amount || 0).toLocaleString('es-AR')}`}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Saldo: ${Number(entry.balanceAfter || 0).toLocaleString('es-AR')}
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
