import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Unlock, 
  Plus, 
  ExternalLink, 
  MessageSquare, 
  ArrowLeft, 
  Search, 
  CreditCard, 
  X,
  Sparkles
} from 'lucide-react';
import { 
  getSubscriptions, 
  recordSubscriptionPayment, 
  toggleStoreSuspension, 
  calculateSaasMetrics, 
  generateStoreReminderMessage,
  DEFAULT_SAAS_PLANS,
  saveSubscriptions
} from '../../services/saasCrmService.js';
import StoreOnboardingWizard from './onboarding/StoreOnboardingWizard.jsx';

export default function SaasAdminPortal({ onBackToPos, onSelectStore }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, OVERDUE, SUSPENDED
  const [loading, setLoading] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  
  // Payment modal state
  const [paymentModalSub, setPaymentModalSub] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transferencia');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptions();
      setSubscriptions(data || []);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = (e) => {
      if (Array.isArray(e.detail?.subscriptions)) {
        setSubscriptions(e.detail.subscriptions);
      } else {
        loadData();
      }
    };
    window.addEventListener('comandafast:saas_subscriptions_updated', handleUpdate);
    return () => window.removeEventListener('comandafast:saas_subscriptions_updated', handleUpdate);
  }, []);

  const metrics = calculateSaasMetrics(subscriptions);

  const filteredSubs = subscriptions.filter(sub => {
    const matchSearch = 
      (sub.storeName || '').toLowerCase().includes(search.toLowerCase()) ||
      (sub.ownerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (sub.ownerPhone || '').includes(search) ||
      (sub.slug || '').toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (filter === 'ACTIVE') return sub.status === 'al_dia' || sub.status === 'por_vencer';
    if (filter === 'OVERDUE') return sub.status === 'vencido' || sub.status === 'por_vencer';
    if (filter === 'SUSPENDED') return sub.status === 'suspendido';
    return true;
  });

  const handleOpenPayment = (sub) => {
    setPaymentModalSub(sub);
    setPaymentAmount(sub.monthlyFee || 28000);
    setPaymentMethod('transferencia');
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalSub) return;
    try {
      await recordSubscriptionPayment(paymentModalSub.storeId, Number(paymentAmount), paymentMethod);
      const updated = await getSubscriptions();
      setSubscriptions(updated);
      setPaymentModalSub(null);
    } catch (err) {
      alert('Error al registrar pago: ' + err.message);
    }
  };

  const handleToggleSuspend = async (sub) => {
    const shouldSuspend = !sub.isManuallySuspended;
    const action = shouldSuspend ? 'suspender el servicio de' : 'reactivar el servicio para';
    if (window.confirm(`¿Seguro que deseas ${action} ${sub.storeName}?`)) {
      await toggleStoreSuspension(sub.storeId, shouldSuspend);
      const updated = await getSubscriptions();
      setSubscriptions(updated);
    }
  };

  const handleOnboardingComplete = async (createdStore) => {
    setIsOnboardingOpen(false);
    if (!createdStore) return;
    
    // Auto-create SaaS subscription record for the newly registered store
    const now = new Date();
    const nextDueDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString();
    
    const newSub = {
      storeId: createdStore.id || createdStore.slug,
      storeName: createdStore.name,
      slug: createdStore.slug,
      ownerName: createdStore.ownerName || 'Dueño/a',
      ownerPhone: createdStore.phone || '',
      plan: 'pro',
      monthlyFee: 28000,
      billingDay: now.getDate(),
      status: 'al_dia',
      isManuallySuspended: false,
      lastPaymentDate: now.toISOString(),
      lastPaymentAmount: 28000,
      nextDueDate,
      createdAt: now.toISOString()
    };

    const nextList = [newSub, ...subscriptions];
    await saveSubscriptions(nextList);
    setSubscriptions(nextList);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main, #0b0f19)',
      color: 'var(--text-primary, #f8fafc)',
      padding: '1.5rem',
      fontFamily: 'var(--font-main, sans-serif)'
    }}>
      {/* TOP BAR */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        borderBottom: '1px solid var(--border-subtle, #1e293b)',
        paddingBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onBackToPos}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 0.8rem',
              fontSize: '0.85rem'
            }}
          >
            <ArrowLeft size={16} />
            <span>Volver al POS</span>
          </button>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 style={{ color: 'var(--accent-amber, #f59e0b)' }} size={24} />
              <span>SaaS Central: Gestión de Clientes Gastronómicos</span>
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '2px 0 0' }}>
              Control de suscripciones, altas remotas, cobranzas y corte de licencias
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOnboardingOpen(true)}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.6rem 1.1rem',
            fontWeight: 800,
            borderRadius: '10px'
          }}
        >
          <Plus size={18} />
          <span>+ Nuevo Comercio Gastronómico</span>
        </button>
      </div>

      {/* METRIC STATCARDS */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem'
      }}>
        {/* MRR Card */}
        <div style={{
          background: 'var(--bg-surface-card, #121929)',
          border: '1px solid var(--border-subtle, #1e293b)',
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-emerald, #10b981)'
          }}>
            <DollarSign size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
              MRR (Ingresos Recurrentes)
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399' }}>
              ${metrics.mrr.toLocaleString('es-AR')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)' }}>
              Proyección mensual activa
            </div>
          </div>
        </div>

        {/* Active Stores */}
        <div style={{
          background: 'var(--bg-surface-card, #121929)',
          border: '1px solid var(--border-subtle, #1e293b)',
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-blue, #3b82f6)'
          }}>
            <Building2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
              Locales Activos / Al Día
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary, #fff)' }}>
              {metrics.activeCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {metrics.totalStores}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#60a5fa' }}>
              {metrics.totalStores > 0 ? Math.round((metrics.activeCount / metrics.totalStores) * 100) : 100}% operativos
            </div>
          </div>
        </div>

        {/* Overdue / Alerts */}
        <div style={{
          background: 'var(--bg-surface-card, #121929)',
          border: metrics.overdueCount > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle, #1e293b)',
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-rose, #ef4444)'
          }}>
            <AlertTriangle size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
              Abonos Por Vencer / Vencidos
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: metrics.overdueCount > 0 ? '#f87171' : 'var(--text-primary)' }}>
              {metrics.overdueCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Requieren seguimiento de cobro
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 1rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
      }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar por comercio, dueño o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', height: '42px', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'ALL', label: `Todos (${subscriptions.length})` },
            { id: 'ACTIVE', label: 'Al Día' },
            { id: 'OVERDUE', label: 'Por Cobrar' },
            { id: 'SUSPENDED', label: 'Suspendidos' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: filter === f.id ? '1px solid var(--accent-amber, #f59e0b)' : '1px solid var(--border-subtle, #1e293b)',
                background: filter === f.id ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-surface-card, #121929)',
                color: filter === f.id ? 'var(--accent-amber, #f59e0b)' : 'var(--text-secondary, #94a3b8)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* CLIENTS TABLE */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'var(--bg-surface-card, #121929)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle, #1e293b)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{
                background: 'var(--bg-surface-elevated, #162035)',
                borderBottom: '1px solid var(--border-subtle, #1e293b)',
                color: 'var(--text-muted, #94a3b8)'
              }}>
                <th style={{ padding: '0.9rem 1rem' }}>Comercio</th>
                <th style={{ padding: '0.9rem 1rem' }}>Dueño / Contacto</th>
                <th style={{ padding: '0.9rem 1rem' }}>Plan & Tarifa</th>
                <th style={{ padding: '0.9rem 1rem' }}>Próx. Vencimiento</th>
                <th style={{ padding: '0.9rem 1rem' }}>Estado</th>
                <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No se encontraron comercios registrados que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredSubs.map(sub => {
                  const isAlDia = sub.status === 'al_dia';
                  const isPorVencer = sub.status === 'por_vencer';
                  const isVencido = sub.status === 'vencido';
                  const isSuspendido = sub.status === 'suspendido';

                  let statusBadge = (
                    <span style={{ padding: '4px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700, fontSize: '0.75rem' }}>
                      🟢 Al Día
                    </span>
                  );
                  if (isPorVencer) {
                    statusBadge = (
                      <span style={{ padding: '4px 8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: 700, fontSize: '0.75rem' }}>
                        🟡 Por Vencer
                      </span>
                    );
                  } else if (isVencido) {
                    statusBadge = (
                      <span style={{ padding: '4px 8px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: 700, fontSize: '0.75rem' }}>
                        🔴 Vencido
                      </span>
                    );
                  } else if (isSuspendido) {
                    statusBadge = (
                      <span style={{ padding: '4px 8px', borderRadius: '12px', background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', fontWeight: 700, fontSize: '0.75rem' }}>
                        🔒 Suspendido
                      </span>
                    );
                  }

                  const reminder = generateStoreReminderMessage(sub);

                  return (
                    <tr 
                      key={sub.storeId || sub.slug}
                      style={{ borderBottom: '1px solid var(--border-subtle, #1e293b)' }}
                    >
                      {/* Store */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-primary, #fff)', fontSize: '0.92rem' }}>
                          {sub.storeName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <span>/{sub.slug}</span>
                          <a 
                            href={`/carta/${sub.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: 'var(--accent-amber, #f59e0b)', display: 'inline-flex', alignItems: 'center' }}
                            title="Abrir carta digital pública"
                          >
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      </td>

                      {/* Owner */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ fontWeight: 600 }}>{sub.ownerName || 'Sin asignar'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {sub.ownerPhone || 'Sin teléfono'}
                        </div>
                      </td>

                      {/* Plan */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          ${Number(sub.monthlyFee || 0).toLocaleString('es-AR')}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/mes</span>
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-secondary)'
                        }}>
                          {DEFAULT_SAAS_PLANS[sub.plan]?.name || sub.plan}
                        </span>
                      </td>

                      {/* Due date */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ fontWeight: 600 }}>
                          {sub.nextDueDate ? new Date(sub.nextDueDate).toLocaleDateString('es-AR') : '—'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Día {sub.billingDay || 10} de cada mes
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        {statusBadge}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(sub)}
                            className="btn btn-secondary"
                            style={{
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#34d399',
                              borderColor: 'rgba(16, 185, 129, 0.3)'
                            }}
                            title="Registrar cobro de mensualidad (+30 días)"
                          >
                            <CreditCard size={13} />
                            <span>Cobrar</span>
                          </button>

                          <a
                            href={reminder.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#25D366',
                              textDecoration: 'none'
                            }}
                            title="Enviar aviso de cobro por WhatsApp"
                          >
                            <MessageSquare size={13} />
                            <span>Aviso</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleToggleSuspend(sub)}
                            className="btn btn-secondary"
                            style={{
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: sub.isManuallySuspended ? '#34d399' : '#f87171'
                            }}
                            title={sub.isManuallySuspended ? 'Reactivar servicio' : 'Suspender servicio'}
                          >
                            {sub.isManuallySuspended ? <Unlock size={13} /> : <Lock size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {paymentModalSub && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: '420px', background: 'var(--bg-card, #131b2e)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard style={{ color: 'var(--accent-emerald, #10b981)' }} size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Registrar Cobro de Abono</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setPaymentModalSub(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
              Comercio: <strong style={{ color: '#fff' }}>{paymentModalSub.storeName}</strong>
            </p>

            <form onSubmit={handleConfirmPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Monto Cobrado ($)
                </label>
                <input
                  type="number"
                  className="input-field"
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  style={{ width: '100%', fontSize: '1.1rem', fontWeight: 800 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Método de Cobro
                </label>
                <select
                  className="input-field"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="transferencia">Transferencia Bancaria / CVU</option>
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="efectivo">Efectivo en Mano</option>
                </select>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '0.6rem 0.8rem',
                fontSize: '0.78rem',
                color: '#34d399'
              }}>
                ✅ Al confirmar, el local quedará activo y el próximo vencimiento se extenderá automáticamente por 30 días.
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentModalSub(null)}
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

      {/* ONBOARDING WIZARD */}
      {isOnboardingOpen && (
        <StoreOnboardingWizard
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onStoreCreated={handleOnboardingComplete}
        />
      )}
    </div>
  );
}
