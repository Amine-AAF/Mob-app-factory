import { createI18n, formatDate, formatNumber, resolveLanguage } from '@factory/localization';
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

/** Region-aware formatting: the device locale (e.g. en-GB vs en-US) drives date order. */
let regionLocale: string | null = null;
export function setRegionLocale(tag: string | null): void {
  regionLocale = tag;
}

function locale(): string {
  const lng = currentLanguage();
  // Use the device's regional variant when it matches the UI language (en-GB → 15/05/2026).
  if (regionLocale && regionLocale.toLowerCase().startsWith(lng)) return regionLocale;
  return lng;
}

export const fmt = {
  number: (n: number, options?: Intl.NumberFormatOptions) => formatNumber(n, locale(), options),
  date: (d: Date, options?: Intl.DateTimeFormatOptions) => formatDate(d, locale(), options),
  day: (key: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) => formatDate(fromDayKey(key), locale(), options),
  shortDay: (key: string) => formatDate(fromDayKey(key), locale(), { day: 'numeric', month: 'short' }),
  weekday: (key: string) => formatDate(fromDayKey(key), locale(), { weekday: 'short' }),
  narrowWeekday: (key: string) => formatDate(fromDayKey(key), locale(), { weekday: 'narrow' }),
  month: (year: number, monthIndex: number) => formatDate(new Date(year, monthIndex, 1), locale(), { month: 'long', year: 'numeric' }),
  monthShort: (ym: string) => {
    const [y, m] = ym.split('-').map(Number) as [number, number];
    return formatDate(new Date(y, m - 1, 1), locale(), { month: 'short' });
  },
  /** Price without a currency symbol guess: estimated prices are user-entered numbers. */
  price: (n: number) => formatNumber(n, locale(), { minimumFractionDigits: 0, maximumFractionDigits: 2 }),
  percent: (r: number) => formatNumber(r, locale(), { style: 'percent', maximumFractionDigits: 0 }),
};
