import { createI18n, formatDate, formatNumber, formatPercent, resolveLanguage } from '@factory/localization';
import type { i18n } from 'i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

/**
 * Interface strings live in src/i18n/locales/<lng>.json (same key set in every
 * language — enforced by tests). Dates and numbers use Intl with the current
 * language, so "Monday 13 November" / "lundi 13 novembre" follow the locale.
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

export const fmt = {
  number: (n: number) => formatNumber(n, currentLanguage(), { maximumFractionDigits: 2 }),
  percent: (ratio: number) => formatPercent(ratio, currentLanguage()),
  date: (d: Date, options?: Intl.DateTimeFormatOptions) => formatDate(d, currentLanguage(), options),
  longDay: (d: Date) => formatDate(d, currentLanguage(), { weekday: 'long', day: 'numeric', month: 'long' }),
  shortDay: (d: Date) => formatDate(d, currentLanguage(), { day: 'numeric', month: 'short' }),
  weekdayNarrow: (d: Date) => formatDate(d, currentLanguage(), { weekday: 'narrow' }),
  weekdayShort: (d: Date) => formatDate(d, currentLanguage(), { weekday: 'short' }),
  month: (d: Date) => formatDate(d, currentLanguage(), { month: 'long', year: 'numeric' }),
};
