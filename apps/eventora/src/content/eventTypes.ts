import type { IconName } from '@factory/design-system';

import type { BudgetCategory, EventTheme, EventTypeId } from '@/domain/types';

/** Bundled event types (seeded into the `event_types` table). Labels live in i18n: `eventTypes.<id>`. */
export interface EventTypeDef {
  id: EventTypeId;
  icon: IconName;
  theme: EventTheme;
  /** Budget categories suggested when no template is used. */
  categories: BudgetCategory[];
  /** Whether the gift module is shown by default. */
  gifts: boolean;
}

export const EVENT_TYPES: readonly EventTypeDef[] = [
  { id: 'wedding', icon: 'heart', theme: 'wedding', gifts: true, categories: ['venue', 'catering', 'decoration', 'photography', 'music', 'flowers', 'clothing', 'invitations', 'transportation'] },
  { id: 'birthday', icon: 'gift', theme: 'birthday', gifts: true, categories: ['venue', 'catering', 'decoration', 'entertainment', 'gifts'] },
  { id: 'engagement', icon: 'diamond', theme: 'wedding', gifts: true, categories: ['venue', 'catering', 'decoration', 'photography', 'flowers'] },
  { id: 'anniversary', icon: 'wine', theme: 'celebration', gifts: true, categories: ['venue', 'catering', 'decoration', 'music'] },
  { id: 'baby_shower', icon: 'balloon', theme: 'family', gifts: true, categories: ['venue', 'catering', 'decoration', 'gifts', 'invitations'] },
  { id: 'graduation', icon: 'school', theme: 'celebration', gifts: true, categories: ['venue', 'catering', 'decoration', 'photography'] },
  { id: 'dinner_party', icon: 'restaurant', theme: 'celebration', gifts: false, categories: ['catering', 'decoration', 'music'] },
  { id: 'family_gathering', icon: 'people', theme: 'family', gifts: false, categories: ['venue', 'catering', 'accommodation', 'transportation'] },
  { id: 'corporate_event', icon: 'briefcase', theme: 'corporate', gifts: false, categories: ['venue', 'catering', 'entertainment', 'transportation', 'other'] },
  { id: 'conference', icon: 'mic', theme: 'corporate', gifts: false, categories: ['venue', 'catering', 'accommodation', 'transportation', 'invitations'] },
  { id: 'workshop', icon: 'construct', theme: 'corporate', gifts: false, categories: ['venue', 'catering', 'other'] },
  { id: 'business_meeting', icon: 'business', theme: 'corporate', gifts: false, categories: ['venue', 'catering'] },
  { id: 'holiday_party', icon: 'snow', theme: 'celebration', gifts: true, categories: ['venue', 'catering', 'decoration', 'music', 'gifts'] },
  { id: 'custom', icon: 'sparkles', theme: 'celebration', gifts: false, categories: ['venue', 'catering', 'other'] },
];

export function eventType(id: string): EventTypeDef {
  return EVENT_TYPES.find((t) => t.id === id) ?? (EVENT_TYPES[EVENT_TYPES.length - 1] as EventTypeDef);
}

/** Visual themes per event family (accent colours used on cards, covers and event spaces). */
export const THEME_COLORS: Record<EventTheme, { primary: string; accent: string; soft: string; ink: string }> = {
  wedding: { primary: '#7A3E6B', accent: '#C9A24B', soft: '#F6ECF2', ink: '#2B1426' },
  birthday: { primary: '#D9485F', accent: '#F2A93B', soft: '#FDEDEF', ink: '#3A1219' },
  corporate: { primary: '#1F4E79', accent: '#2BA6A0', soft: '#E7F0F8', ink: '#0D2238' },
  family: { primary: '#3E7C59', accent: '#E0A458', soft: '#EAF4EE', ink: '#14301F' },
  celebration: { primary: '#5B3FA6', accent: '#E86A92', soft: '#EFEAFB', ink: '#1E1440' },
};
