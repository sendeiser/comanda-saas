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
 * Calculates luminance of a hex color and returns white or black for optimal contrast.
 * @param {string} hexColor - e.g. '#f59e0b' or '#000000'
 * @returns {'#ffffff' | '#000000'}
 */
export function getContrastingTextColor(hexColor) {
  if (!hexColor || typeof hexColor !== 'string') return '#ffffff';
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) return '#ffffff';

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Perceived brightness formula (ITU-R BT.709)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? '#000000' : '#ffffff';
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
 * Injects CSS custom properties into document.documentElement
 * @param {Partial<typeof DEFAULT_THEME>} themeConfig 
 */
export function applyStoreTheme(themeConfig = {}) {
  if (typeof document === 'undefined') return;

  const theme = normalizeTheme(themeConfig);
  const root = document.documentElement;

  root.style.setProperty('--brand-primary', theme.primaryColor);
  root.style.setProperty('--brand-primary-text', theme.primaryColorText);
  root.style.setProperty('--brand-accent', theme.accentColor);
  root.style.setProperty('--brand-bg', theme.bgDark);
  root.style.setProperty('--brand-surface', theme.surfaceDark);
  root.style.setProperty('--brand-font', theme.fontFamily);
}
