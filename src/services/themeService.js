// src/services/themeService.js

export const DEFAULT_THEME = {
  primaryColor: '#f59e0b',
  primaryColorText: '#ffffff',
  accentColor: '#10b981',
  bgDark: '#0b0f19',
  surfaceDark: '#111827',
  fontFamily: "'Plus Jakarta Sans', sans-serif"
};

/**
 * Parses a hex color string into { r, g, b } components.
 * @param {string} hexColor
 * @returns {{ r: number, g: number, b: number } | null}
 */
export function hexToRgb(hexColor) {
  if (!hexColor || typeof hexColor !== 'string') return null;
  let hex = hexColor.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) return null;

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  return { r, g, b };
}

/**
 * Calculates luminance of a hex color and returns white or black for optimal contrast.
 * @param {string} hexColor - e.g. '#f59e0b' or '#000000'
 * @returns {'#ffffff' | '#000000'}
 */
export function getContrastingTextColor(hexColor) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#ffffff';

  // Perceived brightness formula (ITU-R BT.709)
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance > 0.55 ? '#000000' : '#ffffff';
}

/**
 * Adjusts brightness of a hex color by a percentage (-100 to 100).
 * @param {string} hexColor 
 * @param {number} percent 
 * @returns {string} hex color
 */
export function adjustBrightness(hexColor, percent) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;

  const factor = (100 + percent) / 100;
  const clamp = (val) => Math.min(255, Math.max(0, Math.round(val)));

  const r = clamp(rgb.r * factor).toString(16).padStart(2, '0');
  const g = clamp(rgb.g * factor).toString(16).padStart(2, '0');
  const b = clamp(rgb.b * factor).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}

/**
 * Returns an rgba string from hex and alpha.
 * @param {string} hexColor 
 * @param {number} alpha 
 * @returns {string} rgba(...)
 */
export function rgbaFromHex(hexColor, alpha = 1) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Normalizes a store theme ensuring all required properties have valid values.
 * @param {Partial<typeof DEFAULT_THEME>} theme 
 * @returns {typeof DEFAULT_THEME}
 */
export function normalizeTheme(theme = {}) {
  const primaryColor = theme.primaryColor || DEFAULT_THEME.primaryColor;
  const primaryColorText = theme.primaryColorText || getContrastingTextColor(primaryColor);
  const accentColor = theme.accentColor || DEFAULT_THEME.accentColor;
  const bgDark = theme.bgDark || DEFAULT_THEME.bgDark;
  const surfaceDark = theme.surfaceDark || DEFAULT_THEME.surfaceDark;
  const fontFamily = theme.fontFamily || DEFAULT_THEME.fontFamily;

  return {
    primaryColor,
    primaryColorText,
    accentColor,
    bgDark,
    surfaceDark,
    fontFamily
  };
}

/**
 * Injects CSS custom properties into document.documentElement so all components
 * (POS, Catalog, Admin, KDS, Modals, Navigation) comprehensively adopt the store brand color.
 * @param {Partial<typeof DEFAULT_THEME>} themeConfig 
 */
export function applyStoreTheme(themeConfig = {}) {
  if (typeof document === 'undefined') return;

  const theme = normalizeTheme(themeConfig);
  const root = document.documentElement;

  const rgb = hexToRgb(theme.primaryColor);
  const isLight = rgb ? ((0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255 > 0.55) : false;
  // Darken bright colors for hover, lighten dark colors for hover
  const hoverColor = adjustBrightness(theme.primaryColor, isLight ? -15 : 15);
  const primaryLight = rgbaFromHex(theme.primaryColor, 0.15);
  const primaryGlow = rgbaFromHex(theme.primaryColor, 0.28);
  const gradient = `linear-gradient(135deg, ${theme.primaryColor} 0%, ${hoverColor} 100%)`;

  // 1. Core Dynamic Brand Tokens
  root.style.setProperty('--brand-primary', theme.primaryColor);
  root.style.setProperty('--brand-hover', hoverColor);
  root.style.setProperty('--brand-primary-light', primaryLight);
  root.style.setProperty('--brand-primary-glow', primaryGlow);
  root.style.setProperty('--brand-primary-text', theme.primaryColorText);
  root.style.setProperty('--brand-accent', theme.accentColor);
  root.style.setProperty('--brand-bg', theme.bgDark);
  root.style.setProperty('--brand-surface', theme.surfaceDark);
  root.style.setProperty('--brand-font', theme.fontFamily);

  // 2. POS Dynamic Accent Amber & Gradients
  root.style.setProperty('--accent-amber', theme.primaryColor);
  root.style.setProperty('--accent-amber-glow', primaryGlow);
  root.style.setProperty('--amber-gradient', gradient);
  root.style.setProperty('--accent-terracotta', theme.primaryColor);
  root.style.setProperty('--border-focus', theme.primaryColor);
  root.style.setProperty('--border-highlight', primaryGlow);
  root.style.setProperty('--tab-accent', theme.primaryColor);

  // 3. Google Stitch & Design Tokens
  root.style.setProperty('--st-primary', theme.primaryColor);
  root.style.setProperty('--st-primary-container', theme.primaryColor);
  root.style.setProperty('--st-primary-light', primaryLight);

  // 4. Digital Menu & Public Catalog Tokens
  root.style.setProperty('--cat-primary', theme.primaryColor);
  root.style.setProperty('--cat-red', theme.primaryColor);
  root.style.setProperty('--cat-red-hover', hoverColor);
  root.style.setProperty('--cat-red-dark', hoverColor);
  root.style.setProperty('--cat-primary-glow', primaryGlow);

  // 5. Secondary Brand Accent (Emerald / Mint / Custom)
  if (theme.accentColor) {
    root.style.setProperty('--accent-emerald', theme.accentColor);
    const accentRgb = hexToRgb(theme.accentColor);
    if (accentRgb) {
      root.style.setProperty('--accent-emerald-glow', `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.25)`);
      root.style.setProperty('--border-emerald-highlight', `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.3)`);
    }
  }
}

