import { createI18n, formatDate, formatNumber, formatPercent, resolveLanguage } from '@factory/localization';
import type { i18n } from 'i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

/**
 * Interface strings live in src/i18n/locales/<lng>.json (same key set in every
 * language — enforced by tests). Dates, numbers, currencies and durations use Intl
 * with the interface language. Book titles and book languages are user data and
 * are never translated.
 */
export const INTERFACE_LANGUAGES = ['en', 'fr', 'es'] as const;
export type InterfaceLanguage = (typeof INTERFACE_LANGUAGES)[number];
export const LANGUAGE_NAMES: Record<InterfaceLanguage, string> = { en: 'English', fr: 'Français', es: 'Español' };

export const resources = { en, fr, es } as const;

let instance: i18n | null = null;

export async function initI18n(persisted: string | null, deviceLanguages: (string | null)[]): Promise<i18n> {
  const initial = resolveLanguage(persisted, deviceLanguages, INTERFACE_LANGUAGES, 'en');
  instance = await createI18n({
    resources: { en: { translation: en }, fr: { translation: fr }, es: { translation: es } },
    supported: INTERFACE_LANGUAGES,
    fallback: 'en',
    initial,
    onMissingKey: __DEV__ && process.env.NODE_ENV !== 'test' ? (lng, key) => console.warn(`[i18n] missing "${key}" for ${lng}`) : undefined,
  });
  return instance;
}

export function currentLanguage(): InterfaceLanguage {
  const lng = instance?.language;
  return (INTERFACE_LANGUAGES as readonly string[]).includes(lng ?? '') ? (lng as InterfaceLanguage) : 'en';
}

const parseDay = (day: string) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
};

/** Display name of a book language code in the interface language ("fr" → "French" / "français"). */
export function bookLanguageName(code: string | null | undefined): string | null {
  if (!code) return null;
  try {
    const dn = new Intl.DisplayNames([currentLanguage()], { type: 'language' });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

export const fmt = {
  number: (n: number) => formatNumber(n, currentLanguage(), { maximumFractionDigits: 1 }),
  integer: (n: number) => formatNumber(Math.round(n), currentLanguage()),
  percent: (ratio: number) => formatPercent(ratio, currentLanguage()),
  money: (cents: number, currency: string | null) => {
    try {
      return formatNumber(cents / 100, currentLanguage(), { style: 'currency', currency: currency || 'USD' });
    } catch {
      return `${(cents / 100).toFixed(2)} ${currency ?? ''}`.trim();
    }
  },
  date: (d: Date, options?: Intl.DateTimeFormatOptions) => formatDate(d, currentLanguage(), options),
  day: (day: string) => formatDate(parseDay(day), currentLanguage(), { day: 'numeric', month: 'short', year: 'numeric' }),
  shortDay: (day: string) => formatDate(parseDay(day), currentLanguage(), { day: 'numeric', month: 'short' }),
  longDay: (day: string) => formatDate(parseDay(day), currentLanguage(), { weekday: 'long', day: 'numeric', month: 'long' }),
  month: (month: string) => formatDate(parseDay(`${month}-01`), currentLanguage(), { month: 'long', year: 'numeric' }),
  monthShort: (month: string) => formatDate(parseDay(`${month}-01`), currentLanguage(), { month: 'narrow' }),
  weekdayShort: (jsWeekday: number) => formatDate(new Date(2026, 10, 1 + jsWeekday), currentLanguage(), { weekday: 'short' }), // 2026-11-01 is a Sunday
  weekdayNarrow: (jsWeekday: number) => formatDate(new Date(2026, 10, 1 + jsWeekday), currentLanguage(), { weekday: 'narrow' }),
  time: (iso: string) => formatDate(new Date(iso), currentLanguage(), { hour: 'numeric', minute: '2-digit' }),
  /** Reading time: "1 h 05 min" / "45 min" style through Intl units. */
  duration: (seconds: number) => {
    const total = Math.max(0, Math.round(seconds / 60));
    const h = Math.floor(total / 60);
    const m = total % 60;
    const lng = currentLanguage();
    const unit = (value: number, u: 'hour' | 'minute') => formatNumber(value, lng, { style: 'unit', unit: u, unitDisplay: 'short' });
    if (h === 0) return unit(m, 'minute');
    return m === 0 ? unit(h, 'hour') : `${unit(h, 'hour')} ${unit(m, 'minute')}`;
  },
};
