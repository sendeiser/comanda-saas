// src/components/admin/onboarding/StoreOnboardingWizard.jsx
import React, { useState } from 'react';
import { 
  Building2, Palette, Clock, Truck, CreditCard, 
  Check, ArrowRight, ArrowLeft, Sparkles, Store, 
  ExternalLink, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { STORE_TEMPLATES } from '../../../data/storeTemplates.js';
import { sanitizeSlug, saveStoreConfig, getActiveStore } from '../../../services/storeService.js';
import { applyStoreTheme } from '../../../services/themeService.js';
import { storageService } from '../../../services/storageService.js';

export default function StoreOnboardingWizard({ isOpen, onClose, onStoreCreated }) {
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState('fast_food');
  
  // Form State
  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#f59e0b');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [bgDark, setBgDark] = useState('#0b0f19');
  
  // Ops & Contact
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(1500);
  const [hasDelivery, setHasDelivery] = useState(true);
  const [hasTables, setHasTables] = useState(true);

  // Payments
  const [acceptCash, setAcceptCash] = useState(true);
  const [acceptTransfer, setAcceptTransfer] = useState(true);
  const [transferAlias, setTransferAlias] = useState('');
  const [transferBank, setTransferBank] = useState('');

  // Creation State
  const [seedProducts, setSeedProducts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdStore, setCreatedStore] = useState(null);

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    setStoreName(val);
    if (!isSlugManual) {
      setSlug(sanitizeSlug(val));
    }
  };

  const handleIndustrySelect = (indId) => {
    setSelectedIndustry(indId);
    const tmpl = STORE_TEMPLATES.find(t => t.id === indId);
    if (tmpl && tmpl.theme) {
      setPrimaryColor(tmpl.theme.primaryColor || '#f59e0b');
      setAccentColor(tmpl.theme.accentColor || '#10b981');
      setBgDark(tmpl.theme.bgDark || '#0b0f19');
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    setErrorMsg('');

    try {
      const cleanSlug = sanitizeSlug(slug || storeName);
      if (!storeName.trim()) throw new Error('Por favor ingresá el nombre del comercio.');
      if (!cleanSlug) throw new Error('Por favor ingresá un slug web válido.');

      const tmpl = STORE_TEMPLATES.find(t => t.id === selectedIndustry) || STORE_TEMPLATES[0];

      const storePayload = {
        name: storeName.trim(),
        slug: cleanSlug,
        tagline: tagline.trim() || tmpl.name,
        industry: selectedIndustry,
        theme: {
          primaryColor,
          accentColor,
          bgDark,
          surfaceDark: '#131b2e',
          fontFamily: tmpl.theme?.fontFamily || "'Plus Jakarta Sans', sans-serif"
        },
        contactInfo: {
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || phone.trim(),
          address: address.trim(),
          instagram: ''
        },
        deliverySettings: {
          enabled: hasDelivery,
          baseFee: Number(deliveryFee) || 0
        },
        paymentSettings: {
          acceptCash,
          acceptTransfer,
          transferAlias: transferAlias.trim().toUpperCase(),
          transferBank: transferBank.trim()
        },
        isActive: true
      };

      const saved = await saveStoreConfig(storePayload);
      applyStoreTheme(saved.theme);

      // Seed initial menu items if requested
      if (seedProducts && tmpl.sampleProducts?.length > 0) {
        const seededList = tmpl.sampleProducts.map((p, idx) => ({
          id: `prod_${Date.now()}_${idx}`,
          name: p.name,
          category: p.category,
          price: p.price,
          emoji: p.emoji,
          description: p.description,
          available: true,
          is_active: true,
          modifiers: []
        }));
        storageService.saveProducts(seededList);
      }

      setCreatedStore(saved);
      if (onStoreCreated) onStoreCreated(saved);
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar la configuración del comercio.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0e1626'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Store size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Nuevo Comercio Gastronómico
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Paso {step} de 4 — Asistente de Configuración White-Label
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, color: '#f8fafc' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#fca5a5',
              fontSize: '0.9rem'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: IDENTIDAD Y RUBRO */}
          {step === 1 && !createdStore && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>1. Seleccioná el rubro del local</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: 20 }}>
                {STORE_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleIndustrySelect(t.id)}
                    style={{
                      background: selectedIndustry === t.id ? 'rgba(245, 158, 11, 0.15)' : '#1e293b',
                      border: selectedIndustry === t.id ? '2px solid #f59e0b' : '1px solid #334155',
                      borderRadius: '12px',
                      padding: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#fff',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{t.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{t.description}</div>
                  </button>
                ))}
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>2. Nombre e Identidad Web</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 6 }}>
                  Nombre Comercial del Negocio *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pizzería Don Tito, Burger Club, La Farola..."
                  value={storeName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#0e1626',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 6 }}>
                  Slug para la carta web (URL pública de autoservicio) *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#0e1626', border: '1px solid #334155', borderRadius: '8px', padding: '0 12px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>tudominio.com/carta/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setIsSlugManual(true);
                      setSlug(sanitizeSlug(e.target.value));
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 6px',
                      background: 'transparent',
                      border: 'none',
                      color: '#f59e0b',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>Color Principal</label>
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: '100%', height: 38, border: 'none', borderRadius: 6, background: '#0e1626', cursor: 'pointer' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>Color Acento</label>
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ width: '100%', height: 38, border: 'none', borderRadius: 6, background: '#0e1626', cursor: 'pointer' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>Fondo Oscuro</label>
                  <input type="color" value={bgDark} onChange={(e) => setBgDark(e.target.value)} style={{ width: '100%', height: 38, border: 'none', borderRadius: 6, background: '#0e1626', cursor: 'pointer' }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OPERACIONES & CONTACTO */}
          {step === 2 && !createdStore && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Modalidades de Venta Habilitadas</h3>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <label style={{ flex: 1, background: '#1e293b', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={hasDelivery} onChange={(e) => setHasDelivery(e.target.checked)} />
                  <span style={{ fontWeight: 700 }}>🛵 Delivery</span>
                </label>
                <label style={{ flex: 1, background: '#1e293b', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={hasTables} onChange={(e) => setHasTables(e.target.checked)} />
                  <span style={{ fontWeight: 700 }}>🍽️ Salón & Mesas</span>
                </label>
              </div>

              {hasDelivery && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 6 }}>
                    Costo Base de Envío ($)
                  </label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0e1626', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 6 }}>
                  Número de WhatsApp del Local (con código de país) *
                </label>
                <input
                  type="text"
                  placeholder="Ej: 5493826123456"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0e1626', border: '1px solid #334155', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 6 }}>
                  Dirección del Local
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av. San Martín 450, Centro"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0e1626', border: '1px solid #334155', color: '#fff' }}
                />
              </div>
            </div>
          )}

          {/* STEP 3: COBROS */}
          {step === 3 && !createdStore && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Métodos de Pago Aceptados</h3>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <label style={{ flex: 1, background: '#1e293b', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={acceptCash} onChange={(e) => setAcceptCash(e.target.checked)} />
                  <span style={{ fontWeight: 700 }}>💵 Efectivo</span>
                </label>
                <label style={{ flex: 1, background: '#1e293b', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={acceptTransfer} onChange={(e) => setAcceptTransfer(e.target.checked)} />
                  <span style={{ fontWeight: 700 }}>🏦 Transferencia / MP</span>
                </label>
              </div>

              {acceptTransfer && (
                <div style={{ background: '#0e1626', padding: 16, borderRadius: 8, border: '1px solid #1e293b', marginBottom: 16 }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 6 }}>
                      Alias para Transferencias (Mercado Pago o Banco)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: TITO.PIZZAS.MP"
                      value={transferAlias}
                      onChange={(e) => setTransferAlias(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #334155', color: '#fff', textTransform: 'uppercase' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 6 }}>
                      Nombre del Banco o Billetera
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Mercado Pago / Banco Santander"
                      value={transferBank}
                      onChange={(e) => setTransferBank(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111827', border: '1px solid #334155', color: '#fff' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: 14, borderRadius: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={seedProducts} onChange={(e) => setSeedProducts(e.target.checked)} />
                  <div>
                    <span style={{ fontWeight: 800, color: '#f59e0b' }}>Sembrar menú demo inicial</span>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>
                      Cargará productos y categorías sugeridas del rubro seleccionado para que el local empiece a vender de inmediato.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS SUMMARY */}
          {createdStore && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                ¡{createdStore.name} está listo para operar!
              </h3>
              <p style={{ color: '#94a3b8', maxWidth: 440, margin: '0 auto 24px auto', fontSize: '0.95rem' }}>
                Se configuró la identidad de marca, los medios de cobro y la carta web pública.
              </p>

              <div style={{
                background: '#0e1626',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: 24,
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 4 }}>Enlace público a la carta web:</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111827', padding: '10px 14px', borderRadius: '8px' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>
                    /carta/{createdStore.slug}
                  </span>
                  <a
                    href={`/carta/${createdStore.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    <span>Abrir</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#f59e0b',
                  color: '#000',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Comenzar a Facturar
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {!createdStore && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #1f2937',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0e1626'
          }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                style={{
                  background: '#1e293b',
                  border: 'none',
                  color: '#f8fafc',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                <ArrowLeft size={16} />
                <span>Anterior</span>
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !storeName.trim()) {
                    setErrorMsg('Por favor ingresá el nombre del comercio antes de continuar.');
                    return;
                  }
                  setErrorMsg('');
                  setStep(step + 1);
                }}
                style={{
                  background: '#f59e0b',
                  border: 'none',
                  color: '#000',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                <span>Siguiente</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isSaving}
                style={{
                  background: '#10b981',
                  border: 'none',
                  color: '#000',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                <Sparkles size={16} />
                <span>{isSaving ? 'Configurando...' : 'Crear Comercio y Activar'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
