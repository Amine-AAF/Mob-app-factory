import { createI18n, formatDate, formatNumber, formatPercent, resolveLanguage } from '@factory/localization';
import { fromDayKey } from '@factory/app-core';
import type { i18n } from 'i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

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

/** Regional formats (dates, times, numbers) follow the interface language through Intl. */
export const fmt = {
  number: (n: number) => formatNumber(n, currentLanguage()),
  percent: (ratio: number) => formatPercent(ratio, currentLanguage()),
  date: (d: Date, options?: Intl.DateTimeFormatOptions) => formatDate(d, currentLanguage(), options),
  day: (key: string, options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) => formatDate(fromDayKey(key), currentLanguage(), options),
  dayLong: (key: string) => formatDate(fromDayKey(key), currentLanguage(), { weekday: 'long', day: 'numeric', month: 'long' }),
  monthYear: (key: string) => formatDate(fromDayKey(key), currentLanguage(), { month: 'long', year: 'numeric' }),
  weekdayNarrow: (key: string) => formatDate(fromDayKey(key), currentLanguage(), { weekday: 'narrow' }),
  weekdayShort: (key: string) => formatDate(fromDayKey(key), currentLanguage(), { weekday: 'short' }),
  time: (minuteOfDay: number) => {
    const d = new Date(2026, 0, 1, Math.floor(minuteOfDay / 60), minuteOfDay % 60);
    return formatDate(d, currentLanguage(), { hour: 'numeric', minute: '2-digit' });
  },
  /** "1 h 25 min" style durations, localised via Intl units when available. */
  duration: (minutes: number) => {
    const lng = currentLanguage();
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    const unit = (value: number, u: 'hour' | 'minute') => formatNumber(value, lng, { style: 'unit', unit: u, unitDisplay: 'narrow' });
    if (h === 0) return unit(m, 'minute');
    return m === 0 ? unit(h, 'hour') : `${unit(h, 'hour')} ${unit(m, 'minute')}`;
  },
  dateTime: (iso: string) => formatDate(new Date(iso), currentLanguage(), { dateStyle: 'medium', timeStyle: 'short' }),
};
