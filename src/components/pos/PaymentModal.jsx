import React, { useState, useEffect } from 'react';
import { X, DollarSign, Smartphone, CreditCard, Printer, CheckCircle, Copy, AlertTriangle, Users } from 'lucide-react';
import { getCustomers, saveCustomer } from '../../services/customerCrmService.js';

export default function PaymentModal({ 
  cartTotal, 
  settings, 
  customer,
  channel,
  onConfirmOrder, 
  onClose 
}) {
  const [method, setMethod] = useState('efectivo'); // 'efectivo' | 'transferencia' | 'tarjeta' | 'a_cuenta'
  const [cashPaid, setCashPaid] = useState('');
  const [transferProof, setTransferProof] = useState('');
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [autoPrint, setAutoPrint] = useState(settings?.autoPrintOnConfirm ?? true);
  const [copiedAlias, setCopiedAlias] = useState(false);

  // CRM Fiados State
  const [storeCustomers, setStoreCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newFiadoName, setNewFiadoName] = useState(customer?.name || '');
  const [newFiadoPhone, setNewFiadoPhone] = useState(customer?.phone || '');

  const storeId = settings?.storeSlug || settings?.storeId || 'default';

  useEffect(() => {
    getCustomers(storeId).then(list => {
      setStoreCustomers(list || []);
      if (customer?.name) {
        const found = list.find(c => c.name.toLowerCase() === customer.name.toLowerCase());
        if (found) setSelectedCustomerId(found.id);
      }
    }).catch(console.warn);
  }, [storeId, customer]);

  const numCashPaid = parseFloat(cashPaid) || 0;
  const cashChange = Math.max(0, numCashPaid - cartTotal);

  const copyAlias = () => {
    if (settings?.alias) {
      navigator.clipboard.writeText(settings.alias);
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
    }
  };

  const selectedCustomerObj = storeCustomers.find(c => c.id === selectedCustomerId);

  const handleFinalize = async () => {
    if (method === 'efectivo' && numCashPaid > 0 && numCashPaid < cartTotal) {
      alert('El monto recibido en efectivo es menor al total del pedido.');
      return;
    }

    let finalCustomerId = selectedCustomerId;
    let finalCustomerName = selectedCustomerObj?.name || newFiadoName.trim() || customer?.name || 'Cliente';

    if (method === 'a_cuenta') {
      if (!finalCustomerId && !newFiadoName.trim()) {
        alert('Por favor selecciona un cliente existente o escribe su nombre para anotar en cuenta corriente.');
        return;
      }
      if (!finalCustomerId && newFiadoName.trim()) {
        const created = await saveCustomer(storeId, {
          name: newFiadoName.trim(),
          phone: newFiadoPhone.trim(),
          address: customer?.address || ''
        });
        finalCustomerId = created.id;
        finalCustomerName = created.name;
      }
    }

    onConfirmOrder({
      paymentMethod: method,
      cashPaid: method === 'efectivo' ? numCashPaid : null,
      cashChange: method === 'efectivo' ? cashChange : null,
      transferProof: method === 'transferencia' ? transferProof.trim() : null,
      transferConfirmed: method === 'transferencia' ? transferConfirmed : null,
      customerId: method === 'a_cuenta' ? finalCustomerId : null,
      customerName: finalCustomerName,
      autoPrint
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <DollarSign size={24} style={{ color: 'var(--accent-amber)' }} />
            <span>Cobro & Cierre de Pedido</span>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Total Highlight */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.15))', 
          border: '1px solid var(--accent-amber)', 
          borderRadius: 'var(--radius-md)', 
          padding: '1rem', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>TOTAL A COBRAR</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--accent-amber)', fontFamily: 'var(--font-heading)' }}>
            ${cartTotal.toLocaleString('es-AR')}
          </div>
        </div>

        {/* Method Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
          <button
            type="button"
            className={`cat-pill-btn ${method === 'efectivo' ? 'active' : ''}`}
            style={{ justifyContent: 'center', fontSize: '0.78rem', padding: '0.5rem 0.2rem' }}
            onClick={() => setMethod('efectivo')}
          >
            <DollarSign size={15} />
            <span>Efectivo</span>
          </button>

          <button
            type="button"
            className={`cat-pill-btn ${method === 'transferencia' ? 'active' : ''}`}
            style={{ justifyContent: 'center', fontSize: '0.78rem', padding: '0.5rem 0.2rem' }}
            onClick={() => setMethod('transferencia')}
          >
            <Smartphone size={15} />
            <span>Transfer</span>
          </button>

          <button
            type="button"
            className={`cat-pill-btn ${method === 'tarjeta' ? 'active' : ''}`}
            style={{ justifyContent: 'center', fontSize: '0.78rem', padding: '0.5rem 0.2rem' }}
            onClick={() => setMethod('tarjeta')}
          >
            <CreditCard size={15} />
            <span>Tarjeta</span>
          </button>

          <button
            type="button"
            className={`cat-pill-btn ${method === 'a_cuenta' ? 'active' : ''}`}
            style={{ 
              justifyContent: 'center', 
              fontSize: '0.78rem', 
              padding: '0.5rem 0.2rem',
              borderColor: method === 'a_cuenta' ? '#fbbf24' : 'inherit',
              color: method === 'a_cuenta' ? '#fbbf24' : 'inherit'
            }}
            onClick={() => setMethod('a_cuenta')}
            title="Anotar en libreta de cuenta corriente / fiado"
          >
            <Users size={15} />
            <span>A Cuenta</span>
          </button>
        </div>

        {/* EFECTIVO PANEL */}
        {method === 'efectivo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Paga con cuánto dinero ($):</div>
            <input
              type="number"
              className="custom-input-sm"
              style={{ fontSize: '1.2rem', fontWeight: 800, padding: '0.6rem' }}
              placeholder={`Monto recibido (ej: ${cartTotal})`}
              value={cashPaid}
              onChange={e => setCashPaid(e.target.value)}
              autoFocus
            />

            {/* Quick Cash Buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="qty-btn" 
                style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                onClick={() => setCashPaid(cartTotal.toString())}
              >
                Exacto
              </button>
              {[1000, 2000, 5000, 10000, 20000].map(val => (
                <button
                  key={val}
                  type="button"
                  className="qty-btn"
                  style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                  onClick={() => setCashPaid(val.toString())}
                >
                  ${val.toLocaleString('es-AR')}
                </button>
              ))}
            </div>

            {numCashPaid >= cartTotal && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-active)' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>VUELTO A ENTREGAR:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
                  ${cashChange.toLocaleString('es-AR')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* TRANSFERENCIA PANEL */}
        {method === 'transferencia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ALIAS MERCADO PAGO / BANCO:</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                  {settings?.alias || 'BURGER.CHAMICAL.MP'}
                </div>
              </div>
              <button 
                type="button"
                className="qty-btn"
                style={{ width: 'auto', padding: '0.4rem 0.75rem', gap: '4px' }}
                onClick={copyAlias}
              >
                <Copy size={14} />
                <span>{copiedAlias ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                Nro. de Comprobante / Transacción (Opcional):
              </div>
              <input
                type="text"
                className="custom-input-sm"
                placeholder="Ej: 948271842 o Nombre del Titular"
                value={transferProof}
                onChange={e => setTransferProof(e.target.value)}
              />
            </div>

            {/* Toggle de Acreditación */}
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              background: transferConfirmed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: transferConfirmed ? '1px solid var(--accent-emerald)' : '1px solid var(--accent-rose)',
              padding: '0.75rem', 
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={transferConfirmed}
                onChange={e => setTransferConfirmed(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--accent-emerald)' }}
              />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: transferConfirmed ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  {transferConfirmed ? '✅ Transferencia Acreditada en Cuenta' : '⚠️ Transferencia Pendiente / No Acreditada'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {transferConfirmed ? 'El dinero ya impactó. Listo para despachar.' : 'Verifica en la app bancaria antes de entregar.'}
                </div>
              </div>
            </label>
          </div>
        )}

        {/* TARJETA PANEL */}
        {method === 'tarjeta' && (
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <CreditCard size={32} style={{ color: 'var(--accent-blue)', margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Cobro con Posnet / Lector de Tarjetas</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Pase la tarjeta por la terminal de cobro y confirme.</div>
          </div>
        )}

        {/* A CUENTA / FIADO PANEL */}
        {method === 'a_cuenta' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: '#fbbf24' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24' }}>
                Imputar a Cuenta Corriente (Fiado)
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                Seleccionar Cliente de la Libreta:
              </label>
              <select
                className="input-field"
                value={selectedCustomerId}
                onChange={e => {
                  setSelectedCustomerId(e.target.value);
                  if (e.target.value) {
                    const match = storeCustomers.find(c => c.id === e.target.value);
                    if (match) {
                      setNewFiadoName(match.name);
                      setNewFiadoPhone(match.phone || '');
                    }
                  }
                }}
                style={{ width: '100%' }}
              >
                <option value="">-- O registrar un nuevo cliente abajo --</option>
                {storeCustomers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''} — Saldo actual: ${Number(c.currentBalance || 0).toLocaleString('es-AR')}
                  </option>
                ))}
              </select>
            </div>

            {!selectedCustomerId && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    Nombre del Cliente:
                  </label>
                  <input
                    type="text"
                    className="custom-input-sm"
                    placeholder="Ej: Marcelo Morales"
                    value={newFiadoName}
                    onChange={e => setNewFiadoName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    Teléfono / WhatsApp:
                  </label>
                  <input
                    type="text"
                    className="custom-input-sm"
                    placeholder="Ej: 3826 430159"
                    value={newFiadoPhone}
                    onChange={e => setNewFiadoPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {selectedCustomerObj && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '0.6rem 0.8rem',
                fontSize: '0.8rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Saldo actual: ${Number(selectedCustomerObj.currentBalance || 0).toLocaleString('es-AR')}</div>
                  <div style={{ color: '#fff', fontWeight: 700 }}>Nuevo saldo tras este pedido:</div>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24' }}>
                  ${(Number(selectedCustomerObj.currentBalance || 0) + cartTotal).toLocaleString('es-AR')}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auto Print Checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={autoPrint}
            onChange={e => setAutoPrint(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-amber)' }}
          />
          <Printer size={16} style={{ color: 'var(--accent-amber)' }} />
          <span>Imprimir automáticamente tickets térmicos (Cocina + Cliente)</span>
        </label>

        {/* Confirm Button */}
        <button 
          className="btn-confirm-order"
          onClick={handleFinalize}
        >
          <CheckCircle size={20} />
          <span>Confirmar Venta y Enviar a Cocina</span>
        </button>
      </div>
    </div>
  );
}
