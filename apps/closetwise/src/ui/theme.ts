import { mix } from '@factory/design-system';
import { Platform } from 'react-native';

/**
 * ClosetWise visual identity: editorial, warm neutrals (paper, linen, espresso), a serif
 * display face for titles and generous whitespace so photos stay the hero.
 *
 * App-local theme: the shared `createTheme` has fixed cool-grey neutrals, which don't fit a
 * fashion product. Its contrast helpers are reused (see the contrast test). Candidate for a
 * future additive "neutrals" option in @factory/design-system (documented in the tracking file).
 */
export type ColorScheme = 'light' | 'dark';
export type ThemePreference = 'system' | 'light' | 'dark';

export const PALETTES = {
  atelier: { primary: '#3B2F2A', accent: '#C29B6C', premium: false },
  sage: { primary: '#3E4A3D', accent: '#9DB08F', premium: true },
  noir: { primary: '#161616', accent: '#B9B2A6', premium: true },
  blush: { primary: '#5A3440', accent: '#D9A3AE', premium: true },
  riviera: { primary: '#1F3A5A', accent: '#C9A86A', premium: true },
} as const;
export type PaletteName = keyof typeof PALETTES;
export const PALETTE_NAMES = Object.keys(PALETTES) as PaletteName[];

export interface ClosetColors {
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
  onAccent: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  overlay: string;
  photoBackdrop: string;
}

export interface ClosetTheme {
  scheme: ColorScheme;
  palette: PaletteName;
  colors: ClosetColors;
  spacing: (n: number) => number;
  radius: { sm: number; md: number; lg: number; xl: number; pill: number };
  fonts: { display: string | undefined; body: string | undefined };
  maxFontSizeMultiplier: number;
}

export function createClosetTheme(scheme: ColorScheme, palette: PaletteName = 'atelier'): ClosetTheme {
  const p = PALETTES[palette] ?? PALETTES.atelier;
  const dark = scheme === 'dark';
  const colors: ClosetColors = dark
    ? {
        background: '#121010',
        surface: '#1B1817',
        surfaceAlt: '#25211F',
        border: '#36302C',
        text: '#F3EEE8',
        textMuted: '#BDB3A8',
        textSubtle: '#A79C90',
        primary: mix(p.accent, '#FFFFFF', 0.25),
        primarySoft: mix(p.accent, '#121010', 0.78),
        onPrimary: '#121010',
        accent: mix(p.accent, '#FFFFFF', 0.15),
        accentSoft: mix(p.accent, '#121010', 0.82),
        onAccent: '#121010',
        success: '#7BC9A0',
        successSoft: '#16291F',
        warning: '#E7C06B',
        warningSoft: '#30260F',
        danger: '#F08A80',
        dangerSoft: '#3A1916',
        overlay: 'rgba(0,0,0,0.6)',
        photoBackdrop: '#2A2522',
      }
    : {
        background: '#F7F3EE',
        surface: '#FFFFFF',
        surfaceAlt: '#EFE9E1',
        border: '#E3DBD0',
        text: '#1D1916',
        textMuted: '#5C534B',
        textSubtle: '#6E655C',
        primary: p.primary,
        primarySoft: mix(p.primary, '#FFFFFF', 0.88),
        onPrimary: '#FFFFFF',
        accent: mix(p.accent, '#000000', 0.42),
        accentSoft: mix(p.accent, '#FFFFFF', 0.78),
        onAccent: '#1D1916',
        success: '#2F6B4A',
        successSoft: '#E1EFE6',
        warning: '#8A5A12',
        warningSoft: '#F6EAD3',
        danger: '#A8322A',
        dangerSoft: '#F7E1DE',
        overlay: 'rgba(29,25,22,0.45)',
        photoBackdrop: '#EDE6DD',
      };
  return {
    scheme,
    palette,
    colors,
    spacing: (n) => n * 4,
    radius: { sm: 6, md: 10, lg: 16, xl: 24, pill: 999 },
    fonts: {
      // Android ships Noto Serif as "serif": editorial titles with no font download.
      display: Platform.select({ android: 'serif', ios: 'Georgia', default: undefined }),
      body: undefined,
    },
    maxFontSizeMultiplier: 1.5,
  };
}
