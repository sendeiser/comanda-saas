import React, { useState, useEffect } from 'react';
import { 
  X, 
  Utensils, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  RefreshCw, 
  Plus, 
  AlertCircle 
} from 'lucide-react';
import { 
  getTables, 
  updateTableStatus, 
  TABLE_STATUSES, 
  saveTables, 
  generateDefaultTables 
} from '../../services/tableService.js';

export default function TableMapModal({ 
  isOpen, 
  onClose, 
  storeId = 'default', 
  selectedTableNumber, 
  onSelectTable 
}) {
  const [tables, setTables] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await getTables(storeId);
      setTables(data || []);
    } catch (err) {
      console.error('Error loading tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTables();
    }
  }, [isOpen, storeId]);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.storeId === storeId && Array.isArray(e.detail?.tables)) {
        setTables(e.detail.tables);
      } else {
        loadTables();
      }
    };
    window.addEventListener('comandafast:tables_updated', handleUpdate);
    return () => window.removeEventListener('comandafast:tables_updated', handleUpdate);
  }, [storeId]);

  if (!isOpen) return null;

  const freeCount = tables.filter(t => t.status === TABLE_STATUSES.FREE).length;
  const occupiedCount = tables.filter(t => t.status === TABLE_STATUSES.OCCUPIED).length;
  const billCount = tables.filter(t => t.status === TABLE_STATUSES.BILL_REQUESTED).length;

  const filteredTables = tables.filter(t => {
    if (filter === 'FREE') return t.status === TABLE_STATUSES.FREE;
    if (filter === 'OCCUPIED') return t.status === TABLE_STATUSES.OCCUPIED;
    if (filter === 'BILL') return t.status === TABLE_STATUSES.BILL_REQUESTED;
    return true;
  });

  const handleStatusChange = async (tableNumber, newStatus) => {
    await updateTableStatus(storeId, tableNumber, newStatus);
    const updated = await getTables(storeId);
    setTables(updated);
  };

  const handleAddTable = async () => {
    const nextNumber = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber)) + 1 : 1;
    const newTable = {
      id: `tbl_${storeId}_${nextNumber}`,
      storeId,
      tableNumber: nextNumber,
      label: `Mesa ${nextNumber}`,
      capacity: 4,
      status: TABLE_STATUSES.FREE,
      currentOrderId: null,
      currentOrderTotal: 0,
      openedAt: null,
      updatedAt: new Date().toISOString()
    };
    const nextTables = [...tables, newTable];
    await saveTables(storeId, nextTables);
    setTables(nextTables);
  };

  const handleResetTables = async () => {
    if (window.confirm('¿Deseas restablecer el mapa a 12 mesas por defecto?')) {
      const defaults = generateDefaultTables(storeId, 12);
      await saveTables(storeId, defaults);
      setTables(defaults);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '960px', 
          width: '95%', 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          padding: 0,
          background: 'var(--bg-card, #131b2e)',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--border-subtle, #1e293b)',
          overflow: 'hidden'
        }}
      >
        {/* MODAL HEADER */}
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
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber, #f59e0b)'
            }}>
              <Utensils size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary, #fff)', margin: 0 }}>
                Control de Salón & Mesas
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
                Monitoreo en vivo de comandas, ocupación y cuentas del local
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleAddTable}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Añadir una nueva mesa al plano"
            >
              <Plus size={15} />
              <span>+ Mesa</span>
            </button>
            <button
              type="button"
              onClick={handleResetTables}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.6rem' }}
              title="Restablecer a 12 mesas"
            >
              <RefreshCw size={14} />
            </button>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted, #94a3b8)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* METRICS & FILTER BAR */}
        <div style={{
          padding: '0.9rem 1.5rem',
          background: 'rgba(0,0,0,0.2)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle, #1e293b)'
        }}>
          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(16, 185, 129, 0.12)',
              borderRadius: '20px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.82rem',
              fontWeight: 700
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              {freeCount} Libres
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(245, 158, 11, 0.12)',
              borderRadius: '20px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              fontSize: '0.82rem',
              fontWeight: 700
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
              {occupiedCount} Ocupadas
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(139, 92, 246, 0.12)',
              borderRadius: '20px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#c084fc',
              fontSize: '0.82rem',
              fontWeight: 700
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
              {billCount} Cuenta Pedida
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', label: `Todas (${tables.length})` },
              { id: 'FREE', label: `Libres (${freeCount})` },
              { id: 'OCCUPIED', label: `Ocupadas (${occupiedCount})` },
              { id: 'BILL', label: `Cuentas (${billCount})` }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: filter === f.id ? '1px solid var(--accent-amber, #f59e0b)' : '1px solid var(--border-subtle, #1e293b)',
                  background: filter === f.id ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: filter === f.id ? 'var(--accent-amber, #f59e0b)' : 'var(--text-secondary, #94a3b8)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* TABLES GRID */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '14px'
        }}>
          {filteredTables.map(table => {
            const isFree = table.status === TABLE_STATUSES.FREE;
            const isOccupied = table.status === TABLE_STATUSES.OCCUPIED;
            const isBill = table.status === TABLE_STATUSES.BILL_REQUESTED;
            const isSelected = String(selectedTableNumber) === String(table.tableNumber);

            let borderColor = 'var(--border-subtle, #1e293b)';
            let statusBadgeBg = 'rgba(16, 185, 129, 0.12)';
            let statusTextColor = '#34d399';
            let statusLabel = 'Libre';

            if (isOccupied) {
              borderColor = 'rgba(245, 158, 11, 0.4)';
              statusBadgeBg = 'rgba(245, 158, 11, 0.15)';
              statusTextColor = '#fbbf24';
              statusLabel = 'Ocupada';
            } else if (isBill) {
              borderColor = 'rgba(139, 92, 246, 0.5)';
              statusBadgeBg = 'rgba(139, 92, 246, 0.2)';
              statusTextColor = '#c084fc';
              statusLabel = 'Pidiendo Cuenta';
            }

            if (isSelected) {
              borderColor = 'var(--accent-amber, #f59e0b)';
            }

            return (
              <div
                key={table.id || table.tableNumber}
                style={{
                  background: 'var(--bg-surface-card, #121929)',
                  borderRadius: '12px',
                  border: `2px solid ${borderColor}`,
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative',
                  boxShadow: isSelected ? '0 0 12px rgba(245, 158, 11, 0.3)' : 'none',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
              >
                {/* Card Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary, #fff)' }}>
                      {table.label || `Mesa ${table.tableNumber}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Users size={12} />
                      <span>Capacidad: {table.capacity || 4}p</span>
                    </div>
                  </div>

                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: statusBadgeBg,
                    color: statusTextColor
                  }}>
                    {statusLabel}
                  </span>
                </div>

                {/* Card Middle: Consumption info if occupied or bill */}
                {(isOccupied || isBill) && (
                  <div style={{
                    background: 'rgba(0,0,0,0.25)',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '0.78rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted, #94a3b8)' }}>
                      <span>Consumo:</span>
                      <strong style={{ color: 'var(--accent-emerald, #10b981)', fontSize: '0.9rem' }}>
                        ${Number(table.currentOrderTotal || 0).toLocaleString('es-AR')}
                      </strong>
                    </div>
                    {table.openedAt && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.7rem', marginTop: '4px' }}>
                        <Clock size={11} />
                        <span>Abierta: {new Date(table.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Actions */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* Select Table for current order */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectTable) {
                        onSelectTable(table.tableNumber);
                        onClose();
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isSelected ? 'var(--accent-amber, #f59e0b)' : 'var(--bg-subtle, rgba(255, 255, 255, 0.08))',
                      color: isSelected ? '#000' : 'var(--text-primary, #fff)',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>{isSelected ? 'Mesa Seleccionada' : 'Cargar Pedido'}</span>
                  </button>

                  {/* Status Transition buttons */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {isFree && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(table.tableNumber, TABLE_STATUSES.OCCUPIED)}
                        style={{
                          flex: 1,
                          padding: '5px',
                          borderRadius: '6px',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          background: 'rgba(245, 158, 11, 0.1)',
                          color: '#fbbf24',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Ocupar
                      </button>
                    )}

                    {isOccupied && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(table.tableNumber, TABLE_STATUSES.BILL_REQUESTED)}
                          style={{
                            flex: 1,
                            padding: '5px',
                            borderRadius: '6px',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            background: 'rgba(139, 92, 246, 0.1)',
                            color: '#c084fc',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <Receipt size={12} />
                          <span>Pedir Cuenta</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(table.tableNumber, TABLE_STATUSES.FREE)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#34d399',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="Liberar mesa directamente"
                        >
                          Liberar
                        </button>
                      </>
                    )}

                    {isBill && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(table.tableNumber, TABLE_STATUSES.FREE)}
                        style={{
                          flex: 1,
                          padding: '5px',
                          borderRadius: '6px',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCircle2 size={12} />
                        <span>Cobrar y Liberar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
