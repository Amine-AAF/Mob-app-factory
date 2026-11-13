import { Platform } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export interface BrandPalette {
  primary: string;
  accent: string;
}

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  overlay: string;
}

export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: (n: number) => number;
  radius: { sm: number; md: number; lg: number; xl: number; pill: number };
  fonts: { regular: string | undefined; mono: string };
  /** Cap for system font scaling so layouts stay usable at very large sizes. */
  maxFontSizeMultiplier: number;
}

/** Mixes a hex color with another one; t in [0,1]. */
export function mix(hexA: string, hexB: string, t: number): string {
  const parse = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = parse(hexA);
  const b = parse(hexB);
  const out = a.map((v, i) => Math.round(v + ((b[i] ?? 0) - v) * t));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** WCAG relative luminance contrast ratio between two hex colors. */
export function contrastRatio(hexA: string, hexB: string): number {
  const lum = (h: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(h.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    }) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [l1, l2] = [lum(hexA), lum(hexB)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

export function createTheme(brand: BrandPalette, scheme: ColorScheme): Theme {
  const dark = scheme === 'dark';
  const colors: ThemeColors = dark
    ? {
        background: '#0A0D18',
        surface: '#121726',
        surfaceAlt: '#1A2033',
        border: '#262D44',
        text: '#EEF1FA',
        textMuted: '#A3ABC2',
        textSubtle: '#9AA1B7',
        // Lightened so it works both as text on dark surfaces and as a fill under dark text.
        primary: mix(brand.primary, '#FFFFFF', 0.35),
        primarySoft: mix(brand.primary, '#0A0D18', 0.72),
        onPrimary: '#0A0D18',
        accent: brand.accent,
        accentSoft: mix(brand.accent, '#0A0D18', 0.8),
        success: '#34D399',
        successSoft: '#0F2F27',
        warning: '#FBBF24',
        warningSoft: '#33290F',
        danger: '#F87171',
        dangerSoft: '#3A1719',
        overlay: 'rgba(0,0,0,0.6)',
      }
    : {
        background: '#F6F7FB',
        surface: '#FFFFFF',
        surfaceAlt: '#EEF0F7',
        border: '#E0E3EE',
        text: '#0E1222',
        textMuted: '#4E566E',
        textSubtle: '#5F6780',
        primary: brand.primary,
        primarySoft: mix(brand.primary, '#FFFFFF', 0.88),
        onPrimary: '#FFFFFF',
        accent: mix(brand.accent, '#000000', 0.38),
        accentSoft: mix(brand.accent, '#FFFFFF', 0.85),
        success: '#047857',
        successSoft: '#DDF5EC',
        warning: '#92400E',
        warningSoft: '#FDF0D5',
        danger: '#B91C1C',
        dangerSoft: '#FCE4E4',
        overlay: 'rgba(14,18,34,0.45)',
      };

  return {
    scheme,
    colors,
    spacing: (n) => n * 4,
    radius: { sm: 8, md: 12, lg: 18, xl: 26, pill: 999 },
    fonts: {
      regular: undefined, // platform default (Roboto on Android) for best readability
      mono: Platform.select({ android: 'monospace', ios: 'Menlo', default: 'monospace' }) ?? 'monospace',
    },
    maxFontSizeMultiplier: 1.6,
  };
}
