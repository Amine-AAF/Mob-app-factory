import type { EventTheme, InvitationFont, InvitationLayout } from '@/domain/types';

/**
 * Invitation designs. Rendered both natively (InvitationCard) and as HTML for
 * PDF export (reports/invitationHtml.ts), so everything here must be expressible
 * in both: solid colours, system font families and text ornaments.
 */
export interface InvitationTemplateDef {
  id: string;
  themes: EventTheme[];
  background: string;
  foreground: string;
  accent: string;
  font: InvitationFont;
  layout: InvitationLayout;
  /** Decorative characters drawn above/below the title. */
  ornament: string;
  premium: boolean;
}

export const INVITATION_TEMPLATES: readonly InvitationTemplateDef[] = [
  { id: 'ivory_classic', themes: ['wedding'], background: '#FBF7F0', foreground: '#3B2F2A', accent: '#B8925A', font: 'serif', layout: 'framed', ornament: '❦', premium: false },
  { id: 'blush_romance', themes: ['wedding'], background: '#F8E8EC', foreground: '#5A2A3A', accent: '#C77D8F', font: 'script', layout: 'centered', ornament: '♡', premium: false },
  { id: 'emerald_gold', themes: ['wedding', 'celebration'], background: '#0F3D33', foreground: '#F4EBD9', accent: '#D4AF6A', font: 'serif', layout: 'framed', ornament: '✦', premium: true },
  { id: 'midnight_vow', themes: ['wedding'], background: '#141B2D', foreground: '#EDE6D6', accent: '#C9A24B', font: 'serif', layout: 'centered', ornament: '✧', premium: true },
  { id: 'botanical', themes: ['wedding', 'family'], background: '#F1F5EC', foreground: '#2F4A35', accent: '#7A9E7E', font: 'serif', layout: 'banner', ornament: '❧', premium: true },
  { id: 'confetti_pop', themes: ['birthday'], background: '#FFF6E5', foreground: '#2B2140', accent: '#F25C78', font: 'sans', layout: 'banner', ornament: '✺', premium: false },
  { id: 'neon_night', themes: ['birthday', 'celebration'], background: '#120F24', foreground: '#F7F3FF', accent: '#00E0C6', font: 'condensed', layout: 'minimal', ornament: '★', premium: true },
  { id: 'balloon_sky', themes: ['birthday', 'family'], background: '#E8F4FD', foreground: '#1E3A5F', accent: '#FF8A5B', font: 'sans', layout: 'centered', ornament: '◍', premium: false },
  { id: 'golden_age', themes: ['birthday', 'celebration'], background: '#1C1410', foreground: '#F5E6C8', accent: '#E0B75E', font: 'serif', layout: 'framed', ornament: '✶', premium: true },
  { id: 'sunshine', themes: ['birthday', 'family'], background: '#FFF3C4', foreground: '#5B3A00', accent: '#F29E1F', font: 'sans', layout: 'banner', ornament: '☀', premium: false },
  { id: 'corporate_slate', themes: ['corporate'], background: '#F4F6F9', foreground: '#1C2B3A', accent: '#1F4E79', font: 'sans', layout: 'split', ornament: '—', premium: false },
  { id: 'executive_navy', themes: ['corporate'], background: '#0E1F33', foreground: '#E8EEF5', accent: '#5FB3C8', font: 'condensed', layout: 'split', ornament: '■', premium: true },
  { id: 'summit', themes: ['corporate'], background: '#FFFFFF', foreground: '#14213D', accent: '#FCA311', font: 'sans', layout: 'minimal', ornament: '▲', premium: true },
  { id: 'tech_grid', themes: ['corporate'], background: '#0B1220', foreground: '#D7E3F4', accent: '#4ADE80', font: 'mono', layout: 'minimal', ornament: '◆', premium: true },
  { id: 'family_table', themes: ['family'], background: '#FAF3EB', foreground: '#4A3426', accent: '#C96F3B', font: 'serif', layout: 'centered', ornament: '✿', premium: false },
  { id: 'soft_lullaby', themes: ['family'], background: '#EEF3FB', foreground: '#3A4A6B', accent: '#9BB4E0', font: 'script', layout: 'centered', ornament: '☾', premium: false },
  { id: 'mint_baby', themes: ['family'], background: '#E9F7F1', foreground: '#215C4A', accent: '#F2B5A0', font: 'sans', layout: 'banner', ornament: '✿', premium: true },
  { id: 'harvest', themes: ['family', 'celebration'], background: '#F6EBDD', foreground: '#5A3A1E', accent: '#B5651D', font: 'serif', layout: 'framed', ornament: '❀', premium: true },
  { id: 'champagne', themes: ['celebration', 'wedding'], background: '#F7F0E3', foreground: '#3D3326', accent: '#BFA06A', font: 'serif', layout: 'centered', ornament: '✧', premium: false },
  { id: 'winter_glow', themes: ['celebration'], background: '#EAF1F8', foreground: '#1F3550', accent: '#C0392B', font: 'serif', layout: 'framed', ornament: '❄', premium: true },
  { id: 'fiesta', themes: ['celebration', 'birthday'], background: '#FFF0F3', foreground: '#3B1029', accent: '#E8436C', font: 'condensed', layout: 'banner', ornament: '✺', premium: true },
  { id: 'graduate', themes: ['celebration'], background: '#101A2E', foreground: '#F2F4F8', accent: '#F0C24B', font: 'serif', layout: 'split', ornament: '✦', premium: true },
  { id: 'minimal_white', themes: ['celebration', 'corporate', 'wedding'], background: '#FFFFFF', foreground: '#111111', accent: '#111111', font: 'sans', layout: 'minimal', ornament: '·', premium: false },
  { id: 'garden_party', themes: ['celebration', 'family'], background: '#F3F8EE', foreground: '#34502B', accent: '#E58FA4', font: 'script', layout: 'framed', ornament: '❀', premium: true },
];

export function findInvitationTemplate(id: string): InvitationTemplateDef {
  return INVITATION_TEMPLATES.find((t) => t.id === id) ?? (INVITATION_TEMPLATES[0] as InvitationTemplateDef);
}

/** Android system font families (no font download, works offline). */
export const FONT_FAMILIES: Record<InvitationFont, { native: string; css: string }> = {
  serif: { native: 'serif', css: "Georgia, 'Noto Serif', serif" },
  sans: { native: 'sans-serif', css: "Roboto, 'Helvetica Neue', Arial, sans-serif" },
  script: { native: 'cursive', css: "'Dancing Script', 'Brush Script MT', cursive" },
  condensed: { native: 'sans-serif-condensed', css: "'Roboto Condensed', 'Arial Narrow', sans-serif" },
  mono: { native: 'monospace', css: "'Roboto Mono', Menlo, monospace" },
};

export const INVITATION_PALETTE = ['#FBF7F0', '#F8E8EC', '#0F3D33', '#141B2D', '#FFF6E5', '#E8F4FD', '#F4F6F9', '#0E1F33', '#FAF3EB', '#EEF3FB', '#FFFFFF', '#111111', '#B8925A', '#C77D8F', '#D4AF6A', '#F25C78', '#00E0C6', '#1F4E79', '#C96F3B', '#7A9E7E'] as const;
