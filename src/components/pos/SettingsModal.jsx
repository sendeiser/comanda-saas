import React, { useState } from 'react';
import { 
  X, Settings, Download, Upload, Printer, DollarSign, Database, 
  Bluetooth, Usb, CheckCircle, Palette, FileText, Check, Hash, 
  RotateCcw, QrCode, Globe, Copy, ExternalLink, Image, Sparkles 
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { printerService } from '../../services/printerService';
import { supabaseSync } from '../../services/supabaseClient';
import { getActiveStore, sanitizeSlug } from '../../services/storeService';
import { CATALOG_THEMES } from '../../data/catalogThemes';

export default function SettingsModal({ settings, onSaveSettings, onOpenCatalogQR, onClose }) {
  const activeStore = getActiveStore();
  const [form, setForm] = useState(() => {
    const creds = supabaseSync.getCredentials();
    return {
      ...settings,
      slug: settings?.slug || activeStore?.slug || sanitizeSlug(settings?.businessName || settings?.nombre_local || 'mi-comercio'),
      primaryColor: settings?.primaryColor || activeStore?.theme?.primaryColor || '#f59e0b',
      accentColor: settings?.accentColor || activeStore?.theme?.accentColor || '#10b981',
      catalog_theme: settings?.catalog_theme || activeStore?.catalogTheme || 'retro-burger',
      logo_url: settings?.logo_url || settings?.logo || activeStore?.logoUrl || '',
      banner_url: settings?.banner_url || settings?.banner || activeStore?.bannerUrl || '',
      supabaseUrl: settings?.supabaseUrl && !settings.supabaseUrl.includes('yqynuvjpipmvurualgtg') ? settings.supabaseUrl : creds.url,
      supabaseAnonKey: settings?.supabaseAnonKey && !settings.supabaseAnonKey.includes('yqynuvjpipmvurualgtg') ? settings.supabaseAnonKey : creds.anonKey
    };
  });
  const [copySuccess, setCopySuccess] = useState(false);

  const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const currentSlug = sanitizeSlug(form.slug || form.businessName || 'mi-comercio');
  const catalogDirectUrl = `${defaultOrigin}/#catalog?store=${encodeURIComponent(currentSlug)}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(form);
    alert('Configuraciones y estilo de marca guardados correctamente.');
    onClose();
  };

  const handleTestPrint = () => {
    printerService.printTestTicket('58mm', form);
  };

  const handleTestDrawer = () => {
    printerService.kickCashDrawer(form);
  };

  const handleConnectUsb = async () => {
    await printerService.connectUsbSerial();
  };

  const handleConnectBluetooth = async () => {
    await printerService.connectBluetooth();
  };

  const handleExport = () => {
    const json = storageService.exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comandafast_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const ok = storageService.importBackup(event.target?.result);
        if (ok) {
          alert('Copia de seguridad restaurada. Recargando la aplicación...');
          window.location.reload();
        } else {
          alert('Error al leer el archivo de copia.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Settings size={24} style={{ color: 'var(--accent-amber)' }} />
            <span>Configuración — Xprinter XP-58IIH</span>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* DATOS COMERCIO */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nombre del Comercio (Membrete de Tickets):</label>
            <input type="text" className="custom-input-sm" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Eslogan / Subtítulo:</label>
              <input type="text" className="custom-input-sm" value={form.slogan} onChange={e => setForm({ ...form, slogan: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Teléfono / WhatsApp:</label>
              <input type="text" className="custom-input-sm" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dirección del Local:</label>
              <input type="text" className="custom-input-sm" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alias MP / Banco para Transferencias:</label>
              <input type="text" className="custom-input-sm" value={form.alias} onChange={e => setForm({ ...form, alias: e.target.value })} />
            </div>
          </div>

          {/* IDENTIDAD DE MARCA, COLORES Y ENLACE ÚNICO DE CARTA DIGITAL */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(16, 185, 129, 0.04))', 
            border: '1.5px solid var(--accent-amber)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.9rem' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} />
                <span>Identidad de Marca, Colores y Enlace de Catálogo</span>
              </div>
              <span className="brand-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)' }}>
                Multi-Negocio
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Personalizá el estilo exclusivo de tu local para el <strong>POS</strong> y tu <strong>Carta Digital</strong>. Cada comercio cuenta con su propio enlace web independiente para pedidos online y mesas.
            </div>

            {/* SLUG Y ENLACE DEL CATÁLOGO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={15} style={{ color: 'var(--accent-blue, #38bdf8)' }} />
                <span>Identificador Web / Slug del Catálogo:</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  className="custom-input-sm" 
                  style={{ flex: 1, fontFamily: 'monospace', fontWeight: 700 }}
                  placeholder="ej: don-pepe, burga-chamical, sushi-zen"
                  value={form.slug || ''} 
                  onChange={e => setForm({ ...form, slug: sanitizeSlug(e.target.value) })}
                  required
                />
              </div>
              
              {/* Preview Box & Quick Actions */}
              <div style={{ 
                background: 'var(--bg-main)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: '8px', 
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tu Enlace de Carta Digital:</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-emerald)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                    {catalogDirectUrl}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button 
                    type="button" 
                    className="qty-btn"
                    style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem', gap: '5px', background: copySuccess ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-card)', color: copySuccess ? '#10b981' : 'var(--text-primary)' }}
                    onClick={() => {
                      if (navigator?.clipboard) {
                        navigator.clipboard.writeText(catalogDirectUrl);
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2500);
                      }
                    }}
                  >
                    {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copySuccess ? '¡Copiado!' : 'Copiar Link'}</span>
                  </button>

                  <a 
                    href={catalogDirectUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="qty-btn"
                    style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem', gap: '5px', textDecoration: 'none', background: 'var(--bg-card)', color: 'var(--accent-amber)' }}
                  >
                    <ExternalLink size={14} />
                    <span>Ver Catálogo</span>
                  </a>
                </div>
              </div>
            </div>

            {/* SELECTOR DE COLOR PRINCIPAL (POS + CATÁLOGO) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Palette size={15} style={{ color: form.primaryColor }} />
                  <span>Color de Marca del Local (POS & Catálogo):</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="color" 
                    value={form.primaryColor || '#f59e0b'} 
                    onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                    style={{ width: 28, height: 28, padding: 0, border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'transparent' }}
                    title="Elegir color personalizado"
                  />
                  <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {form.primaryColor || '#f59e0b'}
                  </span>
                </div>
              </div>

              {/* Paletas Rápidas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { name: 'Ámbar Clásico', color: '#f59e0b', emoji: '🍔' },
                  { name: 'Rojo Fuego', color: '#ef4444', emoji: '🔥' },
                  { name: 'Verde Fresh', color: '#10b981', emoji: '🥗' },
                  { name: 'Azul Urbano', color: '#3b82f6', emoji: '🍕' },
                  { name: 'Púrpura Neon', color: '#8b5cf6', emoji: '🍸' },
                  { name: 'Naranja Smash', color: '#f97316', emoji: '⚡' },
                  { name: 'Rosa Pastel', color: '#ec4899', emoji: '🍰' },
                  { name: 'Titanio Dark', color: '#475569', emoji: '🖤' },
                ].map(p => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setForm({ ...form, primaryColor: p.color })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: form.primaryColor === p.color ? `2px solid ${p.color}` : '1px solid var(--border-subtle)',
                      background: form.primaryColor === p.color ? `${p.color}22` : 'var(--bg-card)',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      fontWeight: form.primaryColor === p.color ? 800 : 600,
                      color: form.primaryColor === p.color ? p.color : 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.color, flexShrink: 0, boxShadow: form.primaryColor === p.color ? `0 0 6px ${p.color}` : 'none' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SELECTOR DE TEMA VISUAL DE LA CARTA DIGITAL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={15} style={{ color: 'var(--accent-amber)' }} />
                <span>Estilo Visual de la Carta Digital (Público):</span>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                {CATALOG_THEMES.map(t => {
                  const isSelected = (form.catalog_theme || 'retro-burger') === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm({ ...form, catalog_theme: t.id })}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontSize: '1.1rem' }}>{t.icon}</span>
                        {isSelected && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-amber)' }}>ACTIVO</span>}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isSelected ? 'var(--accent-amber)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                        {t.name}
                      </span>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.tokens.primary }} />
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.tokens.accent }} />
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.tokens.bg, border: '1px solid rgba(255,255,255,0.2)' }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LOGO Y PORTADA / BANNER URL */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                  <Image size={13} />
                  <span>URL del Logo (POS y Carta):</span>
                </label>
                <input 
                  type="text" 
                  className="custom-input-sm" 
                  placeholder="https://ejemplo.com/logo.png"
                  value={form.logo_url || ''} 
                  onChange={e => setForm({ ...form, logo_url: e.target.value })}
                />
                {form.logo_url && (
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img 
                      src={form.logo_url} 
                      alt="Logo preview" 
                      style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'contain', background: '#fff', border: '1px solid var(--border-subtle)' }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vista previa logo</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                  <Image size={13} />
                  <span>URL Portada / Banner (Catálogo):</span>
                </label>
                <input 
                  type="text" 
                  className="custom-input-sm" 
                  placeholder="https://ejemplo.com/banner.jpg"
                  value={form.banner_url || ''} 
                  onChange={e => setForm({ ...form, banner_url: e.target.value })}
                />
                {form.banner_url && (
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img 
                      src={form.banner_url} 
                      alt="Banner preview" 
                      style={{ width: 48, height: 24, borderRadius: 4, objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vista previa portada</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DISEÑO & PLANTILLAS DE TICKET TÉRMICO */}
          <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Palette size={18} />
                <span>Diseño & Plantilla del Ticket Térmico</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Personalización 58mm / 80mm
              </span>
            </div>

            {/* Theme Selector Grid */}
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Selecciona la plantilla de diseño para cocina y cliente:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'classic', label: '🏛️ Clásico', title: 'Tradicional 32 col', desc: 'Separadores de guiones y formato POS estándar' },
                  { id: 'modern', label: '✨ Moderno', title: 'Gourmet / Invertido', desc: 'Total en bloque negro invertido y marco doble' },
                  { id: 'minimal', label: '⚡ Minimal Eco', title: 'Ahorro de Papel', desc: 'Ultra-compacto, reduce hasta 40% de papel' },
                  { id: 'street', label: '🍔 Street Food', title: 'Audaz & Modificadores', desc: 'Letras grandes, emojis y mod resaltadas' }
                ].map(th => (
                  <div
                    key={th.id}
                    onClick={() => setForm({ ...form, ticketTheme: th.id })}
                    style={{
                      border: form.ticketTheme === th.id ? '2px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                      background: form.ticketTheme === th.id ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-card)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem 0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: form.ticketTheme === th.id ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
                        {th.label}
                      </span>
                      {form.ticketTheme === th.id && <Check size={14} style={{ color: 'var(--accent-amber)' }} />}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{th.title}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>{th.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Footer Input & Presets */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mensaje de Pie del Ticket:</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    type="button" 
                    className="cat-pill-btn" 
                    style={{ fontSize: '0.7rem', height: '22px', padding: '0 6px' }}
                    onClick={() => setForm({ ...form, ticketCustomFooter: '¡Gracias por su compra!\nComandaFast Gastronomía' })}
                  >
                    + Estándar
                  </button>
                  <button 
                    type="button" 
                    className="cat-pill-btn" 
                    style={{ fontSize: '0.7rem', height: '22px', padding: '0 6px' }}
                    onClick={() => setForm({ ...form, ticketCustomFooter: '🍔 ¡Seguinos en Instagram!\n@tu_comercio_ok' })}
                  >
                    + Instagram
                  </button>
                  <button 
                    type="button" 
                    className="cat-pill-btn" 
                    style={{ fontSize: '0.7rem', height: '22px', padding: '0 6px' }}
                    onClick={() => setForm({ ...form, ticketCustomFooter: '📶 Wi-Fi Clientes: ClaveBurger\n¡Vuelve pronto!' })}
                  >
                    + Wi-Fi
                  </button>
                </div>
              </div>
              <textarea 
                className="form-textarea" 
                rows="2"
                style={{ fontSize: '0.85rem', width: '100%', resize: 'none' }}
                value={form.ticketCustomFooter || ''} 
                onChange={e => setForm({ ...form, ticketCustomFooter: e.target.value })}
                placeholder="Texto de agradecimiento o redes sociales..."
              />
            </div>

            {/* Toggles de Contenido Visible */}
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                Elementos a imprimir en el ticket:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', fontSize: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.ticketShowSlogan !== false} 
                    onChange={e => setForm({ ...form, ticketShowSlogan: e.target.checked })} 
                  />
                  <span>Eslogan</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.ticketShowAddress !== false} 
                    onChange={e => setForm({ ...form, ticketShowAddress: e.target.checked })} 
                  />
                  <span>Dirección</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.ticketShowPhone !== false} 
                    onChange={e => setForm({ ...form, ticketShowPhone: e.target.checked })} 
                  />
                  <span>Teléfono</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.ticketShowAlias !== false} 
                    onChange={e => setForm({ ...form, ticketShowAlias: e.target.checked })} 
                  />
                  <span>Alias MP / CBU</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={form.ticketShowCustomer !== false} 
                    onChange={e => setForm({ ...form, ticketShowCustomer: e.target.checked })} 
                  />
                  <span>Datos de Entrega</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Ancho:</span>
                  <select 
                    className="custom-input-sm" 
                    style={{ padding: '2px 4px', height: '26px', fontSize: '0.75rem', width: 'auto' }}
                    value={form.ticketWidth || '58mm'} 
                    onChange={e => setForm({ ...form, ticketWidth: e.target.value })}
                  >
                    <option value="58mm">58mm (XP-58)</option>
                    <option value="80mm">80mm (Grande)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* HARDWARE XPRINTER XP-58IIH */}
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--accent-amber)', borderRadius: 'var(--radius-md)', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={18} />
                <span>Ticketera Térmica: Xprinter XP-58IIH (58mm)</span>
              </div>
              <span className="brand-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}>
                Calibrada 32 col
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Formato optimizado a 58mm (32 columnas por línea, margen lateral de 4mm y avance de papel para barra de corte manual).
            </div>

            {/* Quick Actions Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '4px' }}>
              <button 
                type="button" 
                className="qty-btn"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', gap: '6px', background: 'var(--bg-card)' }}
                onClick={handleTestPrint}
              >
                <Printer size={15} style={{ color: 'var(--accent-amber)' }} />
                <span>Imprimir Ticket Prueba (58mm)</span>
              </button>

              <button 
                type="button" 
                className="qty-btn"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', gap: '6px', background: 'var(--bg-card)', color: 'var(--accent-emerald)' }}
                onClick={handleTestDrawer}
              >
                <DollarSign size={15} />
                <span>Probar Apertura Cajón RJ11</span>
              </button>

              <button 
                type="button" 
                className="qty-btn"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', gap: '6px', background: 'var(--bg-card)', color: '#60a5fa' }}
                onClick={handleConnectBluetooth}
              >
                <Bluetooth size={15} />
                <span>Conectar por Bluetooth</span>
              </button>

              <button 
                type="button" 
                className="qty-btn"
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', gap: '6px', background: 'var(--bg-card)', color: '#c084fc' }}
                onClick={handleConnectUsb}
              >
                <Usb size={15} />
                <span>Conectar por Cable USB</span>
              </button>
            </div>
          </div>

          {/* NUMERACIÓN DE PEDIDOS */}
          <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hash size={18} />
                <span>Numeración de Órdenes y Comandas</span>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
              <input 
                type="checkbox" 
                checked={form.resetDailyOrderNumber !== false} 
                onChange={e => setForm({ ...form, resetDailyOrderNumber: e.target.checked })} 
              />
              <span>Reiniciar número de orden automáticamente cada día (inicia en #1 a medianoche)</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <button 
                type="button" 
                className="qty-btn"
                style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '6px', background: 'var(--bg-card)', color: 'var(--accent-amber)' }}
                onClick={async () => {
                  if (window.confirm('¿Deseas reiniciar el contador de órdenes a 0 ahora? El próximo pedido será el #1.')) {
                    const nowIso = new Date().toISOString();
                    storageService.resetOrderCounter(0, nowIso);
                    try {
                      if (typeof supabaseSync !== 'undefined' && supabaseSync.pushOrderCounterState) {
                        await supabaseSync.pushOrderCounterState({ counter: 0, lastResetAt: nowIso });
                      }
                    } catch (_) {}
                    alert('Contador de órdenes reiniciado a 0. Próxima orden: #1.');
                  }
                }}
              >
                <RotateCcw size={14} />
                <span>Reiniciar contador a 0 ahora</span>
              </button>
            </div>
          </div>

          {/* CARTA DIGITAL / CATÁLOGO ONLINE & QR */}
          <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <QrCode size={18} />
                <span>Carta Digital & Código QR</span>
              </div>
              {onOpenCatalogQR && (
                <button
                  type="button"
                  className="qty-btn"
                  style={{ width: 'auto', padding: '0.35rem 0.8rem', fontSize: '0.78rem', background: 'var(--accent-amber)', color: '#000', fontWeight: 800 }}
                  onClick={onOpenCatalogQR}
                >
                  Generar QR & Flyer PDF
                </button>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Crea e imprime carteles de pared A4, displays de mesa A5 o stickers para packaging con el código QR de tu menú digital.
            </div>
          </div>

          <button type="submit" className="btn-confirm-order" style={{ marginTop: '0.5rem' }}>
            Guardar Configuración
          </button>
        </form>

        {/* Backup section */}
        <div style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Copia de Seguridad de Datos:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="qty-btn" style={{ width: 'auto', padding: '0.4rem 0.75rem' }} onClick={handleExport}>
              <Download size={14} /> Exportar JSON
            </button>
            <label className="qty-btn" style={{ width: 'auto', padding: '0.4rem 0.75rem', cursor: 'pointer' }}>
              <Upload size={14} /> Importar
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
