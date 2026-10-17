// src/data/catalogThemes.js
// Catálogo exhaustivo de temas visuales para la carta digital ComandaFast

export const CATALOG_THEMES = [
  {
    id: 'retro-burger',
    name: 'Retro American Diner',
    subtitle: 'Damero rojo/blanco, estética Smash Burger artesanal',
    icon: '🍔',
    badge: 'Popular',
    isLight: false,
    tokens: {
      bg: '#09090b',
      surface: '#141416',
      surface2: '#1c1c1f',
      surface3: '#27272a',
      border: 'rgba(255, 255, 255, 0.08)',
      borderStrong: '#27272a',
      primary: '#dc2626',
      primaryHover: '#ef4444',
      primaryGlow: 'rgba(220, 38, 38, 0.35)',
      accent: '#22c55e',
      text: '#ffffff',
      textMuted: '#8e8e93',
      textSecondary: '#d1d5db',
      bannerBg: 'linear-gradient(45deg, #b91c1c 25%, transparent 25%), linear-gradient(-45deg, #b91c1c 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #b91c1c 75%), linear-gradient(-45deg, transparent 75%, #b91c1c 75%)',
      bannerSize: '34px 34px',
      bannerColor: '#ffffff',
      bannerTitleColor: '#b91c1c',
      bannerTitleBg: '#ffffff',
      chipBtnBg: '#ef4444',
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }
  },
  {
    id: 'atelier-gastronomy',
    name: 'Atelier Gastronomy OS',
    subtitle: 'Alabastro cálido, tarjetas blancas hairline y acento terracota',
    icon: '✨',
    badge: 'Oficial Stitch',
    isLight: true,
    tokens: {
      bg: '#f9f9f8',
      surface: '#ffffff',
      surface2: '#f3f4f3',
      surface3: '#eeeeed',
      border: '#e6e6e3',
      borderStrong: '#d0d0cb',
      primary: '#a43716',
      primaryHover: '#c54f2c',
      primaryGlow: 'rgba(164, 55, 22, 0.25)',
      accent: '#10b981',
      text: '#1a1c1c',
      textMuted: '#5b5e67',
      textSecondary: '#8c909a',
      bannerBg: 'linear-gradient(135deg, #a43716 0%, #c54f2c 50%, #ffdbd1 100%)',
      bannerSize: 'cover',
      bannerColor: '#f9f9f8',
      bannerTitleColor: '#ffffff',
      bannerTitleBg: '#a43716',
      chipBtnBg: '#a43716',
      fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }
  },
  {
    id: 'neon-cyber',
    name: 'Cyber Midnight Glow',
    subtitle: 'Obsidiana profunda con destellos ámbar y neón eléctrico',
    icon: '⚡',
    badge: 'Nightlife',
    isLight: false,
    tokens: {
      bg: '#060709',
      surface: '#0d1117',
      surface2: '#161b22',
      surface3: '#21262d',
      border: 'rgba(245, 158, 11, 0.18)',
      borderStrong: 'rgba(245, 158, 11, 0.35)',
      primary: '#f59e0b',
      primaryHover: '#fbbf24',
      primaryGlow: 'rgba(245, 158, 11, 0.45)',
      accent: '#06b6d4',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      textSecondary: '#cbd5e1',
      bannerBg: 'radial-gradient(ellipse at top, #2d1a04 0%, #060709 72%), repeating-linear-gradient(0deg, rgba(245, 158, 11, 0.06) 0px, rgba(245, 158, 11, 0.06) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, rgba(245, 158, 11, 0.06) 0px, rgba(245, 158, 11, 0.06) 1px, transparent 1px, transparent 32px)',
      bannerSize: 'auto, 32px 32px, 32px 32px',
      bannerColor: '#060709',
      bannerTitleColor: '#f59e0b',
      bannerTitleBg: 'rgba(13, 17, 23, 0.95)',
      chipBtnBg: '#f59e0b',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }
  },
  {
    id: 'italian-trattoria',
    name: 'Trattoria & Pizzería',
    subtitle: 'Albahaca fresca, pomodoro artesanal y calidez italiana',
    icon: '🍕',
    badge: 'Pizzería',
    isLight: false,
    tokens: {
      bg: '#0d1110',
      surface: '#141a17',
      surface2: '#1c2420',
      surface3: '#26312c',
      border: 'rgba(34, 197, 94, 0.15)',
      borderStrong: 'rgba(34, 197, 94, 0.3)',
      primary: '#e11d48',
      primaryHover: '#f43f5e',
      primaryGlow: 'rgba(225, 29, 72, 0.35)',
      accent: '#16a34a',
      text: '#ffffff',
      textMuted: '#9ca3af',
      textSecondary: '#d1d5db',
      bannerBg: 'linear-gradient(135deg, #15803d 0%, #15803d 33.3%, #fef3c7 33.3%, #fef3c7 66.6%, #b91c1c 66.6%, #b91c1c 100%)',
      bannerSize: 'cover',
      bannerColor: '#141a17',
      bannerTitleColor: '#166534',
      bannerTitleBg: '#ffffff',
      chipBtnBg: '#e11d48',
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif"
    }
  },
  {
    id: 'bistro-gourmet',
    name: 'Bistro & Fine Gourmet',
    subtitle: 'Charcoal minimalista, sobriedad y champaña dorado',
    icon: '🍷',
    badge: 'Gourmet',
    isLight: false,
    tokens: {
      bg: '#101012',
      surface: '#17171a',
      surface2: '#202024',
      surface3: '#2a2a30',
      border: 'rgba(212, 175, 55, 0.2)',
      borderStrong: 'rgba(212, 175, 55, 0.4)',
      primary: '#d4af37',
      primaryHover: '#e5c158',
      primaryGlow: 'rgba(212, 175, 55, 0.32)',
      accent: '#10b981',
      text: '#fcfcfc',
      textMuted: '#a1a1aa',
      textSecondary: '#e4e4e7',
      bannerBg: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)',
      bannerSize: 'cover',
      bannerColor: '#18181b',
      bannerTitleColor: '#d4af37',
      bannerTitleBg: '#09090b',
      chipBtnBg: '#d4af37',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }
  },
  {
    id: 'warm-cafe',
    name: 'Cafetería, Bakery & Brunch',
    subtitle: 'Café tostado suave, caramelo y pastelería artesanal',
    icon: '☕',
    badge: 'Bakery',
    isLight: false,
    tokens: {
      bg: '#181412',
      surface: '#221c19',
      surface2: '#2c2521',
      surface3: '#38302a',
      border: 'rgba(217, 119, 6, 0.2)',
      borderStrong: 'rgba(217, 119, 6, 0.38)',
      primary: '#d97706',
      primaryHover: '#f59e0b',
      primaryGlow: 'rgba(217, 119, 6, 0.35)',
      accent: '#10b981',
      text: '#fef3c7',
      textMuted: '#d6d3d1',
      textSecondary: '#f5f5f4',
      bannerBg: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #b45309 100%)',
      bannerSize: 'cover',
      bannerColor: '#221c19',
      bannerTitleColor: '#78350f',
      bannerTitleBg: '#fef3c7',
      chipBtnBg: '#d97706',
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif"
    }
  },
  {
    id: 'street-fiesta',
    name: 'Street Food & Taquería',
    subtitle: 'Energía urbana, magenta audaz y lima fluorescente',
    icon: '🌮',
    badge: 'Urbano',
    isLight: false,
    tokens: {
      bg: '#0b0f14',
      surface: '#121820',
      surface2: '#1b2430',
      surface3: '#263342',
      border: 'rgba(236, 72, 153, 0.22)',
      borderStrong: 'rgba(236, 72, 153, 0.45)',
      primary: '#ec4899',
      primaryHover: '#f472b6',
      primaryGlow: 'rgba(236, 72, 153, 0.42)',
      accent: '#84cc16',
      text: '#ffffff',
      textMuted: '#94a3b8',
      textSecondary: '#e2e8f0',
      bannerBg: 'linear-gradient(135deg, #831843 0%, #ec4899 50%, #84cc16 100%)',
      bannerSize: 'cover',
      bannerColor: '#121820',
      bannerTitleColor: '#ec4899',
      bannerTitleBg: '#ffffff',
      chipBtnBg: '#ec4899',
      fontFamily: "'Impact', 'Arial Black', sans-serif"
    }
  },
  {
    id: 'clean-light',
    name: 'Clean Light (Blanco Fresco)',
    subtitle: 'Blanco luminoso, máxima legibilidad y acento celeste/esmeralda',
    icon: '☀️',
    badge: 'Luz',
    isLight: true,
    tokens: {
      bg: '#f8fafc',
      surface: '#ffffff',
      surface2: '#f1f5f9',
      surface3: '#e2e8f0',
      border: 'rgba(0, 0, 0, 0.08)',
      borderStrong: 'rgba(0, 0, 0, 0.16)',
      primary: '#0284c7',
      primaryHover: '#0369a1',
      primaryGlow: 'rgba(2, 132, 199, 0.25)',
      accent: '#16a34a',
      text: '#0f172a',
      textMuted: '#64748b',
      textSecondary: '#334155',
      bannerBg: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)',
      bannerSize: 'cover',
      bannerColor: '#ffffff',
      bannerTitleColor: '#0369a1',
      bannerTitleBg: '#ffffff',
      chipBtnBg: '#0284c7',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }
  }
];

export function getCatalogTheme(themeId) {
  if (!themeId) return CATALOG_THEMES[0];
  const found = CATALOG_THEMES.find(t => t.id === themeId);
  return found || CATALOG_THEMES[0];
}

export function applyCatalogTheme(themeId, targetElement = null) {
  const theme = getCatalogTheme(themeId);
  const el = targetElement || (typeof document !== 'undefined' ? document.documentElement : null);
  if (!el) return theme;

  const t = theme.tokens;
  el.style.setProperty('--cat-bg', t.bg);
  el.style.setProperty('--cat-surface', t.surface);
  el.style.setProperty('--cat-surface-2', t.surface2);
  el.style.setProperty('--cat-surface-3', t.surface3);
  el.style.setProperty('--cat-border', t.border);
  el.style.setProperty('--cat-border-strong', t.borderStrong);
  el.style.setProperty('--cat-red', t.primary);
  el.style.setProperty('--cat-red-hover', t.primaryHover);
  el.style.setProperty('--cat-primary-glow', t.primaryGlow);
  el.style.setProperty('--cat-green', t.accent);
  el.style.setProperty('--cat-text', t.text);
  el.style.setProperty('--cat-text-muted', t.textMuted);
  el.style.setProperty('--cat-text-secondary', t.textSecondary);
  el.style.setProperty('--cat-banner-bg', t.bannerBg);
  el.style.setProperty('--cat-banner-size', t.bannerSize);
  el.style.setProperty('--cat-banner-color', t.bannerColor);
  el.style.setProperty('--cat-banner-title-color', t.bannerTitleColor);
  el.style.setProperty('--cat-banner-title-bg', t.bannerTitleBg);
  el.style.setProperty('--cat-chip-btn-bg', t.chipBtnBg);
  el.style.setProperty('--cat-font', t.fontFamily);

  return theme;
}
